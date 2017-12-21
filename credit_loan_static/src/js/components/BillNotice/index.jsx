import React, { Component } from 'react';
import { WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
import PubSub from 'pubsub-js';
import styles from './index.scss';

export default class BillNotice extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showNotice: false,
      type: props.type
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      type: nextProps.type
    });
  }

  componentDidMount() {
    this.getInitData();
  }

  componentDidUpdate() {
    PubSub.publish('loan:show', this.state.type);
  }


  async getInitData() {
    let path = `${CONFIGS.loanPath}/creditLimit?kissoId=${CONFIGS.ssoId}`;
    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      //alert('loan_flag--' + result.loan_flag + '***' + 'repaying_flag--' + result.repaying_flag);
      if (result && result.loan_flag === 2 && result.repaying_flag === 2) {
        this.setState({
          showNotice: true
        });
        PubSub.publish('loan:show', this.state.type);
      }
    } catch (error) {
      let msgs = error.body;
    }
  }

  handleClick(e) {
    e.stopPropagation();
    let path = 'repay';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId
      }
    });
  }

  render() {
    if (this.state.showNotice) {
      return (
        <div className="bill-notice">
          <div className={styles.root}>
            <div className={styles.noticeBarLeft}>
              <span>您有借款待还清</span>
            </div>
            <div className={styles.noticeBarRight}>
              <button className="normal-btn" onClick={this.handleClick.bind(this)}>立即还款</button>
            </div>
          </div>
          <WhiteSpace />
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}
