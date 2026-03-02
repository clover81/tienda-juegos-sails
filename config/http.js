module.exports.http = {

  middleware: {

    // middleware personalizado
    setViewLocals: function (req, res, next) {
      const sess = req.session || {}; // evita crash si no existe
      res.locals.isLoggedIn = !!sess.userId;
      res.locals.isAdmin = !!sess.isAdmin;
      res.locals.currentUserId = sess.userId || null;
      res.locals.currentUserName = sess.userName || null;
      res.locals.currentUsername = sess.userUsername || null;

      // Contador de carrito (total de unidades), solo si hay sesión
      res.locals.cartCount = 0;
      try {
        if (sess.userId && req.cookies) {
          const cookieName = `cart_${sess.userId}`;
          const raw = req.cookies[cookieName];
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              res.locals.cartCount = parsed.reduce((acc, it) => {
                const qty = Number(it && it.qty);
                return acc + (Number.isFinite(qty) ? qty : 0);
              }, 0);
            }
          }
        }
      } catch (e) {
        res.locals.cartCount = 0;
      }

      return next();
    },

    // Orden de ejecución del middleware
    order: [
      'cookieParser',
      'session',
      'setViewLocals',
      'bodyParser',
      'compress',
      'methodOverride',
      'poweredBy',
      'router',
      'www',
      'favicon'
    ],

  },

};
