import { D, Router } from 'dwayne';
import SettingsState from './settings';
import SettingsProfileStateTemplate from '../views/states/settings-profile.pug';

class SettingsProfileState extends SettingsState {
  static stateName = 'settings-profile';
  static path = '/profile';
  static template = SettingsProfileStateTemplate;
}

Router.on('init', () => {
  D(SettingsState.templateParams).deepAssign({
    links: {
      settingsProfileLink: SettingsProfileState.buildURL()
    }
  });
});

export default SettingsProfileState;
