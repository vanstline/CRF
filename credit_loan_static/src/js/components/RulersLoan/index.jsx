import React, { Component } from 'react';
//import ReactSwipes from 'react-swipes';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

import '../../utils/common/monoevent';

export default class RulersLoan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '借款金额',
      amount: 0,
      defaultAmount: 0,
      data: [],
      rulerWidth: 18,
    };
    this.el = {
      amountIndex: 0,
      halfClientWidth: parseFloat(document.documentElement.clientWidth/2),
      halfRulerWidth: this.state.rulerWidth/2,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list.currentAmount) {
      this.setState({
        data: nextProps.list.data,
        amount: nextProps.list.currentAmount,
        defaultAmount: nextProps.list.currentAmount / 100,
      });
      CONFIGS.currentAmount = nextProps.list.currentAmount;
    }
  }

  componentDidMount() {
    this.bindEvent();
  }

  componentWillUnmount() {
    this.removeEvent();
  }

  removeEvent() {
    const ne = MonoEvent;
    const refDaySwipes = ne('.loan-amount-rulers');
    const touchDoc = ne(document);
    refDaySwipes.un('touchstart');
    touchDoc.un('touchmove');
    touchDoc.un('touchend');
  }

  bindEvent() {
    const ne = MonoEvent;
    const refWrap = ne('.loan-amount-rulers');
    const touchDoc = ne(document);
    const dayEl = document.querySelector('.amount-swipes');

    refWrap.on('touchstart',(e) => {
      let touch = e.touches[0];
      let disX = touch.pageX - dayEl.offsetLeft;

      if (this.state.data.length <= 0) {
        this.removeEvent();
        return;
      }

      touchDoc.on('touchmove', (e) => {
        let touch = e.touches[0];
        let swipeLeft = touch.pageX - disX;//计算
        this.setTouchMove(swipeLeft);//限定,使用
      });

      touchDoc.on('touchend', () => {
        touchDoc.un('touchend');
        touchDoc.un('touchmove');
        this.setTouchEnd();
      });

      return false;
    });
  }

  setTouchMove(swipeLeft) {
    const refDaySwipes = document.querySelector('.amount-swipes');

    let leftMax = this.el.halfClientWidth - this.el.halfRulerWidth;
    const refDaySwipes50 = parseFloat(refDaySwipes.style.width) - this.el.halfClientWidth - this.el.halfRulerWidth;

    if(swipeLeft <= -refDaySwipes50){
      swipeLeft = -refDaySwipes50;
    }
    if(swipeLeft > leftMax){
      swipeLeft = leftMax;
    }

    this.el.amountIndex = Math.round((this.el.halfClientWidth - swipeLeft - this.el.halfRulerWidth) / this.state.rulerWidth);

    this.refAmount.innerHTML = `${Numeral((this.el.amountIndex+1) * 100).format('0, 0')}元`;

    refDaySwipes.style.left = swipeLeft + 'px';
  }

  setTouchEnd() {

    let currentAmount = (this.el.amountIndex + 1) * 100;
    let currentAmountCount = this.el.amountIndex;

    //金额是5的倍数则隐藏
    let crfRulerEle = document.querySelectorAll('.crf-loan-swipes .crf-ruler');

    if (CONFIGS.loanData.currentAmountCount < 5) {
      crfRulerEle[CONFIGS.loanData.currentAmountCount].innerHTML = `<span>&nbsp;${(CONFIGS.loanData.currentAmountCount + 1) * 100}</span>`;
    } else {
      if (CONFIGS.loanData.currentAmountCount % 5 === 0 || CONFIGS.loanData.currentAmountCount % 5 === 4) {
        crfRulerEle[CONFIGS.loanData.currentAmountCount].innerHTML = `<span>${(CONFIGS.loanData.currentAmountCount + 1) * 100}</span>`;
      }
    }

    if (CONFIGS.loanData.currentAmountCount === 5) {
      crfRulerEle[CONFIGS.loanData.currentAmountCount].innerHTML = '';
    }

    const smallAmount = CONFIGS.loanPeriod.productions.length < 5 && currentAmountCount == (CONFIGS.loanPeriod.productions.length - 1);
    if (currentAmountCount === 0 || currentAmountCount % 5 === 4 || smallAmount) {
      CONFIGS.loanData.currentAmountCount = currentAmountCount;
      crfRulerEle[currentAmountCount].innerHTML = '';
    }

    this.refAmount.innerHTML = `${Numeral(currentAmount).format('0, 0')}元`;

    //移动一个格子
    const refDaySwipes = document.querySelector('.amount-swipes');
    let swipeLeft = this.el.halfClientWidth - ((this.el.amountIndex+1) * this.state.rulerWidth) + this.state.rulerWidth/2;
    refDaySwipes.style.left = swipeLeft + 'px';

    if (CONFIGS.currentAmount !== currentAmount) {
      CONFIGS.loanData.sendSwitch = true;

      PubSub.publish('daySwipes:day', currentAmount);

      CONFIGS.currentAmount = currentAmount;
    }

    CONFIGS.realAmount = CONFIGS.currentAmount;
  }

  render() {

    const ruler = (item, index) => {
      let span = '';
      if (index === 0 || index % 5 === 4) {
        if (index <= 8) {
          span = <span>&nbsp;{(index + 1) * 100}</span>;
        } else {
          span = <span>{(index + 1) * 100}</span>;
        }
        if (index === CONFIGS.loanData.currentAmountCount) {
          span = <span></span>;
        }
      }
      return (
        <div key={index} className="crf-ruler">
          {span}
        </div>
      );
    };

    let { title, amount, data, defaultAmount, rulerWidth } = this.state;

    const formatAmount = Numeral(amount).format('0, 0');
    if (!data) data = [];
    let totalWidth = data.length * rulerWidth;
    let defaultWidth = defaultAmount * rulerWidth - rulerWidth / 2;
    let defaultLeft = this.el.halfClientWidth - defaultWidth;

    let amountSwipesStyle = {
      width: totalWidth,
      left: defaultLeft,
    };

    return (
      <section className="crf-swipes crf-loan-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">{title}</span>
        </div>
        <div className="crf-swipes-amount">
          <span className="crf-swipes-amount-text" ref={(span) => { this.refAmount = span; }}>{formatAmount}元</span>
        </div>
        <div className="crf-swipes-content loan-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers loan-amount-rulers">
            <div className="amount-swipes" style={amountSwipesStyle} ref="refAmountSwipes">
              {(data.length > 0) && data.map(ruler)}
            </div>
          </div>
        </div>
      </section>
    )
  }
}
