import React, { Component } from 'react';
import styles from './index.scss';

export default class MemberCard extends Component {
  constructor(props) {
    super(props);
    let params = props.data.orderList[0];
    let orderStatus = '';
    if (params && params.orderStatus) {
      orderStatus = params.orderStatus;
    }
    this.state = {
      memberType: props.data.memberType || 0,
      expiredDate: props.data.expiredDate || '',
      orderStatus: orderStatus
    }
  }

  render() {
    let {memberType, expiredDate, orderStatus} = this.state;
    let text = '您当前还不是会员';
    if (memberType === '1') {
      text = '您当前为黄金会员';
    } else if (memberType === '2') {
      text = '您当前为白金会员';
    } else if (memberType === '3') {
      text = '您当前为钻石会员';
    }
    return (
      <div className={styles.root}>
        <div className={`${styles.resultStatus} ${styles[CONFIGS.memberIcon[memberType]]}`}></div>
        <div className={styles.resultTitle}>{text}</div>
        <div className={styles.resultMessage}>
          {memberType === '0' && orderStatus === 'UNKNOWN' &&
            <span className={styles.resultMessageText}>请耐心等待支付结果</span>
          }
          {memberType !== '0' && orderStatus === 'SUCCESS' &&
            <span className={styles.resultMessageText}>{`会员到期日 ${expiredDate}`}</span>
          }
        </div>
      </div>
    )
  }
}
