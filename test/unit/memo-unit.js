/*
  Unit tests for the memo.js library.
*/

// npm libraries
const chai = require('chai')
const sinon = require('sinon')
// const BCHJS = require('@psf/bch-js')
const clonedeep = require('lodash.clonedeep')

// Locally global variables.
const assert = chai.assert
const BchWallet = require('minimal-slp-wallet/index')

// Mocking data libraries.
const mockDataLib = require('./mocks/memo-mocks')
let mockData

// Unit under test
const MemoLib = require('../../lib/memo')

describe('#memo.js', () => {
  let sandbox, wallet, uut

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()

    mockData = clonedeep(mockDataLib)

    const WIF = 'L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2'
    wallet = new BchWallet(WIF, { noUpdate: true })
    uut = new MemoLib({ wallet })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should accept an injected instance of minimal-slp-wallet', () => {
      const WIF = 'L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2'
      wallet = new BchWallet(WIF, { noUpdate: true })

      const testUut = new MemoLib({ wallet })
      assert.property(testUut, 'wallet')
    })

    it('should throw an error if not passed a bch-js instance', () => {
      try {
        const testUut = new MemoLib()

        assert.fail('Unexpected result')
        console.log('testUut: ', testUut)
      } catch (err) {
        assert.include(
          err.message,
          'Instance of minimal-slp-wallet must be passed in the config object when instantiating.'
        )
      }
    })
  })

  describe('#getTransactions', () => {
    it('should get transaction details for an address', async () => {
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txList02)
      sandbox.stub(uut.wallet, 'getTxData').resolves(mockData.txData02)

      const bchAddr = 'bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j'
      const result = await uut.getTransactions(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'txid')
      assert.property(result[0], 'vin')
      assert.property(result[0], 'time')
      assert.equal(result.length, 1)
    })

    it('should handle and throw errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.wallet, 'getTransactions')
          .rejects(new Error('test error'))

        const bchAddr = 'bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j'
        await uut.getTransactions(bchAddr)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })

    it('should only scan MAX_TXIDS number of transactions', async () => {
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txList03)
      sandbox.stub(uut.wallet, 'getTxData').resolves(mockData.txData02)

      const bchAddr = 'bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j'
      const result = await uut.getTransactions(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'txid')
      assert.property(result[0], 'vin')
      assert.property(result[0], 'time')
      assert.equal(result.length, 2)
    })

    it('should throw an error if TX data can not be retrieved', async () => {
      try {
        sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txList02)
        sandbox.stub(uut.wallet, 'getTxData').resolves(false)

        const bchAddr = 'bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j'
        await uut.getTransactions(bchAddr)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Could not retrieve TX details.')
      }
    })
  })

  describe('#decodeTransaction', () => {
    it('should return false if asm is not provided.', async () => {
      try {
        const result = await uut.decodeTransaction()
        assert.isFalse(result)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return false if asm dont have OP_RETURN.', async () => {
      try {
        const asm =
          'OP_DUP OP_HASH160 28250c1c089774b9675ac8c48f297f58847835d0 OP_EQUALVERIFY OP_CHECKSIG'
        const result = await uut.decodeTransaction(asm)
        assert.isFalse(result)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should decode asm OP_RETURN.', async () => {
      try {
        const asm =
          'OP_RETURN 621 4d5347204950465320516d5431375078335763796471625a6e4b47556b4b62357457544d3759706f7a31554a314d48576e6743343978512041206d65737361676520666f7220796f75'
        const result = await uut.decodeTransaction(asm)
        assert.isString(result)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })
  })

  describe('#filterMSG', () => {
    it('should return false if msg is not provided', async () => {
      try {
        const result = await uut.filterMSG()
        assert.isFalse(result)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return false if msg preface is not provided', async () => {
      try {
        const msg =
          'MSG IPFS QmT17Px3WcydqbZnKGUkKb5tWTM7Ypoz1UJ1MHWngC49xQ A message for you'
        const result = await uut.filterMSG(msg)
        assert.isFalse(result)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return false if preface dont match', async () => {
      try {
        const msg =
          'MSG IPFS QmT17Px3WcydqbZnKGUkKb5tWTM7Ypoz1UJ1MHWngC49xQ A message for you'
        const result = await uut.filterMSG(msg, 'test')
        assert.isFalse(result)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })
  })

  describe('#sortTxsByHeight', () => {
    it('should sort the transactions', async () => {
      try {
        const transactions = mockData.transactions
        const result = await uut.sortTxsByHeight(transactions)
        assert.isArray(result)
        assert.equal(result.length, transactions.length)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should sort the transactions in descending order', async () => {
      try {
        const transactions = mockData.transactions
        const result = await uut.sortTxsByHeight(transactions, 'DESCENDING')
        assert.isArray(result)
        assert.equal(result.length, transactions.length)
      } catch (err) {
        // console.log(err)
        assert.equal(true, false, 'Unexpected result!')
      }
    })
  })

  describe('#readMsgSignal', () => {
    it('should throw an error if a bchAddr is not provided.', async () => {
      try {
        await uut.readMsgSignal()

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(
          err.message,
          'bchAddr must be a string of a BCH address.'
        )
      }
    })

    it('should throw error if no transaction history could be found.', async () => {
      try {
        sandbox
          .stub(uut, 'getTransactions')
          .rejects(new Error('No transaction history could be found'))

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        await uut.readMsgSignal(bchAddr)
        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        assert.include(err.message, 'No transaction history could be found')
      }
    })

    it('should return empty array if messages not found.', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves([mockData.mockTxData[1]])

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        const result = await uut.readMsgSignal(bchAddr)
        // console.log('result: ', result)

        assert.isArray(result)
        assert.equal(result.length, 0)
      } catch (err) {
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return empty array if preface not found.', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves(mockData.mockTxData)

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        const result = await uut.readMsgSignal(bchAddr, 'Test Preface')

        assert.isArray(result)
        assert.equal(result.length, 0)
      } catch (err) {
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return messages array.', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves(mockData.mockTxData)

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        const result = await uut.readMsgSignal(bchAddr)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        assert.isArray(result)
        assert.property(result[0], 'hash')
        assert.property(result[0], 'subject')
        assert.property(result[0], 'sender')
        assert.property(result[0], 'txid')
      } catch (err) {
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return messages array alternate preface provided.', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves(mockData.mockTxData)

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        const result = await uut.readMsgSignal(bchAddr, 'IPFS')
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        assert.isArray(result)
        assert.property(result[0], 'hash')
        assert.property(result[0], 'subject')
        assert.property(result[0], 'sender')
      } catch (err) {
        assert.equal(true, false, 'Unexpected result!')
      }
    })
  })

  describe('#memoRead', () => {
    it('should throw an error if a bchAddr is not provided.', async () => {
      try {
        await uut.memoRead()

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(
          err.message,
          'bchAddr must be a string of a BCH address.'
        )
      }
    })

    it('should throw error if no transaction history could be found.', async () => {
      try {
        sandbox
          .stub(uut, 'getTransactions')
          .rejects(new Error('No transaction history could be found'))

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        await uut.memoRead(bchAddr)
        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        assert.include(err.message, 'No transaction history could be found')
      }
    })

    it('should return empty array if messages not found.', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves([mockData.mockTxData[1]])

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        const result = await uut.memoRead(bchAddr)
        // console.log('result: ', result)

        assert.isArray(result)
        assert.equal(result.length, 0)
      } catch (err) {
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return empty array if preface not found.', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves(mockData.mockTxData)

        const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        const result = await uut.memoRead(bchAddr, 'Test Preface')

        assert.isArray(result)
        assert.equal(result.length, 0)
      } catch (err) {
        assert.equal(true, false, 'Unexpected result!')
      }
    })

    it('should return unfiltered memo.cash messages', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves(mockData.txData03)

        const bchAddr = 'bitcoincash:qppngav5s88devt4ypv3vhgj643q06tctcx8fnzewp'
        const result = await uut.memoRead(bchAddr)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        // Assert that the result is the size and shape expected.
        assert.isArray(result)
        assert.equal(result.length, 3)

        assert.property(result[0], 'subject')
        assert.property(result[0], 'sender')
        assert.property(result[0], 'txid')
        assert.property(result[0], 'time')
      } catch (err) {
        // console.log('err: ', err)
        assert.fail('Unexpected result!')
      }
    })

    it('should return filtered memo.cash messages', async () => {
      try {
        sandbox.stub(uut, 'getTransactions').resolves(mockData.txData03)

        const bchAddr = 'bitcoincash:qppngav5s88devt4ypv3vhgj643q06tctcx8fnzewp'
        const result = await uut.memoRead(bchAddr, 'TEST')
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        // Assert that the result is the size and shape expected.
        assert.isArray(result)
        assert.equal(result.length, 1)

        assert.property(result[0], 'preface')
        assert.property(result[0], 'subject')
        assert.property(result[0], 'sender')
        assert.property(result[0], 'txid')
        assert.property(result[0], 'time')
      } catch (err) {
        // console.log('err: ', err)
        assert.fail('Unexpected result!')
      }
    })
  })

  describe('#memoPush', () => {
    it('should catch, log, and throw errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.wallet.opReturn, 'createTransaction')
          .rejects(new Error('test error'))

        await uut.memoPush()

        assert.fail('Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })

    it('should return a hex transaction for writing data to the blockchain', async () => {
      // Mock dependencies
      sandbox
        .stub(uut.wallet.opReturn, 'createTransaction')
        .resolves({ hex: 'fake-hex' })

      const result = await uut.memoPush()
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.equal(result, 'fake-hex')
    })

    it('should return a hex transaction with a preface', async () => {
      // Mock dependencies
      sandbox
        .stub(uut.wallet.opReturn, 'createTransaction')
        .resolves({ hex: 'fake-hex' })

      const result = await uut.memoPush('test msg', 'PREFACE')
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.equal(result, 'fake-hex')
    })
  })

  describe('#writeMsgSignal', () => {
    it('should throw an error if a ipfsHash is not provided.', async () => {
      try {
        await uut.writeMsgSignal()

        assert.fail('Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'IPFS hash must be a string')
      }
    })

    it('should throw an error if receivers is not provided.', async () => {
      try {
        const ipfsHash = 'QmTfkCdUyU9enyFosTTjBjKgh4BabcCP6ARbPnPq5rTrfr'
        await uut.writeMsgSignal(ipfsHash)

        assert.fail('Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(
          err.message,
          'receivers must be an array of a BCH address.'
        )
      }
    })

    it('should throw an error if receivers is not an array.', async () => {
      try {
        const ipfsHash = 'QmTfkCdUyU9enyFosTTjBjKgh4BabcCP6ARbPnPq5rTrfr'
        const receivers =
          'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        await uut.writeMsgSignal(ipfsHash, receivers)

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(
          err.message,
          'receivers must be an array of a BCH address.'
        )
      }
    })

    it('should throw an error if receivers array is empty.', async () => {
      try {
        const ipfsHash = 'QmTfkCdUyU9enyFosTTjBjKgh4BabcCP6ARbPnPq5rTrfr'
        const receivers = []
        await uut.writeMsgSignal(ipfsHash, receivers)

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'receivers array can not be empty.')
      }
    })

    it('should throw an error if a subject is not provided.', async () => {
      try {
        const ipfsHash = 'QmTfkCdUyU9enyFosTTjBjKgh4BabcCP6ARbPnPq5rTrfr'
        const receivers = [
          'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
        ]
        await uut.writeMsgSignal(ipfsHash, receivers)

        assert.fail('Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'subject must be a string')
      }
    })

    it('should return a hex transaction for writing data to the blockchain', async () => {
      // Mock live network calls.
      sandbox
        .stub(uut.wallet.opReturn, 'createTransaction')
        .resolves({ hex: 'fake-hex' })

      const ipfsHash = 'QmT17Px3WcydqbZnKGUkKb5tWTM7Ypoz1UJ1MHWngC49xQ'
      const receivers = [
        'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
      ]
      const subject = 'A message for you'
      const result = await uut.writeMsgSignal(ipfsHash, receivers, subject)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
    })
  })

  // describe('#findName', () => {
  //   it('should throw an error if a bchAddr is not provided.', async () => {
  //     try {
  //       await uut.findName()
  //
  //       assert.equal(true, false, 'Unexpected result!')
  //     } catch (err) {
  //       // console.log(err)
  //       assert.include(
  //         err.message,
  //         'bchAddr must be a string of a BCH address.'
  //       )
  //     }
  //   })
  //
  //   it('Should throw error if no transaction history could be found.', async () => {
  //     try {
  //       sandbox
  //         .stub(uut, 'getTransactions')
  //         .rejects(new Error('No transaction history could be found'))
  //
  //       const bchAddr = 'qrgy9cg2fra4vrmjkryxa326kpt4kwfjpunmexhwwp'
  //       await uut.findName(bchAddr)
  //
  //       assert.equal(true, false, 'Unexpected result!')
  //     } catch (err) {
  //       assert.include(err.message, 'No transaction history could be found')
  //     }
  //   })
  //
  //   it('Should return false if the name not found.', async () => {
  //     try {
  //       sandbox.stub(uut, 'getTransactions').resolves(mockData.mockTxData)
  //
  //       const bchAddr = 'bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk'
  //       const result = await uut.findName(bchAddr)
  //
  //       assert.isFalse(result)
  //     } catch (err) {
  //       assert.equal(true, false, 'Unexpected result!')
  //     }
  //   })
  //
  //   it('Should return associated name.', async () => {
  //     try {
  //       sandbox.stub(uut, 'getTransactions').resolves(mockData.mockNameTXData)
  //
  //       const bchAddr = 'qrgy9cg2fra4vrmjkryxa326kpt4kwfjpunmexhwwp'
  //       const result = await uut.findName(bchAddr)
  //
  //       assert.isString(result)
  //     } catch (err) {
  //       assert.equal(true, false, 'Unexpected result!')
  //     }
  //   })
  // })
})
