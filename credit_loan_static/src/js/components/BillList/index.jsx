import React, { Component } from 'react';
import { NoRecord } from 'app/components';
import { Toast, ListView, Popover } from 'antd-mobile';
import { hashHistory } from 'react-router';
import Numeral from 'numeral';
import PubSub from 'pubsub-js';
const Item = Popover.Item;

export default class BillList extends Component {
  constructor(props, context) {
    super(props, context);
    this.dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    this.dataList = [];
    this.selected = '';
    this.state = {
      dataSource: this.dataSource.cloneWithRows(this.dataList),
      visible: false,
      fromRemote: false,
      dateList: [],
      type: props.type
    };
  }

  handleVisibleChange = (visible) => {
    setTimeout(() => {
      this.setState({
        visible,
      });
    }, 300);
  };

  onSelect = (opt) => {
    this.selected = opt.props.value;
    this.setState({
      visible: false
    });
    this.getInitData(opt.props.value);
  };

  componentDidMount() {
    this.getMonth();
    this.pubsub_token = PubSub.subscribe('loan:show', function(topic, type) {
      this.setHeight();
    }.bind(this));
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  async getMonth() {
    let path = `${CONFIGS.repayPath}/month?kissoId=${CONFIGS.ssoId}`;
    try {
      let fetchPromise = CRFFetch.Post(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && result[0] && !result.response) {
        let mounth = result[0][1];
        if (result[0][1] < 10) {
          mounth = '0' + mounth;
        }
        this.selected = `${result[0][0]}/${mounth}`;
        this.setState({
          dateList: result
        });
        this.getInitData(this.selected);
      }
    } catch (error) {
      this.setHeight();
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  async getInitData(mounth) {
    this.setState({
      fromRemote: false
    });
    PubSub.publish('loading:show');
    let currentMounth = mounth.replace('/', '');
    let type = '';
    if (this.state.type === 'loan') {
      type = 'c';
    } else {
      type = 'r';
    }
    let path = `${CONFIGS.repayPath}/record?kissoId=${CONFIGS.ssoId}&pageNo=-1&pageSize=-1&queryYearMonth=${currentMounth}&orderType=${type}`;
    try {
      let fetchPromise = CRFFetch.Get(path);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        PubSub.publish('loading:hide');
        this.setData(result.loan_repay_list);
      }
    } catch (error) {
      this.setState({
        fromRemote: true
      });
      this.setHeight();
      PubSub.publish('loading:hide');
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  setData(list) {
    let data = [];
    if (list && list.length > 0) {
      data = list.map((item, index) => {
        let obj = {
          orderNo: item.order_no,
          orderType: item.order_type,
          amount: item.trxn_amt,
          date: item.trxn_date.substring(5),
          loanDate: item.trxn_date.substring(5),
          repayDate: item.repay_date.substring(5),
          creditType: item.credit_type || '',
          details: '',
          status: item.status
        };
        if (this.state.type === 'repay') {
          obj.details = CONFIGS.repayType[item.repay_type];
        } else {
          if (item.order_type === 's' || item.order_type === 'e') {
            obj.details = item.loan_desc;
          } else {
            if (item.loan_desc) {//空则
              //obj.details = '提现';
              obj.details = item.loan_desc;
            } else {
              obj.details = '提现';
            }
          }
        }
        return obj;
      });
    }
    this.setState({
      dataSource: this.dataSource.cloneWithRows(data), fromRemote: true
    });
    this.setHeight();
  }

  setHeight() {
    document.body.scrollTop = 0;
    let topHeight = 0;
    if (document.querySelector('nav')) topHeight = document.querySelector('nav').offsetHeight;
    let tabHeight = document.querySelector('.am-tabs-bar').offsetHeight;
    let headerHeight = this.refs.billListHeader.offsetHeight;
    let noticeHeight = 0;
    if (document.querySelector('.bill-notice')) {
      noticeHeight = document.querySelector('.bill-notice').offsetHeight + 10;
    }
    let containerHeight = (document.documentElement.clientHeight - topHeight - tabHeight - noticeHeight - 20) + 'px';
    this.refs.billList && (this.refs.billList.style.height = containerHeight);
    let contentHeight = (document.documentElement.clientHeight - topHeight - tabHeight - headerHeight - noticeHeight - 20) + 'px';
    let billContainer = document.querySelector('.bill-list-content');
    billContainer && (billContainer.style.height = contentHeight);
  }

  handleClick(e) {
    e.stopPropagation();
    let ele = e.currentTarget;
    let contractNo = ele.dataset.no;
    let type = ele.dataset.type;
    let useInfo = ele.dataset.useinfo;
    // let category = 'C_ConsumptionBorrowResult';
    // let eventName = 'E_ConsumptionBorrowResult';
    // _paq.push(['trackEvent', category, eventName, '借款结果页']);
    let origin = window.location.origin + window.location.pathname;
    let url = `${origin}/#/`;
    let storge = window.localStorage;
    storge.setItem('crf-origin-url', '');
    let from = storge.getItem('crf-origin-url');
    if (from && from !== '') {
      window.location.href = from;
      return;
    }
    let path = 'result';
    hashHistory.push({
      pathname: path,
      query: {
        ssoId: CONFIGS.ssoId,
        contractNo: contractNo,
        type: type
      },
      state: {
        useInfo: useInfo
      }
    });
  }

  render() {
    const row = (item) => {
      let status = CONFIGS.billStatus[item.status];
      let currentAmount = Numeral(item.amount).divide(100).format('0, 0.00');

      return (
        <div key={item.orderNo} onClick={this.handleClick} className={`am-flexbox bill-list-row ${item.orderType}`} data-type={item.orderType} data-no={item.orderNo} data-useinfo={item.details}>
          <div className="am-flexbox-item bill-list-row-left">
            <div className={`row-cash ${item.creditType}`}>
              <span className="text">{currentAmount}</span>
              <span className="icon"></span>
            </div>
            {
              item.orderType === 'p'
                ?
                <div className="row-detail">{item.details == '提现' ? item.details : `现金消费: ${item.details}`}</div>
                :
                <div className="row-detail">{item.details}</div>
            }
          </div>
          <div className="am-flexbox-item bill-list-row-right">
            <div className="row-status">{status}</div>
            {item.loanDate && item.orderType !== 'p' &&
              <div className="row-loan-date">借款日期：{item.loanDate}</div>
            }
            {item.date && item.orderType === 'p' && item.loanDate &&
              <div className="row-loan-date">借款日期：{item.date}</div>
            }
            {item.repayDate &&
              <div className="row-repay-date">应还款日：{item.repayDate}</div>
            }
          </div>
        </div>
      )
    };

    const dateList = (item, i) => {
      let year = item[0];
      let mounth = item[1];
      if (mounth < 10) {
        mounth = '0' + mounth;
      }
      let mouthVaule = `${year}/${mounth}`;
      return (
        <Item key={i} value={mouthVaule}>{`${year}年${mounth}月`}</Item>
      );
    };

    const header = () => {
      return (
        <div ref="billListHeader" className="am-list-item am-list-item-middle">
          <div className="am-list-line">
            <div className="am-list-content">
              <div className="bill-header hor">
                <div className="bill-title">
                  {this.selected}
                </div>
                <div className="bill-icon">
                  <Popover mask
                    visible={this.state.visible}
                    overlay={this.state.dateList.map(dateList)}
                    onVisibleChange={this.handleVisibleChange}
                    onSelect={this.onSelect}
                  >
                    <a className="bill-list-date"></a>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    let data = this.state.dataSource.rowIdentities[0];
    let {fromRemote} = this.state;
    let billContent = null;
    if (fromRemote) {
      if (data && data.length > 0) {
        billContent = (
          <ListView
            dataSource={this.state.dataSource}
            renderRow={row}
            className="bill-list-content"
          />
        );
      } else {
        billContent = <NoRecord />;
      }
    }

    return (
      <section ref="billList" className="bill-list">
        {header()}
        {billContent}
      </section>
    );
  }
}
