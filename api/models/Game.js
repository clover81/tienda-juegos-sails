module.exports = {
  attributes: {
    id: { type: 'number', autoIncrement: true },

    name: { type: 'string', required: true, maxLength: 120 },
    price: { type: 'number', required: true, min: 0 },
    vat: { type: 'number', defaultsTo: 21, min: 0, max: 100 },
    description: { type: 'string', allowNull: true, maxLength: 2000 },
    image: { type: 'string', allowNull: true }, // filename o ruta
    stock: { type: 'number', defaultsTo: 0, min: 0 },
    autoCreatedAt: false,
    autoUpdatedAt: false,

    // muchos juegos -> 1 categoría
    category: { model: 'category', required: true }
  },
};
