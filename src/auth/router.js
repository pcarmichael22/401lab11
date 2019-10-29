'use strict';

const express = require('express');
const authRouter = express.Router();
const User = require('./users-model.js');
const auth = require('./middleware.js');

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      console.log('here 3')
      console.log(req.token)
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (req, res, next) => {
  console.log('here 4')
  console.log('middleware user put here?')
  console.log(req.user)
  console.log(req.token)
  res.cookie('auth', req.token);
  res.send(req.token);
});

module.exports = authRouter;
