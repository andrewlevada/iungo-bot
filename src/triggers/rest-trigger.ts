import Trigger, { Message } from "./base";
import express, { Express } from "express";
import cors from "cors";
import { json } from "body-parser";

export class RestTrigger extends Trigger {
    private app: Express;

    constructor() {
        super();
        this.app = express();
    }

    initializeAndBind(callback: (message: Message) => void): Promise<void> {
        this.app.use(cors());
        this.app.use(json());

        this.bindRequests(callback);
        this.app.listen(8082);

        return Promise.resolve();
    }

    private bindRequests(callback: (message: Message) => void) {
        this.app.post("/:project/:action",req => callback(
            { project: req.params.project, sender: "api", action: req.params.action }
        ));
    }

    destroy(reason: string): void {

    }
}
