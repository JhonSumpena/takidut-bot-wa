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

export const MessageHandler = async (message: Message): Promise<void> => {
  try {
    console.log('📨 Pesan diterima:', {
      from: message.from,
      type: message.type,
      body: message.body?.substring(0, 100) + (message.body?.length > 100 ? '...' : ''),
      fromMe: message.fromMe
    });

    console.log('🔍 Debug isi pesan:', {
      body: message.body,
      type: message.type,
      fromMe: message.fromMe,
    });

    // Skip messages from bot itself
    if (message.fromMe) {
      console.log('⏭️ Melewati pesan dari bot');
      return;
    }

    let dispatchName = '';
    const isOrder = message.type === 'order';
    const isCommand = message.body?.startsWith('#');
    console.log('🔍 isOrder:', isOrder, 'isCommand:', isCommand);


    // Determine dispatch name based on message context
    if (isCommand) {
      // Handle commands (messages starting with #)
      dispatchName = message.body.slice(1);
      console.log('🔧 Memproses perintah:', dispatchName);
    } else if (await OrderMessageHandler.CheckExistsOrderToUser(message) && !isOrder) {
      // Handle order status flow
      const orderStatus = await OrderMessageHandler.getStatusOrder(message);
      dispatchName = orderStatus;
      console.log('📋 Memproses status pesanan:', dispatchName);
    } else {
      // Handle regular messages or new orders
      dispatchName = message.type;
      console.log('💬 Memproses tipe pesan:', dispatchName);
    }

    // Dispatch message to appropriate handler
    if (dispatchName) {
      console.log('🚀 Mengirim ke handler:', dispatchName);
      await messageDispatcher.dispatch(dispatchName, message);
    } else {
      console.log('⚠️ Tidak ada nama dispatch yang ditentukan untuk pesan ini');
    }

  } catch (error) {
    console.error('❌ Error di MessageHandler:', error);
    
    // Opsional: Kirim pesan error ke user
    try {
      await message.reply('❌ Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.');
    } catch (replyError) {
      console.error('❌ Error saat mengirim balasan error:', replyError);
    }
  }
};