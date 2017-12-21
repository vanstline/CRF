const CurrentPath = '/h5_dubbo/';

const isWeChat = Common.isWeChat();
const kissoId = Common.returnKissoID();
const referrerUrl = Common.returnReferrerUrl();
const adapt = Common.isAdapt();
const showTopTips = Common.showTopTips();
const backPath = Common.getReturnUrl();
const isCrfApp = Common.isCrfAppLocal();
const isR360 = Common.isR360Local();
const isXYF = Common.isXYFLocal();
const isYouBaiLocal = Common.isYouBaiLocal();
const isAppSmallChange = Common.isAppSmallChange();
let allToken = Common.getAllToken();

let productNo = allToken.productNo;
let entranceNo = allToken.deviceType;
if (isXYF || isYouBaiLocal) {
  !productNo && (productNo = localStorage.getItem('productNo'));
  !entranceNo && (entranceNo = localStorage.getItem('deviceType'));
}

module.exports = {
  basePath: CurrentPath,
  repayPath: CurrentPath + 'repayment',
  loanPath: CurrentPath + 'loan',
  extendPath: CurrentPath + 'extPer',
  ftsPath: CurrentPath +'fts',
  productPath: CurrentPath + 'product',
  contractPath: CurrentPath + 'contract',
  protocolPath: CurrentPath + 'protocol',
  associatorPath: CurrentPath + 'associator',
  apiPath: CurrentPath + 'api',
  couponPath: '/campaign/award/',
  consumptionPath: '/consumptionLoan/',
  backPath: backPath,
  isR360: isR360,
  isCrfApp: isCrfApp,
  isXYF: isXYF,
  isYouBaiLocal: isYouBaiLocal,
  isAppSmallChange: isAppSmallChange,
  userId: '',//用户ID
  userName: '',//用户名
  crfUid: null,//uid
  idNo: '', //身份证
  ssoId: kissoId,
  isWeChat: isWeChat,
  referrerUrl: referrerUrl,
  adapt: adapt,
  showTopTips: showTopTips,
  isReload: false,
  currentPath: '',
  bindCard:{
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
  },
  isFromCredit: false,
  isFromLoan: false,
  isFromOther: false,
  user: {},
  sendSmsType: null,
  type: {
    s: 4,
    p: 4,
    r: 5
  },
  phone: null,
  csPhone: 4009699559,
  billStatus: {
    1: '借款中',
    2: '还款中',
    3: '借款成功',
    4: '还款成功',
    5: '借款失败',
    6: '还款失败',
    7: '展期中',
    8: '展期失败',
    9: '展期成功'
  },
  billType: {
    s: '消费',
    p: '借款',
    r: '还款'
  },
  repayType: {
    1: '快捷还款',
    2: '微信还款',
    3: '自动还款'
  },
  userWritePhoneRegx: /^1\d{10}$/,// /^1([358]\d|7[^017])\d{8}$/
  userWriteThreeDigits: /^1([358]\d|7[^017])/,
  chineseCharRegx: /[\u0391-\uFFE5]+/,
  chinaMobileRegx: /^1(3[4-9]|5[012789]|8[23478]|4[7]|7[8])\d{8}$/, //中国移动
  chinaUnionRegx: /^1(3[0-2]|5[56]|8[56]|4[5]|7[6])\d{8}$/, //中国联通
  chinaTelcomRegx: /^1(3[3])|(8[019])\d{8}$/, //中国电信
  otherTelphoneRegx: /^1(7[0678])\d{8}$/, //其他运营商
  mobileFormartRegx: /^(\d{3})(\d{4})(\d{4})$/,
  phoneFormartRegx: /^(\d{3})(\d{3})(\d{4})$/,
  mobileHiddenRegx: /^(\d{3})\d{4}(\d{4})$/,
  iosRegx: /\(i[^;]+;( U;)? CPU.+Mac OS X/,
  repayDefaultTitle: '应还金额(元)',
  repayChangedTitle: '实还金额(元)',
  rulerData: [],
  couponData: [],
  selectCoupon: null,
  repayData: {},
  loanData: {
    isAgree: true,
    amount: 0,
    day: 0,
    period: 0,
    currentAmountCount: 0,
    sendSwitch: true,
    touchEndDay: 0,
    dragDay: 0,
    dayArrayLength: 0,
  },
  currentAmount: 0,
  realAmount: 0,
  forbidAmount: Number.MAX_SAFE_INTEGER,
  account: {},
  method: {},
  loanPeriod: {},
  loanUseData: [],
  loanUseIndex: null,
  newLoanPeriod: {},
  campaignCode: '',
  repayStatus: {
    Y: '可结清',
    N: '部分结清'
  },
  resultDetail: {
    s: {
      'HF': {
        'default': '话费充值一般2小时内到账（月初月末高峰期，24小时内到账均属正常情况），请耐心等待。如有疑问，请联系客服。',
        'success': '话费充值一般2小时内到账（月初月末高峰期，24小时内到账均属正常情况），请耐心等待。如有疑问，请联系客服。',
        'failed': '对不起, 交易失败了, 请您稍后重试哦'
      },
      'LL': {
        'default': '充值预计10分钟到账（月初月末高峰期，24小时内到账均属正常情况），请留意短信提醒。如有疑问，请联系客服。',
        'success': '充值预计10分钟到账（月初月末高峰期，24小时内到账均属正常情况），请留意短信提醒。如有疑问，请联系客服。',
        'failed': '对不起, 交易失败了, 请您稍后重试哦'
      },
      'YX': {
        'default': '充值预计10分钟到账，请留意短信提醒。如有疑问，请联系客服。',
        'success': '充值预计10分钟到账，请留意短信提醒。如有疑问，请联系客服。',
        'failed': '对不起, 交易失败了, 请您稍后重试哦'
      },
      'QB': {
        'default': '充值预计10分钟到账，请留意短信提醒。如有疑问，请联系客服。',
        'success': '充值预计10分钟到账，请留意短信提醒。如有疑问，请联系客服。',
        'failed': '对不起, 交易失败了, 请您稍后重试哦'
      }
    },
    p: {
      'default': '预计3分钟到达银行卡, 部分银行可能延迟, 以实际到账时间为准',
      'success': '预计3分钟到达银行卡, 部分银行可能延迟, 以实际到账时间为准',
      'failed': '对不起, 借款失败了, 请您稍后重试'
    },
    r: {
      'default': '还款当日到账(最晚24:00), 部分银行可能出现延迟, 最终以银行到账时间为准',
      'success': '还款当日到账(最晚24:00), 部分银行可能出现延迟, 最终以银行到账时间为准',
      'failed': '对不起, 还款失败了, 请您稍后重试'
    },
    e: {
      'default': '',
      'success': '',
      'failed': '很抱歉，展期失败，请稍后尝试。'
    },
    f: {
      'default': '会员期内享受更优质的借款服务',
      'success': '',
      'failed': ''
    }
  },
  feeResultText: {
    'default': '如支付失败，需重新购买会员资',
    'success': '',
    'failed': ''
  },
  defaultScale: 5000,
  deviceType: 'H5_24',//entranceNo || 'H5_24',
  onlyDayArray: [14, 30, 60],
  productNo: productNo || 'P2001002',
  defaultNumberDays: 30,
  extendDate: {
    interest: '前期利息',
    poundage: '前期延迟还款服务费',
    fee: '前期手续费',
    overhead: '展期管理费'
  },
  extendData: [],
  annualFeeProduct: [],
  annualCampaign: {},
  feeResultDes: {
    'UNKNOWN': '返回首页',
    'FAIL': '重新支付',
    'SUCCESS': '立即抽奖'
  },
  memberType: {
    '0': '非会员',
    '12800': '黄金',
    '19800': '白金',
    '39800': '钻石'
  },
  memberIcon: {
    '0': 'default',
    '1': 'gold',
    '2': 'platinum',
    '3': 'diamond'
  },
  orderStatus: {
    'FAIL': '支付失败',
    'UNKNOWN': '支付中',
    'SUCCESS': '支付成功'
  }
};
