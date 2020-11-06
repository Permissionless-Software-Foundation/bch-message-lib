/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

'use strict'

const MemoLib = require('./lib/memo')
const memo = new MemoLib()

const MeritLib = require('./lib/merit')
const merit = new MeritLib()

class BoilplateLib {
  constructor (config) {
    if (!config || !config.bchjs) {
      throw new Error(
        'bch-js instance must be passed in the config object when instantiating.'
      )
    }

    // This is an instance of bch-js.
    this.bchjs = config.bchjs

    this.memo = memo
    this.merit = merit
  }
}

module.exports = BoilplateLib
