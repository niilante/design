'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wcuser = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _activity = require('../schema/activity');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Wcuser = exports.Wcuser = _mongoose2.default.model('Wcuser', _activity.wcuserSchema);