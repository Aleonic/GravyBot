
module.exports.addnewRole = async function (bot, event,config) {
  if(!(event.t === "MESSAGE_REACTION_ADD")) {
    return;
  }

  if(!(event.d.emoji.name === '✅')) {
    return;
  }

  console.log("correct reaction occured");

  let guild = bot.guilds.get(event.d.guild_id);
  if(!(guild.id === config.comDiscord.mainGuild_id)) {
    return;
  }
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
    await member.addRole(role);
  }
  else{
    console.log("already has role");
  }
}

module.exports.dmReport = function(bot,message,config) {
  /*
  Checklist:
  check channel type is DM
  Check is recipient is not the bot
  Check if user is member of the guild
  */

  let guild = bot.guilds.get(config.comDiscord.mainGuild_id);
  if(!guild) {
    return;
  }
  if(!(guild.members.get(message.author.id))) {
    message.channel.send("You are not a member of the VRCC. Report was not sent.");
  }
  else {
    console.log('report sent');
    guild.channels.get(config.comDiscord.reportChannel_id).send({embed: {
        color: 0xFF0000,
        author: {
          name: message.author.tag,
          icon_url: message.author.avatarURL
        },
        title: "**Report message**",
        fields: [
        {
          name: "User Ping",
          value: `${message.author}`
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
