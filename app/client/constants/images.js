import _ from 'lodash';
import { ASSETS_PATH } from '../../shared/constants';

const images = {
  loading: 'loading.gif'
};

_.forEach(images, (value, key, images) => {
  images[key] = `${ASSETS_PATH}/images/${value}`;
});

export { images };
