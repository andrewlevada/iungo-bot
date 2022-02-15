import Trigger, { Message } from "./base";
import { Job, scheduleJob } from "node-schedule";

export default class TimerTrigger extends Trigger {
    private jobs: Job[] = [];

    initializeAndBind(callback: (message: Message) => Promise<void>): Promise<void> {
        this.jobs.push(scheduleJob("7 10 * * *",
            () => callback({ project: "general", sender: "api", action: "time"})));

        return Promise.resolve();
    }

    destroy(reason: string): void {
        for (const job of this.jobs) job.cancel();
    }
}
