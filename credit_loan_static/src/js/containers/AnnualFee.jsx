import React, { Component } from 'react';
import { withRouter, hashHistory } from 'react-router';
import { Nav, Loading, FeeMember } from 'app/components';
import { Toast } from 'antd-mobile';

class FeeIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: [],
      // associatorType: props.location.query && props.location.query.assType
    }
  }

  componentDidMount() {
    document.body.scrollTop = 0;

    this.getInitData();
  }

  // https://m-ci.crfchina.com/h5_dubbo/associator/queryProduct/8840e8dcb4b745ce8ea4ef041e91d14b
  async getInitData() {
    let creditPath = `${CONFIGS.associatorPath}/queryProduct/${CONFIGS.ssoId}`;

    try {
      let fetchPromise = CRFFetch.Get(creditPath);
      // 获取数据并确定是否已经绑卡
      let result = await fetchPromise;
      if (result && !result.response) {
        /*
        * [{
         "orderType": "YEAR_CARD",
         "orderLevelType": "FIRST",
         "orderTrxnType": "CHARGED",
         "trxnAmt": 0
         },{
         "orderType": "YEAR_CARD",
         "orderLevelType": "SECOND",
         "orderTrxnType": "CHARGED",
         "trxnAmt": 0
         }]
         {"memberPrdInfos":[{"memberCanRefund":"N","memberDHandleFeeDiscntRate":"1","memberDues":"128","memberDuesDiscountRate":"1","memberEffectiveDays":"365","memberIconPath":"https://m-static-ci.crfchina.com/images/annualfee/gold.png","memberIntroduce":"黄金会员购买后不支持退款","memberIsAutomaticRenewal":"","memberLevel":"1","memberMHandleFeeDiscntRate":"1","memberName":"黄金会员","memberRefundAmount":"","memberSalePrice":"111"},{"memberCanRefund":"N","memberDHandleFeeDiscntRate":"1","memberDues":"198","memberDuesDiscountRate":"1","memberEffectiveDays":"365","memberIconPath":"https://m-static-ci.crfchina.com/images/annualfee/platinum.png","memberIntroduce":"白金会员购买后不支持退款","memberIsAutomaticRenewal":"","memberLevel":"2","memberMHandleFeeDiscntRate":"1","memberName":"白金会员","memberRefundAmount":"","memberSalePrice":"198"},{"memberCanRefund":"Y","memberDHandleFeeDiscntRate":"1","memberDues":"398","memberDuesDiscountRate":"1","memberEffectiveDays":"365","memberIconPath":"https://m-static-ci.crfchina.com/images/annualfee/diamond.png","memberIntroduce":"钻石会员达成特定条件可全额<span>退还会费<\/span>","memberIsAutomaticRenewal":"","memberLevel":"3","memberMHandleFeeDiscntRate":"1","memberName":"钻石会员","memberRefundAmount":"","memberSalePrice":"398"}],"result":"0","errMsg":""}
        * */
        result = result.memberPrdInfos;
        Object.assign(CONFIGS.annualFeeProduct, result);
        localStorage.setItem('annualFeeProduct', JSON.stringify(result));
        let memberList = [];
        result.forEach((item, index) => {
          memberList.push({
            money: item.memberDues,
            title: item.memberName,
            className: `member-${item.memberLevel}`,
          });
        });

        this.setState({
          data: memberList,
          isLoading: false,
        });
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

  render() {
    let props = { title: '会员', stage: 'annualfee' };
    let { isLoading, data } = this.state;
    return (
      <section className="full-wrap">
        <Nav data={props} />
        <FeeMember memberList={data} />
        <Loading  show={isLoading} />
      </section>
    )
  }
}

export default withRouter(FeeIndex);
