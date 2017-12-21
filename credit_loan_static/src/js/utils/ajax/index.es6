require('es6-promise/auto');
require('whatwg-fetch');

const _fetch = (requestPromise, timeout = 60000) => {
  let timeoutAction = null;
  const timerPromise = new Promise((resolve, reject) => {
    timeoutAction = () => {
      reject('timeout');
    }
  });
  setTimeout(() => {
    timeoutAction()
  }, timeout);
  return Promise.race([requestPromise, timerPromise]);
};


function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    error.body = response.json();
    throw error;
  }
}

function returnResponse(response) {
  return response;
}

function parseJSON(response) {
  return response.json();
}

const FetchInterface = {
  // do get
  Get(url: string, httpHeaders?: { [name: string]: any }, parse = parseJSON, timeOut: number) {
    let customHttpHeaders = Object.assign({}, httpHeaders);
    let defer = new Promise((resolve, reject) => {
      _fetch(fetch(url, {
        method: 'GET',
        headers: customHttpHeaders,
        credentials: 'include',
        mode: 'cors'
      }), timeOut)
      .then(checkStatus)
      .then(parse)
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        //捕获异常
        reject(error)
      })
    });

    return defer;
  },
  // do post
  Post(url: string, parmJson?: { [name: string]: any }, extraHeaders?: { [name: string]: any }, timeOut: number) {
    let requestHeaders = Object.assign({}, extraHeaders);
    let defer = new Promise((resolve, reject) => {
      _fetch(fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: parmJson,
        credentials: 'include',
        mode: 'cors'
      }), timeOut)
      .then(checkStatus)
      .then(parseJSON)
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        //捕获异常
        reject(error)
      })
    });

    return defer;
  },
  // do put
  Put(url: string, parmJson?: { [name: string]: any }, extraHeaders?: { [name: string]: any }, timeOut: number) {
    let requestHeaders = Object.assign({}, extraHeaders);
    let defer = new Promise((resolve, reject) => {
      _fetch(fetch(url, {
        method: 'PUT',
        headers: requestHeaders,
        body: parmJson,
        credentials: 'include',
        mode: 'cors'
      }), timeOut)
      .then(checkStatus)
      //.then(parseJSON)
      .then(returnResponse)
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        //捕获异常
        reject(error)
      })
    });

    return defer;
  },
  handleError(err, Toast, callback, fn) {

    if (err === 'timeout') {
      Toast.info('系统超时，请稍后再试');
    } else {
      let msg = err && err.body;
      let status = err && err.response && err.response.status;

      if (!fn) {
        fn = () => location.reload();
      }

      switch(status) {
        case 400:

          break;
        case 401:
          if (window['CRFAPP'] && window['CRFAPP']['getParameters'] || Common.getAppVersion() >= 40) {
            // Toast.info(Common.getAppVersion()); window.CRFAPP.getParameters()
            if (location.href.indexOf('#Login') === -1) { // 加hash不刷新页面，就无法触发IOS跳转，所以加上reload
              location.href = `${location.href}&login=#Login`;
              setTimeout(() => {
                if (Common.isIos() && location.href.indexOf('reCall') === -1) { // ios 需要刷新
                  location.href = `${location.href}&login=#Login&reCall=1`;
                }
              }, 100);
            }
          } else if (Common.isCrfAppLocal()) {
            location.href = '#Login';
          } else {
            CRFLogin.initialize(fn);
          }
          break;
        case 403:
          Toast.info('您没有权限做此操作，请返回重试！');
          break;
        case 404:
          Toast.info('资源已经移除，访问出错！');
          break;
        case 500:
        case 502:
        case 504:
          Toast.info('哎呀，服务器开小差了，请稍后再试吧!');
          break;
        default:
          msg && msg.then(data => {
            Toast.info(data.message);
          });
      }
      typeof callback === 'function' && callback();
    }

  }
}

module.exports = FetchInterface;
