import type { Message } from 'whatsapp-web.js';

export const DoubtCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    return msg.reply(`Siapa kami?
👉 Kami adalah anak gembala, selalu riang
\nDi mana lokasi layanan?
👉 dihatimu
\nBagaimana cara membeli produk?
👉 Anda dapat memilih barang yang Anda inginkan dari katalog kami dan mengirimkan keranjang belanja yang sudah terisi. Untuk melihat cara melakukannya, ketik *#keranjang*
\nBagaimana produk dibuat?
👉 diadon
\nApa yang dapat saya lakukan di Whatsapp?
👉 Buat pesanan dan lakukan pembelian secara otomatis: *#keranjang*
👉 Bicaralah dengan salah satu petugas kami: *#bantuan*
👉 Pelajari lebih lanjut tentang bot kami: *#bot*
\nSetelah melakukan pembelian, bagaimana cara mengelola pesanan saya? 👉 Untuk melihat pesanan Anda: *#lihat*
👉 Untuk membatalkan pesanan Anda: *#batal*
\nIkuti kami di media sosial agar Anda tidak ketinggalan berita apa pun:
👉Instagram - [tautan Instagram]
👉Whatsapp - [tautan kontak]
      `);
  },
};
