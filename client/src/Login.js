import React from "react";
import $ from "jquery";
window.jQuery = $;
window.$ = $;
global.jQuery = $;

const SERVER = "http://127.0.0.1:8080";

export class Login extends React.Component {
  
    constructor(props){
      super(props);
      this.handleLogin = this.handleLogin.bind(this);
      this.state = {redirect: false};
    }

  handleLogin = () => {
    const userName = $("#userName").val();
    const password = $("#password").val();
    fetch(
      SERVER + "/login?userName=" + userName + "&password=" + password
    ).then(async (response) => {
      let data = await response.json();
      if (data.message === true) {
        this.props.setCurrentUser(userName);
        this.props.history.push("/chat/chat");
      } else alert("FAILED LOGIN");
    });
  };

  render() {

    return (
      <div>
        <b>Please Login / Register:</b>
        <br />
        UserName: <input type="text" id="userName" />
        <br />
        Password: <input type="text" id="password" />
        <br />
        <br />
        <button onClick={this.handleLogin}>LOGIN</button>
      </div>
    );
  }
}
