import { Message } from 'whatsapp-web.js';
import { HelperCommands } from '../../utils/HelperCommands';

export const UpdateOrderStatusCommand = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    if (!HelperCommands.checkIfIsAdmin(msg.from)) {
      return msg.reply(
        'Maaf! Anda tidak memiliki izin untuk menggunakan perintah ini. ❌',
      );
    }

    const splited_body = msg.body.split(' ');
    const order_id = splited_body[1];
    const status_to_update = splited_body[2];
    if (order_id === undefined || status_to_update === undefined) {
      return msg.reply(
        'Untuk memperbarui status, ketik *#update <id pesanan contoh: *5*> <status>* ❌',
      );
    }

    await HelperCommands.updateOrderStatusAndNotify(
      Number(order_id),
      status_to_update,
      msg,
    );

    return msg.reply(
      'Status pesanan berhasil diperbarui dan notifikasi telah dikirim! ✅',
    );
  },
};