import React, { Component } from 'react';
import { Nav, AmountSwipes, RulersDay, Loading, LoanDetail, PeriodList } from 'app/components';//Present, Coupons,
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
//import Numeral from 'numeral';
import PubSub from 'pubsub-js';

class Loan extends Component {
  constructor() {
    super();
    this.state = {
      title: '借款申请',
      isLoading: true,
      loanData: {},
      dayData: {},
      showDetail: false,
    };
    this.isBindCard = false;
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_Loan']);
    this.getQuotaFetch();//获取额度
    this.checkBindCardFetch();//查询是否绑卡
    this.forNarrowPhone();//宽度小于360
    this.r360HandleNotH5Back();//回退
    this.setPubSub();
  }

  async getQuotaFetch() {
    //https://app-ci.crfchina.com/app_dubbo/product/newParams?kissoId=370486f0d16742b38138f3dc1839efcb&productNo=P2001002&startTime=2017-07-10

    const periodPath = `${CONFIGS.productPath}/newParams?kissoId=${CONFIGS.ssoId}&productNo=${CONFIGS.productNo}&startTime=${Common.returnPara('startTime')}`;
    //const periodPath = `${CONFIGS.productPath}/params?kissoId=${CONFIGS.ssoId}&productNo=${CONFIGS.productNo}`;

    try {
      let periodFetchPromise = CRFFetch.Get(periodPath, {});
      // 获取数据
      let periodResult = await periodFetchPromise;

      if (periodResult && !periodResult.response) {
        Object.assign(CONFIGS.newLoanPeriod, periodResult);
        this.forbidAmount(periodResult);
        this.renderLoanData(periodResult);
        if (CONFIGS.currentAmount >= CONFIGS.forbidAmount) {
          PubSub.publish('periodTop:disabled');
          PubSub.publish('tips:show');
        }
        this.setState({ isLoading: false });
      }
    } catch (error) {
      this.setState({
        isLoading: false
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

  async checkBindCardFetch() {
    //https://m-ci.crfchina.com/h5_dubbo/fts/d49be79470b6477aaab1304113cb0cfc/borrower_open_account
    let path = `${CONFIGS.ftsPath}/${CONFIGS.ssoId}/borrower_open_account`;
    try {
      let bindCardFetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await bindCardFetchPromise;
      this.refs.loading.hide();
      if (result && !result.response) {
        this.isBindCard = !!result.bankCardNo;
      }
    } catch (error) {
      this.refs.loading.hide();
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  async getInitDataFetch(defaultData) {
    const { defaultDay, remainLimit } = defaultData;
    const periodUnit = defaultDay <= 30 ? 'D' : 'M';//D是短期，M是分期，因为默认值是14跟30天，所以一定是短期

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    const params = {
      productNo: CONFIGS.productNo,//未动态传入
      loanAmount: remainLimit,//金额只能是100-1500
      loanPeriod: defaultDay,//日期只能是14 or 30 or null
      periodUnit: periodUnit,
      kissoId: CONFIGS.ssoId,
    };

    //https://m-ci.crfchina.com/h5_dubbo/product/loanClause?productNo=P2001002&loanAmount=1500&loanPeriod=30&periodUnit=D&kissoId=370486f0d16742b38138f3dc1839efcb
    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;

    try {
      let loanFetchPromise = CRFFetch.Get(loanPath, {});

      // 获取数据
      let loanResult = await loanFetchPromise;

      this.refs.loading.hide();

      if (loanResult && !loanResult.response) {
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {

      this.refs.loading.hide();

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            PubSub.publish('loanDetail:list', data.message);
          });
        }
      });
    }
  }

  async loanSubmitFetch() {
    //console.log(CONFIGS.loanData.amount,'以分');
    const params = {
      loanAmount: CONFIGS.loanData.amount,//金额
      loanDays: CONFIGS.loanData.day,//借款天数
      loanProductNo: CONFIGS.productNo,//产品
      kissoId: CONFIGS.ssoId,
      billTerm: CONFIGS.loanData.period,
    };

    let storage = window.localStorage;
    storage.setItem('successReSendSubmit', JSON.stringify(params));

    let loanSubmitPath = `${CONFIGS.loanPath}/fundsSource?loanAmount=${params.loanAmount}&loanDays=${params.loanDays}&loanProductNo=${params.loanProductNo}&kissoId=${params.kissoId}&billTerm=${params.billTerm}`;

    try {
      let fetchMethodPromise = CRFFetch.Get(loanSubmitPath, {});
      // 获取数据
      let result = await fetchMethodPromise;
      if (result && !result.response) {
        this.refs.loading.hide();

        //console.log(result,'funds source');
        /*
         * agreementGroup:"zj"
         agreementGroupVer:"1.0"
         agreementName:"《信托贷款合同》、《服务协议》及其他相关授权文件"
         * */
        this.setMethodData(result);
      }
    } catch (error) {
      this.refs.loading.hide();

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.pubsub_token_detail_show);
    PubSub.unsubscribe(this.pubsub_token_detail_hide);
    PubSub.unsubscribe(this.pubsub_token_period_list);
  }

  setPubSub() {
    this.pubsub_token_detail_show = PubSub.subscribe('loanDetail:show', (topic, val) => {
      this.setState({ showDetail: true });
    });
    this.pubsub_token_detail_hide = PubSub.subscribe('loanDetail:hide', (topic, val) => {
      this.setState({ showDetail: false }, () => {
        document.querySelector('.loan-submit-btn').classList.add('disabled');
      });
    });
    this.pubsub_token_period_list = PubSub.subscribe('periodList:set', (topic, val) => {
      this.setState({ dayData: val });
    });
  }

  amountData(maxAmount) {
    //生成借款金额数组
    let loanData = [];
    for (let i = 1; i <= maxAmount; i++) {
      loanData.push(i * 100);
    }
    let curAmount = maxAmount < 16 ? maxAmount : 15;

    CONFIGS.loanData.currentAmountCount = curAmount - 1;

    //暂时写死
    curAmount === 11 && (CONFIGS.loanData.currentAmountCount = curAmount);

    curAmount = curAmount * 100;

    return {
      data: loanData,//根据最大金额生成金额的数组
      currentAmount: curAmount,//默认金额，大于15默认显示15
    };//当max大于15时，data跟currentAmount不会对应，data.length大于currentAmount

  }

  forbidAmount(arr) {
    arr = arr.productions;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]['periodArray'].length === 0) {
        CONFIGS.forbidAmount = arr[i]['loanAmount'];
        break;
      }
    }
  }

