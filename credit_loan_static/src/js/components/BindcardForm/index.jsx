import React, { Component } from 'react';
import { withRouter } from 'react-router';
import styles from './index.scss';

import { Toast, WhiteSpace } from 'antd-mobile';

import SwitchBtn from '../SwitchBtn/index.jsx';
import Contract from '../SetContract/index.jsx';
import WritePhone from './writePhone.jsx';
import FormWrap from './formWrap.jsx';

import PubSub from 'pubsub-js';

import { hashHistory } from 'react-router';

class Form extends Component {
  constructor(props) {
    let storge = window.localStorage;

    if (CONFIGS.isFromCredit) {
      CONFIGS.referrerUrl = window.location.href;
    } else if (!CONFIGS.isFromCredit && storge.getItem('loan2Index')) {
      CONFIGS.referrerUrl = window.location.href;
    }
    super(props);
    this.state = {
      userName: '',
      refAgree: {},
      refTelInput: {},
      refBankCard: {},
    };
    this.timer = null;
  }

  componentWillMount() {
    this.getUserInfo();
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);

    //去掉背景颜色
    document.body.classList.remove('bind-card-bg');
  }

  componentDidMount() {
    //绑定事件
    this.bindEvent();

    //开户所在地
    const amListExtra = document.querySelector('.am-list-extra');
    if (amListExtra.innerHTML !== '开户行所在地') {
      amListExtra.classList.add('color-323232');
    }

    //发布
    const refFormNextBtn = this.refs.refFormNextBtn;
    PubSub.publish('bindCard:ele', refFormNextBtn);

    if (Common.isYouBaiLocal()) {
      this.saveLinkStatue();
    }

    /*setTimeout(() => {
      document.querySelector('.bind-card-wrap').style.background = 'red';
      document.querySelector('.authorize .wrap-span .text').innerHTML = Common.getAppVersion() + '--' + location.href;
      document.querySelector('.authorize .protocol').style.display = 'none'
    }, 4000)*/
  }

  async getUserInfo() {
    let getContractUrl = `${CONFIGS.basePath}user?kissoId=${CONFIGS.ssoId}`;
    let userPhone='';

    //显示loading图片
    this.props.setLoading(true);

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {

        //CONFIGS.crfUid = result.crfUid;
        CONFIGS.userName = result.userName;
        //CONFIGS.idNo = result.idNo;

        if (!result.openModifyPhone) {
          userPhone = result.phone;
          CONFIGS.bindCard.phoneNumStatus = true;
        }

        //发布
        PubSub.publish('userPhone:val', userPhone);

        this.setState({
          userName: result.userName,
        });

        //隐藏loading图片
        this.props.setLoading(false);
      }
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      if (err.toString().indexOf('Unexpected') > -1) {

        Toast.info('获取用户信息异常，请稍后再试');//异常
        return;
      }
      CRFFetch.handleError(err, Toast, () => {
        try{
          if (err.response.status == 400) {
            err.body.then(data => {
              if (CONFIGS.chineseCharRegx.test(data.message)) {
                Toast.info(data.message);
              } else {
                Toast.info('系统繁忙，请稍后再试！');
              }
            });
          }
        } catch(e) {
          Toast.info('系统繁忙，请稍后再试！');
        }
      });
    }
  }

  async sendBindCardFetch() {
    const word32 = Common.random32word();

    //let submitFetchUrl = CONFIGS.basePath+'fts/borrower_open_account?kissoId='+CONFIGS.ssoId;
    let submitFetchUrl = `${CONFIGS.basePath}fts/borrower_open_account?kissoId=${CONFIGS.ssoId}`;
    let bankNumber = this.state.refBankCard.value.replace(/\s/g, '');
    CONFIGS.bindCard.bankNum = bankNumber;
    let params = {
      'applicationSource': 'h5',
      'autoDeduct': CONFIGS.bindCard.switchStatus,//代扣
      'bankCardNo': bankNumber,//银行卡号
      'bankCode': CONFIGS.bindCard.bankCode,
      'businessType': 'rcs',//业务类型
      'cityId': CONFIGS.bindCard.areaCode,//城市代码
      //'crfUserId': CONFIGS.crfUid,//信而富用户id
      'email': null,//邮箱 可不传
      //'idNo': CONFIGS.idNo,//证件号码 身份证
      'idType': "0",//证件类型
      'mobile': this.state.refTelInput.value,//手机号
      //'realName': CONFIGS.userName,//用户姓名
      'requestRefNo': word32,
      'systemNo': "rcs"//系统编号 未定
    };

    let headers = {
      'Content-Type': 'application/json'
    };

    try {

      let fetchPromise = CRFFetch.Put(submitFetchUrl, JSON.stringify(params), headers);

      //显示loading图片
      this.props.setLoading(true);

      // 获取数据
      let result = await fetchPromise;

      result = result.json();
      //没有.json
      result.then((data) => {
        if (data && !data.response) {

          switch (data.result){
            case 'ACCEPTED':
              setTimeout(() => {
                this.reSendBindCardFetch(word32);
              },1000);
              break;
            case 'SUCCESS':
              this.props.setLoading(false);//隐藏loading图片
              hashHistory.push({
                pathname: 'success',
                query: {
                  ssoId: CONFIGS.userId
                }
              });
              break;
            case 'FAIL':
              this.props.setLoading(false);//隐藏loading图片
              hashHistory.push({
                pathname: 'rebindcard',
                query: {
                  ssoId: CONFIGS.userId
                }
              });
              break;
          }
        }
      });
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      CRFFetch.handleError(err, Toast, () => {

        if (err.response.status == 400) {
          err.body.then(data => {
            if (CONFIGS.chineseCharRegx.test(data.message)) {
              Toast.info(data.message);
            } else {
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }

      });

    }
  }

  async reSendBindCardFetch(word32) {
    CONFIGS.bindCard.sendCount++;

    //let reCheckFetchUrl=CONFIGS.basePath+'fts/borrower_open_account?kissoId='+CONFIGS.ssoId+'&requestRefNo='+word32;
    let reCheckFetchUrl = `${CONFIGS.basePath}fts/borrower_open_account?kissoId=${CONFIGS.ssoId}&requestRefNo=${word32}`;

    let time = CONFIGS.bindCard.sendCount === 2 ? 2000 : 3000;

    if (CONFIGS.bindCard.sendCount >= 10) {
      this.props.setLoading(false);//隐藏loading图片
      const nextLocation = {
        pathname: 'rebindcard',
        state: {
          failReason: '请求超时'
        }
      };
      CONFIGS.isReload = true;//从失败页面返回要求清空所有数据
      CONFIGS.bindCard.sendCount = 1;
      this.props.router.push(nextLocation);
      return;
    }

    try {

      let fetchPromise = CRFFetch.Get(reCheckFetchUrl);
      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {
        switch (result.result) {
          case 'ACCEPTED':
          case 'UNKNOWN':
            setTimeout(() => {
              this.reSendBindCardFetch(word32);
            },time);
            break;
          case 'SUCCESS':
            this.props.setLoading(false);//隐藏loading图片
            hashHistory.push({
              pathname: 'success',
              query: {
                ssoId: CONFIGS.userId
              }
            });
            break;
          case 'FAIL':
            this.props.setLoading(false);//隐藏loading图片
            const nextLocation = {
              pathname:'rebindcard',
              state: {
                failReason: result.failReason
              },
              query: {
                ssoId: CONFIGS.userId
              }
            };
            CONFIGS.isReload = true;//从失败页面返回要求清空所有数据
            hashHistory.push(nextLocation);
            break;
        }
      }
    } catch (err) {
      console.log(err, 'err');
      //隐藏loading图片
      this.props.setLoading(false);

      CRFFetch.handleError(err, Toast, () => {
        if (err.response.status == 400) {
          err.body.then(data => {
            if (CONFIGS.chineseCharRegx.test(data.message)) {
              Toast.info(data.message);
            } else {
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }
      });

    }
  }

  saveLinkStatue() {
    CONFIGS.isFromOther = true;
    localStorage.setItem('isFromOther', true);
  }

  bindEvent() {
    //select city
    const amListExtra = document.querySelector('.am-list-extra');

    if (amListExtra.innerHTML.indexOf(',') > 0) {
      amListExtra.innerHTML = amListExtra.innerHTML.replace(/,/g,'&nbsp;');
    }

    document.onclick = function (e) {
      if (e.target.classList.contains('am-picker-popup-header-right')) {
        amListExtra.classList.add('color-323232');
        amListExtra.innerHTML = amListExtra.innerHTML.replace(/,/g,'&nbsp;');
        if (CONFIGS.bindCard.cityCode === '' || CONFIGS.bindCard.areaCode === '') {
          CONFIGS.bindCard.cityCode = '500';
          CONFIGS.bindCard.areaCode = '6530';
        }
        this.removeDisabled();
      }
    }.bind(this);

    //改变背景颜色
    document.body.classList.add('bind-card-bg');

    this.resetSectionStyle();
  }

  handleSubmit(e) {
    //this.props.router.push('success');//绑卡成功 mock
    //mock for r360
    /*location.href = 'https://m-ci.crfchina.com/credit_loan/#/repay?ssoId=370486f0d16742b38138f3dc1839efcb&channel=r360';
    return;*/

    _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_submit', '确认提交按钮']);

    if (e.target.classList.contains(styles.btnDisabled)) {
      return;
    }

    this.sendBindCardFetch();
  }

  removeDisabled() {
    if (CONFIGS.bindCard.bankCardNumStatus && CONFIGS.bindCard.phoneNumStatus && document.querySelector('.am-list-extra').innerHTML !== '开户行所在地' && (!this.state.refAgree.classList.contains('un-agree'))) {
      this.refs.refFormNextBtn.classList.remove(styles.btnDisabled);
      CONFIGS.bindCard.notSubmit = false;
    } else {
      this.refs.refFormNextBtn.classList.add(styles.btnDisabled);
      CONFIGS.bindCard.notSubmit = true;
    }
  }

  setContractEle(el) {
    this.setState({ refAgree: el });
  }

  setWritePhoneEle(el) {
    this.setState({ refTelInput: el });
  }

  setFormEle(el) {
    this.setState({ refBankCard: el });
  }

  resetSectionStyle() {
    const appHeight = document.querySelector('#app').scrollHeight;
    const bodyHeight = document.body.offsetHeight;
    const overflowHeight = appHeight - bodyHeight;
    const refBindCard = this.refBindCard;

    if (overflowHeight > 70) {
      refBindCard.classList.add('bind-card-b');
    } else if (overflowHeight > 50) {
      refBindCard.classList.add('bind-card-m');
    } else if (overflowHeight > 36) {
      refBindCard.classList.add('bind-card-36');
    } else if (overflowHeight > 20) {
      refBindCard.classList.add('bind-card-20');
    } else if (overflowHeight > 2) {
      refBindCard.classList.add('bind-card-2');
    }
  }

  render() {

    let userName = this.state.userName;
    let adapt = CONFIGS.adapt ? 'adapt' : '';

    return (
      <section className={`${adapt}`} ref={section => this.refBindCard = section}>
        <FormWrap setLoading={this.props.setLoading} setUserName={userName} getFormEle={this.setFormEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)} />

        <WhiteSpace className="formSpace" />

        <WritePhone getWritePhoneEle={this.setWritePhoneEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)} />

        <WhiteSpace className="formSpace" />

        <SwitchBtn />

        <div className={styles.submitBtn+' submitBtn'}>
          <button className={styles.formNextButton + " " + (CONFIGS.bindCard.notSubmit ? styles.btnDisabled : '')}
                  onClick={this.handleSubmit.bind(this)} ref="refFormNextBtn">确认提交
          </button>
          <Contract curPath="/" getContractEle={this.setContractEle.bind(this)} removeDisabled={this.removeDisabled.bind(this)}/>
        </div>

      </section>
    )
  }
}


export default withRouter(Form);
