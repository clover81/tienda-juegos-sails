const bcrypt = require('bcrypt');

module.exports = {

  /* login */

  viewLogin: async function (req, res) {
    return res.view('auth/login');
  },

  login: async function (req, res) {
    const { identifier, password } = req.body;

    const fieldErrors = {};
    const values = { identifier };

    // Validación básica
    if (!identifier) fieldErrors.identifier = 'Introduce tu usuario o email.';
    if (!password) fieldErrors.password = 'Introduce tu contraseña.';

    if (Object.keys(fieldErrors).length > 0) {
      return res.view('auth/login', {
        error: 'Hay errores en el formulario.',
        fieldErrors,
        values
      });
    }

    // Buscar usuario por username o email
    const user = await User.findOne({
      or: [
        { username: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return res.view('auth/login', {
        error: 'Usuario no encontrado.',
        fieldErrors: { identifier: 'No existe ese usuario o email.' },
        values
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.view('auth/login', {
        error: 'Contraseña incorrecta.',
        fieldErrors: { password: 'La contraseña no es válida.' },
        values
      });
    }

    // Guardar sesión
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userUsername = user.username;
    req.session.isAdmin = !!user.isAdmin;

    return res.redirect('/');
  },

  logout: async function (req, res) {
    req.session.destroy(() => {
      return res.redirect('/');
    });
  },

  /* registro */

  viewRegister: async function (req, res) {
    return res.view('auth/register');
  },

    register: async function (req, res) {
    const { username, email, name, password } = req.body;

    const fieldErrors = {};
    const values = { username, email, name };

    // Validaciones
    if (!username) fieldErrors.username = 'El usuario es obligatorio.';
    if (!email) fieldErrors.email = 'El email es obligatorio.';
    if (!name) fieldErrors.name = 'El nombre es obligatorio.';
    if (!password) fieldErrors.password = 'La contraseña es obligatoria.';
    if (password && password.length < 6) fieldErrors.password = 'Mínimo 6 caracteres.';

    if (Object.keys(fieldErrors).length > 0) {
      return res.view('auth/register', {
        error: 'Hay errores en el formulario.',
        fieldErrors,
        values
      });
    }

    try {
      // Comprobar duplicados
      const existingUser = await User.findOne({
        or: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        return res.view('auth/register', {
          error: 'Usuario o email ya registrado.',
          fieldErrors: {
            username: 'Ya existe un usuario con ese nombre.',
            email: 'Ese email ya está en uso.'
          },
          values
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Crear usuario
      const createdUser = await User.create({
        username,
        email,
        name,
        passwordHash,
        isAdmin: false
      }).fetch();

      // Auto-login
      req.session.userId = createdUser.id;
      req.session.userName = createdUser.name;
      req.session.userUsername = createdUser.username;
      req.session.isAdmin = !!createdUser.isAdmin;

      return res.redirect('/');
    } catch (err) {

      // email inválido
      if (err.code === 'E_INVALID_NEW_RECORD') {
        let msg = 'Datos inválidos.';

        if (err.invalidAttributes) {
          if (err.invalidAttributes.email) {
            fieldErrors.email = 'Email no válido. Ej: usuario@dominio.com';
          }
          if (err.invalidAttributes.username) {
            fieldErrors.username = 'Nombre de usuario no válido.';
          }
        }

        return res.view('auth/register', {
          error: msg,
          fieldErrors,
          values
        });
      }

      // Otros errores inesperados
      sails.log.error(err);
      return res.serverError();
    }
  }
};
