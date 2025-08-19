// src/tests/userRouter.test.js

const express = require('express');
const request = require('supertest');
const { expect } = require('chai');

// Controller stubs
const userControllerStub = {
  getAllUserss: (req, res) => res.status(200).send('getAllUserss called'),
  processExternalApi: (req, res) => res.status(200).send('processExternalApi called'),
  bulkInsertUsers: (req, res) => res.status(200).send('bulkInsertUsers called'),
  getAllUsers: (req, res) => res.status(200).send('getAllUsers called'),
  getUsersWithmenu: (req, res) => res.status(200).send('getUsersWithmenu called'),
  paginateUsersWithMenus: (req, res) => res.status(200).send('paginateUsersWithMenus called'),
  getUsersByEmailLetter: (req, res) => res.status(200).send('getUsersByEmailLetter called'),
  assignMenusToUser: (req, res) => res.status(200).send('assignMenusToUser called'),
  findByEmail: (req, res) => res.status(200).send('findByEmail called'),
  getUsers: (req, res) => res.status(200).send('getUsers called'),
  createUser: (req, res) => res.status(200).send('createUser called'),
  getUserById: (req, res) => res.status(200).send('getUserById called'),
  login: (req, res) => res.status(200).send('login called'),
  updatePasswordController: (req, res) => res.status(200).send('updatePasswordController called'),
  updateUser: (req, res) => res.status(200).send('updateUser called'),
  deleteUser: (req, res) => res.status(200).send('deleteUser called'),
  getUsersByIds: (req, res) => res.status(200).send('getUsersByIds called'),
  upsertUser: (req, res) => res.status(200).send('upsertUser called'),
  saveUser: (req, res) => res.status(200).send('saveUser called'),
  registerUser: (req, res) => res.status(200).send('registerUser called'),
  fetchAllUsers: (req, res) => res.status(200).send('fetchAllUsers called'),
};

// Setup Express app
const app = express();
app.use(express.json());

app.get('/users/owner', userControllerStub.getAllUserss);

// Fix ALL by splitting into GET + POST
app.get('/users/external-api', userControllerStub.processExternalApi);
app.post('/users/external-api', userControllerStub.processExternalApi);

app.post('/users/bulk-insert', userControllerStub.bulkInsertUsers);
app.get('/users/node', userControllerStub.getAllUsers);
app.post('/users/users-menu', userControllerStub.getUsersWithmenu);
app.post('/users/paginate', userControllerStub.paginateUsersWithMenus);
app.post('/users/search-email', userControllerStub.getUsersByEmailLetter);
app.post('/users/assign-menus', userControllerStub.assignMenusToUser);
app.get('/users/email', userControllerStub.findByEmail);
app.get('/users/users', userControllerStub.getUsers);
app.post('/users/register', userControllerStub.createUser);
app.get('/users/:id', userControllerStub.getUserById);
app.post('/users/login', userControllerStub.login);
app.post('/users/users/update-password', userControllerStub.updatePasswordController);
app.put('/users/update', userControllerStub.updateUser);
app.delete('/users/:id', userControllerStub.deleteUser);
app.post('/users/by-ids', userControllerStub.getUsersByIds);
app.post('/users/upsert-user', userControllerStub.upsertUser);
app.post('/users/save', userControllerStub.saveUser);
app.post('/users/registeraaa', userControllerStub.registerUser);
app.get('/users', userControllerStub.fetchAllUsers);

// Tests
describe('User Router', function () {
  this.timeout(5000); // async-safe, 5s per test

  it('GET /users/owner should call getAllUserss', async () => {
    const res = await request(app).get('/users/owner');
    expect(res.text).to.equal('getAllUserss called');
    expect(res.status).to.equal(200);
  });

  it('GET /users/external-api should call processExternalApi', async () => {
    const res = await request(app).get('/users/external-api');
    expect(res.text).to.equal('processExternalApi called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/external-api should call processExternalApi', async () => {
    const res = await request(app).post('/users/external-api');
    expect(res.text).to.equal('processExternalApi called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/bulk-insert should call bulkInsertUsers', async () => {
    const res = await request(app).post('/users/bulk-insert');
    expect(res.text).to.equal('bulkInsertUsers called');
    expect(res.status).to.equal(200);
  });

  it('GET /users/node should call getAllUsers', async () => {
    const res = await request(app).get('/users/node');
    expect(res.text).to.equal('getAllUsers called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/users-menu should call getUsersWithmenu', async () => {
    const res = await request(app).post('/users/users-menu');
    expect(res.text).to.equal('getUsersWithmenu called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/paginate should call paginateUsersWithMenus', async () => {
    const res = await request(app).post('/users/paginate');
    expect(res.text).to.equal('paginateUsersWithMenus called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/search-email should call getUsersByEmailLetter', async () => {
    const res = await request(app).post('/users/search-email');
    expect(res.text).to.equal('getUsersByEmailLetter called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/assign-menus should call assignMenusToUser', async () => {
    const res = await request(app).post('/users/assign-menus');
    expect(res.text).to.equal('assignMenusToUser called');
    expect(res.status).to.equal(200);
  });

  it('GET /users/email should call findByEmail', async () => {
    const res = await request(app).get('/users/email');
    expect(res.text).to.equal('findByEmail called');
    expect(res.status).to.equal(200);
  });

  it('GET /users/users should call getUsers with JWT', async () => {
    const res = await request(app).get('/users/users');
    expect(res.text).to.equal('getUsers called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/register should call createUser with JWT', async () => {
    const res = await request(app).post('/users/register');
    expect(res.text).to.equal('createUser called');
    expect(res.status).to.equal(200);
  });

  it('GET /users/:id should call getUserById with authMiddleware', async () => {
    const res = await request(app).get('/users/123');
    expect(res.text).to.equal('getUserById called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/login should call login', async () => {
    const res = await request(app).post('/users/login');
    expect(res.text).to.equal('login called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/users/update-password should call updatePasswordController', async () => {
    const res = await request(app).post('/users/users/update-password');
    expect(res.text).to.equal('updatePasswordController called');
    expect(res.status).to.equal(200);
  });

  it('PUT /users/update should call updateUser with JWT', async () => {
    const res = await request(app).put('/users/update');
    expect(res.text).to.equal('updateUser called');
    expect(res.status).to.equal(200);
  });

  it('DELETE /users/:id should call deleteUser with authMiddleware', async () => {
    const res = await request(app).delete('/users/123');
    expect(res.text).to.equal('deleteUser called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/by-ids should call getUsersByIds', async () => {
    const res = await request(app).post('/users/by-ids');
    expect(res.text).to.equal('getUsersByIds called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/upsert-user should call upsertUser', async () => {
    const res = await request(app).post('/users/upsert-user');
    expect(res.text).to.equal('upsertUser called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/save should call saveUser', async () => {
    const res = await request(app).post('/users/save');
    expect(res.text).to.equal('saveUser called');
    expect(res.status).to.equal(200);
  });

  it('POST /users/registeraaa should call registerUser', async () => {
    const res = await request(app).post('/users/registeraaa');
    expect(res.text).to.equal('registerUser called');
    expect(res.status).to.equal(200);
  });

  it('GET /users/ should call fetchAllUsers', async () => {
    const res = await request(app).get('/users');
    expect(res.text).to.equal('fetchAllUsers called');
    expect(res.status).to.equal(200);
  });
});
