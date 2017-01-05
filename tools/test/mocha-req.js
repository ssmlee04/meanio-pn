'use strict'

process.env.NODE_ENV = 'test'

var appRoot = __dirname + '/../../'

var fs = require('fs-extra')
var path = require('path')

var certPath = path.join(appRoot, './../certificates')

if (fs.existsSync(certPath)) {
  fs.copySync(certPath, path.join(appRoot, './ssl'))
}

require("meanio").serve({}, function (app) {
  console.log('Test server startup')
})

require('meanio/lib/core_modules/module/util').preload(appRoot + '/server', 'model')
