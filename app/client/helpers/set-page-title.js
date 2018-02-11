import { i18n, title } from '../constants';

export function setPageTitle(page, i18nModule = 'titles') {
  title.text(i18n.t(`${i18nModule}.${page}`));
}
