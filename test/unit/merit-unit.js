/*
  Unit tests for the merit library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')
const clonedeep = require('lodash.clonedeep')

// Mocking data libraries.
const mockDataLib = require('./mocks/merit-mocks')
let mockData

// Unit under test
const Merit = require('../../lib/merit')
let uut

const PSF_TOKEN_ID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

describe('#merit.js', () => {
  let sandbox

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()

    mockData = clonedeep(mockDataLib)

    const config = {
      bchjs: new BCHJS()
    }
    uut = new Merit(config)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should accept an injected instance of bch-js', () => {
      const bchjs = new BCHJS()
      const config = { bchjs }

      const testUut = new Merit(config)
      assert.property(testUut, 'bchjs')
    })

    it('should throw an error if not passed a bch-js instance', () => {
      try {
        const testUut = new Merit()

        assert.fail('Unexpected result')
        console.log('testUut: ', testUut)
      } catch (err) {
        assert.include(
          err.message,
          'bch-js instance must be passed in the config object when instantiating.'
        )
      }
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

      const utxos = await uut.getTokenUtxos(addr, PSF_TOKEN_ID, 100)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      assert.isArray(utxos)
      assert.equal(
        utxos[0].tokenId,
        '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
      )
    })

    it('should return token UTXOs for an SLP address if delay is not specified', async () => {
      // Mock live network calls.
      sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)
      sandbox
        .stub(uut.bchjs.SLP.Utils, 'hydrateUtxos')
        .resolves(mockData.mockHydratedUtxos)

      const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

      const utxos = await uut.getTokenUtxos(addr, PSF_TOKEN_ID)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      assert.isArray(utxos)
      assert.equal(
        utxos[0].tokenId,
        '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
      )
    })

    it('should throw an error if tokenId is not specified.', async () => {
      try {
        const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

        await uut.getTokenUtxos(addr)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'tokenId must be specified!')
      }
    })

    it('should handle errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .rejects(new Error('test error'))

        const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

        await uut.getTokenUtxos(addr, PSF_TOKEN_ID)

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
      sandbox.stub(uut, 'getParentAge').resolves(mockData.mockParentUtxo2)

      const hydratedUtxos = await uut.calcMerit(
        mockData.mockTokenUtxos,
        'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'
      )
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      assert.isArray(hydratedUtxos)
      assert.property(hydratedUtxos[0], 'age')
      assert.property(hydratedUtxos[0], 'merit')
    })

    it('should handle errors', async () => {
      try {
        // Mock live network calls
        sandbox.stub(uut.bchjs.Blockchain, 'getBlockCount').resolves(656892)

        await uut.calcMerit(
          1234,
          'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'
        )

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Input hydratedUtxo must be an array')
      }
    })

    it('should handle unconfirmed utxos', async () => {
      // Mock live network calls
      sandbox.stub(uut.bchjs.Blockchain, 'getBlockCount').resolves(656892)
      sandbox.stub(uut, 'getParentAge').resolves(mockData.mockParentUtxo2)

      // Force the first mock UTXO to be unconfirmed.
      mockData.mockTokenUtxos[0].height = 0

      const hydratedUtxos = await uut.calcMerit(
        mockData.mockTokenUtxos,
        'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'
      )
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      assert.isArray(hydratedUtxos)
      assert.property(hydratedUtxos[0], 'age')
      assert.property(hydratedUtxos[0], 'merit')
    })

    it('should calculate merit accurately', async () => {
      // Mock live network calls
      sandbox.stub(uut.bchjs.Blockchain, 'getBlockCount').resolves(670242)
      sandbox.stub(uut, 'getParentAge').resolves(mockData.mockParentUtxo2)

      const hydratedUtxos = await uut.calcMerit(
        mockData.mockTokenUtxos,
        'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'
      )
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      assert.equal(hydratedUtxos[0].age, 21.46)
      assert.equal(hydratedUtxos[0].merit, 107)

      assert.equal(hydratedUtxos[1].age, 21.46)
      assert.equal(hydratedUtxos[1].merit, 64)

      assert.equal(hydratedUtxos[2].age, 21.46)
      assert.equal(hydratedUtxos[2].merit, 45)
    })
  })

  describe('#agMerit', () => {
    it('should throw an error if address is not specified', async () => {
      try {
        await uut.agMerit()

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'an address must be specified!')
      }
    })

    it('should throw an error if token ID is not specified', async () => {
      try {
        const addr = 'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'

        await uut.agMerit(addr)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'tokenId must be specified!')
      }
    })

    it('should aggregate merit across multiple UTXOs', async () => {
      // Mock live network calls.
      sandbox.stub(uut, 'getTokenUtxos').resolves(mockData.mockHydratedUtxos)
      sandbox.stub(uut, 'calcMerit').resolves(mockData.meritHydratedUtxos)

      const addr = 'simpleledger:qrrh8reyhqgrw0ly884snn4llxgs44lkfcly2vlrsh'

      const merit = await uut.agMerit(addr, PSF_TOKEN_ID)
      // console.log(`merit: ${merit}`)

      assert.isNumber(merit)
    })

    it('should handle errors', async () => {
      try {
        // Force an error.
        sandbox.stub(uut, 'getTokenUtxos').rejects(new Error('test error'))

        await uut.agMerit('test', PSF_TOKEN_ID)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#findTokenParent', () => {
    it('should get the parent of a token UTXO', async () => {
      // Mock network calls.
      sandbox
        .stub(uut.bchjs.RawTransactions, 'getRawTransaction')
        .resolves(mockData.mockTxInputs)
      sandbox
        .stub(uut.bchjs.Electrumx, 'transactions')
        .resolves(mockData.mockTxHistory)
      sandbox
        .stub(uut.bchjs.SLP.Utils, 'hydrateUtxos')
        .resolves(mockData.mockParentUtxo1)

      const addr = 'bitcoincash:qzjgc7cz99hyh98yp4y6z5j40uwnd78fw5lx2m4k9t'
      const txid =
        '548198c66640b14c4c175ba5f88d73c63b00f65bc3adc3ea2e94fc41919c6c75'

      const parentUtxo = await uut.findTokenParent(txid, addr)
      // console.log(`parentUtxo: ${JSON.stringify(parentUtxo, null, 2)}`)

      assert.equal(
        parentUtxo.tx_hash,
        'b7b28a03575bae28c421306fe6727d26c8a6c109b03dfdd276e7bfe32d83e850'
      )
      assert.equal(parentUtxo.isValid, true)
    })

    it('should get the *older* parent of a token UTXO', async () => {
      // Add mock data to force desired code path.
      mockData.mockTxHistory.transactions.push({
        height: 663000,
        tx_hash:
          'a5f3e9a08b0f592040b7538d0bf95b646c9e416bec0f909f81da6518ba32928f'
      })
      mockData.mockParentUtxo2.height = 663000
      mockData.mockTxInputs.vin[1].txid =
        'a5f3e9a08b0f592040b7538d0bf95b646c9e416bec0f909f81da6518ba32928f'

      // Mock network calls.
      sandbox
        .stub(uut.bchjs.RawTransactions, 'getRawTransaction')
        .resolves(mockData.mockTxInputs)
      sandbox
        .stub(uut.bchjs.Electrumx, 'transactions')
        .resolves(mockData.mockTxHistory)
      sandbox
        .stub(uut.bchjs.SLP.Utils, 'hydrateUtxos')
        .onCall(0)
        .resolves(mockData.mockParentUtxo1)
        .onCall(1)
        .resolves({ slpUtxos: [{ utxos: [mockData.mockParentUtxo2] }] })

      const addr = 'bitcoincash:qzjgc7cz99hyh98yp4y6z5j40uwnd78fw5lx2m4k9t'
      const txid =
        '548198c66640b14c4c175ba5f88d73c63b00f65bc3adc3ea2e94fc41919c6c75'

      const parentUtxo = await uut.findTokenParent(txid, addr)
      // console.log(`parentUtxo: ${JSON.stringify(parentUtxo, null, 2)}`)

      assert.equal(
        parentUtxo.tx_hash,
        'a5f3e9a08b0f592040b7538d0bf95b646c9e416bec0f909f81da6518ba32928f'
      )
      assert.equal(parentUtxo.height, 663000)
      assert.equal(parentUtxo.isValid, true)
    })

    it('should handle errors', async () => {
      try {
        // Force an error.
        sandbox
          .stub(uut.bchjs.RawTransactions, 'getRawTransaction')
          .rejects(new Error('test error'))

        const addr = 'bitcoincash:qzjgc7cz99hyh98yp4y6z5j40uwnd78fw5lx2m4k9t'
        const txid =
          '548198c66640b14c4c175ba5f88d73c63b00f65bc3adc3ea2e94fc41919c6c75'

        await uut.findTokenParent(txid, addr)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getParentAge', () => {
    it('should get the age of the oldest parent', async () => {
      // Mock network calls.
      sandbox
        .stub(uut, 'findTokenParent')
        .onCall(0)
        .resolves(mockData.mockParentUtxo2)
        .onCall(1)
        .resolves(false)

      const addr = 'bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d'
      const txid =
        'b79a8c9522ad707275f1fcc7fcd07affe0a4c6dd4abb20d0dac8c7b3320f4002'

      const parentUtxo = await uut.getParentAge(txid, addr)
      // console.log(`parentUtxo: ${JSON.stringify(parentUtxo, null, 2)}`)

      assert.equal(
        parentUtxo.tx_hash,
        'a5f3e9a08b0f592040b7538d0bf95b646c9e416bec0f909f81da6518ba32928f'
      )
      assert.equal(parentUtxo.isValid, true)
    })

    it('should handle errors', async () => {
      try {
        // Force an error.
        sandbox.stub(uut, 'findTokenParent').rejects(new Error('test error'))

        const addr = 'bitcoincash:qzjgc7cz99hyh98yp4y6z5j40uwnd78fw5lx2m4k9t'
        const txid =
          '548198c66640b14c4c175ba5f88d73c63b00f65bc3adc3ea2e94fc41919c6c75'

        await uut.getParentAge(txid, addr)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })
})
