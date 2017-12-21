import React, { Component } from 'react';
import { List } from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';
const Item = List.Item;

export default class ExtendDateDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dataList: props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    //this.setState({remainLimit: nextProps.data.remainLimit, totalLimit: nextProps.data.totalLimit});
  }

  render() {
    let item = null;
    let {dataList} = this.state;

    const content = (index) => {
      let currentValue = `¥${Numeral(dataList[index]).divide(100).format('0, 0.00')}`;
      return (
        <Item extra={currentValue}>{CONFIGS.extendDate[index]}</Item>
      );
    };

    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div>费用明细</div>
          <List className="crf-list crf-extend-date-detail-list">
            {Object.keys(CONFIGS.extendDate).map(content)}
          </List>
        </div>
      </div>
    )
  }
}
