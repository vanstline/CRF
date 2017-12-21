const Regex = {
  formatMobile(phone) {
    if (phone === '') return;
    let matches = CONFIGS.mobileFormartRegx.exec(phone);
    let newNum = matches[1] + ' ' + matches[2] + ' ' + matches[3];
    return newNum;
  },
  formatPhone(phone) {
    if (phone === '') return;
    let matches = CONFIGS.phoneFormartRegx.exec(phone);
    let newNum = matches[1] + '-' + matches[2] + '-' + matches[3];
    return newNum;
  },
  hiddenMobile(phone) {
    let newNum = phone.replace(CONFIGS.mobileHiddenRegx, '$1****$2');
    return newNum;
  },
  checkSMS(num) {
    if (num.length < 6) {
      return false;
    } else {
      return true;
    }
  },
  checkMobile(telphone) {
    let phoneNo = telphone.replace(/\s/ig, '');
    if (phoneNo.length < 11) return {
      operator: '输入号码',
      errorMsg: '',
      legality: false
    };
    if (CONFIGS.chinaMobileRegx.test(phoneNo)) {
      return this.setReturnJson('中国移动', '', true);
    } else if (CONFIGS.chinaUnionRegx.test(phoneNo)) {
      return this.setReturnJson('中国联通', '', true);
    } else if (CONFIGS.chinaTelcomRegx.test(phoneNo)) {
      return this.setReturnJson('中国电信', '', true);
    } else if(CONFIGS.otherTelphoneRegx.test(phoneNo)) {
      return this.setReturnJson('中国电信', '暂不支持17卡头的手机号码充值', false);
    } else {
      return this.setReturnJson('号码未知', '不允许充值的手机号码及金额', false);
    }
  },
  setReturnJson(...args) {
    return {
      operator: args[0],
      errorMsg: args[1] || '',
      legality: args[2]
    };
  }
}

module.exports = Regex;
