const path = require('path');
const fs = require('fs/promises');

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function basenameSafe(p) {
  if (!p) return null;
  return path.basename(String(p));
}

async function unlinkIfExists(filePath) {
  try { await fs.unlink(filePath); } catch (_) {}
}

module.exports = {
  // GET /admin/juegos
  index: async function (req, res) {
    const games = await Game.find().populate('category').sort('name ASC');
    return res.view('admin/games/index', { title: 'Admin - Juegos', games });
  },

  // GET /admin/juegos/new
  new: async function (req, res) {
    const categories = await Category.find().sort('name ASC');

    return res.view('admin/games/form', {
      title: 'Nuevo juego',
      error: null,
      categories,
      game: null,
      action: '/admin/juegos',
      submitText: 'Crear',
    });
  },

  // POST /admin/juegos
  create: async function (req, res) {
    const categories = await Category.find().sort('name ASC');

    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const category = req.body.category;

    const price = toNumber(req.body.price);
    const vat = toNumber(req.body.vat, 21);
    const stock = toNumber(req.body.stock, 0);

    if (
      !name || !category ||
      !Number.isFinite(price) || price < 0 ||
      !Number.isFinite(vat) || vat < 0 || vat > 100 ||
      !Number.isFinite(stock) || stock < 0
    ) {
      return res.view('admin/games/form', {
        title: 'Nuevo juego',
        error: 'Revisa los campos: nombre, categoría, precio (>=0), IVA (0-100), stock (>=0).',
        categories,
        game: { name, description, category, price: req.body.price, vat: req.body.vat, stock: req.body.stock, image: null },
        action: '/admin/juegos',
        submitText: 'Crear',
      });
    }

    // Upload
    let image = null;
    try {
      image = await sails.helpers.uploadImage.with({ req });
      // asegura que SIEMPRE guardamos solo el nombre, nunca rutas
      image = basenameSafe(image);
    } catch (e) {
      const msg =
        e.message === 'EXT_NOT_ALLOWED' ? 'Formato no permitido. Usa jpg, png, webp o gif.' :
        e.message === 'MIME_NOT_IMAGE' ? 'El archivo no parece una imagen.' :
        'Error subiendo la imagen (¿demasiado grande?).';

      return res.view('admin/games/form', {
        title: 'Nuevo juego',
        error: msg,
        categories,
        game: { name, description, category, price: req.body.price, vat: req.body.vat, stock: req.body.stock, image: null },
        action: '/admin/juegos',
        submitText: 'Crear',
      });
    }

    await Game.create({
      name,
      description: description || null,
      category,
      price,
      vat,
      stock,
      image,
    });

    return res.redirect('/admin/juegos');
  },

  // GET /admin/juegos/:id/edit
  edit: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) return res.notFound();

    const categories = await Category.find().sort('name ASC');

    return res.view('admin/games/form', {
      title: 'Editar juego',
      error: null,
      categories,
      game,
      action: `/admin/juegos/${game.id}`,
      submitText: 'Guardar',
    });
  },

  // POST /admin/juegos/:id
  update: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) return res.notFound();

    const categories = await Category.find().sort('name ASC');

    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const category = req.body.category;

    const price = toNumber(req.body.price);
    const vat = toNumber(req.body.vat, 21);
    const stock = toNumber(req.body.stock, 0);

    if (
      !name || !category ||
      !Number.isFinite(price) || price < 0 ||
      !Number.isFinite(vat) || vat < 0 || vat > 100 ||
      !Number.isFinite(stock) || stock < 0
    ) {
      return res.view('admin/games/form', {
        title: 'Editar juego',
        error: 'Revisa los campos: nombre, categoría, precio (>=0), IVA (0-100), stock (>=0).',
        categories,
        game: { ...game, name, description, category, price: req.body.price, vat: req.body.vat, stock: req.body.stock },
        action: `/admin/juegos/${game.id}`,
        submitText: 'Guardar',
      });
    }

    // Upload
    let newImage = null;
    try {
      newImage = await sails.helpers.uploadImage.with({ req });
      newImage = basenameSafe(newImage);
    } catch (e) {
      const msg =
        e.message === 'EXT_NOT_ALLOWED' ? 'Formato no permitido. Usa jpg, png, webp o gif.' :
        e.message === 'MIME_NOT_IMAGE' ? 'El archivo no parece una imagen.' :
        'Error subiendo la imagen (¿demasiado grande?).';

      return res.view('admin/games/form', {
        title: 'Editar juego',
        error: msg,
        categories,
        game: { ...game, name, description, category, price: req.body.price, vat: req.body.vat, stock: req.body.stock },
        action: `/admin/juegos/${game.id}`,
        submitText: 'Guardar',
      });
    }

    let image = basenameSafe(game.image);

    if (newImage) {
      // Si había imagen anterior, la borramos (compatibilidad: uploads/ y .tmp/public/uploads)
      if (image) {
        const oldAssets = path.resolve(process.cwd(), 'assets', 'uploads', image);
        const oldTmp = path.resolve(process.cwd(), '.tmp', 'public', 'uploads', image);

        await unlinkIfExists(oldAssets);
        await unlinkIfExists(oldTmp);
      }
      image = newImage;
    }

    await Game.updateOne({ id: game.id }).set({
      name,
      description: description || null,
      category,
      price,
      vat,
      stock,
      image,
    });

    return res.redirect('/admin/juegos');
  },

  // GET /admin/juegos/:id/delete
  deleteConfirm: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id }).populate('category');
    if (!game) return res.notFound();

    return res.view('admin/games/delete', { title: 'Borrar juego', game });
  },

  // POST /admin/juegos/:id/delete
  destroy: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) return res.notFound();

    const image = basenameSafe(game.image);

    if (image) {
      const imgAssets = path.resolve(process.cwd(), 'assets', 'uploads', image);
      const imgTmp = path.resolve(process.cwd(), '.tmp', 'public', 'uploads', image);

      await unlinkIfExists(imgAssets);
      await unlinkIfExists(imgTmp);
    }

    await Game.destroyOne({ id: game.id });
    return res.redirect('/admin/juegos');
  },
};
