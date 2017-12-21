import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BindcardForm, Loading } from 'app/components';
import { WhiteSpace } from 'antd-mobile';

class Home extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loadingShowStatus: false,
      showTopTips: props.location.hash.indexOf('loan') > -1,
    };
  }

  componentDidMount() {
    if (CONFIGS.isFromCredit) {
      CONFIGS.referrerUrl = location.href;
    }
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_BindCard']);
  }

  setLoading(status) {
    this.setState({
      loadingShowStatus: status
    });
  }

  render() {
    let props = { title: '绑定银行卡', stage: 'home' };
    return (
      <section className="bind-card-wrap">
        <article>
          <Nav data={props} />
          {this.state.showTopTips ? <div className="topTips"><span>提交申请成功, 但未绑卡, 请先绑定银行卡。</span></div> : <WhiteSpace />}
          <BindcardForm setLoading={this.setLoading.bind(this)} />
        </article>
        <Loading show={this.state.loadingShowStatus} />
      </section>
    )
  }
}
//export default Home;
export default withRouter(Home);
