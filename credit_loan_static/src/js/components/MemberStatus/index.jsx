import React, { Component } from 'react';
import { Nav, SendSms, Loading } from 'app/components';
import { List } from 'antd-mobile';
import { hashHistory } from 'react-router';
import styles from './index.scss';
const Item = List.Item;

export default class MemberCard extends Component {
  constructor(props) {
    super(props);
    let params = props.data.orderList[0];
    let memberType = 0;
    let orderDate = '-';
    let orderStatus = 'UNKNOWN';
    let orderAmt = 0;
    let userCanDrawTimes = 0;
    let error_msg = null;
    if (params) {
      if (params.memberType) {
        orderDate = params.memberType;
      }
      if (params.orderDate) {
        orderDate = params.orderDate;
      }
      if (params.orderStatus) {
        orderStatus = params.orderStatus;
      }
      if (params.orderAmt) {
        orderAmt = params.orderAmt / 100;
      }
      if (props.data.userCanDrawTimes) {
        userCanDrawTimes = props.data.userCanDrawTimes;
      }
      if (params.error_msg) {
        error_msg = params.error_msg;
      }
    }
    this.state = {
      memberType: memberType,
      orderDate: orderDate,
      orderStatus: orderStatus,
      orderAmt: orderAmt,
      userCanDrawTimes: userCanDrawTimes,
      errorMsg: error_msg
    }
  }

  handleClick() {
    const { orderStatus } = this.state;
    let path = '';
    if (orderStatus === 'FAIL') {
      hashHistory.push({
        pathname: 'annualfee',
        query: {
          ssoId: CONFIGS.userId
        }
      });
    } else if (orderStatus === 'SUCCESS') {
      location.href = '/campaign_static/lottery/index.html';
    } else {
      if (Common.isCrfAppLocal()) {
        location.href = '#goRCSHome';
        return;
      } else {
        window.close();
      }
    }
  }

  render() {
    let {memberType, orderDate, orderStatus, orderAmt, userCanDrawTimes, errorMsg} = this.state;

    let buttonContent = '';
    if (orderStatus === 'FAIL') {
      buttonContent = '重新购买';
    } else if (orderStatus === 'SUCCESS') {
      buttonContent = '点我抽奖';
    }

    let rightContent = () => {
      return (
        <div className="">
          <div className={styles.amount}>
            {`¥${orderAmt}`}
          </div>
          <div className={styles.date}>
            {`购买日期 ${orderDate}`}
          </div>
        </div>
      );
    };

    return (
      <div className={styles.root}>
        <List className="crf-list crf-fee">
          <Item extra={rightContent()}>{CONFIGS.orderStatus[orderStatus]}</Item>
          {(orderStatus === 'FAIL' || (orderStatus === 'SUCCESS' && userCanDrawTimes > 0)) &&
            <div className={styles.buttonContainer}>
              {errorMsg &&
                <span className={styles.error}>{errorMsg}</span>
              }
              <button onClick={this.handleClick.bind(this)} ref="refFormNextBtn">{buttonContent}</button>
            </div>
          }
        </List>
      </div>
    )
  }
}
