import Trigger, { Message } from "./base";
import { CallbackQuery, Message as TelegramMessage } from "typegram";
import TelegramBot from "../services/telegram-bot";
import * as Sentry from "@sentry/node";
import TextMessage = TelegramMessage.TextMessage;

export default class BotTrigger extends Trigger {
    initializeAndBind(callback: (message: Message) => Promise<void>): Promise<void> {
        return TelegramBot.get().initialize(bot => {
            bot.use((ctx, next) => {
                const userId = ctx.from!.id.toString();
                Sentry.setUser({ id: userId });
                ctx.userId = userId;

                if (ctx.message) console.log(`TG message from ${userId}: ${(ctx.message as TextMessage).text}`);
                else if (ctx.callbackQuery) console.log(`TG query from ${userId}: ${(ctx.callbackQuery as CallbackQuery.DataCallbackQuery).data}`);
                else console.log(`TG use from ${userId}`);

                next().then();
            });

            bot.command("/help", ctx => callback({ project: "general", sender: ctx.userId, action: "help" }));
            bot.on("text", (ctx, next) => {
                const text = ctx.message.text.split(" ");
                if (!BotTrigger.isCommandText(text)) next();
                else {
                    const address = text[1].split(":");
                    const msg: Message = { project: address[0], action: address[1], sender: ctx.userId };
                    if (text.length > 2) msg.params = JSON.parse(text[2]);
                    callback(msg).then(() => ctx.reply("Got it"));
                }
            });

            bot.on("text", ctx => ctx.reply("Don't understand"));
        });
    }

    private static isCommandText(text: string[]): boolean {
        if (text.length <= 1) return false;
        if (text[0] !== "/action") return false;
        if (text[1].split(":").length !== 2) return false;
        return true;
    }

    destroy(reason: string): void {
        TelegramBot.get().telegraf.stop(reason);
    }
}
