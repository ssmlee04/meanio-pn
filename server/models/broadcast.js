/*jshint -W079 */
'use strict'

/**
 * Module dependencies.
 */
var Promise = require('bluebird')
var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var config = require('meanio').loadConfig()
var FCM = require('fcm-push')
var serverKey = config.fcm
var fcm = new FCM(serverKey)
var apn = require('apn')
var ceritificate = path.join(config.root, 'ssl/Certificates_' + process.env.NODE_ENV + '.p12')

/**
 * Globals.
 */
var apnConnection
var feedback
var options = {
  pfx: ceritificate,
  'batchFeedback': true,
  'interval': 30
}

if (fs.existsSync(ceritificate)) {
  feedback = new apn.Feedback(options)

  feedback.on('feedback', function(devices) {
    devices.forEach(function(item) {
        // Do something with item.device and item.time
    })
  })

  apnConnection = new apn.Connection(options)

  apnConnection.on('error', function (err) {
    console.log('[*] error')
    console.log(err)
  })

  apnConnection.on('socketError', function (err) {
    console.log('[*] socketError')
    console.log(err)
  })

  apnConnection.on('transmitted', function (notification, device) {
    console.log('[*] transmitted')
  })

  apnConnection.on('completed', function () {
    console.log('[*] completed')
  })

  apnConnection.on('cacheTooSmall', function (sizeDifference) {
    console.log('[*] cacheTooSmall')
    console.log(sizeDifference)
  })

  apnConnection.on('connected', function (openSockets) {
    console.log('[*] connected')
  })

  apnConnection.on('disconnected', function (openSockets) {
    console.log('[*] disconnected')
  })

  apnConnection.on('timeout', function () {
    console.log('[*] timeout')
  })

  apnConnection.on('transmissionError', function (errorCode, notification, device) {
    console.log('[*] transmissionError')
    console.log(errorCode)
    console.log(notification)
    console.log(device)
  })
}

var PushSchema = {
  token: {
    type: String
  },
  os: {
    type: String
  }
}

var BroadcastSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  pnt: [PushSchema]
}, {
  collection: 'oc_broadcast',
  timestamps: true
})

BroadcastSchema.index({user_idr: 1}, {unique: true})

var sendIOS = function(token, msg) {
  var myDevice = new apn.Device(token)
  var note = new apn.Notification()

  note.expiry = Math.floor(Date.now() / 1000) + 3600 // Expires 1 hour from now.
  note.badge = 3
  note.sound = 'ping.aiff'
  note.alert = msg && msg.message || '\uD83D\uDCE7 \u2709 You have a new message'
  note.payload = msg && msg.payload || {}

  apnConnection.pushNotification(note, myDevice)
}

var sendAndroid = function(token, msg) {
  var info = {
    to: token, // required
    // collapse_key: 'your_collapse_key',
    'content_available': true,
    data: {
      message: msg.message
        // your_custom_data_key: 'your_custom_data_value'
    },
    notification: {
      title: 'Singlebeep',
      body: msg.message,
      icon: 'bell',
      sound: 'levelup.mp3',
      'click_action': 'fcm.ACTION.HELLO'
    }
  }

  fcm.send(info, function(err, response) {
    if (err) {
      console.log('Something has gone wrong!')
    } else {
      console.log('Successfully sent with response: ', response)
    }
  })
}

BroadcastSchema.statics.registerDevice = function(userId, os, token) {
  var that = this
  if (!userId) {
    return Promise.reject(new Error('text-error-user-id'))
  }
  if (!os) {
    return Promise.reject(new Error('text-error-os'))
  }
  if (!token) {
    return Promise.reject(new Error('text-error-device-token'))
  }

  return Promise.resolve()
  .then(function() {
    return Promise.cast(that.findOne({user_id: userId}).exec())
    .then(function(d) {
      if (!d) {
        return Promise.cast(that.create({user_id: userId, pnt: [{os: os, token: token}]}))
      } else {
        return Promise.cast(that.update({user_id: userId, 'pnt.token': {$nin: [token]}}, {$push: {pnt: {os: os, token: token}}}).exec())
      }
    })
  })
}

BroadcastSchema.statics.sendAll = function(info) {
  var that = this

  return Promise.bind({})
  .then(function() {
    return Promise.cast(that.find({}).lean().exec())
  }).map(function(d) {
    if (!d || !d._id) {
      return
    }
    var pnt  = d.pnt && JSON.parse(JSON.stringify(d.pnt)) || []
    return Promise.resolve(pnt)
    .map(function(d) {
      var os = d.os
      var token = d.token
      if (os === 'ios') {
        return sendIOS(token, info)
      }
      if (os === 'android') {
        return sendAndroid(token, info)
      }
    }, {concurrency: 1})
  }, {concurrency: 3})
}

BroadcastSchema.statics.send = function(userId, info) {
  var that = this

  return Promise.bind({})
  .then(function() {
    return Promise.cast(that.findOne({user_id: userId}).lean().exec())
  }).then(function(d) {
    if (!d || !d._id) {
      return
    }
    var pnt  = d.pnt && JSON.parse(JSON.stringify(d.pnt)) || []
    return Promise.resolve(pnt)
    .map(function(d) {
      var os = d.os
      var token = d.token
      if (os === 'ios') {
        return sendIOS(token, info)
      }
      if (os === 'android') {
        return sendAndroid(token, info)
      }
    })
  })
}

mongoose.model('Broadcast', BroadcastSchema)
