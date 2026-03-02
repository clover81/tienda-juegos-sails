module.exports = {
  attributes: {
    id: { type: 'number', autoIncrement: true },

    name: { type: 'string', required: true, unique: true, maxLength: 80 },

    // 1 categoría -> muchos juegos
    games: { collection: 'game', via: 'category' }
  },
};

