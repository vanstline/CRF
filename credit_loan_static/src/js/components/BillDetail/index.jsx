import React, { Component } from 'react';
import { Table } from 'antd-mobile';
const Numeral = require('numeral');

export default class BillDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      contractNo: props.data.contractNo,
      orderNo: '-',
      detail: null,
      amount: '',
      account: '',
      partner: '-',
      createDate: '-',
      planDto: {
        term_no: '-',
        curr_bill_date: '-',
        curr_amt: '-',
        curr_fee_amt: '-',
        curr_penalty_amt: '-',
        curr_over_int_amt: '-',
        curr_int_amt: '',
        curr_principal_amt: '',
        over_days: '-',
        bill_status: '-',
        paid_amt: '-',
        paid_fee_amt: '-',
        paid_penalty_amt: '-',
        paid_over_int_amt: '-',
        paid_int_amt: '-',
        paid_principal_amt: '-'
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data);
  }

  render() {
    let { contractNo, orderNo, detail, account, partner, createDate, planDto } = this.state;

    const columns = [
      { title: '应还款日', dataIndex: 'billDate', width: '1.5rem', key: 'title' },
      { title: '本金', dataIndex: 'principal',  width: '1rem' },
      { title: '手续费', dataIndex: 'commissionCharge', width: '1rem' },
      { title: '利息', dataIndex: 'interest', width: '1rem' },
      { title: '到期应还', dataIndex: 'amount', width: '1.2rem', className: 'date' }
    ];

    const principal = Numeral(planDto.plan_principal_amt/100).format('0.00');
    const data = [{
      billDate: planDto.bill_date,
      principal: principal,
      commissionCharge: Numeral(planDto.plan_fee_amt/100).format('0.00'),
      interest: Numeral(planDto.plan_int_amt/100).format('0.00'),
      amount: Numeral(planDto.plan_amt/100).format('0.00'),
      key: '1'
    }];

    return (
      <section className="form">
        <div className="loan-title">借款金额(元)</div>
        <div className="loan-amount">{principal}</div>
        <Table
          columns={columns}
          dataSource={data}
        />
        <div className="blank-border"></div>
        <div className="loan-list hor">
          <div className="loan-list-title">充值说明</div>
          <div className="load-list-info">{detail}</div>
        </div>
        <div className="loan-list hor">
          <div className="loan-list-title">充值号码</div>
          <div className="load-list-info">{account}</div>
        </div>
        <div className="blank-border"></div>
        <div className="loan-list hor">
          <div className="loan-list-title">创建日期</div>
          <div className="load-list-info">{createDate}</div>
        </div>
        <div className="loan-list hor">
          <div className="loan-list-title">订单号</div>
          <div className="load-list-info">{orderNo}</div>
        </div>
        <div className="blank-border"></div>
      </section>
    )
  }
}
