import React, { Component } from 'react';
import styles from './index.scss';

export default class MemberCard extends Component {
  componentDidMount() {
    this.resetGuideHeight();
  }

  resetGuideHeight() {
    const memberGuideRoot = document.querySelector('.member-guide-root');
    const elNav = document.querySelector('nav');
    const elWhitespace = document.querySelector('.am-whitespace');
    let rootHeight = document.body.clientHeight - (elNav && elNav.clientHeight) - (elWhitespace && elWhitespace.clientHeight);
    memberGuideRoot.style.height = `${rootHeight}px`;
  }

  render() {
    const baseUrl = Common.getBaseUrl();
    return (
      <div className={`${styles.memberGuideRoot} member-guide-root`}>
        <div className={styles['member-guide']}>
          <img src={`${baseUrl}/images/member-guide.jpg`} alt=""/>
        </div>
      </div>
    )
  }
}
