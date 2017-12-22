import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Nav, AddingInfo, Loading } from 'app/components';
import { WhiteSpace } from 'antd-mobile';


class IndustryIncome extends Component {

    constructor(props) {
        super(props);

        this.state = {
            IndustryInfo: [
                {
                    classes: '农、林、牧、渔业',
                    isActive: true
                },
                {
                    classes: '采矿业',
                    isActive: false
                },
                {
                    classes: '制造业',
                    isActive: false
                },
                {
                    classes: '电力、热力、燃气、及水生产和供应',
                    isActive: false
                },
                {
                    classes: '建筑业',
                    isActive: false
                },
                {
                    classes: '批发和零售业',
                    isActive: false
                },
                {
                    classes: '交通运输、仓储和邮政业',
                    isActive: false
                },
                {
                    classes: '住宿和餐饮业',
                    isActive: false
                },
                {
                    classes: '信息传输、软件和信息技术服务业',
                    isActive: false
                },
                {
                    classes: '金融业',
                    isActive: false
                },
                {
                    classes: '房地产业',
                    isActive: false
                },
                {
                    classes: '租赁和商务服务业',
                    isActive: false
                },
                {
                    classes: '科学研究和技术服务业',
                    isActive: false
                },
                {
                    classes: '水利、环境和公共设施管理业',
                    isActive: false
                },
                {
                    classes: '居民古文、修理和其他服务业',
                    isActive: false
                },
                {
                    classes: '教育',
                    isActive: false
                },
                {
                    classes: '卫生和社会工作',
                    isActive: false
                },
                {
                    classes: '文化、体育和娱乐业',
                    isActive: false
                },
                {
                    classes: '公共管理、社会保障和社会组织',
                    isActive: false
                },
                {
                    classes: '国际组织',
                    isActive: false
                }
            ],
            Income: [
                {
                    classes: '2000以下',
                    isActive: true
                },
                {
                    classes: '2000~4000',
                    isActive: false
                },
                {
                    classes: '4000~6000',
                    isActive: false
                },
                {
                    classes: '6000以上',
                    isActive: false
                }
            ]
        }
    }

    render() {
        let prop = { title: '补充信息', stage: 'industryIncome' };

        return(
            <section >
                <Nav data={prop} />
                {/* <WhiteSpace /> */}
                <AddingInfo data={this.state}/>
            </section>
        )
    }
}

export default withRouter(IndustryIncome)
