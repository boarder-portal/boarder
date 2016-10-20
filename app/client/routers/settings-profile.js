import { D, Promise, Router, parseHTML, body } from 'dwayne';
import SettingsState from './settings';
import SettingsProfileStateTemplate from '../views/states/settings-profile.pug';
import { userFetch, avatarsFetch } from '../fetchers';
import UploaderInput from '../views/partials/uploader-input.pug';
import AvatarDelete from '../views/partials/avatar-delete.pug';
import AvatarsList from '../views/partials/avatars-list.pug';
import AvatarUploader from '../views/partials/avatar-uploader.pug';
import AvatarAddedAlertTemplate from '../views/alerts/avatar-added.pug';
import AvatarChangedAlertTemplate from '../views/alerts/avatar-changed.pug';
import { Alert } from '../helpers';
import { images, store, AVATAR_LOADED_SUCCESS, AVATAR_CHANGED_SUCCESS } from '../constants';

class SettingsProfileState extends SettingsState {
  static stateName = 'settings-profile';
  static path = '/profile';
  static template = SettingsProfileStateTemplate;
  static elements = {
    changeAvatarSection: {
      $: '.change-avatar-section',

      avatarContainer: {
        $: '.main.avatar-container',

        mainAvatar: '.main.avatar',

        spinnerContainer: '.spinner-container',
        avatarsContainer: '.avatars',
        toUpload: {
          $: '.to-upload',

          addAvatar: {
            $: '.add-avatar',

            uploadFileBtn: '.upload-file-btn',
            avatarUploader: {
              $: '#avatar-uploader',

              $onChange: 'onFileSelect'
            }
          }
        }
      }
    }
  };

  canRequest = true;

  onLoad() {
    this.templateParams.user = store.user;
  }

  onRender() {
    const {
      spinnerContainer,
      avatarsContainer
    } = this;
    const {
      user,
      user: { avatars }
    } = store;
    let promise = Promise.resolve(avatars);

    spinnerContainer.child(images.loading);
    this.insertInput();
    this.setAvatar();

    if (!avatars) {
      promise = userFetch.getAllAvatars()
        .then(({ json }) => (
          D(json).sortBy('createdAt', true).$
        ));
    }

    promise
      .catch(() => [])
      .then((avatars) => {
        user.avatars = avatars;

        spinnerContainer.hide();
        avatarsContainer.removeClass('hidden');

        parseHTML(
          AvatarsList({ avatars })
        ).into(avatarsContainer);

        this.setAvatar();

        avatarsContainer.on('click', '.avatar-container, .avatar-container > .avatar', this.chooseAvatar.bind(this));
        avatarsContainer.on('click', '.delete-avatar, .delete-avatar .fa-trash-o', this.deleteAvatar.bind(this));
      });
  }

  chooseAvatar({ target }) {
    const { avatarsContainer } = this;
    const {
      user,
      user: {
        avatars
      }
    } = store;

    if (!this.canRequest) {
      return;
    }

    const container = D(target).closest('.avatar-container');
    const index = avatarsContainer.children().indexOf(container.$[0]);

    if (index > 0) {
      const avatar = avatars[index - 1];

      this.blockRequests();
      userFetch
        .changeAvatar({
          data: {
            avatarId: avatar.id
          }
        })
        .then(() => {
          user.avatar = avatar.url;

          this.changeAvatar();
          this.setAvatar();

          new Alert(AvatarChangedAlertTemplate, AVATAR_CHANGED_SUCCESS, 'success', 'medium');
        })
        .catch(() => {})
        .then(() => {
          this.unblockRequests();
        });
    }
  }

