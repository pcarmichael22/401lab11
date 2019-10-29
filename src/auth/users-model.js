'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String},
  role: {type: String, required:true, default:'user', enum:['admin','editor','user'] },
});

users.pre('save', async function() {
  if (this.isModified('password'))
  {
    // encrypting the password before storing it
    this.password = await bcrypt.hash(this.password, 10);
  }
});

users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  // console.log('Query', query);
  return this.findOne(query)
  // you validate the user password, then just return a boolean? Why not return the user, to put on the request object in the router
  // This needs to be fixed to get the rest working.
    .then(user => user && user.comparePassword(auth.password))
    .catch(console.error);
};

// Compare a plain text password against the hashed one we have saved
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(isValid => isValid? this : null); // SOLUTION
};

// Generate a JWT from the user id and a secret
users.methods.generateToken = function() {
  let tokenData = {
    id:this._id,

    //what is this about? acl?
    capabilities: (this.acl && this.acl.capabilities) || [],
  };
  return jwt.sign(tokenData, process.env.SECRET || 'changeit' );
};

module.exports = mongoose.model('users', users);