  dayData(productData) {
    let productPeriodArray = productData.periodArray;
    let productDayArray = productData.dayArray;

    let maxDay;
    let dayArray;

    if (productPeriodArray === null) {
      if (productDayArray === null) {
        //默认显示30天，天数不能拖动，显示错误信息，不能提交
        maxDay = 30;
        dayArray = new Array(30);
      } else {
        //一般情况，只有1期，拖动dayArray的天数
        CONFIGS.loanData.period = 1;
        maxDay = productDayArray.length;
        dayArray = productDayArray;
      }
    } else {
      CONFIGS.loanData.period = Common.getArrMaxValue(productPeriodArray);//Math.max.apply(Math, productPeriodArray);
      maxDay = CONFIGS.loanData.period - 1 + 30;

      let maxArray = [];
      for (let i = 0; i < maxDay; i++) {
        maxArray.push(i);
      }
      dayArray = maxArray;
    }

    return {
      maxDay: maxDay,
      dayArray: dayArray,
    };
  }

  renderLoanData(periodResult) {
    //这里规则要改，会出现2期
    if (!periodResult.productions || periodResult.productions.length <= 0) {
      //数组为null或者长度等于0
      PubSub.publish('loanDetail:list', '可用额度不足');
      return {
        remainLimit: 0,//默认金额，大于15默认显示15，只有100-1500
        defaultDay: 0,//默认日期，按照规则只有14跟30天
      };
    }

    let maxAmount = periodResult.productions.length;
    let loanList = this.loanAmountList(maxAmount);

    maxAmount = maxAmount > 15 ? 15 : maxAmount;
    let dayList = this.loanDayList(maxAmount);

    CONFIGS.loanData.amount = maxAmount * 100;
    CONFIGS.currentAmount = maxAmount * 100;

    this.setState({
      loanData: loanList,
      dayData: dayList,
    });
  }

