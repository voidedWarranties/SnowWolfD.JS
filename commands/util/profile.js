const Discord = require("discord.js");
const commando = require("discord.js-commando");

const fs = require("fs");

const invert = require("invert-color");

const request = require("request").defaults({encoding: null});

const Canvas = require("canvas-prebuilt");

const path = require("path");

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

    var cf = new Canvas.Font("Open Sans", path.join(__dirname, "../../command_assets/util/profile/OpenSans-Regular.ttf"));

    ctx.addFont(cf);
    ctx.font = "28px Open Sans";

    const template = new Image;
    fs.readFile(__dirname + "/../../command_assets/util/profile/profiletemplate.png", function(err, image) {
      if (err) throw err;
      template.src = image;
    });

    template.onload = () => {
      ctx.fillStyle = member.displayHexColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(template, 0, 0, 700, 300);
    }

    var profilePicture = new Image;
    request.get(user.avatarURL, (error, res, body) => {
      profilePicture.src = res.body
    });

    profilePicture.onload = () => {
      ctx.fillStyle = "black";
      ctx.drawImage(profilePicture, 32, 32, 64, 64);
      // Use `member.displayName` for displaying the display name (obviously)
      ctx.fillText(`${user.username}#${user.discriminator}`, 104, 64);
      // A thing of the past
      // ctx.fillText(`User: ${user.username}`, 32, 128);
      // ctx.fillText(`Discriminator: ${user.discriminator}`, 32, 164);

      // Other stuff of the past
      // ctx.fillText("[placeholder]", 32, 128);
      // ctx.fillText("[placeholder]", 32, 164);
      // ctx.fillText(`ID: ${user.id}`, 32, 200);
      // ctx.fillText(`Created: ${new Date(user.createdTimestamp).getMonth()}/${new Date(user.createdTimestamp).getDate()}/${new Date(user.createdTimestamp).getFullYear()}`, 32, 236);
      // ctx.fillText(`Joined: ${new Date(member.joinedTimestamp).getMonth()}/${new Date(member.joinedTimestamp).getDate()}/${new Date(member.joinedTimestamp).getFullYear()}`, 400, 236);

      ctx.fillStyle = invert(member.displayHexColor, true);
      ctx.fillText(`ID: ${user.id}`, 36, 128);
      ctx.fillText(`Created: ${new Date(user.createdTimestamp).getMonth()}/${new Date(user.createdTimestamp).getDate()}/${new Date(user.createdTimestamp).getFullYear()}`, 36, 164);
      ctx.fillText(`Joined: ${new Date(member.joinedTimestamp).getMonth()}/${new Date(member.joinedTimestamp).getDate()}/${new Date(member.joinedTimestamp).getFullYear()}`, 404, 164);
      msg.channel.send("", {files:[{attachment:canvas.toBuffer(), name:"profile.png"}]});
    }
  }
}
