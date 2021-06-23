import React from 'react';


export class Message extends React.Component {

    render() {
        return (
            <div className='message-item'>
                {this.props.senderName === this.props.currentUser ? <div>{this.props.currentTime} <b>{this.props.senderName}</b> <img alt="Sent" src="/v.jpg"/><img alt="Read" src="/v.jpg"/> </div> : <div>{this.props.currentTime} <b>{this.props.senderName}</b> </div>}
                
                <span>{this.props.text}</span>
                <br/><br/>
            </div>
        )
    }
}