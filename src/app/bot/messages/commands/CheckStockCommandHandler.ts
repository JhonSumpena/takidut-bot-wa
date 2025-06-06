import { Message } from 'whatsapp-web.js';
import { queryProduct } from '../../../usecases/query-products';
import { HelperCommands } from '../../utils/HelperCommands';

export const CheckStockCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const body = msg.body.trim();
    const args = body.split(' ');

    if (args.length !== 2) {
      return msg.reply(
        'Format salah! Gunakan:\n\n*#cekstok [kode_barang]*\nContoh: #cekstok ABC123'
      );
    }

    const kode_barang = args[1];

    // Izinkan hanya admin atau user yang punya order
    const isAdmin = await HelperCommands.checkIfIsAdmin(msg.from);
    if (!isAdmin) {
      return msg.reply('❌ Anda tidak memiliki akses untuk mengecek stok. Fitur ini hanya untuk admin.');
    }

    const product = await queryProduct.getProductByCode(kode_barang);

    if (!product) {
      return msg.reply(`❌ Produk dengan kode ${kode_barang} tidak ditemukan.`);
    }

    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(product.price);

    return msg.reply(
      `📦 *${product.name}*\nKode: ${product.kode_barang}\nStok: ${product.stock} unit\nHarga: ${formattedPrice}`
    );
  },
};
