import React, { Component } from 'react';
import { Modal } from 'antd-mobile';

export default class Phone extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      modalPhone: false
    }
  }

  showCall = key => (e) => {
    e.preventDefault(); // 修复 Android 上点击穿透
    let u = navigator.userAgent;
    let isiOS = !!u.match(CONFIGS.iosRegx); //ios终端
    if (isiOS) {
      window.location = `tel:${CONFIGS.csPhone}`;
    } else {
      this.setState({
        [key]: true,
      });
    }
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  onCall() {
    window.location = `tel:${CONFIGS.csPhone}`;
    this.setState({
      modalPhone: false,
    });
  }

  render() {
    let formatPhone = HandleRegex.formatPhone(CONFIGS.csPhone, '-');
    return (
      <div>
        <a onClick={this.showCall('modalPhone')}>{formatPhone}</a>
        <Modal
          title={formatPhone}
          transparent
          maskClosable={false}
          visible={this.state.modalPhone}
          onClose={this.onClose('modalPhone')}
          footer={[
            { text: '取消', onPress: () => {this.onClose('modalPhone')()} },
            { text: '呼叫', onPress: () => {this.onCall()} }
          ]}
          platform="ios"
        >
        </Modal>
      </div>
    )
  }
}
