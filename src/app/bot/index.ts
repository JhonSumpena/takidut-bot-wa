import { Message } from 'whatsapp-web.js';
import { messageDispatcher } from './utils/MessageDispatcher';
import { OrderMessageHandler } from './messages/OrderMessageHandler';
import { AnyMessageHandler } from './messages/AnyMessageHandler';
import { ConfirmDataStatusHandler } from './messages/ConfirmDataStatusHandler';
import { OrderAddressHandler } from './messages/OrderAddressHandler';
import { OrderDeliveryDataHandler } from './messages/OrderDeliveryDataHandler';
import { OrderPaymentHandler } from './messages/OrderPaymentHandler';
import { OrderProductionStatusHandler } from './messages/OrderProductionStatusHandler';
import { CreatedOrderStatusHandler } from './messages/CreatedOrderStatusHandler';
import { OrderTaxaDeliveryHandler } from './messages/OrderTaxaDeliveryHandler';
import { OrderPaymentRequired } from './messages/OrderPaymentRequired';
import { OrderFinishedStatusHandler } from './messages/OrderFinishedStatusHandler';
import { DeliveryOrderStatusHandler } from './messages/DeliveryOrderStatusHandler';
import { RetiradaOrderStatusHandler } from './messages/RetiradaOrderStatusHandler';

import { FinishOrderCommandHandler } from './messages/commands/FinishOrderCommandHandler';
import { DoubtCommandHandler } from './messages/commands/DoubtCommandHandler';
import { AboutBotCommandHandler } from './messages/commands/AboutBotCommandHandler';
import { CarTutorialCommandHandler } from './messages/commands/CarTutorialCommandHandler';
import { InfoOrderCommandHandler } from './messages/commands/InfoOrderCommandHandler';
import { CancelOrderCommandHandler } from './messages/commands/CancelOrderCommandHandler';
import { HelpCommandHandler } from './messages/commands/HelpCommandHandler';
import { DoneAtendimentoHandler } from './messages/commands/DoneAtendimentoHandler';
import { UpdateOrderStatusCommand } from './messages/commands/UpdateOrderStatusCommand';
import { ReportOrdersCommandHandler } from './messages/commands/ReportOrdersCommandHandler';
import { LoadOrdersFromDbToGroup } from './messages/commands/LoadOrdersFromDbToGroup';
import { UpdatePaymentStatusCommand } from './messages/commands/UpdatePaymentStatusCommand';
import { CreatePaymentPixCommand } from './messages/commands/CreatePaymentPixCommand';

import { CreateOrderByCodeCommandHandler } from './messages/commands/CreateOrderByCodeCommandHandler';
import { AddProductCommandHandler } from './messages/commands/AddProductCommandHandler';
import { CheckStockCommandHandler } from './messages/commands/CheckStockCommandHandler';
import { ListProductCommandHandler } from './messages/commands/ListProductCommandHandler';
import { UpdateProductCommandHandler } from './messages/commands/UpdateProductCommandHandler';
import { DeleteProductCommandHandler } from './messages/commands/DeleteProductCommandHandler';

