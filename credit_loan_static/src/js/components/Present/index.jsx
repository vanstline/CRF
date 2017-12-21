import React, { Component } from 'react';
import { Toast, WhiteSpace, List } from 'antd-mobile';
import {LoadingIcon} from 'app/components';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';
const Item = List.Item;

export default class Present extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: [],
      getPresent: false,
      coupon: {
        real: 0,
        total: 0
      }
    };
  }

  componentDidMount() {
    this.pubsub_token_present = PubSub.subscribe('present:init', function(topic, val) {
      this.setState({coupon: {
        real: 0,
        total: 0
      }});
      this.getCoupons(val);
    }.bind(this));

    this.pubsub_token_coupons = PubSub.subscribe('coupons:value', function(topic, val) {
      this.setState({
        coupon: val
      });
    }.bind(this));
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token_present);
    PubSub.unsubscribe(this.pubsub_token_coupons);
  }

  async getCoupons(amount) {
    let currentAmount = Numeral(amount).multiply(100).value();
    let couponsPath = `${CONFIGS.repayPath}/coupon?kissoId=${CONFIGS.userId}&repaymentMoney=${currentAmount}&isOverdue=${CONFIGS.repayData.overdue_flag}&loanDate=${CONFIGS.repayData.min_normal_loan_time}`;
    this.setState({
      getPresent: true
    });
    try {
      let fetchPromise = CRFFetch.Get(couponsPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          getPresent: false, data: result
        });
      }
    } catch (error) {
      this.setState({
        getPresent: false
      });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  handlePresent() {
    PubSub.publish('coupons:show', this.state.data);
  }

  render() {
    let item = null;
    let loadingItem = <LoadingIcon />;
    let {data, getPresent, coupon} = this.state;

    if (coupon.real !== 0) {
      let formatCoupon = Numeral(coupon.real).format('0, 0.00');
      let coupons = () => {
        return (
          <div className="crf-present-coupons">
            <div className="crf-present-coupons-real">{`-${formatCoupon}元`}</div>
            {coupon.total !== coupon.real &&
              <div className="crf-present-coupons-fee">仅可抵扣{coupon.real}元手续费</div>
            }
          </div>
        );
      };
      let realAmount = Numeral(Numeral(CONFIGS.currentAmount).multiply(100).value() - Numeral(coupon.real).multiply(100).value()).divide(100).format('0, 0.00');
      CONFIGS.realAmount = realAmount;
      let realAmountSpan = () => {
        return (
          <span className="crf-present-real-amount-num">{realAmount}</span>
        );
      };
      item = (
        <div>
          <Item arrow="horizontal" extra={coupons()} onClick={this.handlePresent.bind(this)}>抵扣红包</Item>
          <Item className="crf-present-real-amount">
            实付金额 : {realAmountSpan()}元
          </Item>
        </div>
      );
    } else {
      if (getPresent) {
        item = <Item extra={loadingItem}>抵扣红包</Item>;
      } else {
        if (data.length > 0) {
          item = <Item arrow="horizontal" className='crf-present' extra={`${data.length}个可用`} onClick={this.handlePresent.bind(this)}>抵扣红包</Item>;
        } else {
          item = <Item extra="0个可用">抵扣红包</Item>;
        }
      }
    }

    return (
      <List className="crf-list">
        {item}
      </List>
    )
  }
}
