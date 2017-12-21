import React, { Component } from 'react';
import { Table} from 'antd-mobile';
import { hashHistory } from 'react-router';
import styles from './index.scss';

export default class RepayDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      data: {},
      message: '',
    };
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('loanDetail:list', (topic, val) => {
      this.setListData(val);
    });
  }

  componentDidUpdate() {
    this.resetScrollY();
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  resetScrollY(){
    const amTable = document.querySelector('.loan-content .am-table');
    const amTableContent = document.querySelector('.loan-content .am-table-content');
    if (amTable && amTableContent) {
      if (amTableContent.offsetHeight > amTable.offsetHeight) {
        amTable.classList.add('overflow-y-scroll');
      } else {
        amTable.classList.remove('overflow-y-scroll');
      }
    }
  }

  setListData(data) {
    //mock
    /*
    let list = {"channel":"xhd","detailList":{"loanScale":{"contract_name":"信而富现金贷借款服务协议","contract_version":"0.01","day_scale":"1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|","errorMessag":"","loan_amount_max":"7900.0","loan_amount_min":"100.0","loan_amount_step":"100.0","period_amount_min":"50.0","period_limit":"1600","period_scale":"2|","result":"0","return_ability":"10000","used_limit":"2100.0"},"LoanPlan":[{"currBillDate":"2017-08-21","currCountMstAtm":"861.76","currEndMstAtm":"800.0","currInterest":"29.76","currMstAtm":"800.0","currStartMstAtm":"1600.0","handleFee":"32.0","period":"1"},{"currBillDate":"2017-09-21","currCountMstAtm":"830.88","currEndMstAtm":"0.0","currInterest":"14.88","currMstAtm":"800.0","currStartMstAtm":"800.0","handleFee":"16.0","period":"2"},{"currBillDate":"2017-09-21","currCountMstAtm":"830.88","currEndMstAtm":"0.0","currInterest":"14.88","currMstAtm":"800.0","currStartMstAtm":"800.0","handleFee":"16.0","period":"2"},{"currBillDate":"2017-09-21","currCountMstAtm":"830.88","currEndMstAtm":"0.0","currInterest":"14.88","currMstAtm":"800.0","currStartMstAtm":"800.0","handleFee":"16.0","period":"2"},{"currBillDate":"2017-09-21","currCountMstAtm":"830.88","currEndMstAtm":"0.0","currInterest":"14.88","currMstAtm":"800.0","currStartMstAtm":"800.0","handleFee":"16.0","period":"2"}],"LoanClause":{"billDate":"21","channelFee":"","countMstAtm":"1692.64","dInterestRate":"0.0006","dOverDueRate":"4.0000","dailyFreeHandFeeTimes":"3","handingFeeFix":"48.0","interestFreeDays":"3","loanAmount":"1600.0","loanPeriod":"2","mInterestRate":"0.0180","mOverDueRate":"120.0000","monthFreeHandFeeTimes":"30","overDueFreeDays":"3","periodYN":"A","productVersion":"1","startTime":"2017-7-21","totalInterestFee":"44.64","totalRtnAmount":"1600.0","yInterestRate":""}},"result":"0","errMsg":""};
    if(CONFIGS.loanData.amount === 150000){
      data = list.detailList.LoanPlan;
    }
    **/

    if (Common.isType('Array')(data)) {
      let allData = {
        '0':{
          list: []
        }
      };

      data.forEach((value,index) => {
        allData['0'].list.push({
          "day": value.currBillDate,
          "principal": value.currMstAtm,
          "fees": value.handleFee,
          "interest": value.currInterest,
          "repay": value.currCountMstAtm,
          "key": index,//需要一个key
        });
      });

      this.setState({
        data: allData
      });
    } else {
      if (!this.state.data['0']) {
        this.setState({
          data: [{}],
          message: data,
        });
        return;
      }
      this.setState({
        message: data,
      });
    }
  }

  render() {
    const { data, message } = this.state;
    const columns = [
      { title: '应还款日', dataIndex: 'day', key: 'day' },
      { title: '本金', dataIndex: 'principal', key: 'principal'},
      { title: '手续费', dataIndex: 'fees', key: 'fees'},
      { title: '利息', dataIndex: 'interest', key: 'interest'},
      { title: '到期应还', dataIndex: 'repay', key: 'repay', width: '1.5rem', className: 'result' },
    ];
    const content = (index) => {
      let item = data[index];
      const loanSubmitBtn = document.querySelector('.loan-submit-btn');
      let table;
      if (!message) {
        table = <Table
          className={styles.loanTable}
          columns={columns}
          dataSource={item.list}
        />;
        loanSubmitBtn.classList.remove('disabled');
      } else {
        table = <div className="error-message">{message}</div>;
        this.state.message = '';
        loanSubmitBtn.classList.add('disabled');
      }

      return (
        <div key={index} className={styles.loanContainer}>
          <div className={`${styles.loanTitle}`}>
            <div className={styles.loanTitleLeft}>借款明细</div>
          </div>
          {table}
        </div>
      );
    };

    return (
      <div className="detail-list loan-detail-list">
        {Object.keys(data).map(content)}
      </div>
    );
  }
}
