

// import './index.scss'
import React, { Component } from 'react';
import List from './List.jsx';
import styles from './index.scss';

export default class  AddingInfo extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: this.props.data
        };

        this.onHandlerClick = this.onHandlerClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    onHandlerClick(e, data){
        // console.log(e, data);
        data = data.map( item => {
            if(item.classes == e.classes) {
                item.isActive = true;
            } else {
                item.isActive = false
            }
        })
        this.setState({
            data: Object(this.state.data, data)
        })
    }

    onSubmit() {
        let Income = null;
        let IndustryInfo = null;

        IndustryInfo = this.state.data.IndustryInfo.filter( item => {
            if( item.isActive){
                return true;
            }
        });
        Income = this.state.data.Income.filter( item => {
            if( item.isActive){
                return true;
            }
        });
        console.log('职业是:' + IndustryInfo[0].classes + '\n\n' + '收入:' + Income[0].classes);
    }
    render() {

        return (
            <div className={styles.addingInfo}>
                <div className='industry'>
                    <h3>您当前所属行业</h3>
                    <List
                        data={this.state.data.IndustryInfo}
                        Click={this.onHandlerClick}
                        className=''
                    />

                </div>
                <div className={styles.income}>
                    <h3>您当前薪资 / 月</h3>
                    <List
                        data={this.state.data.Income}
                        Click={this.onHandlerClick}
                        className={styles.incomeList}
                    />
                </div>
                <div
                    className={styles.button}
                    onClick={this.onSubmit}
                >提交</div>
            </div>
        )
    }
}
