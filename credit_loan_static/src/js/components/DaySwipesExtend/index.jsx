import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { hashHistory } from 'react-router';
import '../../utils/common/monoevent';

export default class DaySwipes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rulerWidth: 9,
      list: props.list,
      defaultDay: props.defaultDay,
    };
    this.el = {
      halfClientWidth: parseFloat(document.documentElement.clientWidth / 2),
      halfRulerWidth: this.state.rulerWidth / 2,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ list: nextProps.list, defaultDay: nextProps.defaultDay });
  }

  componentDidMount() {
    this.bindEvent();

    this.pubsub_token = PubSub.subscribe('daySwipes:day', (topic, val) => {
      this.setListData(val);
    });
  }

  componentWillUnmount() {
    this.removeEvent();

    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  componentDidUpdate() {
    const refDaySwipes = document.querySelector('.day-swipes');
    const screenHalf = this.el.halfClientWidth + this.el.halfRulerWidth;

    //页面更新的时候确保left的值不会超出边界
    setTimeout(() => {
      const refDayText = document.querySelector('.ref-day').innerText;

      let currentDay = parseFloat(refDayText);
      let defaultLeft;

      if (refDayText.indexOf('期') > -1) {
        currentDay = parseFloat(refDayText) - 1 + 30;
      } else {
        currentDay = parseFloat(refDayText);
      }

      defaultLeft = parseFloat(screenHalf) - (currentDay * this.state.rulerWidth);

      if (parseInt(refDaySwipes.style.left) !== defaultLeft) {
        refDaySwipes.style.left = defaultLeft + 'px';
      }
    },0);
  }

  async getInitDataFetch(defaultData) {

    PubSub.publish('loading:show');
    let { defaultDay, remainLimit } = defaultData;
    CONFIGS.loanData.sendSwitch = false;

    let d = new Date();

    let periodUnit;
    let periodDay;

    if (CONFIGS.loanData.period > 1 && defaultDay > 30) {
      periodUnit = 'M';
      periodDay = CONFIGS.loanData.period;
      defaultDay = CONFIGS.loanData.period * 30;
    } else {
      periodUnit = 'D';
      periodDay = defaultDay;
    }

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    const params = {
      productNo: CONFIGS.productNo,//未动态传入
      loanAmount: remainLimit,
      loanPeriod: periodDay,
      periodUnit: periodUnit,//D是短期，M是分期
      processType: 2
    };

    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}
                    &loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&periodUnit=${params.periodUnit}&processType=${params.processType}&kissoId=${CONFIGS.userId}`;
    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);

      // 获取数据
      let loanResult = await loanFetchPromise;

      CONFIGS.loanData.sendSwitch = true;

      if (loanResult && !loanResult.response) {
        _paq.push(['trackEvent', 'C_APP_Extension_Time', 'E_P_Extension_Time_Choice', '用户进行了滑动选择的操作']);
        PubSub.publish('loading:hide');
        PubSub.publish('loanDetail:list', loanResult.detailList.LoanPlan);
      }

    } catch (error) {
      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            PubSub.publish('loanDetail:list', data.message);
          });
        }
      });

    }
  }

  removeEvent() {
    const ne = MonoEvent;
    const refDaySwipes = ne('.loan-ruler-day');
    const touchDoc = ne(document);
    refDaySwipes.un('touchstart');
    touchDoc.un('touchmove');
    touchDoc.un('touchend');
  }

  bindEvent() {
    const ne = MonoEvent;
    const refWrap = ne('.loan-ruler-day');
    const touchDoc = ne(document);
    const dayEl = document.querySelector('.day-swipes');

    refWrap.on('touchstart', (e) => {
      if (!this.state.list || this.state.list.length <= 0) {
        this.removeEvent();
        return;
      }

      let touch = e.touches[0];
      let disX = touch.pageX - dayEl.offsetLeft;

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
    let refDaySwipes = document.querySelector('.day-swipes');
    let refDay = document.querySelector('.ref-day');

    let leftMax = this.el.halfClientWidth - this.el.halfRulerWidth;
    let totalWidth = parseFloat(refDaySwipes.style.width);
    let halfRefDaySwipes = totalWidth - this.el.halfClientWidth - this.el.halfRulerWidth;

    if (swipeLeft <= -halfRefDaySwipes) {
      swipeLeft = -halfRefDaySwipes;
    }
    if (swipeLeft > leftMax) {
      swipeLeft = leftMax;
    }

    let {dayIndex} = this.getCurrentDay(refDaySwipes, totalWidth);

    let resultDay;
    if (dayIndex <= 30) {
      resultDay = `${dayIndex}天`;
    } else {
      resultDay = `${dayIndex - 30 + 1}期`;
    }

    refDay.innerHTML = resultDay;
    refDaySwipes.style.left = swipeLeft + 'px';
  }

  setTouchEnd() {
    const refDaySwipes = this.refs.refDaySwipes;
    const totalWidth = parseFloat(refDaySwipes.style.width);
    const firstDayDom = document.querySelector('.first-day');

    let { dayIndex, dayLeft } = this.getCurrentDay(refDaySwipes, totalWidth);

    CONFIGS.loanData.dragDay = dayIndex;

    CONFIGS.loanData.touchEndDay = dayIndex;

    if (dayIndex === 1) {
      firstDayDom.innerHTML = '';
    } else {
      firstDayDom.innerHTML = '1天';
    }

    refDaySwipes.style.left = dayLeft + 'px';
    this.setRefDay(dayIndex);

    let resultObj = {
      remainLimit: CONFIGS.currentAmount,
      defaultDay: dayIndex,
    };

    this.getInitDataFetch(resultObj);
  }

  getCurrentDay(refDaySwipes) {
    const { rulerWidth } = this.state;
    const total = this.el.halfClientWidth - this.el.halfRulerWidth;

    let dragLeft = parseFloat(refDaySwipes.style.left);
    let dayIndex = Math.round((total - dragLeft) / rulerWidth + 1);
    let dayLeft = total - (dayIndex - 1) * rulerWidth;

    return {
      dayIndex,
      dayLeft,
    };
  }

  setListData(val) {//val是最后拖动金额

    let resetDay = this.returnMaxDay(val);//resetDay是根据规则返回的最大日期期限 14 30 31 32
    let dayLimit = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount / 100 - 1].dayArray || [];//length 14 | 30
    let periodArray = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount / 100 - 1].periodArray;

    let defaultDay;
    let resetDefault = false;

    if (dayLimit.length > CONFIGS.loanData.touchEndDay) {
      defaultDay = CONFIGS.loanData.touchEndDay;
      resetDefault = true;
    } else {
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
    }

    if (Common.isType('Array')(periodArray) && periodArray.length > 0) {
      let maxArray = [];
      let maxCount = Math.max.apply(Math, periodArray) - 1 + 30;
      for (let i = 0; i < maxCount; i++) {
        maxArray.push(i);
      }
      dayLimit = maxArray;
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
      resetDefault = true;
    }

    let resultObj = {
      defaultDay: defaultDay,//14 30 31 32
      remainLimit: val,//100-无穷
    };
    this.setState({
      list: dayLimit,//arr是计算出来的日期数组,dayArray是接口返回的日期数组
      defaultDay: defaultDay,
    });

    let endDay = this.returnEndDay(val, dayLimit, resetDefault, defaultDay);

    this.setRefDay(endDay, dayLimit, resetDay);

    this.getInitDataFetch(resultObj);
  }

  returnEndDay(val, dayLimit, resetDefault, defaultDay) {
    /*
     * 当滑动借款金额 由大变小
     最大期限没变，当前期限也不变。
     变了则变成最大金额
     当滑动借款金额 由小变大
     期限不变，不管最大期限是否有变
     * */
    let endDay;
    if (val > CONFIGS.loanData.amount) {//由小变大
      endDay = '';
    } else {//由大变小；或者相等，不变

      if (dayLimit.length < CONFIGS.loanData.dragDay || CONFIGS.loanData.dayArrayLength > dayLimit.length) { //以前大于现在
        //金额对应最大期限，当前期限
        endDay = dayLimit.length;
        CONFIGS.loanData.dayArrayLength = dayLimit.length;

        //当CONFIGS.loanData.dragDay大于dayArray的时候
        CONFIGS.loanData.dragDay = dayLimit.length;
      } else {
        if (resetDefault) {
          endDay = defaultDay;
        } else {
          endDay = CONFIGS.loanData.dragDay;
        }
      }

    }

    return endDay;
  }

  setRefDay(day, dayArray, defaultDay) {
    const refDay = document.querySelector('.ref-day');

    if (day > 30) {
      let period = day - 30 + 1;
      refDay.innerHTML = `${period}期`;
      CONFIGS.loanData.period = period;
    } else {
      if (day) {
        refDay.innerHTML = `${day}天`;
      } else {
        //设置swipe的left的距离,  当只有2、3期的时候
        this.setState({
          list: dayArray,
          defaultDay: defaultDay,
        });
      }
    }

  }

  setRulerSize(list, defaultDay, rulerWidth) {
    if (!list) list = [];
    let totalWidth = list.length * rulerWidth;
    let defaultWidth = defaultDay * rulerWidth - rulerWidth / 2;
    let defaultLeft = this.el.halfClientWidth - defaultWidth;

    return { totalWidth, defaultLeft };
  }

  dayRuler(item, index) {
    if (index === 0) {
      return (
        <div key={index} className="crf-ruler"><span className="first-day">{index+1}天</span><span className="under-line"></span></div>
      );
    } else {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    }
  }

  render() {
    const {list, defaultDay, rulerWidth} = this.state;

    let {totalWidth, defaultLeft} = this.setRulerSize(list, defaultDay, rulerWidth);
    let daySwipesStyle = {
      width: totalWidth,
      height: '100%',
      left: defaultLeft,
    };

    return (
      <div className="day-swipes" style={daySwipesStyle} ref="refDaySwipes">
        {list && (list.length > 0) && list.map(this.dayRuler)}
      </div>
    )
  }
}
