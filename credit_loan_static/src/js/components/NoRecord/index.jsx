import React, { Component } from 'react';
import styles from './index.scss'

export default class NoRecord extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.content}>
          <span>您还没有相关记录哦</span>
        </div>
      </div>
    )
  }
}
