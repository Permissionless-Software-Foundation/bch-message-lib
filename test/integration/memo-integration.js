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
// const BCHJS = require('@psf/bch-js')
// const bchjs = new BCHJS()
const BchWallet = require('minimal-slp-wallet/index')

// Locally global variables.
const assert = chai.assert

// Unit under test
// const RESTURL = 'https://free-bch.fullstack.cash'
const MemoLib = require('../../lib/memo')

describe('#memo.js', () => {
  let uut, wallet

  beforeEach(() => {
    wallet = new BchWallet(undefined, { noUpdate: true })
    uut = new MemoLib({ wallet })
  })

  describe('#getTransactions', () => {
    it('Should return an array of tx data using web 2', async () => {
      const bchAddr = 'bitcoincash:qqlktyx5djtd25nkqxmtm229ks4n0eaknsqtq36tgz'
      const result = await uut.getTransactions(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'txid')
      assert.property(result[0], 'vin')
      assert.property(result[0], 'vout')
    })

    it('Should return an array of tx data using web 3', async () => {
      wallet = new BchWallet(undefined, {
        noUpdate: true,
        interface: 'consumer-api'
      })
      uut = new MemoLib({ wallet })
      // uut = new MemoLib({ wallet, interface: 'consumer-api' })

      const bchAddr = 'bitcoincash:qqlktyx5djtd25nkqxmtm229ks4n0eaknsqtq36tgz'
      const result = await uut.getTransactions(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'txid')
      assert.property(result[0], 'vin')
      assert.property(result[0], 'vout')
    })
  })

  describe('#readMsgSignal', () => {
    it('Should return messages array using web 2', async () => {
      const bchAddr = 'bitcoincash:qzzchl3xlcmmctk36e8dla4ltpr3ef6dsyxm06e8l5'
      const result = await uut.readMsgSignal(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'hash')
      assert.property(result[0], 'subject')
      assert.property(result[0], 'sender')
    })

    it('Should return messages array using web 3', async () => {
      wallet = new BchWallet(undefined, {
        noUpdate: true,
        interface: 'consumer-api'
      })
      uut = new MemoLib({ wallet })

      const bchAddr = 'bitcoincash:qzzchl3xlcmmctk36e8dla4ltpr3ef6dsyxm06e8l5'
      const result = await uut.readMsgSignal(bchAddr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'hash')
      assert.property(result[0], 'subject')
      assert.property(result[0], 'sender')
    })
  })

  describe('#memoRead', () => {
    it('should return text written to the blockchain with memoPush()', async () => {
      const addr = 'bitcoincash:qz3s6t7x7040mc7yfm7e88lw0uutd444eujqejjhwr'

      const result = await uut.memoRead(addr)
      console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)

      // Expecting 3 results from that address.
      assert.equal(result.length, 3)

      // assert.property(result[0], 'hash')
      assert.property(result[0], 'subject')
      assert.property(result[0], 'sender')
      assert.property(result[0], 'txid')
      assert.property(result[0], 'time')
    })

    it('should filter messages with a prefix', async () => {
      const addr = 'bitcoincash:qz3s6t7x7040mc7yfm7e88lw0uutd444eujqejjhwr'

      const result = await uut.memoRead(addr, 'TEST')
      console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)

      // Expecting 1 results from that address.
      assert.equal(result.length, 1)

      // assert.property(result[0], 'hash')
      assert.property(result[0], 'subject')
      assert.property(result[0], 'sender')
      assert.property(result[0], 'txid')
      assert.property(result[0], 'time')
    })

    it('should retrieve IPFS hash for a pointer address', async () => {
      // Use web 3 infra.
      wallet = new BchWallet(undefined, {
        noUpdate: true,
        interface: 'consumer-api'
      })
      uut = new MemoLib({ wallet })

      const addr = 'bitcoincash:qppngav5s88devt4ypv3vhgj643q06tctcx8fnzewp'

      const result = await uut.memoRead(addr, 'IPFS UPDATE')
      console.log(`result: ${JSON.stringify(result, null, 2)}`)
    })
  })

  // describe('#findName', () => {
  //   it('Should return associated name', async () => {
  //     const bchAddr = 'qrgy9cg2fra4vrmjkryxa326kpt4kwfjpunmexhwwp'
  //     const result = await uut.findName(bchAddr)
  //     console.log(`result: ${JSON.stringify(result, null, 2)}`)
  //
  //     assert.isString(result)
  //   })
  //
  //   it('Should search the tx history until it finds a name', async () => {
  //     try {
  //       // const bchAddr = 'bitcoincash:qzjgc7cz99hyh98yp4y6z5j40uwnd78fw5lx2m4k9t'
  //       const bchAddr = 'bitcoincash:qpcfny8hlcsfv5w6v3rpnvgsudkhtwpnyv056cdef0'
  //
  //       const result = await uut.findName(bchAddr, 0)
  //       console.log(`result: ${JSON.stringify(result, null, 2)}`)
  //     } catch (err) {
  //       console.log('Error: ', err)
  //     }
  //   })
  // })
})
