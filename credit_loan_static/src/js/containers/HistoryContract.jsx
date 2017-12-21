import React, { Component } from 'react';
import { Link } from 'react-router';
import { Nav } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';

export default class Rebind extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bankJson: null,
      data: [1,2,3],
      list: [1,2,3],
    };
    //this.renderContract = this.renderContract.bind(this);
  }

  componentDidMount() {
    console.log('history contract');
  }

  renderData(item, index) {
    return (
      <li key={index} className="contract-li"><span>{item}合同名字</span></li>
    );
  }

  renderList(item, index) {
    return (
      <li key={index} className="contract-li"><span>{item}合同名字</span></li>
    );
  }

  render() {
    let { data, list } = this.state;
    let props = { title: '查看合同', stage: 'historycontract' };

    return (
      <section>
        <Nav data={props} />
        <WhiteSpace />
        <div className="history-contract-wrap">
          <ul>
            {
              data && data.map(this.renderData)
            }
          </ul>
        </div>
        <div className="history-contract-list">
          <div className="toggle-contract-list">点击收起历史合同</div>
          <div className="contract-list">
            <ul>
              {
                list && list.map(this.renderList)
              }
            </ul>
          </div>
        </div>
      </section>
    )
  }
}
