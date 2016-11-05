import React from 'react';
import BillToPay from '../BillToPay';

class AllUserBills extends React.Component {

	constructor(props) {
		super(props);
		this.serverUrl = /^(development|test)$/.test(process.env.NODE_ENV) ? 'http://localhost:3000' : '';
		this.state = {
			data: []
		};
	}

	componentWillMount() {
		fetch(`${this.serverUrl}/api/allbills`, {
			method: 'GET',
			headers: {
				Authorization: `JWT ${localStorage.getItem('piddleToken')}`,
			}
		})
		.then(response => response.json())
		.then(data => {
			this.setState({
				data: data.data
			});
		})
		.catch(err => {
			console.error(err);
		});
	}

	render() {
		return (
			<div>
				Click on a bill to edit or pay for it.
				{this.state.data.map(bill => <BillToPay bill={bill} />)}
			</div>
		);
	}
}

export default AllUserBills;