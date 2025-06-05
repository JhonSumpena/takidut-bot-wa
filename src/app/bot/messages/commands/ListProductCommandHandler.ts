import { Message } from 'whatsapp-web.js';
import { queryProduct } from '../../../usecases/query-products';
import { HelperCommands } from '../../utils/HelperCommands';

export const ListProductCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply('❌ Anda tidak punya akses untuk melihat daftar produk.');
    }

    try {
      const products = await queryProduct.getAllProducts();
      
      if (!products || products.length === 0) {
        return msg.reply('📋 Belum ada produk yang terdaftar.');
      }

      let productList = '📋 *DAFTAR PRODUK*\n\n';
      
      products.forEach((product: any, index: number) => {
        const formattedPrice = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(product.price);

        const stockStatus = product.stock > 10 ? '🟢' : product.stock > 0 ? '🟡' : '🔴';
        
        productList += `${index + 1}. *${product.name}*\n`;
        productList += `   Kode: ${product.kode_barang}\n`;
        productList += `   Harga: ${formattedPrice}\n`;
        productList += `   Stok: ${stockStatus} ${product.stock} unit\n\n`;
      });

      productList += `Total: *${products.length}* produk`;

      return msg.reply(productList);
    } catch (error) {
      console.error('❌ Error saat mengambil daftar produk:', error);
      return msg.reply('❌ Gagal mengambil daftar produk. Silakan coba lagi.');
    }
  },
};