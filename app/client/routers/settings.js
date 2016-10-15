import { body, find } from 'dwayne';
import BaseState from './base';
import SettingsStateTemplate from '../views/states/settings.pug';

class SettingsState extends BaseState {
  static abstract = true;
  static stateName = 'settings';
  static path = '/settings';
  static template = SettingsStateTemplate;
}

body.on('click', '.settings-state .settings-menu > .active', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

SettingsState.on('render', ({ state }) => {
  find(`.settings-state .settings-menu > [state="${ state.name }"]`).moveClass('active');
});

export default SettingsState;
