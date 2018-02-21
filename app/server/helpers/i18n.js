import path from 'path';
import fs from 'fs-promise';

import I18n from '../../shared/i18n';
import { resolveGlob } from './glob';

export const i18n = resolveGlob('./app/server/i18n/*.json')
  .filter((filename) => /\.json$/.test(filename))
  .reduce((translations, filename) => {
    const modules = filename.split(path.sep);
    const [locale] = modules.pop().split('.');

    translations[locale] = new I18n(locale, fs.readJsonSync(filename, { encoding: 'utf8' }));

    return translations;
  }, {});
