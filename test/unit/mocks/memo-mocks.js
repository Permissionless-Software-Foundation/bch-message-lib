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
      asm:
        'OP_DUP OP_HASH160 66b2156f71629c89f5bf882cb3920b0e1e4d4fa8 OP_EQUALVERIFY OP_CHECKSIG',
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
      asm:
        'OP_RETURN 621 4d5347204950465320516d5431375078335763796471625a6e4b47556b4b62357457544d3759706f7a31554a314d48576e6743343978512041206d65737361676520666f7220796f75',
      hex:
        '6a026d02494d5347204950465320516d5431375078335763796471625a6e4b47556b4b62357457544d3759706f7a31554a314d48576e6743343978512041206d65737361676520666f7220796f75',
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
      asm:
        'OP_DUP OP_HASH160 65616371b219c2c54eafc52d572eacaa80422c33 OP_EQUALVERIFY OP_CHECKSIG',
      hex: '76a91465616371b219c2c54eafc52d572eacaa80422c3388ac',
      reqSigs: 1,
      type: 'pubkeyhash'
    }
  },
  {
    value: 0,
    n: 1,
    scriptPubKey: {
      asm:
        'OP_RETURN 621 5041594c4f41442033353166366263383462353563646335626233393733393339373439393234343437633839363061623465313735633336373561643833636636353362313262',
      hex:
        '6a026d02485041594c4f41442033353166366263383462353563646335626233393733393339373439393234343437633839363061623465313735633336373561643833636636353362313262',
      type: 'nulldata'
    }
  }
]

const mockTxHistory = {
  success: true,
  transactions: [
    {
      height: 657409,
      tx_hash:
        '5bac5e115650ed012144d4c0e6bc0d22c233334266cc563035e5276775b46349'
    },
    {
      height: 657409,
      tx_hash:
        '62037e426ff402f5632a89ba248000e91c7d5c1cf1a5f326d0538ab51d9309fc'
    },
    {
      fee: 500,
      height: -1,
      tx_hash:
        'd9e728b5ffb79af33cf3d3b8cc7bb85c6bb0817f85af5db64b65d995f90d057c'
    }
  ]
}

