import React from 'react';
import {ListGroupItem} from 'react-bootstrap';

class BillToPay extends React.Component {
  
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ListGroupItem href={'/bill/' + this.props.bill.shortId}>
       {this.props.bill.description || 'no description'}
      </ListGroupItem>
    )
  }
}

export default BillToPay;
