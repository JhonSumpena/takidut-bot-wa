import dotenv from 'dotenv';
import { Message, Location } from 'whatsapp-web.js';
import { client } from '../../../services/whatsapp';
import { UpdateOrder } from '../../usecases/update-order';

dotenv.config();

export const HelperCommands = {
  async checkIfIsAdmin(message_from: string): Promise<boolean> {
  if (process.env.ADMINS != null) {
    const admins = process.env.ADMINS.split(',').map(admin => admin.trim());
    
    // Debug logging (hapus setelah fix)
    console.log('Checking admin access:');
    console.log('User ID:', message_from);
    console.log('Admin list:', admins);
    console.log('Is admin?', admins.includes(message_from));
    
    return admins.includes(message_from);
  }

  return false;
},
  async updateOrderStatusAndNotify(
    order_id: number,
    status_to_update: string,
    msg: Message,
  ): Promise<Message> {
    let notification_to;
    try {
      notification_to = await UpdateOrder.updateOrderByStatus(
        order_id,
        status_to_update,
      );
    } catch (e) {
      console.error('Error updating order status: ', e);

      return msg.reply('Ops! Terjadi kesalahan saat mencari pesanan ini.');
    }

    /**
     * @todo menambahkan lokasi pada pesan pengambilan
     */
    let message_to_reply;
    let location;
    switch (status_to_update) {
      case 'pengiriman':
        message_to_reply =
          '\nSekarang pesanan Anda sedang dalam perjalanan ke lokasi Anda, silakan bersiap untuk menerimanya';
        break;
      case 'selesai':
        message_to_reply = `\nSekarang pesanan Anda telah selesai ✅.
        \nTerima kasih atas kepercayaan Anda! Terima kasih telah menggunakan layanan kami, kami bekerja untuk memberikan pengalaman terbaik bagi Anda!.
        \nJika Anda puas, silakan bagikan dengan menandai kami di media sosial:
        \n👉Instagram - [link Instagram]
        \n👉Facebook - [link Facebook]`;
        break;
      case 'ambil-sendiri':
        message_to_reply =
          '\nKabar baik! Pesanan Anda sudah siap untuk diambil di lokasi di atas.';
        location = new Location(
          Number(process.env.LOCATION_LAT) ?? 0,
          Number(process.env.LOCATION_LON) ?? 0,
        );
        break;
      default:
        message_to_reply = '';
    }
    if (location !== undefined) {
      await client.sendMessage(notification_to, location || '');
    }

    return await client.sendMessage(
      notification_to,
      `Hei, kami ingin memberitahu bahwa pesanan Anda telah diperbarui! ${message_to_reply}
      \n\nAnda juga dapat mengetik *#lihat* untuk melihat informasi lebih lanjut tentang pesanan Anda.`,
    );
  },
  async updatePaymentStatusAndNotify(
    order_id: number,
    status_to_update: string,
    msg: Message,
  ): Promise<Message> {
    let notification_to;
    try {
      notification_to = await UpdateOrder.updatePaymentByStatus(
        order_id,
        status_to_update,
      );
    } catch (e) {
      console.error('Error updating order status: ', e);

      return msg.reply('Ops! Terjadi kesalahan saat mencari pesanan ini.');
    }

    if (status_to_update === 'pago') {
      return await client.sendMessage(
        notification_to,
        `Pembayaran Anda telah dikonfirmasi ✅!
        \n\nAnda juga dapat mengetik *#lihat* untuk melihat informasi lebih lanjut tentang pesanan Anda.`,
      );
    }

    return msg.reply('');
  },
};