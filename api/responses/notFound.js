module.exports = function notFound(data) {
  const req = this.req;
  const res = this.res;

  if (req.wantsJSON) {
    return res.status(404).json(data || { error: 'Not Found' });
  }
  return res.status(404).view('404');
};
