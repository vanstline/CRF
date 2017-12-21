import React, { Component } from 'react';
import { Nav, SendSms, Loading, SetContract } from 'app/components';
import { Toast, WhiteSpace, List } from 'antd-mobile';
import Numeral from 'numeral';
import { hashHistory } from 'react-router';
const Item = List.Item;

class AnnualFeeConfirm extends Component {
  constructor(props) {
    super(props);
    CONFIGS.sendSmsType = props.location.query && props.location.query.type;
    if (!CONFIGS.userId) {
      CONFIGS.userId = props.location.query.ssoId || ''
    }
    this.state = {
      kissoId: CONFIGS.userId || '',
      way: '',
      amount: props.location.query && props.location.query.realAmount || '',
      fee: 0,
      visible: false,
      isLoading: true,
      // assType: props.location.query && props.location.query.assType,
      memberIndex: props.location.query && props.location.query.memberIndex,
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;

    this.getInitData();
  }

  async getInitData() {
    let currentAmount = this.state.amount && Numeral(this.state.amount).multiply(100).value();
    let returnAwardFlag = '1';
    let accountPath = `${CONFIGS.basePath}fts/${this.state.kissoId}/borrower_open_account`;
    let campaignPath = `/campaign/award/${this.state.kissoId}/coupon/return?amount=${currentAmount}&returnAwardFlag=${returnAwardFlag}`;
    let userPath = `${CONFIGS.basePath}/user?kissoId=${this.state.kissoId}`;
    try {
      let fetchAccountPromise = CRFFetch.Get(accountPath);
      let fetchCampaignPromise = CRFFetch.Get(campaignPath);
      let fetchUserPromise = CRFFetch.Get(userPath);
      // 获取数据
      let accountResult = await fetchAccountPromise;
      let campaignResult = await fetchCampaignPromise;
      let userResult = await fetchUserPromise;
      if (accountResult && !accountResult.response && campaignResult && !campaignResult.response && userResult && !userResult.response) {
        this.setData(accountResult, campaignResult, userResult);
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

  setData(accountData, campaignData, userData) {
    Object.assign(CONFIGS.account, accountData);
    //console.log(campaignData, '--campaignData');
    Object.assign(CONFIGS.annualCampaign, campaignData);
    Object.assign(CONFIGS.user, userData);
    let way = `${accountData.bankName}卡(${accountData.bankCardNo.slice(-4)})`;
    let currentAmount;
    let currentFee;
    if (campaignData.awardTotalValue) {
      currentAmount = this.state.amount - Numeral(campaignData.awardTotalValue).divide(100).value();
      currentFee = Numeral(campaignData.awardTotalValue).divide(100).value();
    } else {
      currentAmount = this.state.amount;
      currentFee = Numeral(0).divide(100).value();
    }

    /*
    * {
     "status": null,
     "returnAwardFlag": null,
     "usedOrderId": null,
     "awardRecordBos": [],
     "source": null,
     "awardTotalValue": 0
     }
    * */
    //console.log(this.state.amount);
    //console.log(CONFIGS.annualCampaign, 'CONFIGS.annualCampaign');
    this.setState({
      way: way,
      amount: currentAmount,
      fee: currentFee,
      isLoading: false,
    });
  }

  render() {
    let props = { title: '支付', stage: 'annualFeeConfirm'};
    let {way, amount, fee, isLoading, memberIndex} = this.state;

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
            <span className="crf-confirm-des-text">{`(返还金已抵扣${formatCoupon}元)`}</span>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Nav data={props} />
        <WhiteSpace />
        <List className="crf-list crf-confirm">
          <Item extra={`${way}`}>支付银行卡</Item>
          <Item extra={totalAmount()}>需支付金额</Item>
        </List>
        <WhiteSpace />
        <SendSms show={isLoading} memberIndex={memberIndex} pathname="isAnnual" />
        <SetContract className="loan-contract" curPath="annualfeeconfirm" />
        <div className="annualFeeTips">-- 请确保您银行卡余额充足 --</div>
        <Loading show={isLoading} />
      </div>
    )
  }
}

export default AnnualFeeConfirm;
