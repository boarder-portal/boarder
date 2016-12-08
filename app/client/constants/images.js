import { D } from 'dwayne';
import { ASSETS_PATH } from '../../config/constants.json';

export const images = {
  loading: 'loading.gif'
};

D(images).forEach((value, key, images) => {
  images[key] = `${ ASSETS_PATH }/images/${ value }`;
});
