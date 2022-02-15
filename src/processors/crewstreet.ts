import { processors } from "../app";
import Processor from "./base";
import { Message } from "../triggers/base";
import TelegramBot from "../services/telegram-bot";
import MailchimpService from "../services/mailchimp-service";

interface EmailParams { email: string, origin: string }

processors.push(new class extends Processor {
    process(message: Message): Promise<boolean> {
        if (message.project !== "crewstreet") return Promise.resolve(false);

        if (message.action === "email") return this.saveEmail(message.params as EmailParams | undefined).then(() => true);

        return Promise.resolve(false);
    }

    private saveEmail(params: EmailParams | undefined): Promise<void> {
        if (!params || !params.email) {
            console.log("Tried to process crewstreet:email, but params is undefined");
            return Promise.resolve();
        }

        // TODO: Replace hardcode with user lookup in firestore
        return MailchimpService.get().addContact("04589a12ce", { email_address: params.email, status: "subscribed", tags: ["experiment"]})
            .catch(() => console.error(`Failed to add contact to mailchimp! (email: ${params.email})`))
            .then(() => TelegramBot.get().sendMessages(["548598411", "593797840"], `📨 New Crew Street email (from ${params.origin}) \n${params.email}`)).then();
    }
});
