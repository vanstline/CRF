import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { Loading } from 'app/components';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import styles from './index.scss';

export default class SendSms extends Component {
  constructor(props) {
    super(props);

    let isLoanConfirm = (this.props.pathname && this.props.pathname.indexOf('loanconfirm') > -1) || location.hash.toLowerCase().indexOf('loanconfirm') > -1;
    let isExtendConfirm = (this.props.pathname && this.props.pathname.indexOf('extendconfirm') > -1) || location.hash.toLowerCase().indexOf('extendconfirm') > -1;
    let isAnnualConfirm = (this.props.pathname && this.props.pathname.indexOf('isAnnual') > -1) || location.hash.toLowerCase().indexOf('annualfeeconfirm') > -1;
    this.state = {
      inputVerification: '输入验证码',
      getVerification: '获取验证码',
      count: 0,
      timer: null,
      checkStatus: true,
      isRender: false,
      maxLength: 6,
      val: '',
      isLoading: false,
      isLoanConfirm: isLoanConfirm,
      isExtendConfirm: isExtendConfirm,
      isAnnualConfirm: isAnnualConfirm,
      annualFee: {
        // assType: props.assType,
        levelType: props.levelType,
        memberIndex: props.memberIndex,
      }
    };
    this.sendFlag = true;
    this.getVerificationNum = this.getVerificationNum.bind(this);
    this.handleSendSMS = this.handleSendSMS.bind(this);
    this.sendSound = this.sendSound.bind(this);
    this.checkNumberLength = this.checkNumberLength.bind(this);
    this.reload = this.reload.bind(this);
  }

  reload() {
    window.location.reload();
  }

  getVerificationNum(e) {
    let status = this.refs.verificationNum.classList.contains('click-disable');
    this.refs.smsText && this.refs.smsText.classList.remove(styles.error);
    if (!status) {
      if (this.state.isLoanConfirm) {
        _paq.push(['trackEvent', 'C_LoanConfirm', 'E_LoanConfirm_sendMsg']);
        if(CONFIGS.loanData.isAgree) {
          this.getVerification(0);
        } else {
          Toast.info('请勾选协议');
        }
      } else if (!this.state.isLoanConfirm && this.state.isExtendConfirm) {
        _paq.push(['trackEvent', 'C_APP_Extension_Confirm', 'E_P_Extension_Confirm_Obtain']);
        this.getVerification(0); //0 文本
      } else {
        _paq.push(['trackEvent', 'C_RepayConfirm', 'E_RepayConfirm_sendMsg']);
        this.getVerification(0); //0 文本
      }
    }
  }

  sendSound() {
    this.refs.smsText && this.refs.smsText.classList.add('hide');
    this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
    this.refs.verificationNum && this.refs.verificationNum.classList.contains('click-disable');

    if (this.state.isLoanConfirm) {
      _paq.push(['trackEvent', 'C_LoanConfirm', 'E_LoanConfirm_sendMsgVoice']);
      CONFIGS.loanData.isAgree && this.getVerification(1);
    } else {
      _paq.push(['trackEvent', 'C_RepayConfirm', 'E_RepayConfirm_sendMsgVoice']);
      this.getVerification(1); // 1 声音
    }
  }

  countDown(code) {
    this.clearInput();
    let phoneNum = HandleRegex.hiddenMobile(CONFIGS.user.phone);
    this.refs.smsText && this.refs.smsText.classList.remove('hide');
    this.setState({inputVerification: `已发送短信到您${phoneNum}的手机`});
    let time = 60;
    clearInterval(this.state.timer);
    this.setState({getVerification: time + 's'});
    this.refs.verificationNum && this.refs.verificationNum.classList.add('click-disable');
    if (code === 0) {
      this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
    } else {
      this.refs.smsText && this.refs.smsText.classList.add('hide');
    }
    this.state.timer = setInterval(() => {
      time --;
      if (time >= 0) {
        this.setState({getVerification: time + 's'});
      } else {
        this.showSound();
        this.clearTimer();
      }
    }, 1000);
  }

  showSound() {
    this.refs.smsText && this.refs.smsText.classList.add('hide');
    this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.remove('hide');
    this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
  }

  clearTimer() {
    clearInterval(this.state.timer);
    let count = this.state.count + 1;
    this.refs.verificationNum && this.refs.verificationNum.classList.remove('click-disable');
    this.setState({getVerification: '重新获取', count: count});
  }

