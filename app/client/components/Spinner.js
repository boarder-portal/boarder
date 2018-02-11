import React, { Component } from 'react';

import { images } from '../constants';

export class Spinner extends Component {
  render() {
    return (
      <img
        src={images.loading}
        {...this.props}
      />
    );
  }
}
