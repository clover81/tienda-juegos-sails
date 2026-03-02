module.exports = {
  // GET /perfil
  profile: async function (req, res) {
    const user = await User.findOne({ id: req.session.userId });
    if (!user) return res.redirect('/logout');

    return res.view('user/profile', {
      title: 'Perfil',
      error: null,
      success: null,
      values: { username: user.username, email: user.email, name: user.name }
    });
  },

  // POST /perfil
  updateProfile: async function (req, res) {
    const { name, email } = req.body;

    const user = await User.findOne({ id: req.session.userId });
    if (!user) return res.redirect('/logout');

    if (!name || !email) {
      return res.view('user/profile', {
        title: 'Perfil',
        error: 'Nombre y email son obligatorios.',
        success: null,
        values: { username: user.username, email: email || user.email, name: name || user.name }
      });
    }

    // evitar email duplicado
    const exists = await User.findOne({ email, id: { '!=': user.id } });
    if (exists) {
      return res.view('user/profile', {
        title: 'Perfil',
        error: 'Ese email ya está en uso.',
        success: null,
        values: { username: user.username, email, name }
      });
    }

    await User.updateOne({ id: user.id }).set({ name, email });

    return res.view('user/profile', {
      title: 'Perfil',
      error: null,
      success: 'Perfil actualizado.',
      values: { username: user.username, email, name }
    });
  },

  // GET /changepassword
  viewChangePassword: async function (req, res) {
    return res.view('user/change-password', { title: 'Cambiar contraseña', error: null, success: null });
  },

  // POST /changepassword
  changePassword: async function (req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.view('user/change-password', {
        title: 'Cambiar contraseña',
        error: 'Rellena todos los campos.',
        success: null
      });
    }

    if (newPassword.length < 6) {
      return res.view('user/change-password', {
        title: 'Cambiar contraseña',
        error: 'La nueva contraseña debe tener al menos 6 caracteres.',
        success: null
      });
    }

    const user = await User.findOne({ id: req.session.userId });
    if (!user) return res.redirect('/logout');

    const ok = await User.verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      return res.view('user/change-password', {
        title: 'Cambiar contraseña',
        error: 'La contraseña actual no es correcta.',
        success: null
      });
    }

    const passwordHash = await User.hashPassword(newPassword);
    await User.updateOne({ id: user.id }).set({ passwordHash });

    return res.view('user/change-password', {
      title: 'Cambiar contraseña',
      error: null,
      success: 'Contraseña actualizada.'
    });
  }
};
