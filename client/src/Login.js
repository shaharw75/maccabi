import React from "react";
import $ from "jquery";
import './Login.css';

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
      <div style={{width:'100%'}}>
        <div class="loginCube">
        <b>Please Login / Register:</b>
        <br/><br/>
        <div>
        <div className="cubeLeft">
          UserName:
        </div> 
        <div className="cubeRight">
          <input type="text" id="userName" />
        </div>
        </div>
        <br /><br/>
        <div>
          <div className="cubeLeft">
        Password: 
        </div>
        <div className="cubeRight">
        <input type="password" id="password" /></div>
        </div>
        <br />
        <br />
        <button className="btn" onClick={this.handleLogin}>LOGIN</button>
        </div>
      </div>
    );
  }
}
