import React, { Component } from 'react';
import styles from './index.scss';
import { hashHistory } from 'react-router';
import { Toast } from 'antd-mobile';

export default class ShareApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'default',
      cash: '-',
      type: props.data.type,
      name: props.data.name,
      title: props.data.title,
      modal: false,
      showPhone: 1,
      creditType: null,
    };
    this.shareButtonParams = null;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  componentDidMount() {
    this.getShareButtonParams();
  }

  async getShareButtonParams() {
    const path = `${CONFIGS.apiPath}/shareParam`;
    const headers = {
      'Content-Type': 'application/json'
    };
    try {
      let fetchPromise = CRFFetch.Post(path, JSON.stringify({}), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.shareButtonParams = encodeURI(JSON.stringify(result));
      }
    } catch (error) {
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  goAppShare() {
    localStorage.setItem('isCrfApp', true);
    if (Common.isIos()) {
      location.href = `NormalGoShare?${this.shareButtonParams}`;
    } else {
      let curSearch = Common.returnReferrerUrl();
      location.hash = `NormalGoShare?${this.shareButtonParams}`;
      setTimeout(() => {
        location.href = `/credit_loan/#/result?${curSearch}`;
      }, 0);
    }
  }

  goAppRepay() {
    location.href = '#shareGoRepay';
  }

  render() {
    let { status, type, cash } = this.state;

    let renderButton = () => {
      if (cash === '-') {
        return <div></div>;
      }
      if (status !== 'failed') {
        return (
          <button className={styles.shareButton} onClick={this.goAppShare.bind(this)}>良心借款APP，必须分享给好友</button>
        );
      } else {
        if (type === 'r') {
          if (location.href.indexOf('isFromRcsRepayResult') > -1) {
            return (
              <button className={`${styles.shareButton} ${styles[status]}`} onClick={this.goAppRepay.bind(this)}>重新还款</button>
            );
          } else {
            return <div></div>;
          }
        }
      }
    };

    return (
      <div className={styles.shareMain}>
        { renderButton() }
      </div>
    )
  }
}
