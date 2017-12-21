import React, { Component } from 'react';
import { DaySwipesExtend } from 'app/components';
import {WhiteSpace,Toast} from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

export default class Rulers extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      day: props.list.currentDay || 0,
      defaultDay: props.list.defaultDay || 0,
      data: props.list.data || [],
      rulerWidth: 9,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({data: nextProps.list.data, day: nextProps.list.defaultDay, defaultDay: nextProps.list.defaultDay});
  }

  componentDidUpdate() {
    this.resetContainer();//？
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  resetContainer() {
    CONFIGS.currentDay = this.state.defaultDay;
    CONFIGS.realDay = CONFIGS.currentDay;
  }

  getCurrentPoint() {
    let currentPoint = 0;
    if (this.state.data.length !== 0) {
      currentPoint = this.state.data.indexOf(this.state.defaultDay);
    }
    return currentPoint;
  }

  render() {
    const { day, data } = this.state;// defaultDay,

    let formatDay = Numeral(day).format('0, 0');

    return (
      <section className="crf-swipes extend-rulers">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">借款期限</span>
        </div>
        <div className="crf-swipes-amount">
          <span className="crf-swipes-amount-text ref-day" ref="refDay">{formatDay}天</span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers loan-ruler-day">
            <DaySwipesExtend list={data} defaultDay={formatDay} />
          </div>
        </div>
      </section>
    )
  }
}
