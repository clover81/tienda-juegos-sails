module.exports = {
  // GET /juegos/:id
  show: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id }).populate('category');
    if (!game) return res.notFound();

    return res.view('game/show', { title: game.name, game });
  }
};
