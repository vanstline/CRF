import React, { Component } from 'react';
//import { LoanForOldApp, LoanForH5, Loading } from 'app/components';
import { LoanForOldApp, Loading } from 'app/components';
import { Toast } from 'antd-mobile';

class Loan extends Component {
  constructor(props) {
    super(props);
    CONFIGS.userId = props.location.query.ssoId;
    this.state = {
      renderStatus: 0,
      isLoading: true,
    };
    /*
     * renderStatus: 0 旧的H5页面
     * renderStatus: 1 新的H5页面
     * renderStatus: 2 loading页面
     * */
  }

  /*componentDidMount() {
    //this.renderSuitableH5();
  }

  async renderSuitableH5() {
    //https://app-ci.crfchina.com/app_dubbo/api/goUrl/370486f0d16742b38138f3dc1839efcb
    const renderPath = `${CONFIGS.basePath}/api/goUrl/${CONFIGS.ssoId}`;

    try {
      const fetchPromise = CRFFetch.Get(renderPath);
      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {
        this.setState({ renderStatus: result.urlJump });//result告诉我渲染的status
      }
    } catch (error) {
      this.setState({ isLoading: false });

      CRFFetch.handleError(error, Toast, () => {
        if (error.response.status === 400) {
          error.body.then(data => {
            Toast.info(data.message);
          });
        }
      });
    }
  }*/

  render() {
    const { renderStatus, isLoading } = this.state;
    switch (renderStatus) {
      case 0:
        return (
          <LoanForOldApp />
        );
      /*case 1:
        return (
          <LoanForH5 />
        );*/
      case 2:
        return (
          <Loading ref="loading" show={isLoading} />
        );
    }
  }
}

export default Loan;
