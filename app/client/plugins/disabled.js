import { D, body } from 'dwayne';

body.on('click', (e) => {
  if (D(e.target).closest('.disabled').length) {
    e.preventDefault();
  }
});
