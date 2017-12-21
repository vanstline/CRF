import React, { Component } from 'react';
import styles from './index.scss';

export default class Loading extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: props.show,
      maskHeight: {}
    }
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({show: nextProps.show});
  }

  componentDidMount(){
    this.resetMaskHeight();

    this.pubsub_token_show = PubSub.subscribe('loading:show', () => {
      this.show();
    });

    this.pubsub_token_hide = PubSub.subscribe('loading:hide', () => {
      this.hide();
    });
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token_show);
    PubSub.unsubscribe(this.pubsub_token_hide);
  }

  resetMaskHeight() {
    let topHeight = 0;

    let documentNav = document.querySelector('nav');
    if (documentNav) {
      topHeight = documentNav.offsetHeight;
    }

    this.setState({
      maskHeight: {
        height: document.documentElement.clientHeight - topHeight + 'px'
      }
    });
  }

  show() {
    this.setState({show: true});
  }

  hide() {
    this.setState({show: false});
  }

  render() {
    const show = this.state.show;
    let showStyle = '';

    if (show) {
      showStyle = styles.root;
    } else {
      showStyle = styles.hide;
    }
    return (
      <div className={showStyle}>
        <div className={styles.mask} style={this.state.maskHeight}>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }
}
