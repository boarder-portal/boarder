import { D, Promise, Router } from 'dwayne';
import SettingsState from './settings';
import SettingsProfileStateTemplate from '../views/states/settings-profile.pug';
import { userFetch } from '../fetchers';

class SettingsProfileState extends SettingsState {
  static stateName = 'settings-profile';
  static path = '/profile';
  static template = SettingsProfileStateTemplate;
  static elements = {
    changeAvatarSection: {
      $: '.change-avatar-section',

      avatarContainer: {
        $: '.avatar-container',

        avatar: '.avatar',
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
  };

  onFileSelect({ target }) {
    const {
      avatarContainer,
      avatar,
      uploaderProgressBar,
      addAvatar
    } = this;
    const file = target.files[0];

    if (!file) {
      avatar.removeAttr('src');

      return;
    }

    D(file)
      .readAs('dataURL')
      .then((url) => {
        avatar
          .css('visibility', 'hidden')
          .ref(url);

        return avatar.load();
      })
      .then(() => {
        const {
          left: cLeft,
          top: cTop
        } = avatarContainer.$[0].getBoundingClientRect();
        const {
          left,
          top,
          width,
          height
        } = avatar.$[0].getBoundingClientRect();

        uploaderProgressBar.css({
          left: `${ left - cLeft - 1 }px`,
          top: `${ top - cTop - 1 }px`,
          width: `${ width }px`,
          height: `${ height }px`
        });

        return D(200).timeout(height);
      })
      .then((height) => {
        avatar.removeCSS('visibility');

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
      .then(() => {
        console.log('success');
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
