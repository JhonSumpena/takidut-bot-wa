import { Message } from 'whatsapp-web.js';
import { queryProduct } from '../../../usecases/query-products';
import { HelperCommands } from '../../utils/HelperCommands';

export const UpdateProductCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply('❌ Anda tidak punya akses untuk update produk.');
    }

    const body = msg.body.trim();
    const args = body.split(' ');

    if (args.length < 3) {
      return msg.reply(
        'Format salah! Gunakan:\n\n' +
        '*updateproduk [kode] [field] [nilai]*\n\n' +
        'Field yang bisa diupdate:\n' +
        '- nama: Update nama produk\n' +
        '- harga: Update harga produk\n' +
        '- stok: Update stok produk\n\n' +
        'Contoh:\n' +
        'updateproduk ABC123 harga 15000\n' +
        'updateproduk ABC123 stok 25\n' +
        'updateproduk ABC123 nama Bolu-Vanilla'
      );
    }

    const kode = args[1];
    const field = args[2].toLowerCase();
    const nilai = args.slice(3).join(' ');

    try {
      // Cek apakah produk ada
      const existingProduct = await queryProduct.getProductByCode(kode);
      if (!existingProduct) {
        return msg.reply(`❌ Produk dengan kode *${kode}* tidak ditemukan.`);
      }

      let updateData: any = {};
      let successMessage = '';

      switch (field) {
        case 'nama':
        case 'name':
          if (!nilai.trim()) {
            return msg.reply('❌ Nama produk tidak boleh kosong.');
          }
          updateData.name = nilai;
          successMessage = `✅ Nama produk *${kode}* berhasil diupdate menjadi *${nilai}*.`;
          break;

        case 'harga':
        case 'price':
          const harga = parseInt(nilai);
          if (isNaN(harga) || harga <= 0) {
            return msg.reply('❌ Harga harus berupa angka positif.');
          }
          updateData.price = harga;
          const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(harga);
          successMessage = `✅ Harga produk *${kode}* berhasil diupdate menjadi ${formattedPrice}.`;
          break;

        case 'stok':
        case 'stock':
          const stok = parseInt(nilai);
          if (isNaN(stok) || stok < 0) {
            return msg.reply('❌ Stok harus berupa angka dan tidak boleh negatif.');
          }
          updateData.stock = stok;
          successMessage = `✅ Stok produk *${kode}* berhasil diupdate menjadi *${stok}* unit.`;
          break;

        default:
          return msg.reply('❌ Field tidak valid. Gunakan: nama, harga, atau stok.');
      }

      await queryProduct.updateProduct(kode, updateData);
      return msg.reply(successMessage);

    } catch (error) {
      console.error('❌ Error saat update produk:', error);
      return msg.reply('❌ Gagal mengupdate produk. Silakan coba lagi.');
    }
  },
};