import type { Message } from 'whatsapp-web.js';
import { DeleteProductCommandHandler } from './commands/DeleteProductCommandHandler';

import HelperStr from '../utils/HelperStr';
import { OrderMessageHandler } from './OrderMessageHandler';
import {
  greeting_messages,
  greeting_message_to_reply,
  production_status_message,
  last_option_message,
  created_status_message,
  confirm_data_status,
  confirm_address_data,
  confirm_delivery_data,
  confirm_payment_data,
  confirm_bairro_data,
  payment_required_message,
  finished_order_message,
  entrega_status_message,
  retirada_status_message,
} from '../utils/ReturnsMessages';
import OrderHandlerCache from '../cache/OrderHandlerCache';
import { HelperCommands } from '../utils/HelperCommands';

export const AnyMessageHandler = {
  async execute(msg: Message): Promise<Message | void> {
    try {
      if (await OrderHandlerCache.checkIfIsAtendimento(msg)) {
        console.log('🔄 User sedang dalam mode atendimento, melewati AnyMessageHandler');
        return;
      }

      const chat = await msg.getChat();
      await chat.sendStateTyping();

      const formatted = HelperStr.formatMessageToCheck(msg.body);
      const foundGreeting = greeting_messages.some(g => formatted.includes(g));
      const hasOrder = await OrderMessageHandler.CheckExistsOrderToUser(msg);

      // 1. Greeting dan belum punya order → kirim sapaan
      if (foundGreeting && !hasOrder) {
        console.log('👋 Greeting dan user tidak punya order -> kirim greeting');
        return msg.reply(greeting_message_to_reply);
      }

      // 2. Admin command: HAPUS <KODE>
      const bodyUpper = msg.body.toUpperCase().trim();
      if (bodyUpper.startsWith('HAPUS ')) {
        const kode = bodyUpper.split(' ')[1];
        if (kode && (await HelperCommands.checkIfIsAdmin(msg.from))) {
          console.log('🗑️ Konfirmasi hapus produk:', kode);
          return DeleteProductCommandHandler.confirmDelete(msg, kode);
        }
      }

      // 3. User punya order → kirim respon berdasarkan status
      if (hasOrder) {
        const order_status = await OrderMessageHandler.getStatusOrder(msg);
        console.log('📋 Status pesanan user:', order_status);

        const statusResponses: Record<string, string> = {
          'buat': created_status_message,
          'konfirmasi-data': confirm_data_status,
          'data-alamat': confirm_address_data,
          'biaya-ongkir': confirm_bairro_data,
          'data-pengiriman': confirm_delivery_data,
          'data-pembayaran': confirm_payment_data,
          'pix-pending': payment_required_message,
          'produksi': production_status_message,
          'pengiriman': entrega_status_message,
          'ambil-sendiri': retirada_status_message,
          'selesai': finished_order_message,
        };

        return msg.reply(statusResponses[order_status] || last_option_message);
      }

      // 4. Bukan greeting & tidak ada order → tidak dibalas
      console.log('📭 Chat biasa, bukan greeting, dan user belum punya order → tidak dibalas');
      return;

    } catch (error) {
      console.error('❌ Error di AnyMessageHandler:', error);
      try {
        return msg.reply('❌ Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi atau ketik #bantuan.');
      } catch (replyError) {
        console.error('❌ Error saat mengirim pesan error:', replyError);
        return;
      }
    }
  },
};
