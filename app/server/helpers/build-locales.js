const _ = require('lodash');
const path = require('path');
const fs = require('fs-promise');
const { resolveGlob } = require('./require-glob');

exports.buildLocales = (sourceDir, buildDir, client) => {
  const locales = {};
  const glob = `${sourceDir}/**/*.json`;

  resolveGlob(glob).forEach((filename) => {
    const relativeFilename = path.relative(sourceDir, filename);
    const modules = relativeFilename.split(path.sep);
    const locale = modules[modules.length - 1].split('.')[0];
    const translations = locales[locale] = locales[locale] || {};

    modules.reduce((localTranslations, module, index) => {
      if (index === modules.length - 1) {
        return _.merge(localTranslations, JSON.parse(
          fs.readFileSync(filename)
        ));
      }

      /* eslint no-return-assign: 0 */
      return localTranslations[module] = localTranslations[module] || {};
    }, translations);
  });

  _.forEach(locales, (translations, locale) => {
    translations = JSON.stringify(translations);

    const path = `${buildDir}/${locale}.${client ? 'js' : 'json'}`;

    if (client) {
      translations = `window.boarderI18n = '${translations.replace(/'/g, '\\\'')}';`;
    }

    console.log(`locale built: ${path}`);

    fs.outputFileSync(path, translations);
  });
};
