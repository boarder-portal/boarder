import _ from 'lodash';
import { Block, makeRoute, body, doc } from 'dwayne';
import template from './index.pug';
import {
  getBlobDataURL,
  timeout
} from '../../helpers';
import { ALERTS } from '../../constants';

class SettingsProfile extends Block {
  static template = template();
  static routerOptions = {
    name: 'settings-profile',
    parent: 'settings',
    path: '/profile'
  };

  constructor(opts) {
    super(opts);

    this.reset();
  }

  reset() {
    _.assign(this, {
      canRequest: true,
      avatarsFetching: false,
      avatars: [],
      uploadingAvatar: null,
      uploadingAvatarSrc: null
    });
  }

  beforeLoadRoute() {
    this.avatarsFetching = true;

    this.globals.userFetch
      .getAllAvatars()
      .then(({ json: avatars }) => {
        this.avatars = _.sortByField(avatars, 'createdAt', true);
      })
      .finally(() => {
        this.avatarsFetching = false;
      });
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.settings_profile'));
    }, 0);
  }

  beforeLeaveRoute() {
    this.reset();
  }

  afterConstruct() {
    this.watch('uploadingAvatar', this.onFileSelect);
  }

  blockRequests() {
    body.wait();

    this.canRequest = false;
  }

  unblockRequests() {
    body.unwait();

    this.canRequest = true;
  }

  onFileSelect = () => {
    const {
      uploadingAvatar,
      addAvatarForm,
      avatars
    } = this;
    const file = uploadingAvatar && uploadingAvatar[0];

    if (!file) {
      return;
    }

    this.avatarUploading = true;
    this.localAvatarLoaded = false;
    this.formData = new FormData(addAvatarForm.$[0]);

    this.blockRequests();

    getBlobDataURL(file).then((url) => {
      this.uploadingAvatarSrc = url;
      this.avatars = [
        {
          url,
          loading: true,
          uploaderProgressBarStyle: null,
          isUploading: true
        },
        ...avatars
      ];
    });
  };

  changeUploadingAvatar(data) {
    const { avatars } = this;

    this.avatars = [
      {
        ...avatars[0],
        ...data
      },
      ...avatars.slice(1)
    ];
  }

  onLocalAvatarLoaded = (avatar) => {
    if (avatar.url !== this.uploadingAvatarSrc) {
      return;
    }

    const { avatarsElem } = this;
    const uploader = avatarsElem.find('.avatar-container').elem(1);
    const uploadingAvatarElem = uploader.find('.avatar');

    const {
      left: cLeft,
      top: cTop
    } = uploader.$[0].getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = uploadingAvatarElem.$[0].getBoundingClientRect();

    this.changeUploadingAvatar({
      uploaderProgressBarStyle: {
        left: `${ left - cLeft - 1 }px`,
        top: `${ top - cTop - 1 }px`,
        width: `${ width }px`,
        height: `${ height }px`
      }
    });

    timeout(200)
      .then(() => {
        this.changeUploadingAvatar({
          loading: false
        });

        return timeout(800);
      })
      .then(() => (
        this.globals.userFetch
          .uploadAvatar({
            data: this.formData,
            onprogress: ({ loaded, total }) => {
              this.changeUploadingAvatar({
                uploaderProgressBarStyle: {
                  ...this.avatars[0].uploaderProgressBarStyle,
                  height: `${ (1 - loaded / total) * height }px`
                }
              });
            }
          })
      ))
      .then(({ json: avatar }) => {
        this.changeUploadingAvatar({
          ...avatar,
          isUploading: false,
          url: this.uploadingAvatarSrc
        });
        this.globals.addAlert(ALERTS.AVATAR_ADDED);
      })
      .finally(() => {
        this.uploadingAvatar = doc.input('$type(file)').prop('files');
        this.uploadingAvatarSrc = null;
        this.unblockRequests();
      });
  };

  chooseAvatar = (avatar) => {
    const { canRequest } = this;

    if (!canRequest) {
      return;
    }

    this.blockRequests();
    this.globals.userFetch
      .changeAvatar({
        data: {
          avatarId: avatar.id
        }
      })
      .then(() => {
        this.globals.changeUser({
          avatar: avatar.url
        });
        this.globals.addAlert(ALERTS.AVATAR_CHANGED);
      })
      .finally(() => {
        this.unblockRequests();
      });
  };

  deleteAvatar = ({ id, url }) => {
    const {
      canRequest,
      avatars,
      globals: { user }
    } = this;

    if (!canRequest) {
      return;
    }

    this.blockRequests();
    this.globals.avatarsFetch
      .delete({
        query: {
          avatarId: id
        }
      })
      .then(() => {
        const index = _.findIndex(avatars, { id });

        this.avatars = [
          ...avatars.slice(0, index),
          ...avatars.slice(index + 1)
        ];

        if (user.avatar === url) {
          this.globals.changeUser({
            avatar: null
          });
        }
      })
      .finally(() => {
        this.unblockRequests();
      });
  };
}

Block.block('SettingsProfile', SettingsProfile.wrap(
  makeRoute()
));
