import React, { Component } from 'react';
import { Link, withRouter } from 'react-router';
import Request from '../../utils/requestHandler';
import './Login.css';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputs: {
        emailAddress: null,
        password: null,
      },
      error: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitLoginForm = this.submitLoginForm.bind(this);
  }

  componentDidMount() {
    // Send the user away if they're already logged in
    // eslint-disable-next-line no-undef
    if (localStorage.getItem('piddleToken')) {
      this.props.router.push('/');
    }
  }

  handleInputChange(event) {
    const stateObj = this.state.inputs;
    stateObj[event.target.name] = event.target.value;
    this.setState({ inputs: stateObj });
  }

  submitLoginForm(event) {
    event.preventDefault();
    Request.postLogin(this.state.inputs, (res) => {
      if (res.status === 201) {
        // eslint-disable-next-line no-undef
        localStorage.setItem('piddleToken', res.body.data.token);
        this.props.router.push('/');
      } else {
        this.setState({ error: res.body.error.message });
      }
    });
  }

  render() {
    return (
      <div className="loginPage">
        <p className="Login-intro">
          Login To Your Account
        </p>
        <form id="loginForm">

          <div className="loginContainer">
            <label className="label" htmlFor="emailAddress">email</label>
            <input
              type="text"
              className="loginForm"
              id="emailAddress"
              name="emailAddress"
              onChange={event => this.handleInputChange(event)}
            />
          </div>

          <div className="loginContainer">
            <label className="label" htmlFor="password">password</label>
            <input
              type="password"
              className="loginForm"
              id="password"
              name="password"
              onChange={event => this.handleInputChange(event)}
            />
          </div>

          <div className="loginButton">
            <input
              type="submit"
              className="submitLogin"
              id="submitLogin"
              value="Login"
              onClick={event => this.submitLoginForm(event)}
            />
          </div>
        </form>
        <div className="loginError">{this.state.error}</div>
        <div className="needAnAccount">
          <span>Need an account? </span>
          <Link to="/signup">Sign up</Link>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }),
};

export default withRouter(Login);
