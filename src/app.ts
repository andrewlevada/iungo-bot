import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import BotTrigger from "./triggers/bot-trigger";
import TimerTrigger from "./triggers/timer-trigger";
import Trigger, { Message } from "./triggers/base";
import { RestTrigger } from "./triggers/rest-trigger";
import Processor from "./processors/base";
import * as fs from "fs";
import path from "path";

if (process.env.NODE_ENV === "production") Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.8,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

const triggers: Trigger[] = [new BotTrigger(), new TimerTrigger(), new RestTrigger()];
Promise.all(triggers.map(trigger => trigger.initializeAndBind(processMessage))).then(() => {
    process.once("SIGINT", () => triggers.forEach(t => t.destroy("SIGINT")));
    process.once("SIGTERM", () => triggers.forEach(t => t.destroy("SIGTERM")));
    console.log("STARTED SERVER");
})

export const processors: Processor[] = [];

const processorsFiles = fs.readdirSync(`${path.resolve(__dirname)}/processors`);
processorsFiles.forEach(v => import(`./processors/${v}`));


function processMessage(message: Message): void {
    console.log(`Message: ${message.project} ${message.sender} ${message.action}`);
    if (processors.length === 0) {
        console.log("Processors are not loaded!");
        return;
    }

    const stack = [...processors];
    stack.pop()!.process(message, next);
    function next() {
        const nextProcessor = stack.pop();
        if (!nextProcessor) console.log("Did not find fitting processor for message");
        else nextProcessor.process(message, next);
    }
}
