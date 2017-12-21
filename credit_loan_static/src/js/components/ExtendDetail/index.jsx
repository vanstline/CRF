import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import { List } from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';
const Item = List.Item;

export default class ExtendDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      data: {}
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('loanDetail:list', (topic, val) => {
      this.setListData(val);
    });
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  setListData(data) {
    if (Common.isType('Array')(data)) {
      let currentData = [];

      data.map((value, index) => {
        currentData.push({
          'day': value.currBillDate,
          'principal': value.currMstAtm,
          'fees': value.handleFee,
          'interest': value.currInterest,
          'repay': value.currCountMstAtm,
          'key': index,
        });
        CONFIGS.extendData[0].deadLine = value.currBillDate.replace(/-/g, '');
      });
      this.setState({
        data: currentData
      });
    }
  }

  render() {
    let {data} = this.state;
    let currentData = {};
    if (data[0]) {
      currentData.day = data[0].day;
      currentData.principal = `¥${Numeral(data[0].principal).format('0, 0.00')}`;
      currentData.fees = `¥${Numeral(data[0].fees).format('0, 0.00')}`;
      currentData.interest = `¥${Numeral(data[0].interest).format('0, 0.00')}`;
      currentData.repay = `¥${Numeral(data[0].repay).format('0, 0.00')}`;
    }
    return (
      <div className={styles.root}>
        <List className="crf-list crf-extend-date-detail-list">
          {currentData.day &&
            <Item extra={currentData.day}>应还款日</Item>
          }
          {currentData.principal &&
            <Item extra={currentData.principal}>本金</Item>
          }
          {  currentData.fees &&
            <Item extra={currentData.fees}>展期手续费</Item>
          }
          {currentData.interest &&
            <Item extra={currentData.interest}>利息</Item>
          }
          {currentData.repay &&
            <Item className="result" extra={currentData.repay}>到期应还</Item>
          }
        </List>
      </div>
    );
  }
}
