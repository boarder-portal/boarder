const util = require('util');

util.inspect.defaultOptions.maxArrayLength = null;
util.inspect.defaultOptions.depth = null;
util.inspect.defaultOptions.colors = true;
util.inspect.defaultOptions.showProxy = true;
util.inspect.styles.number = 'blue';
util.inspect.styles.undefined = 'bold';
