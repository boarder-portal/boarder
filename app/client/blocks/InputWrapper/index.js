import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import {
  requiredValidator,
  passwordRepeatValidator,
  emailValidator
} from '../../helpers';

class InputWrapper extends Block {
  static template = template();

  labelFor = null;

  constructor(opts) {
    super(opts);

    this.reset();
  }

  reset() {
    _.assign(this, {
      changed: false,
      error: null
    });
  }

  beforeLeaveRoute() {
    this.input.removeAttr('invalid');
    this.reset();
  }

  afterRender() {
    const { validators } = this.args;
    const { inputContainer } = this;
    const input = inputContainer.find('input');

    input.addClass('boarder-input');

    this.input = input;
    this.labelFor = input.id();

    this.watch('args.empty', () => {
      if (this.args.empty) {
        this.changed = false;
      }
    });

    if (validators) {
      _.forEach(validators, (validator) => {
        validator = this.validatorSwitcher(validator);

        if (_.isFunction(validator)) {
          input.validate(validator);
        }
      });
      input.on({
        'input, change': () => {
          this.changed = true;
        },
        validate: (e) => {
          const { error } = e;

          this.error = error;
          input.toggleAttr('invalid', this.changed && error);
        }
      });
    }
  }

  validatorSwitcher(validator) {
    /* eslint indent: 0 */
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
}

Block.block('InputWrapper', InputWrapper);
