module.exports = {
  uploadAvatar(req, res, next) {
    console.log(req.file);

    res.json(true);
  }
};
