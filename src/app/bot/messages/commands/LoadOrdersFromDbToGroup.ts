import { Message } from 'whatsapp-web.js';
import { queryOrder } from '../../../usecases/query-orders';
import { IOrder, Item } from '../../interfaces/Order';
import { HelperCommands } from '../../utils/HelperCommands';
import HelperCurrency from '../../utils/HelperCurrency';
import dotenv from 'dotenv';
import moment from 'moment';
import { client } from '../../../../services/whatsapp';

dotenv.config();

export const LoadOrdersFromDbToGroup = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    // Cek apakah user adalah admin
    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply(
        'Maaf! Anda tidak memiliki izin untuk menggunakan perintah ini. ❌',
      );
    }

    const chatIdGroup = process.env.GROUP_CHAT_ID || '';
    const group_chat = await client.getChatById(chatIdGroup);
    if (!group_chat.isGroup) {
      return msg.reply('Grup tidak terdefinisi dalam konfigurasi. ❌');
    }

    // Bersihkan pesan lama di grup
    await group_chat.clearMessages();

    const result = await queryOrder.selectAllOrdersRecords();
    result.map(async (orderItem: IOrder) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const location = JSON.parse(orderItem.location);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const cart_items = JSON.parse(orderItem.items);

      const items_to_print = cart_items.map((item: Item) => {
        return `
          •${item.name}:
          →Jumlah: ${item.quantity}
          →Harga: *${HelperCurrency.priceToString(Number(item.price))}*`;
      });

      const delivery_data = () => {
        if (orderItem.delivery_method === 'pengiriman') { // entrega -> pengiriman
          return `
          *Data pengiriman:*
          •Metode pengiriman: ${orderItem.delivery_method}
          •Wilayah pengiriman: ${location.wilayah}
          •Latitude: ${location.latitude}
          •Longitude: ${location.longitude}
          •Biaya ongkir: ${location.biaya_ongkir}`;
        }
        return undefined;
      };

      const message = `*DATA PESANAN*
        \n*ID*: ${orderItem.id}
        \n*No. pesanan*: ${orderItem.identifier}
        \n*Pelanggan:*
        •Nama: ${orderItem.name}
        •Nomor kontak: ${orderItem.contact_number}
        \n*Keranjang:*${items_to_print}
        ${delivery_data() ?? ''}
        \n*Data pembayaran:*
        •Metode pembayaran: ${orderItem.payment_method}
        •Status pembayaran: ${orderItem.payment_status}
        \n*Status pesanan:* ${orderItem.status}
        \nTotal Pembelian: *${HelperCurrency.priceToString(Number(orderItem.total))}*
        \n*Dibuat pada:* ${orderItem.created_at}
        \n*Terakhir diperbarui:* ${orderItem.updated_at}`;
      await group_chat.sendMessage(message);
    });
    
    const now = moment().format('DD-MM-YYYY-hh:mm:ss');

    await group_chat.sendMessage(`Dimuat pada: ${now}`);
    return msg.reply(
      'Pesanan berhasil dimuat ✅. Silakan cek grup yang sudah ditentukan.',
    );
  },
};