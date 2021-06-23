import React from 'react';
import { ChannelList } from './ChannelList';
import './chat.scss';
import { MessagesPanel } from './MessagePanel';
import socketClient from "socket.io-client";
const SERVER = "http://127.0.0.1:8080";

export class Chat extends React.Component {

    state = {
        channels: null,
        socket: null,
        channel: null
    }
    
    socket; // the socket client
    
    componentDidMount() {
        this.loadChannels();
        this.configureSocket();
    }
    
    // Socket client configuration
    configureSocket = () => {
        
        var socket = socketClient(SERVER);
        
        // select channel
        socket.on('connection', () => {
            if (this.state.channel) {
                this.handleChannelSelect(this.state.channel.id);
            }
        });
        
        // Update the channel participants from the server
        socket.on('channel', channel => {
            
            let channels = this.state.channels;
            channels.forEach(c => {
                if (c.id === channel.id) {
                    c.participants = channel.participants;
                }
            });
            this.setState({ channels });
        });
        
        // Update the channel in state of new message comming from the server
        socket.on('message', message => {
            
            let channels = this.state.channels
            channels.forEach(c => {
                if (c.id === message.channel_id) {
                    if (!c.messages) {
                        c.messages = [message]; // first message on list
                    } else {
                        c.messages.push(message);
                    }
                }
            });
            this.setState({ channels });
        });
        this.socket = socket;
    }
    
    // Loading the channels from the server to state memory
    loadChannels = async () => {
        fetch(SERVER + '/getChannels').then(async response => {
            let data = await response.json();
            this.setState({ channels: data.channels });
        })
    }
    
    // Get the selected channel from the channels, update the state and join the channel on the server
    handleChannelSelect = id => {
        let channel = this.state.channels.find(c => {
            return c.id === id;
        });
        this.setState({ channel });
        this.socket.emit('channel-join', id, res => {
        });
    }
    
    // Send a new message to the server
    handleSendMessage = (channel_id, text) => {
        this.socket.emit('send-message', { channel_id, text, senderName: this.props.state.currentUser, id: Date.now() });
    }

    render() {
        
        return (
            <div className='chat-app'>
                
                <ChannelList channels={this.state.channels} onSelectChannel={this.handleChannelSelect} currentUser={this.props.state.currentUser}/>
                <MessagesPanel onSendMessage={this.handleSendMessage} channel={this.state.channel} currentUser={this.props.state.currentUser} />
                
            </div>
        );
    }
}