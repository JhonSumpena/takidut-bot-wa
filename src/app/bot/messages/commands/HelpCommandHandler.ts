import { Message } from 'whatsapp-web.js';
import { client } from '../../../../services/whatsapp';
import { redisClient } from '../../../../services/redis';

// Ambil nomor admin dari environment variable
const ADMIN_NUMBER = process.env.ADMINS || '89630152908@c.us';

export const HelpCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    const contact = await msg.getContact();

    chat.sendMessage(`Wah, sayang sekali :(. Tidak menemukan yang Anda butuhkan dengan mengetik *#tanya*? Jangan khawatir, kami akan memperbaikinya.
    \n\nTunggu beberapa saat sampai salah satu customer service kami merespons dan menyelesaikan masalah Anda.`);

    const message_to_reply = `HALO! [nama perusahaan] butuh customer service di WhatsApp Business. Mau biarkan pelanggan menunggu?
    \nNama yang meminta bantuan: *${contact.pushname}*
    \nNomor: ${await contact.getFormattedNumber()}
    \nDengan pesan: ${msg.body}`;

    const atendimento_object = {
      atendido: msg.from,
      atendente: ADMIN_NUMBER, // Menggunakan env variable
    };

    // Set dengan expiry 10 menit untuk session bantuan
    redisClient.set('bantuan:' + msg.from, 'true', { EX: 600 });
    redisClient.set('bantuan:' + ADMIN_NUMBER, 'true');
    redisClient.set(
      'bantuan:' + ADMIN_NUMBER + ':' + contact.pushname.toLowerCase(),
      JSON.stringify(atendimento_object),
    );

    console.log('🆘 Permintaan bantuan dari:', contact.pushname, msg.from);

    return await client.sendMessage(ADMIN_NUMBER, message_to_reply);
  },
};