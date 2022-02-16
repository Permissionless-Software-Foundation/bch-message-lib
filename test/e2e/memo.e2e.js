/*
  E2E tests of the memo.js library
*/

// Global npm libraries
const BchWallet = require('minimal-slp-wallet/index')

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
    uut = new MemoLib({ wallet })

    await uut.wallet.walletInfoPromise
  })

  describe('#writeMsgSignal2', () => {
    it('should write a message signal to the blockchain', async () => {
      const recievers = [
        'bitcoincash:qrnn49rx0p4xh78tts79utf0zv26vyru6vqtl9trd3'
      ]

      const hex = await uut.writeMsgSignal2(
        'testCID',
        recievers,
        'test subject'
      )

      console.log('hex: ', hex)
    })
  })
})
