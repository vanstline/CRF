import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Loading } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class FeeIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      // status: props.location.query && props.location.query.assType,
    }
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    this.resetGuideHeight();
  }

  resetGuideHeight() {
    const annualGuide = document.querySelector('.annual-guide');
    const elNav = document.querySelector('nav');
    const elWhitespace = document.querySelector('.am-whitespace');
    let rootHeight = document.body.clientHeight - (elNav && elNav.clientHeight) - (elWhitespace && elWhitespace.clientHeight);
    console.log(`${elNav.clientHeight}--${elWhitespace.clientHeight}`);
    annualGuide.style.height = `${rootHeight}px`;
  }

  handleGoAnnualFee() {
    let path = 'annualfee';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId,
        //assType: this.state.status,
      }
    });
  }

  handleClick() {
    this.handleGoAnnualFee();
  }

  renderContent() {
    const imgBaseUrl = Common.getBaseUrl();
    return (<div className="annual-guide">
      <div className="guide-head">
        <img src={`${imgBaseUrl}/images/member-head.jpg`} alt=""/>
        <a className="mapArea" onClick={this.handleClick.bind(this)}>热区</a>
      </div>
      <div className="guide-body">
        <img src={`${imgBaseUrl}/images/member-body.jpg`} alt=""/>
      </div>
      <div className="guide-footer">
        <img src={`${imgBaseUrl}/images/member-footer.jpg`} alt=""/>
        <a className="mapArea" onClick={this.handleClick.bind(this)}>热区</a>
      </div>
    </div>);
  }

  render() {
    let { isLoading } = this.state;
    let props = { title: '信而富诚信俱乐部', stage: 'guide' };

    return (
      <section className="full-wrap">
        <Nav data={props} />
        <WhiteSpace />
        { this.renderContent() }
        <Loading  show={isLoading} />
      </section>
    )
  }
}

export default withRouter(FeeIndex);
