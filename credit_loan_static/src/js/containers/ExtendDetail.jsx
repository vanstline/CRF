import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, ExtendDateAmount, RulersDayExtend, ExtendDetail } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
import PubSub from 'pubsub-js';

class ExtendDetails extends Component {
  constructor(props, context) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      isShow: false,
      contactIndex: this.props.location.query.contactIndex || 0,
      dayData: {}
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    //_paq.push(['trackEvent', 'C_Page', 'E_P_Repay']);
    let {contactIndex} = this.state;
    if (CONFIGS.extendData && CONFIGS.extendData.length === 0) {
      let path = 'extend';
      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.userId
        }
      });
    } else {
      let dayData = {
        data: this.getDayData(),
        currentDay: CONFIGS.extendData[contactIndex].extendDays,
        defaultDay: CONFIGS.extendData[contactIndex].extendDays
      };
      this.setState({
        dayData: dayData
      });
      let defaultData = {
        defaultDay: CONFIGS.extendData[contactIndex].extendDays,
        amount: CONFIGS.extendData[contactIndex].amount
      };
      CONFIGS.currentAmount = CONFIGS.extendData[contactIndex].amount / 100;
      this.getInitData(defaultData);
    }
  }

  getDayData() {
    let {contactIndex} = this.state;
    let defaultDay = CONFIGS.extendData[contactIndex].extendDays;
    let dayArray = [];
    for (let i = 0; i < defaultDay; i++) {
      dayArray.push(i);
    }
    return dayArray;
  }

  async getInitData(defaultData) {
    let periodUnit = defaultData.defaultDay <= 30 ? 'D' : 'M';
    let params = {
      productNo: CONFIGS.productNo,
      loanAmount: defaultData.amount / 100,
      loanPeriod: defaultData.defaultDay,
      processType: 2
    };
    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}
                    &loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&periodUnit=${periodUnit}&processType=${params.processType}&kissoId=${CONFIGS.userId}`;

    try {
      let fetchPromise = CRFFetch.Get(loanPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isShow: true
        });
        PubSub.publish('loanDetail:list', result.detailList.LoanPlan);
      }
    } catch (error) {
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
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  handleClick() {
    let path = 'extendconfirm';
    _paq.push(['trackEvent', 'C_APP_Extension_Time', 'E_P_Extension_Time_Submit', '跳至展期确认页面']);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        type: 'e'
      }
    });
  }

  render() {
    let props = {title: '展期', stage: 'extenddetail', extend: true};
    let {contactIndex, dayData, isShow} = this.state;

    return (
      <section className="full-wrap">
        <Nav data={props} />
        {isShow &&
          <div>
            <ExtendDateAmount index={contactIndex} />
            <RulersDayExtend list={dayData} />
            <WhiteSpace />
            <ExtendDetail />
            <footer className="crf-padding-footer">
              <button onClick={this.handleClick.bind(this)} ref="refFormNextBtn">提交</button>
            </footer>
          </div>
        }
      </section>
    )
  }
}

export default ExtendDetails;
