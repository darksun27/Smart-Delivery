import React from 'react'
import './index.css'

class SideBar extends React.Component {

    clickHandler = (option)=> {
        console.log(option);
        this.props.onClickHandler(option)
    }

    render() {
        return (
            <div className = 'sidebar-settings'>
                <div className="ui left vertical menu inverted">
                    <div className="item" onClick = {event => {this.clickHandler("FREE_RIDERS")}}>Free Riders</div>
                    <div className="item" onClick = {event => {this.clickHandler("FREE_BOXES")}}>Free Boxes</div>
                    <div className="item" onClick = {event => {this.clickHandler("ONGOING_ORDERS")}}>Ongoing Deliveries</div>
                    <div className="item" onClick = {event => {this.clickHandler("COMPLETED_ORDERS")}}>Completed Orders</div>
                    <div className="item" onClick = {event => {this.clickHandler("TAMPERED_ORDERS")}}>Tampered Orders</div>
                </div>
            </div>
      );
    }
}

export default SideBar;