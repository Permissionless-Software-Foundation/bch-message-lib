/*
  Library for functionality concerned with memo.cash

  memo.cash protocol:
  https://memo.cash/protocol
*/

// npm libraries
const BCHJS = require('@psf/bch-js')
const BchUtil = require('bch-util')

class MemoLib {
  constructor (config) {
    // Default to new instance of bch-js
    this.bchjs = new BCHJS()
    // Overwrite default if an instance of bch-js is passed in.
    if (config && config.bchjs) this.bchjs = config.bchjs

    this.bchUtil = new BchUtil({ bchjs: this.bchjs })
  }

  // Push a message to the BCH blockchain using the memo.cash protocol.
  // This writes to address of the WIF provided.
  // Returns a hex string of a transaction, ready to be broadcast to the network.
  async memoPush (msg, wif, preface = '') {
    try {
      if (typeof wif !== 'string') {
        throw new Error('WIF must be a string of a private key.')
      }

      // Create an EC Key Pair from the user-supplied WIF.
      const ecPair = this.bchjs.ECPair.fromWIF(wif)

      // Generate the public address that corresponds to this WIF.
      const bchAddr = this.bchjs.ECPair.toCashAddress(ecPair)

      // Get UTXOs controlled by this address.
      const u = await this.bchjs.Electrumx.utxo(bchAddr)
      // console.log(`u: ${JSON.stringify(u, null, 2)}`)

      // TODO: hydrate UTXOs with SLP information and cut out SLP UTXOs, so that
      // this function does not burn SLP tokens.

      // Pick the biggest UTXO to pay for the transaction.
      const utxo = this.bchUtil.util.findBiggestUtxo(u.utxos)

      // instance of transaction builder
      const transactionBuilder = new this.bchjs.TransactionBuilder()

      const originalAmount = utxo.satoshis
      const vout = utxo.tx_pos
      const txid = utxo.tx_hash

      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)

      // TODO: Compute the 1 sat/byte fee.
      const fee = 500

      // Send the same amount - fee.
      transactionBuilder.addOutput(bchAddr, originalAmount - fee)

      // Generate the memo.cash OP_RETURN data.
      const script = [
        this.bchjs.Script.opcodes.OP_RETURN,
        Buffer.from('6d02', 'hex'),
        Buffer.from(`${preface}${msg}`)
      ]
      const data = this.bchjs.Script.encode2(script)

      // Add the OP_RETURN as the first output of the transaction.
      transactionBuilder.addOutput(data, 0)

      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        ecPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // build tx
      const tx = transactionBuilder.build()
      // output raw hex
      const hex = tx.toHex()

      return hex
    } catch (err) {
      console.error('Error in memoPush()')
      throw err
    }
  }
}

module.exports = MemoLib
