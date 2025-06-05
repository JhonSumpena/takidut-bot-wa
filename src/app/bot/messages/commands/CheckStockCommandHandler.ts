import { Message } from 'whatsapp-web.js';
import { queryProduct } from '../../../usecases/query-products';

export const CheckStockCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const body = msg.body.trim();
    const args = body.split(' ');

    if (args.length !== 2) {
      return msg.reply(
        'Format salah! Gunakan:\n\n*cekstok [kode_barang]*\nContoh: cekstok ABC123'
      );
    }

    const kode_barang = args[1];
    const product = await queryProduct.getProductByCode(kode_barang);
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
        }).format(product.price);
    const stockStatus = product.stock > 10 ? '🟢' : product.stock > 0 ? '🟡' : '🔴';
    const stockText = product.stock === 0 ? 'Habis' : `${product.stock} unit`;
    
    if (!product) {
      return msg.reply(`❌ Produk dengan kode ${kode_barang} tidak ditemukan.`);
    }

    return msg.reply(`📦 *${product.name}*\nKode: ${product.kode_barang}\nStok: ${product.stock}\nHarga: ${formattedPrice}`);
  },
};
