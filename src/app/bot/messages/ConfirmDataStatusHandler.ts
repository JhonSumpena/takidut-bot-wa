import type { Message } from 'whatsapp-web.js';
import { AnyMessageHandler } from './AnyMessageHandler';
import { OrderMessageHandler } from './OrderMessageHandler';
import HelperStr from '../utils/HelperStr';

export const ConfirmDataStatusHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const userResponse = HelperStr.formatMessageToCheck(msg.body);

    if (userResponse === 'ya' || userResponse === 'iya' || userResponse === 'benar' || userResponse === 'betul') {
      const status_to_update = 'data-alamat'; // endereco-dados -> data-alamat
      if (!OrderMessageHandler.updateStatusOder(msg, status_to_update)) {
        console.log('❌ Error saat memperbarui status:', status_to_update);
      }

      await chat.sendMessage(
        `Sekarang kami perlu Anda memberitahu beberapa data pengiriman dan pembayaran. Akan cepat kok.`,
      );

      return msg.reply(
        `Tolong beritahu kami metode pengiriman pilihan Anda: *Pengiriman* atau *Ambil Sendiri?*`,
      );
    } else if (userResponse === 'tidak' || userResponse === 'nggak' || userResponse === 'bukan') {
      const status_to_update = 'created';
      if (!OrderMessageHandler.updateStatusOder(msg, status_to_update)) {
        console.log('❌ Error saat memperbarui status:', status_to_update);
      }

      return msg.reply(
        `Oke, tidak apa-apa. Perbarui item di keranjang Anda dan kami akan mengurus sisanya :).`,
      );
    }

    // Jika respons tidak dikenali, gunakan handler default
    return AnyMessageHandler.execute(msg);
  },
};