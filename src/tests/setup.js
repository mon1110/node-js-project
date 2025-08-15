// src/tests/setup.js
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised').default || require('chai-as-promised');

chai.use(chaiAsPromised);
global.expect = chai.expect;
