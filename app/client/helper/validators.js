import { D, doc } from 'dwayne';

const testEmailInput = doc.input('$type(email)');

export function requiredValidator(value) {
  if (!value) {
    throw new Error('field_must_not_be_empty');
  }
}

export function passwordRepeatValidator(value, input) {
  const passwordValue = D(input)
    .closest('form')
    .find('input[name="password-repeat"]')
    .prop('value');

  if (value !== passwordValue) {
    throw new Error('passwords_do_not_match');
  }
}

export function emailValidator(value) {
  testEmailInput.prop('value', value);

  if (testEmailInput.validate()) {
    throw new Error('value_is_not_email');
  }
}
