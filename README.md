# bch-message-lib

An npm library for processing messages on the Bitcoin Cash blockchain. This package depends on [minimal-slp-wallet](https://www.npmjs.com/package/minimal-slp-wallet).

This is a utility library that does processing of messages on the Bitcoin Cash blockchain. These messages primarily use the [memo.cash protocol](https://memo.cash/protocol) or the [PS001 Media Sharing Protocol](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md).

These are the primary features provided by this library:

- Push a normal memo.cash message to the blockchain.
- Read normal memo.cash messages from the blockchain.
- Filter memo.cash messages that are prefaced with a flag.
- Push an [PS001](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md) message to the blockchain.
- Retrieving message notifications and IPFS links from the blockchain that comply with [PS001](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md) specification.

By using minimal-slp-wallet, this library can function through the Web 2 infrastructure provided by [FullStack.cash](https://fullstack.cash), or the free, community-driven Web 3 infrastructure provided by the [PSF Cash Stack](https://psfoundation.cash/blog/web-3-cash-stack).

## Installation

`npm install --save bch-message-lib`

## Usage

Below are examples of how to use this library in your own code.

### Instantiate the Library

Instantiate the library by first instantiating minimal-slp-wallet and passing that instance to the constructor.

```js
// Import the libraries.
const BchWallet = require('minimal-slp-wallet/index')
const BchMsg = require('bch-message-lib/index')

// Instantiate the wallet.
const wallet = new BchWallet(WIF)
await uut.wallet.walletInfoPromise

// Instantiate the message library.
const msgLib = new BchMsg({ wallet })
```

### Read Memo.cash Posts for an Address

```js
const addr = 'bitcoincash:qz3s6t7x7040mc7yfm7e88lw0uutd444eujqejjhwr'

const result = await uut.memoRead(addr)
console.log(`result: ${JSON.stringify(result, null, 2)}`)
```

### Filter Memo.cash Posts for an Address

```js
const addr = 'bitcoincash:qz3s6t7x7040mc7yfm7e88lw0uutd444eujqejjhwr'

const result = await uut.memoRead(addr, 'TEST')
console.log(`result: ${JSON.stringify(result, null, 2)}`)
```

### Write a Memo.cash Post to the Blockchain

```js
const hex = await uut.memoPush('This is a memo.cash post')
const txid = await wallet.ar.sendTx(hex)
console.log('txid: ', txid)
```

### Read a PS001 message from the Blockchain

```js
const bchAddr = 'bitcoincash:qzzchl3xlcmmctk36e8dla4ltpr3ef6dsyxm06e8l5'
const result = await uut.readMsgSignal(bchAddr)
console.log(`result: ${JSON.stringify(result, null, 2)}`)
```

### Write a PS001 message from the Blockchain

```js
const recievers = ['bitcoincash:qrnn49rx0p4xh78tts79utf0zv26vyru6vqtl9trd3']

const hex = await uut.writeMsgSignal('testCID', recievers, 'test subject')
const txid = await wallet.ar.sendTx(hex)
console.log(`txid: ${txid}`)
```

# Licence

[MIT](LICENSE.md)
