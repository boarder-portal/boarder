module.exports = (app) => {
  /* eslint no-unused-vars: 0 */
  app.use((err, req, res, next) => {
    console.log(err);

    res
      .status(500)
      .send('500 Internal error');
  });
};
