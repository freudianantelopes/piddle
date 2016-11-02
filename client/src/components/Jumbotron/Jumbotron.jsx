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
  }

  componentWillMount() {
    const token = localStorage.getItem('piddleToken');
    console.log('token: ', token);
    fetch(`${this.serverUrl}/auth/loggedin`, {
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`,
      },
    }).then(response => {
      console.log('successfully called loggedin, got response: ', response);
      this.setState({
        loggedIn: response.status === 200
      });
      console.log(response.body);
    }).catch(err => {
      console.log('failed calling loggedin, got error: ', err);
    })
  }

  handleCallToAction() {
    this.props.router.push(this.state.loggedIn ? '/bill' : '/login');
  }

  render() {
    return (
      <Jumbotron>
        <h1>Piddle</h1>
        <p className="lead">Split the bill like a pro.</p>
        <Row>
          <Col xs="12" sm={6}>
            <p><Button bsStyle="primary" bsSize="large" onClick={this.handleCallToAction}>
              {this.state.loggedIn ? 'Split a Bill' : 'Log in'}
            </Button></p>
          </Col>
          <Col xsHidden sm={6}>
          </Col>
        </Row>
      </Jumbotron>

    );
  }
}

export default withRouter(JumbotronInstance);
