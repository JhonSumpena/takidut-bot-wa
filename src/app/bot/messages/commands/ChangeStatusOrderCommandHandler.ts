import { Message } from 'whatsapp-web.js';

export const ChangeStatusOrderCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    /**
     * memperbarui status
     * menerima parameter berupa nomor orang dan status yang akan diperbarui
     * memperbarui status pesanan
     */
    return msg.reply('');
  },
};
