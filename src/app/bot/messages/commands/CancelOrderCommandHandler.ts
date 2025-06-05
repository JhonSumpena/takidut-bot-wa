import { Message } from 'whatsapp-web.js';

export const CancelOrderCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    return msg.reply(
      'Ups! Ini masih dalam tahap pengembangan. Silakan coba lagi nanti. Terima kasih! :).',
    );
  },
};
