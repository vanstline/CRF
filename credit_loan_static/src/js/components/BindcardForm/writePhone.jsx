import React, {Component} from 'react';
import styles from './index.scss';
import PubSub from 'pubsub-js';

class WritePhone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setUserTelNumber: '',
    };
  }

  componentWillMount() {
    //pubsub
    this.pubsub_token = PubSub.subscribe('userPhone:val', (topic, val)=> {
      //设置
      this.setState({ setUserTelNumber: val });
      //console.log(val);
    });
  }

  componentDidMount() {

    const refTelInput = this.refs.refTelInput;
    const refPhoneClear = this.refs.refPhoneClear;

    if (refTelInput) {
      //向父组件传递ref
      this.props.getWritePhoneEle(refTelInput);

      this.bindEvent(refTelInput, refPhoneClear);
    }
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  bindEvent(refTelInput, refPhoneClear) {
    //输入手机号码
    refTelInput.oninput = (e) => {
      if (refTelInput.value.length > 0) {
        refPhoneClear.classList.remove('n');
      } else {
        refPhoneClear.classList.add('n');
      }
      this.telRegex(e);
    };

    refTelInput.onblur = (e) => {
      setTimeout(() => {//解决与click冲突问题
        refPhoneClear && refPhoneClear.classList.add('n');
        this.telBlur(e);
      }, 80);
    };

    refTelInput.onfocus = () => {
      if (refTelInput.value.length > 0 && refPhoneClear) {
        refPhoneClear.classList.remove('n');
      }
    };

    refPhoneClear && (refPhoneClear.onclick = () => {
      refTelInput.value = '';
      refPhoneClear.classList.add('n');

      this.refs.refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
      CONFIGS.bindCard.showTelErrMsg = false;
      CONFIGS.bindCard.phoneNumStatus = false;
      this.props.removeDisabled();
    });
  }

  telRegex(e) {
    let refTelErrorMsg = this.refs.refTelErrorMsg;

    let currentVal = e.target.value;
    CONFIGS.bindCard.phoneNum = currentVal;

    if (currentVal.length === 1 && currentVal !== '1') {
      refTelErrorMsg.classList.remove('n');//显示手机号错误提示
      CONFIGS.bindCard.showTelErrMsg = true;
      return;
    }

    if (currentVal.length === 11) {
      if (CONFIGS.userWritePhoneRegx.test(e.target.value)) {
        CONFIGS.bindCard.phoneNumStatus = true;
        this.props.removeDisabled();
        if (!refTelErrorMsg.classList.contains('n')) {
          refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
          CONFIGS.bindCard.showTelErrMsg = false;
        }
      } else {
        CONFIGS.bindCard.phoneNumStatus = false;
        this.props.removeDisabled();
        refTelErrorMsg.classList.remove('n');//显示手机号错误提示
        CONFIGS.bindCard.showTelErrMsg = true;
      }
    } else {
      CONFIGS.bindCard.phoneNumStatus = false;
      CONFIGS.bindCard.showTelErrMsg = false;
      this.props.removeDisabled();
      refTelErrorMsg.classList.add('n');//隐藏手机号错误提示
    }

  }

  telBlur(e) {
    if (e.target.value.length < 11 && e.target.value.length > 0) {
      this.refs.refTelErrorMsg.classList.remove('n');
      CONFIGS.bindCard.showTelErrMsg = true;
    }
  }

  render() {
    let hideClass = CONFIGS.bindCard.showTelErrMsg ? '' : 'n';

    let defaultPhoneNum = this.state.setUserTelNumber;

    let lineHeight = { lineHeight: 'normal' };//for Coolpad htc gionee

    let phoneInput = () => {
      if (defaultPhoneNum) {
        return <input type="button" className={styles.infoInput + ' ' + styles.userPhone}
                      defaultValue={defaultPhoneNum}/>;
      } else {
        return <input type="tel" className={styles.infoInput + ' ' + styles.userPhone} placeholder="请输入该银行卡预留的手机号"
                      defaultValue={CONFIGS.bindCard.phoneNum} maxLength="11" style={lineHeight} ref="refTelInput"/>;
      }
    };

    let clearBtn = () => {
      if (defaultPhoneNum) {
        return <div></div>;
      } else {
        return <div className="telInput clearVal n" ref="refPhoneClear">
          <div className="clearInput"><span className="closeBtn">x</span></div>
        </div>;
      }
    };
    //console.log(defaultPhoneNum);
    return (
      <div className={styles.infoForm + " subInfoForm " + styles.telInput}>
        {phoneInput()}
        {clearBtn()}
        <div className={styles.errorInfo + " color-FA4548 " + hideClass} ref="refTelErrorMsg">请输入正确的手机号</div>
      </div>
    );
  }
}


export default WritePhone;