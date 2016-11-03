import React, { Component } from 'react';
import { Jumbotron, Button, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import './Jumbotron.css';

class JumbotronInstance extends Component {
  constructor(props) {
    super(props);
    this.handleCallToAction = this.handleCallToAction.bind(this);
    this.serverUrl = /^(development|test)$/.test(process.env.NODE_ENV) ? 'http://localhost:3000' : '';
    this.state = {
      loggedIn: false
    }

    // text for the buttons on the homepage
    this.splitABillButtonText = 'Split a Bill';
    this.payABillButtonText = 'Pay a Bill';
    this.logInButtonText = 'Log in';
    this.signUpButtonText = 'Sign up';

    // what routes each button corresponds to
    this.buttonTextMap = {};
    this.buttonTextMap[this.splitABillButtonText] = '/bill';
    this.buttonTextMap[this.payABillButtonText] = '/bill';
    this.buttonTextMap[this.logInButtonText] = '/login';
    this.buttonTextMap[this.signUpButtonText] = '/signup';

    this.setLoggedIn = this.setLoggedIn.bind(this);

    window.setLoggedIn = this.setLoggedIn;
  }

  componentWillMount() {
    const token = localStorage.getItem('piddleToken');
    fetch(`${this.serverUrl}/auth/loggedin`, {
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`,
      },
    }).then(response => {
      this.setState({
        loggedIn: response.status === 200
      });
    }).catch(err => {
      console.error('failed calling loggedin, got error: ', err);
    })
  }

  setLoggedIn() {
    this.setState({ loggedIn: false })
  }

  handleCallToAction(e) {
    this.props.router.push(this.buttonTextMap[e.target.textContent]);
  }

  render() {
    return (
      <Jumbotron>
        <h1>Piddle</h1>
        <p className="lead">Split the bill like a pro.</p>
        <Row>
          <Col xs="12" sm={6}>
            <p><Button bsStyle="primary" bsSize="large" onClick={this.handleCallToAction}>
              {this.state.loggedIn ? this.splitABillButtonText : this.logInButtonText}
            </Button></p>
          </Col>
          <Col xs='12' sm={6}>
            <p><Button bsStyle='primary' bsSize='large' onClick={this.handleCallToAction}>
              {this.state.loggedIn ? this.payABillButtonText : this.signUpButtonText}
            </Button></p>
          </Col>
        </Row>
      </Jumbotron>

    );
  }
}

export default withRouter(JumbotronInstance);
