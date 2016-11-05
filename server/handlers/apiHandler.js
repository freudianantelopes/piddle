const billController = require('../dbControllers/billController');
const itemController = require('../dbControllers/itemController');

var send = require('gmail-send')({
  user: 'samdsherman@gmail.com',               // Your GMail account used to send emails 
  pass: 'mnzhpkwnsxqbwvct',             // Application-specific password TODO: put this somewhere it can't be abused
  // to:   '"User" <user@gmail.com>',      // Send back to yourself 
  from:   'Piddle.me',  // from: by default equals to user 
  // replyTo:'user@gmail.com'           // replyTo: by default undefined 
  subject: 'Piddle bill',
  // text:    'test text'
  // html:    '<b>html text text</b>' 
});

/**
 * The logic functions to handle requests to API endpoints.
 * @module Server: API Handler
 */

/**
 * Save a bill. The logic for POST /api/bill.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const saveBill = (request, response) => {
  const bill = request.body;
  billController.createBill(bill)
    .then((billRecord) => {
      response.status(201);
      response.json({
        data: {
          shortId: billRecord.shortId,
        },
      });
    })
    .catch((error) => {
      response.status(400);
      response.json({
        error: {
          message: error.message,
        },
      });
    });
};

/**
 * Retrieve a bill. The logic for GET /api/bill/:shortId.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const getBill = (request, response) => {
  const shortId = request.params.shortId;
  billController.retrieveBill(shortId)
  .then((billInstance) => {
    if (!billInstance) {
      return response.status(400).json({
        error: {
          message: 'A bill with that short id was not found.',
        },
      });
    }
    return response.status(200).json({
      data: billInstance.dataValues,
    });
  })
  .catch(() => response.status(500).json({
    error: {
      message: 'There was an error retrieving the bill.',
    },
  })
  );
};

/**
 * Get all the bills for a given user. The logic for GET /api/bills.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const getUserBills = (request, response) => {
  const userId = request.user.id;
  billController.retrievePayerBills(userId)
    .then((bills) => {
      const billsJSON = bills.map(bill => bill.toJSON());
      response.status(200).json({ data: billsJSON });
    })
    .catch(() => response.status(500).json({
      error: {
        message: 'There was an error retrieving the user\'s bills',
      },
    }));
};

const getAllUserBills = (request, response) => {
  const userId = request.user.id;
  billController.retrieveAllUserBills(userId)
  .then(bills => {
    const billsJSON = bills.map(bill => bill.toJSON());
    response.status(200).json({data: billsJSON});
  })
  .catch(err => response.status(500).json({
    error: {
      message: 'There was an error retrieving the user\'s debts. Error: ' + err
    }
  }));
}

const getUserDebts = (request, response) => {
  const userId = request.user.id;
  billController.retrieveDebtorBills(userId)
  .then(bills => {
    const billsJSON = bills.map(bill => bill.toJSON());
    response.status(200).json({data: billsJSON});
  })
  .catch(err => response.status(500).json({
    error: {
      message: 'There was an error retrieving the user\'s debts. Error: ' + err
    }
  }));
}

/**
 * Update a bill. The logic for PUT /api/bill/:id.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const updateBill = (request, response) => {
  const userId = request.user.get('id');
  const shortId = request.params.shortId;
  const updateParams = Object.assign({}, request.body);
  const updateItems = Object.assign([], request.body.items);
  delete updateParams.id; // don't allow id to update
  delete updateParams.shortId; // don't allow shortId to update
  delete updateParams.payerId; // don't allow payerId to update
  delete updateParams.items; // don't allow changes to Items
  billController.retrieveBillWithPaidItems(shortId)
  .then((billRecord) => {
    if (!billRecord) {
      return response.status(404).json({
        error: {
          message: 'A bill with that short id does not exist',
        },
      });
    }
    if (billRecord.items.length > 0 && (updateParams.tax || updateParams.tip)) {
      return response.status(400).json({
        error: {
          message: 'May not update tax or tip once an item has been marked paid',
        },
      });
    }
    if (billRecord.payerId !== userId) {
      return response.status(403).json({
        error: {
          message: 'Only the payer of the bill may update the bill',
        },
      });
    }
    return billController.updateBill(shortId, updateParams, updateItems)
      .then(updatedBillRecord =>
        response.status(200).json({
          data: updatedBillRecord.toJSON(),
        })
      );
  });
};

/**
 * Update an item. The logic for PUT /api/item/:id.
 * @param {readableStream} request Request stream. See API documentation for parameters.
 * @param {writeableStream} response Response stream. See API documentation for parameters.
 */
const updateItem = (request, response) => {
  const userId = request.user.get('id');
  const itemId = request.params.id;
  const updateParams = Object.assign({}, request.body);
  delete updateParams.id; // don't allow changing of item id
  itemController.findItemById(itemId)
    .then((itemInstance) => {
      if (!itemInstance) {
        return response.status(400).json({
          error: {
            message: `Item with id: ${itemId} does not exist`,
          },
        });
      }
      const billPayerId = itemInstance.get('bill').get('payerId');

      if (billPayerId !== userId) {
        // the person manipulating the bill is not the bill owner
        if (updateParams.description ||
            updateParams.price ||
            (updateParams.paid && !updateParams.debtorId)) {
          return response.status(403).json({
            error: {
              message: 'Users who are not the owner of the bill may not change item description or price',
            },
          });
        }
        if (updateParams.debtorId && (updateParams.debtorId !== userId)) {
          return response.status(403).json({
            error: {
              message: 'Users who are not the owner of the bill may only set themselves as the owner of the bill',
            },
          });
        }
        if (updateParams.debtorId === null && (itemInstance.get('debtorId') !== userId)) {
          return response.status(403).json({
            error: {
              message: 'Users who have not claimed the item may not set it as unclaimed',
            },
          });
        }
        if (itemInstance.get('debtorId') && updateParams.debtorId) {
          return response.status(403).json({
            error: {
              message: 'Users may not claim an item already claimed by someone else',
            },
          });
        }
      }
      if (itemInstance.get('paid')) {
        const paramKeys = Object.keys(updateParams);
        if (paramKeys.length > 1 || paramKeys[0] !== 'paid') {
          return response.status(403).json({
            error: {
              message: 'If an item has been marked paid the only change to it allowed is to mark it as unpaid.',
            },
          });
        }
      }

      return itemInstance.update(updateParams)
        .then(() => {
          itemController.findItemByIdForUpdateReturn(itemInstance.get('id'))
            .then(returnItemInstance =>
              response.status(200).json({
                data: returnItemInstance.toJSON(),
              })
            );
        });
    });
};

const sendEmails = (request, response, next) => {
  request.body.debtorEmailAddresses.forEach(email => {
    send({
      to: email,
      html: `<p>You have been tagged in a Piddle bill from ${request.user.dataValues.name || 'someone'} (${request.user.dataValues.emailAddress}).</p>
             <p>We hope you enjoyed your delicious, delicious ${request.body.description || 'meal'}!</p>
             <a href='http://45.55.19.169:3000'>Click here to log in to piddle and view the bill!</a>`
    });
  });
  next();
}

module.exports = {
  saveBill,
  getBill,
  getUserBills,
  getAllUserBills,
  getUserDebts,
  updateBill,
  updateItem,
  sendEmails,
};
