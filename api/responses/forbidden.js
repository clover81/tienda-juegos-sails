module.exports = function forbidden(data) {
  const req = this.req;
  const res = this.res;

  if (req.wantsJSON) {
    return res.status(403).json(data || { error: 'Forbidden' });
  }
  return res.status(403).view('403');
};
