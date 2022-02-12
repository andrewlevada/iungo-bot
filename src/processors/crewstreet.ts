import { processors } from "../app";
import Processor from "./base";
import { Message } from "../triggers/base";
import TelegramBot from "../services/telegram-bot";

interface EmailParams { email: string, origin: string }

processors.push(new class extends Processor {
    process(message: Message, next: () => void): void {
        if (message.project !== "crewstreet") next();
        else if (message.action === "email") this.saveEmail(message.params as EmailParams | undefined);
        else next();
    }

    private saveEmail(params: EmailParams | undefined) {
        if (!params || !params.email) {
            console.log("Tried to process crewstreet:email, but params in undefined");
            return;
        }

        // TODO: Mailchimp

        // TODO: Replace hardcode with user lookup in firestore
        TelegramBot.get().tg.sendMessage("548598411", `📨 New Crew Street email (from ${params.origin}) \n${params.email}`).then();
    }
});
