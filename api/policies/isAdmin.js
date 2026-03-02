module.exports = async function (req, res, proceed) {
  if (req.session.userId && req.session.isAdmin) return proceed();
  return res.forbidden(); // 403
};
