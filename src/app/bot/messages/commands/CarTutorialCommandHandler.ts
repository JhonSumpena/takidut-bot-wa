import { Message, MessageMedia } from 'whatsapp-web.js';

export const CarTutorialCommandHandler = {
  async execute(msg: Message): Promise<Message> {
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const media = MessageMedia.fromFilePath(
      'src/app/bot/messages/commands/video4985596413699162693.mp4',
    );

    await chat.sendMessage(
      `Bagus sekali 😁. Terima kasih atas minat Anda untuk melakukan pembelian dengan kami. Itulah sebabnya kami telah menyiapkan tutorial mini yang akan dikirimkan kepada Anda dalam beberapa saat tentang cara melakukannya di Whatsapp.`,
    );

    // Tunggu beberapa detik jika ingin efek jeda natural (opsional)
     await new Promise(res => setTimeout(res, 5000));

    return chat.sendMessage(media);
  },
};
