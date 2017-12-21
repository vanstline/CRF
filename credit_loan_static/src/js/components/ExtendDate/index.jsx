import React, { Component } from 'react';
import { List } from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';
import { hashHistory } from 'react-router';
const Item = List.Item;

export default class ExtendDate extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      contactNo: props.data.contactNo || '',
      value: (props.data.interest + props.data.fee + props.data.poundage + props.data.overhead) || '-',
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.data)
    //this.setState();
  }

  handleClick() {
    let path = 'extendlist';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  render() {
    let item = null;
    let {contactNo, value} = this.state;
    let realFee = '-';
    if (value !== '-') {
      realFee = Numeral(value).divide(100).format('0, 0.00');
    }
    if (contactNo !== '') {
      item = <Item arrow="horizontal" extra={contactNo} onClick={this.handleClick.bind(this)}>借款单号</Item>;
    } else {
      item = <Item extra="-">借款单号</Item>;
    }
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.title}>展期费用(元)</div>
          <div className={styles.amount}>{realFee}</div>
        </div>
        <List className="crf-list crf-extend-date-list">
          {item}
        </List>
      </div>
    )
  }
}
