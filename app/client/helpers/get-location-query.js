import { parse } from 'querystring';

const { location } = window;

export function getLocationQuery() {
  if (location.search[0] !== '?') {
    return {};
  }

  return parse(location.search.slice(1));
}
