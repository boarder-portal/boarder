import _ from 'lodash';

_.mixin({
  sortByField(array, field, descending) {
    descending = !!descending;

    return array.sort((x, y) => (
      descending
        ? sort(field, y, x)
        : sort(field, x, y)
    ));
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