const mockTxData = [
  {
    txid: '5bac5e115650ed012144d4c0e6bc0d22c233334266cc563035e5276775b46349',
    hash: '5bac5e115650ed012144d4c0e6bc0d22c233334266cc563035e5276775b46349',
    version: 2,
    size: 226,
    locktime: 0,
    vin: [
      {
        txid:
          '052c4d15ff6857b671f8d7dfb0f37618338022416df1e374ccc8a67e8dafb5e5',
        vout: 0,
        scriptSig: {
          asm:
            '30450221009b62ae22eb688bb6ec195c8a09c8d91790fb836251447027422ee26436813fdd022056dd46baf99e426376da84f786a9b5e507775e5fb7ac541fbd725c28f440e935[ALL|FORKID] 02991e32acae8315556cdf42e6ff932240e84c930fd924641c7a74a8e7b5af39b1',
          hex:
            '4830450221009b62ae22eb688bb6ec195c8a09c8d91790fb836251447027422ee26436813fdd022056dd46baf99e426376da84f786a9b5e507775e5fb7ac541fbd725c28f440e935412102991e32acae8315556cdf42e6ff932240e84c930fd924641c7a74a8e7b5af39b1'
        },
        sequence: 4294967295
      }
    ],
    vout: [
      {
        value: 0.00002,
        n: 0,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 3b89d998586a141d3a7a2df16901354ce34687f4 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a9143b89d998586a141d3a7a2df16901354ce34687f488ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j']
        }
      },
      {
        value: 0.00313221,
        n: 1,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 773b0235194124a1636fd37bd1c67a5aba5ef477 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914773b0235194124a1636fd37bd1c67a5aba5ef47788ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qpmnkq34r9qjfgtrdlfhh5wx0fdt5hh5wuxcpka43p']
        }
      }
    ],
    hex:
      '0200000001e5b5af8d7ea6c8cc74e3f16d412280331876f3b0dfd7f871b65768ff154d2c05000000006b4830450221009b62ae22eb688bb6ec195c8a09c8d91790fb836251447027422ee26436813fdd022056dd46baf99e426376da84f786a9b5e507775e5fb7ac541fbd725c28f440e935412102991e32acae8315556cdf42e6ff932240e84c930fd924641c7a74a8e7b5af39b1ffffffff02d0070000000000001976a9143b89d998586a141d3a7a2df16901354ce34687f488ac85c70400000000001976a914773b0235194124a1636fd37bd1c67a5aba5ef47788ac00000000',
    blockhash:
      '0000000000000000010fd21d00c570b465a06eaaa74d1a6db485a356c33918d5',
    confirmations: 1,
    time: 1602869946,
    blocktime: 1602869946
  },
  {
    txid: '62037e426ff402f5632a89ba248000e91c7d5c1cf1a5f326d0538ab51d9309fc',
    hash: '62037e426ff402f5632a89ba248000e91c7d5c1cf1a5f326d0538ab51d9309fc',
    version: 2,
    size: 192,
    locktime: 0,
    vin: [
      {
        txid:
          '5bac5e115650ed012144d4c0e6bc0d22c233334266cc563035e5276775b46349',
        vout: 0,
        scriptSig: {
          asm:
            '3045022100d6e6f80f35097ea6e6ddcf7ae45df67b9dddae6cde8266e11b5264b2b5a6068e022073da0dea7a9ae4033ab9a72a94ee3bfafe4b86f5bd031adc90547eedca79afc2[ALL|FORKID] 0396d26dab80d54187cd2ceadeb678eab9fcf56f8c5f538b7c7d6f1cae69249545',
          hex:
            '483045022100d6e6f80f35097ea6e6ddcf7ae45df67b9dddae6cde8266e11b5264b2b5a6068e022073da0dea7a9ae4033ab9a72a94ee3bfafe4b86f5bd031adc90547eedca79afc241210396d26dab80d54187cd2ceadeb678eab9fcf56f8c5f538b7c7d6f1cae69249545'
        },
        sequence: 4294967295
      }
    ],
    vout: [
      {
        value: 0.00001788,
        n: 0,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 3b89d998586a141d3a7a2df16901354ce34687f4 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a9143b89d998586a141d3a7a2df16901354ce34687f488ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j']
        }
      }
    ],
    hex:
      '02000000014963b4756727e5353056cc66423333c2220dbce6c0d4442101ed5056115eac5b000000006b483045022100d6e6f80f35097ea6e6ddcf7ae45df67b9dddae6cde8266e11b5264b2b5a6068e022073da0dea7a9ae4033ab9a72a94ee3bfafe4b86f5bd031adc90547eedca79afc241210396d26dab80d54187cd2ceadeb678eab9fcf56f8c5f538b7c7d6f1cae69249545ffffffff01fc060000000000001976a9143b89d998586a141d3a7a2df16901354ce34687f488ac00000000',
    blockhash:
      '0000000000000000010fd21d00c570b465a06eaaa74d1a6db485a356c33918d5',
    confirmations: 1,
    time: 1602869946,
    blocktime: 1602869946
  },
  {
    txid: 'd9e728b5ffb79af33cf3d3b8cc7bb85c6bb0817f85af5db64b65d995f90d057c',
    hash: 'd9e728b5ffb79af33cf3d3b8cc7bb85c6bb0817f85af5db64b65d995f90d057c',
    version: 2,
    size: 313,
    locktime: 0,
    vin: [
      {
        txid:
          'dec496dcec2d26f7fe8cf8b490e233a8b5da4dafef41938edf44c1ba2c26a0f1',
        vout: 2,
        scriptSig: {
          asm:
            '3044022056cf684ebda4ca98393612fb9d2f6d577dfa984ad6a620891bfecca240cbefa902200dfa1931d705f337fd81e9f7209d91737fcb426ff6a98bdb07474ad1651967ad[ALL|FORKID] 03d581ba64c8f7b58fc0eec9697ad8de5fa7e3a8499fcacb2455a23283b40ca600',
          hex:
            '473044022056cf684ebda4ca98393612fb9d2f6d577dfa984ad6a620891bfecca240cbefa902200dfa1931d705f337fd81e9f7209d91737fcb426ff6a98bdb07474ad1651967ad412103d581ba64c8f7b58fc0eec9697ad8de5fa7e3a8499fcacb2455a23283b40ca600'
        },
        sequence: 4294967295
      }
    ],
    vout: [
      {
        value: 0.00074962,
        n: 0,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 92a16d521c56f201924a28e8f1d580952c6cf551 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91492a16d521c56f201924a28e8f1d580952c6cf55188ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qzf2zm2jr3t0yqvjfg5w3uw4sz2jcm842y8efvnw2t']
        }
      },
      {
        value: 0,
        n: 1,
        scriptPubKey: {
          asm:
            'OP_RETURN 621 4d5347204950465320516d4e676f427a4470423937563139617372546671696b6e5a416f373731356f5539446a366a706b6a663352327a2046697273742054657374204d657373616765',
          hex:
            '6a026d024a4d5347204950465320516d4e676f427a4470423937563139617372546671696b6e5a416f373731356f5539446a366a706b6a663352327a2046697273742054657374204d657373616765',
          type: 'nulldata'
        }
      },
      {
        value: 0.00000546,
        n: 2,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 3b89d998586a141d3a7a2df16901354ce34687f4 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a9143b89d998586a141d3a7a2df16901354ce34687f488ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qqacnkvctp4pg8f60gklz6gpx4xwx3587sh60ejs2j']
        }
      }
    ],
    hex:
      '0200000001f1a0262cbac144df8e9341efaf4ddab5a833e290b4f88cfef7262decdc96c4de020000006a473044022056cf684ebda4ca98393612fb9d2f6d577dfa984ad6a620891bfecca240cbefa902200dfa1931d705f337fd81e9f7209d91737fcb426ff6a98bdb07474ad1651967ad412103d581ba64c8f7b58fc0eec9697ad8de5fa7e3a8499fcacb2455a23283b40ca600ffffffff03d2240100000000001976a91492a16d521c56f201924a28e8f1d580952c6cf55188ac00000000000000004f6a026d024a4d5347204950465320516d4e676f427a4470423937563139617372546671696b6e5a416f373731356f5539446a366a706b6a663352327a2046697273742054657374204d65737361676522020000000000001976a9143b89d998586a141d3a7a2df16901354ce34687f488ac00000000'
  }
]

module.exports = {
  mockUtxo,
  transactions,
  transactionVout,
  transactionVout2,
  mockTxHistory,
  mockTxData
}
