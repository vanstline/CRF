(function() {
  if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }
  let u = navigator.userAgent;
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  let deviceWidth = screen.width;
  let deviceHeight = screen.height;
  if (isiOS) {
    // if (deviceWidth === 320 && deviceHeight === 568) { // iphone 5
    //   flex(90, 1);
    // } else if (deviceWidth === 414 && deviceHeight === 736) { // iphone 6p
    //   flex(110, 1);
    // } else if (deviceWidth === 768 && deviceHeight === 1024) { // iPad
    //   flex(200, 1);
    // } else if (deviceWidth === 1024 && deviceHeight === 1366) { // iPad Pro
    //   flex(280, 1);
    // }
  } else if (isAndroid) {

  }
})();
