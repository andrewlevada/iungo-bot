import mailchimp, { AddListMemberBody } from "@mailchimp/mailchimp_marketing";

export default class MailchimpService {
    private static instance: MailchimpService | null = null;

    constructor() {
        mailchimp.setConfig({
            apiKey: process.env.MAILCHIMP_API_KEY,
            server: "us6",
        });
    }

    public addContact(listId: string, info: AddListMemberBody): Promise<void> {
        return mailchimp.lists.addListMember(listId, info);
    }

    public static get(): MailchimpService {
        if (!this.instance) this.instance = new MailchimpService();
        return this.instance;
    }
}
