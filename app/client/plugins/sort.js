import { Arr } from 'dwayne';

Arr.addInstanceProperties({
  sortBy(field, reverse) {
    return this.sort((x, y) => {
      if (reverse) {
        return sort(field, y, x);
      }

      return sort(field, x, y);
    });
  }
});

function sort(field, x, y) {
  if (x[field] > y[field]) {
    return 1;
  }

  if (x[field] < y[field]) {
    return -1;
  }

  return 0;
}
