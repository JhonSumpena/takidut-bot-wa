import { Message } from 'whatsapp-web.js';
import OrderHandlerCache from '../../cache/OrderHandlerCache';
import { IOrder } from '../../interfaces/Order';
import HelperCurrency from '../../utils/HelperCurrency';
import { HelperCommands } from '../../utils/HelperCommands';

export const InfoOrderCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    let orderData: IOrder | null;

try {
  orderData = await OrderHandlerCache.getOrderFromMessage(msg.from);
  if (!orderData) throw new Error('Order not found');
} catch (error) {
  console.log('❌ Error saat mengambil data pesanan:', error);
  const isAdmin = await HelperCommands.checkIfIsAdmin(msg.from);
  if (isAdmin) {
    return msg.reply('ℹ️ Anda adalah admin dan tidak memiliki pesanan aktif saat ini.');
  }

  return msg.reply(
    '⚠️ Tidak ditemukan pesanan aktif. Silakan buat pesanan terlebih dahulu.',
  );
}

    const items_to_print = orderData.items.map((item) => {
      return `
      •${item.name}:
      →Jumlah: ${item.quantity}
      →Harga: *${HelperCurrency.priceToString(Number(item.price))}*\n`;
    });

    const order_data = `*DATA PESANAN*
\n*No. pesanan*: ${orderData.identifier}
\n*Pelanggan:*
•Nama: ${orderData.name}
•Nomor kontak: ${orderData.contact_number}
\n*Keranjang:*${items_to_print}
*Data pengiriman:*
•Metode pengiriman: ${orderData.delivery_method}
•Wilayah pengiriman: ${orderData.location.wilayah}
\n*Data pembayaran:*
•Metode pembayaran: ${orderData.payment_method}
•Status pembayaran: ${orderData.payment_status}
•Biaya ongkir: ${orderData.location.biaya_ongkir}
\n*Status pesanan:* ${orderData.status}
\nTotal Pembelian: *${HelperCurrency.priceToString(Number(orderData.total))}*
\n*Dibuat pada:* ${orderData.created_at}
\n*Terakhir diperbarui:* ${orderData.updated_at}
`;

    await chat.sendMessage(order_data);

    return msg.reply(
      'Ini adalah pesanan aktif Anda saat ini. Jika ingin membuat pesanan baru, kirim keranjang baru: *#keranjang*',
    );
  },
};
