module.exports.displayReportCommand = function(Discord, message) {
  message.delete(3000);
  let display = new Discord.RichEmbed()
  .setColor('DARK_AQUA')
  .setTitle("WELCOME")
  .setDescription(`In order to send a report, please use the command \"$fb\" to begin!\nBefore reacting to any of the following messages, please wait until all reactions have appeared.\nIn the case that you react early, just react again!`);
  message.channel.send(display);
}

module.exports.addnewRole = async function (bot, event,config) {
  if(!(event.t === "MESSAGE_REACTION_ADD")) {
    return;
  }

  if(!(event.d.emoji.name === '✅')) {
    return;
  }

  console.log("correct reaction occured");

  let guild = bot.guilds.get(event.d.guild_id);
  if(!(guild.id === config.comDiscord._guild_ID)) {
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

module.exports.reportOptions = function(Discord,bot,message,config) {

  message.delete();

  let emojis = ['1⃣','2⃣','3⃣','✅', '❎','❌'];

  let mType = ``, mAnon = false;

  let em = new Discord.RichEmbed()
  .setColor('DARK_AQUA')
  .setDescription(`You\'ve decided to send the staff team a message! What type of message will this be?`)
  .addField('Options:', `${emojis[0]}: Feedback\n${emojis[1]}: Report\n${emojis[2]}: Suggestion\n${emojis[5]}: Close`);

   message.channel.send(em).then(async em => {

    //reaction options for user
    // await em.react(emojis[0]);
    // await em.react(emojis[1]);
    // await em.react(emojis[2]);
    // await em.react(emojis[3]);
    // await em.react(emojis[4]);
    // await em.react(emojis[5]);

    //await keeps emojis in order
    await em.react(emojis[0]);
    await em.react(emojis[1]);
    await em.react(emojis[2]);
    await em.react(emojis[5]);

    //filter for awaitReactions
    let filter = (reaction,user) => {
      return [emojis[0], emojis[1],emojis[2], emojis[5]].includes(reaction.emoji.name) && user.id === message.author.id;
    };
    let react1 = null;
    try {
      react1 = await em.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] });
    } catch(e) {
      console.log("Something went wrong in awaitReactions", e);
      await em.delete();
      return;
    }

    let special_case = false;
    if(react1.has(emojis[0])) { //Feedback
      special_case = true;
      em.delete();

      let temp = new Discord.RichEmbed()
      .setColor('DARK_AQUA')
      .setDescription(`Is this positive or negative feedback?`)
      .addField('Options:', `${emojis[3]}: Positive\n${emojis[4]}: Negative\n`);

      let failed = false;
      await message.channel.send(temp).then(async temp => {
        await temp.react(emojis[3]);
        await temp.react(emojis[4]);

        let filt = (reaction,user) => {
          return [emojis[3], emojis[4]].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        let rct = null;
        try {
          rct = await temp.awaitReactions(filt, { max: 1, time: 60000, errors: ['time'] });
        } catch(e) {
          console.log("Something went wrong in awaitReactions: Start Menu", e);
          await temp.delete();
          failed = true;
          return;
        }

        if (rct.has(emojis[3])) {
          mType = `Positive Feedback`;
        }
        else if (rct.has(emojis[4])) {
          mType = `Negative Feedback`;
        }

        temp.delete();

      });

      if(failed) {
        await em.delete();
        return;
      }
    }
    else if(react1.has(emojis[1])) { //Report
      mType = `Report`;
    }
    else if(react1.has(emojis[2])) { //Suggestion
      mType = `Suggestion`;
    }
    else if(react1.has(emojis[5])) { //Close
      await em.delete();
      return;
    }

    if(!special_case) {
      em.delete();
    }
     //Anonymous section
    let em1 = new Discord.RichEmbed()
    .setColor('DARK_AQUA')
    .setDescription(`Would you like to be kept anonymous?`)
    .addField('Options:', `${emojis[3]}: Yes\n${emojis[4]}: No\n${emojis[5]}: Close`);

    message.channel.send(em1).then(async em1 => {
      await em1.react(emojis[3]);
      await em1.react(emojis[4]);
      await em1.react(emojis[5]);

      let f2 = (reaction,user) => {
        return [emojis[3], emojis[4], emojis[5]].includes(reaction.emoji.name) && user.id === message.author.id;
      };

      let r2 = null;
      try {
        r2 = await em1.awaitReactions(f2, { max: 1, time: 60000, errors: ['time'] });
      }
      catch(e) {
        console.log("Something went wrong in awaitReactions: Anonymous", e);
        em1.delete();
        return;
      }

      if(r2.has(emojis[3])) {
        mAnon = true;
      }
      else if(r2.has(emojis[4])) {
        mAnon = false;
      }
      else if(r2.has(emojis[5])) {
        await em1.delete();
        return;
      }

      em1.delete();

      //assign role


      //awaitMessage from user
      let f_embed = new Discord.RichEmbed()
      .setColor('DARK_AQUA')
      .setTitle('Ready For Message!')
      .setDescription(`Whenever you are ready, please type your message below! You have **7 minutes** to do so.`);

      let fail = false;
      await message.channel.send(f_embed).then(async f_embed => {
        let f_filter = m => {
          return m.author.id === message.author.id;
        }
        f_message = ``;

        let recieve = ``;
        try {
          recieve = await message.channel.awaitMessages(f_filter, {max: 1, time: 420000});
          f_message = recieve.first().content;
          await recieve.first().delete(200);
          f_embed.delete();
        }
        catch (e){
          console.log("something went wrong in awaitMessages: Final Message");
          f_embed.delete();
          fail = true;
        }
      });

      if(fail) {
        let failMessage = new Discord.RichEmbed()
        .setColor('DARK_AQUA')
        .setDescription(`Message was not recieved.`);
        await message.channel.send(failMessage).then(res => res.delete(3000));
        return;
      }

      //get message
      let cName = `${message.author.username}#${message.author.discriminator} , ${message.author.id}`;
      let ping = message.author;

      //log for emergencies only:
      console.log(cName);

      if(mAnon) {
        cName = `Anonymous`;
        ping = `Unavailable`;
      }


      let finalReport = new Discord.RichEmbed()
      .setColor('RED')
      .setTitle('New Message Received!')
      .addField('Name & ID:', `${cName}`)
      .addField('Ping:', ping)
      .addField('Category', mType)
      .addField('Message', f_message)
      .setTimestamp()
      .setFooter("© GravyBot", bot.user.avatarURL);

      modChannel = bot.channels.get(config.comDiscord.modReport_channel_ID);
      if(!modChannel) {
        return;
      }
      modChannel.send(finalReport);

      let response = new Discord.RichEmbed()
      .setColor('DARK_AQUA')
      .setDescription(`Your message has been sent!`);

      await message.channel.send(response).then(res => res.delete(5000));
    });
  }).catch(e => {
    console.log(`Something went completlely wrong at the start.`);
  });
}
