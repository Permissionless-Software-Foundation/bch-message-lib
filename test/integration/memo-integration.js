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
const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()

// Locally global variables.
const assert = chai.assert
// const WIF = 'L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2'

// Unit under test
const MemoLib = require('../../lib/memo')
const uut = new MemoLib({ bchjs })

describe('#memo.js', () => {
  // describe('#memoPush', () => {
  //   it('should return a hex transaction for writing data to the blockchain', async () => {
  //     const result = await uut.memoPush('test', WIF)
  //     // console.log(`result: ${JSON.stringify(result, null, 2)}`)
  //
  //     assert.isString(result)
  //   })
  // })

  describe('#memoRead', () => {
    it('should return text written to the blockchain with memoPush()', async () => {
      const addr = 'bitcoincash:qppngav5s88devt4ypv3vhgj643q06tctcx8fnzewp'

      const result = await uut.memoRead(addr, 'IPFS UPDATE')
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'hash')
      assert.property(result[0], 'subject')
      assert.property(result[0], 'sender')
      assert.property(result[0], 'txid')
      assert.property(result[0], 'time')
    })
  })

  // describe('#writeMsgSignal', () => {
  //   it('should return a hex transaction for writing data to the blockchain', async () => {
  //     const WIF = 'L2rVamh4TxbTaTZ7oX9pJyNNS2E9ZbkbKs8rjNxZGuq57J2caxY2'
  //     const ipfsHash = 'QmT17Px3WcydqbZnKGUkKb5tWTM7Ypoz1UJ1MHWngC49xQ'
  //     const receivers = [
  //       'bitcoincash:qzxk8ecxm6drkcjtkrepesx5dd45fsvjauvxeeynfy'
  //     ]
  //     const subject = 'A message for you'
  //     const result = await uut.writeMsgSignal(WIF, ipfsHash, receivers, subject)
  //     // console.log(`result: ${JSON.stringify(result, null, 2)}`)
  //
  //     assert.isString(result)
  //   })
  // })

  describe('#getTransactions', () => {
    it('Should return an array of tx data using web 2', async () => {
      const bchAddr = 'bitcoincash:qqlktyx5djtd25nkqxmtm229ks4n0eaknsqtq36tgz'
      const result = await uut.getTransactions(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'txid')
      assert.property(result[0], 'vin')
      assert.property(result[0], 'time')
    })
  })

  describe('#readMsgSignal', () => {
    it('Should return messages array', async () => {
      const bchAddr = 'bitcoincash:qzzchl3xlcmmctk36e8dla4ltpr3ef6dsyxm06e8l5'
      const result = await uut.readMsgSignal(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'hash')
      assert.property(result[0], 'subject')
      assert.property(result[0], 'sender')
    })
  })

  describe('#findName', () => {
    it('Should return associated name', async () => {
      const bchAddr = 'qrgy9cg2fra4vrmjkryxa326kpt4kwfjpunmexhwwp'
      const result = await uut.findName(bchAddr)
      console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
    })

    it('Should search the tx history until it finds a name', async () => {
      try {
        // const bchAddr = 'bitcoincash:qzjgc7cz99hyh98yp4y6z5j40uwnd78fw5lx2m4k9t'
        const bchAddr = 'bitcoincash:qpcfny8hlcsfv5w6v3rpnvgsudkhtwpnyv056cdef0'

        const result = await uut.findName(bchAddr, 0)
        console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        console.log('Error: ', err)
      }
    })
  })
})
