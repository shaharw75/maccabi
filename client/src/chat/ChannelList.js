import React from 'react';
import { Channel } from './Channel';

const SERVER = "http://127.0.0.1:8080";

export class ChannelList extends React.Component {

    constructor(props){
        super(props);
        this.state = {currentChannel:''};
        this.handleClick = this.handleClick.bind();
       
    }

    handleClick = id => {
        this.props.onSelectChannel(id);
        const channel = this.props.channels.find(c => {
            return c.id === id;
        });
        this.setState({'currentChannel':channel.name});
    }


    render() {

        let list = <div className="no-content-message">There is no channels to show</div>;
        if (this.props.channels && this.props.channels.map) {
            list = this.props.channels.map(c => <Channel key={c.id} id={c.id} name={c.name} participants={c.participants} onClick={this.handleClick} />);
        }
        return (
            <div className='channel-list'>
                <b>Current Channel: {this.state.currentChannel}</b>
                {list}
            </div>);
    }

}