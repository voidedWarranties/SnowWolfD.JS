const express = require("express");
const session = require("express-session");
const cookie = require("cookie-parser");
const ejs = require("ejs");

const path = require("path");

const mongoose = require("mongoose");
const mongooseSession = require("connect-mongo")(session);

const driver = require("./../database/driver.js");

const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const config = require("./../config.json");

const app = express();

const store = new mongooseSession({
  mongooseConnection: driver.getConnection()
});

app.engine("ejs", ejs.renderFile);
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

app.use(cookie());

app.use(express.static(path.join(__dirname, "public")));

const scopes = ["identify", "email", "guilds"];

module.exports = (bot) => {

  function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { return next; }
    res.redirect("/");
    return true;
  }

  function getAuthUser(user) {
    return {
      username: user.username,
      discriminator: user.discriminator,
      id: user.id,
      avatar: user.avatar ? (`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.jpg`) : "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png",
      guilds: user.guilds
    };
  }

  function getGuildInfo(guild) {
    return {
      name: guild.name,
      id: guild.id,
      icon: guild.icon ? (`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.jpg`) : "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"
    };
  }

  function botInGuild(guild) {
    return bot.guilds.get(guild.id) != null;
  }

  passport.use(new DiscordStrategy({
    clientID: config.client_id,
    clientSecret: config.client_secret,
    callbackURL: `${config.hosting_url}login/callback`,
    scope: scopes
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      return done(null, profile);
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    done(null, id);
  });

  app.use(session({
    secret: "cIGxEWj4PwbnasdurJzS",
    resave: false,
    saveUninitialized: false,
    store
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((error, req, res, next) => {
    res.status(500).send(error);
    console.error(error);
  });

  app.get("/", (req, res) => {
    const uptime = process.uptime();
    res.render("landing.ejs", {
      authUser: req.isAuthenticated() ? getAuthUser(req.user) : null,
      bot,
      getGuildInfo,
      botInGuild,
      inviteLink: `https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=2146958591`
    });
  });

  app.get("/login", passport.authenticate("discord", {
    scope: scopes
  }));

  app.get("/login/callback", passport.authenticate("discord", {
    failureRedirect: "/"
  }), (req, res) => {
    res.redirect("/");
  });

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.listen(config.server_port, config.server_ip, () => {
    console.log("WebPanel Running");
  });
}
