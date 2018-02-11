import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

const popupSelector = '.popup';
const popupActionSelector = '.open-popup';

export class Popup extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  state = {
    visible: false
  };

  popupRef = (popup) => {
    if (!popup) {
      return;
    }

    popup.boarderPopup = this;
  };

  open() {
    this.setState({
      visible: true
    });
  }

  close = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    const {
      children
    } = this.props;
    const {
      visible
    } = this.state;

    return (
      <div
        ref={this.popupRef}
        className={ClassName('popup', {
          hidden: !visible
        })}
      >
        <div className="popup-overlay" onClick={this.close} />
        <div className="popup-content">
          <i className="popup-close fa fa-close" onClick={this.close} />
          {children}
        </div>
      </div>
    );
  }
}

$(document.body).on('click', popupActionSelector, ({ target }) => {
  const popup = $(target).next(popupSelector);
  const popupInstance = popup[0].boarderPopup;

  if (popupInstance) {
    popupInstance.open();
  }
});
