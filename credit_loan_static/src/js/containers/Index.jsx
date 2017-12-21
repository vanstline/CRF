import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Credit, Loading } from 'app/components';
import { Toast, List, Modal } from 'antd-mobile';
import { hashHistory } from 'react-router';
const Item = List.Item;

class Index extends Component {
  constructor(props) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    let storage = window.localStorage;

    let hiddenDownload = storage.getItem('hiddenDownload') === 'true';
    this.state = {
      isLoading: true,
      isBindCard: false,
      isShow: false,
      creditData: {
        remainLimit: '-',
        totalLimit: '-'
      },
      loanInfoText: '',
      modalLoanInfoText: false,
      hiddenDownload: hiddenDownload || false,
      externalApp: Common.isXYFLocal()
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'C_Page', 'E_P_Credit_Home']);

    this.getInitData();
    this.clearTargetUrl();
  }

  clearTargetUrl() {
    let storage = window.localStorage;
    let url = storage.removeItem('crf-target-url');
  }

  async getInitData() {
    let creditPath = `${CONFIGS.loanPath}/quota?kissoId=${CONFIGS.userId}`;
    let creditLoanPath = `${CONFIGS.ftsPath}/${CONFIGS.ssoId}/borrower_open_account`;

    try {
      let fetchPromise = CRFFetch.Get(creditPath);
      let fetchCreditLoanPromise = CRFFetch.Get(creditLoanPath);

      // 获取数据并确定是否已经绑卡
      let result = await fetchPromise;
      let resultCreditLoan = await fetchCreditLoanPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false,
          isShow: true,
          creditData: result
        });

        if (resultCreditLoan && resultCreditLoan.bankCardNo) {
          this.setState({
            isBindCard: true
          });
        }
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

  async sendProtocolFetch() {
    let protocolPath = `${CONFIGS.protocolPath}/isConfirm/${CONFIGS.userId}?type=1`;
    //https://m-ci.crfchina.com/h5_dubbo/protocol/isConfirm/d49be79470b6477aaab1304113cb0cfc?type=1
    try {
      let protocolFetchPromise = CRFFetch.Post(protocolPath);

      let result = await protocolFetchPromise;
      if (result != null && !result.response) {
        this.setState({isLoading: false});
        
        if (result === 1) {
          let timestamp = new Date().getTime();
          location.href = `/credit_loan/public/contract.html?kissoId=${CONFIGS.userId}&timestamp=${timestamp}`;
        } else {
          this.goLoan();
        }
      }
    } catch (error) {
      this.setState({ isLoading: false });
      this.goLoan();
    }
  }

  async checkLoanLimit() {
    let limitPath = `${CONFIGS.loanPath}/loanLimit?kissoId=${CONFIGS.userId}`;

    this.setState({ isLoading: true });

    try {
      let fetchPromise = CRFFetch.Get(limitPath);
      // 获取数据并确定是否已经绑卡
      let result = await fetchPromise;
      if (result && !result.response) {
        this.sendProtocolFetch();
      }
    } catch (error) {
      this.setState({ isLoading: false });
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            this.setState({
              modalLoanInfoText: true,
              loanInfoText: data.message,
            });
          });
        }
      });
    }
  }

  goLoan() {
    CONFIGS.isFromCredit = true;
    let currentPath = window.location.href;
    let path = 'loan';
    let storage = window.localStorage;
    storage.setItem('crf-origin-url', currentPath);
    storage.setItem('loan2Index', CONFIGS.isFromCredit);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleBindCard() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_tie']);
    CONFIGS.isFromCredit = true;
    CONFIGS.isFromLoan = false;
    let currentPath = window.location.href;
    let path = `/?${currentPath}`;
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push(path);
  }

  handleLoan() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_loan']);
    document.body.classList.add('crf-dialog');
    this.checkLoanLimit();
  }

  handleRepay() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_repayment']);
    CONFIGS.isFromCredit = true;
    CONFIGS.isFromLoan = false;
    let currentPath = window.location.href;
    let path = 'repay';
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleBill() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_bill']);
    CONFIGS.isFromCredit = true;
    localStorage.setItem('indexToBill', CONFIGS.isFromCredit);
    CONFIGS.isFromLoan = false;
    let currentPath = window.location.href;
    let path = 'bill';
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', currentPath);
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId
      }
    });
  }

  handleDownload() {
    _paq.push(['trackEvent', 'C_H5_homepage', 'E_H5_homepage_download']);
    CONFIGS.isFromCredit = true;
    CONFIGS.isFromLoan = false;
    if (/(Android)/i.test(navigator.userAgent)) {
      // 判断是否是腾讯浏览器中打开
      if (/MQQBrowser/i.test(navigator.userAgent)) {
      	window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.crfchina.market';
      } else {
        window.location.href = 'http://app-dw.crfchina.com/android/crf_app_last.apk';
      }
    } else {
      window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.crfchina.market';
    }
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  render() {
    let props = { title: '信而富', stage: 'index' };
    let {isLoading, isShow, creditData, isBindCard, loanInfoText, hiddenDownload, externalApp} = this.state;
    let ModalTitle = '温馨提示';

    let isHiddenDownloadButton = !hiddenDownload;
    if (Common.getProductNo()) {
      isHiddenDownloadButton = false;
    } else {
      isHiddenDownloadButton = !hiddenDownload;
    }
    return (
      <section className="full-wrap">
        <Nav data={props} />
        <Credit data={creditData} isExternal={externalApp} />
        {isShow &&
          <List className="crf-list crf-credit">
            {!isBindCard &&
              <Item arrow="horizontal" className='crf-credit-item' extra="绑卡成功才可进行借款操作" onClick={this.handleBindCard.bind(this)}>立即绑卡</Item>
            }
            <Item arrow="horizontal" className='crf-credit-item' onClick={this.handleLoan.bind(this)}>我要借款</Item>
            <Item arrow="horizontal" className='crf-credit-item' onClick={this.handleRepay.bind(this)}>我要还款</Item>
            <Item arrow="horizontal" className='crf-credit-item' onClick={this.handleBill.bind(this)}>查看账单</Item>
            { isHiddenDownloadButton &&
              <Item arrow="horizontal" className='crf-credit-item' extra="立即下载" onClick={this.handleDownload.bind(this)}>下载信而富APP</Item>
            }
          </List>
        }
        <Modal
          title={ ModalTitle }
          transparent
          maskClosable={false}
          visible={this.state.modalLoanInfoText}
          onClose={this.onClose('modalLoanInfoText')}
          footer={[
            { text: '我知道了', onPress: () => {this.onClose('modalLoanInfoText')()} },
          ]}
          platform="ios"
        >
          {loanInfoText}
        </Modal>
        { hiddenDownload && <div className="bottom-tips">更多体验请下载 信而富APP</div> }
        <Loading  show={isLoading} />
      </section>
    )
  }
}

export default withRouter(Index);
