const D = require('dwayne');
const path = require('path');
const fs = require('fs');
const { resolveGlob } = require('./require-glob');

const { parseJSON } = D;

exports.buildLocales = (sourceDir, buildDir, client) => {
  const locales = {};
  const glob = `${ sourceDir }/**/*.json`;

  return new Promise((resolve) => {
    fs.stat(buildDir, (err) => {
      if (err) {
        fs.mkdirSync(buildDir);
      }

      resolveGlob(glob).forEach((filename) => {
        const relativeFilename = path.relative(sourceDir, filename);
        const modules = relativeFilename.split(path.sep);
        const locale = modules[modules.length - 1].split('.')[0];
        const translations = locales[locale] = locales[locale] || {};

        modules.reduce((localTranslations, module, index) => {
          if (index === modules.length - 1) {
            return D(localTranslations).deepAssign(parseJSON(fs.readFileSync(filename)).$);
          }

          /* eslint no-return-assign: 0 */
          return localTranslations[module] = localTranslations[module] || {};
        }, translations);
      });

      D(locales).forEach((translations, locale) => {
        translations = D(translations).json();

        const path = `${ buildDir }/${ locale }.${ client ? 'js' : 'json' }`;

        if (client) {
          translations = `window.boarderI18n = '${ translations.replace(/'/g, '\\\'') }';`;
        }

        console.log(`locale built: ${ path }`);

        fs.writeFileSync(path, translations);
      });

      resolve();
    });
  });
};
