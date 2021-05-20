/*
  Calculate the merit for an SLP address.
*/

const TOKENID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0' // PSF

const ADDR = 'simpleledger:qqf4yw03fevffd0yzhp2c88n06yzadhp4ywk5c50nu'

// Delay in milliseconds between processing UTXOs.
const UTXO_DELAY = 4000

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()
// const bchjs = new BCHJS({ restURL: 'http://157.90.174.219:3000/v4/' })

const MsgLib = require('../index')
const msgLib = new MsgLib({ bchjs })

async function calcMerit () {
  try {
    const merit = await msgLib.merit.agMerit(ADDR, TOKENID, UTXO_DELAY)
    console.log(`merit: ${JSON.stringify(merit, null, 2)}`)
  } catch (err) {
    console.error(err)
  }
}
calcMerit()
