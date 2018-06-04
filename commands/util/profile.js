const Discord = require("discord.js");
const commando = require("discord.js-commando");

const fs = require("fs");

const invert = require("invert-color");

const request = require("request").defaults({encoding: null});

const Canvas = require("canvas-prebuilt");
const gif = require("gifencoder");

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
    // GIF Encoder
    var encoder = new gif(700, 300);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(2500);
    encoder.setQuality(1);
    //

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

    request.get(user.displayAvatarURL, (error, res, body) => {
      profilePicture.src = res.body
    });

    profilePicture.onload = () => {
      ctx.fillStyle = "black";
      ctx.drawImage(profilePicture, 32, 32, 64, 64);
      // Use `member.displayName` for displaying the display name (obviously)
      ctx.fillText(`${user.username}#${user.discriminator}`, 104, 64);

      ctx.fillStyle = invert(member.displayHexColor, true);
      ctx.fillText(`ID: ${user.id}`, 36, 128);
      ctx.fillText(`Created: ${new Date(user.createdTimestamp).getMonth() + 1}/${new Date(user.createdTimestamp).getDate()}/${new Date(user.createdTimestamp).getFullYear()}`, 36, 164);
      ctx.fillText(`Joined: ${new Date(member.joinedTimestamp).getMonth() + 1}/${new Date(member.joinedTimestamp).getDate()}/${new Date(member.joinedTimestamp).getFullYear()}`, 404, 164);

      encoder.addFrame(ctx);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillText(`Bot: ${user.bot}`, 32, 32);
      ctx.fillStyle  = member.highestRole.hexColor;
      ctx.fillText(`Highest Role: ${member.highestRole.name}`, 32, 68);
      ctx.fillStyle = "black";
      ctx.fillText(`Color Role: ${member.colorRole.name}`, 32, 104);

      encoder.addFrame(ctx);

      encoder.finish();
      // msg.channel.send("", {files:[{attachment:canvas.toBuffer(), name:"profile.png"}]});
      msg.channel.send("", {files:[{attachment:encoder.out.getData(), name:"profile.gif"}]});
    }
  }
}
