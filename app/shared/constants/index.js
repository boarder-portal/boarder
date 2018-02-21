import * as endpoints from './endpoints';
import * as errors from './errors';
import * as games from './games';

export const LIVERELOAD_NSP = '/livereload';
export const ASSETS_PATH = '/public';
export const VENDOR_PATH = '/vendor';

export const colors = {
  red: '#ff0000',
  green: '#007f00',
  blue: '#0000ff',
  yellow: '#ffff00',
  orange: '#ff7f00',
  purple: '#ff00ff'
};

export { errors, endpoints, games };
