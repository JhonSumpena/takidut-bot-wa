import { Message, Buttons } from 'whatsapp-web.js';
import { client } from '../../../../services/whatsapp';
import { redisClient } from '../../../../services/redis';

export const HelpCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    const contact = await msg.getContact();

    // Kirim pesan bantuan dengan quick reply buttons
    const helpButtons = new Buttons(
      `Halo ${contact.pushname}! 👋\n\nApakah Anda membutuhkan bantuan? Pilih kategori bantuan di bawah ini atau hubungi admin langsung:`,
      [
        { body: '🛒 Cara Berbelanja', id: '#help-belanja' },
        { body: '📦 Cek Status Pesanan', id: '#lihat' },
        { body: '💬 Hubungi Admin', id: '#hubungi-admin' }
      ],
      '🆘 Pusat Bantuan',
      'Tim support siap membantu Anda!'
    );

    await chat.sendMessage(helpButtons);

    // Jika user pilih hubungi admin, jalankan logic lama
    if (msg.body.includes('hubungi-admin') || msg.body === '#bantuan') {
      return this.contactAdmin(msg, contact);
    }

    return msg;
  },

  // Method terpisah untuk menghubungi admin (logic lama)
  async contactAdmin(msg: Message, contact?: any): Promise<Message> {
    if (!contact) {
      contact = await msg.getContact();
    }
    
    const chat = await msg.getChat();
    
    await chat.sendMessage(`Baik, kami akan menghubungkan Anda dengan admin kami. 
    \n\nTunggu beberapa saat sampai salah satu Admin kami merespons dan menyelesaikan masalah Anda.`);

    const message_to_reply = `🆘 PERMINTAAN BANTUAN BARU!
    \n👤 Nama: *${contact.pushname}*
    \n📱 Nomor: ${await contact.getFormattedNumber()}
    \n💬 Pesan: ${msg.body}
    \n⏰ Waktu: ${new Date().toLocaleString('id-ID')}
    \n\n⚡ Silakan balas pesan ini untuk membantu pelanggan!`;

    // Ambil semua admin dan kirim ke semuanya
    const adminList = process.env.ADMINS ? process.env.ADMINS.split(',').map(admin => admin.trim()) : [];
    
    if (adminList.length === 0) {
      console.error('❌ Tidak ada admin yang dikonfigurasi di ADMINS env');
      return msg.reply('❌ Sistem bantuan sedang bermasalah. Silakan coba lagi nanti.');
    }

    // Gunakan admin pertama untuk Redis session
    const primaryAdmin = adminList[0];

    const atendimento_object = {
      atendido: msg.from,
      atendente: primaryAdmin,
      timestamp: Date.now()
    };

    // Set dengan expiry 10 menit untuk session bantuan
    try {
      await redisClient.set('bantuan:' + msg.from, 'true', { EX: 600 });
      await redisClient.set('bantuan:' + primaryAdmin, 'true');
      await redisClient.set(
        'bantuan:' + primaryAdmin + ':' + contact.pushname.toLowerCase(),
        JSON.stringify(atendimento_object),
      );
    } catch (redisError) {
      console.error('❌ Redis error:', redisError);
    }

    console.log('🆘 Permintaan bantuan dari:', contact.pushname, msg.from);
    console.log('📤 Mengirim notifikasi ke', adminList.length, 'admin(s)');

    // Kirim pesan ke semua admin
    const sendPromises = adminList.map(adminNumber => {
      console.log('📤 Kirim ke admin:', adminNumber);
      return client.sendMessage(adminNumber, message_to_reply);
    });

    try {
      await Promise.all(sendPromises);
      console.log('✅ Notifikasi berhasil dikirim ke semua admin');
      
      // Kirim konfirmasi dengan quick actions
      const confirmButtons = new Buttons(
        '✅ Permintaan bantuan Anda telah dikirim ke tim admin!\n\nSementara menunggu, Anda bisa:',
        [
          { body: '📋 Cek Pesanan Saya', id: '#lihat' },
          { body: '🛒 Lihat Katalog', id: '#katalog' },
          { body: '❓ FAQ', id: '#faq' }
        ],
        'Bantuan Terkirim',
        'Admin akan segera merespons'
      );
      
      return await chat.sendMessage(confirmButtons);
      
    } catch (error) {
      console.error('❌ Error mengirim notifikasi ke admin:', error);
      return msg.reply('❌ Terjadi kesalahan saat mengirim permintaan bantuan. Silakan coba lagi.');
    }
  }
};

