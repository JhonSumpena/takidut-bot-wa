import { AnyMessageHandler } from '../messages/AnyMessageHandler';
import Message from './Message';

class MessageDispatcher {
  private messageHandlers: Map<string, Message<any>> = new Map();

  async register(name: string, command: Message<any>) {
    this.messageHandlers.set(name, command);
  }

  async dispatch(name: string, message: any, client?: any) {
    for (const [key, _] of this.messageHandlers) {
      if (name === key) {
        if (!this.messageHandlers.has(key)) {
          return;
        }

        const message_type = this.messageHandlers.get(key) ?? AnyMessageHandler;
        if (client !== undefined) {
          await message_type.execute(message, client);
        } else {
          await message_type.execute(message);
        }
      }
    }
  }
}

export const messageDispatcher = new MessageDispatcher();
