import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

let activeDropdown;

export class Dropdown extends Component {
  static propTypes = {
    className: PropTypes.string,
    down: PropTypes.bool,
    hdir: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    getCloseDropdown: PropTypes.func
  };
  static defaultProps = {
    down: true
  };

  state = {
    visible: false
  };

  componentDidMount() {
    const {
      getCloseDropdown
    } = this.props;

    if (getCloseDropdown) {
      getCloseDropdown(this.close);
    }
  }

  componentWillUnmount() {
    if (activeDropdown === this) {
      activeDropdown = null;
    }
  }

  rootRef = (node) => {
    if (!node) {
      return;
    }

    node.boarderDropdown = this;

    $(node).on('click', '[action="close"]', () => setTimeout(this.close, 0));
  };

  open = () => {
    this.setState({
      visible: true
    });

    if (activeDropdown && activeDropdown !== this) {
      activeDropdown.close();
    }

    activeDropdown = this;
  };

  close = () => {
    this.setState({
      visible: false
    });

    activeDropdown = null;
  };

  render() {
    const {
      className,
      down,
      hdir,
      children
    } = this.props;
    const {
      visible
    } = this.state;

    return (
      <div
        className={ClassName(`dropdown open-${hdir}`, className)}
        ref={this.rootRef}
      >
        <i
          className={ClassName('fa', down ? 'fa-sort-down' : 'fa-sort-up')}
          onClick={this.open}
        />
        {visible && (
          <div className="dropdown-list">
            {children}
          </div>
        )}
      </div>
    );
  }
}

$(document.body).on('click', ({ target }) => {
  const $target = $(target);

  if (!activeDropdown) {
    return;
  }

  const dropdown = $target.closest('.dropdown');

  if (!dropdown.length) {
    return activeDropdown.close();
  }

  const dropdownInstance = dropdown[0].boarderDropdown;

  if (dropdownInstance === activeDropdown) {
    return;
  }

  activeDropdown.close();
});
