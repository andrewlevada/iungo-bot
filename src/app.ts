import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import BotTrigger from "./triggers/bot-trigger";
import TimerTrigger from "./triggers/timer-trigger";
import { Message } from "./triggers/base";
import { RestTrigger } from "./triggers/rest-trigger";

if (process.env.NODE_ENV === "production") Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.8,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

const triggers = [new BotTrigger(), new TimerTrigger(), new RestTrigger()];
Promise.all(triggers.map(trigger => trigger.initializeAndBind(processMessage))).then(() => {
    process.once("SIGINT", () => triggers.forEach(t => t.destroy("SIGINT")));
    process.once("SIGTERM", () => triggers.forEach(t => t.destroy("SIGTERM")));
    console.log("STARTED SERVER");
})

function processMessage(message: Message): void {
    console.log(`Trigger: ${message.project} ${message.sender} ${message.action}`);
}
