import { client } from './services/whatsapp';
import { MessageHandler } from './app/bot';
import api from './app/api';
import * as qrcode from 'qrcode-terminal';
import detect from 'detect-port'; // <-- Tambahan

const DEFAULT_PORT = parseInt(process.env.PORT || '3000');

console.log('🔄 Menginisialisasi WhatsApp client...');
console.log('✅ Handler pesan berhasil diinisialisasi');

// Event handlers
client.on('qr', async (qr) => {
  console.log('📱 QR Code di-generate, silakan scan!');
  qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ Loading: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
  console.log('✅ Autentikasi berhasil!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Autentikasi gagal:', msg);
  process.exit(1);
});

client.on('ready', async () => {
  console.log('🚀 WhatsApp bot siap digunakan!');
  try {
    const info = client.info;
    console.log('📱 Terhubung sebagai:', info?.pushname || 'Unknown');
    console.log('📞 Nomor:', info?.wid?.user || 'Unknown');
    console.log('🟢 Status: Bot aktif dan menunggu pesan...');
  } catch (error) {
    console.error('❌ Error saat mengambil info client:', error);
  }
});

client.on('message', async (message) => {
  if (!message.fromMe) {
    console.log('📩 Pesan masuk:', {
      dari: message.from,
      tipe: message.type,
      isi: message.body,
      waktu: new Date().toLocaleTimeString('id-ID')
    });

    await MessageHandler(message);
  }
});

client.on('disconnected', (reason) => {
  console.log('❌ Terputus dari WhatsApp:', reason);
  console.log('🔄 Mencoba reconnect...');
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

client.on('change_state', (state) => {
  console.log('🔄 Status berubah:', state);
});

client.on('error', (error) => {
  console.error('❌ Error WhatsApp client:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Menghentikan bot...');
  await client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Menghentikan bot...');
  await client.destroy();
  process.exit(0);
});

console.log('🔄 Memulai inisialisasi client...');

client.initialize().catch((error) => {
  console.error('❌ Error saat inisialisasi:', error);
  process.exit(1);
});

// Cek port sebelum listen
detect(DEFAULT_PORT)
  .then((availablePort) => {
    if (availablePort === DEFAULT_PORT) {
      api.listen(DEFAULT_PORT, () =>
        console.log(`✅ Server berjalan di http://localhost:${DEFAULT_PORT}`)
      );
    } else {
      console.error(`❌ Port ${DEFAULT_PORT} sudah digunakan.`);
      console.log(`🔁 Coba jalankan di port lain misalnya: ${availablePort}`);
      // Bisa auto-jalan di port lain jika ingin:
      // api.listen(availablePort, () =>
      //   console.log(`✅ Server dijalankan di port alternatif http://localhost:${availablePort}`)
      // );
    }
  })
  .catch((err) => {
    console.error('❌ Gagal mengecek port:', err);
    process.exit(1);
  });
