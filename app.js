'use strict'

/*
 * Defining the Package
 */
var Module = require('meanio').Module

var PNPackage = new Module('meanio-pn')

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
PNPackage.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  PNPackage.routes(app, auth, database)

  return PNPackage
})
