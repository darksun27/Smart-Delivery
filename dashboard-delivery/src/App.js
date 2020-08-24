import React from 'react';
import './App.css';
import SideBar from './Components/Sidebar'
import DeliveryData from './Components/DeliveryData'

class App extends React.Component {

  state = {tab:"FREE_BOXES"}

  onClickHandler = (tab)=> {
    console.log(tab)
    this.setState({tab:tab})
  }

  render() {
    return (
      <div className = 'content'>
        <SideBar onClickHandler={this.onClickHandler}/>
        <div className = 'center'>
          <div></div>
          <div><DeliveryData dataRoute = {this.state.tab} /></div>
          <div></div>
        </div>
      </div>
    );
  } 
}

export default App;
