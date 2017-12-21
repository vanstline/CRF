import React, {Component} from 'react';

import {withRouter, hashHistory} from 'react-router';
import {Toast} from 'antd-mobile';

class Contract extends React.Component {
  constructor(props) {
    super(props);
    let origin = location.origin.indexOf('dev') > -1 ? 'https://m-ci.crfchina.com' : location.origin;
    this.state = {
      contractData: this.contractList(props),
      ZJContractData: null,
      annualContractData: [
        {
          contractName: '信而富诚信俱乐部会员服务协议',
          contractUrl: origin + '/mobile_loan/contract/annualMember_agreement.html'
        },
      ],
    };
    this.info = {
      userName: '',
      idNo: '',
    }
  }

  componentWillMount() {
    this.getContractFetch();

    if (this.props.curPath === 'loanconfirm') {
      this.getUserNameNo();
      this.getZJContractFetch();
    }
  }

  componentDidMount() {

    //勾选协议
    const refAgree = this.refs.refAgree;
    refAgree.onclick = () => {
      refAgree.classList.toggle('un-agree');

      if (this.props.curPath === '/') {
        CONFIGS.bindCard.isAgree = !CONFIGS.bindCard.isAgree;
        this.props.removeDisabled();
      }

      if (this.props.curPath === 'loanconfirm') {
        CONFIGS.loanData.isAgree = !CONFIGS.loanData.isAgree;
      }
    };

    //向父组件传递--绑卡
    this.props.getContractEle && this.props.getContractEle(this.refs.refAgree);

  }

