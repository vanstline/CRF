(function() {
  let u = navigator.userAgent;
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  let deviceWidth = screen.width;
  let deviceHeight = screen.height;
  
  if (isiOS) {
    if (deviceWidth === 320 && deviceHeight === 568) { // iphone 5
      document.documentElement.style.fontSize = '280%';
    } else if (deviceWidth === 375 && deviceHeight === 667) { // iphone 6
      document.documentElement.style.fontSize = '300%';
    } else if (deviceWidth === 414 && deviceHeight === 736) { // iphone 6p
      document.documentElement.style.fontSize = '320%';
    } else if (deviceWidth === 768 && deviceHeight === 1024) { // iPad
      document.documentElement.style.fontSize = '500%';
    } else if (deviceWidth === 1024 && deviceHeight === 1366) { // iPad Pro
      document.documentElement.style.fontSize = '650%';
    } else {
      document.documentElement.style.fontSize = '320%';
    }
  } else if (isAndroid) {
    document.documentElement.style.fontSize = '300%';
  } else {
    document.documentElement.style.fontSize = '320%';
  }


  document.setTitle = function(t) {
    document.title = t;
    var i = document.createElement('iframe');
    i.src = '//m.baidu.com/favicon.ico';
    i.style.display = 'none';
    i.onload = function() {
      setTimeout(function(){
        i.remove();
      }, 9)
    };
    document.body.appendChild(i);
  };
})();
