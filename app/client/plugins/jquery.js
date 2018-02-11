import _ from 'lodash';
import $ from 'jquery';

const INPUT_ELEMENTS = 'input, select, textarea, datalist, keygen, output';

/**
 * @callback Validator
 * @param {string} value
 * @param {HTMLInputElement} inputNode
 * @param {number} index
 */

/**
 * @lends jQuery
 */
_.assign($.fn, {
  /**
   * @method jQuery.isBroken
   * @returns {boolean}
   */
  isBroken() {
    let isBroken = false;

    this.toArray().some((elem) => {
      if (elem.nodeName === 'IMG') {
        isBroken = !!(elem.complete && (!elem.naturalWidth || !elem.naturalHeight));

        return true;
      }
    });

    return isBroken;
  },

  /**
   * @method jQuery.load
   * @returns {Promise.<{proper: jQuery, broken: jQuery}, Error>}
   */
  async load() {
    const images = {
      proper: $(),
      broken: $()
    };

    await Promise.all(
      this
        .filter('img')
        .toArray()
        .map((elem) => {
          const $elem = $(elem);

          if (elem.complete) {
            if ($elem.isBroken()) {
              images.broken = images.broken.add(elem);
            } else {
              images.proper = images.broken.add(elem);
            }

            return;
          }

          return new Promise((resolve) => {
            const loadListener = () => {
              images.proper = images.broken.add(elem);

              removeListeners();
              resolve();
            };
            const errorListener = () => {
              images.broken = images.broken.add(elem);

              removeListeners();
              resolve();
            };

            function removeListeners() {
              $elem.off('load', loadListener);
              $elem.off('error', errorListener);
            }

            $elem.on({
              load: loadListener,
              error: errorListener
            });
          });
        })
    );

    return images;
  },

  /**
   * @method jQuery.hasAttr
   * @param {string} attr
   * @returns {boolean}
   */
  hasAttr(attr) {
    return this.toArray().some((elem) => (
      elem.nodeType === 1
      && elem.hasAttribute(attr)
    ));
  },

  /**
   * @method jQuery.toggleAttr
   * @param {string} attr
   * @param {boolean} [condition]
   * @returns {jQuery}
   */
  toggleAttr(attr, condition) {
    return this.each((index, elem) => {
      const $elem = $(elem);

      if (arguments.length < 2 ? !$elem.hasAttr(attr) : condition) {
        $elem.attr(attr, '');
      } else {
        $elem.removeAttr(attr);
      }
    });
  },

  /**
   * @method jQuery.validate
   * @param {Validator} [validator]
   * @returns {Object | null}
   */
  validate(validator) {
    if (validator) {
      return this.each((index, elem) => {
        (elem.validators = elem.validators || []).push(validator);
      });
    }

    const errors = { errors: null };

    this
      .filter(`${INPUT_ELEMENTS}, form`)
      .each((index, elem) => {
        if (elem.nodeName === 'FORM') {
          let formErrors = { errors: null };
          const $form = $(elem);
          const $inputs = $form.find(INPUT_ELEMENTS);

          $inputs.each((index, input) => {
            validatorWrap(input, index, formErrors);
          });

          _.merge(errors, formErrors);

          formErrors = formErrors.errors;

          $form.trigger('validate', {
            valid: !formErrors,
            errors: formErrors
          });

          return $inputs.each((index, input) => {
            const inputError = (formErrors || {})[input.name];

            $(input).trigger('validate', {
              valid: !inputError,
              error: inputError || null
            });
          });
        }

        let inputErrors = { errors: null };

        validatorWrap(elem, index, inputErrors);

        _.merge(errors, inputErrors);

        inputErrors = (inputErrors.errors || {})[elem.name];

        $(elem).trigger('validate', {
          valid: !inputErrors,
          error: inputErrors || null
        });
      });

    function validatorWrap(input, index, errors) {
      try {
        if (input.validity && !input.validity.valid) {
          throw new Error(input.validationMessage);
        }

        _.forEach(input.validators, (validator) => {
          validator(input.value, input, index);
        });
      } catch (err) {
        (errors.errors = errors.errors || {})[input.name] = err;
      }
    }

    if (_.every(errors, _.isNull)) {
      return null;
    }

    return errors.errors;
  },

  /**
   * @method jQuery.wait
   * @returns {jQuery}
   */
  wait() {
    this.addClass('wait');
  },

  /**
   * @method jQuery.unwait
   * @returns {jQuery}
   */
  unwait() {
    this.removeClass('wait');
  }
});
