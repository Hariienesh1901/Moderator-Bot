if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const Discord = require("discord.js");
const axios = require("axios");
const consola = require("consola");
const keepAlive = require("./server")

// Get swear words from api

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_TYPING",
        "GUILD_VOICE_STATES"
    ],
});

axios
    .get(process.env.SWEAR_WORDS_API)
    .then((res) => {
        const swearWords = res.data.map((word) => word.word);
        // Bind the swear words to the client
        client.swearWords = swearWords;
        consola.info(`${swearWords.length} swear words loaded`);
    })
    .catch((err) => {
        consola.error(err);
    });

client.on("ready", () => {
    consola.ready({
        message: `Logged in as ${client.user.tag}!`,
        badge: true,
    });
});

client.on("messageCreate", async (msg) => {
    // Discord User
    DiscordUser = msg.author;

    if (msg.author.bot) return;
    if (msg.channel.type === "dm") return;

    // Check if the user role is Adminisrator
    if (msg.member.permissions.has("ADMINISTRATOR")) {
        DiscordUser.ability = true;
        consola.info(`${DiscordUser.username} is an admin`);
    } else {
        DiscordUser.ability = false;
        consola.info(`${DiscordUser.username} is not an admin`);
    }

    if (msg.content.startsWith("!ping")) {
        msg.channel.send("Pong!");
    }
    if (msg.content.startsWith("!random")) {
        const endingRange = msg.content.split(" ")[1];
        if (typeof endingRange === "undefined") {
            msg.channel.send("Please specify a range.");
        } else if (isNaN(endingRange)) {
            msg.channel.send("Please specify a number.");
        } else {
            const randomNumber = Math.floor(Math.random() * endingRange);
            msg.channel.send(randomNumber.toString());
        }
    }
    if (msg.content.startsWith("!help")) {
        checkAbility(DiscordUser, () => {
            msg.channel.send(
                "!ping - Pong!\n!random [number] - Generates a random number between 0 and the number you specify."
            );
        });
    }

    // See if the message contains a swear word from the list
    const swearWords = client.swearWords.filter((word) =>
        msg.content.toLowerCase().includes(word)
    );
    if (client.swearWords.length > 0 && swearWords.length > 0) {
        msg.delete();
        msg.author.send(`Watch your language!`);

        // Set the user's ability to use commands to false
        const user = await client.users.fetch(msg.author.id);
        user.ability = false;
    }

    // See if the message contains a link
    if (msg.content.includes("http")) {
        msg.react("🔗");
    }

    // See if the message contains a mention
    if (msg.mentions.users.size > 0) {
        msg.react("🏓");
    }

    // See if the message contains a emoji
    if (msg.content.includes("<:") || msg.content.includes(":>")) {
        msg.react("🎉");
    }

    // See if the message pings everyone
    if (msg.content.includes("@everyone")) {
        msg.react("👋");
    }

    // See if the message pings the bot
    if (
        msg.mentions.users.size > 0 &&
        msg.mentions.users.first().id === client.user.id
    ) {
        msg.react("🤖");
    }

    // See if the message contains a number
    if (msg.content.match(/\d+/g)) {
        msg.react("🔢");
    }

    if (msg.content.startsWith("!setability")) {
        checkAbility(DiscordUser, () => {
            const user = msg.mentions.users.first();
            const ability = msg.content.split(" ")[2];
            if (user && ability) {
                const userToSet = client.users.fetch(user.id);
                userToSet.ability = ability === "true";
                msg.channel.send(
                    `${user.username}'s ability has been set to ${ability}`
                );
            } else {
                msg.channel.send("Please specify a user and ability.");
            }
        });
    }


});

// Middleware for checking if the user is able to use commands

const checkAbility = (user, next) => {
    if (user.ability) {
        next();
    } else {
        user.send("You are not allowed to use commands.");
    }
};

keepAlive();

client.login(process.env.DISCORD_TOKEN);

