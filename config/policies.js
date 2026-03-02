module.exports.policies = {
  '*': true,

  UserController: {
    '*': 'isLoggedIn'
  },

  AdminCategoryController: {
    '*': 'isAdmin'
  },

  AdminGameController: {
  '*': 'isAdmin'
  },

  CartController: {
  '*': 'isLoggedIn'
  }


};
