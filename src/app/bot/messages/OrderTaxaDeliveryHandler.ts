import type { Message } from 'whatsapp-web.js';
import { AnyMessageHandler } from './AnyMessageHandler';
import { OrderMessageHandler } from './OrderMessageHandler';

export const OrderTaxaDeliveryHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const inputNumber = Number(msg.body);

    if (inputNumber !== 0 && inputNumber <= 5) {
      const status_to_update = 'data-pengiriman'; // entrega-dados -> data-pengiriman

      if (
        !OrderMessageHandler.setBairroToOrder(
          status_to_update,
          inputNumber,
          msg,
        )
      ) {
        console.log('❌ Error saat menyimpan lokasi ke cache.');
      }

      await chat.sendMessage(
        'Terima kasih. Wilayah Anda telah terdaftar dan biaya ongkir sudah diterapkan ;).',
      );

      return msg.reply(`Kami perlu Anda mengirimkan *lokasi* Anda
      \nUntuk itu ikuti beberapa langkah sederhana:
      \n1. Pastikan layanan lokasi *aktif* di ponsel Anda
      \n2. Klik ikon 🔗 di atas keyboard
      \n3. Klik lokasi
      \n4. Dan terakhir klik *Lokasi saat ini* (terletak di bawah judul *lokasi terdekat*)
      `);
    }

    // Jika input tidak valid, gunakan handler default
    return AnyMessageHandler.execute(msg);
  },
};