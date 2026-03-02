module.exports = {
  // GET /admin/categorias
  index: async function (req, res) {
    const categories = await Category.find().sort('name ASC');
    return res.view('admin/categories/index', { title: 'Admin - Categorías', categories });
  },

  // GET /admin/categorias/new
  new: async function (req, res) {
    return res.view('admin/categories/form', {
      title: 'Nueva categoría',
      error: null,
      values: { name: '' },
      action: '/admin/categorias',
      submitText: 'Crear'
    });
  },

  // POST /admin/categorias
  create: async function (req, res) {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.view('admin/categories/form', {
        title: 'Nueva categoría',
        error: 'El nombre es obligatorio.',
        values: { name: name || '' },
        action: '/admin/categorias',
        submitText: 'Crear'
      });
    }

    try {
      await Category.create({ name: name.trim() });
      return res.redirect('/admin/categorias');
    } catch (e) {
      return res.view('admin/categories/form', {
        title: 'Nueva categoría',
        error: 'No se pudo crear (¿nombre duplicado?).',
        values: { name },
        action: '/admin/categorias',
        submitText: 'Crear'
      });
    }
  },

  // GET /admin/categorias/:id/edit
  edit: async function (req, res) {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) return res.notFound();

    return res.view('admin/categories/form', {
      title: 'Editar categoría',
      error: null,
      values: { name: category.name },
      action: `/admin/categorias/${category.id}`,
      submitText: 'Guardar'
    });
  },

  // POST /admin/categorias/:id
  update: async function (req, res) {
    const { name } = req.body;
    const category = await Category.findOne({ id: req.params.id });
    if (!category) return res.notFound();

    if (!name || !name.trim()) {
      return res.view('admin/categories/form', {
        title: 'Editar categoría',
        error: 'El nombre es obligatorio.',
        values: { name: name || '' },
        action: `/admin/categorias/${category.id}`,
        submitText: 'Guardar'
      });
    }

    try {
      await Category.updateOne({ id: category.id }).set({ name: name.trim() });
      return res.redirect('/admin/categorias');
    } catch (e) {
      return res.view('admin/categories/form', {
        title: 'Editar categoría',
        error: 'No se pudo guardar (¿nombre duplicado?).',
        values: { name },
        action: `/admin/categorias/${category.id}`,
        submitText: 'Guardar'
      });
    }
  },

  // GET /admin/categorias/:id/delete
  deleteConfirm: async function (req, res) {
    const category = await Category.findOne({ id: req.params.id }).populate('games');
    if (!category) return res.notFound();

    return res.view('admin/categories/delete', {
      title: 'Borrar categoría',
      category
    });
  },

  // POST /admin/categorias/:id/delete
  destroy: async function (req, res) {
    const category = await Category.findOne({ id: req.params.id }).populate('games');
    if (!category) return res.notFound();

    // Seguridad: no borrar si tiene juegos asociados
    if (category.games && category.games.length > 0) {
      return res.view('admin/categories/delete', {
        title: 'Borrar categoría',
        category,
        error: 'No se puede borrar: hay juegos asociados.'
      });
    }

    await Category.destroyOne({ id: category.id });
    return res.redirect('/admin/categorias');
  }
};
