const Discord = require("discord.js");
const Commando = require("discord.js-commando");
const path = require("path");

const config = require("./config.json");

const client = new Commando.Client({
  owner: config.owner_id,
  commandPrefix: config.prefix,
  unknownCommandResponse: false
});

client.registry
.registerDefaults()
.unregisterCommand(client.registry.findCommands("help", true)[0]);
client.registry.registerCommandsIn(path.join(__dirname, "commands"));

client.login(config.bot_token);
