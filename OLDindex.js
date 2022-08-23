const Discord = require('discord.js')
const config = require('./config.json')
const bot = new Discord.Client();

  bot.on('ready', async () => {
    console.log(`I am ready to go! ${bot.user.username}`);
    try {
      let link = await bot.generateInvite([`MANAGE_ROLES`,`ADD_REACTIONS`,`MANAGE_MESSAGES`,`READ_MESSAGE_HISTORY`]);
      console.log(link);
    } catch(e) {
      console.log(e.stack);
    }
  });

  bot.on('message', async (message) => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") {
      /*
      Checklist:
      check channel type is DM
      Check is recipient is not the bot
      Check if user is member of the guild
      */
      let guild = bot.guilds.get(config.mainGuild_id);
      if(!guild) {
        return;
      }
      if(!(guild.members.get(message.author.id))) {
        message.channel.send("You are not a member of the VRCC. Report was not sent.");
      }
      else {
        let ping = "<@" + message.author.id + ">";
        guild.channels.get(config.reportChannel_id).send({embed: {
            color: 0xFF0000,
            author: {
              name: message.author.tag,
              icon_url: message.author.avatarURL
            },
            title: "**Report message**",
            fields: [
            {
              name: "User Ping",
              value: ping
            },
            {
              name: "Message Content",
              value: message.content
            }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: bot.user.avatarURL,
              text: "© GravyBot"
            }
          }
        });
        message.channel.send("Report has been sent.");
      }
    }
    else if(message.guild.id == config.pdiscord) {


    }
  });

  bot.on('raw', async (event) => {
    if(!(event.t === "MESSAGE_REACTION_ADD")) {
      return;
    }
    if(!(event.d.emoji.name === '✅')) {
      return;
    }
    console.log("correct reaction occured");
    let guild = bot.guilds.get(event.d.guild_id);
    let channel = guild.channels.get(event.d.channel_id);
    if (!(channel.name === "rules" || channel.name === "Rules")) {
      return;
    }
    console.log("correct channel");
    let member = guild.members.get(event.d.user_id);
    let role = guild.roles.find(role => role.name === "Newcomer" || role.name === "newcomer");
    if (!role) {
      return;
    }
    if(!(member.roles.has(role.id))) {
      console.log("does not have role");
      member.addRole(role);
    }
    else{
      console.log("already has role");
    }
  });

  bot.login(config.token);
