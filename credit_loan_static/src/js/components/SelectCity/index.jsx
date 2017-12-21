import React, {Component} from 'react';
import {Picker, List, Toast} from 'antd-mobile';
import {createForm} from 'rc-form';



class SelectCity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentWillMount() {
    this.requireJson();
  }

  componentDidMount() {
    //this.props.getElMethod(this.refs.refPicker);
  }

  requireJson() {
    let storageName = 'provinceData';
    let version = 'cityDataVersion';
    let allData = JSON.parse(localStorage.getItem('CRF_'+storageName));

    if ((!allData) || VERSION.cityDataVERSION != localStorage.getItem('CRF_'+version)) {

      this.sendLocationFetch(storageName, version);

    } else {

      this.setState({
        data: allData
      });
    }
  }

  async sendLocationFetch(storageName, version){
    //let getContractUrl='../../../json/cardBin.json';
    let getJsonUrl = location.origin+'/credit_loan/json/result.json';

    try {

      let fetchPromise = CRFFetch.Get(getJsonUrl);

      // 获取数据
      let result = await fetchPromise;
      //console.log(result);
      if (result && !result.response) {
        localStorage.setItem('CRF_' + storageName, JSON.stringify(result));

        this.setState({
          data: result
        });

        localStorage.setItem('CRF_' + version, VERSION.cityDataVERSION);
      }
    } catch (err) {
      CRFFetch.handleError(err, Toast);
    }
  }

  onPickerChange(val) {
    this.props.getSelectVal(val);
    /*console.log(this.props);*/
  }

  render() {
    let district = this.state.data;
    const {getFieldProps} = this.props.form;

    //默认位置
    //const defaultCode={initialValue: [CONFIGS.bindCard.cityCode, CONFIGS.bindCard.areaCode]};
    let defaultCode;
    if (CONFIGS.bindCard.cityCode === '' && CONFIGS.bindCard.areaCode === '') {
      defaultCode = {initialValue: []};
    } else {
      defaultCode = {initialValue: [CONFIGS.bindCard.cityCode, CONFIGS.bindCard.areaCode]};
    }

    return (<div>
      <List className="picker-list">
        <Picker cols="2" extra="开户行所在地" data={district} title="选择地区"
                onPickerChange={this.onPickerChange.bind(this)} {...getFieldProps('district',defaultCode)} >
          <List.Item arrow="horizontal">位置</List.Item>
        </Picker>
      </List>
    </div>);
  }
}

const CityWrapper = createForm()(SelectCity);

export default CityWrapper;