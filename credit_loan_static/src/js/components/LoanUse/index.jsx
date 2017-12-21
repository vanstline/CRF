import React, {Component} from 'react';
import { Toast } from 'antd-mobile';
import { LoanUseMask } from 'app/components';
class LoanUse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.list,
      isHideMask: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.list,
    });
  }

  changeSelectText(text) {
    this.refSelectText.innerHTML = text;
  }

  showSelectUse() {
    this.setState({ isHideMask: false });
  }

  render() {
    let { data, isHideMask } = this.state;
    let initUse = data[0] ? data[0]['active'] : '选择用途';
    return (<section className="crf-use-list">
      <div className="crf-period-top" onClick={this.showSelectUse.bind(this)}>
        <div className="crf-top-title">借款用途</div>
        <div className="crf-top-select">
          <span className="crf-select-text" ref={(span) => this.refSelectText = span}>{initUse}</span>
          <span className="period-arrow">arrow</span>
        </div>
      </div>
      <LoanUseMask list={data} isHideMask={isHideMask} changeText={this.changeSelectText.bind(this)} />
    </section>);
  }
}

export default LoanUse;