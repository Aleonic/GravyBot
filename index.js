//first line
const Discord = require('discord.js')
const config = require('./config.json')
const bot = new Discord.Client();
const patr = require('./pDiscord.js');
const vrcc = require('./VRCC.js')

bot.on('ready', async () => {
  console.log(`I am ready to go! ${bot.user.username}`);
  try {
    let link = await bot.generateInvite([`MANAGE_ROLES`,`ADD_REACTIONS`,`MANAGE_MESSAGES`,`READ_MESSAGE_HISTORY`]);
    console.log(link);
  } catch(e) {
    console.log("error on invite link");
  }
});

bot.on('message', async (message) => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") {
    vrcc.dmReport(bot,message,config);
  }
  if(message.channel.type === `text`) {
    // if(message.content.startsWith('///') && message.author.id === config.creator_id) { //TODO: REMOVE THIS LATER
    //   message.delete();
    //   let tempMessage = message.content.slice(3);
    //   let tempChannel = bot.channels.get(`431260334980857867`);
    //   tempChannel.send(tempMessage);
    // }
    if(message.content === "post!DES" && message.author.id === config.creator_id) {
      patr.displayReportCommand(Discord,message); // command works with patr or vrcc
    }
    else if(message.channel.id === config.pDiscord.usrReport_channel_ID) {
      if(message.content === "$fb") {
        patr.reportOptions(Discord,bot,message,config);
      }
      else{
        message.delete(2000);
      }
    }
    else if(message.channel.id === config.comDiscord.usrReport_channel_ID) {
      if(message.content === "$fb") {
        vrcc.reportOptions(Discord,bot,message,config);
      }
      else{
        message.delete(2000);
      }
    }
  }
});

bot.on('raw', async (event) => {
  vrcc.addnewRole(bot,event,config);
});

bot.login(config.token);
