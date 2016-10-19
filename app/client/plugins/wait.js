import { body } from 'dwayne';

body.wait = () => {
  body.addClass('waiting');
};

body.unwait = () => {
  body.removeClass('waiting');
};
