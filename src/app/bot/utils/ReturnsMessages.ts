const greeting_messages = [
  'halo',
  'hai',
  'haii',
  'haiii',
  'haiiii',
  'hola',
  'selamat',
  'pagi',
  'siang', 
  'sore',
  'malam',
  'hey',
  'hei',
  'hi',
  'selamat pagi',
  'selamat siang',
  'selamat sore',
  'selamat malam',
];

const greeting_message_to_reply = `Halo! Senang bertemu dengan Anda. Selamat datang di saluran layanan dan belanja ⭐ *[nama perusahaan]* ⭐
  \nRobot kami bekerja *24 jam sehari* dan *7 hari seminggu*, untuk memberikan layanan terbaik kepada pelanggan kami.
  \nSeluruh *proses pembelian* dilakukan melalui WhatsApp secara otomatis, cukup *akses katalog kami di sini* [link katalog] -> kirim *keranjang dengan produk* yang ingin Anda beli dan kami akan mengurus sisanya untuk Anda ;).
  \nUntuk mempelajari cara mengirim keranjang dan berbelanja di toko kami, ketik: *#keranjang* 
  \nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut.`;

const created_status_message = `Wah, bagus sekali. Anda sudah membuat pesanan dengan mengirimkan keranjang kepada kami.
\nUntuk melanjutkan, cukup ketik *#ok* atau kirimkan *keranjang baru* dan kami akan mengurus sisanya untuk Anda ;).
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const confirm_data_status = `Hmm, saya periksa di sini dan Anda belum mengkonfirmasi data pesanan Anda.
\nUntuk itu ketik: *ya* (lanjutkan pesanan) atau *tidak* (perbarui keranjang)
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const confirm_address_data = `Ayo! Tinggal sedikit lagi untuk menyelesaikan pesanan Anda. Ketik metode yang ingin Anda gunakan untuk menerima pembelian Anda
\nCukup ketik *Pengiriman* atau *Ambil Sendiri*
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const confirm_bairro_data = `Tinggal sedikit lagi untuk menyelesaikan pesanan Anda.
\nKetik angka dari *1 sampai 5* yang sesuai dengan wilayah Anda!
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const confirm_delivery_data = `Ayo! Tinggal sedikit lagi untuk menyelesaikan pesanan Anda. Saya menemukan metode pengiriman yang Anda pilih di sini.
\nSilakan kirimkan data *lokasi* Anda untuk menerima pesanan Anda dengan nyaman di rumah.
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const confirm_payment_data = `Anda berada di tahap terakhir untuk menyelesaikan pesanan Anda.
\nSilakan kirimkan metode pembayaran pilihan Anda: *Kartu*, *Tunai* atau *Transfer*`;

const production_status_message = `Wah, bagus 🥳🥳. Saya periksa di sini dan melihat bahwa Anda memiliki pesanan yang sedang disiapkan dengan hati-hati oleh produksi kami. 🧰
\nAnda akan *diberitahu* ketika pesanan siap untuk pengiriman atau pengambilan.
\nUntuk melihat pesanan Anda ketik: *#lihat*
\nUntuk membuat pesanan baru kirimkan keranjang lain (Anda dapat melakukan ini sebanyak yang Anda mau :>): *#keranjang*
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const entrega_status_message = `Wah, bagus 🥳🥳. Saya periksa di sini dan melihat bahwa pesanan Anda sedang dalam perjalanan ke lokasi Anda. Kami akan memberitahu jika ada pembaruan!
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const retirada_status_message = `Wah, bagus 🥳🥳. Saya periksa di sini dan melihat bahwa Anda memiliki pesanan yang siap untuk diambil. Kami menunggu Anda.
\nUntuk mengetahui lebih lanjut tentang pesanan Anda ketik: *#lihat*
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const payment_required_message = `Ayo! Tinggal sedikit lagi untuk mendapatkan produk Anda, lakukan pembayaran untuk mulai menyiapkan pesanan Anda.
\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const production_message = `Yeay!! Pesanan Anda telah dikirim ke produksi, Anda akan diberitahu ketika siap untuk pengiriman atau pengambilan.
\n\nKami sangat berterima kasih atas kepercayaan Anda. ❤️
\nIkuti kami di media sosial agar tidak ketinggalan update terbaru:
👉Instagram - [link instagram]
👉Facebook - [link Facebook]  
👉WhatsApp - [link kontak]
\nBagikan!`;

const finished_order_message = `Kami sangat senang dengan pembelian Anda di toko kami. Terima kasih telah menggunakan layanan kami, kami bekerja agar pengalaman Anda bersama kami menjadi yang terbaik!
\nSekarang Anda dapat membuat pesanan baru: *#keranjang*
\nDan melihat pesanan yang sudah selesai: *#lihat*

\n\nAnda juga dapat mengetik *#tanya* untuk informasi lebih lanjut`;

const last_option_message = `Aduh, maaf. Saya tidak mengerti :/ \nTapi tidak apa-apa.
\n\nAnda dapat mengetik *#tanya* untuk informasi lebih lanjut tentang kami.`;

export {
  greeting_messages,
  greeting_message_to_reply,
  production_status_message,
  last_option_message,
  created_status_message,
  confirm_data_status,
  confirm_address_data,
  confirm_delivery_data,
  confirm_payment_data,
  confirm_bairro_data,
  production_message,
  payment_required_message,
  finished_order_message,
  entrega_status_message,
  retirada_status_message,
};