  loanAmountList(result) {
    return this.amountData(result);
  }

  loanDayList(count) {
    return CONFIGS.newLoanPeriod.productions[count - 1];
  }

  setMethodData(methodData) {
    CONFIGS.isFromLoan = true;

    Object.assign(CONFIGS.method, methodData);

    !CONFIGS.method.repayTotalAmt && (CONFIGS.method.repayTotalAmt = CONFIGS.loanData.amount);

    //console.log(CONFIGS.loanData.amount, 'loan.jsx 提交的时候的金额');
    this.refs.loading.hide();

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

  forNarrowPhone() {
    //窄的手机屏幕
    if (document.documentElement.clientWidth < 360) {
      document.querySelector('body').classList.add('gray-bg');
    }
  }

  r360HandleNotH5Back() {
    if (Common.isR360Local()) {
      Common.popStateFn(this.r360BackFn);
    }
  }

  r360BackFn() {
    const URL = localStorage.getItem('r360BackPath');
    if (location.hash.indexOf('loan') > -1 && URL) {
      location.href = URL;
    }
  }

  handleClick() {
    if (!this.refs.refLoanSubmit.classList.contains('disabled')) {
      _paq.push(['trackEvent', 'C_Loan', 'E_Loan_submit']);
      if (this.isBindCard) {
        this.refs.loading.show();
        this.loanSubmitFetch();
      } else {
        this.goBindCard();
      }
    }
  }

  goBindCard() {
    CONFIGS.isFromLoan = true;
    CONFIGS.isFromCredit = false;
    let currentPath = window.location.href;
    let targetPath = `${window.location.origin}${window.location.pathname}#/loanconfirm?ssoId=${CONFIGS.userId}` ;
    let path = `/?${currentPath}`;
    let storage = window.localStorage;
    storage.setItem('crf-target-url', targetPath);
    let consumptionCheck = storage.getItem('crf-origin-url');
    if (consumptionCheck && consumptionCheck.indexOf('/consumption/') === -1) {
      storage.setItem('crf-origin-url', currentPath);
    }

    storage.setItem('loanAmount', CONFIGS.loanData.amount);
    storage.setItem('loanType', 'p');

    hashHistory.push(path);
  }

  render() {
    let props = { title: this.state.title, stage: 'loan' };
    let { isLoading, loanData, dayData } = this.state;
console.log(loanData, dayData)
    let contentClassName = "loan-content gray-bg new-amount-swipes";

    if (document.documentElement.clientWidth > 360) {
      contentClassName += ' adaptTable';
    }

    return (
      <div className={contentClassName}>
        <Nav data={props} />
        <WhiteSpace />
        <AmountSwipes list={loanData} />
        <WhiteSpace />
        <PeriodList list={dayData} />
        <WhiteSpace />
        { this.state.showDetail && <LoanDetail /> }
        <footer className="loan-footer-button">
          <button className="loan-submit-btn disabled" onClick={this.handleClick.bind(this)} ref="refLoanSubmit">我要借款</button>
          <div className="prompt-text">提前还款，仅按实际借款天数收取利息</div>
        </footer>
        <Loading ref="loading" show={isLoading} />
      </div>
    )
  }
}

export default Loan;
