module.exports = {
  // GET /categorias
  index: async function (req, res) {
    const categories = await Category.find().sort('name ASC');
    return res.view('category/index', { title: 'Categorías', categories });
  }
};
