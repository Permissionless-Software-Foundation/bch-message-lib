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

const mockTxInputs = {
  txid: '548198c66640b14c4c175ba5f88d73c63b00f65bc3adc3ea2e94fc41919c6c75',
  hash: '548198c66640b14c4c175ba5f88d73c63b00f65bc3adc3ea2e94fc41919c6c75',
  version: 2,
  size: 660,
  locktime: 0,
  vin: [
    {
      txid: 'b7b28a03575bae28c421306fe6727d26c8a6c109b03dfdd276e7bfe32d83e850',
      vout: 2,
      scriptSig: {
        asm: '304402202598a38f7aa4257c7444a1047e5709b1d518961691f22431c7c1d90062c28ccc02204d47d662be0e06930f78ce78eee06ca55d8bac0ce8a1073e6f9e6ce48f4c36bb[ALL|FORKID] 033a24d13b45eaf53bebc7da5b7ee79a39615790b4fb16dab048fdcc5abd3764ef',
        hex: '47304402202598a38f7aa4257c7444a1047e5709b1d518961691f22431c7c1d90062c28ccc02204d47d662be0e06930f78ce78eee06ca55d8bac0ce8a1073e6f9e6ce48f4c36bb4121033a24d13b45eaf53bebc7da5b7ee79a39615790b4fb16dab048fdcc5abd3764ef'
      },
      sequence: 4294967295
    },
    {
      txid: '5ed4f4d8a02693048975a98c59c7b8b04b2c0656b080595826f043728df46edc',
      vout: 1,
      scriptSig: {
        asm: '3044022037c16bb5d36adf8abb74a963a093cf5212ed487b0214be37a90dbb127f14bf2f0220133bca5460fa7b2364adf7210a431c42f0cef61f2e2685e70fce4194ca14b73a[ALL|FORKID] 033a24d13b45eaf53bebc7da5b7ee79a39615790b4fb16dab048fdcc5abd3764ef',
        hex: '473044022037c16bb5d36adf8abb74a963a093cf5212ed487b0214be37a90dbb127f14bf2f0220133bca5460fa7b2364adf7210a431c42f0cef61f2e2685e70fce4194ca14b73a4121033a24d13b45eaf53bebc7da5b7ee79a39615790b4fb16dab048fdcc5abd3764ef'
      },
      sequence: 4294967295
    },
    {
      txid: 'b94dee98eef2fd8e946b57c559e16ea737d2344cd0f1fbcf550be86b4b3f1f0c',
      vout: 2,
      scriptSig: {
        asm: '304402201f6545811bb74104a4582522fa5a1ccb17fed9f94bba7a91a629575f217b2ecd02206035ebba70b9d01b440739ecbe97a9a70666e14fb051d5adc4dcad93221317b4[ALL|FORKID] 033a24d13b45eaf53bebc7da5b7ee79a39615790b4fb16dab048fdcc5abd3764ef',
        hex: '47304402201f6545811bb74104a4582522fa5a1ccb17fed9f94bba7a91a629575f217b2ecd02206035ebba70b9d01b440739ecbe97a9a70666e14fb051d5adc4dcad93221317b44121033a24d13b45eaf53bebc7da5b7ee79a39615790b4fb16dab048fdcc5abd3764ef'
      },
      sequence: 4294967295
    }
  ],
  vout: []
}

const mockTxHistory = {
  success: true,
  transactions: [
    {
      height: 664946,
      tx_hash: 'b7b28a03575bae28c421306fe6727d26c8a6c109b03dfdd276e7bfe32d83e850'
    },
    {
      height: 665022,
      tx_hash: '01ea002c96b76fb8ac7646aaa70af8684813e3b48baa8de6c68dcb2a6407027c'
    },
    {
      height: 665023,
      tx_hash: '91bc75f2c39c57e3fb0a6c1a07632220ef5fe04095f68e8a2719665d41fc645f'
    }
  ]
}

const mockParentUtxo1 = {
  slpUtxos: [
    {
      utxos: [
        {
          height: 664946,
          tx_hash: 'b7b28a03575bae28c421306fe6727d26c8a6c109b03dfdd276e7bfe32d83e850',
          tx_pos: 2,
          txid: 'b7b28a03575bae28c421306fe6727d26c8a6c109b03dfdd276e7bfe32d83e850',
          vout: 2,
          utxoType: 'token',
          transactionType: 'send',
          tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
          tokenTicker: 'PSF',
          tokenName: 'Permissionless Software Foundation',
          tokenDocumentUrl: 'psfoundation.cash',
          tokenDocumentHash: '',
          decimals: 8,
          tokenType: 1,
          tokenQty: '72.65766975',
          isValid: true
        }
      ]
    }
  ]
}

const mockParentUtxo2 = {
  height: 667151,
  tx_hash: 'a5f3e9a08b0f592040b7538d0bf95b646c9e416bec0f909f81da6518ba32928f',
  tx_pos: 2,
  txid: 'a5f3e9a08b0f592040b7538d0bf95b646c9e416bec0f909f81da6518ba32928f',
  vout: 2,
  utxoType: 'token',
  transactionType: 'send',
  tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
  tokenTicker: 'PSF',
  tokenName: 'Permissionless Software Foundation',
  tokenDocumentUrl: 'psfoundation.cash',
  tokenDocumentHash: '',
  decimals: 8,
  tokenType: 1,
  tokenQty: '100.24446712',
  isValid: true
}

module.exports = {
  mockUtxos,
  mockHydratedUtxos,
  mockTokenUtxos,
  meritHydratedUtxos,
  mockTxInputs,
  mockTxHistory,
  mockParentUtxo1,
  mockParentUtxo2
}
