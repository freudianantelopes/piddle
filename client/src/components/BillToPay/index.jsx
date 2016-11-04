import React from 'react';

class BillToPay extends React.Component {
  
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <a href={'/bill/' + this.props.bill.shortId}>{this.props.bill.description || 'no description'}</a>
      </div>
    )
  }
}

export default BillToPay;
