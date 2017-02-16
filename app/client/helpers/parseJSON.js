const { parse } = JSON;
const DATE = /^\d\d\d\d-\d\d-\d\dt\d\d:\d\d:\d\d\.\d\d\dz?$/i;

export function parseJSON(json, withDates) {
  if (!withDates) {
    return parse(json);
  }

  return parse(json, (key, value) => (
    DATE.test(value)
      ? new Date(value)
      : value
  ));
}
