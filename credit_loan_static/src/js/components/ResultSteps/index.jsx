import React, { Component } from 'react';
import {Steps} from 'antd-mobile';
import {Phone} from 'app/components';
import Numeral from 'numeral';
const Step = Steps.Step;

export default class Result extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      status: props.data.status,
      dataList: props.data.dataList,
      loanClassName: props.loanClassName,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  render() {
    const {status, dataList, loanClassName} = this.state;

    const step = (item, index) => {
      let styleName = '';
      if (index === (dataList.length - 1) && status === 2) {
        styleName = 'finish';
      } else if (index === (dataList.length - 1) && status === 1) {
        styleName = 'error';
      }
      return (
        <Step key={index} className={styleName} title={item.trace_content} description={item.trace_time} />
      )
    };
    const realSteps = (
      <Steps current={dataList.length - 1} className={loanClassName}>
        {dataList.map(step)}
      </Steps>
    );

    return (
      <div>
        {realSteps}
      </div>
    )
  }
}
