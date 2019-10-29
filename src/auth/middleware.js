'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {

  try {
    let [authType, encodedString] = req.headers.authorization.split(/\s+/);

    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch(authType.toLowerCase()) {
      case 'basic':
        return _authBasic(encodedString);
      default:
        return _authError();
    }

  } catch(e) {
    return _authError();
  }

  function _authBasic(authString) {
    // console.log('here0')
    let base64Buffer = Buffer.from(authString,'base64'); // <Buffer 01 02...>
    // console.log('here1')
    let bufferString = base64Buffer.toString(); // john:mysecret
    // console.log('here2')
    let [username,password] = bufferString.split(':');  // variables username="john" and password="mysecret"
    // console.log('here3')
    let auth = {username,password};  // {username:"john", password:"mysecret"}
    // console.log(auth);

    return User.authenticateBasic(auth)
      .then( user => _authenticate(user) );
  }

  function _authenticate(user) {
    if ( user ) {
      req.user = user; // SOLUTION
      req.token = user.generateToken(); // SOLUTION
      next();
    }
    else {
      _authError();
    }
  }

  function _authError() {
    next({status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password'});
  }

};

