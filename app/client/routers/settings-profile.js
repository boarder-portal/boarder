import { D, Promise, Router, parseHTML } from 'dwayne';
import SettingsState from './settings';
import SettingsProfileStateTemplate from '../views/states/settings-profile.pug';
import { userFetch } from '../fetchers';
import AvatarsList from '../views/partials/avatars-list.pug';
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

        spinnerContainer: '.spinner-container',
        avatarsContainer: '.avatars',
        uploader: {
          $: '.uploader',

          uploadingAvatar: '.uploading-avatar',
          uploaderProgressBar: '.uploader-progress-bar',
          addAvatar: {
            $: '.add-avatar',

            avatarUploader: {
              $: '#avatar-uploader',

              $onChange: 'onFileSelect'
            }
          }
        }
      }
    }
  };

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
      user: {
        avatars,
        avatar: avatarURL
      }
    } = store;
    let promise = Promise.resolve(avatars);

    spinnerContainer.child(images.loading);

    if (!avatars) {
      promise = userFetch.getAllAvatars()
        .then(({ json }) => (
          D([null]).concat(json).$
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

        const { key } = D(avatars).find((avatar) => avatar && avatar.filename === avatarURL) || { key: -1 };

        avatarsContainer
          .child(key === -1 ? Infinity : key)
          .moveClass('current-avatar');
      });
  }

  onFileSelect({ target }) {
    const {
      user: { avatars }
    } = store;
    const file = target.files[0];
    const {
      uploader,
      uploadingAvatar,
      uploaderProgressBar,
      addAvatar,
      avatarsContainer
    } = this;

    if (!file) {
      uploadingAvatar.removeAttr('src');

      return;
    }

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
          data: new FormData(addAvatar.$[0]),
          onprogress({ loaded, total }) {
            uploaderProgressBar.css('height', `${ (1 - loaded / total) * height }px`);
          }
        })
      ))
      .then(({ json: avatar }) => {
        D(avatars).splice(avatars.length - 1, 0, avatar);

        uploadingAvatar.removeAttr('src');
        avatarsContainer
          .div('.avatar-container')
            .img('.avatar')
              .ref(avatar.filename);

        new Alert(AvatarAddedAlertTemplate, AVATAR_LOADED_SUCCESS, 'success', 'medium');
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
