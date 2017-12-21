import React, { Component } from 'react';
import { Nav, SendSms, Loading } from 'app/components';
import { Toast, WhiteSpace, List, Popover } from 'antd-mobile';
import Numeral from 'numeral';
import { hashHistory } from 'react-router';
const Item = List.Item;

class RepayConfirm extends Component {
  constructor(props) {
    super(props);
    CONFIGS.sendSmsType = props.location.query.type;
    CONFIGS.realAmount = props.location.query.realAmount;
    if (!CONFIGS.userId) {
      CONFIGS.userId = props.location.query.ssoId || ''
    }
    this.state = {
      kissoId: CONFIGS.userId || '',
      title: '还款确认',
      way: '',
      amount: props.location.query.realAmount || '',
      fee: 0,
      details: '',
      visible: false,
      isLoading: true
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_RepayConfirm']);
    this.getInitData();
    if (Common.isYouBaiLocal()) {
      this.saveLinkStatue();
    }
  }

  saveLinkStatue() {
    CONFIGS.isFromOther = true;
    localStorage.setItem('isFromOther', true);
  }

  handleVisibleChange = (visible) => {
    setTimeout(() => {
      this.setState({
        visible,
      });
      this.setPopoverPosition();
    }, 300);
  };

  setPopoverPosition() {
    let ele = document.querySelector('.am-popover');
    ele.style.left = '50%';
    ele.style.top = (ele.offsetTop + 2) + 'px';
    let arrow = document.querySelector('.am-popover-arrow');
    let currentPoint = document.querySelector('.tooltip-icon');
    let mainContainerLeft = ele.clientWidth;
    let screenWidth = document.body.clientWidth;
    let offsetLeft = currentPoint.parentElement.offsetLeft - (screenWidth - mainContainerLeft) / 2 + 1;
    arrow.style.left = offsetLeft + 'px';
    arrow.style.top = '-2px';
  }

  async getInitData() {
    let currentAmount = Numeral(this.props.location.query.realAmount).multiply(100).value();
    let accountPath = `${CONFIGS.basePath}fts/${this.state.kissoId}/borrower_open_account`;
    let methodPath = `${CONFIGS.repayPath}/method?kissoId=${this.state.kissoId}&repayAmount=${currentAmount}`;
    let userPath = `${CONFIGS.basePath}/user?kissoId=${this.state.kissoId}`;
    try {
      let fetchAccountPromise = CRFFetch.Get(accountPath);
      let fetchMethodPromise = CRFFetch.Get(methodPath);
      let fetchUserPromise = CRFFetch.Get(userPath);
      // 获取数据
      let accountResult = await fetchAccountPromise;
      let methodResult = await fetchMethodPromise;
      let userResult = await fetchUserPromise;
      if (accountResult && !accountResult.response && methodResult && !methodResult.response && userResult && !userResult.response) {
        this.setData(accountResult, methodResult, userResult);
      }
    } catch (error) {
      this.setState({
        isLoading: false
      });
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

  setData(accountData, methodData, userData) {
    Object.assign(CONFIGS.account, accountData);
    Object.assign(CONFIGS.method, methodData);
    Object.assign(CONFIGS.user, userData);
    let way = `${accountData.bankName}卡(${accountData.bankCardNo.slice(-4)})`;
    let currentAmount = Numeral(methodData.repayTotalAmt).divide(100).value();
    let currentFee = Numeral(methodData.channelFee).divide(100).value();
    this.setState({
      way: way,
      amount: currentAmount,
      fee: currentFee,
      details: methodData.channelFeeDesc,
      isLoading: false
    });
    this.setTooltip();
  }

  setTooltip() {
    document.body.classList.add('tooltip');
  }

  render() {
    let props = { title: this.state.title, stage: 'repayConfirm'};
    let {way, amount, fee, isLoading, details} = this.state;
    let formatCoupon = Numeral(fee).format('0, 0.00');
    let totalAmount = () => {
      let formatTotalAmount = Numeral(amount).format('0, 0.00');
      return (
        <div className="crf-confirm-details">
          <div className="crf-confirm-amount">
            <span className="number">{`${formatTotalAmount}`}</span>
            <span>元</span>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <List className="crf-list crf-confirm">
          <Item extra={`${way}`}>还款方式</Item>
          <Item extra={totalAmount()}>还款金额</Item>
          <div className="crf-confirm-des">
            <Popover
              visible={this.state.visible}
              overlay={details}
              onVisibleChange={this.handleVisibleChange}
            >
              <span className="tooltip-icon" data-tip data-for="description"></span>
            </Popover>
            <span className="crf-confirm-des-text">{`含支付通道费${formatCoupon}元 代资金存管机构收取`}</span>
          </div>
        </List>
        <WhiteSpace />
        <SendSms show={isLoading} fee={Numeral(fee).format('0, 0.00')}/>
        <Loading show={isLoading} />
      </div>
    )
  }
}

export default RepayConfirm;
