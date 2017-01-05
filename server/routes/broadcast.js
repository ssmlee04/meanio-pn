/*jshint -W079 */
'use strict'

var broadcast = require('../controllers/broadcast')

module.exports = function(Broadcast, app, auth, database) {

  app.route('/apis/v1/broadcast')
    .post(auth.requiresLogin, auth.requiresAdmin, broadcast.create)

  app.route('/apis/v1/broadcast/devices')
    .post(auth.requiresLogin, broadcast.registerDevice)

  app.route('/apis/v1/broadcast/users/:userId')
    .post(auth.requiresLogin, auth.requiresAdmin, broadcast.send)
}
