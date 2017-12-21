

// import './index.scss'
import React, { Component } from 'react';
import styles from './index.scss';

export default class  AddingInfo extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        console.log(this.props);

        let { IndustryInfo, Income } = this.props.data;

        console.log(IndustryInfo, Income);
        return (
            <div className={styles.addingInfo}>
                <div className='industry'>
                    <h3>您当前所属行业</h3>
                    <ul className={styles.industryList}>
                        {
                            IndustryInfo.map( (item, index) => {
                                return (
                                    <li
                                        key={index}
                                        className={item.isActive ? styles.active : ''}
                                    >{item.industry}</li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className={styles.income}>
                    <h3>您当前薪资 / 月</h3>
                    <ul className={styles.incomeList}>
                        {
                            Income.map( (item, index) => {
                                return (
                                    <li
                                        key={index}
                                        className={item.isActive ? styles.active : ''}
                                    >{item.income}</li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div className={styles.button} >提交</div>
            </div>
        )
    }
}
