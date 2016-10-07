const D = require('dwayne');
const { requireGlob } = require('./require-glob');

requireGlob('/app/server/helpers/!(index).js')
  .forEach((helpers) => {
    D(exports).assign(helpers);
  });
