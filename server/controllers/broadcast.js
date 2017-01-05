/*jshint -W079 */
'use strict'

/*
 * Module dependencies.
 */
var mongoose = require('mongoose')
var Promise = require('bluebird')
var Broadcast = mongoose.model('Broadcast')
var User = mongoose.model('User')

exports.create = function(req, res) {
  var info = req.body

  if (!info || !info.message) {
    return res.json(500, {error: 'error-need-notification-message'})
  }

  Promise.bind({})
  .then(function() {
    return Broadcast.sendAll(info)
  }).then(function() {
    res.json({
      success: true,
      message: 'text-success-broadcast-notification'
    })
  }).catch(function(err) {
    res.json(500, {error: err.toString()})
  })
}

exports.send = function(req, res) {
  var info = req.body
  console.log(info)
  var userId = req.params.userId

  if (!info || !info.message) {
    return res.json(500, {error: 'error-need-notification-message'})
  }
  if (!userId) {
    return res.json(500, {error: 'error-nede-user'})
  }

  Promise.bind({})
  .then(function() {
    return Broadcast.send(userId, info)
  }).then(function() {
    res.json({
      success: true,
      message: 'text-success-send-notification'
    })
  }).catch(function(err) {
    res.json(500, {error: err.toString()})
  })
}

exports.registerDevice = function(req, res) {
  var info = req.body
  if (!req.user || !req.user._id) {
    return res.json(401, {error: 'text-error-unauthorized'})
  }
  var userId = req.user._id.toString()
  console.log(info)
  if (!info) {
    return res.json(500, {error: 'text-incorrect-info'})
  }
  if (!info.token) {
    return res.json(500, {error: 'text-incorrect-token'})
  }
  if (!info.os) {
    return res.json(500, {error: 'text-incorrect-type'})
  }

  Promise.resolve()
  .then(function() {
    if (info.os === 'ios') {
      // return User.update({_id: userId, 'pnt.token': {$nin: [info.token]}}, {$push: {pnt: info}}).exec()
      return User.update({_id: userId, 'pnt.token': {$nin: [info.token]}}, {pnt: [info]}).exec()
    } else if (info.os === 'android') {
      // return User.update({_id: userId, 'pnt.token': {$nin: [info.token]}}, {$push: {pnt: info}}).exec()
      return User.update({_id: userId, 'pnt.token': {$nin: [info.token]}}, {pnt: [info]}).exec()
    } else {
      return Promise.reject('error-notification-token-type')
    }
  }).then(function() {
    res.json({succes: true, message: 'text-success-register-device'})
  }).catch(function(err) {
    console.log(err)
    res.json(500, {error: true, message: 'text-error-register-device'})
  })
}
