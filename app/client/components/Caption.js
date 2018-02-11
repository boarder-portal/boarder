import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { i18n } from '../constants';

export class Caption extends Component {
  static propTypes = {
    tag: PropTypes.string,
    value: PropTypes.string.isRequired
  };

  static defaultProps = {
    tag: 'span'
  };

  render() {
    const {
      tag: Tag,
      value,
      ...rest
    } = this.props;

    return (
      <Tag {...rest}>
        {i18n.t(value)}
      </Tag>
    );
  }
}
