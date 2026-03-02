module.exports = {

  // GET /
  index: async function (req, res) {
    const selectedCategoryId = null;

    const categories = await Category.find().sort('name ASC');

    const games = await Game.find()
      .populate('category')
      .sort('name ASC');

    const totalGames = await Game.count(); // total global

    return res.view('home/index', {
      categories,
      games,
      selectedCategoryId,
      totalGames
    });
  },

  // GET /categoria/:id
  byCategory: async function (req, res) {
    const selectedCategoryId = req.params.id;

    const categories = await Category.find().sort('name ASC');

    const games = await Game.find({ category: selectedCategoryId })
      .populate('category')
      .sort('name ASC');

    const totalGames = await Game.count({ category: selectedCategoryId }); // total filtrado

    return res.view('home/index', {
      categories,
      games,
      selectedCategoryId,
      totalGames
    });
  },

  // GET /acerca
  about: async function (req, res) {
    return res.view('home/about');
  }

};


