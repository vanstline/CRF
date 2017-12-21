import React, { Component } from 'react';
import { List } from 'antd-mobile';
import styles from './index.scss';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
const Item = List.Item;

export default class ExtendList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dataList: CONFIGS.extendData || []
    }
  }

  componentWillReceiveProps(nextProps) {
    //this.setState({remainLimit: nextProps.data.remainLimit, totalLimit: nextProps.data.totalLimit});
  }

  setExtendList(id) {
    let {dataList} = this.state;
    let index = 0;
    dataList.map((item, i) => {
      if (id === item.contactNo) {
        index = i;
        item.isActive = true;
      } else {
        item.isActive = false;
      }
    });
    let path = 'extend';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        contactIndex: index
      }
    });
  }

  handleClick(e) {
    let ele = e.currentTarget;
    let id = ele.dataset.id;
    this.setExtendList(id);
    _paq.push(['trackEvent', 'C_APP_Extension_Cost', 'E_P_Extension_Cost_Num', id]);
  }

  render() {
    let item = null;
    let {dataList} = this.state;

    const content = (item) => {
      let amount = Numeral(item.amount).divide(100).format('0, 0.00');
      let loanDate = item.loanDate.substr(5);
      let repayDate = item.repayDate.substr(5);
      return (
        <div key={item.contactNo} data-id={item.contactNo} onClick={this.handleClick.bind(this)} className={styles.item}>
          <div className={styles.title}>{item.contactNo}</div>
          <div className={styles.detail}>
            <div className={styles.amount}>¥{amount}</div>
            <div className={styles.loanDate}>借款日期：{loanDate}</div>
            <div className={styles.repayDate}>应还款日：{repayDate}</div>
          </div>
          <div className={styles.deadline}>有效时间：{item.indate}</div>
          <div className={`crf-right ${item.isActive? 'active': ''}`}></div>
        </div>
      );
    };

    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <List className="crf-list crf-extend-date-detail-list">
            {dataList.map(content)}
          </List>
        </div>
      </div>
    )
  }
}
