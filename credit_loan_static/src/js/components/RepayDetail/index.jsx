import React, { Component } from 'react';
import {Modal, Table, Toast} from 'antd-mobile';
import Numeral from 'numeral';
import styles from './index.scss';

export default class RepayDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      amount: 0,
      data: {},
      modal: false
    };
  }

  showModal = key => (e) => {
    // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
    // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
    e.preventDefault(); // 修复 Android 上点击穿透
    this.setState({
      [key]: true,
    });
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  convertTableData(jsonData) {
    let data = {};
    let i = 0;
    jsonData.map((item, index) => {
      if (!data[i]) {
        data[i] = {};
        data[i].billDate = item.curr_bill_date;
        data[i].offsetPenalty = item.offset_penalty;
        data[i].list = [];
      } else {
        if ((data[i].billDate === item.curr_bill_date) && (data[i].offsetPenalty !== item.offset_penalty)) {
          i++;
          data[i] = {};
          data[i].billDate = item.curr_bill_date;
          data[i].offsetPenalty = item.offset_penalty;
          data[i].list = [];
        } else if (data[i].billDate !== item.curr_bill_date) {
          i++;
          data[i] = {};
          data[i].billDate = item.curr_bill_date;
          data[i].offsetPenalty = item.offset_penalty;
          data[i].list = [];
        }
      }
    });

    Object.keys(data).map((key) => {
      let main = data[key];
      jsonData.map((sub) => {
        if ((main.billDate === sub.curr_bill_date) && ( main.offsetPenalty === sub.offset_penalty)) {
          let currentData = {
            amt: Numeral(sub.offset_amt).divide(100).format('0, 0.00'),
            principal: Numeral(sub.offset_principal).divide(100).format('0, 0.00'),
            fees: Numeral(sub.offset_fee).divide(100).format('0, 0.00'),
            interest: Numeral(sub.offset_int).divide(100).format('0, 0.00'),
            flag: CONFIGS.repayStatus[sub.complete_flag]
          };
          main.list.push(currentData);
        }
      });
    });
    return data;
  }

  async getInitData(amount) {
    this.setState({
      amount: amount,
      modal: true
    });
    let currentAmount = Numeral(amount).multiply(100).value();
    let date = new Date();
    let formatDate = DateFormat(date, 'yyyymmdd');
    let repayPath = `${CONFIGS.repayPath}/detail?kissoId=${CONFIGS.userId}&repayamt=${currentAmount}&offsetDate=${formatDate}`;

    try {
      let fetchPromise = CRFFetch.Get(repayPath);
      // 获取数据
      let result = await fetchPromise;
      if (result && !result.response) {
        this.setState({
          data: this.convertTableData(result.repay_plan_list)
        });
      }
    } catch (error) {
      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }

  componentDidMount() {
    this.pubsub_token = PubSub.subscribe('repayDetail:show', function(topic, val) {
      this.getInitData(val);
    }.bind(this));
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  render() {
    const {amount, data} = this.state;
    const formatFees = Numeral(amount).format('0, 0.00');
    const modalStyle = {width: '90%'};
    const columns = [
      { title: '还款', dataIndex: 'amt', key: 'amt', width: '1.5rem' },
      { title: '本金', dataIndex: 'principal', key: 'principal', width: '1.5rem'},
      { title: '手续费', dataIndex: 'fees', key: 'fees', width: '1.5rem'},
      { title: '利息', dataIndex: 'interest', key: 'interest', width: '1.5rem'},
      { title: '状态', dataIndex: 'flag', key: 'flag', width: '1.5rem', className: 'status' }
    ];
    const content = (index) => {
      let item = data[index];
      let date = new Date(item.billDate);
      let formatDate = DateFormat(date, 'mm-dd');
      let offsetPenalty = Numeral(item.offsetPenalty).divide(100).format('0, 0.00');
      return (
        <div key={index} className={styles.repayContainer}>
          <div className={`${styles.repayTitle} hor`}>
            <div className={styles.repayTitleLeft}>{`到期日 : ${formatDate}`}</div>
            {(item.offsetPenalty > 0) &&
              <div className={styles.repayTitleRight}>{`延迟还款服务费 : ${offsetPenalty}元`}</div>
            }
          </div>
          <Table
            className={styles.repayTable}
            columns={columns}
            dataSource={item.list}
          />
        </div>
      );
    };

    return (
      <Modal
        className="crf-repay-modal"
        transparent
        style={modalStyle}
        title={`还款金额${formatFees}元`}
        closable={true}
        maskClosable={false}
        visible={this.state.modal}
        onClose={this.onClose('modal')}
        platform="ios"
      >
        <div className={styles.root}>
          {Object.keys(data).map(content)}
        </div>
      </Modal>
    );
  }
}
