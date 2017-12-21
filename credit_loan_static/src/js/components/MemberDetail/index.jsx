import React, { Component } from 'react';
import styles from './index.scss';

export default class MemberCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      memberType: props.data.memberType || 0,
      explanationData: [
        <li>会员开通后, 一年内可享受优先放款资格</li>,
        <li>黄金会员开通后, 一年内可享受优先放款资格</li>,
        <li>白金会员在会员期内免收借款手续费</li>,
        <li>钻石会员在会员期内免收借款手续费</li>,
      ],
      returnData: [
        '会员期内有效借款次数满8笔',
        '会员期间无任何逾期行为',
        '满足以上两条, 到期后会费可退还'
      ],
      tipsData: [
        '有效借款不包含当日借款当日还清',
        '会员期间如由于自身原因发生严重逾期行为，会员资格会被取消，前期支付的会费不予退还'
      ]
    }
  }

  explanationList(item, index) {
    return (
      <li key={index} className={styles['contract-li']}>
        <span className={styles.orderLi}>{index + 1})</span><span>{item}</span>
      </li>
    );
  }

  render() {
    let {memberType, expiredDate, orderStatus, explanationData, returnData, tipsData} = this.state;
    console.log(memberType);
    return (
      <div className={styles.root}>
        <div className={styles['member-description']}>
          <div className={styles['member-description-title']}>会员使用说明</div>
          <ul>
            { explanationData[memberType] }
          </ul>
        </div>
        {memberType === '3' &&
          <div className={styles['member-description']}>
            <div className={styles['member-return-title']}>退还条件</div>
            <ul>
              {
                returnData.map(this.explanationList)
              }
            </ul>
            <ol className={styles.tipsData}>
              <span className={styles.tipsIcon}>注: </span>
              {
                tipsData.map(this.explanationList)
              }
            </ol>
          </div>
        }
      </div>
    )
  }
}
