const {
  inspect: {
    defaultOptions,
    styles
  }
} = require('util');

defaultOptions.maxArrayLength = null;
defaultOptions.depth = 2;
defaultOptions.colors = true;
defaultOptions.showProxy = true;

styles.number = 'blue';
styles.undefined = 'bold';
