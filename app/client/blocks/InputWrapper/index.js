import { D, Block, isFunction, switcher } from 'dwayne';
import template from './index.pug';
import {
  requiredValidator,
  passwordRepeatValidator,
  emailValidator
} from '../../helper';

const validatorSwitcher = switcher()
  .case('required', () => requiredValidator)
  .case('password-repeat', () => passwordRepeatValidator)
  .case('email', () => emailValidator);

class InputWrapper extends Block {
  static template = template();

  labelFor = null;

  constructor(opts) {
    super(opts);

    this.reset();
  }

  reset() {
    D(this).assign({
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

    if (validators) {
      D(validators).forEach((validator) => {
        validator = validatorSwitcher(validator);

        if (isFunction(validator)) {
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
}

Block.register('InputWrapper', InputWrapper);
