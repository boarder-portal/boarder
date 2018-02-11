import PropTypes from 'prop-types';

export const userType = PropTypes.shape({
  login: PropTypes.string.isRequired,
  avatar: PropTypes.string
});

export const alertType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  type: PropTypes.shape({
    level: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    duration: PropTypes.number
  }),
  duration: PropTypes.number
});

export const locationType = PropTypes.shape({
  pathname: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  key: PropTypes.string
});

export const matchType = PropTypes.shape({
  isExact: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

export const historyType = PropTypes.shape({
  action: PropTypes.string.isRequired,
  block: PropTypes.func.isRequired,
  createHref: PropTypes.func.isRequired,
  go: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  goForward: PropTypes.func.isRequired,
  length: PropTypes.number.isRequired,
  location: locationType.isRequired,
  listen: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired
});

export const gameDataType = PropTypes.shape({
  field: PropTypes.array,
  turn: PropTypes.number,
  players: PropTypes.arrayOf(userType).isRequired,
  options: PropTypes.object
});

export const playersType = PropTypes.arrayOf(userType);
