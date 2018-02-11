import _ from 'lodash';
import React, { Component } from 'react';
import ClassName from 'classnames';

import { i18n, images, langFetch } from '../../constants';

import { Dropdown } from '../../components';

const LANGUAGES = [
  {
    lang: 'en',
    flag: 'gb',
    caption: 'English'
  },
  {
    lang: 'ru',
    flag: 'ru',
    caption: 'Русский'
  }
];
const currentLang = _.find(LANGUAGES, ({ lang }) => lang === i18n.locale);

class Footer extends Component {
  state = {
    changeLangFetching: false,
    langFetching: null
  };

  async chooseLang(lang) {
    if (this.state.changeLangFetching) {
      return;
    }

    this.setState({
      langFetching: lang,
      changeLangFetching: true
    });

    try {
      await langFetch.change({
        data: { lang }
      });

      location.reload();
    } finally {
      this.setState({
        langFetching: null,
        changeLangFetching: false
      });
      this.closeDropdown();
    }
  }

  getCloseDropdown = (closeDropdown) => {
    this.closeDropdown = closeDropdown;
  };

  render() {
    const {
      changeLangFetching,
      langFetching
    } = this.state;

    return (
      <footer className="main-footer">
        <div className="languages">

          <span className="language">
            <i className={`flag-icon flag-icon-${currentLang.flag}`} />
            <span>{currentLang.caption}</span>
          </span>

          <Dropdown
            down={false}
            hdir="center"
            getCloseDropdown={this.getCloseDropdown}
          >
            {_.map(LANGUAGES, ({ lang, flag, caption }) => (
              <div
                key={lang}
                className={ClassName('dropdown-item link language', {
                  disabled: lang === i18n.locale || changeLangFetching
                })}
                onClick={() => this.chooseLang(lang)}
              >
                <i className={`flag-icon flag-icon-${flag}`} />
                <span className="lang-caption">
                  {caption}
                </span>
                {changeLangFetching && lang === langFetching && (
                  <img
                    className="changing-lang-spinner"
                    src={images.loading}
                  />
                )}
              </div>
            ))}
          </Dropdown>

        </div>
      </footer>
    );
  }
}

export default Footer;