  async getVerification(code) {
    this.setState({
      isLoading: true
    });

    let path = `${CONFIGS.basePath}msg/repayType?kissoId=${CONFIGS.userId}&type=${code}`;
    if (this.state.isLoanConfirm || this.state.isAnnualConfirm) {
      path = `${CONFIGS.basePath}msg/applyType?kissoId=${CONFIGS.userId}&type=${code}`;
    }

    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(path, null, headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false
        });
        this.countDown(code);
        this.setVerification(result, code);
      }
    } catch (error) {
      console.log(error);
      this.setState({
        isLoading: false
      });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            code === 1 && this.showSound();
            Toast.info(data.message);
          });
        }
      });
    }
  }

  setVerification(result, code) {
    let count = this.state.count;
    switch (result.status) {
      case 200:
        if (code === 0) {
          this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
        } else {
          this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.remove('hide');
        }
        this.refs.smsText && this.refs.smsText.classList.remove(styles.error);
        this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
        break;
      case 400:
        this.setState({inputVerification: result.message});
        this.refs.smsText && this.refs.smsText.classList.add(styles.error);
        this.refs.smsText && this.refs.smsText.classList.remove('hide');
        this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
        this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
        break;
      case 500:
        Toast.info(result.message);
        break;
      default:
    }
  }

  setVerificationBySubmit(result) {
    let count = this.state.count;
    switch (result.status) {
      case 400:
        if (result.code === 'E_M_02') {
          this.setState({inputVerification: result.message});
          this.refs.smsText && this.refs.smsText.classList.add(styles.error);
        } else {
          Toast.info(result.message);
        }
        this.refs.smsText && this.refs.smsText.classList.remove('hide');
        this.refs.smsSoundTextMain && this.refs.smsSoundTextMain.classList.add('hide');
        this.refs.smsSoundTextSub && this.refs.smsSoundTextSub.classList.add('hide');
        break;
      case 401:
        CRFLogin.initialize(this.reload);
        break;
      case 500:
        Toast.info(result.message);
        break;
      default:
    }
  }

  clearInput() {
    this.setState({'val': ''});
    let maxLength = this.state.maxLength;
    let targetInputs = this.refs.smsInputTarget.children;
    for (let i = 0 ; i < maxLength; i++) {
      targetInputs[i].value = '';
    }
  }

  handleSendSMS() {

    if (!CONFIGS.loanData.isAgree) {
      Toast.info('请勾选协议！');
      return;
    }
    let currentValue = this.refs.smsNum.value;
    if (!isNaN(currentValue)) {
      this.setState({'val': currentValue});
    }
    let maxLength = this.state.maxLength;
    let currentStr = currentValue.replace(/\D/g, '');
    let targetInputs = this.refs.smsInputTarget.children;
    for (let i = 0 ; i < maxLength; i++) {
      targetInputs[i].value = currentStr[i] ? currentStr[i] : '';
    }
    console.log(currentStr);
    if (currentStr.length >= maxLength) {
      this.refs.smsNum.blur();
      currentValue = currentStr.substring(0, 6);
      setTimeout(() => {
        if (this.state.annualFee.memberIndex != undefined) {
          this.annualFeePayFetch();
        } else if (this.props.pathname && this.props.pathname.indexOf('loanconfirm') > -1) {
          this.submitFetch();
        } else {
          this.submitLoan(currentValue);
        }
      }, 200);
    }
  }

  async annualFeePayFetch() {
    if (!this.sendFlag) return;
    this.sendFlag = false;
    this.setState({
      isLoading: true
    });
    // https://m-ci.crfchina.com/h5_dubbo/associator/370486f0d16742b38138f3dc1839efcb
    let loanPath = `${CONFIGS.associatorPath}/${CONFIGS.ssoId}`;
    let annualProduct;
    if (CONFIGS.annualFeeProduct.length > 0) {
      annualProduct = CONFIGS.annualFeeProduct;
    } else {
      annualProduct = JSON.parse(localStorage.getItem('annualFeeProduct'));
    }

    let couponData = [];
    CONFIGS.annualCampaign.awardRecordBos.forEach((item, index) => {
      couponData.push({
        "amt_type": 0,
        "coupon_count": 0,
        "coupon_id": item.awardRecordId,
        "coupon_name": '',
        "coupon_price": item.awardValue,
        "coupon_type": 'coupon',
        "discountCouponValue": '',
        "freeFeeFlag": ''
      });
    });


    let params = {
      // "associatorType": this.state.annualFee.assType,
      'couponAmt': CONFIGS.annualCampaign.awardTotalValue || 0,
      'couponList': couponData,
      'associatorProductReqDto': annualProduct[this.state.annualFee.memberIndex],
      'code': this.refs.smsNum.value
    };

    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(loanPath, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      let path = 'annualfeeresult';
      this.sendFlag = true;
      this.setState({
        isLoading: false
      });
      result = result.json();
      result.then((data) => {
        if (data && !data.response) {
          hashHistory.push({
            pathname: path,
            query: {
              ssoId: CONFIGS.userId,
              type: 'f',
            },
          });
        }
      });
    } catch (error) {
      this.clearInput();
      this.sendFlag = true;
      this.setState({
        isLoading: false
      });
      let errorStatus = {
        status: error.response.status
      };
      let msg = error.body;
      msg.then((data) => {
        let res = Object.assign(data, errorStatus);
        this.setVerificationBySubmit(res);
      });
    }
  }

  async submitFetch() {
    if (!this.sendFlag) return;
    this.sendFlag = false;
    this.setState({
      isLoading: true
    });

    let loanPath = `${CONFIGS.loanPath}?kissoId=${CONFIGS.ssoId}`;
    let storage = window.localStorage;
    let methodObj = JSON.parse(storage.getItem('CRF_methodObject'));
    let loanDataObj = JSON.parse(storage.getItem('CRF_loanDataObject'));
    let campaignCode = storage.getItem('campaignCode');
    const { agreementGroup, agreementName, agreementGroupVer, loanNo } = methodObj;
    let { period, day, amount } = loanDataObj;

    const loanUseData = this.getLoanUseData();
    if (!(loanUseData.length > 0)) {
      return;
    }
    let loanUseIndex = CONFIGS.loanUseIndex || localStorage.getItem('loanUseIndex') || '0';
    let useInfo = loanUseData[loanUseIndex]['active'];

    let params = {
      "agreementGroup": CONFIGS.method.agreementGroup || agreementGroup,
      "agreementName": CONFIGS.method.agreementName || agreementName,
      "agreementVersion": CONFIGS.method.agreementGroupVer || agreementGroupVer,
      //"bankCardNo": CONFIGS.account.bankCardNo,
      "billTerm": CONFIGS.loanData.period || period,//1、2、3
      "code": this.refs.smsNum.value,
      "deviceType": CONFIGS.deviceType,
      "loanDays": CONFIGS.loanData.day || day,
      "loanNo": CONFIGS.method.loanNo || loanNo,
      "productNo": CONFIGS.productNo,
      "totalPrincipal": CONFIGS.loanData.amount || amount,//传值的时候以 分 为单位
      "campaigns": CONFIGS.campaignCode || campaignCode,//活动编号
      "loanDesc": useInfo,
    };

    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(loanPath, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      let path = 'result';

      this.sendFlag = true;
      this.setState({
        isLoading: false
      });

      result = result.json();
      result.then((data) => {
        if (data && !data.response) {
          let urlQuery;
          if (Common.isCrfAppLocal()) {
            urlQuery = {
              ssoId: CONFIGS.userId,
              contractNo: data.loanNo,
              type: CONFIGS.sendSmsType,
              source: 'loan',
              isFromRcsLoanResult: true,
            }
          } else {
            urlQuery = {
              ssoId: CONFIGS.userId,
              contractNo: data.loanNo,
              type: CONFIGS.sendSmsType,
              source: 'loan',
            }
          }
          //hash
          hashHistory.push({
            pathname: path,
            query: urlQuery,
            state: {
              currentPath: 'loanconfirm',
              useInfo: useInfo,
            }
          });
        }
      });
    } catch (error) {
      this.clearInput();
      this.sendFlag = true;
      this.setState({
        isLoading: false
      });
      let errorStatus = {
        status: error.response.status
      };
      let msg = error.body;
      msg.then((data) => {
        let res = Object.assign(data, errorStatus);
        this.setVerificationBySubmit(res);
      });
    }
  }

  async submitLoan(value) {
    if (!this.sendFlag) return;
    this.sendFlag = false;
    this.setState({
      isLoading: true
    });
    let path = `${CONFIGS.repayPath}?kissoId=${CONFIGS.userId}`;
    let params = null;
    if (CONFIGS.selectCoupon) {
      let couponData = [{
        amt_type: 1,
        coupon_id: CONFIGS.selectCoupon.id,
        coupon_price: CONFIGS.selectCoupon.originAmount
      }];
      params = {
        code: this.refs.smsNum.value,
        deviceType: CONFIGS.deviceType,
        repayChannel: 'FTS',
        repaymentAmount: Numeral(CONFIGS.realAmount).multiply(100).value() + CONFIGS.selectCoupon.offsetedCouponPrice,
        couponList: JSON.stringify(couponData)
      };
    } else {
      params = {
        code: this.refs.smsNum.value,
        deviceType: CONFIGS.deviceType,
        repayChannel: 'FTS',
        repaymentAmount: Numeral(CONFIGS.realAmount).multiply(100).value()
      };
      if (CONFIGS.sendSmsType === 'e') {
        let extendParams = {
          extendFlag: 1,
          loanNo: CONFIGS.extendData[0].contactNo,
          extendFeeAmt: CONFIGS.extendData[0].overhead,
          extendDeadline: CONFIGS.extendData[0].deadLine
        };
        Object.assign(params, extendParams);
      }
    }

    let headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Put(path, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        if (this.state.isExtendConfirm) {
          _paq.push(['trackEvent', 'C_APP_Extension_Confirm', 'E_P_Extension_Confirm_Right', '验证码输入正确，跳转至展期状态页面']);
        } else {
          _paq.push(['trackEvent', 'C_Repay', 'E_SubmitRepay', '确认还款']);
        }
        this.sendFlag = true;
        this.setState({
          isLoading: false
        });
        let path = 'result';
        let res = result.json();

        res.then((data) => {

          hashHistory.push({
            pathname: path,
            query: {
              ssoId: CONFIGS.userId,
              contractNo: data.rcs_repay_no,
              type: CONFIGS.sendSmsType,
              fee: this.props.fee
            }
          });
        });
      }
    } catch (error) {
      this.clearInput();
      this.sendFlag = true;
      this.setState({
        isLoading: false
      });
      let errorStatus = {
        status: error.response.status
      };
      let msgs = error.body;
      let status = error.response.status;
      msgs.then((data) => {
        let res = Object.assign(data, errorStatus);
        this.setVerificationBySubmit(res);
      });
    }
  }

  getLoanUseData() {
    let loanUseData = [];
    let loanUseStorage = JSON.stringify(localStorage.getItem('loanUseData'));
    if (CONFIGS.loanUseData.length > 0) {
      loanUseData = CONFIGS.loanUseData;
    } else if (Common.isType('Array')(loanUseStorage) && loanUseStorage.length > 0) {
      loanUseData = loanUseStorage;
    } else {
      Toast.info('借款用途必须选择，请返回借款申请页面');
      this.setState({
        isLoading: false
      });
    }
    return loanUseData;
  }

  checkNumberLength(e) {
    let currentValue = this.refs.smsNum.value;
    if (currentValue.length > 6) {
      this.refs.smsNum.value = this.refs.smsNum.value.substr(0, 6);
    }
  }

  render() {
    let { inputVerification, getVerification, checkStatus, count, isLoading } = this.state;
    return (
      <section className={styles.root}>
        <div className={`${styles.sendSmsContainer} hor`}>
          <div className={styles.sendSmsText} ref="smsText">{inputVerification}</div>
          <div className={`${styles.sendSmsText} hide`} ref="smsSoundTextMain">收不到? 请尝试 <a onClick={this.sendSound}>语音验证码</a></div>
          <div className={`${styles.sendSmsText} hide`} ref="smsSoundTextSub">验证电话即将发出, <span>请注意接听</span></div>
          <div className={styles.sendSmsAction}>
            <a ref="verificationNum" onClick={this.getVerificationNum}>{getVerification}</a>
          </div>
        </div>
        <div className={styles.sendSmsInput}>
          <input className={styles.originInput} defaultValue="" readonly unselectable="on" value={this.state.val} ref="smsNum" type="tel" maxLength="6" onChange={this.handleSendSMS} />
          <div className={styles.targetInput} ref="smsInputTarget">
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
            <input type="number" disabled />
          </div>
        </div>
        <Loading show={isLoading} />
      </section>
    );
  }
}
