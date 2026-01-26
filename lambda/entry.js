// Lambda entry point wrapper
const handler = require('./dist/handler.js');
exports.main = handler.main;
