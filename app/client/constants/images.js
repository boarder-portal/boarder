import { D, doc } from 'dwayne';
import { assetsPath } from '../../config/constants.json';

export const images = {
  loading: 'loading.gif'
};

const $images = D(images);

$images.forEach((value, key) => {
  const image = doc
    .img()
    .ref(`${ assetsPath }/images/${ value }`);

  $images.get(key, () => image.clone());
});
