import db from '../../database/connection';

export const queryProduct = {
  async insertProduct(data: {
    name: string;
    kode_barang: string;
    price: number;
    stock: number;
  }) {
    return db('products').insert(data);
  },

  async getProductByCode(kode_barang: string) {
    return db('products').where({ kode_barang }).first();
  },

  async getAllProducts() {
    return db('products').select('*');
  },

  async updateProduct(kode_barang: string, data: {
    name?: string;
    price?: number;
    stock?: number;
  }) {
    return db('products').where({ kode_barang }).update(data);
  },

  async deleteProduct(kode_barang: string) {
    return db('products').where({ kode_barang }).del();
  },

  async updateProductStock(kode_barang: string, newStock: number) {
    return db('products').where({ kode_barang }).update({ stock: newStock });
  },

  async searchProductsByName(searchTerm: string) {
    return db('products').where('name', 'like', `%${searchTerm}%`);
  }
};