import React, {Component} from 'react';
import {Picker, List, Toast} from 'antd-mobile';
import styles from './index.scss';

class LoanMask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useInfo: props.useInfo,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.useInfo,
    });
  }

  render() {
    let { useInfo } = this.state;
    return (<section className={`${styles.loanUseStep}`}>
      {
        useInfo && useInfo !== '提现' &&
          <div className={styles.loanUseMain}>
            <div className={styles.loanUseName}>借款用途</div>
            <div className={styles.loanUseInfo}>{useInfo}</div>
          </div>
      }
    </section>);
  }
}


export default LoanMask;