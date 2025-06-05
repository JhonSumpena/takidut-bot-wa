import type { Message } from 'whatsapp-web.js';
import { AnyMessageHandler } from './AnyMessageHandler';
import { OrderMessageHandler } from './OrderMessageHandler';
import HelperStr from '../utils/HelperStr';

export const OrderAddressHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    if (HelperStr.formatMessageToCheck(msg.body) == 'pengiriman') {
      const status_to_update = 'biaya-ongkir';
      if (
        !OrderMessageHandler.setDeliveryMethodToOrder(
          HelperStr.formatMessageToCheck(msg.body),
          status_to_update,
          msg,
        )
      ) {
        console.log(
          'Error saat mengatur metode pengiriman: ',
          HelperStr.formatMessageToCheck(msg.body),
        );
      }

      await chat.sendMessage(
        `Baik! Kami akan mengirimkan pesanan Anda dengan aman sesuai jadwal pengiriman ke rumah Anda.`,
      );

      return msg.reply(`Sekarang kami perlu Anda memilih wilayah dengan *mengetik angka 1 sampai 5*
      \n\n*Wilayah:*
      \n1. Shangrila - biaya: *Rp 5.000*
      \n2. Ipanema - biaya: *Rp 8.000*
      \n3. Pontal do Sul - biaya: *Rp 10.000*
      \n4. Santa Terezinha - biaya: *Rp 12.000*
      \n5. Praia de Leste - biaya: *Rp 15.000*
      \nPilih yang paling *dekat dengan wilayah Anda*
      \n\nAnda juga bisa mengetik *#tanya* untuk informasi lebih lanjut
      `);
    } else if (HelperStr.formatMessageToCheck(msg.body) == 'ambil-sendiri') {
      const status_to_update = 'data-pembayaran';
      if (
        !OrderMessageHandler.setDeliveryMethodToOrder(
          HelperStr.formatMessageToCheck(msg.body),
          status_to_update,
          msg,
        )
      ) {
        console.log(
          'Error saat mengatur metode pengiriman: ',
          HelperStr.formatMessageToCheck(msg.body),
        );
      }

      await chat.sendMessage(
        `Baik! Anda akan diberitahu ketika pesanan Anda sudah siap untuk diambil :).`,
      );

      return msg.reply(`Sekarang kami perlu mengisi beberapa data *pembayaran*. 
      \nBeritahu kami metode pembayaran pilihan Anda: *Kartu*, *Tunai* atau *Pix*?`);
    }

    return AnyMessageHandler.execute(msg);
  },
};