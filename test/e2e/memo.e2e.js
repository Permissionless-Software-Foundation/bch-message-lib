/*
  E2E tests of the memo.js library

  Before running this test, you must fund a BCH address and save the WIF private
  key to an environment variabled names WIF. That key will be used to write
  the messages to the blockchain.
*/

// Global npm libraries
const BchWallet = require('minimal-slp-wallet/index')
const assert = require('chai').assert

// Local libraries
const MemoLib = require('../../lib/memo')

// Get the WIF from the environment variable.
// Exit if one is not provided.
const WIF = process.env.WIF
if (!WIF) {
  console.log(
    'In order to OP_RETURN e2e tests, you must specify a WIF as an environment variable.'
  )
  process.exit(0)
}

describe('#memo.js', () => {
  let uut, wallet

  beforeEach(async () => {
    wallet = new BchWallet(WIF)

    await wallet.bchjs.Util.sleep(2000)

    uut = new MemoLib({ wallet })

    await uut.wallet.walletInfoPromise
  })

  describe('#writeMsgSignal', () => {
    it('should write a message signal to the blockchain using web2', async () => {
      const recievers = [
        'bitcoincash:qrnn49rx0p4xh78tts79utf0zv26vyru6vqtl9trd3'
      ]

      const hex = await uut.writeMsgSignal('testCID', recievers, 'test subject')

      // console.log('hex: ', hex)
      assert.isString(hex)

      const txid = await wallet.ar.sendTx(hex)

      console.log(`txid: ${txid}`)
      assert.isString(txid)
    })

    it('should write a message signal to the blockchain using web3', async () => {
      wallet = new BchWallet(WIF, {
        interface: 'consumer-api'
      })
      uut = new MemoLib({ wallet })
      await uut.wallet.walletInfoPromise

      const recievers = [
        'bitcoincash:qrnn49rx0p4xh78tts79utf0zv26vyru6vqtl9trd3'
      ]

      const hex = await uut.writeMsgSignal('testCID', recievers, 'test subject')

      // console.log('hex: ', hex)
      assert.isString(hex)

      const txid = await wallet.ar.sendTx(hex)
      console.log('txid: ', txid)

      assert.isString(txid)
    })
  })

  describe('#memoPush', () => {
    it('should write a memo.cash message to the blockchain using web2', async () => {
      const hex = await uut.memoPush('This is a test using web 2')

      // console.log('hex: ', hex)

      assert.isString(hex)

      const txid = await wallet.ar.sendTx(hex)
      console.log('txid: ', txid)

      assert.isString(txid)
    })

    it('should write a memo.cash message to the blockchain using web3', async () => {
      wallet = new BchWallet(WIF, {
        interface: 'consumer-api'
      })
      uut = new MemoLib({ wallet })
      await uut.wallet.walletInfoPromise

      const hex = await uut.memoPush('This is a test using web 3')

      // console.log('hex: ', hex)

      assert.isString(hex)

      const txid = await wallet.ar.sendTx(hex)
      console.log('txid: ', txid)

      assert.isString(txid)
    })

    it('should write a memo.cash message to the blockchain with a preface', async () => {
      const hex = await uut.memoPush('This is a test using web 2', 'TEST')

      // console.log('hex: ', hex)

      assert.isString(hex)

      const txid = await wallet.ar.sendTx(hex)
      console.log('txid: ', txid)

      assert.isString(txid)
    })
  })
})
