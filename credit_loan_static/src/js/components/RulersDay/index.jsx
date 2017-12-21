import React, { Component } from 'react';
//import ReactSwipes from 'react-swipes';
import { DaySwipes } from 'app/components';
import {WhiteSpace,Toast} from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

export default class Rulers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValue: 0,
      data: [],
      isOnlyPeriod: false,
      isNewRule: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      data: nextProps.list.data,
      defaultValue: nextProps.list.defaultDay,
      isOnlyPeriod: nextProps.list.isOnlyPeriod,
      isNewRule: nextProps.list.isNewRule,
    });
  }

  /*componentDidUpdate() {
    this.resetContainer();//？
  }*/

  /*componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  resetContainer() {
    CONFIGS.currentDay = this.state.defaultDay;
    CONFIGS.realDay = CONFIGS.currentDay;
  }*/

  /*getCurrentPoint() {
    let currentPoint = 0;
    if (this.state.data.length !== 0) {
      //let currentData = this.state.data;
      currentPoint = this.state.data.indexOf(this.state.defaultDay);
    }
    return currentPoint;
  }*/
  // defaultValue === 60
  render() {
    let { defaultValue, data, isOnlyPeriod, isNewRule } = this.state;// defaultDay,
    let formatDay  = parseInt(Numeral(defaultValue).format('0, 0'));
    const isOnlyDay = data && data.length === 1 && Common.isOnlyDay(data);
    if (isOnlyDay) {
      defaultValue = data[0];
    }
    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">借款期限</span>
        </div>
        <div className="crf-swipes-amount">
          {
            isNewRule
            ?
            <span className="crf-swipes-amount-text ref-day" ref="refDay">
              {
                isOnlyDay
                  ?
                  `${defaultValue}天`
                  :
                  `${defaultValue}期`
              }
            </span>
            :
            <span className="crf-swipes-amount-text ref-day" ref="refDay">
            { isOnlyPeriod ? `${defaultValue}期` : `${formatDay}天` }
            </span>
          }
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          {
            isNewRule
              ?
              <div className="crf-swipes-rulers loan-ruler-day">
                <DaySwipes list={data} newRulePeriod={defaultValue} />
              </div>
              :
              <div className="crf-swipes-rulers loan-ruler-day">
                {
                  isOnlyPeriod
                    ?
                    <DaySwipes list={data} defaultPeriod={defaultValue} />
                    :
                    <DaySwipes list={data} defaultDay={formatDay} />
                }
              </div>
          }
        </div>
      </section>
    )
  }
}
