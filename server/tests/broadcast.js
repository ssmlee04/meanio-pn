/*jshint -W079 */
'use strict'

/**
 * Module dependencies.
 */
var Promise = require('bluebird')
var should = require('should')
var path = require('path')
var fs = require('fs')
var mongoose = require('mongoose')
var config = require('meanio').loadConfig()
var _ = require('lodash')
var Broadcast = mongoose.model('Broadcast')
var request = Promise.promisify(require('request'))
var cookieJar = request.jar()
var randomstring = require('randomstring')
var del = require('del')


/**
 * Globals
 */
var numRepeat = 10
var user = {
  name: randomstring.generate(),
  email: randomstring.generate() + '@gmail.com',
  password: randomstring.generate() + '@gmail.com',
  roles: ['user'],
  verified: true
}
var saveduser

/**
 * Test Suites
 */
describe('<Unit Test>', function() {
  describe('Model Broadcast:', function() {
    this.timeout(8000)

    before(function(done) {
      return Promise.resolve()
      .delay(2000)
      .then(function() {
        // var User = mongoose.model('User')
        return Broadcast.remove({}).exec()
        .then(function() {
          return Broadcast.create(user).then(function(d) {
            saveduser = JSON.parse(JSON.stringify(d))
          })
        }).then(function() {
          return Broadcast.update({user_id: user.user_id}, {
            user_id: saveduser._id,
            pnt: [{
              "token" : process.env.MEANIO_PN_IOS_TOKEN,
              "os" : "ios"
            }]
          }).exec()
        })
      }).then(function() {
        done()
      }).catch(function(err) {
        should.not.exist(err)
        done()
      })
    })

    describe('Method create', function() {
      it('should be able to register devices (registerDevice)', function(done) {
        return Promise.resolve()
        .then(function() {
          return Broadcast.registerDevice(saveduser._id, 'ios', randomstring.generate())
        }).then(function() {
          return Broadcast.registerDevice(saveduser._id, 'ios', randomstring.generate())
        }).then(function() {
          return Broadcast.registerDevice(saveduser._id, 'android', randomstring.generate())
        }).then(function() {
          return Broadcast.registerDevice(saveduser._id, 'android', randomstring.generate())
        }).then(function() {
          return Broadcast.registerDevice(saveduser._id, 'android', randomstring.generate())
        }).then(function() {
          return Promise.cast(Broadcast.findOne({user_id: saveduser._id}).exec())
          .then(function(d) {
            d.pnt.should.have.length(6)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })
    })

    after(function(done) {
      return Promise.resolve()
      .then(function() {

      }).then(function() {
        del(['ssl/*', 'ssl']).then(function() {})
      }).then(function() {
        done()
      }).catch(function(err) {
        console.log(err)
        should.not.exist(err)
        done()
      })
    })
  })
})
