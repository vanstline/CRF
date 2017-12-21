import React, { Component } from 'react';
import { Popover } from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

import '../../utils/common/monoevent';

export default class AmountSwipes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '借款金额(元)',
      amount: 0,
      defaultAmount: 0,
      data: [],
      rulerWidth: 18,
      message: '对不起, 借款金额已超出最大可借金额, 请重新选择',
    };
    this.el = {
      amountIndex: 0,
      halfClientWidth: parseFloat(document.documentElement.clientWidth / 2),
      halfRulerWidth: this.state.rulerWidth / 2,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list.currentAmount) {
      this.setState({
        data: nextProps.list.data,
        amount: nextProps.list.currentAmount,
        defaultAmount: nextProps.list.currentAmount / 100,
      });
    }
  }

  componentDidUpdate() {
    if (!this.refGreyLine.classList.contains('n')) {
      this.refGreyLine.style.width = `${this.el.halfClientWidth}px`;
      const distance = - (CONFIGS.newLoanPeriod.productions.length - CONFIGS.currentAmount / 100) * this.state.rulerWidth;
      this.refGreyLine.style.right = `${distance}px`;
    }
  }

  componentDidMount() {
    this.bindEvent();
  }

  componentWillUnmount() {
    this.removeEvent();
    PubSub.unsubscribe(this.pubsub_token);
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

    refWrap.on('touchstart', (e) => {
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

    this.refTips.onclick = () => {
      this.refSwipesMessage.classList.remove('n');
    };

    document.addEventListener('click', (e) => {
      const targetClassName = e.target.className;
      if (targetClassName != 'crf-swipes-amount-tips') {
        this.refSwipesMessage && this.refSwipesMessage.classList.add('n');
      }

      if (targetClassName != 'crf-period-main' && targetClassName != 'crf-period-top' && targetClassName != 'crf-top-title' && targetClassName != 'crf-select-text' && targetClassName != 'period-arrow' && targetClassName != 'crf-top-select' && targetClassName != 'crf-select-text selected') {
        PubSub.publish('periodMainList:hide');
      }
    }, false);

    this.pubsub_token = PubSub.subscribe('tips:show', (topic, val) => {
      this.refTips.classList.remove('n');
      this.refGreyLine.remove('n');
    });

  }

  setTouchMove(swipeLeft) {
    const refDaySwipes = document.querySelector('.amount-swipes');

    let leftMax = this.el.halfClientWidth - this.el.halfRulerWidth;
    const refDaySwipes50 = parseFloat(refDaySwipes.style.width) - this.el.halfClientWidth - this.el.halfRulerWidth;

    if (swipeLeft <= -refDaySwipes50) {
      swipeLeft = -refDaySwipes50;
    }
    if (swipeLeft > leftMax) {
      swipeLeft = leftMax;
    }

    const amountIndex = (this.el.amountIndex + 1);
    const distance = - (CONFIGS.newLoanPeriod.productions.length - amountIndex) * this.state.rulerWidth;

    if (!this.refGreyLine.classList.contains('n')) {
      this.refGreyLine.style.right = `${distance}px`;
    }

    this.el.amountIndex = Math.round((this.el.halfClientWidth - swipeLeft - this.el.halfRulerWidth) / this.state.rulerWidth);

    this.setAmountValue(amountIndex * 100);

    refDaySwipes.style.left = swipeLeft + 'px';
  }

  setTouchEnd() {
    let currentAmount = (this.el.amountIndex + 1) * 100;
    this.hiddenAmountRulerEl();
    this.setAmountValue(currentAmount);
    this.moveAmountSwipes();
    this.resetAmountData(currentAmount);
    if (CONFIGS.currentAmount >= CONFIGS.forbidAmount) {
      PubSub.publish('periodTop:disabled');
      this.refTips.classList.remove('n');
      this.refGreyLine.classList.remove('n');
    } else {
      PubSub.publish('periodTop:hidden');
      this.refTips.classList.add('n');
    }
    this.refSwipesMessage.classList.add('n');
  }

  /*forbidArea() {
    let forbidDistance = document.body.clientWidth / 2 + (CONFIGS.forbidAmount / 100 * this.state.rulerWidth);
    let dragDistance = document.body.clientWidth / 2 + (this.el.amountIndex * this.state.rulerWidth);
    if (dragDistance >= forbidDistance) {
      this.lineEl.style.right =`${dragDistance - forbidDistance}px`;
    }
  }*/

  resetAmountData(currentAmount) {
    console.log(currentAmount + '--' + CONFIGS.currentAmount);
    if (CONFIGS.currentAmount !== currentAmount) {
      CONFIGS.loanData.sendSwitch = true;
      CONFIGS.currentAmount = currentAmount;
      //PubSub.publish('daySwipes:day', currentAmount);
      PubSub.publish('loanDetail:hide');
      PubSub.publish('periodMain:hidden');
      PubSub.publish('periodList:set', CONFIGS.newLoanPeriod['productions'][currentAmount / 100 - 1]);
    }
    CONFIGS.realAmount = CONFIGS.currentAmount;
  }

  setAmountValue(currentAmount) {
    this.refAmount.innerHTML = `${Numeral(currentAmount).format('0, 0')}`;
  }

  moveAmountSwipes() {
    //移动一个格子
    const refDaySwipes = document.querySelector('.amount-swipes');
    let swipeLeft = this.el.halfClientWidth - ((this.el.amountIndex + 1) * this.state.rulerWidth) + this.state.rulerWidth / 2;
    refDaySwipes.style.left = swipeLeft + 'px';
  }

  hiddenAmountRulerEl() {
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
    const smallAmount = CONFIGS.newLoanPeriod.productions.length <= 5 && currentAmountCount == (CONFIGS.newLoanPeriod.productions.length - 1);
    if (currentAmountCount === 0 || currentAmountCount % 5 === 4 || smallAmount) {
      CONFIGS.loanData.currentAmountCount = currentAmountCount;
      crfRulerEle[currentAmountCount].innerHTML = '';
    }
  }

  render() {

    const ruler = (item, index) => {
      let span = '';
      let forbidSpan;
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

      if (index === CONFIGS.forbidAmount / 100 - 1) {
        forbidSpan = <span className="forbid-left">line</span>
      }

      return (
        <div key={index} className={item >= CONFIGS.forbidAmount ? 'crf-ruler forbid' : 'crf-ruler'}>
          {span}
          {forbidSpan}
        </div>
      );
    };

    let { title, amount, data, defaultAmount, rulerWidth, message } = this.state;

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
          <span className="crf-swipes-amount-text" ref={(span) => { this.refAmount = span; }}>{formatAmount}</span>
          <span className="crf-swipes-amount-tips n" ref={(span) => { this.refTips = span; }}>tips</span>
          <div className="crf-swipes-amount-message n" ref={(div) => { this.refSwipesMessage = div; }}>
            <span className="tips-message">{message}</span>
            <span className="tips-arrow">arrow</span>
          </div>
        </div>
        <div className="crf-swipes-content loan-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <span className="loan-amount-grey-line n" ref={(span) => { this.refGreyLine = span; }}>line</span>
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
