import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { hashHistory } from 'react-router';

import '../../utils/common/monoevent';

export default class DaySwipes extends Component {
  constructor(props) {
    super(props);
    //console.log(props, 'day swipes props');
    this.state = {
      rulerWidth: 9,
      list: props.list,
      defaultDay: props.defaultDay || 0,
      defaultPeriod: props.defaultPeriod || 0,
      newRulePeriod: props.newRulePeriod || 0,
    };
    this.el = {
      halfClientWidth: parseFloat(document.documentElement.clientWidth / 2),
      halfRulerWidth: this.state.rulerWidth / 2,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultDay) {
      //console.log(nextProps, 'day swipes day');
      this.setState({ list: nextProps.list, defaultDay: nextProps.defaultDay });
    } else if (nextProps.defaultPeriod) {
      //console.log(nextProps, 'day swipes period');
      this.setState({ list: nextProps.list, defaultPeriod: nextProps.defaultValue });
    } else if (nextProps.newRulePeriod) {
      this.setState({ list: nextProps.list, newRulePeriod: nextProps.newRulePeriod });
    }
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
      const isNewRule = CONFIGS.currentAmount && this.isNewRule(CONFIGS.currentAmount / 100 - 1);

      if (refDayText.indexOf('期') > -1) {
        const isPeriod = this.isOnlyPeriod(CONFIGS.currentAmount / 100 - 1);
        if (isNewRule) {
          //console.log(this.state.list.length, '-------this.state.list.length');
          currentDay = this.state.list.length;
        } else if (this.props.defaultPeriod || isPeriod) {
          currentDay = this.state.list.length;
        } else {
          currentDay = parseFloat(refDayText) - 1 + CONFIGS.defaultNumberDays;//*60Select*
        }
      } else {
        if (isNewRule) {
          currentDay = this.state.list.length;
        } else {
          currentDay = parseFloat(refDayText);
        }
      }
      //console.log(parseFloat(screenHalf) - (currentDay * this.state.rulerWidth), '----------');
      defaultLeft = parseFloat(screenHalf) - (currentDay * this.state.rulerWidth);

      if (parseInt(refDaySwipes.style.left) !== defaultLeft) {
        refDaySwipes.style.left = defaultLeft + 'px';
      }
    },0);
  }

  async getInitDataFetch(defaultData) {
    let { defaultDay, remainLimit } = defaultData;
    CONFIGS.loanData.sendSwitch = false;

    //console.log(CONFIGS.loanData.period, defaultDay, remainLimit, 'fetch');
    let periodUnit;
    let periodDay;

    if (CONFIGS.loanData.period > 1 && defaultDay > CONFIGS.defaultNumberDays) {//*60Select*
      periodUnit = 'M';
      periodDay = CONFIGS.loanData.period;
      defaultDay = CONFIGS.loanData.period * 30;
    } else {
      periodUnit = 'D';
      periodDay = defaultDay;
    }

    CONFIGS.loanData.amount = remainLimit * 100;//分为单位
    CONFIGS.loanData.day = defaultDay;

    //console.log(periodDay, '期数');

    const params = {
      productNo: CONFIGS.productNo,//未动态传入
      loanAmount: remainLimit,
      loanPeriod: periodDay,
      //startTime: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,
      periodUnit: periodUnit,//D是短期，M是分期
      kissoId: CONFIGS.ssoId,
    };

    let loanPath = `${CONFIGS.productPath}/loanClause?productNo=${params.productNo}&loanAmount=${params.loanAmount}&loanPeriod=${params.loanPeriod}&periodUnit=${params.periodUnit}&kissoId=${params.kissoId}`;
    //&startTime=${params.startTime}
    try {
      let loanFetchPromise = CRFFetch.Get(loanPath);

      // 获取数据
      let loanResult = await loanFetchPromise;

      CONFIGS.loanData.sendSwitch = true;
      PubSub.publish('loading:hide');

      if (loanResult && !loanResult.response) {
        //loanResult = {"code":"1004","message":"用户无权限使用借款产品"};
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

    if (document.querySelectorAll('.day-swipes div').length === 1) {
      return;
    }
    let leftMax = this.el.halfClientWidth - this.el.halfRulerWidth;
    let totalWidth = parseFloat(refDaySwipes.style.width);
    let halfRefDaySwipes = totalWidth - this.el.halfClientWidth - this.el.halfRulerWidth;

    if (swipeLeft <= -halfRefDaySwipes) {
      swipeLeft = -halfRefDaySwipes;
    }
    if (swipeLeft > leftMax) {
      swipeLeft = leftMax;
    }

    let { dayIndex } = this.getCurrentDay(refDaySwipes, totalWidth);

    const currentData = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount / 100 - 1];
    if (CONFIGS.currentAmount && this.isNewRule(CONFIGS.currentAmount / 100 - 1)) {
      //console.log(dayIndex, this.state.list, '------');
      this.setDateText(refDay, this.state.list[dayIndex - 1], false, true);
    } else if (this.isOnlyPeriod(CONFIGS.currentAmount / 100 - 1)) {
      this.setDateText(refDay, currentData.periodArray[dayIndex - 1], true);
    } else {
      this.setDateText(refDay, dayIndex);
    }

    refDaySwipes.style.left = swipeLeft + 'px';
  }

  setTouchEnd() {
    const refDaySwipes = this.refs.refDaySwipes;
    const totalWidth = parseFloat(refDaySwipes.style.width);
    const firstDayDom = document.querySelector('.first-day');

    if (document.querySelectorAll('.day-swipes div').length === 1) {
      return;
    }

    let { dayIndex, dayLeft } = this.getCurrentDay(refDaySwipes, totalWidth);

    CONFIGS.loanData.dragDay = dayIndex;

    let maxDay = this.returnMaxDay(CONFIGS.currentAmount);
    //console.log(dayIndex, maxDay);
    if (dayIndex > maxDay) {
      dayIndex = maxDay;
    }

    CONFIGS.loanData.touchEndDay = dayIndex;
    CONFIGS.loanData.day = dayIndex;
    //console.log(dayIndex);

    let resultObj;
    const currentData = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount / 100 - 1];
    if (CONFIGS.currentAmount && this.isNewRule(CONFIGS.currentAmount / 100 - 1)) {
      //console.log('new rule');
      const isFirst = currentData['periodArray'][0] === currentData['periodArray'][dayIndex - 1];
      firstDayDom && this.setFirstSwipeText(firstDayDom, this.state.list[0], true, isFirst, true);
      //console.log([this.state.list[dayIndex - 1]], dayIndex, '------------rule');
      this.setRefDay(dayIndex, [this.state.list[dayIndex - 1]], false, false, true);
      resultObj = {
        remainLimit: CONFIGS.currentAmount,
        defaultDay: this.state.list[dayIndex - 1] === 60 ? 60 : CONFIGS.loanData.period * 30,
      };
      CONFIGS.loanData.day = CONFIGS.loanData.period * 30;
    } else if (this.isOnlyPeriod(CONFIGS.currentAmount / 100 - 1)) {
      //console.log('only period');
      const isFirst = currentData['periodArray'][0] === currentData['periodArray'][dayIndex - 1];
      firstDayDom && this.setFirstSwipeText(firstDayDom, currentData['periodArray'][0], true, isFirst);
      //console.log([currentData['periodArray'][dayIndex - 1]], dayIndex, '------------period');
      this.setRefDay(dayIndex, [currentData['periodArray'][dayIndex - 1]], false, true);
      resultObj = {
        remainLimit: CONFIGS.currentAmount,
        defaultDay: CONFIGS.loanData.period * 30,
      };
      CONFIGS.loanData.day = CONFIGS.loanData.period * 30;
    } else {
      this.setFirstSwipeText(firstDayDom, dayIndex);
      this.setRefDay(dayIndex);
      resultObj = {
        remainLimit: CONFIGS.currentAmount,
        defaultDay: dayIndex,
      };
    }

    refDaySwipes.style.left = dayLeft + 'px';

    //console.log(CONFIGS.loanData.day, CONFIGS.loanData.period, 'end');
    this.getInitDataFetch(resultObj);
  }

  isOnlyPeriod(index) {
    const data = CONFIGS.loanPeriod['productions'][index];
    return data['periodArray'] && !data.dayArray;
  }

  isNewRule(index) {
    const data = CONFIGS.loanPeriod['productions'][index];
    return data['dayArray'] && this.isOnly_DayArray(data.dayArray[0]);//data.dayArray[0] === 60;
  }

  setFirstSwipeText(firstDayDom, dayIndex, isPeriod, isFirst, isNewRule) {

    //console.log(dayIndex, isFirst, '------------------');
    if (dayIndex === 1 || isFirst) {
      firstDayDom.innerHTML = '';
    } else if (isNewRule) {
      if (dayIndex === 60) {
        firstDayDom.innerHTML = `${dayIndex}天`;
      } else {
        //console.log('new rule false 77777777777777777');
        firstDayDom.innerHTML = `${dayIndex}期`;
      }
    } else if (isPeriod) {
      //console.log('is period false 88888888888888888');
      firstDayDom.innerHTML = `${dayIndex}期`;
    } else {
      firstDayDom.innerHTML = '1天';
    }
  }

  setDateText(refDay, dayIndex, isPeriod, isNewRule) {
    let resultDay;

    if (isNewRule) {
      if (this.isOnly_DayArray(dayIndex)) { // dayIndex === 60
        resultDay = `${dayIndex}天`;
      } else {
        resultDay = `${dayIndex}期`;
      }
    } else if (isPeriod) {
      //console.log('is period ------ 99999999999999', dayIndex);
      resultDay = `${dayIndex}期`;
    } else if (dayIndex <= CONFIGS.defaultNumberDays) {//*60Select*
      resultDay = `${dayIndex}天`;
    } else {
      //console.log('is period ------ 10101010101010101010', dayIndex);
      resultDay = `${dayIndex - CONFIGS.defaultNumberDays + 1}期`;//*60Select*
    }

    refDay.innerHTML = resultDay;
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

    let resetDay = this.returnMaxDay(val);//resetDay是根据规则返回的最大日期期限 14 30 31 32 or 60 90 120
    let dayLimit = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount / 100 - 1].dayArray || [];//length 14 | 30
    let periodArray = CONFIGS.loanPeriod.productions[CONFIGS.currentAmount / 100 - 1].periodArray;

    //console.log(resetDay, dayLimit, periodArray, 'set list data');
    let defaultDay;
    let resetDefault = false;

    if (dayLimit.length > CONFIGS.loanData.touchEndDay) {
      defaultDay = CONFIGS.loanData.touchEndDay;
      resetDefault = true;
    } else {
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
    }

    let isOnlyPeriod = periodArray && dayLimit.length == 0;
    let isNewRule = this.isOnly_DayArray(dayLimit[0]);

    if (isNewRule) {
      defaultDay = resetDay;//1  期=null 60
      resetDefault = true;
    } else if (isOnlyPeriod) {//isOnlyPeriod
      //dayLimit = periodArray;
      defaultDay = resetDay;
      // CONFIGS.loanData.touchEndDay = resetDay;
      resetDefault = true;
    } else if (Common.isType('Array')(periodArray) && periodArray.length > 0) {
      let maxArray = [];
      let maxCount = Common.getArrMaxValue(periodArray) - 1 + CONFIGS.defaultNumberDays;//*60Select*
      for (let i = 0; i < maxCount; i++) {
        maxArray.push(i);
      }
      dayLimit = maxArray;
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
      resetDefault = true;
    } else {
      let maxArray = [];
      for (let i = 0; i < resetDay; i++) {
        maxArray.push(i);
      }
      dayLimit = maxArray;
      defaultDay = resetDay;
      CONFIGS.loanData.touchEndDay = resetDay;
      resetDefault = true;
    }

    let resultObj = {
      defaultDay: defaultDay,//14 30 31 32 or 60 90
      remainLimit: val,//100-无穷
    };

    let endDay;
    const firstDay = document.querySelector('.first-day');
    if (isNewRule) {
      let resultArr;
      //console.log(val, dayLimit, periodArray,'zhaodaoleleleleleleleleleel');
      if (periodArray) {
        resultArr = dayLimit.concat(periodArray)
      } else {
        resultArr = dayLimit
      }
      //console.log(arr, '*********************');
      this.setState({
        list: resultArr,//[60,2,3,4] [60,3,4], [60], [14]
        defaultPeriod: defaultDay,
      });
      endDay = defaultDay;

      this.setRefDay(endDay, resultArr, resetDay, false, true);

      if (firstDay && firstDay.innerHTML === '') {
        let firstDayStr = '';
        if (this.isOnly_DayArray(resultArr[0])) { // resultArr[0] === 60
          firstDayStr = `${resultArr[0]}天`;
        } else {
          firstDayStr = `${resultArr[0]}期`;
        }
        firstDay.innerHTML = firstDayStr;
      }
    } else if (isOnlyPeriod) {//isOnlyPeriod
      this.setState({
        list: periodArray,//[2,3,4]
        defaultPeriod: defaultDay,
      });
      endDay = defaultDay;
      this.setRefDay(endDay, periodArray, resetDay, true);

      if (firstDay && firstDay.innerHTML === '') {
        firstDay.innerHTML = `${periodArray[0]}期`;
      }
    } else {
      this.setState({
        list: dayLimit,//arr是计算出来的日期数组,dayArray是接口返回的日期数组
        defaultDay: defaultDay,
      });
      endDay = this.returnEndDay(val, dayLimit, resetDefault, defaultDay);
      this.setRefDay(endDay, dayLimit, resetDay);

      if (firstDay && firstDay.innerHTML === '' && dayLimit) {
        firstDay.innerHTML = '1天';
      }
    }

    this.getInitDataFetch(resultObj);
  }

  returnEndDay(val, dayLimit, resetDefault, defaultDay) {//1200 [2,3,4] true 120
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

  returnMaxDay(amount) {
    let maxDay;
    let productData = CONFIGS.loanPeriod.productions[amount / 100 - 1];

    if (productData.periodArray === null) {
      if (productData.dayArray === null) {
        //默认显示30天，天数不能拖动，  显示错误信息，不能提交
        maxDay = 30;
      } else {
        //一般情况，只有1期，拖动dayArray的天数
        if (this.isOnly_DayArray(productData.dayArray[0])) {
          maxDay = productData.dayArray[0];
        } else {
          maxDay = productData.dayArray.length;
        }
        CONFIGS.loanData.period = 1;
      }
    } else {
      CONFIGS.loanData.period = Common.getArrMaxValue(productData.periodArray);//Math.max.apply(Math, productData.periodArray);
      if (productData.dayArray === null) {
        maxDay = CONFIGS.loanData.period * 30;
      } else if (this.isOnly_DayArray(productData.dayArray[0])) {//newRule
        //maxDay = productData.periodArray.length + 1;
        maxDay = CONFIGS.loanData.period * 30;
      } else {
        maxDay = CONFIGS.loanData.period - 1 + CONFIGS.defaultNumberDays;//*60Select*  为了方便渲染格子，2期为61天，3期62天
      }
    }
    return maxDay;
  }

  setRefDay(day, dayArray, defaultDay, isPeriod, isNewRule) {
    const refDay = document.querySelector('.ref-day');

    //newRule
    if (isNewRule) {
      let period = dayArray[dayArray.length - 1];//[60, 2, 3]这种情况取最大期数
      if (Common.isOnlyDay(dayArray)) {//period === 60
        refDay.innerHTML = `${period}天`;
        CONFIGS.loanData.period = 1;
        CONFIGS.loanData.day = period;
      } else {
        //console.log(`set ref day new rul period 222222222222222`, period);
        refDay.innerHTML = `${period}期`;
        CONFIGS.loanData.period = period;
      }
      //console.log(refDay.innerHTML+'99999999999999999999999');
      return;
    }

    //isOnlyPeriod
    if (isPeriod) {
      let period = Common.getArrMaxValue(dayArray);
      refDay.innerHTML = `${period}期`;
      CONFIGS.loanData.period = period;
      return;
    }

    if (day > CONFIGS.defaultNumberDays) {//*60Select*
      let period = day - CONFIGS.defaultNumberDays + 1;
      refDay.innerHTML = `${period}期`;
      CONFIGS.loanData.period = period;
    } else {
      CONFIGS.loanData.period = 1;//bug
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
    //console.log(defaultLeft);
    return { totalWidth, defaultLeft };
  }

  isOnly_DayArray(item) {
    for (let i = 0, len = CONFIGS.onlyDayArray.length; i < len; i++) {
      if (item === CONFIGS.onlyDayArray[i]) {
        return true;
      }
    }
    return false;
  }

  dayRuler(item, index) {
    const isPeriod = CONFIGS.currentAmount && this.isOnlyPeriod(CONFIGS.currentAmount / 100 - 1);
    const isNewRule = CONFIGS.currentAmount && this.isNewRule(CONFIGS.currentAmount / 100 - 1);

    if (isNewRule) {
      //console.log(this.state.list, this.state.list.length, '*********/////////////');
      if (this.state.list.length === 1) {
        return (
          <div key={index} className="crf-ruler"></div>
        );
      } else if (this.state.list.length > 1 && index === 0) {
        return (
          <div key={index} className="crf-ruler">
          <span className="first-day">
            {
              this.isOnly_DayArray(item)
                ?
                `${item}天`
                :
                `${item}期`
            }
          </span>
            <span className="under-line">line</span>
          </div>
        );
      } else {
        return (
          <div key={index} className="crf-ruler"></div>
        );
      }
    }

    if (isPeriod && CONFIGS.loanPeriod['productions'][CONFIGS.currentAmount / 100 - 1]['periodArray'].length === 1) {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    } else if (index === 0) {
      return (
        <div key={index} className="crf-ruler">
          <span className="first-day">
            {
              this.props.defaultPeriod || isPeriod
                ?
                `${item}期`
                :
                `${index+1}天`
            }
          </span>
          <span className="under-line">line</span>
        </div>
      );
    } else {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    }
  }

  render() {
    const { list, defaultDay, rulerWidth, defaultPeriod } = this.state;
    //console.log(list, 'list day swipes');
    let isNewRule = CONFIGS.currentAmount && this.isNewRule(CONFIGS.currentAmount / 100 - 1);
    let defaultValue = (defaultPeriod || isNewRule) ? list.length : defaultDay;
    let { totalWidth, defaultLeft } = this.setRulerSize(list, defaultValue, rulerWidth);

    let daySwipesStyle = {
      width: totalWidth,
      height: '100%',
      left: defaultLeft,
    };

    return (
      <div className="day-swipes" style={daySwipesStyle} ref="refDaySwipes">
        {list && (list.length > 0) && list.map(this.dayRuler.bind(this))}
      </div>
    )
  }
}
