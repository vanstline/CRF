import React, { Component } from 'react';
import { Toast, ListView, Accordion } from 'antd-mobile';
import PubSub from 'pubsub-js';
import Numeral from 'numeral';

export default class Coupons extends Component {
  constructor(props, context) {
    super(props, context);

    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    this.dataList = [];
    this.state = {
      dataSource: this.dataSource.cloneWithRows(this.dataList),
      title: '使用红包',
      fromRemote: false
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('coupons:show', function(topic, list) {
      this.setData(list);
      this.showCoupons();
    }.bind(this));
  }

  setData(list) {
    let data = list.map((item, index) => {
      let obj = {
        id: item.id,
        index: index,
        awardValue: item.awardValue,
        loanDate: item.effectiveDate,
        repayDate: item.expiredTime,
        freeFeeFlag: item.freeFeeFlag,
        discountValue: item.discountValue,
        note: item.note.split('<br> ')
      };
      return obj;
    });
    this.setState({
      dataSource: this.dataSource.cloneWithRows(data), fromRemote: true
    });
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  showCoupons() {
    this.refs.couponsSection.classList.remove('hide');
    this.refs.couponsSection.classList.add('show');
    let container = document.querySelector('.coupons-list-content');
    container.style.height = (document.documentElement.offsetHeight - 100) + 'px';
  }

  closeCoupons() {
    this.refs.couponsSection.classList.remove('show');
    this.refs.couponsSection.classList.add('hide');
    this.setState({
      dataSource: this.dataSource.cloneWithRows([])
    });
  }

  async getFee(index) {
    let currentAmount = Numeral(CONFIGS.currentAmount).multiply(100).value();
    let path = `${CONFIGS.repayPath}/coupon?kissoId=${CONFIGS.userId}&repaymentAmount=${currentAmount}`;
    let paramData = this.state.dataSource.getRowData(0, index);
    CONFIGS.selectCoupon = paramData;
    let params = {
      amt_type: 1,
      coupon_id: paramData.id,
      coupon_price: paramData.awardValue
    };
    let headers = {
      'Content-Type': 'application/json'
    };

    try {
      let fetchPromise = CRFFetch.Post(path, JSON.stringify(params), headers);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setCouponsData(result);
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

  setCouponsData(result) {
    this.closeCoupons();
    CONFIGS.selectCoupon.offsetedCouponPrice = result.offsetedCouponPrice;
    let realFee = Numeral(CONFIGS.selectCoupon.offsetedCouponPrice).divide(100).value();
    let totalFee = Numeral(CONFIGS.selectCoupon.awardValue).divide(100).value();
    let coupos = {
      real: realFee,
      total: totalFee
    };
    PubSub.publish('coupons:value', coupos);
  }

  handleClick(e) {
    e.stopPropagation();
    let index = parseInt(e.currentTarget.getAttribute('data-index'));
    this.getFee(index);
  }

  handleToggle(e) {
    let id = e.currentTarget.getAttribute('data-id');
    let flag = e.currentTarget.lastChild;
    let menu = document.getElementById(`row_${id}`).lastChild;
    if (!menu.classList.contains('show')) {
      menu.classList.add('show');
      menu.classList.remove('hide');
      flag.classList.add('show');
      e.preventDefault();
    } else {
      menu.classList.remove('show');
      menu.classList.add('hide');
      flag.classList.remove('show');
      e.preventDefault();
    }
  }

  render() {
    let header = () => {
      let nums = this.state.dataSource.rowIdentities[0].length;
      return (
        <div className="coupon-can-use">可使用({nums})</div>
      );
    };

    let rule = (item) => {
      return (
        <p>{item}</p>
      );
    };

    let coupon = (item) => {
      if (item.freeFeeFlag === 'Y' && item.discountValue === '1') {
        return (
          <div className="coupon-middle">
            <span className="amount">免</span>
          </div>
        );
      } else if (item.freeFeeFlag === 'Y' && item.discountValue !== '1') {
        return (
          <div className="coupon-middle">
            <span className="amount">{Numeral(item.discountValue).multiply(10).value()}</span><span>折</span>
          </div>
        );
      } else {
        return (
          <div className="coupon-middle">
            <span>￥</span>
            <span className="amount">{Numeral(item.awardValue).divide(100).value()}</span>
          </div>
        );
      }
    };

    let couponDetail = (item) => {
      let detail = '';
      if (item.freeFeeFlag === 'Y' && item.discountValue === '1') {
        detail = '免手续费券';
      } else if (item.freeFeeFlag === 'Y' && item.discountValue !== '1') {
        detail = `手续费${Numeral(item.discountValue).multiply(10).value()}折券`;
      } else {
        detail = `${Numeral(item.awardValue).divide(100).value()}元抵扣券`;
      }
      return detail;
    };

    let row = (rowData) => {
      return (
        <div key={rowData.id} id={`row_${rowData.id}`}>
          <div className="coupon-row">
            <div className="coupon-left">
              {coupon(rowData)}
            </div>
            <div className="coupon-right">
              <div className="triangle-border-right">
                <em className="circular-top"></em>
                <em className="circular-bottom"></em>
                <i className="border"></i>
              </div>
              <div className="coupon-inner">
                <div className="coupon-text">{couponDetail(rowData)}</div>
                <div className="coupon-date">{rowData.loanDate} ~ {rowData.repayDate}有效</div>
                <div className="coupon-accordion">
                  <a className="accordion" data-id={rowData.id} onClick={this.handleToggle.bind(this)}>
                    <span className="accordion-text">使用规则</span>
                    <span className="accordion-inner"></span>
                  </a>
                </div>
                <div className="coupon-button">
                  <button className="normal-btn" data-index={rowData.index} onClick={this.handleClick.bind(this)}>立即使用</button>
                </div>
              </div>
            </div>
          </div>
          <div className="accordion-row hide">
            {rowData.note.map(rule)}
          </div>
        </div>
      );
    };

    let data = this.state.dataSource.rowIdentities;
    let { fromRemote } = this.state;
    let couponsContent = null;

    if (fromRemote) {
      if (data && data.length > 0) {
        couponsContent = (
          <ListView ref="couponsListView"
            dataSource={this.state.dataSource}
            renderRow={row}
            className="coupons-list-content"
          />
        );
      } else {
        couponsContent = null;
      }
    }

    return (
      <section ref="couponsSection" className="coupons-container">
        <div className="coupons-list">
          {header()}
          {couponsContent}
        </div>
      </section>
    );
  }
}
