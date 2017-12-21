import React, { Component } from 'react';
import { Toast, WhiteSpace, List, Popover } from 'antd-mobile';
import {Phone} from 'app/components';
import { hashHistory } from 'react-router';
import styles from './index.scss';

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isShow: false,
      content: '1) 会员期内有效借款次数满8笔  2) 会员期间借款无逾期记录',
      memberData: props.memberList,
      // assType: props.assType,
      explanationData: ['会员开通后, 一年内可享受优先放款资格', '白金会员和钻石会员在会员期内免收借款手续费'],
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.memberList.length > 0) {
      this.setState({ memberData: nextProps.memberList, isShow: true });
    }
  }

  componentDidMount() {
    this.setTooltip();
  }

  setTooltip() {
    document.body.classList.add('tooltip-fee');
  }

  handleVisibleChange = (visible) => {
    setTimeout(() => {
      this.setState({
        visible,
      });
      this.setPopoverPosition();
    }, 300);
  };

  setPopoverPosition() {
    let ele = document.querySelector('.am-popover');
    ele.style.left = '50%';
    ele.style.top = (ele.offsetTop + 4) + 'px';
    let arrow = document.querySelector('.am-popover-arrow');
    let currentPoint = document.querySelector('.member-fee .back');
    let mainContainerLeft = ele.clientWidth;
    let screenWidth = document.body.clientWidth;
    let offsetLeft = currentPoint.offsetLeft - (screenWidth - mainContainerLeft) / 2 + 1;
    arrow.style.left = offsetLeft + 'px';
    arrow.style.top = '-4px';
  }

  handleClick(money, index) {
    let path = 'annualfeeconfirm';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId,
        realAmount: money,
        // assType: this.state.assType,
        memberIndex: index,
      }
    });
  }

  memberList(item, index) {
    return (
      <li key={index} className={`member-li ${item.className}`}>
        <div className="member-title">{item.title}</div>
        <div className="member-body">
          <div className="member-fee">
            <p className="member-price"><span className="color-232323">¥</span> <strong>{item.money}</strong> / 年</p>
            { item.className === 'member-1' && <p>黄金会员购买后不支持退款</p> }
            { item.className === 'member-2' && <p>白金会员购买后不支持退款</p> }
            { item.className === 'member-3' && <p>钻石会员达成特定条件可全额<Popover visible={this.state.visible} overlay={this.state.content} onVisibleChange={this.handleVisibleChange}><span className="back">退还会费</span></Popover></p> }
          </div>
          <div className="member-button">
            <button onClick={this.handleClick.bind(this, item.money, index)}>开通</button>
          </div>
        </div>
      </li>
    );
  }

  explanationList(item, index) {
    return (
      <li key={index} className="contract-li">
        {item}
      </li>
    );
  }

  render() {
    let { memberData, explanationData, isShow } = this.state;

    return (
      <section className="fee-member">
        <div className="fee-member-wrap">
          <ul>
            {
              memberData && memberData.map(this.memberList.bind(this))
            }
          </ul>
        </div>
        {
          isShow && (<div className="member-description">
            <div className="member-description-title">会员使用说明</div>
            <ul>
              {
                explanationData && explanationData.map(this.explanationList)
              }
            </ul>
          </div>)
        }
      </section>
    )
  }
}
