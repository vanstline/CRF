import { AppContainer as HotReloader } from 'react-hot-loader';
import React from 'react';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import RedBox from 'redbox-react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { default as App } from './js/index';
injectTapEventPlugin();
//alert('location.href--' + location.href);
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

console.log('branch annual fee result');
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


if (process.env.NODE_ENV === 'development') {
  const renderRoot = () => render(
    <HotReloader errorReporter={RedBox}>
      <App history={hashHistory}/>
    </HotReloader>,
    document.getElementById('app')
  );
  renderRoot();
  if (module.hot) {
    module.hot.accept('./js/containers/index', renderRoot);
  }
} else {
  render(<App history={hashHistory}/>, document.getElementById('app'));
}
