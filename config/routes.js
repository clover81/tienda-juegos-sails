module.exports.routes = {

  /* home y público */

  'GET /': 'HomeController.index',
  'GET /acerca': 'HomeController.about',
  'GET /categoria/:id': 'HomeController.byCategory',

  // Detalle de juego
  'GET /juegos/:id': 'GameController.show',

  // Listado de categorías públicas
  'GET /categorias': 'CategoryController.index',

  // Seed de datos, solo en pruebas.
  'GET /seed': 'SeedController.seed',


  /* registro y login */

  'GET  /registro': 'AuthController.viewRegister',
  'POST /registro': 'AuthController.register',

  'GET  /login': 'AuthController.viewLogin',
  'POST /login': 'AuthController.login',
  'GET  /logout': 'AuthController.logout',


  /* perfil de usuario */

  'GET  /perfil': 'UserController.profile',
  'POST /perfil': 'UserController.updateProfile',

  'GET  /changepassword': 'UserController.viewChangePassword',
  'POST /changepassword': 'UserController.changePassword',


  /* carrito */

  'GET  /carrito': 'CartController.index',

  'GET  /carrito/add/:id': 'CartController.addView',
  'POST /carrito/add/:id': 'CartController.add',

  'POST /carrito/remove/:id': 'CartController.remove',
  'POST /carrito/clear': 'CartController.clear',

  'GET  /carrito/checkout': 'CartController.checkoutView',
  'POST /carrito/checkout': 'CartController.checkout',


  /* administrador */

  'GET  /admin/categorias': 'AdminCategoryController.index',
  'GET  /admin/categorias/new': 'AdminCategoryController.new',
  'POST /admin/categorias': 'AdminCategoryController.create',

  'GET  /admin/categorias/:id/edit': 'AdminCategoryController.edit',
  'POST /admin/categorias/:id': 'AdminCategoryController.update',

  'GET  /admin/categorias/:id/delete': 'AdminCategoryController.deleteConfirm',
  'POST /admin/categorias/:id/delete': 'AdminCategoryController.destroy',


  /* admin juegos */
  'GET  /admin/juegos': 'AdminGameController.index',
  'GET  /admin/juegos/new': 'AdminGameController.new',
  'POST /admin/juegos': 'AdminGameController.create',

  'GET  /admin/juegos/:id/edit': 'AdminGameController.edit',
  'POST /admin/juegos/:id': 'AdminGameController.update',

  'GET  /admin/juegos/:id/delete': 'AdminGameController.deleteConfirm',
  'POST /admin/juegos/:id/delete': 'AdminGameController.destroy',

};
