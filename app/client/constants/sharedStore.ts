import SharedStore from 'common/utilities/SharedStore';

const storeValues = window.__STORE_VALUES__;

delete window.__STORE_VALUES__;

export default new SharedStore(storeValues);
