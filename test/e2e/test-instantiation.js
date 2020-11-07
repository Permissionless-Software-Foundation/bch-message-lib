
const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()

const BchMessage = require('../../index.js')
const bchMessage = new BchMessage({ bchjs })

console.log(`bchMessage.merit.bchjs.restURL: ${bchMessage.merit.bchjs.restURL}`)
