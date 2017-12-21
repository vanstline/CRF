import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, MemberCard, MemberStatus, MemberDetail, MemberGuide, Loading } from 'app/components';
import { Toast, WhiteSpace } from 'antd-mobile';
import { hashHistory } from 'react-router';

class Index extends Component {
  constructor(props) {
    super(props);
    CONFIGS.userId = this.props.location.query.ssoId;
    this.state = {
      isLoading: true,
      isShow: false,
      memberData: {}
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    this.getInitData();
  }

  async getInitData() {
    const productNo = Common.getProductNo() || CONFIGS.productNo;
    let path = `${CONFIGS.associatorPath}/home/${CONFIGS.userId}`;
    let campaignPath = `/campaign/retunAward/${CONFIGS.userId}/queryDrawTimes`;
    let associatorPath = `${CONFIGS.associatorPath}/isAssociator/${CONFIGS.ssoId}?productNo=${productNo}`;
    let headers = {
      'Content-Type': 'application/json'
    };

    try {
      let fetchPromise = CRFFetch.Get(path);
      let fetchCampaignPromise = CRFFetch.Get(campaignPath);
      let fetchAssociatorPromise = CRFFetch.Post(associatorPath, JSON.stringify({}), headers);
      // 获取数据
      let result = await fetchPromise;
      let resultCampaign = await fetchCampaignPromise;
      let resultAssociator = await fetchAssociatorPromise;
      if (result && !result.response && resultCampaign && !resultCampaign.response && resultAssociator && !resultAssociator.response) {
        let data = Object.assign(result, resultCampaign, resultAssociator);
        this.setState({
          isLoading: false,
          isShow: true,
          memberData: data
        });
      }
    } catch (error) {
      this.setState({
        isLoading: false,
        isShow: true,
        memberData: {
          memberType: '0',
          orderList: null,
        }
      });
      CRFFetch.handleError(error, Toast, () => {});
    }
  }

  render() {
    let props = { title: '会员', stage: 'member' };
    let {isLoading, isShow, memberData} = this.state;
    let memberContent = () => {
      if (isShow) {
        if (memberData.memberType === '0' && memberData.orderList === null) {
          return (
            <div>
              <MemberGuide />
            </div>
          );
        } else if (memberData.orderList && memberData.orderList.length > 0) {
          return (
            <div>
              <MemberCard data={memberData} />
              <WhiteSpace />
              {memberData.orderList && memberData.orderList.length > 0 &&
                <div>
                  <MemberStatus data={memberData} />
                  <WhiteSpace />
                </div>
              }
              <MemberDetail data={memberData} />
            </div>
          );
        }
      } else {
        return (
          <div></div>
        );
      }
    };
    return (
      <section className="fee-content">
        <Nav data={props} />
        <WhiteSpace />
        {memberContent()}
        <Loading  show={isLoading} />
      </section>
    )
  }
}

export default withRouter(Index);
