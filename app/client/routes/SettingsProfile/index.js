import { D, Block, makeRoute, body, doc } from 'dwayne';
import template from './index.pug';
import {
  alertTypes,
  AVATAR_LOADED_SUCCESS,
  AVATAR_CHANGED_SUCCESS
} from '../../constants';

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
    D(this).assign({
      canRequest: true,
      avatarsFetching: false,
      avatars: [],
      uploadingAvatar: null,
      uploadingAvatarSrc: null
    });
  }

  beforeLoadRoute() {
    this.avatarsFetching = true;

    this.global.userFetch
      .getAllAvatars()
      .then(({ json: avatars }) => {
        this.avatars = D(avatars).sortBy('createdAt', true).$;
      })
      .finally(() => {
        this.avatarsFetching = false;
      });
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

    D(file)
      .readAs('dataURL')
      .then((url) => {
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

    D(200)
      .timeout()
      .then(() => {
        this.changeUploadingAvatar({
          loading: false
        });

        return D(800).timeout();
      })
      .then(() => (
        this.global.userFetch
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
        this.global.addAlert({
          type: alertTypes.AVATAR_ADDED,
          level: 'success',
          priority: 'medium',
          duration: AVATAR_LOADED_SUCCESS
        });
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
    this.global.userFetch
      .changeAvatar({
        data: {
          avatarId: avatar.id
        }
      })
      .then(() => {
        this.global.changeUser({
          avatar: avatar.url
        });
        this.global.addAlert({
          type: alertTypes.AVATAR_CHANGED,
          level: 'success',
          priority: 'medium',
          duration: AVATAR_CHANGED_SUCCESS
        });
      })
      .finally(() => {
        this.unblockRequests();
      });
  };

  deleteAvatar = (avatar) => {
    const {
      canRequest,
      avatars,
      global: { user }
    } = this;

    if (!canRequest) {
      return;
    }

    this.blockRequests();
    this.global.avatarsFetch
      .delete({
        query: {
          avatarId: avatar.id
        }
      })
      .then(() => {
        const index = D(avatars).find(({ id }) => id === avatar.id).key;

        this.avatars = [
          ...avatars.slice(0, index),
          ...avatars.slice(index + 1)
        ];

        if (user.avatar === avatar.url) {
          this.global.changeUser({
            avatar: null
          });
        }
      })
      .finally(() => {
        this.unblockRequests();
      });
  };
}

const wrap = SettingsProfile
  .wrap(makeRoute());

Block.register('SettingsProfile', wrap);