// Register handlers once when module loads
const initializeHandlers = (): void => {
  try {
    // Command handlers - Bahasa Indonesia
    messageDispatcher.register('ok', FinishOrderCommandHandler);
    messageDispatcher.register('tanya', DoubtCommandHandler);           // duvidas -> tanya
    messageDispatcher.register('bot', AboutBotCommandHandler);
    messageDispatcher.register('keranjang', CarTutorialCommandHandler); // car -> keranjang
    messageDispatcher.register('lihat', InfoOrderCommandHandler);       // ver -> lihat
    messageDispatcher.register('batal', CancelOrderCommandHandler);     // cancela -> batal
    messageDispatcher.register('bantuan', HelpCommandHandler);          // ajuda -> bantuan
    messageDispatcher.register('selesai', DoneAtendimentoHandler);      // encerra -> selesai
    messageDispatcher.register('update', UpdateOrderStatusCommand);     // atualiza -> update
    messageDispatcher.register('laporan', ReportOrdersCommandHandler);  // pedidos -> laporan
    messageDispatcher.register('tampilkan', LoadOrdersFromDbToGroup);   // mostra -> tampilkan
    messageDispatcher.register('bayar', UpdatePaymentStatusCommand);    // pay -> bayar
    messageDispatcher.register('pix', CreatePaymentPixCommand);

    // Message type handlers
    messageDispatcher.register('order', OrderMessageHandler);
    messageDispatcher.register('chat', AnyMessageHandler);

    // Order status handlers - Bahasa Indonesia
    messageDispatcher.register('buat', CreatedOrderStatusHandler);
    messageDispatcher.register('konfirmasi-data', ConfirmDataStatusHandler);     // confirma-dados -> konfirmasi-data
    messageDispatcher.register('data-alamat', OrderAddressHandler);             // endereco-dados -> data-alamat
    messageDispatcher.register('biaya-ongkir', OrderTaxaDeliveryHandler);       // taxa-entrega -> biaya-ongkir
    messageDispatcher.register('data-pengiriman', OrderDeliveryDataHandler);    // entrega-dados -> data-pengiriman
    messageDispatcher.register('data-pembayaran', OrderPaymentHandler);         // pagamento-dados -> data-pembayaran
    messageDispatcher.register('pix-pending', OrderPaymentRequired);            // pix-pendente -> pix-pending
    messageDispatcher.register('produksi', OrderProductionStatusHandler);       // producao -> produksi
    messageDispatcher.register('pengiriman', DeliveryOrderStatusHandler);       // entrega -> pengiriman
    messageDispatcher.register('ambil-sendiri', RetiradaOrderStatusHandler);    // retirada -> ambil-sendiri
    messageDispatcher.register('selesai', OrderFinishedStatusHandler);          // finalizado -> selesai
     // produk
    messageDispatcher.register('pesan', CreateOrderByCodeCommandHandler);
    messageDispatcher.register('tambahproduk', AddProductCommandHandler);
    messageDispatcher.register('cekstok', CheckStockCommandHandler);
    messageDispatcher.register('listproduk', ListProductCommandHandler);
    messageDispatcher.register('updateproduk', UpdateProductCommandHandler);
    messageDispatcher.register('hapusproduk', DeleteProductCommandHandler);
    console.log('✅ Handler pesan berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Error saat inisialisasi handler pesan:', error);
    throw error;
  }
};

// Initialize handlers once
initializeHandlers();

/* ----- registrasi handler tetap sama (initializeHandlers) ----- */

export const MessageHandler = async (message: Message, client: any): Promise<void> => {
  try {
    /* ---------- logging awal ---------- */
    if (message.fromMe) return;          // abaikan pesan dari bot sendiri

    const isOrder   = message.type === 'order';
    const isCommand = message.body?.startsWith('#') ?? false;
    const command   = isCommand
      ? message.body.slice(1).split(' ')[0].toLowerCase()
      : '';

    /* ---------- 1) command  ---------- */
    if (isCommand) {
      // Daftar command yang memerlukan order aktif
      const commandNeedsOrder = [
        'ok', 'lihat', 'update', 'bayar', 'batal', 
        'selesai', 'konfirmasi-data', 'data-alamat',
        'biaya-ongkir', 'data-pengiriman', 'data-pembayaran',
        'pix-pending', 'produksi', 'pengiriman', 'ambil-sendiri'
      ];

      // Jika command membutuhkan order tapi order belum ada → beri tahu user
      if (commandNeedsOrder.includes(command)) {
        const hasOrder = await OrderMessageHandler.CheckExistsOrderToUser(message);
        if (!hasOrder) {
          await message.reply('⚠️ Anda belum memiliki pesanan yang aktif. ' +
                            'Kirim keranjang atau ketik *#pesan* untuk membuat pesanan baru.');
          return;
        }
      }

      // Semua command lainnya akan langsung diproses tanpa perlu cek order
      console.log('🔧 Memproses perintah:', command);
      await messageDispatcher.dispatch(command, message, client);
      return;
    }

    /* ---------- 2) pesan ORDER dari katalog ---------- */
    if (isOrder) {
      await messageDispatcher.dispatch('order', message, client);
      return;
    }

    /* ---------- 3) pesan chat biasa ---------- */
    await messageDispatcher.dispatch('chat', message, client);

  } catch (error) {
    console.error('❌ Error di MessageHandler:', error);
    try {
      await message.reply('❌ Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.');
    } catch { /* diam */ }
  }
};
