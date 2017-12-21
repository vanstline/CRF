import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import {Phone} from 'app/components';
import Numeral from 'numeral';
import styles from './index.scss';

export default class Result extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      status: props.data.status || 'default',
      cash: props.data.cash || '-' ,
      type: props.data.type,
      name: props.data.name,
      title: props.data.title,
      fee: props.data.fee,
      modal: false,
      showPhone: 1,
      creditType: null,
      memberType: props.data.cash || 0,
      errorMsg: props.data.errorMsg
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  showModal = key => (e) => {
    // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
    // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
    e.preventDefault(); // 修复 Android 上点击穿透
    this.setState({
      [key]: true,
    });
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  render() {
    let { status, cash, type, name, title, creditType, fee, memberType, errorMsg } = this.state;

    let modalStyle = {width: '90%'};
    let formatCash = '-';
    if (cash !== '-') {
      formatCash = `${Numeral(cash).divide(100).format('0, 0.00')}元`;
    }
    let result = null;
    let feeTitle = '支付中, 请耐心等待';
    if (status === 'success') {
      feeTitle = `恭喜您成为${CONFIGS.memberType[memberType]}会员`;
    } else if (status === 'failed') {
      feeTitle = '支付失败';
    }

    if (cash !== '-') {
      formatCash = `${Numeral(cash).divide(100).format('0, 0.00')}元`;
      result = (
        <div className={styles.root}>
          <div className={`${styles.resultStatus} ${styles[status]}`}></div>
          <div className={styles.resultTitle}>{title}</div>
          {type === 'f' &&
            <div className={`${styles.resultCash} number`}>{feeTitle}</div>
          }
          {type !== 'f' &&
            <div className={`${styles.resultCash} number`}>{formatCash}</div>
          }
          {(type === 'p' || type === 'r' || type === 'e') && fee &&
            <div className={styles.resultMessageText}>{`（含支付通道费${fee}元，代资金存管机构收取）`}</div>
          }
          <div className={styles.resultMessage}>
            {(type === 's' && creditType) &&
              <span className={styles.resultMessageText}>{CONFIGS.resultDetail[type][creditType][status]}</span>
            }
            {(type === 'p' || type === 'r') &&
              <span className={styles.resultMessageText}>{CONFIGS.resultDetail[type][status]}</span>
            }
            {(type === 'r') && (status !== 'failed') &&
              <span className={styles.resultMessageWarning} onClick={this.showModal('modal')}></span>
            }
            {(type === 'f') && (status === 'default') &&
              <span className={styles.resultMessageText}>{CONFIGS.resultDetail[type][status]}</span>
            }
            {(type === 'f') && (status === 'failed') &&
              <span className={styles.resultMessageText}>{errorMsg}</span>
            }
          </div>
          {(this.state.showPhone !== 1) && (cash !== '-') && (
            <Phone />
          )}
          <Modal
            className="crf-result-modal"
            style={modalStyle}
            title="温馨提示"
            transparent
            maskClosable={false}
            visible={this.state.modal}
            onClose={this.onClose('modal')}
            platform="ios"
          >
            <div className="crf-result-modal-body">
              <p>按时还款以还款提交成功时间为准, 因系统或银行原因导致的延迟, 不属于逾期, 请勿担心</p>
              <p><button className="normal-btn" onClick={this.onClose('modal')}>知道了</button></p>
            </div>
          </Modal>
        </div>
      )
    } else {
      result = (
        <div></div>
      );
    }
    return (
      <div>
        {result}
      </div>
    )
  }
}
