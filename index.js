const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});
const BannedWords = require('./botconfig/badword.json');
const config = require('./botconfig/config.json');
const usersMap = new Map();
const LIMIT = 4; // limit message/diff
const TIME = 10000; // timeout
const DIFF = 2000; // diff every one message

const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello Im vlt1.dev join our discord for bot codes and more!! https://discord.gg/vitzzplanet youtube https://');
});
app.listen(3000, () => {
  console.log('server started');
}); //uptimer web

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
  if (!message.guild) return;

  const clan = message.guild;
  const clanname = clan.name;
  const clanowner = clan.ownerId;

  const BannedWordsz = new EmbedBuilder()
    .setColor(config.color)
    .setTitle('Badword Detected!')
    .setDescription(`User <@${message.author.id}> got warn for using badword!`);

  const BannedRaid = new EmbedBuilder()
    .setColor(config.color)
    .setTitle('Raid Detected!')
    .setDescription(`User <@${message.author.id}> got banned for raid attempt!`)
    .setImage('https://static.wikia.nocookie.net/maid-dragon/images/f/f7/Kanna_is_mad.png');

  const FalseBan = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(clanname)
    .setDescription(`User <@${message.author.id}>, You got banned from ${clanname}!\r\n\r\nIf you think this was mistake then DM Owner <@${clanowner}>`);

  if (BannedWords.some(word => message.content.toLowerCase().includes(word.toLowerCase()))) {
    message.delete().catch(e => console.error("Couldn't delete message."));
    message.author.send({ embeds: [BannedWordsz] });
  }

  if (message.content.includes("@everyone") || message.content.includes("@here")) {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
    clan.members.ban(message.author.id, { reason: 'Raid attempt!' }).catch(e => console.error("Couldn't ban them."));
    message.author.send({ embeds: [FalseBan] });
    message.channel.send({ embeds: [BannedRaid] });
  }

  if (message.author.bot) return;
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return; // Ignore admins

  if (usersMap.has(message.author.id)) {
    const userData = usersMap.get(message.author.id);
    const { lastMessage, timer } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let msgCount = userData.msgCount;

    if (difference > DIFF) {
      clearTimeout(timer);
      userData.msgCount = 1;
      userData.lastMessage = message;
      userData.timer = setTimeout(() => {
        usersMap.delete(message.author.id);
      }, TIME);
      usersMap.set(message.author.id, userData);
    } else {
      msgCount++;
      if (msgCount === LIMIT) {
        message.author.send({ embeds: [FalseBan] });
        clan.members.ban(message.author.id, { reason: 'Raid attempt!' });
        message.channel.send({ embeds: [BannedRaid] });
      } else {
        userData.msgCount = msgCount;
        usersMap.set(message.author.id, userData);
      }
    }
  } else {
    const timer = setTimeout(() => {
      usersMap.delete(message.author.id);
    }, TIME);
    usersMap.set(message.author.id, {
      msgCount: 1,
      lastMessage: message,
      timer: timer
    });
  }
});

client.login(config.token);
