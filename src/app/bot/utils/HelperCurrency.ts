export default class HelperCurrency {
  static priceToString(price: number): string {
    const amount_1000 = price / 1000;
    return amount_1000.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
    });
  }
}