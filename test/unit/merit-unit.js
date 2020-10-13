/*
  Unit tests for the merit library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// Mocking data libraries.
const mockData = require('./mocks/merit-mocks')

// Unit under test
const Merit = require('../../lib/merit')
let uut

describe('#merit.js', () => {
  let sandbox

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new Merit()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should accept an injected instance of bch-js', () => {
      const bchjs = new BCHJS()
      const config = { bchjs }

      const testUut = new Merit(config)
      assert.property(testUut, 'bchjs')
    })
  })

  describe('#getTokenUtxos', () => {
    it('should return token UTXOs for an SLP address', async () => {
      // Mock live network calls.
      sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)
      sandbox.stub(uut.bchjs.SLP.Utils, 'hydrateUtxos').resolves(mockData.mockHydratedUtxos)

      const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

      const utxos = await uut.getTokenUtxos(addr)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      assert.isArray(utxos)
      assert.equal(utxos[0].tokenId, '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0')
    })

    it('should handle errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.bchjs.Electrumx, 'utxo').rejects(new Error('test error'))

        const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

        await uut.getTokenUtxos(addr)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
