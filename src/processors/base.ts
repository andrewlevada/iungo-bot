import { Message } from "../triggers/base";

export default abstract class Processor {
    /**
     *
     * @return Resolves promise with true if this middleware has processed request, false if not
     */
    public abstract process(message: Message): Promise<boolean>;
}
