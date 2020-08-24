import React from 'react'
import deliveryData from '../../API/getData'

class DeliveryData extends React.Component {
    
    state = {response:"fetching"};

    table_header = [];
    table_body = [];

    fetchData = async ()=> {
        this.table_body = []
        this.table_header = []
        var response = await deliveryData.get(`/${this.props.dataRoute}`);
        var num_records = response.data.length;
        if(num_records > 0) {
            var keys = Object.keys(response.data[0]);
            for(var i = 0; i < keys.length; i++) {
                if(keys[i] == '$__v'){
                    continue;
                }
                this.table_header.push(<th>${keys[i]}</th>)
            }
            for(var i = 0; i < num_records; i++) {
                this.table_body.push(<tr />)
                for(var j = 0; j < keys.length; j++) {
                    if(keys[j] == '$__v'){
                        continue;
                    }
                    this.table_body.push(<td>{response.data[i][keys[j]]}</td>)
                }
            }
        }
        else {
            this.table_body = []
            this.table_header = []
        }
        this.setState({response:"fetched"});
    }

    componentDidMount = async ()=> {
        this.fetchData();
    }

    componentDidUpdate = (prevProps)=> {
        if(prevProps.dataRoute !== this.props.dataRoute) {
            this.fetchData()
        }
    }
    
    render() {
        return (
            <div>
                <div className="ui segment raised">
                    <h3 className="ui header">{this.props.dataRoute}</h3>
                </div>
                <div className="ui segment raised">
                    <table class="ui celled table">
                        <thead>
                            <tr>
                                {this.table_header}
                            </tr>
                        </thead>
                        <tbody>
                            {this.table_body}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default DeliveryData;