// Handler untuk command bantuan spesifik
export const HelpCategoryHandler = {
  async execute(msg: Message): Promise<Message> {
    const body = msg.body.toLowerCase();
    
    if (body.includes('help-belanja') || body.includes('cara-belanja')) {
      return this.sendShoppingHelp(msg);
    }
    
    if (body.includes('hubungi-admin')) {
      return HelpCommandHandler.contactAdmin(msg);
    }
    
    return msg;
  },

  async sendShoppingHelp(msg: Message): Promise<Message> {
    const shoppingButtons = new Buttons(
      `🛒 **PANDUAN BERBELANJA**\n\n1️⃣ Ketik *#katalog* untuk melihat produk\n2️⃣ Ketik *#cekstok [kode]* untuk cek stok\n3️⃣ Ketik *#pesan* untuk mulai berbelanja\n4️⃣ Ikuti instruksi untuk menyelesaikan pesanan\n\nButuh bantuan lebih lanjut?`,
      [
        { body: '📱 Lihat Katalog', id: '#katalog' },
        { body: '🛒 Mulai Belanja', id: '#pesan' },
        { body: '💬 Hubungi Admin', id: '#hubungi-admin' }
      ],
      'Panduan Berbelanja',
      'Mudah dan cepat!'
    );

    return msg.reply(shoppingButtons);
  }
};

// Handler untuk FAQ
export const FAQHandler = {
  async execute(msg: Message): Promise<Message> {
    const faqButtons = new Buttons(
      `❓ **FREQUENTLY ASKED QUESTIONS**\n\nPilih pertanyaan yang ingin Anda ketahui:`,
      [
        { body: '💰 Cara Pembayaran', id: '#faq-bayar' },
        { body: '🚚 Info Pengiriman', id: '#faq-kirim' },
        { body: '🔄 Kebijakan Return', id: '#faq-return' }
      ],
      'FAQ - Pertanyaan Umum',
      'Jawaban instan untuk Anda'
    );

    return msg.reply(faqButtons);
  },

  async handleFAQResponse(msg: Message): Promise<Message> {
    const body = msg.body.toLowerCase();
    
    if (body.includes('faq-bayar')) {
      const paymentInfo = `💰 **CARA PEMBAYARAN**\n\n✅ Transfer Bank\n✅ E-Wallet (GoPay, OVO, DANA)\n✅ COD (Cash on Delivery)\n\n💡 Setelah transfer, kirim bukti pembayaran untuk konfirmasi otomatis!`;
      
      const paymentButtons = new Buttons(
        paymentInfo,
        [
          { body: '🛒 Mulai Belanja', id: '#pesan' },
          { body: '📞 Hubungi Admin', id: '#hubungi-admin' },
          { body: '🔙 Kembali ke FAQ', id: '#faq' }
        ],
        'Info Pembayaran'
      );
      
      return msg.reply(paymentButtons);
    }
    
    if (body.includes('faq-kirim')) {
      const shippingInfo = `🚚 **INFO PENGIRIMAN**\n\n📦 Ongkir dihitung otomatis\n⏰ Estimasi 1-3 hari kerja\n🏪 Bisa ambil sendiri di toko\n📍 Cek lokasi dengan *#info*`;
      
      return msg.reply(shippingInfo);
    }
    
    if (body.includes('faq-return')) {
      const returnInfo = `🔄 **KEBIJAKAN RETURN**\n\n✅ Return dalam 7 hari\n✅ Barang masih dalam kondisi baik\n✅ Ada bukti pembelian\n\n📞 Hubungi admin untuk proses return`;
      
      return msg.reply(returnInfo);
    }
    
    return msg;
  }
};