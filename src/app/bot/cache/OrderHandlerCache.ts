import { redisClient } from '../../../services/redis';
import { Message } from 'whatsapp-web.js';
import { IOrder, Convert } from '../interfaces/Order';
import moment from 'moment';

export default class OrderHandlerCache {
  // Menyimpan data order ke Redis
  static async setOrder(identifier: string, data: string): Promise<void> {
    await redisClient.set(identifier, data);
  }

  /**
   * Mengambil data order dari Redis berdasarkan nomor pengirim
   * dan mengubahnya ke tipe IOrder
   */
  static async getOrderFromMessage(msg_from: string): Promise<IOrder | null> {
    try {
      const order_json = await redisClient.get('order:' + msg_from);

      // Jika datanya kosong atau tidak valid
      if (!order_json || order_json.trim() === '') {
        console.warn('⚠️ Data order kosong di Redis untuk:', msg_from);
        return null;
      }

      // Parsing JSON ke objek IOrder
      const order_obj = Convert.toIOrder(order_json);
      return order_obj;
    } catch (error) {
      console.error('❌ Gagal mengubah data order dari Redis ke tipe IOrder:', error);
      return null;
    }
  }

  /**
   * Menyimpan order ke Redis dengan key yang sesuai
   */
  static async saveOrderToCache(msg_from: string, order: IOrder): Promise<boolean> {
    try {
      const orderData = await this.prepareOrderToCache(order);
      await this.setOrder('order:' + msg_from, orderData);
      return true;
    } catch (error) {
      console.error('❌ Gagal menyimpan order ke cache:', error);
      return false;
    }
  }

  /**
   * Menghapus order dari cache
   */
  static async removeOrderFromCache(msg_from: string): Promise<boolean> {
    try {
      const result = await redisClient.del('order:' + msg_from);
      return result > 0;
    } catch (error) {
      console.error('❌ Gagal menghapus order dari cache:', error);
      return false;
    }
  }

  /**
   * Update status order di cache
   */
  static async updateOrderStatus(msg_from: string, status: string): Promise<boolean> {
    try {
      const existingOrder = await this.getOrderFromMessage(msg_from);
      if (!existingOrder) {
        console.warn('⚠️ Order tidak ditemukan untuk update status:', msg_from);
        return false;
      }

      existingOrder.status = status;
      existingOrder.updated_at = moment().format('DD-MM-YYYY-HH:mm:ss');
      
      const updatedOrderData = JSON.stringify(existingOrder);
      await this.setOrder('order:' + msg_from, updatedOrderData);
      return true;
    } catch (error) {
      console.error('❌ Gagal update status order:', error);
      return false;
    }
  }

  /**
   * Update payment method order di cache
   */
  static async updateOrderPaymentMethod(msg_from: string, paymentMethod: string, status?: string): Promise<boolean> {
    try {
      const existingOrder = await this.getOrderFromMessage(msg_from);
      if (!existingOrder) {
        console.warn('⚠️ Order tidak ditemukan untuk update payment method:', msg_from);
        return false;
      }

      existingOrder.payment_method = paymentMethod;
      existingOrder.updated_at = moment().format('DD-MM-YYYY-HH:mm:ss');
      
      if (status) {
        existingOrder.status = status;
      }
      
      const updatedOrderData = JSON.stringify(existingOrder);
      await this.setOrder('order:' + msg_from, updatedOrderData);
      return true;
    } catch (error) {
      console.error('❌ Gagal update payment method order:', error);
      return false;
    }
  }

  // Mengecek apakah user sedang dalam sesi "atendimento"
  static async checkIfIsAtendimento(msg: Message): Promise<boolean> {
    try {
      const isAtendimento = await redisClient.get('atendimento:' + msg.from);
      return isAtendimento !== null;
    } catch (error) {
      console.error('❌ Gagal mengecek status atendimento:', error);
      return false;
    }
  }

  // Mengakhiri sesi "atendimento" berdasarkan nama yang dilayani
  static async setAtendimentoToFinish(nama: string): Promise<boolean> {
    try {
      const key = `atendimento:6289630152908@c.us:${nama}`;
      const data = await redisClient.get(key);

      if (!data) {
        console.warn('⚠️ Data atendimento tidak ditemukan untuk:', nama);
        return false;
      }

      const json = JSON.parse(data);
      const { atendido, atendente } = json;

      await Promise.all([
        redisClient.del('atendimento:' + atendido),
        redisClient.del('atendimento:' + atendente)
      ]);

      return true;
    } catch (error) {
      console.error('❌ Gagal mengakhiri atendimento:', error);
      return false;
    }
  }

  // Menyiapkan data order agar bisa disimpan ke Redis
  static async prepareOrderToCache(order: IOrder): Promise<string> {
    const identifier = this.createIdentifierNameToOrder(
      order.name,
      order.total.toString(),
      order.contact_number
    );

    const now = moment().format('DD-MM-YYYY-HH:mm:ss');

    const data = {
      identifier,
      name: order.name,
      contact_number: order.contact_number,
      payment_method: order.payment_method ?? 'N/A',
      payment_status: order.payment_status ?? 'N/A',
      delivery_method: order.delivery_method ?? 'N/A',
      total: order.total,
      items: order.items,
      location: {
        latitude: order.location?.latitude ?? 'N/A',
        longitude: order.location?.longitude ?? 'N/A',
        bairro: order.location?.wilayah ?? 'N/A',
        taxa_entrega: order.location?.biaya_ongkir ?? 0,
      },
      status: order.status ?? 'created',
      chatId: order.chatId,
      created_at: order.created_at ?? now,
      updated_at: now,
    };

    return JSON.stringify(data);
  }

  // Membuat ID unik berdasarkan nama, total, dan nomor HP
  static createIdentifierNameToOrder(
    nama: string,
    total: string,
    nomor: string
  ): string {
    const nama_formatted = nama.substring(0, 3).toUpperCase();
    const angka_akhir = nomor.split('-').pop() ?? nomor.slice(-4);
    return `${nama_formatted}${total}${angka_akhir}`;
  }

  /**
   * Mengecek apakah order exists di cache
   */
  static async orderExists(msg_from: string): Promise<boolean> {
    try {
      const order = await this.getOrderFromMessage(msg_from);
      return order !== null;
    } catch (error) {
      console.error('❌ Gagal mengecek eksistensi order:', error);
      return false;
    }
  }

  /**
   * Get all orders (untuk debugging/monitoring)
   */
  static async getAllOrderKeys(): Promise<string[]> {
    try {
      return await redisClient.keys('order:*');
    } catch (error) {
      console.error('❌ Gagal mendapatkan semua order keys:', error);
      return [];
    }
  }
}