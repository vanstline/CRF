import React from 'react';
//import styles from './index.scss';

class LoadingIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div className="line-spin-fade-loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}

export default LoadingIcon;