  async getContractFetch() {
    let type = 'OPEN_ACCOUNT';

    if (this.props.curPath === 'loanconfirm') {
      type = 'LOAN_APPLY';
    }

    let getContractUrl = CONFIGS.contractPath + '/?contractEnum=' + type;

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        /*
         {contractName:"网络交易资金账户第三方协议",contractUrl:"https://m-ci.crfchina.com/tripartite_agreement.html"}
         {contractName:"用户授权协议",contractUrl:"https://m-ci.crfchina.com/userLicense_agreement.html"}
         * */
        let contractArr = [];
        result.forEach((item) => {
          let itemObj = {
            contractName: item.contractName,
            contractUrl: `${item.contractUrl}?ssoId=${CONFIGS.ssoId}`,
          };
          contractArr.push(itemObj);
        });
        this.setState({ contractData: contractArr });
      }
    } catch (err) {

      CRFFetch.handleError(err, Toast, () => {
        if (err.response.status == 400) {
          err.body.then(data => {
            if (CONFIGS.chineseCharRegx.test(data.message)) {
              Toast.info(data.message);
            } else {
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }
      });
    }
  }

  async getUserNameNo() {
    //https://m-ci.crfchina.com/h5_dubbo/contract/agreement/certificate?kissoId=5e886c9c0baf4954965b38c81c99a1c0

    let getUserNameUrl=`${CONFIGS.contractPath}/agreement/certificate?kissoId=${CONFIGS.ssoId}`;

    try {
      let fetchPromise = CRFFetch.Get(getUserNameUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.info.userName = result.userName;
        this.info.idNo = result.idNo;
      }
    } catch (err) {

      CRFFetch.handleError(err, Toast, () => {
        if (err.response.status == 400) {
          err.body.then(data => {
            if (CONFIGS.chineseCharRegx.test(data.message)) {
              Toast.info(data.message);
            } else {
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }
      });
    }
  }

  async getZJContractFetch() {
    //https://m-ci.crfchina.com/h5_dubbo/contract/agreement?kissoId=5e886c9c0baf4954965b38c81c99a1c0&agreementGroup=p2p&agreementVersion=2.02
    //console.log(CONFIGS.method);
    let getContractUrl = `${CONFIGS.contractPath}/agreement?kissoId=${CONFIGS.ssoId}&agreementGroup=${CONFIGS.method.agreementGroup}&agreementVersion=${CONFIGS.method.agreementGroupVer}`;

    try {
      let fetchPromise = CRFFetch.Get(getContractUrl);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        if (result.length !== 0) {
          //默认加上数字证书协议
          result.push({
            id: 'digital',
            protocolCode: 'Digital Certificate',
            protocolName: '数字证书服务协议',
            sequence: 999,
          });

          this.setState({
            ZJContractData: result
          });
        }
      }
    } catch (err) {

      CRFFetch.handleError(err, Toast, () => {
        if (err.response.status == 400) {
          err.body.then(data => {
            if (CONFIGS.chineseCharRegx.test(data.message)) {
              Toast.info(data.message);
            } else {
              Toast.info('系统繁忙，请稍后再试！');
            }
          });
        }
      });
    }
  }

  contractList(props) {
    let contractList = [];
    if (props.curPath === '/') {
      contractList = [
        {
          contractName: '网络交易资金账号三方协议',
          contractUrl: location.origin + 'contract/tripartite_agreement.html'
        },
        {
          contractName: '第三方协议',
          contractUrl: location.origin + 'contract/userLicense_agreement.html'
        }
      ]
    }
    return contractList;
  }

  handleContractClick(item) {
    if (this.props.curPath === '/') {
      CONFIGS.bindCard.contractName = item.contractName;
      CONFIGS.bindCard.contractUrl = item.contractUrl;
      CONFIGS.currentPath = '/';
      
      _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_contract', item.contractName]);

      hashHistory.push({
        pathname: 'contract',
        query: {
          ssoId: CONFIGS.ssoId
        },
        state: {
          title: item.contractName,
        },
      });
    } else if (this.props.curPath === 'loanconfirm') {
      CONFIGS.loanData.contractName = item.contractName;
      CONFIGS.loanData.contractUrl = item.contractUrl;
      CONFIGS.currentPath = '/loanconfirm';

      _paq.push(['trackEvent', 'C_LoanConfirm', 'E_LoanConfirm_contract', item.contractName]);

      //this.props.router.push('contract');
      hashHistory.push({
        pathname: 'contract',
        state: {
          id: 'loan',
          title: item.contractName,
        },
      });
    } else if (this.props.curPath === 'annualfeeconfirm') {
      CONFIGS.loanData.contractName = item.contractName;
      CONFIGS.loanData.contractUrl = item.contractUrl;
      CONFIGS.currentPath = '/annualfeeconfirm';

      hashHistory.push({
        pathname: 'contract',
        query: {
          ssoId: CONFIGS.ssoId
        },
        state: {
          title: item.contractName,
          url: item.contractUrl
        },
      });
    }
  }

  showContractContent(item) {
    _paq.push(['trackEvent', 'C_LoanConfirm', 'E_LoanConfirm_contract', item.protocolName]);

    let isFrame = true;
    let id = item.id;

    if (item.id === 'digital') {
      isFrame = false;
    }

    hashHistory.push({
      pathname: 'contract',
      state: {
        isZJ: isFrame,
        id: id,
        userName: this.info.userName,
        idNo: this.info.idNo,
        title: item.protocolName,
      },
    });
  }

  render() {

    let isAgree = CONFIGS.bindCard.isAgree;
    if (this.props.curPath === 'loanconfirm') {
      isAgree = CONFIGS.loanData.isAgree;
    }

    let authClassName = 'authorize';
    if (this.props.className) {
      authClassName = authClassName + ' ' + this.props.className;
    }

    let protocol;
    if (this.state.ZJContractData) {
      protocol = <p className="protocol">
        {
          this.state.ZJContractData.map((item,index) => {
            return (
              <a href="javascript:void(0)" key={index} onClick={this.showContractContent.bind(this,item)}>《{item.protocolName}》</a>
            )
          })
        }
      </p>
    } else if (this.props.curPath === 'annualfeeconfirm') {
      protocol = <p className="protocol">
        {
          this.state.annualContractData.map((item,index) => {
            return (
              <a href="javascript:void(0)" key={index} onClick={this.handleContractClick.bind(this,item)}>《{item.contractName}》</a>
            )
          })
        }
      </p>
    } else {
      protocol = <p className="protocol">
        {
          this.state.contractData.map((item,index) => {
            return (
              <a href="javascript:void(0)" key={index} onClick={this.handleContractClick.bind(this,item)}>《{item.contractName}》</a>
            )
          })
        }
      </p>
    }

    return (
      <div className={authClassName}>
        <div className="wrap-span">
          <span className={"agree " + (isAgree ? "" : "un-agree")} ref="refAgree">勾选</span>
          <span className="text">我已阅读并同意</span>
        </div>
        {protocol}
      </div>
    );
  }
}


export default withRouter(Contract);