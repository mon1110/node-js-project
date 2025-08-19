// src/tests/setup.js
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');

chai.use(chaiAsPromised); // <- this must be a function
chai.use(chaiHttp);        // <- this must be a function

global.expect = chai.expect;
global.chai = chai; // optional: allows chai.request(app)
