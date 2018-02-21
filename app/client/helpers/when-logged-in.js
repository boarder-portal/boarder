import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { userType } from '../constants';

export function whenLoggedIn(OriginalComponent) {
  const withUserComponent = class extends Component {
    static displayName = `whenLoggedIn(${OriginalComponent.displayName || OriginalComponent.name || 'Component'})`;
    static propTypes = {
      user: userType
    };

    render() {
      const {
        user,
        ...props
      } = this.props;

      if (!user) {
        return (
          <Redirect
            to={`/login?from=${encodeURIComponent(props.location.pathname)}`}
            push={false}
          />
        );
      }

      return (
        <OriginalComponent {...props} />
      );
    }
  };

  return connect((state) => ({
    user: state.user
  }))(withUserComponent);
}
