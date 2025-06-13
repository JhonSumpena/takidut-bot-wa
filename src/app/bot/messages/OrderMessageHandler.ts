import type { Message } from 'whatsapp-web.js';
import OrderHandlerCache from '../cache/OrderHandlerCache';
//import { IOrder } from '../interfaces/Order';
import { redisClient } from '../../../services/redis';

export const OrderMessageHandler = {
  async execute(msg: Message, _client?: any): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const order = await msg.getOrder();
    const { total, products } = order;
    const contact = await msg.getContact();

    const data = await OrderHandlerCache.prepareOrderToCache({
      total: Number(total),
      name: contact.pushname ?? 'Tanpa Nama',
      items: products,
      contact_number: await contact.getFormattedNumber(),
      chatId: (await contact.getChat()).id._serialized,
      location: {},
    });

    await OrderHandlerCache.setOrder('order:' + msg.from, data);

    return msg.reply(
      `✅ Pesanan Anda telah diterima dengan sukses.
\nJika ingin menyelesaikan pesanan, ketik: *#ok*`,
    );
  },

  async CheckExistsOrderToUser(msg: Message): Promise<boolean> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    return obj !== null && obj !== undefined;
  },

  async getStatusOrder(msg: Message): Promise<string> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    return obj?.status ?? 'null';
  },

  async updateStatusOder(msg: Message, status: string): Promise<boolean> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    if (!obj) return false;

    obj.status = status;
    await OrderHandlerCache.setOrder('order:' + msg.from, JSON.stringify(obj));
    return true;
  },

  async setAddressLocationToOrder(
    latitude: string,
    longitude: string,
    status: string,
    msg: Message,
  ): Promise<boolean> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    if (!obj) return false;

    obj.location.latitude = latitude;
    obj.location.longitude = longitude;
    obj.status = status;

    await redisClient.set('order:' + msg.from, JSON.stringify(obj));
    return true;
  },

  async setBairroToOrder(
    status: string,
    biaya_ongkir: number,
    msg: Message,
  ): Promise<boolean> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    if (!obj) return false;

    let biaya_ongkir_bayar = 15000;
    let nama_wilayah = 'lainnya';

    switch (biaya_ongkir) {
      case 1: nama_wilayah = 'bandung'; biaya_ongkir_bayar = 5000; break;
      case 2: nama_wilayah = 'jakarta'; biaya_ongkir_bayar = 8000; break;
      case 3: nama_wilayah = 'yogyakarta'; biaya_ongkir_bayar = 10000; break;
      case 4: nama_wilayah = 'surabaya'; biaya_ongkir_bayar = 12000; break;
      case 5: nama_wilayah = 'bali'; biaya_ongkir_bayar = 15000; break;
    }

    obj.location.wilayah = nama_wilayah;
    obj.total = Number(obj.total) + biaya_ongkir_bayar;
    obj.location.biaya_ongkir = biaya_ongkir_bayar;
    obj.status = status;

    await redisClient.set('order:' + msg.from, JSON.stringify(obj));
    return true;
  },

  async setPaymentMethodToOrder(
    metode_pembayaran: string,
    status: string,
    msg: Message,
  ): Promise<boolean> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    if (!obj) return false;

    obj.payment_method = metode_pembayaran;
    obj.payment_status = 'menunggu';
    obj.status = status;

    await redisClient.set('order:' + msg.from, JSON.stringify(obj));
    return true;
  },

  async setDeliveryMethodToOrder(
    metode_pengiriman: string,
    status: string,
    msg: Message,
  ): Promise<boolean> {
    const obj = await OrderHandlerCache.getOrderFromMessage(msg.from);
    if (!obj) return false;

    obj.delivery_method = metode_pengiriman;
    obj.status = status;

    await OrderHandlerCache.setOrder('order:' + msg.from, JSON.stringify(obj));
    return true;
  },
  async createCacheOrder({
  total,
  items,
  name,
  contact_number,
  chatId,
  location,
}: {
  total: number;
  items: any[];
  name: string;
  contact_number: string;
  chatId: string;
  location: any;
}) {
  return {
    total,
    items,
    name,
    contact_number,
    chatId,
    location,
    status: 'konfirmasi-data',
    created_at: new Date(),
  };
},

async saveOrderCache(key: string, data: any) {
  return OrderHandlerCache.setOrder('order:' + key, data);
},
};
