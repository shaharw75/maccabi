import React from 'react';
import { useHistory } from "react-router-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import { Chat } from './chat/Chat';
import { Login } from './Login';
import $ from 'jquery'

window.jQuery = $;
window.$ = $;
global.jQuery = $;

const SERVER = "http://127.0.0.1:8080";

class App extends React.Component {
    
  constructor(){
    super();
    this.state = {currentUser:''};
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSetCurrentUser = this.handleSetCurrentUser.bind(this);
  }

    handleLogout = () => {

      fetch(SERVER + '/logout');
      window.location.href = '/login';

    }

    handleSetCurrentUser = (userName) => {
       
      this.setState({'currentUser': userName});
    }

    render(){
      return (

          <div className="App">
            
            <Router>
            <Link to="/login" className="lnk">Login</Link>
            &nbsp;&nbsp;
            <Link onClick={() => this.handleLogout()}  className="lnk">Logout</Link>
            <br/><br/>
            <Switch>
            <Route path="/login/" component={() => <Login setCurrentUser={this.handleSetCurrentUser} history={useHistory()}/>} />
            <Route path="/chat/chat/" component={() => <Chat state={this.state}/>} />
            </Switch>
            </Router>
          </div>
          
      );
    }
    }

export default App;

