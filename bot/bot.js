require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
    sendStartMessage(ctx);
});

function sendStartMessage(ctx) {
    bot.botInfo["can_read_all_group_messages"] = true;
    bot.botInfo["supports_inline_queries"] = true;
    const startMessage =
        "Holi, Guido Rial es mi creador, hay dos formas de hacerme andar. Podes etiquetarme y te digo como te dicen, o etiquetame al lado de otra persona y te digo como le dicen a esa persona  ";

    bot.telegram.sendMessage(ctx.chat.id, startMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Quiero una frase de prueba",
                        callback_data: "quote",
                    },
                ],
                [
                    {
                        text: "Mi portfolio",
                        url: "https://portfolio-guidorial.vercel.app/",
                    },
                ],
                [
                    {
                        text: "Créditos",
                        callback_data: "credits",
                    },
                ],
            ],
        },
    });
}

bot.command("help", (ctx) => {
    bot.telegram.sendMessage(ctx.chat.id, "Escribí /start");
});

async function fetchQuote() {
    const res = await axios.get("http://localhost:3000/quotes");
    return res.data.quote;
}

bot.hears("test", (ctx) => {
    bot.botInfo["can_read_all_group_messages"] = true;
    bot.botInfo["supports_inline_queries"] = true;
    console.log(bot.botInfo);
});

/**
 * Mostly to use with oneself
 */
bot.hears("Como me dicen?", async (ctx) => {
    const quote = await fetchQuote();
    ctx.reply(`Sabes como te dicen a vos @${ctx.chat.username}? ${quote}`);
    // console.log(ctx.message.text);
});

/**
 * For group chats
 */
bot.mention(async (ctx) => {
    const thisBot = "@ComoTeDicenABot";
    const anotherUser = ctx.message.text
        .replace("@ComoTeDicenABot", "")
        .replace(/\s+/g, "");
    const probabilityOfSetPhrase = Math.floor(Math.random() * 10);
    //console.log(ctx.chat.type);//supergroup
    // console.log(ctx.update.message.from.username); //returns my username

    if (anotherUser === thisBot) {
        ctx.reply("No quieras hacer cagadas salame");
        return
    }
    if (ctx.message.text.length > thisBot.length) {
        //Another person has ben tagged
        if (anotherUser === "@MengOtto" && probabilityOfSetPhrase < 8) {
            ctx.reply(
                `Saben como le dicen a ${anotherUser}? Mono manco, porque pela bananas con el culo`
            );
        } else {
            const quote = await fetchQuote();
            ctx.reply(`Saben como le dicen a ${anotherUser}? ${quote}`);
        }
    } else {
        //Bot has been tagged alone

        const userInSuperGroup = ctx.update.message.from.username;
        if (userInSuperGroup) {
            const quote = await fetchQuote();
            ctx.reply(
                `Sabes como te dicen a vos @${userInSuperGroup}? ${quote}`
            );
        } else {
            const quote = await fetchQuote();
            ctx.reply(
                `Sabes como te dicen a vos @${ctx.chat.username}? ${quote}`
            );
        }
    }
});

bot.action("credits", (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(
        "Creado por Guido Rial, actualmente buscando trabajo ahre aprovechaba el chabón"
    );
});

bot.action("quote", async (ctx) => {
    ctx.answerCbQuery();
    const quote = await fetchQuote();
    ctx.reply(`Sabes como te dicen a vos @${ctx.chat.username}? ${quote}`);
});

bot.launch();