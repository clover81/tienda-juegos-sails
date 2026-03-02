const path = require('path');
const fs = require('fs/promises');

module.exports = {
  friendlyName: 'Upload image',
  description: 'Guarda imagen en assets/uploads (persistente) y .tmp/public/uploads (visible sin reiniciar)',

  inputs: {
    req: { type: 'ref', required: true },
  },

  fn: async function ({ req }) {

    const assetsDir = path.resolve(process.cwd(), 'assets', 'uploads');
    const tmpDir = path.resolve(process.cwd(), '.tmp', 'public', 'uploads');

    await fs.mkdir(assetsDir, { recursive: true });
    await fs.mkdir(tmpDir, { recursive: true });

    const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

    const files = await new Promise((resolve, reject) => {
      req.file('photo').upload(
        {
          dirname: assetsDir,
          maxBytes: 5 * 1024 * 1024,
          saveAs: function (file, cb) {
            const ext = path.extname(file.filename).toLowerCase();
            const safeBase = path.basename(file.filename, ext).replace(/[^\w.\-]/g, '_');

            if (!allowedExt.has(ext)) return cb(new Error('EXT_NOT_ALLOWED'));
            if (file.type && !String(file.type).startsWith('image/')) return cb(new Error('MIME_NOT_IMAGE'));

            cb(null, `${Date.now()}-${safeBase}${ext}`);
          },
        },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded))
      );
    });

    if (!files || files.length === 0) return null;

    const filename = path.basename(files[0].fd);

    // Copia a .tmp/public/uploads para que se vea sin reiniciar
    await fs.copyFile(
      path.join(assetsDir, filename),
      path.join(tmpDir, filename)
    );

    return filename;
  },
};
