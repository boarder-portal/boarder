const { requireGlob } = require('../helpers/require-glob');

requireGlob('/app/server/plugins/!(index).js');
