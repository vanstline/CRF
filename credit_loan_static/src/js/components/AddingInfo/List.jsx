import React, { Component } from 'react';
import styles from './index.scss';

export default class List extends Component {

    constructor(props) {
        super(props)

    }



    render() {

        return (
            <div>
                <ul className={this.props.className}>
                    {
                        this.props.data.map( (item, index) => {
                            return (
                                <li
                                    key={index}
                                    className={item.isActive ? styles.active : ''}
                                    onClick={ () => this.props.Click(item,this.props.data) }
                                >{item.classes}</li>
                            )
                        })
                    }
                </ul>

            </div>
        )
    }
}
