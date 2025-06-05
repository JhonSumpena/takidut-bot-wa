import { Message } from 'whatsapp-web.js';
import { queryProduct } from '../../../usecases/query-products';
import { HelperCommands } from '../../utils/HelperCommands';

export function generateProductCode(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `${prefix}${random}`;
}


export const AddProductCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply('❌ Anda tidak punya akses menambahkan produk.');
    }

    const body = msg.body.trim();
    const args = body.split(' ');

    if (args.length < 5) {
      return msg.reply(
        'Format salah! Gunakan:\n\n*tambahproduk [kode] [nama] [harga] [stok]*\nContoh: tambahproduk ABC123 Bolu 10000 50'
      );
    }

    const [, kode, nama, hargaStr, stokStr] = args;
    const harga = parseInt(hargaStr);
    const stok = parseInt(stokStr);

    if (isNaN(harga) || isNaN(stok)) {
      return msg.reply('❌ Harga dan stok harus berupa angka.');
    }

    try {
      await queryProduct.insertProduct({
        kode_barang: kode,
        name: nama,
        price: harga,
        stock: stok,
      });

      console.log(`✅ Produk *${nama}* berhasil ditambahkan.`);
      return msg.reply(`✅ Produk *${nama}* berhasil ditambahkan.`);
    } catch (err) {
      console.log('❌ Gagal menambahkan produk. Mungkin kode barang sudah ada.');
      return msg.reply('❌ Gagal menambahkan produk. Mungkin kode barang sudah ada.');
    }
  },
};
