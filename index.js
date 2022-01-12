/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

'use strict'

const MemoLib = require('./lib/memo')

const MeritLib = require('./lib/merit')

class BchMessage {
  constructor (config = {}) {
    if (!config.bchjs) {
      throw new Error(
        'bch-js instance must be passed in the config object when instantiating.'
      )
    }
    this.bchjs = config.bchjs

    this.memo = new MemoLib(config)
    this.merit = new MeritLib(config)
  }
}

module.exports = BchMessage
