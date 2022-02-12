import { Message } from "../triggers/base";

export default abstract class Processor {
    public abstract process(message: Message, next: ()=>void): void;
}
