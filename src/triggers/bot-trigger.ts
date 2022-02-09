import Trigger, { Message } from "./base";
import { CallbackQuery, Message as TelegramMessage } from "typegram";
import TelegramBot from "../services/telegram-bot";
import * as Sentry from "@sentry/node";
import TextMessage = TelegramMessage.TextMessage;

export default class BotTrigger extends Trigger {
    initializeAndBind(callback: (message: Message) => void): Promise<void> {
        return TelegramBot.get().initialize(bot => {
            bot.use((ctx, next) => {
                const userId = ctx.from!.id.toString();
                Sentry.setUser({ id: userId });
                ctx.userId = userId;

                if (ctx.message) console.log(`message from ${userId}: ${(ctx.message as TextMessage).text}`);
                else if (ctx.callbackQuery) console.log(`query from ${userId}: ${(ctx.callbackQuery as CallbackQuery.DataCallbackQuery).data}`);
                else console.log(`use from ${userId}`);

                next().then();
            });

            bot.command("/help", ctx => callback({ project: "general", sender: ctx.userId, action: "help"}))

            bot.on("text", ctx => ctx.reply("Don't understand"));
        });
    }

    destroy(reason: string): void {
        TelegramBot.get().telegraf.stop(reason);
    }
}
