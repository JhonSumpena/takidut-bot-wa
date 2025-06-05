import type { Message } from 'whatsapp-web.js';
import OrderHandlerCache from '../../cache/OrderHandlerCache';
import { IOrder } from '../../interfaces/Order';
import HelperCurrency from '../../utils/HelperCurrency';
import { OrderMessageHandler } from '../OrderMessageHandler';

export const FinishOrderCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const orderData = await OrderHandlerCache.getOrderFromMessage(msg.from);

    if (!orderData) {
      console.log('❌ Tidak ditemukan data order untuk nomor ini:', msg.from);
      return msg.reply(
        'Ops! Tidak ada pesanan Anda yang ditemukan untuk diselesaikan. ❌',
      );
    }

    const status_to_update = 'konfirmasi-data';
    if (!OrderMessageHandler.updateStatusOder(msg, status_to_update)) {
      console.log('❌ Gagal memperbarui status:', status_to_update);
    }

    const items_to_print = orderData.items.map((item) => {
      return `
      •${item.name}:
      →Jumlah: ${item.quantity}
      →Harga: *${HelperCurrency.priceToString(Number(item.price))}*\n`;
    });

    return msg.reply(`*DATA PESANAN*
      \n*Pelanggan:*
      •Nama: ${orderData.name}
      •Nomor kontak: ${orderData.contact_number}
      \n*Keranjang:*${items_to_print.join('')}
      \nTotal Pembelian: *${HelperCurrency.priceToString(Number(orderData.total))}*
      \n*Apakah Anda ingin mengonfirmasi pesanan ini?*
    `);
  },
};
