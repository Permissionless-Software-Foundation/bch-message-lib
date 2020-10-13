/*
  Integration tests for the merit library.
*/

// npm libraries
const assert = require('chai').assert

// Unit under test
const Merit = require('../../lib/merit')
const uut = new Merit()

describe('#merit', () => {
  describe('#getTokenUtxos', () => {
    it('should return token UTXOs for an SLP address', async () => {
      const addr = 'simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g'

      const utxos = await uut.getTokenUtxos(addr)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      assert.isArray(utxos)
      assert.equal(
        utxos[0].tokenId,
        '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
      )
    })

    it('should return token UTXOs for a BCH address', async () => {
      const addr = 'bitcoincash:qz9l5w0fvp670a8r48apsv0xqek840320cf5czgcmk'

      const utxos = await uut.getTokenUtxos(addr)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      assert.isArray(utxos)
      assert.equal(
        utxos[0].tokenId,
        '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
      )
    })
  })
})
