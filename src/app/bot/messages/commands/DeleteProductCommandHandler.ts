import { Message } from 'whatsapp-web.js';
import { queryProduct } from '../../../usecases/query-products';
import { HelperCommands } from '../../utils/HelperCommands';

export const DeleteProductCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply('❌ Anda tidak punya akses untuk menghapus produk.');
    }

    const body = msg.body.trim();
    const args = body.split(' ');

    if (args.length !== 2) {
      return msg.reply(
        'Format salah! Gunakan:\n\n*hapusproduk [kode_barang]*\nContoh: hapusproduk ABC123'
      );
    }

    const kode = args[1];

    try {
      // Cek apakah produk ada
      const existingProduct = await queryProduct.getProductByCode(kode);
      if (!existingProduct) {
        return msg.reply(`❌ Produk dengan kode *${kode}* tidak ditemukan.`);
      }

      // Konfirmasi sebelum hapus
      const productName = existingProduct.name;
      
      // Untuk keamanan, minta konfirmasi dengan mengetik "HAPUS [KODE]"
      const confirmationText = `⚠️ *PERINGATAN*\n\nAnda akan menghapus produk:\n*${productName}* (${kode})\n\nUntuk konfirmasi, balas pesan ini dengan:\n*HAPUS ${kode}*`;
      
      return msg.reply(confirmationText);

    } catch (error) {
      console.error('❌ Error saat cek produk untuk dihapus:', error);
      return msg.reply('❌ Gagal memproses permintaan hapus produk. Silakan coba lagi.');
    }
  },

  // Fungsi terpisah untuk konfirmasi hapus
  async confirmDelete(msg: Message, kode: string): Promise<Message> {
    try {
      const deletedRows = await queryProduct.deleteProduct(kode);
      
      if (deletedRows > 0) {
        return msg.reply(`✅ Produk dengan kode *${kode}* berhasil dihapus.`);
      } else {
        return msg.reply(`❌ Produk dengan kode *${kode}* tidak ditemukan.`);
      }
    } catch (error) {
      console.error('❌ Error saat hapus produk:', error);
      return msg.reply('❌ Gagal menghapus produk. Silakan coba lagi.');
    }
  }
};