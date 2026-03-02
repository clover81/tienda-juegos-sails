function getCartCookieName(req) {
  // si por lo que sea no hay sesión, evitamos 500
  if (!req.session || !req.session.userId) return null;
  return `cart_${req.session.userId}`;
}

function readCart(req) {
  const cookieName = getCartCookieName(req);
  if (!cookieName) return [];

  const raw = req.cookies ? req.cookies[cookieName] : null;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(x => x && typeof x === 'object')
      .map(x => ({ id: String(x.id), qty: Number(x.qty) || 0 }))
      .filter(x => x.id && Number.isInteger(x.qty) && x.qty > 0);
  } catch {
    return [];
  }
}

function writeCart(req, res, cart) {
  const cookieName = getCartCookieName(req);
  if (!cookieName) return;

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(cookieName, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function buildCartViewData(req) {
  const cart = readCart(req);
  const ids = cart.map(i => i.id);
  const games = ids.length ? await Game.find({ id: ids }).populate('category') : [];

  const items = games.map(g => {
    const found = cart.find(i => String(i.id) === String(g.id));
    const qty = found ? found.qty : 0;
    const lineTotal = qty * g.price;
    return { game: g, qty, lineTotal };
  });

  const total = items.reduce((acc, it) => acc + it.lineTotal, 0);
  return { items, total, cart, games };
}

module.exports = {
  // GET /carrito
  index: async function (req, res) {
    const { items, total } = await buildCartViewData(req);
    return res.view('cart/index', { title: 'Carrito', items, total });
  },

  // GET /carrito/add/:id
  addView: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id }).populate('category');
    if (!game) return res.notFound();

    return res.view('cart/add', {
      title: 'Añadir al carrito',
      game,
      error: null,
      values: { qty: 1 }
    });
  },

  // POST /carrito/add/:id
  add: async function (req, res) {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) return res.notFound();

    const qty = Number(req.body.qty);

    if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
      const fullGame = await Game.findOne({ id: req.params.id }).populate('category');
      return res.view('cart/add', {
        title: 'Añadir al carrito',
        game: fullGame,
        error: 'La cantidad debe ser un entero mayor que 0.',
        values: { qty: req.body.qty }
      });
    }

    if (game.stock <= 0) {
      const fullGame = await Game.findOne({ id: req.params.id }).populate('category');
      return res.view('cart/add', {
        title: 'Añadir al carrito',
        game: fullGame,
        error: 'No hay stock disponible.',
        values: { qty }
      });
    }

    const cart = readCart(req);
    const existing = cart.find(i => String(i.id) === String(game.id));

    const currentQty = existing ? existing.qty : 0;
    const newQty = currentQty + qty;

    if (newQty > game.stock) {
      const fullGame = await Game.findOne({ id: req.params.id }).populate('category');
      return res.view('cart/add', {
        title: 'Añadir al carrito',
        game: fullGame,
        error: `No puedes añadir ${qty}. Stock disponible: ${game.stock}. En carrito ya tienes: ${currentQty}.`,
        values: { qty }
      });
    }

    const newCart = existing
      ? cart.map(i => (String(i.id) === String(game.id) ? { ...i, qty: newQty } : i))
      : [...cart, { id: String(game.id), qty }];

    writeCart(req, res, newCart);
    return res.redirect('/carrito');
  },

  // POST /carrito/remove/:id
  remove: async function (req, res) {
    const cart = readCart(req);
    const newCart = cart.filter(i => String(i.id) !== String(req.params.id));
    writeCart(req, res, newCart);
    return res.redirect('/carrito');
  },

  // POST /carrito/clear
  clear: async function (req, res) {
    writeCart(req, res, []);
    return res.redirect('/carrito');
  },

  // GET /carrito/checkout
  checkoutView: async function (req, res) {
    const { items, total } = await buildCartViewData(req);

    if (items.length === 0) {
      return res.redirect('/carrito');
    }

    return res.view('cart/checkout', {
      title: 'Finalizar compra',
      items,
      total,
      error: null
    });
  },

  // POST /carrito/checkout
checkout: async function (req, res) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  // Leer carrito desde cookies
  const cart = readCart(req);

  if (!cart.length) {
    return res.redirect('/carrito');
  }

  // Comprobar stock y actualizarlo
  for (const item of cart) {
    const game = await Game.findOne({ id: item.id });

    if (!game || game.stock < item.qty) {
      return res.redirect('/carrito');
    }

    await Game.updateOne({ id: game.id })
      .set({ stock: game.stock - item.qty });
  }

  // Vaciar carrito (cookie)
  writeCart(req, res, []);

  // Forzar contador a 0
  res.locals.cartCount = 0;

  // Mostrar vista de éxito
  return res.view('cart/success', {
    title: 'Compra completada'
  });
  }
};
