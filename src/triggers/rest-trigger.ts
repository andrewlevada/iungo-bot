import Trigger, { Message } from "./base";
import Application from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import koaBody from "koa-body";

export class RestTrigger extends Trigger {
    private app: Application;
    private router: Router;

    constructor() {
        super();
        this.app = new Application();
        this.router = new Router();
    }

    initializeAndBind(callback: (message: Message) => Promise<void>): Promise<void> {
        this.app.use(cors());
        this.app.use(koaBody());
        this.bindRequests(callback);
        this.app.use(this.router.routes());
        this.app.use(this.router.allowedMethods());
        this.app.listen(8082);

        return Promise.resolve();
    }

    private bindRequests(callback: (message: Message) => Promise<void>) {
        this.router.all("/:project/:action", ctx =>
            callback({ project: ctx.params.project, sender: "api", action: ctx.params.action, params: ctx.request.body })
                .then(() => { ctx.status = 200; })
        );
    }

    destroy(reason: string): void {

    }
}
