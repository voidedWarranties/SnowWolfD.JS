const Discord = require("discord.js");
const commando = require("discord.js-commando");

const fs = require("fs");

const request = require("request").defaults({encoding: null});

const Canvas = require("canvas-prebuilt");

module.exports = class ProfileCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "profile",
      group: "util",
      memberName: "profile",
      description: "Provides an overview of the mentioned user.",
      examples: ["djs> profile @voided#6691"],

      args: [
        {
          key: "member",
          label: "member",
          prompt: "Tag a user.",
          type: "member"
        }
      ]
    });
  }

  async run(msg, args) {

    var Image = Canvas.Image
    , canvas = new Canvas(700, 300)
    , ctx = canvas.getContext("2d");

    const member = args.member;
    const user = member.user;

    ctx.font = "28px Impact";

    const template = new Image;
    fs.readFile(__dirname + "/../../command_assets/util/profile/profiletemplate.png", function(err, image) {
      if (err) throw err;
      template.src = image;
    });

    template.onload = () => {
      ctx.drawImage(template, 0, 0, 700, 300);
    }

    var profilePicture = new Image;
    request.get(user.avatarURL, (error, res, body) => {
      profilePicture.src = res.body
    });

    profilePicture.onload = () => {
      ctx.drawImage(profilePicture, 32, 32, 64, 64);
      ctx.fillText(`User: ${user.username}`, 32, 128);
      ctx.fillText(`Discriminator: ${user.discriminator}`, 32, 164);
      ctx.fillText(`ID: ${user.id}`, 32, 200);
      ctx.fillText(`Created: ${new Date(user.createdTimestamp).getMonth()}/${new Date(user.createdTimestamp).getDate()}/${new Date(user.createdTimestamp).getFullYear()}`, 32, 236);
      ctx.fillText(`Joined: ${new Date(member.joinedTimestamp).getMonth()}/${new Date(member.joinedTimestamp).getDate()}/${new Date(member.joinedTimestamp).getFullYear()}`, 400, 236)
      msg.channel.send("", {files:[{attachment:canvas.toBuffer(), name:"profile.png"}]});
    }
  }
}
