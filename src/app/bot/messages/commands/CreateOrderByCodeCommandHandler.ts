import { Message } from 'whatsapp-web.js';
import db from '../../../../database/connection';
import { OrderMessageHandler } from '../OrderMessageHandler';

export const CreateOrderByCodeCommandHandler = {
  async execute(msg: Message): Promise<Message | void> {
    const body = msg.body.trim().slice(6).trim(); // remove "#pesan"
    if (!body) {
      return msg.reply('❌ Format salah.\n\nContoh:\n#pesan 2 K001, 1 K005');
    }

    const parts = body.split(',');
    const items: { kode: string, qty: number }[] = [];

    for (const part of parts) {
      const match = part.trim().match(/^(\d+)\s+([a-zA-Z0-9_-]+)$/);
      if (!match) {
        return msg.reply(`❌ Format salah di bagian: "${part.trim()}"`);
      }
      const [, qtyStr, kode] = match;
      items.push({ qty: parseInt(qtyStr), kode: kode.toUpperCase() });
    }

    const productCodes = items.map(i => i.kode);
    const dbProducts = await db('products').whereIn('kode_barang', productCodes);

    if (dbProducts.length !== items.length) {
      const found = dbProducts.map((p: { kode_barang: any; }) => p.kode_barang);
      const notFound = productCodes.filter(kode => !found.includes(kode));
      return msg.reply(`⚠️ Kode produk tidak ditemukan: ${notFound.join(', ')}`);
    }

    const orderItems = items.map(i => {
      const product = dbProducts.find((p: { kode_barang: string; }) => p.kode_barang === i.kode)!;
      return {
        id: product.id,
        kode_barang: product.kode_barang,
        name: product.name,
        price: product.price,
        quantity: i.qty,
        subtotal: product.price * i.qty,
      };
    });

    const total = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
    const contact = await msg.getContact();

    const orderData = await OrderMessageHandler.createCacheOrder({
      total,
      items: orderItems,
      name: contact.pushname ?? 'Tanpa Nama',
      contact_number: await contact.getFormattedNumber(),
      chatId: (await contact.getChat()).id._serialized,
      location: {},
    });

    await OrderMessageHandler.saveOrderCache(msg.from, orderData);

    return msg.reply(`✅ Pesanan berhasil dibuat dari kode barang!\nTotal item: ${orderItems.length}\nTotal harga: Rp${total.toLocaleString('id-ID')}\n\nKetik *#ok* untuk menyelesaikan.`);
  }
};
