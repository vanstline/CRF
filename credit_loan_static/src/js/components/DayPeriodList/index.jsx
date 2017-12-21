import React, { Component } from 'react';
import { WhiteSpace, Toast } from 'antd-mobile';
import styles from './index.scss';

export default class DayPeriodList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: props.list,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.list
    });
  }

  static async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit, period, periodUnit } = defaultData;
    CONFIGS.loanData.sendSwitch = false;

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;
    CONFIGS.loanData.period = periodUnit === 'M' ? period : 1;

    const params = {
      productNo: CONFIGS.productNo,//未动态传入
      loanAmount: remainLimit,
      loanPeriod: period,
      //startTime: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      periodUnit: periodUnit,
      kissoId: CONFIGS.ssoId,
    };

    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;
    //&startTime=${params.startTime}
    try {
      let loanFetchPromise = CRFFetch.Get(loanPath, {});
      // 获取数据
      let loanResult = await loanFetchPromise;
      if (loanResult && !loanResult.response) {
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }
    } catch (error) {
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            PubSub.publish('loanDetail:list', data.message);
          });
        }
      });
    }
  }

  handleClick() {
    let data = {
      defaultDay: this.period,
      remainLimit: CONFIGS.currentAmount,
      period: this.period,
      periodUnit: this.periodUnit,
    };

    PubSub.publish('periodMain:toggle', `${this.period}${this.periodUnit === 'D' ? '天' : '期'}`);
    PubSub.publish('loanDetail:show');

    DayPeriodList.getInitDataFetch(data);
  }

  dayRuler(item, index) {
    return (
      <li key={index} className={styles['crf-day-list-sub']} onClick={this.handleClick.bind(item)}>
        <span>{item.billDate}</span>
        <span>{`${item.period}${item.periodUnit === 'D' ? '天' : '期'}`}</span>
      </li>
    );
  }

  render() {
    const { list } = this.state;// defaultDay,

    return (
      <section className={styles['crf-day-list']}>
        <ul>
          {list && list.map(this.dayRuler.bind(this))}
        </ul>
      </section>
    )
  }
}
