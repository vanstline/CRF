import React, { Component } from 'react';
import { Nav, Rulers, Present, Coupons, Loading } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';

class Repay extends Component {
  constructor(props){
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      title: '我要还款',
      data: [],
      isLoading: true,
      disable: true
    };
    this.pastTime = null;
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_Repay']);
    this.getInitData();
    this.handleNotH5Back();
  }

  async getInitData() {
    let repayPath = `${CONFIGS.repayPath}?kissoId=${CONFIGS.userId}`;

    try {
      let fetchPromise = CRFFetch.Get(repayPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setData(result);
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

  handleNotH5Back() {
    this.pastTime = new Date().getTime();
    if (Common.isR360Local()) {
      Common.popStateFn(this.r360BackFn);
    } else if (Common.isYouBaiLocal()) {
      Common.popStateFn(this.backPathFn.bind(this));
    }
  }

  backPathFn() {
    if (CONFIGS.isFromOther || localStorage.getItem('isFromOther')) {
      CONFIGS.isFromOther = false;
      localStorage.removeItem('isFromOther');
      return;
    }

    const URL = decodeURIComponent((Common.returnPara('return_url') || localStorage.getItem('backPath')));
    if (location.hash.indexOf('repay?') > -1 && URL) {
      if (new Date().getTime() - this.pastTime > 800) {
        location.href = URL;
      }
    }
  }

  r360BackFn() {
    const URL = localStorage.getItem('r360BackPath');
    if (location.hash.indexOf('repay?') > -1 && URL) {
      if (new Date().getTime() - this.pastTime > 800) {
        location.href = URL;
      }
    }
  }

  setData(repayData) {
    Object.assign(CONFIGS.repayData, repayData);
    let repay = this.convertRepayData(repayData);
    Object.assign(CONFIGS.rulerData, repay);
    if (repayData.total_amt === 0) {
      this.setState({
        disable: true,
        isLoading: false,
        data: repay
      });
    } else {
      PubSub.publish('present:init', Numeral(repayData.curr_amt).divide(100).value());
      this.setState({
        disable: false,
        isLoading: false,
        data: repay
      });
    }
  }

  convertRepayData(repayData) {
    let currentAmount = repayData.curr_amt;
    let totalAmount = repayData.total_amt;
    CONFIGS.currentAmount = Numeral(currentAmount).divide(100).value();

    let leftData = [], rightData = [];
    // 构造大于currentAmount的数组
    while (currentAmount < totalAmount) {
      let amount = Numeral(currentAmount).divide(100);
      rightData.push(amount.value());
      currentAmount = currentAmount + CONFIGS.defaultScale;
    }
    rightData.push(Numeral(totalAmount).divide(100).value());
    // 构造小于currentAmount的数组
    currentAmount = repayData.curr_amt - CONFIGS.defaultScale;
    while (currentAmount > CONFIGS.defaultScale) {
      let amount = Numeral(currentAmount).divide(100);
      leftData.push(amount.value());
      currentAmount = currentAmount - CONFIGS.defaultScale;
    }
    if (leftData.length > 0) {
      leftData.push(Numeral(CONFIGS.defaultScale).divide(100).value());
      leftData.sort(function(a, b) {
        return a - b;
      });
    }
    if(currentAmount > 0 && leftData.length === 0) {
      leftData.push(Numeral(CONFIGS.defaultScale).divide(100).value());
    }
    let finalData = leftData.concat(rightData);
    return finalData;
  }

  async handleClick(e) {
    let btn = e.currentTarget;
    if (btn.classList.contains('disable-btn')) return;
    this.refs.loading.show();
    let currentAmount = Numeral(CONFIGS.realAmount).multiply(100).value();
    let methodPath = `${CONFIGS.repayPath}/method?kissoId=${CONFIGS.userId}&repayAmount=${currentAmount}`;
    try {
      let fetchMethodPromise = CRFFetch.Get(methodPath);
      // 获取数据
      let methodResult = await fetchMethodPromise;
      if (methodResult && !methodResult.response) {
        _paq.push(['trackEvent', 'C_Repay', 'E_Immediate_Repay', '立即还款']);
        this.setMethodData(methodResult);
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

  setMethodData(methodData) {
    Object.assign(CONFIGS.method, methodData);
    this.refs.loading.hide();
    let path = '';
      path = 'repayconfirm';
      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.userId,
          realAmount: CONFIGS.realAmount,
          type: 'r'
        }
      });
    // if (CONFIGS.method.channelList && CONFIGS.method.channelList[0].channelInfoNoEnum === 'wechat') {
    //   path = 'channel';
    //   hashHistory.push({
    //     pathname: path,
    //     query: {
    //       ssoId: CONFIGS.userId,
    //       realAmount: CONFIGS.realAmount
    //     }
    //   });
    // } else {
    //   path = 'repayconfirm';
    //   hashHistory.push({
    //     pathname: path,
    //     query: {
    //       ssoId: CONFIGS.userId,
    //       realAmount: CONFIGS.realAmount,
    //       type: 'r'
    //     }
    //   });
    // }
  }

  render() {
    let { isLoading, disable, title } = this.state;
    let props = { title: title, stage: 'repay'};

    let buttonClass = '';
    if (disable) {
      buttonClass = 'disable-btn'
    }
    let data = {
      data: this.state.data,
      currentAmount: CONFIGS.currentAmount,
      disable: disable
    };

    return (
      <div className="repay-content gray-bg">
        <Nav data={props} />
        <WhiteSpace />
        <Rulers list={data} />
        <WhiteSpace />
        <Present />
        <Coupons />
        <footer>
          <button className={buttonClass} onClick={this.handleClick.bind(this)}>立即还款</button>
        </footer>
        <Loading ref="loading" show={isLoading} />
      </div>
    )
  }
}

export default Repay;
