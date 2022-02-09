export default abstract class Trigger {
    public abstract initializeAndBind(callback: (message: Message)=>void): Promise<void>;
    public abstract destroy(reason: string): void;
}

export interface Message {
    project: "general" | string;
    sender: "api" | string;
    action: string;
    params?: Record<string, any>;
}
