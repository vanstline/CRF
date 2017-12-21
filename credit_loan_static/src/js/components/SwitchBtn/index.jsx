import React, {Component} from 'react';
import {Switch} from 'antd-mobile';
import styles from '../BindcardForm/index.scss';
import {createForm} from 'rc-form';


let SwitchTab = (props) => {
  const {getFieldProps} = props.form;
  return (
    <div className={styles.infoForm + " subInfoForm " + styles.switchForm}>
      <span className={styles.infoInput + ' ' + styles.repayBtn}>开通自动还款</span>
      <Switch
        {...getFieldProps('Switch1', {
          initialValue: CONFIGS.bindCard.switchStatus,
          valuePropName: 'checked',
        })}
        onClick={(checked) => {
          //props.getSwitchVal(checked);
          CONFIGS.bindCard.switchStatus=checked;
        }}
      />
    </div>
  );
};

const SwitchBtn = createForm()(SwitchTab);

export default SwitchBtn;