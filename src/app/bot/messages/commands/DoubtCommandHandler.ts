import type { Message } from 'whatsapp-web.js';

export const DoubtCommandHandler = {
  async execute(msg: Message, client?: any): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

     await msg.reply(`Siapa kami?
👉 Kami adalah anak gembala, selalu riang
\nBagaimana cara membeli produk?
👉 Anda dapat memilih barang yang Anda inginkan dari IG kami untuk dapatkan kode barang, lalu ketik *#pesan* [jumlah] [kodebarang]
👉 Gunakan koma [,] jika belanja lebih dari 1 produk berbeda
\nApa yang dapat saya lakukan di Whatsapp?
👉 Buat pesanan dan lakukan pembelian secara otomatis: *#pesan*
    `); 

//👉 Kedua anda dapat memilih barang yang Anda inginkan dari katalog kami dan mengirimkan keranjang belanja yang sudah terisi. Untuk melihat cara melakukannya, ketik *#keranjang*
//👉 Buat pesanan dan lakukan pembelian secara otomatis: *#keranjang* jika melalui katalog WA
    // Kirim interactive buttons (format terbaru, bukan deprecated)
    if (client) {
      const chatId = msg.from;
      await client.sendMessage(chatId, {
        text: 'Pilih menu di bawah ini untuk melanjutkan:',
        buttons: [
          { type: 1, buttonId: 'bantuan', buttonText: { displayText: 'Bantuan' } },
          { type: 1, buttonId: 'pesan', buttonText: { displayText: 'Pesan Barang' } },
          { type: 1, buttonId: 'keranjang', buttonText: { displayText: 'Keranjang' } }
        ],
        footer: 'Silakan pilih salah satu tombol di atas.'
      });
    }
    return msg;
  },
};
