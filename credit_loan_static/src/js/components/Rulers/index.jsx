import React, { Component } from 'react';
import {RepayDetail} from 'app/components';
import {WhiteSpace} from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

import '../../utils/common/monoevent';

export default class Rulers extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: CONFIGS.repayDefaultTitle,
      amount: 0,
      defaultAmount: 0,
      data: [],
      rulerWidth: 9,
      isDefault: true,
      disable: true
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({data: nextProps.list.data, amount: nextProps.list.currentAmount, defaultAmount: nextProps.list.currentAmount, disable: nextProps.list.disable});
  }

  componentDidUpdate() {
    this.setTextPosition();
    this.resetContainer();
  }

  componentDidMount() {
    this.bindEvent();
  }

  componentWillUnmount() {
    this.removeEvent();
  }

  removeEvent() {
    const ne = MonoEvent;
    const swipes = ne('.crf-swipes-rulers');
    swipes.un('touchstart');
    swipes.un('touchmove');
    swipes.un('touchend');
  }

  bindEvent() {
    let ne = MonoEvent;
    let refWrap = ne('.crf-swipes-rulers');
    let touchDoc = ne(document);

    let rulerEl = document.querySelector('.crf-rulers');

    refWrap.on('touchstart',(e) => {
      let touch = e.touches[0];
      let disX = touch.pageX - this.refs.rulers.offsetLeft;

      touchDoc.on('touchmove', (e) => {
        let touch = e.touches[0];
        let swipeLeft = touch.pageX - disX; //计算
        this.setTouchMove(swipeLeft); //限定,使用
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
    let leftMax = parseFloat(document.documentElement.clientWidth / 2) - this.state.rulerWidth / 2;
    let swipes = parseFloat(this.refs.rulers.style.width) - leftMax;

    if (swipeLeft <= -swipes) {
      swipeLeft = -swipes;
    }
    if (swipeLeft > leftMax) {
      swipeLeft = leftMax;
    }
    let currentPoint = Math.round((leftMax - swipeLeft) / this.state.rulerWidth);
    if (currentPoint >= this.state.data.length) {
      currentPoint = (this.state.data.length - 1);
    } else if (currentPoint < 0) {
      currentPoint = 0;
    }
    this.setRulerState(currentPoint, 'move');
  }

  setTouchEnd() {
    let currentPoint = this.getCurrentPoint();
    this.setRulerState(currentPoint);
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let currentPoint = this.getCurrentPoint();
    let rulerOffsetWidth = (currentPoint + 1) * this.state.rulerWidth;
    let offsetLeft = parseFloat(document.documentElement.clientWidth / 2) - (rulerOffsetWidth - this.state.rulerWidth / 2);
    CONFIGS.currentAmount = this.state.defaultAmount;
    let storage = window.localStorage;
    storage.setItem('currentAmount', CONFIGS.currentAmount);
    CONFIGS.realAmount = CONFIGS.currentAmount;

    if (this.refs.rulers) {
      this.refs.rulers.style.width = totalWidth + 'px';
      this.refs.rulers.style.left = `${offsetLeft}px`;
      //if (this.state.amount === this.state.defaultAmount) PubSub.publish('present:init', this.state.data[currentPoint]);
    }
  }

  getCurrentPoint() {
    let currentPoint = 0;
    if (this.state.data.length !== 0) {
      let currentData = this.state.data;
      currentPoint = this.state.data.indexOf(this.state.amount);
    }
    return currentPoint;
  }

  handleReset() {
    let defaultPoint = this.state.data.indexOf(this.state.defaultAmount);
    this.setRulerState(defaultPoint, '', 'reset');
  }

  showModal() {
    PubSub.publish('repayDetail:show', this.state.amount);
  }

  setTextPosition() {
    let textContainer = document.getElementsByClassName('crf-swipes-amount-text')[0];
    let marginLeft = -(textContainer.clientWidth / 2) + 'px';
    let container = document.getElementsByClassName('crf-swipes-amount')[0];
    container.style.marginLeft = marginLeft;
  }

  setRulerState(point, type, title) {
    let defaultValue = false;
    let currentTitle = CONFIGS.repayChangedTitle;
    if (this.state.data[point] === this.state.defaultAmount) {
      defaultValue = true;
    }
    if (title === 'reset') {
      currentTitle = CONFIGS.repayDefaultTitle;
    }
    this.setState({
      amount: this.state.data[point],
      title: currentTitle,
      isDefault: defaultValue
    });
    CONFIGS.currentAmount = this.state.data[point];
    CONFIGS.realAmount = CONFIGS.currentAmount;
    if (type !== 'move') {
      let storage = window.localStorage;
      storage.setItem('currentAmount', CONFIGS.currentAmount);
      PubSub.publish('present:init', this.state.data[point]);
    }
    let swipeLeft = parseFloat(document.documentElement.clientWidth / 2) - ((point + 1) * this.state.rulerWidth) + this.state.rulerWidth / 2;
    this.refs.rulers.style.left = swipeLeft + 'px';
    this.setTextPosition();
  }

  render() {
    const ruler = (item, index) => {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    };

    const {title, amount, isDefault, disable, data, rulerWidth} = this.state;
    const formatAmount = Numeral(amount).format('0, 0.00');

    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">{title}</span>
          {!isDefault &&
            <span className="crf-swipes-title-link">
              <a onClick={this.handleReset.bind(this)}></a>
            </span>
          }
        </div>
        <div ref="swipes" className="crf-swipes-amount">
          <span className="crf-swipes-amount-text">{formatAmount}</span>
          <span className="crf-swipes-amount-link">
            {!disable &&
              <a onClick={this.showModal.bind(this)}>明细</a>
            }
          </span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers">
            <div ref="rulers" className="crf-rulers">
              {(this.state.data.length > 0) && this.state.data.map(ruler)}
            </div>
          </div>
        </div>
        <div className="crf-swipes-description">左右滑动调整还款金额, 调整以50为单位</div>
        <RepayDetail />
      </section>
    )
  }
}
