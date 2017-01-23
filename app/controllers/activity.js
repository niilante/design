'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delet_act = exports.update_act = exports.new_act = exports.new_act_page = exports.list = undefined;

var _activity = require('../models/activity');

var _product = require('../models/product');

var _product2 = _interopRequireDefault(_product);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var list = exports.list = function list(req, res) {
  _activity.Activity.find({}, function (err, acts) {
    if (err) {
      res.send(err);
    }
    res.render('admin/activity/', {
      activities: acts
    });
  });
};

var new_act_page = exports.new_act_page = function new_act_page(req, res) {
  _product2.default.find({}, { _id: 1, name: 1, pics: 1, labels: 1 }).limit(10).exec(function (err, prods) {
    if (err) {
      res.send(err);
    }
    _product2.default.count({}, function (err, count) {
      res.render('admin/activity/new_activity', {
        products: prods,
        count: count
      });
    });
  });
};

var new_act = exports.new_act = function new_act(req, res) {};

var update_act = exports.update_act = function update_act(req, res) {};

var delet_act = exports.delet_act = function delet_act(req, res) {};