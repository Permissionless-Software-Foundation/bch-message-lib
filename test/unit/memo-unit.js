/*
  Unit tests for the memo.js library.
*/

// npm libraries
const chai = require('chai')
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// Locally global variables.
const assert = chai.assert

// Mocking data libraries.
const mockData = require('./mocks/memo-mocks')

// Unit under test
const MemoLib = require('../../lib/memo')
const uut = new MemoLib()

describe('#memo.js', () => {
  let sandbox

  // Restore the sandbox before each test.
  beforeEach(() => (sandbox = sinon.createSandbox()))
  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should accept an injected instance of bch-js', () => {
      const bchjs = new BCHJS()
      const config = { bchjs }

      const testUut = new MemoLib(config)
      assert.property(testUut, 'bchjs')
    })
  })

  describe('#memoPush', () => {
    it('should throw an error if a WIF is not provided.', async () => {
      try {
        await uut.memoPush()

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'WIF must be a string of a private key')
      }
    })

    it('should return a hex transaction for writing data to the blockchain', async () => {
      // Mock live network calls.
      sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxo)

      const WIF = 'L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2'
      const result = await uut.memoPush('test', WIF)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
    })
  })
})
