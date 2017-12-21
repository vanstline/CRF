import React, { Component } from 'react';
import { Nav, RulersLoan, RulersDay, Loading, LoanDetail, LoanUse } from 'app/components';//Present, Coupons,
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
      useData: [],
    };
    this.isBindCard = false;
    this.pastTime = null;
    this.annualFee = {
      isAnnual: false,
      annualErrMsg: {},
      memberType: null,
      errorMsg: '会员检测异常，请稍后再试！',
      // associatorType: null,
    };
  }

  componentDidMount() {
    _paq.push(['trackEvent', 'C_Page', 'E_P_Loan']);
    this.getUserStatus();
    this.getAllUseInfo();
    this.forNarrowPhone();//宽度小于360
    this.handleNotH5Back();
    this.resetLoanClass();
  }

  async getUserStatus() {
    const productNo = Common.getProductNo() || CONFIGS.productNo;
    // https://m-ci.crfchina.com/h5_dubbo/associator/isAssociator/8840e8dcb4b745ce8ea4ef041e91d14b?productNo=P2001003
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
         "memberType": "2" //memberType String 会员类型（1:黄金、2:白金、3:钻石；0：非会员）
         }
         * */
        if (result.memberType === '0') {
          // 0 1  1 2
          this.annualFee.isAnnual = true;
        }
        this.annualFee.memberType = result.memberType;
        this.getQuotaFetch();//获取额度
        this.checkBindCardFetch();//查询是否绑卡
      }
    } catch (error) {
      this.annualFee.annualErrMsg = { code: '500or其他', message: this.annualFee.errorMsg};
      this.getQuotaFetch();//获取额度
      this.checkBindCardFetch();//查询是否绑卡
      this.setState({
        isLoading: false
      });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            this.annualFee.annualErrMsg = data;
            if (data.code !== 'Q_3') {
              Toast.info(data.message);
            }
          });
        }
      });
    }
  }

  async getAllUseInfo() {
    //https://m-ci.crfchina.com/h5_dubbo/api/activeParam
    const path = `${CONFIGS.apiPath}/activeParam`;
    const headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Post(path, JSON.stringify({}), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        CONFIGS.loanUseIndex = 0;
        Object.assign(CONFIGS.loanUseData, result);
        localStorage.setItem('loanUseData', JSON.stringify(result));
        localStorage.setItem('loanUseIndex', CONFIGS.loanUseIndex);
        this.setState({
          useData: result
        });
      }
    } catch (error) {
      this.setState({ isLoading: false });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  async getQuotaFetch() {
    const periodPath = `${CONFIGS.productPath}/params?kissoId=${CONFIGS.ssoId}&productNo=${CONFIGS.productNo}`;
    try {
      let periodFetchPromise = CRFFetch.Get(periodPath);
      // 获取数据
      let periodResult = await periodFetchPromise;
      if (periodResult && !periodResult.response) {
        Object.assign(CONFIGS.loanPeriod, periodResult);//借款金额对应的数组
        let defaultData = this.returnDefaultData(periodResult);//返回 默认金额跟日期数
        if (defaultData.remainLimit !== 0) {
          this.getInitDataFetch(defaultData);//获取额度列表
        } else {
          this.setState({ isLoading: false });
        }
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

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit, isSingleDay } = defaultData;
    //console.log(defaultDay, remainLimit, isSingleDay, '*--------------*');
    let periodUnit = (defaultDay <= CONFIGS.defaultNumberDays || isSingleDay) ? 'D' : 'M';//*60Select*

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    if (defaultDay > CONFIGS.defaultNumberDays && !isSingleDay) {//*60Select*
      defaultDay = defaultDay / 30;
      CONFIGS.loanData.period = defaultDay;
    }
    const params = {
      productNo: CONFIGS.productNo,//未动态传入
      loanAmount: remainLimit,//金额只能是100-1500
      loanPeriod: defaultDay,
      //startTime: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      periodUnit: periodUnit,
      kissoId: CONFIGS.ssoId,
    };

    //https://m-ci.crfchina.com/h5_dubbo/product/loanClause?productNo=P2001002&loanAmount=1500&loanPeriod=30&startTime=2017-07-10&periodUnit=D&kissoId=370486f0d16742b38138f3dc1839efcb
    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;
    //&startTime=${params.startTime}
    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);
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

  async loanSubmitFetch(params) {

    let loanSubmitPath = `${CONFIGS.loanPath}/fundsSource?loanAmount=${params.loanAmount}&loanDays=${params.loanDays}&loanProductNo=${params.loanProductNo}&kissoId=${params.kissoId}&billTerm=${params.billTerm}`;

    try {
      let fetchMethodPromise = CRFFetch.Get(loanSubmitPath);
      // 获取数据
      let result = await fetchMethodPromise;
      if (result && !result.response) {
        this.refs.loading.hide();
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

  async checkMemberOrderStatus() {
    let path = `${CONFIGS.associatorPath}/orderAssociatorQuery/${CONFIGS.userId}`;

    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.refs.loading.hide();
        if (result.orderStatus) {
          this.handleGoAnnualResult();
        } else {
          this.handleGoAnnual();
        }
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

  handleGoAnnualResult() {
    let path = 'annualfeeresult';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId,
        type: 'f'
      }
    });
  }

  handleGoAnnual() {
    let path = 'annualguide';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId,
        // assType: associatorType,
      }
    });
  }

  forNarrowPhone() {
    //窄的手机屏幕
    if (document.documentElement.clientWidth < 360) {
      document.querySelector('body').classList.add('gray-bg');
    }
  }

  handleNotH5Back() {
    this.pastTime = new Date().getTime();
    if (Common.isR360Local()) {
      Common.popStateFn(this.r360BackFn);
    } else if (Common.isYouBaiLocal()) {
      Common.popStateFn(this.backPathFn.bind(this));
    }
  }

  handleClick() {
    if (!this.refs.refLoanSubmit.classList.contains('disabled')) {
      _paq.push(['trackEvent', 'C_Loan', 'E_Loan_submit']);

      if (this.annualFee.annualErrMsg.code === 'Q_3') {
        Toast.info(this.annualFee.annualErrMsg.message);
        return;
      }

      if (!this.annualFee.memberType) {
        Toast.info(this.annualFee.errorMsg);
        return;
      }

      const params = {
        loanAmount: CONFIGS.loanData.amount,//金额
        loanDays: CONFIGS.loanData.day,//借款天数
        loanProductNo: CONFIGS.productNo,//产品
        kissoId: CONFIGS.ssoId,
        billTerm: CONFIGS.loanData.period,
      };

      let storage = window.localStorage;
      storage.setItem('successReSendSubmit', JSON.stringify(params));

      if (!this.isBindCard) {
        this.goBindCard();
      } else {
        this.refs.loading.show();
        if (this.annualFee.isAnnual) {
          this.checkMemberOrderStatus();
        } else {
          this.loanSubmitFetch(params);
        }
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

  r360BackFn() {
    const URL = localStorage.getItem('r360BackPath');
    if (location.hash.indexOf('loan?') > -1 && URL) {
      location.href = URL;
    }
  }

  backPathFn() {
    if (CONFIGS.isFromOther || localStorage.getItem('isFromOther')) {
      CONFIGS.isFromOther = false;
      localStorage.removeItem('isFromOther');
      return;
    }

    const URL = decodeURIComponent((Common.returnPara('return_url') || localStorage.getItem('backPath')));
    if (location.hash.indexOf('#/loan?') === 0) {
      if (new Date().getTime() - this.pastTime > 800) {
        location.href = URL;
      }
    }
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

    //金额如果大于等于1500，那么就显示1500；小于1500就显示对应金额
    return {
      data: loanData,//根据最大金额生成金额的数组
      currentAmount: curAmount,//默认金额，大于15默认显示15
    };//当max大于15时，data跟currentAmount不会对应，data.length大于currentAmount

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
    } else {//新增，，60天可选  *60Select*
      CONFIGS.loanData.period = Common.getArrMaxValue(productPeriodArray);//Math.max.apply(Math, productPeriodArray);
      //CONFIGS.defaultNumberDays = productData.dayArray.length || 30;//旧逻辑，只有14 or 30
      maxDay = CONFIGS.loanData.period - 1 + CONFIGS.defaultNumberDays;//*new*
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

  returnDefaultData(periodResult) {
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
    let loanList = this.amountData(maxAmount);//作用是生成一个金额数组；返回一个默认显示金额
    let curAmount = loanList.currentAmount;
    let productData = periodResult.productions[curAmount / 100 - 1];

    /******新增逻辑，60天 2 3 4期 & only 14 30 day******/
    if (productData.dayArray && Common.isOnlyDay(productData.dayArray)) {
      let maxPeriod;
      let resultArr;
      let isSingleDay = false;
      if (!productData.periodArray) {
        maxPeriod = 1;
        resultArr = productData.dayArray;
        isSingleDay = true;
        CONFIGS.loanData.period = 1;
      } else {
        maxPeriod = Common.getArrMaxValue(productData.periodArray);
        resultArr = productData.dayArray.concat(productData.periodArray);
      }

      let periodList = {
        data: resultArr,//期数列表 [60, 2, 3] [14] [30] [60]
        currentDay: maxPeriod,//根据最大金额生成最大的期数
        defaultDay: maxPeriod,//默认期数，显示最大
        isNewRule: true,//60天，2期， 3期  60天 3期 4期
      };

      this.setState({
        loanData: loanList,
        dayData: periodList,//根据数组显示对应期数列表，没有天数
      });

      return {
        remainLimit: curAmount,//默认金额，大于15默认显示15，只有100-1500
        defaultDay: maxPeriod === 1 ? productData.dayArray[0] : maxPeriod * 30,//默认日期，显示最大期数
        isSingleDay: isSingleDay,
      }
    }

    /******新增逻辑，只有期数没有天数的处理******/
    if (productData.periodArray && !productData.dayArray) {
      let maxPeriod = Common.getArrMaxValue(productData.periodArray);
      let periodList = {
        data: productData.periodArray,//期数列表
        currentDay: maxPeriod,//根据最大金额生成最大的期数
        defaultDay: maxPeriod,//默认期数，显示最大
        isOnlyPeriod: true,//只有期数
      };

      this.setState({
        loanData: loanList,
        dayData: periodList,//根据数组显示对应期数列表，没有天数
      });

      return {
        remainLimit: curAmount,//默认金额，大于15默认显示15，只有100-1500
        defaultDay: maxPeriod * 30,//默认日期，显示最大期数
      }
    }

    let { maxDay, dayArray } = this.dayData(productData);

    let defaultDay = maxAmount <= 5 ? 14 : 30;//产品定的规则

    CONFIGS.loanData.dragDay = dayArray.length;//在DaySwipes中使用，函数returnEndDay
    CONFIGS.loanData.dayArrayLength = dayArray.length;//在DaySwipes中使用，函数returnEndDay
    CONFIGS.loanData.touchEndDay = dayArray.length;//在DaySwipes中使用，函数setListData

    let dayList = {
      data: dayArray,//接口返回的天数
      currentDay: maxDay,//根据最大金额生成最大的天数
      defaultDay: defaultDay,//默认日期，按照规则只有14跟30天
    };

    //渲染列表
    this.setState({
      loanData: loanList,
      dayData: dayList,
    });

    return {
      remainLimit: curAmount,//默认金额，大于15默认显示15，只有100-1500
      defaultDay: defaultDay,//默认日期，按照规则只有14跟30天
    };
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
        period: CONFIGS.loanData.period,
        day: CONFIGS.loanData.day,
      }
    });
  }

  resetLoanClass() {
    let appHeight = document.querySelector('#app').scrollHeight;
    let bodyHeight = document.body.offsetHeight;
    const distance = appHeight - bodyHeight;
    
    let refContent = this.refContent;
    if (distance > 140) {
      refContent.classList.add('reSetSize-min');//小屏幕
    } else if (distance > 100) {
      refContent.classList.add('reSetSize-iphone5');//小屏幕
    } else if (distance > 20) {
      refContent.classList.add('reSetSize');
    } else if (distance > 10) {
      refContent.classList.add('reSetSize-max');//大屏幕
    }
  }

  render() {
    let props = { title: this.state.title, stage: 'loan' };
    let { isLoading, loanData, dayData, useData } = this.state;

    let contentClassName = "loan-content gray-bg";

    if (document.documentElement.clientWidth > 360) {
      contentClassName += ' adaptTable';
    }

    return (
      <div className={contentClassName} ref={div => this.refContent = div}>
        <Nav data={props} />
        <WhiteSpace />
        <RulersLoan list={loanData} />
        <WhiteSpace />
        <RulersDay list={dayData} />
        <WhiteSpace />
        <LoanUse list={useData} />
        <WhiteSpace />
        <LoanDetail />
        <footer>
          <button className="loan-submit-btn disabled" onClick={this.handleClick.bind(this)} ref="refLoanSubmit">提交申请</button>
        </footer>
        <Loading ref="loading" show={isLoading} />
      </div>
    )
  }
}

export default Loan;