  deleteAvatar({ target }) {
    const { avatarsContainer } = this;
    const {
      user,
      user: {
        avatars
      }
    } = store;

    if (!this.canRequest) {
      return;
    }

    const container = D(target).closest('.avatar-container');
    let index = avatarsContainer.children().indexOf(container.$[0]);

    if (index !== -1) {
      const avatar = avatars[index - 1];

      this.blockRequests();
      avatarsFetch
        .delete({
          query: {
            avatarId: avatar.id
          }
        })
        .then(() => {
          index = D(avatars).find(({ id }) => id === avatar.id).key;

          avatars.splice(index, 1);
          container.remove();

          if (avatar.url === user.avatar) {
            user.avatar = null;

            this.changeAvatar();
            this.setAvatar();
          }
        })
        .catch(() => {})
        .then(() => {
          this.unblockRequests();
        });
    }
  }

  setAvatar() {
    const {
      mainAvatar,
      avatarsContainer
    } = this;
    const {
      avatar,
      avatars
    } = store.user;

    if (avatar && mainAvatar.ref() !== avatar) {
      mainAvatar.ref(avatar);
    } else if (!avatar) {
      mainAvatar.removeAttr('src');
    }

    const { key } = D(avatars).find(({ url }) => url === avatar) || { key: -1 };

    avatarsContainer
      .child(key === -1 ? Infinity : key + 1)
      .moveClass('current-avatar');
  }

  insertInput() {
    const { uploadFileBtn } = this;
    const avatarUploader = parseHTML(
      UploaderInput()
    );

    avatarUploader.on('change', this.onFileSelect.bind(this));
    avatarUploader.into(uploadFileBtn);

    this.avatarUploader = avatarUploader;
  }

  blockRequests() {
    const {
      avatarUploader,
      uploadFileBtn
    } = this;

    body.wait();
    avatarUploader.remove();
    uploadFileBtn.addClass('forbidden');

    this.canRequest = false;
  }

  unblockRequests() {
    body.unwait();
    this.insertInput();
    this.uploadFileBtn.removeClass('forbidden');

    this.canRequest = true;
  }

  onFileSelect({ target }) {
    const {
      user: { avatars }
    } = store;
    const file = target.files[0];
    const {
      addAvatar,
      toUpload
    } = this;

    if (!file) {
      return;
    }

    const fd = new FormData(addAvatar.$[0]);
    const uploader = parseHTML(
      AvatarUploader()
    ).insertAfter(toUpload);
    const uploadingAvatar = uploader.find('.avatar');
    const uploaderProgressBar = uploader.find('.uploader-progress-bar');

    this.blockRequests();

    D(file)
      .readAs('dataURL')
      .then((url) => {
        uploadingAvatar
          .css('visibility', 'hidden')
          .ref(url);

        return uploadingAvatar.load();
      })
      .then(() => {
        const {
          left: cLeft,
          top: cTop
        } = uploader.$[0].getBoundingClientRect();
        const {
          left,
          top,
          width,
          height
        } = uploadingAvatar.$[0].getBoundingClientRect();

        uploaderProgressBar.css({
          left: `${ left - cLeft - 1 }px`,
          top: `${ top - cTop - 1 }px`,
          width: `${ width }px`,
          height: `${ height }px`
        });

        return D(200).timeout(height);
      })
      .then((height) => {
        uploadingAvatar.removeCSS('visibility');

        return D(800).timeout(height);
      })
      .then((height) => (
        userFetch.uploadAvatar({
          data: fd,
          onprogress({ loaded, total }) {
            uploaderProgressBar.css('height', `${ (1 - loaded / total) * height }px`);
          }
        })
      ))
      .then(({ json: avatar }) => {
        avatars.unshift(avatar);

        uploader.child(
          parseHTML(
            AvatarDelete()
          )
        );

        new Alert(AvatarAddedAlertTemplate, AVATAR_LOADED_SUCCESS, 'success', 'medium');
      })
      .catch(() => {
        uploader.remove();
      })
      .then(() => {
        this.unblockRequests();
      });
  }
}

Router.on('init', () => {
  D(SettingsState.templateParams).deepAssign({
    links: {
      settingsProfileLink: SettingsProfileState.buildURL()
    }
  });
});

export default SettingsProfileState;
