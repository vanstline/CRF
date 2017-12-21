import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Result, Loading } from 'app/components';
import { Toast, WhiteSpace, Modal, Button, WingBlank } from 'antd-mobile';
import { hashHistory } from 'react-router';

// 判断从 Letters 回来后是否还需要弹窗
let isActive = true;

class FeeResultPage extends Component {
  constructor(props, context) {
    super(props, context);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.timer = null;
    this.state = {
      status: 'UNKNOWN',
      type: this.props.location.query.type || 'f',
      isLoading: true,
      isShow: false,
      orderAmt: 0,
      errorMsg: null
    };
    this.pastTime = null;
  }

  componentDidMount() {
    document.body.scrollTop = 0;

    this.getInitData();
    this.timer = setInterval(() => {
      this.getInitData();
    }, 20000);
  }

  async getInitData() {
    let path = `${CONFIGS.associatorPath}/orderAssociatorQuery/${CONFIGS.userId}`;

    try {
      let fetchPromise = CRFFetch.Get(path);

      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false,
          isShow: true,
          status: result.orderStatus,
          orderAmt: result.orderAmt,
          errorMsg: result.error_msg
        });
      }
    } catch (error) {
      this.setState({
        isLoading: false
      });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  getStatus() {
    let cash = '-';
    let data = {
      cash: this.state.orderAmt,
      type: this.state.type,
      errorMsg: this.state.errorMsg
    };
    if (this.state.status === 1 || this.state.status === 'FAIL') {
      data.status = 'failed';
    } else if (this.state.status === 2 || this.state.status === 'SUCCESS') {
      data.status = 'success';
    } else {
      data.status = 'default';
    }
    return data;
  }

  handleClick() {
    const { status } = this.state;
    if (status === 'FAIL') {
      hashHistory.push({
        pathname: 'annualfee',
        query: {
          ssoId: CONFIGS.userId,
          reSend: 1,
        }
      });
    } else if (status === 'SUCCESS') {
      location.href = '/campaign_static/lottery/index.html';
    } else {
      if (Common.isCrfAppLocal()) {
        location.href = '#goRCSHome';
        return;
      } else {
        window.close();
      }
    }
  }


  handleGoLetters() {
      let path = 'letters';
      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.ssoId,
          type: 'f'
        }
      })
  }

  alertMask() {
      /**
       * 前往 信件页面的 弹窗
       */
      const alert = Modal.alert;
      // let isActive = true;
      const showAlert = () => {
          const alertInstance = alert('你有一封来信', '是否前往???', [
              { text: '取消', onPress: () => alertInstance.close(), style: 'default'},
              { text: '前往', onPress: () => {
                  alertInstance.close()
                  this.handleGoLetters();
              } }
          ]);
          isActive = false
      }

      return isActive ? showAlert() : '';
  }

  render() {
    const data = this.getStatus();



    let props = {title: '支付结果', status: this.state.status, contractNo: this.state.contractNo, from: this.state.from, type: this.state.type, stage: 'feeResult'};
    const { isLoading, status, isShow } = this.state;
    return (
      <section className="fee-content">
        <Nav data={props} />
        <WhiteSpace />
        {isShow && status &&
          <Result data={data} />
        }
        {isShow && status &&
          <footer>
            <button onClick={this.handleClick.bind(this)} ref="refFormNextBtn">{CONFIGS.feeResultDes[status]}</button>
          </footer>
        }
        <Loading show={isLoading} />

        {
            // setTimeout(() => {
                this.alertMask()
            // },500)
        }
      </section>

    )
  }
}

export default withRouter(FeeResultPage);
