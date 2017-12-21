import React, { Component } from 'react';
import styles from './index.scss';
import { hashHistory } from 'react-router';

export default class ShareApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      campaignUrl: props.url
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  render() {
    let { campaignUrl } = this.state;
    return (
      <div className={styles['pop-up-box']}>
        <iframe src={campaignUrl} style={{width:'500px',height:'400px'}}></iframe>
      </div>
    );
  }
}
