export default class HelperStr {
  /**
   * Format pesan untuk pemeriksaan dengan menormalkan karakter dan menghapus tanda baca
   * @param message_body - Isi pesan yang akan diformat
   * @returns String yang sudah dinormalisasi tanpa aksen dan tanda koma
   */
  static formatMessageToCheck(message_body: string): string {
  return message_body
    .normalize('NFD')                         // Normalisasi Unicode
    .replace(/[\u0300-\u036f]/g, '')         // Hapus aksen
    .replace(/[^\w\s]|_/g, '')               // Hapus semua tanda baca dan simbol
    .replace(/\s+/g, ' ')                    // Gabungkan spasi berlebih
    .trim()                                  // Hapus spasi di awal/akhir
    .toLowerCase();                          // Ubah ke lowercase
}

  /**
   * Format pesan dengan membersihkan karakter khusus dan spasi berlebih
   * @param message_body - Isi pesan yang akan dibersihkan
   * @returns String yang sudah dibersihkan
   */
  static cleanMessage(message_body: string): string {
    return message_body
      .trim()                             // Hapus spasi di awal dan akhir
      .replace(/\s+/g, ' ')              // Ganti multiple spasi dengan single spasi
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  /**
   * Ekstrak command dari pesan (untuk pesan yang dimulai dengan #)
   * @param message_body - Isi pesan
   * @returns Command tanpa # atau null jika bukan command
   */
  static extractCommand(message_body: string): string | null {
    const trimmed = message_body.trim();
    if (trimmed.startsWith('#')) {
      return this.formatMessageToCheck(trimmed.slice(1));
    }
    return null;
  }

  /**
   * Cek apakah pesan mengandung kata kunci tertentu
   * @param message_body - Isi pesan
   * @param keywords - Array kata kunci yang dicari
   * @returns true jika mengandung salah satu kata kunci
   */
  static containsKeywords(message_body: string, keywords: string[]): boolean {
    const formatted_message = this.formatMessageToCheck(message_body);
    return keywords.some(keyword => 
      formatted_message.includes(this.formatMessageToCheck(keyword))
    );
  }

  /**
   * Format nomor telepon ke format standar
   * @param phone_number - Nomor telepon
   * @returns Nomor telepon yang sudah diformat
   */
  static formatPhoneNumber(phone_number: string): string {
    // Hapus semua karakter non-digit
    const digits_only = phone_number.replace(/\D/g, '');
    
    // Jika dimulai dengan 08, ganti dengan 628
    if (digits_only.startsWith('08')) {
      return '62' + digits_only.slice(1);
    }
    
    // Jika dimulai dengan 8, tambahkan 62
    if (digits_only.startsWith('8')) {
      return '62' + digits_only;
    }
    
    // Jika sudah dimulai dengan 62, return as is
    if (digits_only.startsWith('62')) {
      return digits_only;
    }
    
    return digits_only;
  }
}