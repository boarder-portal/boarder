import { D, doc } from 'dwayne';
import { ASSETS_PATH } from '../../config/constants.json';

export const images = {
  loading: 'loading.gif'
};

const $images = D(images);

$images.forEach((value, key) => {
  const image = doc
    .img()
    .ref(`${ ASSETS_PATH }/images/${ value }`);

  $images.get(key, () => image.clone());
});
