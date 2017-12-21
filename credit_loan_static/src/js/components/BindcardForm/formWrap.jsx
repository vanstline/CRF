import React, {Component} from 'react';
import styles from './index.scss';
import {withRouter } from 'react-router';

import CityWrapper from '../SelectCity/index.jsx';

import {Toast} from 'antd-mobile';

import PubSub from 'pubsub-js';


class FormWrap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cardBinData: null,
      refFormNextBtn: {},
    };
  }

  componentWillMount() {
    //获取对应数据
    this.requireJson();

    //pubsub
    this.pubsub_token = PubSub.subscribe('bindCard:ele', (topic, val) => {
      //设置
      this.setState({ refFormNextBtn:val });
      //console.log(val);
    });

    //从失败页面返回需要刷新页面
    //const ln=location;
    if (CONFIGS.isReload) {

      CONFIGS.isReload = false;
      CONFIGS.bindCard = {
        bankName: '',//银行卡名字
          bankNum: '',//银行卡号码basePath
          contractName: '',//协议名字
          contractUrl: '',//协议地址
          cityCode: '',//城市编号
          areaCode: '',//区域编号
          phoneNum: '',//手机号
          switchStatus: true,
          isAgree: true,
          notSubmit: true,
          bankCode: '',//银行代码 如：PAB
          bankCardNumStatus: false,//判断银行卡是否正确
          phoneNumStatus: false,//判断手机号是否正确
          showSupportCard: false,
          showErrorMsg: false,
          showTelErrMsg: false,
          sendCount: 1,
      };
      /*console.log(ln.href);
      console.log(CONFIGS.referrerUrl);
      ln.href=ln.href+'?'+CONFIGS.referrerUrl;
      ln.reload();*/
    }
  }

  componentWillUnmount() {
    //销毁监听的事件
    PubSub.unsubscribe(this.pubsub_token);
  }

  componentDidMount() {
    //输入银行卡号
    const refBankCard = this.refs.refBankCard;
    const refBankCardClear = this.refs.refBankCardClear;
    const refBankName = this.refs.refBankName;

    //向父组件传递ref
    this.props.getFormEle(refBankCard);

    //银行卡号
    refBankCard.onkeyup= (e) => {

      if (refBankCard.value.length > 0) {
        refBankCardClear.classList.remove('n');
      } else {
        refBankCardClear.classList.add('n');
      }
      this.bankNumInput(e);
    };

    refBankCard.onfocus= () => {
      if (refBankCard.value.length > 0) {
        refBankCardClear.classList.remove('n');
      }
    };

    refBankCard.onblur= (e) => {
      setTimeout(() => {//解决与click冲突问题
        refBankCardClear.classList.add('n');
        this.bankNumBlur(e);
      },100);
    };

    refBankCardClear.onclick= () => {
      refBankCard.value = '';
      refBankCardClear.classList.add('n');

      this.refs.refBankError.classList.add('n');//隐藏银行卡错误提示
      this.refs.refSupportCard.classList.add('n');//隐藏支持银行div

      refBankName.value = '银行';//所属银行名字变回‘银行’
      refBankName.classList.add(styles.disabled);//所属银行字体变灰

      CONFIGS.bindCard.showErrorMsg = false;//是否显示错误信息
      CONFIGS.bindCard.showSupportCard = false;//记录是否显示支持卡号

      CONFIGS.bindCard.bankNum = '';//清空银行卡

      CONFIGS.bindCard.bankCardNumStatus = false;
      this.props.removeDisabled();
    };
  }

  async checkCardFetch(val) {

    let cardNo = val.replace(/\s/g,'');
    //let checkCardUrl = CONFIGS.basePath+'fcp/cardInfo/?cardNo='+cardNo+'&kissoId='+CONFIGS.ssoId;
    let checkCardUrl = `${CONFIGS.basePath}fcp/cardInfo/?cardNo=${cardNo}&kissoId=${CONFIGS.ssoId}`;

    const refBankName = this.refs.refBankName;
    const refSupportCard = this.refs.refSupportCard;
    const refBankError = this.refs.refBankError;

    try {

      let fetchPromise = CRFFetch.Get(checkCardUrl);

      //显示loading图片
      this.props.setLoading(true);

      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {

        //隐藏loading图片
        this.props.setLoading(false);

        CONFIGS.bindCard.bankCode = result.bankCode;

        if (result.prcptcd === '1') {
          //{"bankCode":"BOHLD","prcptcd":"1","bankName":"葫芦岛银行","cardType":"2","consultationPhone":null,"singleLimint":null,"dayLimint":null,"monthLimint":null}
          if (result.bankCode === null) {
            //卡号错误
            refBankName.classList.add(styles.disabled);//所属银行字体变灰
            refSupportCard.classList.add('n');//隐藏支持银行div
            refBankError.classList.remove('n');//提示银行卡号错误
          } else {
            //卡号不支持
            refBankError.classList.add('n');//隐藏银行卡号错误
            refSupportCard.classList.remove('n');//显示支持银行div
          }

          CONFIGS.bindCard.bankCardNumStatus = false;
          CONFIGS.bindCard.showErrorMsg = true;
          this.state.refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰

        } else if (result.prcptcd==='0') {
          refBankError.classList.add('n');//隐藏银行卡号错误
          refSupportCard.classList.add('n');//隐藏支持银行div
          refBankName.classList.remove(styles.disabled);//所属银行字体变黑
          CONFIGS.bindCard.bankCardNumStatus = true;
          this.props.removeDisabled();

          CONFIGS.bindCard.showErrorMsg = false;//是否显示错误信息
        }

        refBankName.value = result.bankName || '银行';
        CONFIGS.bindCard.bankName = result.bankName;

        CONFIGS.bindCard.showSupportCard = false;//记录是否显示支持卡号

        /*
         * bankCode:"CMB"
         bankName:"招商银行"
         cardType:"2"
         consultationPhone:null
         dayLimint:null
         monthLimint:null
         prcptcd:"0"
         singleLimint:null
         */
      }
    } catch (err) {
      //隐藏loading图片
      this.props.setLoading(false);

      CRFFetch.handleError(err, Toast, () => {
        if (err.response.status === 400) {
          //{"code":"0000","message":"请输入正确的银行卡信息"}
          err.body.then(data => {
            Toast.info(data.message);

            //卡号错误
            refBankName.classList.add(styles.disabled);//所属银行字体变灰
            refSupportCard.classList.add('n');//隐藏支持银行div
            refBankError.classList.remove('n');//提示银行卡号错误
            CONFIGS.bindCard.bankCardNumStatus = false;
          });
        }
      });
    }
  }

  async sendLocationFetch(storageName, version) {
    //let getContractUrl='../../../json/cardBin.json';
    //let getJsonUrl = location.origin + '/credit_loan/json/cardBin.json';
    let getJsonUrl = `${location.origin}/credit_loan/json/cardBin.json`;

    try {

      let fetchPromise = CRFFetch.Get(getJsonUrl);

      // 获取数据
      let result = await fetchPromise;

      if (result && !result.response) {
        localStorage.setItem('CRF_' + storageName, JSON.stringify(result));

        this.setState({ cardBinData: result });

        localStorage.setItem('CRF_' + version, VERSION.cardBinVERSION);
      }
    } catch (err) {
      CRFFetch.handleError(err,Toast);
    }
  }

  requireJson() {
    let storageName = 'cardBinData';
    let version = 'cardBinVersion';

    let allData = JSON.parse(localStorage.getItem('CRF_' + storageName)) || [];
    let checkVersion = VERSION.cardBinVERSION != localStorage.getItem('CRF_' + version);

    if ( !allData[0] || checkVersion ) {
      this.sendLocationFetch(storageName,version);
    } else {
      this.setState({ cardBinData: allData });
    }
  }

  bankNumBlur(e) {
    let currentVal = e.target.value.replace(/\D/g,'');
    if (currentVal.length >= 12 && currentVal.length < 16) {
      this.checkCardFetch(currentVal);
    }
  }

  bankNumInput(e) {
    const refBankName = this.refs.refBankName;
    const refBankError = this.refs.refBankError;
    const refSupportCard = this.refs.refSupportCard;
    const refFormNextBtn = this.state.refFormNextBtn;
    const refBankCard = this.refs.refBankCard;

    let currentVal = e.target.value.replace(/\D/g,'');
    let cardBindArr = this.state.cardBinData;

    let notCardNum = true;

    if (e.keyCode == 8) {
      let targetVal = e.target.value;

      if (/\s/.test(targetVal.charAt(targetVal.length-1))) {
        refBankCard.value = targetVal.substring(0,targetVal.length-1);
      }

      if (targetVal.replace(/\s/g,'').length < 12) {
        refBankError.classList.add('n');//隐藏银行卡错误提示
        //refSupportCard.classList.add('n');//隐藏支持银行div
      }
    }

    CONFIGS.bindCard.bankNum = refBankCard.value;

    /*if((e.which >= 48 && e.which <= 57) ||(e.which >= 96 && e.which <= 105 )){
      let v = e.target.value;
      if(/\S{5}/.test(v)){
        e.target.value = v.replace(/\s/g, '').replace(/(.{4})/g, "$1 ");
      }
    }*/

    if (e.keyCode != 8) {

      refBankCard.value = currentVal.replace(/(\d{4})/g, '$1 ');


      if (currentVal.length === 6) {

        for(let i = 0; i < cardBindArr.length; i++){
          if (currentVal == cardBindArr[i][0]) {
            refBankName.value = cardBindArr[i][2];
            CONFIGS.bindCard.bankName = refBankName.value;
            refBankName.classList.remove(styles.disabled);//所属银行字体变黑
            refBankError.classList.add('n');//隐藏银行卡错误提示
            notCardNum = false;//表示卡号不在卡bin里
            break;
          }
        }

        if (notCardNum) {
          refBankName.value = '银行';//所属银行名字变回‘银行’
          refBankName.classList.add(styles.disabled);//所属银行字体变灰
          refSupportCard.classList.remove('n');//显示支持银行div
          refBankError.classList.add('n');//隐藏银行卡错误提示

          CONFIGS.bindCard.showSupportCard=true;//记录是否显示支持卡号
        }

      }
      if (currentVal.length >= 16) {//输入大于12位，然后停顿1秒，认为用户已经输入完，发请求到后端确认这个银行卡号是否正确
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.checkCardFetch(currentVal);
        }, 1000);
      }

    }


    if (e.target.value.length <= 6) {
      clearTimeout(this.timer);
      refBankError.classList.add('n');//隐藏银行卡错误提示
      refSupportCard.classList.add('n');//隐藏支持银行div

      refBankName.value = '银行';//所属银行名字变回‘银行’
      refBankName.classList.add(styles.disabled);//所属银行字体变灰

      refFormNextBtn.classList.add(styles.btnDisabled);//提交按钮置灰

      CONFIGS.bindCard.showSupportCard = false;//记录是否显示支持卡号
      CONFIGS.bindCard.showErrorMsg = false;
    }
  }

  setCitySelect(val) {
    CONFIGS.bindCard.cityCode = val[0];
    CONFIGS.bindCard.areaCode = val[1];
    this.props.removeDisabled();
  }

  checkSupport() {
    _paq.push(['trackEvent', 'C_BindCard', 'E_BindCard_checkCard', '查看支持银行卡']);

    //跳转
    this.props.router.push('supportcard');
  }

  render() {

    const userName = `*${this.props.setUserName.substring(1)}`;
    const isBankName = CONFIGS.bindCard.bankName === '银行' || CONFIGS.bindCard.bankName === '';

    let hideClass = CONFIGS.bindCard.showSupportCard ? '' : 'n';
    let errorClass = CONFIGS.bindCard.showErrorMsg ? '' : 'n';

    return (
      <div className={styles.infoForm}>
        <div className={styles.formInput}>
          <div className={styles.borderLine+' borderLine'}>
            <input type="button" className={styles.userName} value={userName} />
          </div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.borderLine+' borderLine'}>
            <input type="tel" className={styles.bankCard} placeholder="请输入银行卡号" defaultValue={CONFIGS.bindCard.bankNum||""} maxLength="23" ref="refBankCard"/>
          </div>
          <div className={styles.errorInfo + " "+hideClass} ref="refSupportCard">
            暂不支持此卡, 请查看<a href="javascript:void(0);" onClick={this.checkSupport.bind(this)}>支持银行卡</a>
          </div>
          <div className={styles.errorInfo + " color-FA4548 " + errorClass} ref="refBankError">您输入的银行卡号有误</div>
          <div className="clearVal n" ref="refBankCardClear"><div className="clearInput"><span className="closeBtn">x</span></div></div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.borderLine+' borderLine'}>
            <input type="button" className={(isBankName?styles.disabled:"") + " " + styles.bank} defaultValue={CONFIGS.bindCard.bankName||"银行"} ref="refBankName"/>
          </div>
        </div>
        <div className={styles.formInput}>
          <CityWrapper getSelectVal={this.setCitySelect.bind(this)}/>
        </div>
      </div>
    );
  }
}


export default withRouter(FormWrap);