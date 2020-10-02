/*
  Integration tests for the memo.js library.

  This is the private key/address used in the tests. You will need to send
  10K sats to the address below in order to run these integration tests.

  WIF: L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2
  BCH address: bitcoincash:qpkpeg0sftrs0n77hnf7z7zjrwhs9epaey5shataft
  SLP address: simpleledger:qpkpeg0sftrs0n77hnf7z7zjrwhs9epaeyctux7ah4
*/

// npm libraries
const chai = require('chai')

// Locally global variables.
const assert = chai.assert
const WIF = 'L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2'

// Unit under test
const MemoLib = require('../../lib/memo')
const uut = new MemoLib()

describe('#memo.js', () => {
  describe('#memoPush', () => {
    it('should return a hex transaction for writing data to the blockchain', async () => {
      const result = await uut.memoPush('test', WIF)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
    })
  })
})
