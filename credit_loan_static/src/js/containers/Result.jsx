import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, Result, ResultSteps, Loading, ShareApp, BottomLogo, ResultUse } from 'app/components';// , ViewProtocol
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class ResultPage extends Component {
  constructor(props, context) {
    super(props, context);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.timer = null;
    this.state = {
      status: 0,
      contractNo: this.props.location.query.contractNo,
      type: this.props.location.query.type || 'p',
      from: this.props.location.query.source || '',
      fee: this.props.location.query.fee,
      useInfo: this.props.location.state && this.props.location.state.useInfo || '',
      cash: '-',
      isLoading: true,
      dataList: [],
      title: '',
      creditType: null,
    };
    this.pastTime = null;
  }

  componentDidMount() {
    document.body.scrollTop = 0;

    if (this.state.type !== 'r' && this.state.type !== 'e') {
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultLoan']);
    } else if (this.state.type !== 'r' && this.state.type === 'e') {
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultExtend']);
    } else {
      _paq.push(['trackEvent', 'C_Page', 'E_P_ResultRepay']);
    }

    this.getInitData();
    this.timer = setInterval(() => {
      this.getInitData();
    }, 10000);

    const isFromRcs = Common.returnPara('isFromRcsRepayResult');
    if (isFromRcs && this.forbidResend()) {
      this.getCampaignData();
    }

    this.handleNotH5Back();

    //if (Common.isCrfAppLocal() && location.href.indexOf('bruat') > -1) {
    //  alert('component did mount, result' + typeof CRFLogin);
    //}
  }

  componentWillUnmount() {
    Common.isWeChat() && ( Common.unBindPopStateFn(this.resultBackFn) );
    Common.isR360Local() && ( Common.unBindPopStateFn(this.r360BackFn) );
    clearInterval(this.timer);
  }

  handleNotH5Back() {
    this.pastTime = new Date().getTime();
    if (Common.isWeChat()) {
      Common.popStateFn(this.resultBackFn);
    } else if (Common.isR360Local()) {
      this.pastTime = new Date().getTime();
      Common.popStateFn(this.r360BackFn);
    } else if (Common.isYouBaiLocal()) {
      Common.popStateFn(this.backPathFn.bind(this));
    }
  }

  backPathFn() {
    const URL = decodeURIComponent((Common.returnPara('return_url') || localStorage.getItem('backPath')));
    if (location.hash.indexOf('result?') > -1) {
      if (new Date().getTime() - this.pastTime > 800) {
        if (URL != 'null') {
          location.href = URL;
        } else {
          Common.closeAliPay();
        }
      }
    }
  }

  r360BackFn() {
    const URL = localStorage.getItem('r360BackPath');
    if (location.hash.indexOf('result?') > -1 && URL) {
      if (new Date().getTime() - this.pastTime > 800) {
        location.href = URL;
      }
    }
  }

  resultBackFn() {
    if (location.hash.indexOf('result') > -1) {
      let path = 'loan';
      this.state.type === 'r' && (path = 'repay');

      hashHistory.push({
        pathname: path,
        query: {
          ssoId: CONFIGS.userId
        }
      });
    }
  }

  forbidResend() {
    //解决一个偶先问题，800毫秒内禁止接口发送第二次
    const prevTime = Number(localStorage.getItem('timestamp'));
    const nowTime  = (new Date()).getTime();
    localStorage.setItem('timestamp', nowTime);
    return nowTime - prevTime > 800;
  }

  async getCampaignData() {
    //'https://m-uat.crfchina.com/campaign/campaignInfo/370486f0d16742b38138f3dc1839efcb/loan'
    let path = `/campaign/campaignInfo/${CONFIGS.userId}/loan`;

    try {
      let fetchPromise = CRFFetch.Get(path, {});
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        if (result.url) {
          setTimeout(() => {
            location.href = result.url;//直接跳转
          }, 800);
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
      }, () => {
        let hashPath;
        if (path.indexOf(CONFIGS.loanPath) > -1) {
          hashPath = 'loan';
        } else {
          hashPath = 'repay';
        }
        hashHistory.push({
          pathname: hashPath,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });
    }
  }

  async getInitData() {
    let path = `${CONFIGS.repayPath}/dynamics?kissoId=${CONFIGS.userId}&repayNo=${this.state.contractNo}`;
    if (this.state.type !== 'r') {
      path = `${CONFIGS.loanPath}/dynamics?kissoId=${CONFIGS.ssoId}&loanNo=${this.state.contractNo}&trxnType=${this.state.type}`;
    }

    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false
        });
        this.setStatus(result);
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
      }, () => {
        let hashPath;
        if (path.indexOf(CONFIGS.loanPath) > -1) {
          hashPath = 'loan';
        } else {
          hashPath = 'repay';
        }
        hashHistory.push({
          pathname: hashPath,
          query: {
            ssoId: CONFIGS.userId
          }
        });
      });
    }
  }

  setStatus(data) {
    let result = data.trace_list;
    if(result.length !== 0) {
      if (result[result.length - 1].process_status === 's') {
        this.setState({dataList: result, status: 2, title: result[result.length - 1].trace_content, cash: data.loan_pay_amt, creditType: data.credit_type});
        clearInterval(this.timer);
        _paq.push(['trackEvent', 'C_RepayResult', 'E_P_Repay_Successed', '还款成功']);
      } else if (result[result.length - 1].process_status === 'f' || result[result.length - 1].process_status === 'p' || result[result.length - 1].process_status === 'n') {
        this.setState({dataList: result, status: 1, title: result[result.length - 1].trace_content, cash: data.loan_pay_amt, creditType: data.credit_type});
        clearInterval(this.timer);
        _paq.push(['trackEvent', 'C_RepayResult', 'E_SubmitRepay_Failed', '还款失败']);
      } else {
        this.setState({dataList: result, title: result[result.length - 1].trace_content, cash: data.loan_pay_amt, creditType: data.credit_type});
      }
    }
  }

  getStatus() {
    let data = {
      cash: this.state.cash,
      type: this.state.type,
      title: this.state.title,
      creditType: this.state.creditType,
      fee: this.state.fee,
    };
    if (this.state.source === 'loan') {
      data.name = '交易';
    } else {
      if (this.state.type === 'r') {
        data.name = '还款';
      } else if (this.state.type === 'e') {
        data.name = '展期';
      } else {
        data.name = '借款';
      }
    }
    if (this.state.status === 1) {
      data.status = 'failed';
    } else if (this.state.status === 2) {
      data.status = 'success';
    }

    if (this.state.type !== 'r') {
      data.isLoanConfirm = true;
    }
    return data;
  }

  render() {
    const data = this.getStatus();
    let extendStatus = false;
    if (this.state.type === 'e') {
      extendStatus = true;
    }
    let props = {title: `${data.name}动态`, status: this.state.status, contractNo: this.state.contractNo, from: this.state.from, type: this.state.type, stage: 'result', extend: extendStatus};

    let loanClassName = '';
    if (this.state.type !== 'r') {
      loanClassName = 'loan-text-color';
    }
    const { isLoading, useInfo } = this.state;// contractNo

    return (
      <section className="result-content">
        <Nav data={props} />
        {this.state.type !== 'e' &&
          <WhiteSpace />
        }
        <Result data={data} />
        <ResultSteps data={this.state} loanClassName={loanClassName} />
        {
          this.state.type === 'p' &&
          <ResultUse useInfo={useInfo} />
        }
        {
          Common.isCrfAppLocal()
          &&
          <div>
            <ShareApp data={data} />
            <BottomLogo />
          </div>
        }
        <Loading show={isLoading} />
      </section>

    )
  }
}
/*
*
* { data && <ViewProtocol contractNo={contractNo} />}
 {
   this.state.campaignUrl && <PopUpBox url={this.state.campaignUrl} />
 }
* */

export default withRouter(ResultPage);
