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

module.exports = {
  mockUtxos,
  mockHydratedUtxos
}
