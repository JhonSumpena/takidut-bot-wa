import { Chat } from 'whatsapp-web.js';
import { redisClient } from '../../../services/redis';
import { client } from '../../../services/whatsapp';
import { Convert, IOrder } from '../interfaces/Order';
import HelperCurrency from './HelperCurrency';
import dotenv from 'dotenv';
import CreateOrder from '../../usecases/save-order';

type OrderProductionProps = {
  message_from: string;
  isUpdated?: boolean;
};

export class HelperOrderProduction {
  private message_from: string;
  private group_chat_id: string;
  private admin_production: string;
  private isUpdated?: boolean;
  private constructor(props: OrderProductionProps) {
    dotenv.config();

    this.isUpdated = props.isUpdated;
    this.message_from = props.message_from;
    this.message_from = props.message_from;
    this.group_chat_id = process.env.GROUP_CHAT_ID || '';
    this.admin_production = process.env.ADMINS?.split(' ')[0] || '';
  }

  private async saveOrderInGroup(): Promise<any> {
    const group_chat = await this.tryGetOrCreateChatGroup(this.group_chat_id);
    const order = await this.getOrderFromCache(this.message_from);
    const message_to_send_group = await this.prepareMessageToSendGroup(order);

    if (!this.isUpdated) {
      this.notifyOrderToAdminProduction(this.admin_production, order);
    }

    const instOrder = new CreateOrder(order);

    try {
      await instOrder.execute();
    } catch (err) {
      console.error(err);
    }

    await group_chat.sendMessage(message_to_send_group);
  }

  private async notifyOrderToAdminProduction(
    admin_chat_id: string,
    order: IOrder,
  ): Promise<any> {
    const message_to_notify = `Mari bekerja 🛠️⌛! Pesanan baru diteruskan ke produksi.\n
    No. pesanan: *${order.identifier}*
    Total nilai pesanan: *${HelperCurrency.priceToString(
      Number(order.total),
    )}*
    \nKetik *#laporan* untuk melihat analisis pesanan saat ini.`;

    await client.sendMessage(admin_chat_id, message_to_notify);
  }

  private async getOrderFromCache(message_from: string): Promise<IOrder> {
    const order_json = await redisClient.get('order:' + message_from);

    const order_obj = Convert.toIOrder(order_json || '');
    return order_obj;
  }

  private async prepareMessageToSendGroup(order: IOrder): Promise<string> {
    const isUpdatedMessage = !this.isUpdated
      ? ''
      : '⚠️ *PESANAN DIPERBARUI* ⚠️\n\n';

    const items_to_print = order.items.map((item) => {
      return `
        •${item.name}:
        →Jumlah: ${item.quantity}
        →Harga: *${HelperCurrency.priceToString(Number(item.price))}*\n`;
    });

    const message_to_write = `${isUpdatedMessage}*DATA PESANAN*
    \n*No. pesanan*: ${order.identifier}
    \n*Pelanggan:*
    •Nama: ${order.name}
    •Nomor kontak: ${order.contact_number}
    \n*Keranjang:*${items_to_print}
    \n*Data pengiriman:*
    •Metode pengiriman: ${order.delivery_method}
    •Daerah pengiriman: ${order.location.wilayah}
    •Latitude: ${order.location.latitude}
    •Longitude: ${order.location.longitude}
    \n*Data pembayaran:*
    •Metode pembayaran: ${order.payment_method}
    •Status pembayaran: ${order.payment_status}
    •Biaya pengiriman: ${order.location.biaya_ongkir}
    \n*Status pesanan:* ${order.status}
    \nTotal Pembelian: *${HelperCurrency.priceToString(Number(order.total))}*
    \n*Dibuat Pada:* ${order.created_at}
    \n*Terakhir diperbarui:* ${order.updated_at}
    `;

    return message_to_write;
  }

  private async tryGetOrCreateChatGroup(group_chat_id: string): Promise<Chat> {
    const group_chat = await client.getChatById(group_chat_id);
    if (!group_chat.isGroup) {
      throw console.error('Error saat mengambil grup: ', group_chat);
    }

    const chat_pin = await group_chat.pin();
    if (!chat_pin) {
      group_chat.pin;
    }

    return group_chat;
  }

  static create(props: OrderProductionProps): any {
    const order_production = new HelperOrderProduction({
      ...props,
    });
    order_production.saveOrderInGroup();
  }
}