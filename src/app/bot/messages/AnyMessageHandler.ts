import type { Message } from 'whatsapp-web.js';
import { AddProductCommandHandler } from './commands/AddProductCommandHandler';
import { CheckStockCommandHandler } from './commands/CheckStockCommandHandler';
import { ListProductCommandHandler } from './commands/ListProductCommandHandler';
import { UpdateProductCommandHandler } from './commands/UpdateProductCommandHandler';
import { DeleteProductCommandHandler } from './commands/DeleteProductCommandHandler';

import HelperStr from '../utils/HelperStr';
import { OrderMessageHandler } from './OrderMessageHandler';
import {
  greeting_messages,
  greeting_message_to_reply,
  production_status_message,
  last_option_message,
  created_status_message,
  confirm_data_status,
  confirm_address_data,
  confirm_delivery_data,
  confirm_payment_data,
  confirm_bairro_data,
  payment_required_message,
  finished_order_message,
  entrega_status_message,
  retirada_status_message,
} from '../utils/ReturnsMessages';
import OrderHandlerCache from '../cache/OrderHandlerCache';
import { HelperCommands } from '../utils/HelperCommands';

export const AnyMessageHandler = {
  async execute(msg: Message): Promise<Message> {
    try {
      // Skip jika sedang dalam mode atendimento
      if (await OrderHandlerCache.checkIfIsAtendimento(msg)) {
        console.log('🔄 User sedang dalam mode atendimento, melewati AnyMessageHandler');
        return msg;
      }

      const chat = await msg.getChat();
      await chat.sendStateTyping();

      const splited_message_body = HelperStr.formatMessageToCheck(msg.body).split(' ');

      // Cek apakah pesan adalah greeting
      const found = greeting_messages.some(
        (r) => splited_message_body.indexOf(r) >= 0,
      );
      
      if (found) {
        console.log('👋 Mengirim pesan greeting kepada user');
        return msg.reply(greeting_message_to_reply);
      }

      const body_upper = msg.body.toUpperCase().trim();
        if (body_upper.startsWith('HAPUS ')) {
          const kode = body_upper.split(' ')[1];
          if (kode && HelperCommands.checkIfIsAdmin(msg.from)) {
            console.log('🗑️ Konfirmasi hapus produk:', kode);
            return DeleteProductCommandHandler.confirmDelete(msg, kode);
          }
        }

      // Cek apakah user memiliki pesanan aktif
      if (await OrderMessageHandler.CheckExistsOrderToUser(msg)) {
        const order_status = await OrderMessageHandler.getStatusOrder(msg);

        console.log('📋 Status pesanan user:', order_status);
        
        // Update switch case ke bahasa Indonesia sesuai dengan MessageHandler
        switch (order_status) {
          case 'created':
            console.log('✅ Mengirim pesan status: pesanan dibuat');
            return msg.reply(created_status_message);
            
          case 'konfirmasi-data': // Updated from 'confirma-dados'
            console.log('📝 Mengirim pesan: konfirmasi data');
            return msg.reply(confirm_data_status);
            
          case 'data-alamat': // Updated from 'endereco-dados'
            console.log('📍 Mengirim pesan: konfirmasi alamat');
            return msg.reply(confirm_address_data);
            
          case 'biaya-ongkir': // Updated from 'taxa-entrega'
            console.log('💰 Mengirim pesan: konfirmasi biaya ongkir');
            return msg.reply(confirm_bairro_data);
            
          case 'data-pengiriman': // Updated from 'entrega-dados'
            console.log('🚚 Mengirim pesan: konfirmasi data pengiriman');
            return msg.reply(confirm_delivery_data);
            
          case 'data-pembayaran': // Updated from 'pagamento-dados'
            console.log('💳 Mengirim pesan: konfirmasi data pembayaran');
            return msg.reply(confirm_payment_data);
            
          case 'pix-pending': // Keep same (specific payment system)
            console.log('⏳ Mengirim pesan: pembayaran PIX pending');
            return msg.reply(payment_required_message);
            
          case 'produksi': // Updated from 'producao'
            console.log('🏭 Mengirim pesan: status produksi');
            return msg.reply(production_status_message);
            
          case 'pengiriman': // Updated from 'entrega'
            console.log('📦 Mengirim pesan: status pengiriman');
            return msg.reply(entrega_status_message);
            
          case 'ambil-sendiri': // Updated from 'retirada'
            console.log('🏪 Mengirim pesan: status ambil sendiri');
            return msg.reply(retirada_status_message);
            
          case 'selesai': // Updated from 'finalizado'
            console.log('✅ Mengirim pesan: pesanan selesai');
            return msg.reply(finished_order_message);
          
          case 'tambahproduk': 
            console.log('✅ Menambah Produk');
            return AddProductCommandHandler.execute(msg);
          
          case 'cekstok': 
            console.log('⏳ Check Stok Barang');
            return CheckStockCommandHandler.execute(msg);
          case 'listproduk': 
            console.log('📋 List semua produk');
            return ListProductCommandHandler.execute(msg);
            
          case 'updateproduk': 
            console.log('✏️ Update produk');
            return UpdateProductCommandHandler.execute(msg);
            
          case 'hapusproduk': 
            console.log('🗑️ Hapus produk');
            return DeleteProductCommandHandler.execute(msg);
          
            
          default:
            console.log('❓ Status pesanan tidak dikenali:', order_status);
            return msg.reply(last_option_message);
        }
      }

      console.log('💬 Mengirim pesan default/bantuan');
      return msg.reply(last_option_message);
      
    } catch (error) {
      console.error('❌ Error di AnyMessageHandler:', error);
      
      try {
        return msg.reply('❌ Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi atau ketik #bantuan untuk mendapat bantuan.');
      } catch (replyError) {
        console.error('❌ Error saat mengirim pesan error:', replyError);
        return msg;
      }
    }
  },
};