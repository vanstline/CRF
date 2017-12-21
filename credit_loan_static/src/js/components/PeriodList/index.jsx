import React, { Component } from 'react';
import { DayPeriodList } from 'app/components';
import { WhiteSpace, Toast } from 'antd-mobile';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';

export default class PeriodList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      day: 0,
      defaultDay: 0,
      data: [],
      rulerWidth: 9,
    };
  }

  componentDidMount() {
    this.setPubSub();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.list.periodArray,
      defaultDay: nextProps.list.loanAmount,
    });
  }

  /*componentDidUpdate() {
    this.resetContainer();//
  }*/

  componentWillUnmount() {
    PubSub.unsubscribe(this.pubsub_token);
    PubSub.unsubscribe(this.pubsub_token_hiddenPeriod);
    PubSub.unsubscribe(this.pubsub_token_forbidDisabled);
    PubSub.unsubscribe(this.pubsub_token_forbidHidden);
    PubSub.unsubscribe(this.pubsub_token_periodMainList);
  }

  setPubSub() {
    this.pubsub_token = PubSub.subscribe('periodMain:toggle', (topic, val) => {
      this.handleSelectPeriod(val);
    });
    this.pubsub_token_hiddenPeriod = PubSub.subscribe('periodMain:hidden', (topic, val) => {
      this.hiddenPeriod();
    });
    this.pubsub_token_forbidDisabled = PubSub.subscribe('periodTop:disabled', (topic, val) => {
      this.refPeriodTop.classList.add('disabled');
    });
    this.pubsub_token_forbidHidden = PubSub.subscribe('periodTop:hidden', (topic, val) => {
      this.refPeriodTop.classList.remove('disabled');
    });
    this.pubsub_token_periodMainList = PubSub.subscribe('periodMainList:hide', (topic, val) => {
      this.hiddenPeriodList(val);
    });
  }

  handleSelectPeriod(text) {
    if (!this.refPeriodTop.classList.contains('disabled')) {
      this.refPeriodArrow.classList.toggle('period-arrow-down');
      this.refPeriodMain.classList.toggle('hideList');
      if (Common.isType('String')(text)) {
        this.refSelectText.innerHTML = text;
        this.refSelectText.classList.add('selected');
      }
    }
  }

  hiddenPeriod() {
    this.refSelectText.innerHTML = '请选择';
    this.refSelectText.classList.remove('selected');
    this.refPeriodArrow.classList.add('period-arrow-down');
    this.refPeriodMain.classList.add('hideList');
  }

  hiddenPeriodList() {
    this.refPeriodArrow.classList.add('period-arrow-down');
    this.refPeriodMain.classList.add('hideList');
  }

  /*resetContainer() {
    CONFIGS.currentDay = this.state.defaultDay;
    CONFIGS.realDay = CONFIGS.currentDay;
  }*/

  render() {
    const { day, data } = this.state;

    return (
      <section className="crf-period-list">
        <div className="crf-period-top" ref={(div) => this.refPeriodTop = div} onClick={this.handleSelectPeriod.bind(this)}>
          <div className="crf-top-title">借款期限</div>
          <div className="crf-top-select">
            <span className="crf-select-text" ref={(span) => this.refSelectText = span}>请选择</span>
            <span className="period-arrow period-arrow-down" ref={(span) => this.refPeriodArrow = span}>arrow</span>
          </div>
        </div>
        <div className="crf-period-main hideList" ref={(div) => this.refPeriodMain = div}>
          <DayPeriodList list={data} />
        </div>
      </section>
    )
  }
}
