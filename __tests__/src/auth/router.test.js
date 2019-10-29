'use strict';

process.env.STORAGE = 'mongo';

const jwt = require('jsonwebtoken');

const server = require('../../../src/app.js').server;
const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

let users = {
  admin: {username: 'admin01', password: 'password', role: 'admin'},
  editor: {username: 'editor01', password: 'password', role: 'editor'},
  user: {username: 'User01', password: 'password', role: 'user'},
};

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Router', () => {
  
  Object.keys(users).forEach( userType => {
    
    describe(`${userType} users`, () => {
      
      let encodedToken;
      let id;
      
      it('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            console.log('here 1')
            console.log(results.text)
            var token = jwt.verify(results.text, process.env.SECRET || 'changeit');
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            console.log('here 2')
            console.log(results.text)
            var token = jwt.verify(results.text, process.env.SECRET || 'changeit');
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });

    });
    
  });
  
});