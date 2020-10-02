/*
  A mocking library for util.js unit tests.
  A mocking library contains data to use in place of the data that would come
  from an external dependency.
*/

'use strict'

const mockUtxo = {
  success: true,
  utxos: [
    {
      height: 655433,
      tx_hash:
        '6a6938e51353a31bc7991fa2e1aea1e85ce35930027f3fd73b12ee844df5836a',
      tx_pos: 0,
      value: 10000
    }
  ]
}

module.exports = {
  mockUtxo
}
