
let Common = {
  ua: window.navigator.userAgent,
  returnReferrerUrl() {
    let localHref = location.href;
    return localHref.substring(localHref.indexOf('?') + 1);
  },
  returnPara(name) {
    let urlSearch = location.search;
    let urlParaArr;
    if (urlSearch != '') {
      urlSearch = urlSearch.substring(1);
    } else {
      let urlHref = location.href;
      urlSearch = urlHref.substring(urlHref.indexOf('?') + 1);
      let isNotRuleUrl = urlHref.indexOf('?https') > -1 && urlHref.indexOf('/?https') < 42;//为了处理不符合规范的URL
      if (urlSearch.indexOf('consumption') > -1 || isNotRuleUrl) {
        let val = urlSearch.substring(urlSearch.indexOf('?') + 1).match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));
        return val && val[2];
      }
    }

    urlParaArr = urlSearch.match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));
    return urlParaArr && urlParaArr[2];
  },
  returnKissoID() {
    const name = 'ssoId';
    return this.returnPara(name);
  },
  isWeChat() {
    return /micromessenger/i.test(this.ua);
  },
  isAliPay() {
    return /alipay|aliapp|AlipayClient/i.test(this.ua);
  },
  isR360Local() {
    if (this.getAllToken().channelNo === 'P201611290') {
      return true;
    }
    return localStorage.getItem('r360') === 'true';
  },
  isCrfAppLocal() {
    if (window.CRFAPP && window.CRFAPP.getParameters) {
      return true;
    }
    let appVersion = this.returnPara('appVersion');
    let versionCode = this.returnPara('versionCode');
    if (appVersion || versionCode) {
      return (appVersion && appVersion != '') || (versionCode && versionCode != '');
    }
    return localStorage.getItem('isCrfApp') === 'true';
  },
  isYouBaiLocal() {
    let allToken = this.getAllToken();
    if (allToken.productNo === 'P5001004') {
      localStorage.setItem('productNo', allToken.productNo);
      localStorage.setItem('deviceType', allToken.deviceType);
      return true;
    }
    return localStorage.getItem('isYouBai') === 'true';
  },
  isXYFLocal() {
    let allToken = this.getAllToken();
    if (allToken.productNo === 'P5001003') {
      localStorage.setItem('productNo', allToken.productNo);
      localStorage.setItem('deviceType', allToken.deviceType);
      return true;
    }
    return localStorage.getItem('isXYF') === 'true';
  },
  isAppSmallChange() {
    if (this.returnPara('isAppSmallChange')) {
      localStorage.setItem('isAppSmallChange', 'true');
      return true;
    } else {
      return false;
    }
  },
  getReturnUrl() {
    const URL = decodeURIComponent(this.returnPara('return_url'));
    if (URL) {
      localStorage.setItem('backPath', URL);
      return URL;
    }
    return localStorage.getItem('backPath');
  },
  getAppVersion() {
    let appVersion = this.returnPara('appVersion');
    let versionCode = this.returnPara('versionCode');
    const appInfo = window.CRFAPP && window.CRFAPP.getParameters && JSON.parse(window.CRFAPP.getParameters());
    if (appVersion || versionCode) {
      return appVersion || versionCode;
    } else {
      return appInfo && appInfo['Version-Code'];
    }
  },
  getProductNo() {
    const productNo = this.returnPara('productNo');
    if (productNo) {
      if (this.returnPara('productNo')) {
        localStorage.setItem('CRF_productNo', productNo);
        return productNo;
      } else {
        return localStorage.getItem('CRF_productNo');
      }
    } else {
      let allToken = this.getAllToken();
      return (allToken && allToken.productNo);
    }
  },
  splitEntrance(str) {
    const splitChannelIndex = str.lastIndexOf('_') + 1;
    const splitProductIndex = str.indexOf('_') + 1;
    return {
      channel: str.substring(splitProductIndex, splitChannelIndex - 1),
      product: str.substring(splitChannelIndex),
    };
  },
  getAllToken() {
    const entrance = this.returnPara('entrance');
    if (entrance) {
      const channelNo = this.splitEntrance(entrance).channel;
      const productNo = this.splitEntrance(entrance).product;
      return {
        deviceType: entrance,
        channelNo: channelNo,
        productNo: productNo,
      };
    } else {
      return {};
    }
  },
  isAdapt() {
    let adapt;
    if (screen.availWidth/screen.availHeight >= 0.659 || document.body.scrollWidth/document.body.scrollHeight >= 0.659 || screen.availWidth <= 320) {
      adapt = true;
    }
    return adapt;
  },
  showTopTips() {
    let referrerUrl = this.returnReferrerUrl();
    let localHash = referrerUrl.substring(referrerUrl.indexOf('consumption/#/') + 13, referrerUrl.indexOf('?'));

    switch (localHash) {
      case '/':
        return false;
      case '/loan':
        return true;
    }
  },
  random32word() {
    let str = '';
    let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    for (let i = 0; i < 32; i++) {
      str += arr[parseInt(Math.random() * arr.length)];
    }

    return str;
  },
  setDocTitle(title) {
    document.title = title;
    if (this.isWeChat()) {
      document.setTitle(title);
    } else if (this.isAliPay()) {
      this.AliReady(function () {
        //noinspection JSUnresolvedVariable
        AlipayJSBridge.call('setTitle', {
          title: title,
        });
      });
    }
  },
  //aliToLink: function(link) {//支付宝提供的跳转，
  //  this.AliReady(function(){
  //    AlipayJSBridge.call('pushWindow', {
  //      url: link,
  //      param: {
  //        readTitle: true,
  //        showOptionMenu: false
  //      }
  //    });
  //  });
  //},
  closeAliPay() {
    this.AliReady(function(){
      AlipayJSBridge.call('popWindow');
    });
  },
  AliReady(callback) {
    //noinspection JSUnresolvedVariable
    if (window.AlipayJSBridge) {
      callback && callback();
    } else {
      document.addEventListener('AlipayJSBridgeReady', callback, false);
    }
  },
  customPopState(fn) {
    let refUrl = CONFIGS.referrerUrl;//首页点击绑卡过来返回首页 产品页过来返回产品页面（点击确认跳转支付页面）

    if (refUrl) {
      if (refUrl.indexOf('#/loan?') > -1) {
        refUrl = CONFIGS.referrerUrl.replace('#/loan?','#/recharge?');
      }

      //回退
      window.addEventListener("popstate", fn.bind(this, refUrl), false);

      let state = {
        title: "",
        url: ""
      };
      window.history.pushState(state, "", "");
    }

  },
  popStateFn(fn) {
    /*window.addEventListener('popstate', function(e){
      Common.isType('Function')(fn) && fn();
    }, false);*/
    window.onpopstate = function() {
      Common.isType('Function')(fn) && fn();
    };

    let state = {
      title: '',
      url: '',
    };
    window.history.pushState(state, '', '');
  },
  unBindPopStateFn(fn) {
    window.removeEventListener('popstate', fn);
  },
  isIos() {
    return !!this.ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  },
  isType(type) {
    return function (obj) {
      return Object.prototype.toString.call(obj) == '[object ' + type + ']';
    };
  },
  getArrMaxValue(arr) {
    return Math.max.apply(Math, arr);
  },
  isOnlyDay(dayArray) {
    let isOnlyDay = false;
    const onlyDayArray = CONFIGS.onlyDayArray;
    for (let i = 0, len = onlyDayArray.length; i < len; i++) {
      if (dayArray[0] === onlyDayArray[i]) {
        isOnlyDay = true;
        break;
      }
    }
    return isOnlyDay;
  },
  getBaseUrl() {
    const origin = location.origin;
    if (origin.indexOf('dev') > -1) {
      return origin;
    }
    return `${origin}/credit_loan`;
  }
};

module.exports = Common;
