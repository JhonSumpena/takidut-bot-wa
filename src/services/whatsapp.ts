import { Client, LocalAuth } from 'whatsapp-web.js';

console.log('🔄 Menginisialisasi WhatsApp client...');
const client = new Client({
  authStrategy: new LocalAuth(), // Ganti ke LocalAuth untuk menyimpan session
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-zygote',
      '--disable-gpu',
      '--disable-features=VizDisplayCompositor',
      '--window-size=1280,800'
    ],
  },
});



export { client };