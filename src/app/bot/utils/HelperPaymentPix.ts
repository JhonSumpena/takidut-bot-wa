import { Convert as ConvertQr } from '../interfaces/IQrCodeCache';
import { client } from '../../../services/whatsapp';
import { production_message } from '../utils/ReturnsMessages';
import { redisClient } from '../../../services/redis';
import { Convert, IOrder } from '../interfaces/Order';
import { HelperOrderProduction } from './HelperOrderProduction';
import { sha512 } from 'sha512-crypt-ts';
import { Message, MessageMedia } from 'whatsapp-web.js';
import { MercadoPago } from '../../../services/MercadoPago';
import { IResponse } from '../interfaces/QrCodeRequest';

export const HelperPaymentPix = {
  async updateStatusPaymentOrder(
    external_reference: string,
    status: string,
  ): Promise<boolean> {
    const cache_qrcode = await redisClient.get(
      'pagamentopix:' + external_reference,
    );

    const qrcode_obj = ConvertQr.toIQrCodeCache(cache_qrcode || '');

    const order_json = await redisClient.get(
      'order:' + qrcode_obj.message_from,
    );

    if (qrcode_obj == null || order_json == null) {
      return false;
    }

    const order_obj = Convert.toIOrder(order_json || '');

    order_obj.payment_status = status;
    order_obj.status = status === 'pago' ? 'produksi' : 'pix-pending';

    const data = JSON.stringify(order_obj).replace(/\\"/g, '"');
    await redisClient.set('order:' + qrcode_obj.message_from, data);

    if (status === 'pago') {
      await client.sendMessage(
        qrcode_obj.message_from,
        `Yeay 🥳. Pembayaran Anda telah dikonfirmasi! Anda baru saja mendapatkan pesanan Anda. Anda dapat mengetik *#lihat*`,
      );

      await client.sendMessage(qrcode_obj.message_from, production_message);

      HelperOrderProduction.create({ message_from: qrcode_obj.message_from });
    }

    return true;
  },
  async genPaymentPixFromOrder(
    order: IOrder,
    msg_from: string,
    payment_from_command?: boolean,
  ): Promise<Message> {
    await client.sendMessage(
      msg_from,
      'Tunggu beberapa saat sementara kami menyiapkan QR Code untuk pembayaran Anda 🚀',
    );

    const MercadoPagoService = MercadoPago.create({
      order_data: order,
      isOrderFromDb: payment_from_command,
    });
    const { data }: IResponse = await MercadoPagoService.generateQrCode();
    const qrcode_image = await MercadoPagoService.getImgFromQrCodeData(
      data.qr_data,
    );

    const formated_img = qrcode_image.split(',').pop();
    const media = new MessageMedia('image/png', formated_img || '');

    if (media) {
      await MercadoPagoService.saveQrCodeOnCache(data.qr_data, msg_from);

      await client.sendMessage(msg_from, media);
      await client.sendMessage(
        msg_from,
        `Anda juga dapat menggunakan Pix copy paste, dengan menyalin pesan di bawah ini dan memasukkannya ke bagian Pix di aplikasi bank Anda ;).`,
      );
      await client.sendMessage(msg_from, data.qr_data);
    } else {
      await client.sendMessage(
        msg_from,
        'Tidak dapat membuat pembayaran Pix otomatis, kami akan menghubungi Anda segera!',
      );
    }

    return await client.sendMessage(
      msg_from,
      `Terima kasih telah memilih Pix, ini membantu kami berkembang. Kami akan menunggu konfirmasi pembayaran untuk melanjutkan.`,
    );
  },

  async checkHashCallbackIsValid(
    external_reference: string,
    hash_in_notification: string,
  ): Promise<boolean> {
    const cache_qrcode = await redisClient.get(
      'pagamentopix:' + external_reference,
    );

    const qrcode_obj = ConvertQr.toIQrCodeCache(cache_qrcode || '');

    if (qrcode_obj == null) {
      return false;
    }

    if (
      sha512.crypt(hash_in_notification, 'saltsalt') != qrcode_obj.hash_callback
    ) {
      return false;
    }
    return true;
  },
};