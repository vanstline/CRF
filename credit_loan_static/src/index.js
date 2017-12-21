import React from 'react';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { default as App } from './js/index';
injectTapEventPlugin();

require('./js/utils/device/index.es6');
require('es6-promise/auto');
require('whatwg-fetch');
global.DateFormat = require('dateformat');
global.Common = require('./js/utils/common/index.es6');
global.CONFIGS = require('./js/config');
global.CRFFetch = require('./js/utils/ajax/index.es6');
global.HandleRegex = require('./js/utils/regex/index.es6');
global.VERSION = {
  cityDataVERSION : '201706202',
  bankDataVERSION : '201706202',
  cardBinVERSION  : '201706202',
};
localStorage.removeItem('r360');
localStorage.removeItem('isCrfApp');
localStorage.removeItem('isXYF');
localStorage.removeItem('isYouBai');
localStorage.removeItem('backPath');
localStorage.removeItem('isAppSmallChange');

if (CONFIGS.isR360) {
  localStorage.setItem('r360', CONFIGS.isR360);
  CONFIGS.backPath && localStorage.setItem('r360BackPath', CONFIGS.backPath);
}
if (CONFIGS.isCrfApp) {
  localStorage.setItem('isCrfApp', CONFIGS.isCrfApp);
}
if (CONFIGS.isXYF) {
  localStorage.setItem('isXYF', CONFIGS.isXYF);
}
if (CONFIGS.isYouBaiLocal) {
  localStorage.setItem('isYouBai', CONFIGS.isYouBaiLocal);
  CONFIGS.backPath && localStorage.setItem('backPath', CONFIGS.backPath);
}
if (CONFIGS.isAppSmallChange) {
  localStorage.setItem('isAppSmallChange', CONFIGS.isAppSmallChange);
  CONFIGS.backPath && localStorage.setItem('backPath', CONFIGS.backPath);
}


if (typeof Object.assign !== 'function') {
  Object.assign = require('object-assign');
}
render(<App history={hashHistory}/>, document.getElementById('app'));
