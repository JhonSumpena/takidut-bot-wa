import type { Message } from 'whatsapp-web.js';

export const AboutBotCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    return msg.reply(`Halo ✌️, nama saya *Bubble* dan saya adalah *bot* pemesanan otomatis melalui WhatsApp. Saya dibuat oleh Software Engineer *Abay* untuk memberikan nilai tambah bagi perusahaan *Magic Bubbles*.
    \nJika ingin tahu lebih lanjut tentang saya dan siapa yang mengembangkan saya, kunjungi:
    👉 Github: https://github.com/JhonSumpena
    👉 Email: abaypaparocksetar31@gmail.com
    \n\n *@Copyright Semua hak dilindungi - Abay - 2025*`);
  },
};