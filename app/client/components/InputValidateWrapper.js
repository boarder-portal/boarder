import _ from 'lodash';
import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

import {
  requiredValidator,
  passwordRepeatValidator,
  emailValidator
} from '../helpers';

import { Caption } from './Caption';

export class InputValidateWrapper extends Component {
  static propTypes = {
    validators: PropTypes.arrayOf(
      PropTypes.oneOf([
        'required',
        'password-repeat',
        'email'
      ])
    ).isRequired,
    showErrorMessage: PropTypes.bool.isRequired,
    i18nModule: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    error: PropTypes.string,
    empty: PropTypes.bool
  };

  state = {
    labelFor: null,
    changed: false,
    error: null
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.empty) {
      this.setState({
        changed: false
      });
    }
  }

  validatorSwitcher(validator) {
    switch (validator) {
      case 'required': {
        return requiredValidator;
      }

      case 'password-repeat': {
        return passwordRepeatValidator;
      }

      case 'email': {
        return emailValidator;
      }
    }
  }

  rootRef = (root) => {
    if (!root) {
      return;
    }

    const {
      validators
    } = this.props;
    const $input = $(root).find('input');
    const $form = $input.closest('form');

    $input.addClass('boarder-input');

    this.setState({
      labelFor: $input.prop('id')
    });

    validators.forEach((validator) => {
      validator = this.validatorSwitcher(validator);

      if (_.isFunction(validator)) {
        $input.validate(validator);
      }
    });

    $input.on({
      'input change': () => {
        $form.validate();

        this.setState({
          changed: true
        });
      },
      validate: (e, { error }) => {
        this.setState({
          error
        });

        $input.toggleAttr('invalid', this.state.changed && error);
      }
    });
  };

  render() {
    const {
      showErrorMessage,
      i18nModule,
      error: outerError,
      children
    } = this.props;
    const {
      labelFor,
      changed,
      error: innerError
    } = this.state;

    return (
      <div className="input-container" ref={this.rootRef}>
        <span className="validate-error">
          {showErrorMessage && (
            <Caption value={`${i18nModule}.validations.${innerError ? innerError.message : outerError}`} />
          )}
        </span>
        <div className="input-container2">
          {children}
          <label className="validate-icon-container" htmlFor={labelFor}>
            <i className={ClassName('fa', {
              'fa-times': changed && (innerError || outerError),
              'fa-check': changed && !innerError && !outerError
            })} />
          </label>
        </div>
      </div>
    );
  }
}
