import React, { Component } from 'react';

import { getLocationQuery, setPageTitle } from '../helpers';

import { Caption } from '../components';

const { location } = window;

class NotFound extends Component {
  componentDidMount() {
    setPageTitle('not_found');
  }

  render() {
    const {
      href,
      origin
    } = location;
    const { path } = getLocationQuery();

    return (
      <div className="route route-not-found">

        <Caption tag="h1" value="404.this_page" />

        <h1 className="not-found-url-container">
          (
          <span className="not-found-url">
            {path || href.slice(origin.length)}
          </span>
          )
        </h1>

        <Caption tag="h1" value="404.does_not_exist" />

      </div>
    );
  }
}

export default NotFound;
