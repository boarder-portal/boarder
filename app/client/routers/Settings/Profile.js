import _ from 'lodash';
import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ClassName from 'classnames';

import { ALERTS, avatarsFetch, userFetch, userType } from '../../constants';
import { addAlert, changeUserData } from '../../actions';
import { getBlobDataURL, setPageTitle, timeout } from '../../helpers';
import { Caption, Input, Popup, Spinner } from '../../components';

class Profile extends Component {
  static propTypes = {
    user: userType.isRequired,
    addAvatarAddedAlert: PropTypes.func.isRequired,
    addAvatarChangedAlert: PropTypes.func.isRequired,
    changeUserData: PropTypes.func.isRequired
  };

  state = {
    canRequest: true,
    avatarsFetching: false,
    avatars: []
  };

  async componentDidMount() {
    setPageTitle('settings_profile');

    this.setState({
      avatarsFetching: true
    });

    try {
      const { json: avatars } = await userFetch.getAllAvatars();

      this.setState({
        avatars: _.sortByField(avatars, 'createdAt', true)
      });
    } finally {
      this.setState({
        avatarsFetching: false
      });
    }
  }

  avatarsContainerRef = (container) => {
    this.$avatarsContainer = $(container);
  };

  addAvatarFormRef = (form) => {
    this.addAvatarForm = form;
  };

  blockRequests() {
    $(document.body).wait();

    this.setState({
      canRequest: false
    });
  }

  unblockRequests() {
    $(document.body).unwait();

    this.setState({
      canRequest: true
    });
  }

  changeUploadingAvatar(data) {
    this.setState(({ avatars }) => ({
      avatars: [
        {
          ...avatars[0],
          ...data
        },
        ...avatars.slice(1)
      ]
    }));
  }

  onFileSelect = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    this.blockRequests();
    this.setState({
      avatarUploading: true
    });
    this.formData = new FormData(this.addAvatarForm);

    const url = await getBlobDataURL(file);

    this.setState(({ avatars }) => ({
      avatars: [
        {
          url,
          loading: true,
          uploaderProgressBarStyle: null,
          isUploading: true
        },
        ...avatars
      ]
    }));
    this.uploadingAvatarSrc = url;
  };

  onAvatarLoaded = async (avatar) => {
    if (avatar.url !== this.uploadingAvatarSrc) {
      return;
    }

    const {
      addAvatarAddedAlert
    } = this.props;

    const $uploader = this.$avatarsContainer.find('.avatar-container').eq(1);
    const $uploadingAvatarElem = $uploader.find('.avatar');

    const {
      left: cLeft,
      top: cTop
    } = $uploader[0].getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = $uploadingAvatarElem[0].getBoundingClientRect();

    this.changeUploadingAvatar({
      uploaderProgressBarStyle: {
        left: left - cLeft - 1,
        top: top - cTop - 1,
        width,
        height
      }
    });

    await timeout(200);

    this.changeUploadingAvatar({
      loading: false
    });

    await timeout(800);

    try {
      const { json: newAvatar } = await userFetch.uploadAvatar({
        data: this.formData,
        onUploadProgress: ({ loaded, total }) => {
          this.changeUploadingAvatar({
            uploaderProgressBarStyle: {
              ...this.state.avatars[0].uploaderProgressBarStyle,
              height: (1 - loaded / total) * height
            }
          });
        }
      });

      this.changeUploadingAvatar({
        ...newAvatar,
        isUploading: false,
        url: this.uploadingAvatarSrc
      });
      addAvatarAddedAlert();
    } finally {
      this.uploadingAvatarSrc = null;
      this.unblockRequests();
    }
  };

  chooseAvatar = async ({ id, url }) => {
    if (!this.state.canRequest) {
      return;
    }

    const {
      addAvatarChangedAlert,
      changeUserData
    } = this.props;

    this.blockRequests();

    try {
      await userFetch.changeAvatar({
        data: {
          avatarId: id
        }
      });

      changeUserData({
        avatar: url
      });
      addAvatarChangedAlert();
    } finally {
      this.unblockRequests();
    }
  };

  deleteAvatar = async ({ id, url }) => {
    if (!this.state.canRequest) {
      return;
    }

    const {
      user,
      changeUserData
    } = this.props;

    this.blockRequests();

    try {
      await avatarsFetch.delete({
        query: {
          avatarId: id
        }
      });

      this.setState(({ avatars }) => {
        const index = _.findIndex(avatars, { id });

        return {
          avatars: [
            ...avatars.slice(0, index),
            ...avatars.slice(index + 1)
          ]
        };
      });

      if (user.avatar === url) {
        changeUserData({
          avatar: null
        });
      }
    } finally {
      this.unblockRequests();
    }
  };

  render() {
    const {
      user
    } = this.props;
    const {
      canRequest,
      avatarsFetching,
      avatars
    } = this.state;

    return (
      <div className="route route-settings-profile">
        <div className="settings-instance-section change-avatar-section">

          <Caption
            value="settings.states.profile.avatar.header"
            tag="h2"
            className="settings-instance-section-header"
          />

          <div className="main avatar-container">

            <img
              className="main avatar"
              src={user.avatar}
            />

            <div className="avatar-replacement">
              <i className="fa fa-image" />
            </div>

            <div className="open-popup" />

            <Popup>
              <div className="avatars-container">

                {avatarsFetching && (
                  <div className="spinner-container">
                    <Spinner />
                  </div>
                )}

                <div className="avatars" ref={this.avatarsContainerRef}>
                  <div className="avatar-container to-upload">
                    <form className="add-avatar" ref={this.addAvatarFormRef}>
                      <label className={ClassName('upload-file-btn', {
                        forbidden: !canRequest
                      })}>
                        <Input
                          className="hidden"
                          name="avatar"
                          type="file"
                          accept="image/png, image/jpeg"
                          disabled={!canRequest}
                          onChange={this.onFileSelect}
                        />
                        <i className="fa fa-upload" />
                      </label>
                    </form>
                  </div>
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.url}
                      className={ClassName('avatar-container', {
                        'current-avatar': avatar.url === user.avatar
                      })}
                    >

                      <img
                        className="avatar"
                        src={avatar.url}
                        onClick={() => this.chooseAvatar(avatar)}
                        onLoad={() => this.onAvatarLoaded(avatar)}
                        onError={() => this.onAvatarLoaded(avatar)}
                        style={{
                          visibility: avatar.loading && 'hidden'
                        }}
                      />

                      <div
                        className="uploader-progress-bar"
                        style={avatar.uploaderProgressBarStyle}
                      />

                      {!avatar.isUploading && (
                        <div
                          className="delete-avatar"
                          onClick={() => this.deleteAvatar(avatar)}
                        >
                          <i className="fa fa-trash-o" />
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

            </Popup>

          </div>

        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  user: state.user
}), (dispatch) => ({
  addAvatarAddedAlert() {
    dispatch(addAlert(ALERTS.AVATAR_ADDED));
  },
  addAvatarChangedAlert() {
    dispatch(addAlert(ALERTS.AVATAR_CHANGED));
  },
  changeUserData(userData) {
    dispatch(changeUserData(userData));
  }
}))(Profile);
