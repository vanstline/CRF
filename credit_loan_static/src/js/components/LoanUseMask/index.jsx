import React, {Component} from 'react';
import {Picker, List, Toast} from 'antd-mobile';
import styles from './index.scss';

class LoanMask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.list,
      isHideMask: props.isHideMask,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.list,
      isHideMask: nextProps.isHideMask,
    });
  }

  handleClick(item, index) {
    this.saveUseIndex(index);
    this.props['changeText'] && this.props['changeText'](item['active']);
    this.closeMask();
  }

  saveUseIndex(index) {
    CONFIGS.loanUseIndex = index;
    localStorage.setItem('loanUseIndex', index);
  }

  closeMask() {
    this.setState({ isHideMask: true });
  }

  useList(item, index) {
    return (
      <li key={index} className={styles.maskMainLi} onClick={this.handleClick.bind(this, item, index)}>
        <span>{item.active}</span>
      </li>
    );
  }

  render() {
    let { data, isHideMask } = this.state;
    let hideMask = isHideMask ? 'n' : '';
    return (<section className={`${styles.mask} ${hideMask}`}>
      <div className={styles.maskShadow} onClick={this.closeMask.bind(this)}></div>
      <div className={styles.maskMain}>
        <div className={styles.maskMainTop}>
          <div className={styles.maskMainTopLeft}>请选择借款用途</div>
          <div className={styles.maskMainTopRight} onClick={this.closeMask.bind(this)}>关闭</div>
        </div>
        <ul className={styles.maskMainUl}>
          { data.map(this.useList.bind(this)) }
        </ul>
      </div>
    </section>);
  }
}


export default LoanMask;