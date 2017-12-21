import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import {Phone} from 'app/components';
import Numeral from 'numeral';
import { hashHistory } from 'react-router';
import styles from './index.scss';

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'default',
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  showSelectMember() {

  }

  goLoanPage() {
    let path = 'loan';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  render() {
    let { status, cash, title } = this.state;

    let formatCash = '-';
    if (cash !== '-') {
      formatCash = `${Numeral(cash).divide(100).format('0, 0.00')}元`;
    }
    let result = null;
    if (cash !== '-') {
      formatCash = `${Numeral(cash).divide(100).format('0, 0.00')}元`;
      result = (
        <div className={styles.root}>
          <div className={`${styles.resultCash} number`}>{formatCash}</div>
          <button className="loan-submit-btn disabled" onClick={this.showSelectMember.bind(this)} ref="refLoanSubmit">我要成为会员</button>
        </div>
      )
    } else {
      result = (
        <div className={styles.root}>
          <div className={`${styles.resultCash} number`}>{formatCash}</div>
          <button className="loan-submit-btn disabled" onClick={this.goLoanPage.bind(this)} ref="refLoanSubmit">继续借款</button>
        </div>
      );
    }
    return (
      <div>
        {result}
      </div>
    )
  }
}
