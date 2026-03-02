module.exports = {
  seed: async function (req, res) {
    const catCount = await Category.count();
    if (catCount > 0) return res.ok('Seed ya aplicado');

    const estrategia = await Category.create({ name: 'Estrategia' }).fetch();
    const familiar = await Category.create({ name: 'Familiar' }).fetch();

    await Game.createEach([
      { name: 'Catan', price: 35.99, vat: 21, stock: 10, category: estrategia.id },
      { name: 'Carcassonne', price: 29.95, vat: 21, stock: 8, category: familiar.id },
      { name: 'Azul', price: 39.5, vat: 21, stock: 5, category: familiar.id },
    ]);

    return res.ok('Seed OK');
  }
};
