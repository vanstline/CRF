import React, { Component } from 'react';
import { List } from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';
const Item = List.Item;

export default class ExtendDateAmount extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      contactIndex: props.index || 0
    }
  }

  componentWillReceiveProps(nextProps) {
    //this.setState({remainLimit: nextProps.data.remainLimit, totalLimit: nextProps.data.totalLimit});
  }

  render() {
    let realAmount = '-';
    let {contactIndex} = this.state;
    if (CONFIGS.extendData[contactIndex] && CONFIGS.extendData[contactIndex].amount) {
      realAmount = `¥${Numeral(CONFIGS.extendData[contactIndex].amount).divide(100).format('0, 0.00')}`;
    }

    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <List className="crf-list crf-extend-date-detail-list">
            <Item extra={realAmount}>展期金额</Item>
          </List>
        </div>
      </div>
    )
  }
}
