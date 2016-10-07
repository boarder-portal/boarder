const { parseJSON } = require('dwayne');
const path = require('path');
const fs = require('fs');
const I18n = require('../../shared/i18n');
const { resolveGlob } = require('./require-glob');

exports.i18n = resolveGlob('./app/server/i18n/*.json')
  .filter((filename) => /\.json$/.test(filename))
  .reduce((translations, filename) => {
    const modules = filename.split(path.sep);
    const [locale] = modules.pop().split('.');

    translations[locale] = new I18n(locale, parseJSON(fs.readFileSync(filename, { encoding: 'utf8' })).$);

    return translations;
  }, {});
