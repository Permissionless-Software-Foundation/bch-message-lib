/*
  This library calculates metrics that are used to assess an addresses 'merit' or
  standing within the PSF community. Merit it defined as:

  merit = token quantity x token age
*/

// npm libraries

// const PSF_TOKEN_ID =
//   '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

class Merit {
  constructor (config) {
    if (!config || !config.bchjs) {
      throw new Error(
        'bch-js instance must be passed in the config object when instantiating.'
      )
    }

    // Encapsulate dependencies
    this.bchjs = config.bchjs
  }

  // Given an address, this function retrieves the UTXOs associated with the
  // address, hydrates them with SLP data, and returns the ones that match
  // token ID. This is the first step in calculating merit.
  //
  // Specify the selected SLP token with tokenId.
  // utxoDelay is a number representing the number of milliseconds to wait
  // between UTXOs, in order to prevent triggering rate limits.
  async getTokenUtxos (address, tokenId, utxoDelay) {
    try {
      if (!tokenId) {
        throw new Error('tokenId must be specified!')
      }

      address = this.bchjs.SLP.Address.toCashAddress(address)

      // Get UTXO data.
      const utxos = await this.bchjs.Electrumx.utxo([address])
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      // Hydrate UTXO data with SLP info.
      const hydratedUtxos = await this.bchjs.SLP.Utils.hydrateUtxos(
        utxos.utxos,
        { utxoDelay }
      )
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      // Filter out the UTXOs that represent PSF tokens.
      const matchedUtxos = hydratedUtxos.slpUtxos[0].utxos.filter(
        elem => elem.tokenId && elem.tokenId.includes(tokenId)
      )

      return matchedUtxos
    } catch (err) {
      console.error('Error in merit.js/getTokenUtxos()')
      throw err
    }
  }

  // Expects the output from getTokenUtxos() as the input to this function.
  // This function adds up all the PSF tokens and returns the total amount
  // of PSF tokens held by the address.
  getTokenQuantity (hydratedUtxos) {
    try {
      let qty = 0

      hydratedUtxos.map(elem => {
        qty += Number(elem.tokenQty)
      })

      return qty
    } catch (err) {
      console.error('Error in merit.js/getTokenQuantity()')
      throw err
    }
  }

  // Expects the output from getTokenUtxos() as the input to this function.
  // Returns an array of UTXOs. Each element will have additional 'merit'
  // and 'age' properties.
  // The formula for calculating merit is:
  // merit = token quantity x number of days held
  // There are 144 blocks in a day (on average).
  async calcMerit (hydratedUtxos, address) {
    try {
      if (!Array.isArray(hydratedUtxos)) {
        throw new Error('Input hydratedUtxo must be an array')
      }

      // Convert the address to `bitcoincash` format.
      const bchAddr = this.bchjs.SLP.Address.toCashAddress(address)
      // console.log(`bchAddr: ${bchAddr}`)

      const BLOCKS_IN_A_DAY = 144
      const currentBlockHeight = await this.bchjs.Blockchain.getBlockCount()
      // console.log(`currentBlockHeight: ${currentBlockHeight}`)

      // Calculate merit and age for each UTXO.
      const updatedUtxos = []
      for (let i = 0; i < hydratedUtxos.length; i++) {
        const elem = hydratedUtxos[i]
        // console.log(`elem: ${JSON.stringify(elem, null, 2)}`)

        let height = elem.height

        // Get the token UTXO info for the oldest parent of this UTXO,
        // originating from this same address.
        const parentUtxo = await this.getParentAge(elem.tx_hash, bchAddr)
        // console.log(`parentUtxo: ${JSON.stringify(parentUtxo, null, 2)}`)

        // Replace the height of the UTXO if it has an older parent.
        if (parentUtxo) height = parentUtxo.height

        // Calculate the age of the UTXO.
        let age = (currentBlockHeight - height) / BLOCKS_IN_A_DAY

        // Round the age to two decimal places.
        age = this.bchjs.Util.floor2(age)

        // Corner case: unconfirmed UTXOs.
        if (elem.height === 0) age = 0

        const merit = Number(elem.tokenQty) * age

        // Add these new properties to the UTXO
        elem.age = age
        elem.merit = Math.floor(merit) // Round to an integer

        updatedUtxos.push(elem)
      }

      return updatedUtxos
    } catch (err) {
      console.error('Error in merit.js/getMerit()')
      throw err
    }
  }

  // Walks the UTXO history to find the oldest parent from the same address.
  // Returns the old block height for the tokens history that originates
  // from the address.
  //
  // This prevent people from destorying their token age when sending tokens.
  async getParentAge (txid, addr) {
    try {
      let oldestUtxo = false // Default value.

      // Loop through the DAG to find the oldest parent token UTXO.
      // for(let i=0; i < 9; i++) {
      // let i = 0
      while (txid) {
        // console.log(`Iteration ${i}`)
        const parentUtxo = await this.findTokenParent(txid, addr)
        // console.log(`parentUtxo: ${JSON.stringify(parentUtxo, null, 2)}\n`)

        txid = parentUtxo.tx_hash
        // i++

        if (parentUtxo) oldestUtxo = parentUtxo
      }

      return oldestUtxo
    } catch (err) {
      console.error('Error in merit.js/getParentAge()')
      throw err
    }
  }

