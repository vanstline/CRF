import React, { Component } from 'react';
import { Nav, ExtendDate, ExtendDateDetail, Loading } from 'app/components';
import { Toast, Modal, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';

class Extend extends Component {
  constructor(props, context) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      isLoading: false,
      isShow: false,
      dataList: {},
      modalHelp: false,
      contactIndex: this.props.location.query.contactIndex || 0
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('helpModal:show', function(topic, val) {
      this.setState({
        modalHelp: val,
      });
    }.bind(this));
    if (CONFIGS.extendData && CONFIGS.extendData.length > 0) {
      this.setState({
        isLoading: false
      });
      this.convertData();
    } else {
      this.getInitData();
      // let data = [
      //   {
      //     "due_date": "string",
      //     "extend_fee_amt": 2500,
      //     "loan_amt": 100000,
      //     "loan_date": "string",
      //     "loan_no": "test111",
      //     "unpaid_fee_amt": 2000,
      //     "unpaid_int_amt": 5000,
      //     "unpaid_over_int_amt": 1000,
      //     "unpaid_penalty_amt": 1500,
      //     "unpaid_principal_amt": 1000,
      //     "validate_days": 0,
      //     "max_extend_days": 25
      //   },
      //   {
      //     "due_date": "string",
      //     "extend_fee_amt": 2500,
      //     "loan_amt": 200000,
      //     "loan_date": "string",
      //     "loan_no": "test222",
      //     "unpaid_fee_amt": 2000,
      //     "unpaid_int_amt": 5000,
      //     "unpaid_over_int_amt": 2000,
      //     "unpaid_penalty_amt": 2500,
      //     "unpaid_principal_amt": 2000,
      //     "validate_days": 0,
      //     "max_extend_days": 15
      //   }
      // ];
      // this.convertData(data);
    }
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }


  async getInitData() {
    let extendPath = `${CONFIGS.extendPath}/orderList?kissoId=${CONFIGS.userId}`;

    try {
      let fetchPromise = CRFFetch.Get(extendPath);

      // 获取数据并确定是否已经绑卡
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          isLoading: false
        });
        if (result.extend_loan_list && result.extend_loan_list.length > 0) {
          this.convertData(result.extend_loan_list);
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

  convertData(data) {
    if(data) {
      let extendData = [];
      data.map((item, index) => {
        let extendItem = {
          isActive: false,
          contactNo: item.loan_no,
          amount: item.loan_amt,
          loanDate: item.loan_date,
          repayDate: item.due_date,
          indate: item.validate_days,
          interest: item.unpaid_int_amt,
          fee: item.unpaid_fee_amt,
          poundage: item.unpaid_penalty_amt,
          overhead: item.extend_fee_amt,
          extendDays: item.max_extend_days
        };
        if (index === 0) {
          extendItem.isActive = true;
        }
        extendData.push(extendItem);
      });
      CONFIGS.extendData = extendData;
      _paq.push(['trackEvent', 'C_APP_Extension_Cost', 'E_P_Extension_Cost_Num', CONFIGS.extendData[0].contactNo]);
    }
    this.setState({
      dataList: CONFIGS.extendData[this.state.contactIndex],
      isShow: true
    });
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  handleClick() {
    let path = 'extenddetail';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.userId,
        contactIndex: this.state.contactIndex
      }
    });
  }

  render() {
    let props = {title: '展期', stage: 'extend', extend: true};
    let {isLoading, isShow, dataList} = this.state;
    let totalFee = 0,
        amount = 0;
    if (isShow) {
      totalFee = Numeral(dataList.interest + dataList.fee + dataList.poundage + dataList.overhead).divide(100).format('0, 0.00');
      CONFIGS.realAmount = totalFee;
      amount = Numeral(dataList.amount).divide(100).format('0, 0.00');
    }

    return (
      <section className="full-wrap">
        <Nav data={props} />
        {isShow &&
          <div>
            <ExtendDate data={dataList} />
            <WhiteSpace />
            <ExtendDateDetail data={dataList} />
            <footer className="extend-footer">
              <button onClick={this.handleClick.bind(this)} ref="refFormNextBtn">使用展期</button>
              <div className="notice">
                提醒：如您不能按时还款，建议使用展期，支付展期费用{totalFee}元后，对未还本金{amount}元申请延迟还款，以免不良记录被上报影响您的征信。
              </div>
            </footer>
          </div>
        }
        <Loading  show={isLoading} />
        <Modal
          title="帮助中心"
          transparent
          maskClosable={true}
          className="crf-extend-date-modal"
          visible={this.state.modalHelp}
          onClose={this.onClose('modalHelp')}
          footer={[
            { text: '我知道了', onPress: () => {this.onClose('modalHelp')()} }
          ]}
          platform="ios"
        >
          <div className="crf-extend-date-inner">
            <p>什么是展期功能？</p>
            <p>展期功能指用户在支付利息、手续费、延迟还款服务费、展期管理费后，对借款本金部分可申请延迟还款。申请展期成功，本次逾期记录不会上报。该功能目前仅对部分用户开放。</p>
          </div>
        </Modal>
      </section>
    )
  }
}

export default Extend;
