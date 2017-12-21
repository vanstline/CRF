import React, { Component } from 'react';
import { hashHistory } from 'react-router';

import { Nav } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

export default class Rebind extends Component {
  constructor(props){
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
  }
  componentDidMount(){
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_Fail']);
    //console.log(Common.isWeChat());
    // if(Common.isWeChat()){
    //   Common.customPopState(this.popUrlFn);
    //   CONFIGS.bindCard.status=false;
    // }
  }
  componentWillUnmount(){
    // if(Common.isWeChat()){
    //   window.removeEventListener('popstate',this.popUrlFn);
    // }
  }
  popUrlFn(refUrl) {
    location.href = refUrl;
  }
  handleClick(){
    _paq.push(['trackEvent', 'C_Fail', 'E_Fail_button', '点击重新绑定按钮']);
    hashHistory.goBack();
  }
  render() {
    let props={ title:'绑卡结果', stage: 'rebindCard'};
    let failReason = '';//暂时不展示错误原因
    /*if(this.props.location.state){
      failReason = this.props.location.state.failReason;
    }else{
      failReason = '';
    }*/


    return (
      <div className="bind-card-main sub-page-wrap">
        <Nav data={props} />
        <WhiteSpace />
        <div className="bind-card-wrap">
          <div className="bind-card-status">
              <div className="img fail"></div>
              <p>对不起,绑卡失败了</p>
              <p>请稍后再试</p>
              {failReason?<p className="fail-msg">({failReason})</p>:""}
          </div>
        </div>
        <div className="next-page">
          <button onClick={this.handleClick.bind(this)}>重新绑定</button>
        </div>
      </div>
    )
  }
}
