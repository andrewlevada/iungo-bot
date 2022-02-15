import { Context, Telegraf as GenericTelegraf, Telegram } from "telegraf";
import telegrafThrottler from "telegraf-throttler";
import Bottleneck from "bottleneck";

export class CustomContext extends Context {
    public userId!: string;
}

export type Telegraf = GenericTelegraf<CustomContext>;

export default class TelegramBot {
    public telegraf: Telegraf;
    private static instance: TelegramBot;

    get tgf(): Telegraf { return this.telegraf; }
    get tg(): Telegram { return this.telegraf.telegram; }

    constructor() {
        this.telegraf = new GenericTelegraf(process.env.TELEGRAM_API_KEY as string, { contextType: CustomContext });
    }

    public initialize(bindingCallback: (bot: Telegraf)=>void): Promise<void> {
        this.telegraf.use(telegrafThrottler({
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

        bindingCallback(this.telegraf);
        return this.telegraf.launch();
    }

    public sendMessages(userIds: string[], text: string): Promise<void> {
        return Promise.all(userIds.map(userId => this.tg.sendMessage(userId, text))).then();
    }

    public static get(): TelegramBot {
        if (!this.instance) this.instance = new TelegramBot();
        return this.instance;
    }
}
