/*=======================================================================================*/
const Discord = require("discord.js");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client())
const config = require("./config.js");
global.config = config;
const fs = require("fs");
const fetch = require("node-fetch");
client.htmll = require('cheerio');

/*=======================================================================================*/



/*=======================================================================================*/
require('events').EventEmitter.prototype._maxListeners = 100;
client.komutlar = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./src/commands", (err, files) => {
    if (err) console.error(err);
    console.log(`(!) ${files.length} comandos se han cargado correctamente en el bot.`);
    files.forEach(f => {
        if (!f.endsWith('.js')) return
        let props = require(`./src/commands/${f}`);
        if (!props.help) return
        client.komutlar.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
            global.commands = files;
        });
    });
});
client.on('message', async message => {
    let p = config.bot.prefix
    let client = message.client;
    if (message.author.bot) return;
    if (!message.content.startsWith(p)) return;
    let command = message.content.split(" ")[0].slice(p.length);
    let params = message.content.split(" ").slice(1);
    let cmd
    if (client.komutlar.has(command)) {
        cmd = client.komutlar.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.komutlar.get(client.aliases.get(command));
    }
    if (cmd) {}
    cmd.run(client, message, params, p);
})
/*=======================================================================================*/


/*=======================================================================================*/
const codesSchema = require("./src/database/models/codes.js");
client.on('ready',async () => {
    console.log("(!) El bot se conectó con éxito a discord como " + client.user.tag + ".");
    let botsSchema = require("./src/database/models/botlist/bots.js");
    const bots = await botsSchema.find();
    client.user.setPresence({ activity: { type: 'WATCHING', name: ''+bots.length+' Bots' }, status: "dnd" });
})
/*=======================================================================================*/



/*=======================================================================================*/
const K4itrun = require("./src/database/models/uptime.js")
    setInterval(() => {
        K4itrun.find({}, function (err, docs) {
            if(err) console.log(err)
            if(!docs) return;
            docs.forEach(docs => {
                fetch(docs.link).catch()
            })
        })
    }, 300000)

client.on('guildMemberRemove', async member => {
    if(member.guild.id !== config.serverID) return
        K4itrun.find({ userID: member.id }, async function (err,docs) {
            await docs.forEach(async a => {
            await K4itrun.findOneAndDelete({ userID: member.id, code: a.code, server: a.server, link: a.link })
            })
        })
    })
/*=======================================================================================*/


/*=======================================================================================*/
const votes = require('./src/database/models/botlist/vote.js')
    client.on('ready', async () => {
        setInterval(async () => {
            let datalar = await votes.find()
            if(datalar.length <= 0) return
            datalar.forEach(async a => {
                let süre = a.ms - (Date.now() - a.Date)
                if(süre > 0) return
                await votes.findOneAndDelete({ bot: a.bot, user: a.user })
            })
        }, 1500000)


        process.on('unhandledRejection', (reason, p) => {
            console.log('\n\n\n\n\n [antiCrash] :: unhandled Rejection:');
            console.log(reason.stack ? String(reason.stack) : String(reason));
            console.log('=== unhandled Rejection ===\n\n\n\n\n');
        });
        process.on("uncaughtException", (err, origin) => {
            console.log('\n\n\n\n\n\n [antiCrash] :: uncaught Exception');
            console.log(err.stack ? err.stack : err)
            console.log('=== uncaught Exception ===\n\n\n\n\n');
        })
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log(' [antiCrash] :: uncaught Exception Monitor');
            console.log(err);
        });
        process.on('exit', (code) => {
            console.log('\n\n\n\n\n [antiCrash] :: exit');
            console.log(code);
            console.log('=== exit ===\n\n\n\n\n');
        });
        process.on('multipleResolves', (type, promise, reason) => {
            console.log('\n\n\n\n\n [antiCrash] :: multiple Resolves');
            console.log(type, promise, reason);
            console.log('=== multiple Resolves ===\n\n\n\n\n');
        });
    
})
/*=======================================================================================*/


/*=======================================================================================*/
client.on('guildMemberRemove', async member => {
    const botlar = require('./src/database/models/botlist/bots.js')
    let data = await botlar.findOne({ ownerID: member.id })
    if(!data) return
    let find = await botlar.find({ ownerID: member.id })
    await find.forEach(async b => {
        member.guild.members.cache.get(b.botID).kick();
        await botlar.deleteOne({ botID: b.botID })
    })
})
client.on("guildMemberAdd", async (member) => {
  let guild = client.guilds.cache.get(config.serverID);
  if (member.user.bot) {
    try {
      guild.member(member.id).roles.add(roles.bot);
    } catch (error) {
      
    }
  }
});
/*=======================================================================================*/




/*=======================================================================================*/
require("./src/server.js")(client);
require("./src/database/connect.js")(client);
client.login(config.bot.token);
/*=======================================================================================*/