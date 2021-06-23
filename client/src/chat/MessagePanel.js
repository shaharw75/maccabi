import React from 'react';
import { Message } from './Message';

export class MessagesPanel extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { input_value: '' };    
    }
    
    // Send a new text to the server
    send = () => {
        if (this.state.input_value && this.state.input_value !== '') {
            this.props.onSendMessage(this.props.channel.id, this.state.input_value);
            this.setState({ input_value: '' });
        }
    }
    
    // Save the new text to state
    handleInput = e => {
        this.setState({ input_value: e.target.value });
    }

    render() {

        let list = <div className="no-content-message">No Messages</div>;
        if (this.props.channel && this.props.channel.messages) {
            list = this.props.channel.messages.map(m => <Message key={m.id} id={m.id} senderName={m.senderName} text={m.text} currentTime={m.currentTime} currentUser={this.props.currentUser} />);
        }
        return (
            <div className='messages-panel'>
                <div className="messages-list">{list}</div>
                {this.props.channel &&
                    <div className="messages-input">
                        <input type="text" onChange={this.handleInput} value={this.state.input_value} />
                        <button onClick={this.send}>Send</button>
                    </div>
                }
            </div>);
    }

}