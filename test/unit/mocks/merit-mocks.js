/*
  Mocks for the merit.js library.
*/

const mockUtxos = {
  success: true,
  utxos: [
    {
      utxos: [
        {
          height: 653410,
          tx_hash:
            'f7906500f405c9d361dff3c2d7934fda69806ce109a52c23e5fb612a3a49bc9f',
          tx_pos: 292,
          value: 547
        },
        {
          height: 656702,
          tx_hash:
            'c4a4f9a7b712ddd3dc0aa98fa7b93aabd81919d911a56939ab311b0fed9c6d29',
          tx_pos: 2,
          value: 546
        }
      ],
      address: 'bitcoincash:qz9l5w0fvp670a8r48apsv0xqek840320cf5czgcmk'
    }
  ]
}

const mockHydratedUtxos = {
  slpUtxos: [
    {
      utxos: [
        {
          height: 653410,
          tx_hash:
            'f7906500f405c9d361dff3c2d7934fda69806ce109a52c23e5fb612a3a49bc9f',
          tx_pos: 292,
          value: 547,
          satoshis: 547,
          txid:
            'f7906500f405c9d361dff3c2d7934fda69806ce109a52c23e5fb612a3a49bc9f',
          vout: 292,
          isValid: false
        },
        {
          height: 656702,
          tx_hash:
            'c4a4f9a7b712ddd3dc0aa98fa7b93aabd81919d911a56939ab311b0fed9c6d29',
          tx_pos: 2,
          value: 546,
          satoshis: 546,
          txid:
            'c4a4f9a7b712ddd3dc0aa98fa7b93aabd81919d911a56939ab311b0fed9c6d29',
          vout: 2,
          utxoType: 'token',
          transactionType: 'send',
          tokenId:
            '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
          tokenTicker: 'PSF',
          tokenName: 'Permissionless Software Foundation',
          tokenDocumentUrl: 'psfoundation.cash',
          tokenDocumentHash: '',
          decimals: 8,
          tokenType: 1,
          tokenQty: 167040.16905955,
          isValid: true
        }
      ],
      address: 'bitcoincash:qz9l5w0fvp670a8r48apsv0xqek840320cf5czgcmk'
    }
  ]
}

const mockTokenUtxos = [
  {
    height: 656881,
    tx_hash: '7b0813748b9861b0487bae20568d9fde4691f92c1b8c2db944d6a2186d7394b1',
    tx_pos: 1,
    value: 546,
    satoshis: 546,
    txid: '7b0813748b9861b0487bae20568d9fde4691f92c1b8c2db944d6a2186d7394b1',
    vout: 1,
    utxoType: 'token',
    transactionType: 'send',
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    tokenTicker: 'PSF',
    tokenName: 'Permissionless Software Foundation',
    tokenDocumentUrl: 'psfoundation.cash',
    tokenDocumentHash: '',
    decimals: 8,
    tokenType: 1,
    tokenQty: 5,
    isValid: true
  },
  {
    height: 656883,
    tx_hash: 'f9e1c54f561477749a46c0ed6377150b32a9f876989e09f79a2038afbad9cd7e',
    tx_pos: 1,
    value: 546,
    satoshis: 546,
    txid: 'f9e1c54f561477749a46c0ed6377150b32a9f876989e09f79a2038afbad9cd7e',
    vout: 1,
    utxoType: 'token',
    transactionType: 'send',
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    tokenTicker: 'PSF',
    tokenName: 'Permissionless Software Foundation',
    tokenDocumentUrl: 'psfoundation.cash',
    tokenDocumentHash: '',
    decimals: 8,
    tokenType: 1,
    tokenQty: 3,
    isValid: true
  },
  {
    height: 656886,
    tx_hash: 'b616cd9e19c5182cf026b2ed3ca8352799a797531c06528821cc14b00011b2cc',
    tx_pos: 1,
    value: 546,
    satoshis: 546,
    txid: 'b616cd9e19c5182cf026b2ed3ca8352799a797531c06528821cc14b00011b2cc',
    vout: 1,
    utxoType: 'token',
    transactionType: 'send',
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    tokenTicker: 'PSF',
    tokenName: 'Permissionless Software Foundation',
    tokenDocumentUrl: 'psfoundation.cash',
    tokenDocumentHash: '',
    decimals: 8,
    tokenType: 1,
    tokenQty: 2.12345678,
    isValid: true
  }
]

const meritHydratedUtxos = [
  {
    height: 656881,
    tx_hash: '7b0813748b9861b0487bae20568d9fde4691f92c1b8c2db944d6a2186d7394b1',
    tx_pos: 1,
    value: 546,
    satoshis: 546,
    txid: '7b0813748b9861b0487bae20568d9fde4691f92c1b8c2db944d6a2186d7394b1',
    vout: 1,
    utxoType: 'token',
    transactionType: 'send',
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    tokenTicker: 'PSF',
    tokenName: 'Permissionless Software Foundation',
    tokenDocumentUrl: 'psfoundation.cash',
    tokenDocumentHash: '',
    decimals: 8,
    tokenType: 1,
    tokenQty: 5,
    isValid: true,
    age: 11,
    merit: 55
  },
  {
    height: 656883,
    tx_hash: 'f9e1c54f561477749a46c0ed6377150b32a9f876989e09f79a2038afbad9cd7e',
    tx_pos: 1,
    value: 546,
    satoshis: 546,
    txid: 'f9e1c54f561477749a46c0ed6377150b32a9f876989e09f79a2038afbad9cd7e',
    vout: 1,
    utxoType: 'token',
    transactionType: 'send',
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    tokenTicker: 'PSF',
    tokenName: 'Permissionless Software Foundation',
    tokenDocumentUrl: 'psfoundation.cash',
    tokenDocumentHash: '',
    decimals: 8,
    tokenType: 1,
    tokenQty: 3,
    isValid: true,
    age: 9,
    merit: 27
  },
  {
    height: 656886,
    tx_hash: 'b616cd9e19c5182cf026b2ed3ca8352799a797531c06528821cc14b00011b2cc',
    tx_pos: 1,
    value: 546,
    satoshis: 546,
    txid: 'b616cd9e19c5182cf026b2ed3ca8352799a797531c06528821cc14b00011b2cc',
    vout: 1,
    utxoType: 'token',
    transactionType: 'send',
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    tokenTicker: 'PSF',
    tokenName: 'Permissionless Software Foundation',
    tokenDocumentUrl: 'psfoundation.cash',
    tokenDocumentHash: '',
    decimals: 8,
    tokenType: 1,
    tokenQty: 2.12345678,
    isValid: true,
    age: 6,
    merit: 12
  }
]

module.exports = {
  mockUtxos,
  mockHydratedUtxos,
  mockTokenUtxos,
  meritHydratedUtxos
}
