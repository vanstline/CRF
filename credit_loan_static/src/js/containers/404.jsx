import React, { Component } from 'react'
import { Link } from 'react-router'

export default class Tour extends Component {
  constructor() {
    super();
    this.activeUrl = {
      url: Common.isCrfAppLocal() ? '#goRCSMine' : `#/index?ssoId=${CONFIGS.userId}`
    }
  }
  render() {
    let url = this.activeUrl.url;
    return (
      <div className="center-center-column" style={{height: '100vh'}}>
        {
          Common.isCrfAppLocal()
            ?
            <div></div>
            :
            <span className="font-26">404!页面没有找到，请</span>
        }
        <Link to={url} className="font-36 main-color">返回首页</Link>
      </div>
    )
  }
}
