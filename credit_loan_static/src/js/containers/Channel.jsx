import React, { Component } from 'react';
import { Nav, Loading } from 'app/components';
import { Toast, WhiteSpace, Modal } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import ReactTooltip from 'react-tooltip';

class Channel extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: '还款方式',
      amount: CONFIGS.method.repayTotalAmt || 0,
      fees: CONFIGS.method.channelFee || 0,
      details: CONFIGS.method.channelFeeDesc || '',
      channelList: CONFIGS.method.channelList || [],
      modalPhone: false
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    if (CONFIGS.method.channelList) {
      this.setMethodData();
    } else {
      this.getInitData();
    }
  }

  async getInitData() {
    this.refs.loading.show();
    CONFIGS.userId = this.props.location.query.ssoId;
    CONFIGS.realAmount = this.props.location.query.realAmount;
    let currentAmount = Numeral(CONFIGS.realAmount).multiply(100).value();
    let methodPath = `${CONFIGS.repayPath}/method?kissoId=${CONFIGS.userId}&repayAmount=${currentAmount}`;
    try {
      let fetchMethodPromise = CRFFetch.Get(methodPath);
      // 获取数据
      let methodResult = await fetchMethodPromise;
      if (methodResult && !methodResult.response) {
        this.setMethodData(methodResult);
      }
    } catch (error) {
      this.refs.loading.hide();
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      }, () => {
        let path = 'repay';
        hashHistory.push({
          pathname: path,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });
    }
  }

  setMethodData(methodData) {
    if (methodData) {
      Object.assign(CONFIGS.method, methodData);
    }
    this.refs.loading.hide();

    let formatAmount = CONFIGS.method.repayTotalAmt;
    let formatFees = CONFIGS.method.channelFee;

    this.setState({
      amount: formatAmount,
      fees: formatFees,
      details: CONFIGS.method.channelFeeDesc,
      channelList: CONFIGS.method.channelList
    });
  }

  handleClick() {
    let path = 'repayconfirm';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        realAmount: CONFIGS.realAmount,
        type: 'r'
      }
    });
  }

  handleWeixinRepay() {

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
    const props = { title: this.state.title};
    const {amount, fees, details, channelList} = this.state;
    const formatAmount = Numeral(amount).divide(100).format('0, 0.00');
    const formatFees = Numeral(fees).divide(100).format('0, 0.00');
    const formatPhone = HandleRegex.formatPhone(CONFIGS.csPhone, '-');
    const ChannelRow = (item, index) => {
      if (item.channelInfoNoEnum === 'wechat') {
        return (
          <button key={index} className="channel-btn" onClick={this.handleWeixinRepay.bind(this)}><span className="weixin-icon"></span><span>微信还款</span></button>
        );
      } else {
        return (
          <button key={index} className="normal-btn" onClick={this.handleClick.bind(this)}>快捷还款</button>
        );
      }
    };
    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <section className="main-content gray-bg">
          <section className="crf-common-container">
            <div className="crf-common-title">
              <span className="crf-common-title-text">还款金额(元)</span>
            </div>
            <div className="crf-common-amount">
              <span className="crf-common-amount-text">{formatAmount}</span>
            </div>
            <div className="crf-confirm-des">
              <span className="tooltip-icon" data-tip data-for="description"></span>
              <span className="crf-confirm-des-text">{`(含支付通道费${formatFees}元) `}</span>
            </div>
          </section>
        </section>
        <footer className="crf-channel-footer">
          {channelList.map(ChannelRow)}
          {channelList.length === 1 && channelList[0].channelInfoNoEnum === 'wechat' &&
            <div className="crf-channel-details">如您还款遇到问题, 可拨打客服电话<a onClick={this.showCall('modalPhone')}>{formatPhone}</a>咨询哦</div>
          }
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
        </footer>
        <ReactTooltip id='description' place="bottom" className="crf-tooltips" effect='solid'>
          <span>{details}</span>
        </ReactTooltip>
        <Loading ref="loading" />
      </div>
    )
  }
}

export default Channel;
