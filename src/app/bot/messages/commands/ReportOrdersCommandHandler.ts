import { Message } from 'whatsapp-web.js';
import { queryOrder } from '../../../usecases/query-orders';
import { HelperCommands } from '../../utils/HelperCommands';
import HelperCurrency from '../../utils/HelperCurrency';

export const ReportOrdersCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply(
        'Maaf! Anda tidak memiliki izin untuk menggunakan perintah ini. ❌',
      );
    }

    const report = `*LAPORAN PESANAN* 
    \nJumlah pesanan 📋: *${await queryOrder.selectTotalOrders()}*
      Sedang diproduksi ⌛️: *${await queryOrder.selectAndCountByStatus('producao')}*
      Selesai ✅: *${await queryOrder.selectAndCountByStatus('finalizado')}*
      Pengiriman 🚚: *${await queryOrder.selectAndCountByStatus('entrega')}*
      Ambil sendiri 🛎: *${await queryOrder.selectAndCountByStatus('retirada')}*
      Belum dibayar 📲: *${await queryOrder.selectByPaymentStatus('pendente')}*
    \nTotal *Rp* pesanan:
      Terjual 📈: *${HelperCurrency.priceToString(
        await queryOrder.selectTotalSumOrders(),
      )}*
      Sudah diterima ✅: *${HelperCurrency.priceToString(
        await queryOrder.selectByPaymentStatusAndSum('pago'),
      )}*
      Belum dibayar ❗️: *${HelperCurrency.priceToString(
        await queryOrder.selectByPaymentStatusAndSum('pendente'),
      )}*
    `;

    return msg.reply(report);
  },
};