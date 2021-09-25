const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const auth = require('./auth.json');
const http = require('http');


var dummyData = { data: [
    {
        humidity_percent:50,
        humidity_value: 20000
    },
    {
        humidity_percent:51,
        humidity_value: 20000
    }
]};


var dummyValue = 0;

var stringJSON = JSON.stringify(dummyData)
// console.log(stringJSON);
var convertedJSON = JSON.parse(stringJSON)

var options = {
  host: '192.168.178.41',
  port: 5000,
  path:'/json'
}

client.on('ready', () =>
{
  console.log('Logged in as ${client.user.tag}!');

});

client.login(auth.token);

client.on('message', msg =>
{
  switch (msg.content)
  {
  case "!help":
    msg.reply("**Following Commands are available:** \n \n" +
    "**!humidity -a** returns average humidity \n" +
    "**!humidity -a -p** returns average humidity in percent \n" +
    "**!status** returns a detailed status overview \n" +
    "**!water_level** returns current water level \n" +
    "**!water** starts pump to water plants(not yet implemented)"  )
    break;

  case "!water":
    msg.reply("WIP")
    break;

  case "!water_level":
    http.request(options, (response) => {
      var str = ''
      response.on('data' , (chunk) => {
        str += chunk
      });
      response.on('end', () => {
        humidityObj = JSON.parse(str);
        waterLevel = humidityObj.results.water_level
        msg.reply(String(waterLevel))
      });
    }).end();
    break;
  case "!humidity -a":
    http.request(options, (response) => {
      var str = ''
      response.on('data' , (chunk) => {
        str += chunk
      });
      response.on('end', () => {
        humidityObj = JSON.parse(str);
        value = humidityObj.results.average.value
        msg.reply(value)
      });
    }).end();
    break;
  case "!humidity -a -p":
    http.request(options, (response) => {
      var str = ''
      response.on('data' , (chunk) => {
        str += chunk
      });
      response.on('end', () => {
        humidityObj = JSON.parse(str);
        averagePercent = humidityObj.results.average.percentString
        msg.reply(averagePercent)
      })
    }).end();
    break;
  case "!status":
    http.request(options,(response) => {
      var str = ''
      response.on('data' , (chunk) => {
        str += chunk
      });
      response.on('end', () => {

        discordChannel = client.channels.cache.find(channel => channel.name === "Allgemein");
        humidityObj = JSON.parse(str);
        wsysChannels = humidityObj.results.channel
        waterLevel = humidityObj.results.water_level
        averageValue = humidityObj.results.average.value
        averagePercent = humidityObj.results.average.percentString

        embeddedFields = []

        for (item in wsysChannels)
        {
          {
            embeddedFields.push(
              {
                name: "Sensor " + String(wsysChannels[item].channel),
                value:"value: " + String(wsysChannels[item].value) + "\n" +
                      "Percent: " + String(wsysChannels[item].percentString) + "\n" +
                      "Active? " + String(wsysChannels[item].active),
                inline: true
              }
            );
          }
          if (item == 1)
          {
            embeddedFields.push(
              {
                name: "Average",
                value: "Value: " + averageValue + "\n" +
                       "Percent: " + averagePercent,
                inline: true
              }
            );
          } //endif
        } //endfor

        embeddedFields.push(
          {
            name: "Water Level",
            value: "Value: " + waterLevel,
            inline: true
          }
        );

        const exampleEmbed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(':droplet: WateringApp Status')
          .setURL('https://wsystem.ddns.net')
          .setDescription('Overview over all the WateringSystem Data')
          .setThumbnail('https://i.imgur.com/AfFp7pu.png')
          .addFields(embeddedFields)
          .setTimestamp()
          .setFooter('https://wsystem.ddns.net', 'https://i.imgur.com/AfFp7pu.png');

        discordChannel.send({embeds: [exampleEmbed]});
        // embeddedFields = []

      });
    }).end();
    break;
    // msg.reply()

}
});
