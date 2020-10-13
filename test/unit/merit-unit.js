/*
  Unit tests for the merit library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// Mocking data libraries.
const mockDataLib = require('./mocks/merit-mocks')
let mockData

// Unit under test
const Merit = require('../../lib/merit')
let uut

describe('#merit.js', () => {
  let sandbox

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()

    mockData = Object.assign({}, mockDataLib)

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
      sandbox
        .stub(uut.bchjs.SLP.Utils, 'hydrateUtxos')
        .resolves(mockData.mockHydratedUtxos)

      const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

      const utxos = await uut.getTokenUtxos(addr)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      assert.isArray(utxos)
      assert.equal(
        utxos[0].tokenId,
        '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
      )
    })

    it('should handle errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .rejects(new Error('test error'))

        const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

        await uut.getTokenUtxos(addr)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getTokenQuantity', () => {
    it('should sum token quantity', () => {
      const utxos = mockData.mockTokenUtxos

      const tokenQty = uut.getTokenQuantity(utxos)

      assert.isNumber(tokenQty)
    })

    it('should handle errors', () => {
      try {
        uut.getTokenQuantity(1234)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'hydratedUtxos.map is not a function')
      }
    })
  })

  describe('#calcMerit', () => {
    it('should calculate age and merit', async () => {
      // Mock live network calls
      sandbox.stub(uut.bchjs.Blockchain, 'getBlockCount').resolves(656892)

      const hydratedUtxos = await uut.calcMerit(mockData.mockTokenUtxos)
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      assert.isArray(hydratedUtxos)
      assert.property(hydratedUtxos[0], 'age')
      assert.property(hydratedUtxos[0], 'merit')
    })

    it('should handle errors', async () => {
      try {
        // Mock live network calls
        sandbox.stub(uut.bchjs.Blockchain, 'getBlockCount').resolves(656892)

        await uut.calcMerit(1234)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'hydratedUtxos.map is not a function')
      }
    })

    it('should handle unconfirmed utxos', async () => {
      // Mock live network calls
      sandbox.stub(uut.bchjs.Blockchain, 'getBlockCount').resolves(656892)

      // Force the first mock UTXO to be unconfirmed.
      mockData.mockTokenUtxos[0].height = 0

      const hydratedUtxos = await uut.calcMerit(mockData.mockTokenUtxos)
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      assert.isArray(hydratedUtxos)
      assert.property(hydratedUtxos[0], 'age')
      assert.property(hydratedUtxos[0], 'merit')
    })
  })

  describe('#agMerit', () => {
    it('should aggregate merit across multiple UTXOs', async () => {
      // Mock live network calls.
      sandbox.stub(uut, 'getTokenUtxos').resolves(mockData.mockHydratedUtxos)
      sandbox.stub(uut, 'calcMerit').resolves(mockData.meritHydratedUtxos)

      const addr = 'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'

      const merit = await uut.agMerit(addr)
      console.log(`merit: ${merit}`)

      assert.isNumber(merit)
    })

    it('should handle errors', async () => {
      try {
        // Force and error.
        sandbox.stub(uut, 'getTokenUtxos').rejects(new Error('test error'))

        await uut.agMerit()

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })
})
