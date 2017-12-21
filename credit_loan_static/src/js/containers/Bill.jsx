import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BillList, Loading } from 'app/components';//app需要隐藏  BillNotice
import { WhiteSpace, Tabs } from 'antd-mobile';
const TabPane = Tabs.TabPane;

class Bill extends Component {
  constructor(props) {
    super(props);
    let storage = window.localStorage;
    this.state = {
      title: '借还款记录',
      type: storage.getItem('billType') || 'loan'
    }
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_Bill']);
  }

  callback = (key) => {
    let storage = window.localStorage;
    if (key === '1') {
      storage.setItem('billType', 'loan');
      this.setState({
        type: 'loan'
      });
    } else {
      storage.setItem('billType', 'repay');
      this.setState({
        type: 'repay'
      });
    }
  }

  handleTabClick = (key) => {

  }

  render() {
    const props = {title: this.state.title, stage: 'bill'};
    let {type} = this.state,
        activeKey = '1',
        billListByLoan = null,
        billListByRepay = null;
        if (type === 'repay') {
          activeKey = '2';
          billListByRepay = <BillList type={type} />
        } else {
          activeKey = '1';
          billListByLoan = <BillList type={type} />
        }
    return (
      <section>
        <Loading />
        <Nav data={props} />
        <WhiteSpace />
        <Tabs defaultActiveKey={activeKey} animated={false} onChange={this.callback} onTabClick={this.handleTabClick}>
          <TabPane tab="借款" key="1">
            <WhiteSpace />
            {billListByLoan}
          </TabPane>
          <TabPane tab="还款" key="2">
            <WhiteSpace />
            {billListByRepay}
          </TabPane>
        </Tabs>
      </section>
    );
  }
}

export default withRouter(Bill);
