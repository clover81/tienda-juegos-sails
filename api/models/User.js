const bcrypt = require('bcrypt');

module.exports = {
  attributes: {

    id: { type: 'number', autoIncrement: true },

    username: { type: 'string', required: true, unique: true, maxLength: 40 },
    email:    { type: 'string', required: true, unique: true, isEmail: true, maxLength: 120 },
    name:     { type: 'string', required: true, maxLength: 80 },

    passwordHash: { type: 'string', required: true },

    isAdmin: { type: 'boolean', defaultsTo: false },
  },

  // Helpers estáticos
  hashPassword: async function (plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  },

  verifyPassword: async function (plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  },
};
