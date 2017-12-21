import React, { Component } from 'react';
import styles from './index.scss';
import { hashHistory } from 'react-router';
import { Toast } from 'antd-mobile';

export default class ViewProtocol extends Component {
  constructor(props) {
    super(props);
    console.log(props.contractNo);
    this.state = {
      contractNo: props.contractNo,
    };
    this.shareButtonParams = null;
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  componentDidMount() {
    // this.getShareButtonParams();
  }

  handleClick() {
    hashHistory.push('historycontract');
  }

  render() {
    let { contractNo } = this.state;

    return (
      <div className={styles.viewMain}>
        <div className={styles.contractNo}>订单编号 : { contractNo }</div>
        <a href="javascript:void(0);" className={styles.viewContract} onClick={this.handleClick}>查看合同 ></a>
      </div>
    )
  }
}
