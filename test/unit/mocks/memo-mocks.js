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
const transactions = [
  {
    height: 656382,
    tx_hash: 'ca10e610e86f9740e923265d2ef557e56b89e34bbd9888e434e50c45316b6104'
  },
  {
    height: 654722,
    tx_hash: 'e15735666de66210681e4b20649b3b85acfe4560d4e49b7ddbede478248d4ba9'
  },
  {
    height: 654583,
    tx_hash: '26bf2a1fa647dd29a69276d2879e49248205b63c391c7285f2296fe54ce2a611'
  }

]
// Vouts with Permissionless Software Foundation Specification 001 (PS001)
const transactionVout = [
  {
    value: 0.00420288,
    n: 0,
    scriptPubKey: {
      asm: 'OP_DUP OP_HASH160 66b2156f71629c89f5bf882cb3920b0e1e4d4fa8 OP_EQUALVERIFY OP_CHECKSIG',
      hex: '76a91466b2156f71629c89f5bf882cb3920b0e1e4d4fa888ac',
      reqSigs: 1,
      type: 'pubkeyhash',
      addresses: ['bitcoincash:qpnty9t0w93fez04h7yzevujpv8pun204qv6yfuahk']
    }
  },
  {
    value: 0,
    n: 1,
    scriptPubKey: {
      asm: 'OP_RETURN 621 4d5347204950465320516d5431375078335763796471625a6e4b47556b4b62357457544d3759706f7a31554a314d48576e6743343978512041206d65737361676520666f7220796f75',
      hex: '6a026d02494d5347204950465320516d5431375078335763796471625a6e4b47556b4b62357457544d3759706f7a31554a314d48576e6743343978512041206d65737361676520666f7220796f75',
      type: 'nulldata'
    }
  },
  {
    value: 0,
    n: 1,
    scriptPubKey: {
      asm: 'OP_RETURN 365 44616e69656c2048756d626572746f',
      hex: '6a026d02494d5347204950465320516d5431375078335763796471625a6e4b47556b4b62357457544d3759706f7a31554a314d48576e6743343978512041206d65737361676520666f7220796f75',
      type: 'nulldata'
    }
  }
]
// Vouts without Permissionless Software Foundation Specification 001 (PS001)

const transactionVout2 = [
  {
    value: 0.00013534,
    n: 0,
    scriptPubKey: {
      asm: 'OP_DUP OP_HASH160 65616371b219c2c54eafc52d572eacaa80422c33 OP_EQUALVERIFY OP_CHECKSIG',
      hex: '76a91465616371b219c2c54eafc52d572eacaa80422c3388ac',
      reqSigs: 1,
      type: 'pubkeyhash'
    }
  },
  {
    value: 0,
    n: 1,
    scriptPubKey: {
      asm: 'OP_RETURN 621 5041594c4f41442033353166366263383462353563646335626233393733393339373439393234343437633839363061623465313735633336373561643833636636353362313262',
      hex: '6a026d02485041594c4f41442033353166366263383462353563646335626233393733393339373439393234343437633839363061623465313735633336373561643833636636353362313262',
      type: 'nulldata'
    }
  }
]

module.exports = {
  mockUtxo,
  transactions,
  transactionVout,
  transactionVout2
}
