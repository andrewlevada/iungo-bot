import { Context, Telegraf as GenericTelegraf } from "telegraf";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import telegrafThrottler from "telegraf-throttler";
import Bottleneck from "bottleneck";
import { CallbackQuery, Message } from "typegram";
import TextMessage = Message.TextMessage;

export class CustomContext extends Context {
  public userId!: string;
}

export type Telegraf = GenericTelegraf<CustomContext>;

if (process.env.NODE_ENV === "production") Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.8,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

startBot().then();

function startBot(): Promise<Telegraf> {
  const bot = new GenericTelegraf(process.env.TELEGRAM_API_KEY as string, { contextType: CustomContext });

  bot.use(telegrafThrottler({
    in: {
      highWater: 1,
      maxConcurrent: 1,
      minTime: 1200,
      strategy: Bottleneck.strategy.OVERFLOW,
    },
    out: {
      minTime: 20,
      reservoir: 100,
      reservoirRefreshAmount: 100,
      reservoirRefreshInterval: 2000,
    },
  }));

  bindBot(bot);
  return bot.launch().then(() => {
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  }).then(() => bot);
}

function bindBot(bot: Telegraf) {
  bot.use((ctx, next) => {
    const userId = ctx.from!.id.toString();
    Sentry.setUser({ id: userId });
    ctx.userId = userId;

    if (ctx.message) console.log(`message from ${userId}: ${(ctx.message as TextMessage).text}`);
    else if (ctx.callbackQuery) console.log(`query from ${userId}: ${(ctx.callbackQuery as CallbackQuery.DataCallbackQuery).data}`);
    else console.log(`use from ${userId}`);

    next().then();
  });

  bot.on("text", ctx => ctx.reply("Don't understand"));
}
