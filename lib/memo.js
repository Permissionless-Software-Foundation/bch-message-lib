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

  // Write a message signal to the blockchain. This message complies with PS001
  // protocol for message transfer and signaling:
  // https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md
  async writeMsgSignal (wif, ipfsHash, toAddr, subject) {
    try {
      // Input Validations
      if (typeof wif !== 'string') {
        throw new Error('WIF must be a string of a private key.')
      }
      if (typeof ipfsHash !== 'string') {
        throw new Error('IPFS hash must be a string.')
      }
      if (typeof toAddr !== 'string') {
        throw new Error('toAddr must be a string of a BCH address.')
      }
      if (typeof subject !== 'string') {
        throw new Error('subject must be a string.')
      }

      // Create an EC Key Pair from the user-supplied WIF.
      const ecPair = this.bchjs.ECPair.fromWIF(wif)

      // Generate the public address that corresponds to this WIF.
      const bchAddr = this.bchjs.ECPair.toCashAddress(ecPair)

      // Get UTXOs controlled by this address.
      const u = await this.bchjs.Electrumx.utxo(bchAddr)
      if (!u.success) throw new Error('Could not get UTXOs')
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
      const dust = 546
      // Send the same amount - fee.
      transactionBuilder.addOutput(bchAddr, originalAmount - fee - dust)

      // Generate the memo.cash OP_RETURN data.
      const script = [
        this.bchjs.Script.opcodes.OP_RETURN,
        Buffer.from('6d02', 'hex'),
        Buffer.from(`MSG IPFS ${ipfsHash} ${subject}`)
      ]
      const data = this.bchjs.Script.encode2(script)

      // Add the OP_RETURN as the first output of the transaction.
      transactionBuilder.addOutput(data, 0)

      // Send a dust amount to the recipient to signal to them that they have a message.
      transactionBuilder.addOutput(toAddr, dust)

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
      console.error('Error in writeMsgSignal()')
      throw err
    }
  }

  // This function expects a BCH address as input. It will then retrieve the
  // most recent 20 transactions and returns an array of the expanded
  // transaction details for those transactions.
  async getTransactions (bchAddr) {
    try {
      // Get transaction history for the address.
      const transactions = await this.bchjs.Electrumx.transactions(bchAddr)
      if (!transactions.success) {
        throw new Error(`No transaction history could be found for ${bchAddr}`)
      }
      // console.log(`transactions: ${JSON.stringify(transactions, null, 2)}`)

      // Sort the transactions in descending order (newest first).
      const txsArr = this.sortTxsByHeight(
        transactions.transactions,
        'DESCENDING'
      )
      // console.log(`txsArr: ${JSON.stringify(txsArr, null, 2)}`)

      // Break the transaction list into arrays of 20 txids each.
      // This lets us make bulk calls to get info on 20 txs at time, and reduces
      // the number of REST API calls.
      let txs = this.bchUtil.util.chunk20(txsArr)
      // console.log(`txs: ${JSON.stringify(txs, null, 2)}`)

      // For now, just process the first 20 most recent transactions. This can
      // be expanded in the future.
      txs = txs[0]

      // Filter out just the txids.
      const txids = txs.map(elem => elem.tx_hash)
      // console.log(`txids: ${JSON.stringify(txids, null, 2)}`)

      // Get tx details for those first block of txs.
      const txData = await this.bchjs.RawTransactions.getRawTransaction(
        txids,
        true
      )
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

      return txData
    } catch (err) {
      console.error('Error in memo.js/getTransactions()')
      throw err
    }
  }

  // Read a message signal from the blockchain that complies with the PS001 spec.
  async readMsgSignal (bchAddr, preface = 'MSG IPFS') {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }

      const txData = await this.getTransactions(bchAddr)

      const messages = []

      // Loop through each transaction detail.
      for (let i = 0; i < txData.length; i++) {
        const thisTxData = txData[i]

        // Loop through all the vout entries in this transaction.
        for (let j = 0; j < thisTxData.vout.length; j++) {
          // for (let j = 0; j < 5; j++) {
          const thisVout = thisTxData.vout[j]
          // console.log(`thisVout: ${JSON.stringify(thisVout,null,2)}`)

          // Assembly code representation of the transaction.
          const asm = thisVout.scriptPubKey.asm
          // console.log(`asm: ${asm}`)

          // Decode the transactions assembly code.
          const msg = this.decodeTransaction(asm)
          // console.log(`msg: ${msg}`)

          if (msg) {
            // Filter the code to see if it contains an IPFS hash And Subject.
            const data = this.filterMSG(msg, preface)
            if (data) {
              // Get sender Address
              const senderAddr = thisTxData.vout[0].scriptPubKey.addresses[0]

              data.sender = senderAddr
              data.txid = thisTxData.txid
              data.time = thisTxData.time
              messages.push(data)
            }
          }
        }
      }

      return messages
    } catch (err) {
      console.error('Error in readMsgSignal()')
      throw err
    }
  }

  // Sort the Transactions by the block height
  sortTxsByHeight (txs, sortingOrder = 'ASCENDING') {
    if (sortingOrder === 'ASCENDING') {
      return txs.sort((a, b) => a.height - b.height)
    }
    return txs.sort((a, b) => b.height - a.height)
  }

  // The original decodeTransaction() did not work on the front end. This function
  // is a hack around the issue.
  decodeTransaction (asm, prefix = '621') {
    try {
      if (typeof asm !== 'string') {
        throw new Error('asm must be a string')
      }

      const asmWords = asm.split(' ')
      // console.log(`asmWords: ${JSON.stringify(asmWords,null,2)}`)

      if (asmWords[0] === 'OP_RETURN' && asmWords[1] === prefix) {
        const msg = Buffer.from(asmWords[2], 'hex').toString()
        // console.log(`msg: ${msg}`)

        return msg
      }

      return false
    } catch (err) {
      console.warn('Error in decodeTransaction: ')
      return false
    }
  }

  filterMSG (msg, preface) {
    try {
      if (typeof preface !== 'string') throw new Error('preface is required')

      if (msg.indexOf(preface) > -1) {
        // console.log(`match found`)

        // Split the message between the preface and the payload.
        const parts = msg.split(`${preface} `)

        const payload = parts[1]

        const separatorIndex = payload.indexOf(' ')
        const hash = payload.slice(0, separatorIndex)
        const subject = payload.slice(separatorIndex + 1, payload.length)
        // console.log(`subject: ${subject}`)

        const msgPayload = {
          hash,
          subject
        }
        return msgPayload
      }
      return false
    } catch (err) {
      // Exit silently
      return false
    }
  }

  async findName (bchAddr) {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }

      const transactions = await this.bchjs.Electrumx.transactions(bchAddr)
      if (!transactions.success) {
        throw new Error(`No transaction history could be found for ${bchAddr}`)
      }
      const txsArr = this.sortTxsByHeight(transactions.transactions, 'DESCENDING')

      // Get the most recent transactions
      const txs = txsArr.slice(0, 20)

      // Loop through each transaction associated with this address.
      for (let i = 0; i < txs.length; i++) {
        const thisTXID = txs[i].tx_hash
        // console.log(`Inspecting TXID ${thisTXID}`)

        const thisTx = await this.bchjs.RawTransactions.getRawTransaction(
          thisTXID,
          true
        )
        // console.log(`thisTx: ${JSON.stringify(thisTx, null, 2)}`)

        // Loop through all the vout entries in this transaction.
        for (let j = 0; j < thisTx.vout.length; j++) {
          // for (let j = 0; j < 5; j++) {
          const thisVout = thisTx.vout[j]
          // console.log(`thisVout: ${JSON.stringify(thisVout,null,2)}`)

          // Assembly code representation of the transaction.
          const asm = thisVout.scriptPubKey.asm
          // Decode the transactions assembly code.
          const msg = this.decodeTransaction(asm, '365')
          // console.log(`msg: ${msg}`)

          if (msg) {
            return msg
          }
        }
      }
      return false
    } catch (err) {
      console.error('Error in findName()')
      throw err
    }
  }
}

module.exports = MemoLib
