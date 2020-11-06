# bch-message-lib
An npm library for processing messages on the Bitcoin Cash blockchain using bch-js.

This is a utility library that does processing of messages on the Bitcoin Cash blockchain. These messages primarily use the [memo.cash protocol](https://memo.cash/protocol), and the end target for this library is the [message.fullstack.cash](https://message.fullstack.cash/) web app.

These are the primary features provided by this library:
- Push a normal memo.cash message to the blockchain.
- Push an [PS001](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md) encrypt-msg message as a memo.cash message.
- Retrieve the memo.cash name for a BCH address.
- Retrieving message notifications and IPFS links from the blockchain that comply with [PS001](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md) specification.
- Calculate  the average coin age, merit, and PSF token balance for a BCH address.


# Licence
[MIT](LICENSE.md)
