import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, BillDetail, Phone, Loading } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class Detail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      contractNo: props.location.query.contractNo,
      title: '借款明细',
      isLoading: true,
      isApp: props.location.query.from
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    _paq.push(['trackEvent', 'P_ConsumptionBorrowResult', '借款结果']);
    this.getInitData();
  }

  async getInitData() {
    let path = CONFIGS.basePath + 'order/detail?contractNo=' + this.state.contractNo;
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
      });
    }
  }

  setStatus(result) {
    this.setState(result);
  }

  render() {
    let props = {title: this.state.title, stage: '', isApp: this.state.isApp};
    let { isLoading } = this.state;
    let data = this.state;
    return (
      <section>
        <Nav data={props} />
        <WhiteSpace />
        <div className="detail-content">
          <BillDetail data={data} />
        </div>
        <footer className="footer">
          <div>对此账单有疑问，请联系客服</div>
          <Phone />
        </footer>
        <Loading show={isLoading} />
      </section>
    )
  }
}

export default withRouter(Detail);
