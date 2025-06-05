import { Message } from 'whatsapp-web.js';
import { AnyMessageHandler } from './AnyMessageHandler';
import { OrderMessageHandler } from './OrderMessageHandler';
import type { IOrder } from '../interfaces/Order';
import OrderHandlerCache from '../cache/OrderHandlerCache';
import HelperCurrency from '../utils/HelperCurrency';
import HelperStr from '../utils/HelperStr';
import { production_message } from '../utils/ReturnsMessages';
import { HelperOrderProduction } from '../utils/HelperOrderProduction';
import { HelperPaymentPix } from '../utils/HelperPaymentPix';

export const OrderPaymentHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const paymentMethod = HelperStr.formatMessageToCheck(msg.body);

    try {
      if (paymentMethod === 'pix') {
        return await this.handlePixPayment(msg, chat);
      } else if (paymentMethod === 'kartu' || paymentMethod === 'tunai') {
        return await this.handleCashCardPayment(msg, chat, paymentMethod);
      }
    } catch (error) {
      console.error('❌ Error dalam OrderPaymentHandler:', error);
      await chat.sendMessage('Maaf, terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi.');
    }

    return AnyMessageHandler.execute(msg);
  },

  async handlePixPayment(msg: Message, chat: any): Promise<Message> {
    const paymentMethod = 'pix';
    const statusToUpdate = 'pix-pending';

    // Update payment method ke cache
    const updateSuccess = await OrderHandlerCache.updateOrderPaymentMethod(
      msg.from,
      paymentMethod,
      statusToUpdate
    );

    if (!updateSuccess) {
      console.log('❌ Error saat mengatur metode pembayaran PIX untuk:', msg.from);
      return msg.reply('Maaf, terjadi kesalahan saat memproses pembayaran PIX. Silakan coba lagi.');
    }

    // Dapatkan data order dari cache
    const order: IOrder | null = await OrderHandlerCache.getOrderFromMessage(msg.from);
    
    if (!order) {
      console.log('❌ Order tidak ditemukan untuk pembayaran PIX:', msg.from);
      return msg.reply('Maaf, tidak dapat menemukan data pesanan Anda. Silakan hubungi customer service.');
    }

    try {
      // Generate payment PIX
      await HelperPaymentPix.genPaymentPixFromOrder(order, msg.from);
      console.log('✅ PIX payment generated successfully for:', msg.from);
    } catch (error) {
      console.error('❌ Error generating PIX payment:', error);
      return msg.reply('Maaf, terjadi kesalahan saat membuat pembayaran PIX. Silakan coba lagi.');
    }

    return msg;
  },

  async handleCashCardPayment(msg: Message, chat: any, paymentMethod: string): Promise<Message> {
    const statusToUpdate = 'produksi';

    // Update payment method ke cache
    const updateSuccess = await OrderHandlerCache.updateOrderPaymentMethod(
      msg.from,
      paymentMethod,
      statusToUpdate
    );

    if (!updateSuccess) {
      console.log(`❌ Error saat mengatur metode pembayaran ${paymentMethod} untuk:`, msg.from);
      return msg.reply(`Maaf, terjadi kesalahan saat memproses pembayaran ${paymentMethod}. Silakan coba lagi.`);
    }

    // Dapatkan data order dari cache
    const order: IOrder | null = await OrderHandlerCache.getOrderFromMessage(msg.from);
    
    if (!order) {
      console.log(`❌ Order tidak ditemukan untuk pembayaran ${paymentMethod}:`, msg.from);
      return msg.reply('Maaf, tidak dapat menemukan data pesanan Anda. Silakan hubungi customer service.');
    }

    try {
      // Kirim konfirmasi pembayaran
      const paymentMethodText = paymentMethod === 'kartu' ? 'kartu' : 'tunai';
      await chat.sendMessage(
        `Terima kasih. Anda akan melakukan pembayaran sebesar *${HelperCurrency.priceToString(
          Number(order.total),
        )}* dengan ${paymentMethodText} saat pengiriman atau pengambilan.`,
      );

      // Buat order production
      await HelperOrderProduction.create({ message_from: msg.from });
      
      console.log(`✅ ${paymentMethod} payment processed successfully for:`, msg.from);

      return msg.reply(production_message);
    } catch (error) {
      console.error(`❌ Error processing ${paymentMethod} payment:`, error);
      return msg.reply(`Maaf, terjadi kesalahan saat memproses pembayaran ${paymentMethod}. Silakan coba lagi.`);
    }
  },
};