import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  App,
  Home,
  Success,
  AnnualFee,
  AnnualFeeConfirm,
  AnnualFeeResult,
  AnnualGuide,
  ReBindCard,
  SupportCard,
  Repay,
  Loan,
  //HistoryContract,
  Contract,
  LoanConfirm,
  RepayConfirm,
  Result,
  Channel,
  Bill,
  Index,
  Detail,
  Extend,
  ExtendList,
  ExtendDetail,
  ExtendConfirm,
  Member,
  NotFoundPage,
  Letters
} from './containers';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="success" component={Success} />
    <Route path="rebindcard" component={ReBindCard} />
    <Route path="supportcard" component={SupportCard} />
    <Route path="repay" component={Repay} />
    <Route path="loan" component={Loan} />
    <Route path="loanconfirm" component={LoanConfirm} />
    <Route path="repayconfirm" component={RepayConfirm} />
    <Route path="result" component={Result} />
    <Route path="channel" component={Channel} />
    <Route path="bill" component={Bill} />
    <Route path="index" component={Index} />
    <Route path="contract" component={Contract} />
    <Route path="detail" component={Detail} />
    <Route path="extend" component={Extend} />
    <Route path="extendlist" component={ExtendList} />
    <Route path="extenddetail" component={ExtendDetail} />
    <Route path="extendconfirm" component={ExtendConfirm} />
    <Route path="annualfee" component={AnnualFee} />
    <Route path="annualguide" component={AnnualGuide} />
    <Route path="annualfeeconfirm" component={AnnualFeeConfirm} />
    <Route path="annualfeeresult" component={AnnualFeeResult} />
    <Route path="letters" component={Letters} />
    <Route path="member" component={Member} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);

/*
 <Route path="annualfee" component={AnnualFee} />
 <Route path="historycontract" component={HistoryContract} />
import { App } from './containers/App.jsx';
import Home from './containers/Home.jsx';
import Result from './containers/Result.jsx';
import Bill from './containers/Bill.jsx';

const Success = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Success.jsx').default)
    },'Success')
};

const ReBindCard = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/ReBindCard.jsx').default)
    },'ReBindCard')
};
const SupportCard = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/SupportCard.jsx').default)
    },'SupportCard')
};
const Repay = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Repay.jsx').default)
    },'Repay')
};
const Loan = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Loan.jsx').default)
    },'Loan')
};
const LoanConfirm = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/LoanConfirm.jsx').default)
    },'LoanConfirm')
};
const RepayConfirm = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/RepayConfirm.jsx').default)
    },'RepayConfirm')
};
/!*const Result = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Result.jsx').default)
    },'Result')
};*!/
const Channel = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Channel.jsx').default)
    },'Channel')
};
/!*const Bill = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Bill.jsx').default)
    },'Bill')
};*!/
const Index = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Index.jsx').default)
    },'Index')
};
const Contract = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Contract.jsx').default)
    },'Contract')
};
const Detail = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/Detail.jsx').default)
    },'Result')
};
const NotFoundPage = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./containers/404.jsx').default)
    },'NotFoundPage')
};

export default (
  <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="success" getComponent={Success} />
      <Route path="rebindcard" getComponent={ReBindCard} />
      <Route path="supportcard" getComponent={SupportCard} />
      <Route path="repay" getComponent={Repay} />
      <Route path="loan" getComponent={Loan} />
      <Route path="loanconfirm" getComponent={LoanConfirm} />
      <Route path="repayconfirm" getComponent={RepayConfirm} />
      <Route path="result" component={Result} />
      <Route path="channel" getComponent={Channel} />
      <Route path="bill" component={Bill} />
      <Route path="index" getComponent={Index} />
      <Route path="contract" getComponent={Contract} />
      <Route path="detail" getComponent={Detail} />
      <Route path="*" getComponent={NotFoundPage} />
  </Route>
);
<<<<<<< HEAD
*/
