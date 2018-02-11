import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

import { i18n } from '../constants';

export class Input extends Component {
  static propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.any,
    disabled: PropTypes.bool,
    inputRef: PropTypes.func
  };

  static defaultProps = {
    autoComplete: 'off'
  };

  render() {
    const {
      className,
      placeholder,
      type,
      value,
      disabled,
      inputRef,
      ...rest
    } = this.props;
    let eventualValue = value;

    if (type === 'submit') {
      eventualValue = i18n.t(value);
    }

    if (disabled) {
      rest.disabled = 'disabled';
    }

    return (
      <input
        className={ClassName('boarder-input', className)}
        placeholder={placeholder && i18n.t(placeholder)}
        type={type}
        value={eventualValue}
        ref={inputRef}
        {...rest}
      />
    );
  }
}
