import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import {Nav, Loading} from 'app/components';
import {WhiteSpace, Toast} from 'antd-mobile';

export default class Success extends Component {
  constructor(props) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      loadingShowStatus: true
    };
    this.annualFee = {
      isAnnual: false
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_Success']);

    this.getUserStatus();
    // if(Common.isWeChat()) {
    //   Common.customPopState(this.popUrlFn);
    // }
  }

  componentWillUnmount() {
    // if(Common.isWeChat()) {
    //   window.removeEventListener('popstate', this.popUrlFn);
    // }
  }

  async getUserStatus() {
    const productNo = Common.getProductNo() || CONFIGS.productNo;
    // https://m-ci.crfchina.com/h5_dubbo/associator/isAssociator/370486f0d16742b38138f3dc1839efcb
    const path = `${CONFIGS.associatorPath}/isAssociator/${CONFIGS.ssoId}?productNo=${productNo}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Post(path, JSON.stringify({}), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        /*
         {
         "memberType": "2",
         }
         * */
        this.setState({
          loadingShowStatus: false
        });
        if (result.memberType === '0') { // 不是会员，要去买会员
          this.annualFee.isAnnual = true;
        }
      }
    } catch (error) {
      this.setState({
        loadingShowStatus: false
      });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  async loanSubmitFetch(params) {
    let loanSubmitPath = `${CONFIGS.loanPath}/fundsSource?loanAmount=${params.loanAmount}&loanDays=${params.loanDays}&loanProductNo=${params.loanProductNo}&kissoId=${params.kissoId}&billTerm=${params.billTerm}`;

    try {
      let fetchMethodPromise = CRFFetch.Get(loanSubmitPath);
      // 获取数据
      let result = await fetchMethodPromise;
      if (result && !result.response) {
        this.setState({ loadingShowStatus: false });
        this.setMethodData(result);
      }
    } catch (error) {
      this.setState({ loadingShowStatus: false });

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  setMethodData(methodData) {
    CONFIGS.isFromLoan = true;

    Object.assign(CONFIGS.method, methodData);

    !CONFIGS.method.repayTotalAmt && (CONFIGS.method.repayTotalAmt = CONFIGS.loanData.amount);

    let storage = window.localStorage;
    storage.setItem('loanAmount', CONFIGS.loanData.amount);
    storage.setItem('loanType', 'p');
    storage.setItem('CRF_methodObject', JSON.stringify(methodData));
    storage.setItem('CRF_loanDataObject', JSON.stringify(CONFIGS.loanData));

    let path = 'loanconfirm';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        type: 'p'
      },
      state: {
        realAmount: CONFIGS.loanData.amount,
      }
    });
  }

  /*popUrlFn(refUrl) {
    location.href = refUrl;
  }*/
  goAppSmallChange() {
    if (CONFIGS.backPath) {
      location.href = CONFIGS.backPath;
    } else if (Common.isCrfAppLocal()) {
      location.href = '#goRCSMine';
    }
  }

  handleClick() {
    _paq.push(['trackEvent', 'C_Success', 'E_Success_button', '成功页面按钮']);
    this.setState({ loadingShowStatus: true });

    if (CONFIGS.isAppSmallChange) {
      this.goAppSmallChange();
    } else if (CONFIGS.isFromCredit && !CONFIGS.isFromLoan) {
      let path = 'index';
      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.userId
        }
      });
    } else if (CONFIGS.isFromCredit && CONFIGS.isFromLoan) {
      this.handleGoLoan();
    } else if (!CONFIGS.isFromCredit && !CONFIGS.isFromLoan && CONFIGS.referrerUrl.indexOf('/consumption/') === -1) {
      this.handleGoLoan();
    } else if (CONFIGS.referrerUrl.indexOf('/consumption/') > -1) {
      location.href = `#goRCSMine`;
      //location.href = CONFIGS.referrerUrl;
    } else {
      let storage = window.localStorage;
      const params = JSON.parse(storage.getItem('successReSendSubmit'));
      if (params && params.kissoId && !this.annualFee.isAnnual) { // 去借钱
        this.loanSubmitFetch(params);
      } else { // 买会员
        this.handleGoLoan();
      }
    }
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

  render() {

    let props = {title: '绑定结果', stage: 'success'};
    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props}/>
        <WhiteSpace />
        <div className="bind-card-wrap">
          <div className="bind-card-status">
            <div className="img success"></div>
            <p>恭喜您成功绑定</p>
            <p>{CONFIGS.bindCard.bankName + "卡(" + CONFIGS.bindCard.bankNum.slice(-4) + ")"}</p>
          </div>
        </div>
        <div className="next-page">
          <button onClick={this.handleClick.bind(this)}>确认</button>
        </div>
        <Loading show={this.state.loadingShowStatus}/>
      </div>
    )
  }
}