  // Given an SLP token txid and an address as input, this function will return
  // the UTXO information for the parent UTXO, if that UTXO originated from the
  // same address. Otherwise, it returns false, to indicate the parent transaction
  // could not be found in the transaction history for that address.
  //
  // This is a primative function that is called by getAge, that
  // looks for the oldest SLP token UTXO that originated from the address.
  //
  // CT 6/5/21: Updated this function to handle the corner-case of when there
  // are multiple parent UTXOs from the same address, as illustrated in this TXID:
  // 78f8d849032dd34a3f86fa87e7eeb7ccb5c07794bd910d5b9fab29d7706c3b3d
  // The easiest thing to do
  // is to use the oldest parent UTXO value, so that's what is implemented.
  // A more complex and complete solution would be to evaluate the parent-chain
  // behind each parent UTXO and adjust the merit accordingly, but that would
  // require significant effort.
  async findTokenParent (txid, addr) {
    try {
      // Get the raw transaction data from a full node, for the given txid.
      const txData = await this.bchjs.RawTransactions.getRawTransaction(
        txid,
        true
      )
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

      // Extract the UTXO input info. (parent UTXOs)
      const parentUtxos = txData.vin.map(elem => {
        return {
          txid: elem.txid,
          vout: elem.vout
        }
      })
      // console.log(`parentUtxos: ${JSON.stringify(parentUtxos, null, 2)}`)

      // Get the transaction history for the given address.
      const txHistory = await this.bchjs.Electrumx.transactions(addr)
      // console.log(`txHistory: ${JSON.stringify(txHistory, null, 2)}`)

      // Create an object for tracking the oldest parent UTXO.
      const oldestParent = {
        index: null,
        height: null,
        utxo: false
      }

      // Loop through each parent utxo.
      for (let i = 0; i < parentUtxos.length; i++) {
        const parentTxid = parentUtxos[i].txid

        // Search the transaction history for the address for a matching
        // transaction.
        const match = txHistory.transactions.filter(
          elem => elem.tx_hash === parentTxid
        )
        // console.log(`match: ${JSON.stringify(match, null, 2)}`)

        // Skip if there is no match.
        if (match.length > 0) {
          // Loop through each match.
          for (let j = 0; j < match.length; j++) {
            let thisUtxo = match[j]

            // Add the vout info to complete the minimum UTXO information needed
            // to hydrate the UTXO with token info.
            thisUtxo.tx_pos = parentUtxos[i].vout

            const hydrateObj = [{ utxos: [thisUtxo] }]

            // Hydrate the matching UTXO with SLP token information.
            const hydratedData = await this.bchjs.SLP.Utils.hydrateUtxos(
              hydrateObj
            )
            // console.log(
            //   `hydratedData: ${JSON.stringify(hydratedData, null, 2)}`
            // )

            thisUtxo = hydratedData.slpUtxos[0].utxos[0]
            // console.log(`thisUtxo: ${JSON.stringify(thisUtxo, null, 2)}`);

            // If the parent UTXO is a valid SLP token UTXO.
            if (thisUtxo.isValid) {
              // console.log('utxo is valid')

              // If this is the first parent encountered, set it as the oldest.
              if (!oldestParent.height) {
                oldestParent.height = thisUtxo.height
                oldestParent.index = i
                oldestParent.utxo = thisUtxo

                // If the this parent is older, replace the previous parent.
              } else if (thisUtxo.height < oldestParent.height) {
                oldestParent.height = thisUtxo.height
                oldestParent.index = i
                oldestParent.utxo = thisUtxo
              }
              // console.log(
              //   `oldestParent: ${JSON.stringify(oldestParent, null, 2)}`
              // )
            }
          }
        }
      }

      return oldestParent.utxo
    } catch (err) {
      console.error('Error in findTokenParent()')
      throw err
    }
  }

  // Aggregate Merit.
  // This function aggregates the merit across all token UTXOs for an address.
  // It returns a single number, which is the aggregate merit for the address.
  // Inputs:
  // - address (required) is the address to attribute the merit to.
  // - tokenId (required) is the token ID of the SLP token used to stake for accruing merit.
  // - utxoDelay (optional) a delay in milliseconds to wait between processing
  //   UTXOs. Reduces the risk of failure due to rate limits errors.
  async agMerit (address, tokenId, utxoDelay) {
    try {
      if (!address) {
        throw new Error('an address must be specified!')
      }
      if (!tokenId) {
        throw new Error('tokenId must be specified!')
      }

      // Get a list of UTXOs representing PSF tokens, hydrated with token info.
      const utxos = await this.getTokenUtxos(address, tokenId, utxoDelay)

      // Further hydrate the UTXOs with age and merit values.
      const meritUtxos = await this.calcMerit(utxos, address)

      let agMerit = 0

      meritUtxos.map(elem => (agMerit += elem.merit))

      // Round the merit to the nearest integer.
      return Math.floor(agMerit)
    } catch (err) {
      console.error('Error in merit.js/agMerit()')
      throw err
    }
  }
}

module.exports = Merit
