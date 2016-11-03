import React from 'react';

class BillToPay extends React.Component {
  
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        This is a bill to pay. {this.props.bill.description}
      </div>
    )
  }
}

export default BillToPay;
