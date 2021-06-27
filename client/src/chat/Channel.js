import React from 'react';
import $ from 'jquery'

window.jQuery = $;
window.$ = $;
global.jQuery = $;

export class Channel extends React.Component {

    click = () => {
        this.props.onClick(this.props.id);
        $(".channel-item").removeClass("channel-itemSelected");
        $("#channel" + this.props.id).addClass("channel-itemSelected");
    }

    render() {
        return (
            <div id={'channel' + this.props.id} className='channel-item' onClick={this.click}>
                <div>{this.props.name}</div>
                <span>{this.props.participants}</span>
            </div>
        )
    }
}