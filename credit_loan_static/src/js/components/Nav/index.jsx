import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import styles from './index.scss';
import { Toast } from 'antd-mobile';
export default class Nav extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: this.props.data.title,
      stage: this.props.data.stage,
      status: this.props.data.status,
      contractNo: this.props.data.contractNo,
      from: this.props.data.from,
      type: this.props.data.type,
      isApp: this.props.data.isApp,
      extend: this.props.data.extend
    };
    this.handleBack = this.handleBack.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
    this.handleDetail = this.handleDetail.bind(this);
    this.handleGoOrigin = this.handleGoOrigin.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  componentDidMount() {
    Common.setDocTitle(this.state.title);
  }

  handleBack() {
    let couponsContainer = document.getElementsByClassName('coupons-container')[0];

    //alert(CONFIGS.referrerUrl+'--'+this.state.stage+'---'+location.href+'&page=#goRCSMine');//${location.href}&page=#goRCSMine`
    //Toast.info('window.CRFAPP--'+window.CRFAPP.isApp+'--version'+window.CRFAPP['Version-Code'], 5000);

    if (couponsContainer && couponsContainer.classList.contains('show')) {
      couponsContainer.classList.remove('show');
      couponsContainer.classList.add('hide');
    } else {
      let path = '';
      if (CONFIGS.referrerUrl.indexOf('/consumption/') > -1) {
        if (this.state.stage === 'success' && CONFIGS.referrerUrl) {
          location.href = CONFIGS.referrerUrl;
        } else {
          hashHistory.goBack();
        }
      } else {
        switch(this.state.stage) {
          case 'success':
            if (CONFIGS.isAppSmallChange) {
              this.goAppSmallChange();
              return;
            }
            if (CONFIGS.isFromCredit && !CONFIGS.isFromLoan) {
              path = 'index';
            } else {
              path = 'loan';
            }
            hashHistory.push({
              pathname: path,
              query: {
                ssoId: CONFIGS.userId
              }
            });
            break;
          case 'rebindCard':
            hashHistory.goBack();
            break;
          case 'home':
            if (CONFIGS.isFromLoan) {
              this.handleGoLoan();
            } else if (CONFIGS.isAppSmallChange) {
              this.goAppSmallChange();
            } else if (window.CRFAPP && window.CRFAPP.getParameters) {
              this.handleAppBack();
            } else {
              this.handleGoHome();
            }
            break;
          case 'loan':
          case 'repay':
          case 'bill':
          case 'member':
            if (Common.isCrfAppLocal()) {
              location.href = `#goRCSMine`;
              //window.location = `${location.href}#goRCSMine`;
              return;
            }
            if (localStorage.getItem('loan2Index') === 'true' && this.state.stage === 'loan') {
              localStorage.removeItem('loan2Index');
              this.handleGoHome();
              return;
            }
            if (CONFIGS.isFromCredit || localStorage.getItem('indexToBill')) {
              localStorage.removeItem('indexToBill');
              this.handleGoHome();
            } else {
              let storage = window.localStorage;
              if (storage.getItem('crf-origin-url')) {
                location.href = storage.getItem('crf-origin-url');
              }
            }
            break;
          case 'loanConfirm':
            this.handleGoLoan();
            break;
          case 'repayConfirm':
            path = 'repay';
            hashHistory.push({
              pathname: path,
              query: {
                ssoId: CONFIGS.userId
              }
            });
            break;
          case 'index':

            break;
          case 'result':
            //在app里面，从还款直接跳转
            let isFromRcs = Common.returnPara('isFromRcsLoanResult') != null || Common.returnPara('isFromRcsRepayResult') != null;
            if (Common.isCrfAppLocal()) {
              if (isFromRcs) {
                location.href = '#goRCSHome';
                // location.href = `${location.href}&page=#goRCSHome`;
              } else {
                path = 'bill';
                hashHistory.push({
                  pathname: path,
                  query: {
                    ssoId: CONFIGS.userId
                  }
                });
              }
              return;
            } else {
              hashHistory.goBack();
            }
            break;
          case 'extend':
            if (localStorage.getItem('isCrfApp') === 'true') {
              //location.href = `${location.href}&page=#goRCSHome`;
              location.href = '#goRCSHome';
              return;
            } else {
              hashHistory.goBack();
            }
            break;
          case 'annualfee':
            if (location.hash.indexOf('reSend') > -1) {
              if (Common.isCrfAppLocal()) {
                location.href = '#goRCSHome';
              } else if (CONFIGS.referrerUrl.indexOf('/consumption/') > -1) {
                location.href = CONFIGS.referrerUrl;
              } else {
                this.handleGoLoan();
              }
            } else {
              hashHistory.goBack();
            }
            break;
          default:
            hashHistory.goBack();
        }
      }
    }
  }

  goAppSmallChange() {
    if (CONFIGS.backPath) {
      location.href = CONFIGS.backPath;
    }
  }

  handleAppBack() {
    let JSBRIDGE_PROTOCOL = 'CRF_H5_CallBack';
    let params = {
      description: 'back'
    };
    let url = JSBRIDGE_PROTOCOL + '://operator?' + JSON.stringify(params);
    window.prompt(url, '');
  }

  handleGoLoan() {
    let path = 'loan';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleGoRepay() {
    let path = 'repay';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleGoHome() {
    let path = 'index';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleGoOrigin() {
    let storge = window.localStorage;
    let url = storge.getItem('crf-origin-url');
    let r360BackURL = storge.getItem('r360BackPath');
    let backURL = storge.getItem('backPath');

    if (Common.isR360Local() && r360BackURL) {
      location.href = r360BackURL;
      return;
    }

    if (Common.isYouBaiLocal() && backURL) {
      location.href = backURL;
      return;
    }

    if (Common.isCrfAppLocal()) {
      //location.href = `${location.href}&page=#goRCSMine`;
      location.href = '#goRCSMine';
      return;
    }

    if (url && url.indexOf('/consumption/') > -1) {
      location.href = url;
    } else {
      if (CONFIGS.isFromCredit && CONFIGS.isFromLoan) {
        this.handleGoHome();
        return;
      }
      if (CONFIGS.isFromCredit && !CONFIGS.isFromLoan) {
        this.handleGoHome();
      } else if (!CONFIGS.isFromCredit && CONFIGS.isFromLoan) {
        this.handleGoLoan();
      } else {
        this.handleGoRepay();
      }
    }
  }

  handleDetail() {
    let category = 'C_ConsumptionRecord';
    let eventName = 'E_ConsumptionRecord';
    _paq.push(['trackEvent', category, eventName, '借款记录']);
    let path = 'detail';
    hashHistory.push({
      pathname: path,
      query: {
        contractNo: this.state.contractNo
      }
    });
  }

  handleShowHelp() {
    PubSub.publish('helpModal:show', true);
  }

  render() {
    let { stage, title, status, from, contractNo, type, extend } = this.state;
    let leftEle = null;
    let rightEle = null;
    leftEle = <span className={styles.navbarLeftIcon}><button className="trs-btn" onClick={this.handleBack}></button></span>;
    if (from === 'loan') { //from loan show finish
      leftEle = null;
      rightEle = <span className={styles.dark} onClick={this.handleGoOrigin}>完成</span>
    }
    if (stage === 'index' || stage === 'feeResult') {
      leftEle = null;
    }
    if (stage === 'extend') {
      rightEle = <span className={styles.help} onClick={this.handleShowHelp}></span>
    }
    let styleRoot = styles.root;
    if (extend) {
      styleRoot = `${styles.root} border-bottom-1px`;
    }

    let isHiddenBanner = CONFIGS.isWeChat || Common.isR360Local() || Common.isYouBaiLocal();
    return (
      isHiddenBanner
        ?
        (<div></div>)
        :
        (<nav className={styleRoot}>
          <div className={styles.navbarLeft}>
            {leftEle}
          </div>
          <div className={styles.navbarTitle}>{title}</div>
          <div className={styles.navbarRight}>
            {rightEle}
          </div>
        </nav>)
    )
  }
}
