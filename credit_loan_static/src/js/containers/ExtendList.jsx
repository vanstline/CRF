import React, { Component } from 'react';
import { Nav, ExtendList } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class List extends Component {
  constructor(props, context) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
  }

  componentDidMount() {
    if (CONFIGS.extendData && CONFIGS.extendData.length === 0) {
      let path = 'extend';
      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.userId
        }
      });
    }
  }

  render() {
    let props = {title: '借款单号', stage: 'extendlist', extend: true};
    return (
      <section className="full-wrap">
        <Nav data={props} />
        <ExtendList />
      </section>
    )
  }
}

export default List;
