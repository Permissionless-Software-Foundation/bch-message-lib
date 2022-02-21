/*
  Library for functionality concerned with memo.cash

  memo.cash protocol:
  https://memo.cash/protocol
*/

// npm libraries

// Maximum number of TXIDs to scan. This number should be divisible by 20.
const MAX_TXIDS = 40

class MemoLib {
  constructor (config = {}) {
    // Require instance of minimal-slp-wallet when instantiating this library.
    if (!config.wallet) {
      throw new Error(
        'Instance of minimal-slp-wallet must be passed in the config object when instantiating.'
      )
    }
    this.wallet = config.wallet

    console.log(
      `Initializing MemoLib with interface: ${this.wallet.ar.interface}`
    )

    // Encapsulate dependencies
  }

  // This function expects a BCH address as input.
  // It will retrieve the transaction history for the address and return an
  // array of expanded transaction details for each transaction.
  async getTransactions (bchAddr) {
    try {
      // Get transaction history for the address.
      const transactions = await this.wallet.getTransactions(bchAddr)
      // console.log(`transactions: ${JSON.stringify(transactions, null, 2)}`)

      // Set the maximum number of TXIDs to search for message signals.
      // (Should be divisible by 20)
      let txLength = transactions.length
      if (txLength > MAX_TXIDS) txLength = MAX_TXIDS

      let txData = []

      // Loop through 20 TXIDs at a time.
      for (let i = 0; i < txLength; i += 20) {
        // Get the next set of 20 txids
        const txids = []
        for (let j = i; j < i + 20; j++) {
          // Break out of loop if there are less than 20 elements.
          if (!transactions[j]) break

          txids.push(transactions[j].tx_hash)
        }
        // console.log(`txids: ${JSON.stringify(txids, null, 2)}`)

        // Get tx details for 20 txids.
        const txDataRun = await this.wallet.getTxData(txids)
        // console.log(`txDataRun: ${JSON.stringify(txDataRun, null, 2)}`)

        if (!txDataRun) throw new Error('Could not retrieve TX details.')

        // txData.push(txDataRun)
        txData = txData.concat(txDataRun)
      }

      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)
      return txData
    } catch (err) {
      console.error('Error in memo.js/getTransactions()')
      throw err
    }
  }

  // Decode the OP_RETURN in a transaction to see if it matches a memo.cash
  // protocol (default), or other specified prefix.
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

  // Read a message signal from the blockchain that complies with the PS001 spec.
  async readMsgSignal (bchAddr, preface = 'MSG IPFS') {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }

      const txData = await this.getTransactions(bchAddr)
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
              // console.log(`thisTxData: ${JSON.stringify(thisTxData, null, 2)}`)

              // Get sender Address
              const senderAddr = thisTxData.vin[0].address

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

  // Read a message signal from the blockchain published with the memo.cash
  // protocol prefix of 6d02. This function compliments memoPush().
  // ASSUMPTION: OP_RETURN is the first output on the TX.
  async memoRead (bchAddr, preface = '') {
    try {
      if (typeof bchAddr !== 'string') {
        throw new Error('bchAddr must be a string of a BCH address.')
      }

      const txData = await this.getTransactions(bchAddr)
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)
      // console.log(`txData.length: ${txData.length}`)

      const messages = []

      // Loop through each transaction detail.
      for (let i = 0; i < txData.length; i++) {
        const thisTxData = txData[i]

        // ASSUMPTION: OP_RETURN is the first output on the TX.
        const thisVout = thisTxData.vout[0]
        // console.log(`thisVout: ${JSON.stringify(thisVout, null, 2)}`)

        // Assembly code representation of the transaction.
        const asm = thisVout.scriptPubKey.asm
        // console.log(`asm: ${asm}`)

        // Decode the transactions assembly code.
        const msg = this.decodeTransaction(asm, '621')
        // console.log(`msg: ${msg}`)

        if (msg) {
          // Filter the code to see if it contains an IPFS hash And Subject.
          let data = false
          if (preface) {
            // If the preface does not exist in the message, then skip it.
            if (!msg.includes(preface)) continue

            // Split the message between the preface and the payload.
            const parts = msg.split(`${preface} `)

            // Return just the payload part.
            const payload = parts[1]

            data = {
              preface,
              subject: payload
            }
          } else {
            data = {}
            data.subject = msg
          }

          if (data) {
            // Get sender Address
            const senderAddr = thisTxData.vin[0].address

            data.sender = senderAddr
            data.txid = thisTxData.txid
            data.time = thisTxData.time
            messages.push(data)
          }
        }
      }

      return messages
    } catch (err) {
      console.error('Error in memoRead()')
      throw err
    }
  }

  // Push a message to the BCH blockchain using the memo.cash protocol,
  // using the 6d02 prefix for a memo message.
  // Returns a hex string of a transaction, ready to be broadcast to the network.
  async memoPush (msg, preface = '') {
    try {
      const prefix = '6d02'

      let totalMsg = `${msg}`
      if (preface) {
        totalMsg = `${preface} ${msg}`
      }

      const { hex } = await this.wallet.opReturn.createTransaction(
        this.wallet.walletInfo,
        this.wallet.utxos.utxoStore.bchUtxos,
        totalMsg,
        prefix
      )

      return hex
    } catch (err) {
      console.error('Error in memoPush()')
      throw err
    }
  }

  // Write a message signal to the blockchain. This message complies with PS001
  // protocol for message transfer and signaling:
  // https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md
  async writeMsgSignal (ipfsHash, receivers, subject) {
    try {
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

      const prefix = '6dd2'
      const msg = `MSG IPFS ${ipfsHash} ${subject}`

      const outputs = receivers.map(x => {
        return {
          address: x,
          amountSat: 550
        }
      })

      // console.log(
      //   `this.wallet.utxos.utxoStore: ${JSON.stringify(
      //     this.wallet.utxos.utxoStore
      //   )}`
      // )

      const { hex } = await this.wallet.opReturn.createTransaction(
        this.wallet.walletInfo,
        this.wallet.utxos.utxoStore.bchUtxos,
        msg,
        prefix,
        outputs
      )

      return hex
    } catch (err) {
      console.error('Error in writeMsgSignal()')
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

  // This method scans raw transaction data and looks for a 'name' transaction
  // with a memo.cash protocol entry for assigning a handle/name to a BCH
  // address.
  //
  // numChunks is the number of 20-tx 'chunks' to look through. The more, the
  // longer it takes. The default is to only look at the last 20 txs.
  // Set to 0, to search the entire history.
  // async findName (bchAddr, numChunks = 1) {
  //   try {
  //     if (typeof bchAddr !== 'string') {
  //       throw new Error('bchAddr must be a string of a BCH address.')
  //     }
  //
  //     const txData = await this.getTransactions(bchAddr, numChunks)
  //     // console.log(`txData[0]: ${JSON.stringify(txData[0], null, 2)}`)
  //     // console.log(`txData.length: ${txData.length}`)
  //     // console.log(`txData[0].length: ${txData[0].length}`)
  //
  //     // Loop through each transaction detail.
  //     for (let i = 0; i < txData.length; i++) {
  //       const thisTxData = txData[i]
  //       // console.log(`processing tx #${i}. TXID: ${thisTxData.txid}`)
  //
  //       // Loop through all the vout entries in this transaction.
  //       for (let j = 0; j < thisTxData.vout.length; j++) {
  //         const thisVout = thisTxData.vout[j]
  //         // console.log(`thisVout: ${JSON.stringify(thisVout,null,2)}`)
  //
  //         // Assembly code representation of the transaction.
  //         const asm = thisVout.scriptPubKey.asm
  //
  //         // Decode the transactions assembly code.
  //         const msg = this.decodeTransaction(asm, '365')
  //         // console.log(`msg: ${msg}`)
  //
  //         if (msg) {
  //           return msg
  //         }
  //       }
  //     }
  //     return false
  //   } catch (err) {
  //     console.error('Error in findName()')
  //     throw err
  //   }
  // }
}

module.exports = MemoLib
