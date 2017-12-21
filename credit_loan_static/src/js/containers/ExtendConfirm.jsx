import React, { Component } from 'react';
import { Nav, SendSms, Loading } from 'app/components';
import { Toast, WhiteSpace, List } from 'antd-mobile';
import Numeral from 'numeral';
import { hashHistory } from 'react-router';
const Item = List.Item;

class ExtendConfirm extends Component {
  constructor(props) {
    super(props);
    CONFIGS.sendSmsType = props.location.query.type;
    if (!CONFIGS.userId) {
      CONFIGS.userId = props.location.query.ssoId || ''
    }
    this.state = {
      kissoId: CONFIGS.userId || '',
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
    if (CONFIGS.extendData && CONFIGS.extendData.length === 0) {
      let path = 'extend';
      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.userId
        }
      });
    } else {
      this.getInitData();
    }
  }

  async getInitData() {
    let currentAmount = Numeral(CONFIGS.realAmount).multiply(100).value();;
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
  }

  render() {
    let props = { title: '展期', stage: 'extendConfirm'};
    let {way, amount, fee, isLoading, details} = this.state;
    let totalAmount = () => {
      let formatTotalAmount = Numeral(amount).format('0, 0.00');
      let formatCoupon = Numeral(fee).format('0, 0.00');
      return (
        <div className="crf-confirm-details">
          <div className="crf-confirm-amount">
            <span className="number">{`${formatTotalAmount}`}</span>
            <span>元</span>
          </div>
          <div className="crf-confirm-des">
            <span className="crf-confirm-des-text">{`含支付通道费${formatCoupon}元 代资金存管机构收取`}</span>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <List className="crf-list crf-confirm">
          <Item extra={`${way}`}>支付方式</Item>
          <Item extra={totalAmount()}>展期费用</Item>
        </List>
        <WhiteSpace />
        <SendSms show={isLoading}/>
        <Loading show={isLoading} />
      </div>
    )
  }
}

export default ExtendConfirm;
