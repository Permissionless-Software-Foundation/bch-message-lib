/*
  Library for functionality concerned with memo.cash

  memo.cash protocol:
  https://memo.cash/protocol
*/

// npm libraries

class MemoLib {
  constructor (config) {
    if (!config || !config.bchjs) {
      throw new Error(
        'bch-js instance must be passed in the config object when instantiating.'
      )
    }
    this.bchjs = config.bchjs
  }

  // Push a message to the BCH blockchain using the memo.cash protocol,
  // using the 6d02 prefix for a memo message.
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
      const utxo = this.bchjs.Utxo.findBiggestUtxo(u.utxos)
      // console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)

      // instance of transaction builder
      const transactionBuilder = new this.bchjs.TransactionBuilder()

      const originalAmount = utxo.value
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

  // Read a message signal from the blockchain published with the memo.cash
  // protocol prefix of 6d02. This function compliments memoPush().
  async memoRead (bchAddr, preface = '', numChunks = 1) {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }
      if (typeof numChunks !== 'number') {
        throw new Error('numChunks must be a number.')
      }

      const txData = await this.getTransactions(bchAddr, numChunks)
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

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
          const msg = this.decodeTransaction(asm, '621')
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
      console.error('Error in memoRead()')
      throw err
    }
  }

  // Write a message signal to the blockchain. This message complies with PS001
  // protocol for message transfer and signaling:
  // https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md
  async writeMsgSignal (wif, ipfsHash, receivers, subject) {
    try {
      // Input Validations
      if (typeof wif !== 'string') {
        throw new Error('WIF must be a string of a private key.')
      }
      if (typeof ipfsHash !== 'string') {
        throw new Error('IPFS hash must be a string.')
      }
      if (!Array.isArray(receivers)) {
        throw new Error('receivers must be an array of a BCH address.')
      }
      if (!receivers.length) {
        throw new Error('receivers array can not be empty.')
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
      const utxo = this.bchjs.Utxo.findBiggestUtxo(u.utxos)

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
      // First output is the 'change' or return BCH.
      transactionBuilder.addOutput(
        bchAddr,
        originalAmount - fee - dust * receivers.length
      )

      // Generate the memo.cash OP_RETURN data.
      const script = [
        this.bchjs.Script.opcodes.OP_RETURN,
        Buffer.from('6dd2', 'hex'),
        Buffer.from(`MSG IPFS ${ipfsHash} ${subject}`)
      ]
      const data = this.bchjs.Script.encode2(script)

      // Add the OP_RETURN as the second output of the transaction.
      transactionBuilder.addOutput(data, 0)

      // Send a dust amount to the recipients to signal
      // to them that they have a message.
      for (let i = 0; i < receivers.length; i++) {
        transactionBuilder.addOutput(receivers[i], dust)
      }

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

  // This function expects a BCH address as input.
  // It will retrieve the transaction history for the address and return an
  // array of expanded transaction details for each transaction.
  // By default, it will only return the 20 most recent transactions.
  // The number of 20-tx 'chunks' are specified by numChunks. Setting the
  // value to 0 will return all transactions in the addresses history.
  // delay is an aritificial delay in milliseconds.
  async getTransactions (bchAddr, numChunks = 1, delay = 500) {
    try {
      // Get transaction history for the address.
      const transactions = await this.bchjs.Electrumx.transactions(bchAddr)
      if (!transactions.success) {
        throw new Error(`No transaction history could be found for ${bchAddr}`)
      }
      // console.log(`transactions: ${JSON.stringify(transactions, null, 2)}`)

      const txsArr = await this.bchjs.Electrumx.sortAllTxs(
        transactions.transactions
      )
      // console.log(`sortedTxs: ${JSON.stringify(sortedTxs, null, 2)}`)

      // Break the transaction list into a 2-d array. An array who's elements
      // are arrays of 20 txids each.
      // This lets us make bulk calls to get info on 20 txs at time, and reduces
      // the number of REST API calls.
      const txs = this.bchjs.Util.chunk20(txsArr)
      // console.log(`txs: ${JSON.stringify(txs, null, 2)}`)

      // Holds the final 'chunks' after filtering.
      let txsChunks = []

      // Filter the TX quantity based on the numChunks input.
      //
      // If the actual number of txs are less than requested, use the maximum
      // amount of txs.
      if (numChunks === 0 || txs.length <= numChunks) {
        txsChunks = txs
      } else {
        // else, filter the number of txs based on the numChunks input.
        for (let i = 0; i < numChunks; i++) {
          txsChunks.push(txs[i])
        }
      }
      // console.log(`txsChunks: ${JSON.stringify(txsChunks, null, 2)}`)

      let txData = []
      for (let i = 0; i < txsChunks.length; i++) {
        // Filter out just the txids.
        const txids = txsChunks[i].map(elem => elem.tx_hash)
        // console.log(`txids: ${JSON.stringify(txids, null, 2)}`)

        // Add an aritificial delay between requests.
        await this.bchjs.Util.sleep(delay)

        // Get tx details for 20 txids.
        const txDataResult = await this.bchjs.RawTransactions.getRawTransaction(
          txids,
          true
        )
        // console.log(`chunkTxData: ${JSON.stringify(txData, null, 2)}`)

        txData = [...txData, ...txDataResult]
      }

      return txData
    } catch (err) {
      console.error('Error in memo.js/getTransactions()')
      throw err
    }
  }

  // Read a message signal from the blockchain that complies with the PS001 spec.
  async readMsgSignal (bchAddr, preface = 'MSG IPFS', numChunks = 1) {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }
      if (typeof numChunks !== 'number') {
        throw new Error('numChunks must be a number.')
      }

      const txData = await this.getTransactions(bchAddr, numChunks)
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

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
          const msg = this.decodeTransaction(asm, '-21101')
          // console.log(`msg: ${msg}`)

          if (msg) {
            // Filter the code to see if it contains an IPFS hash And Subject.
            const data = this.filterMSG(msg, preface)
            if (data) {
              // console.log(`message data: ${JSON.stringify(data, null, 2)}`)

              // Get sender Address
              const senderAddr = thisTxData.vout[0].scriptPubKey.addresses[0]

              data.sender = senderAddr
              data.txid = thisTxData.txid

              data.time = thisTxData.time
              // console.log(`data.time: ${data.time}`)

              // For unconfirmed transactions, generate a timestamp for them.
              if (!data.time) {
                const now = new Date()
                data.time = Math.floor(now.getTime() / 1000)
              }

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

  // Decode the OP_RETURN in a transaction to see if it matches a memo.cash
  // protocol.
  decodeTransaction (asm, prefix = '621') {
    try {
      if (typeof asm !== 'string') {
        throw new Error('asm must be a string')
      }

      const asmWords = asm.split(' ')
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

  // Filter OP_RETURN data and look for data that matches the PS001 specification
  // for sending messages.
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

  // This method scans raw transaction data and looks for a 'name' transaction
  // with a memo.cash protocol entry for assigning a handle/name to a BCH
  // address.
  //
  // numChunks is the number of 20-tx 'chunks' to look through. The more, the
  // longer it takes. The default is to only look at the last 20 txs.
  // Set to 0, to search the entire history.
  async findName (bchAddr, numChunks = 1) {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }

      const txData = await this.getTransactions(bchAddr, numChunks)
      // console.log(`txData[0]: ${JSON.stringify(txData[0], null, 2)}`)
      // console.log(`txData.length: ${txData.length}`)
      // console.log(`txData[0].length: ${txData[0].length}`)

      // Loop through each transaction detail.
      for (let i = 0; i < txData.length; i++) {
        const thisTxData = txData[i]
        // console.log(`processing tx #${i}. TXID: ${thisTxData.txid}`)

        // Loop through all the vout entries in this transaction.
        for (let j = 0; j < thisTxData.vout.length; j++) {
          const thisVout = thisTxData.vout[j]
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
