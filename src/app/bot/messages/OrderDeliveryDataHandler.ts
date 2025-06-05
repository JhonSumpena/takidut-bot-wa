import type { Message } from 'whatsapp-web.js';
import { AnyMessageHandler } from './AnyMessageHandler';
import { OrderMessageHandler } from './OrderMessageHandler';

export const OrderDeliveryDataHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    if (msg.type == 'location') {
      const status_to_update = 'data-pembayaran';

      if (
        !OrderMessageHandler.setAddressLocationToOrder(
          msg.location.latitude,
          msg.location.longitude,
          status_to_update,
          msg,
        )
      ) {
        console.log('Error saat menyimpan lokasi ke cache.');
      }

      await chat.sendMessage(
        'Terima kasih. Data lokasi Anda telah tersimpan dengan aman.',
      );

      return msg.reply(`Sekarang kami perlu mengisi beberapa data *pembayaran*. 
    \nBeritahu kami metode pembayaran pilihan Anda: *Kartu*, *Tunai* atau *Pix*?`);
    }

    return AnyMessageHandler.execute(msg);
  },
};