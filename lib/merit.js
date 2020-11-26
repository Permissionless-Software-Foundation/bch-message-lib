/*
  This library calculates metrics that are used to assess an addresses 'merit' or
  standing within the PSF community. Merit it defined as:

  merit = token quantity x token age
*/

// npm libraries
const BchUtil = require('bch-util')

const PSF_TOKEN_ID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

class Merit {
  constructor (config) {
    if (!config || !config.bchjs) {
      throw new Error(
        'bch-js instance must be passed in the config object when instantiating.'
      )
    }

    // Encapsulate dependencies
    this.bchjs = config.bchjs
    this.bchUtil = new BchUtil({ bchjs: this.bchjs })
  }

  // Given an address, this function retrieves the UTXOs associated with the
  // address, hydrates them with SLP data, and returns the ones that match
  // the PSF token ID. This is the first step in calculating merit.
  async getTokenUtxos (address) {
    try {
      address = this.bchjs.SLP.Address.toCashAddress(address)

      // Get UTXO data.
      const utxos = await this.bchjs.Electrumx.utxo([address])
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      // Hydrate UTXO data with SLP info.
      const hydratedUtxos = await this.bchjs.SLP.Utils.hydrateUtxos(utxos.utxos)
      // console.log(`hydratedUtxos: ${JSON.stringify(hydratedUtxos, null, 2)}`)

      // Filter out the UTXOs that represent PSF tokens.
      const matchedUtxos = hydratedUtxos.slpUtxos[0].utxos.filter(
        elem => elem.tokenId && elem.tokenId.includes(PSF_TOKEN_ID)
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
        qty += elem.tokenQty
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
  // The formular for calculating merit is:
  // merit = token quantity x number of days held
  // There are 144 blocks in a day.
  async calcMerit (hydratedUtxos) {
    try {
      const BLOCKS_IN_A_DAY = 144
      const currentBlockHeight = await this.bchjs.Blockchain.getBlockCount()
      // console.log(`currentBlockHeight: ${currentBlockHeight}`)

      // Calculate merit and age for each UTXO.
      const updatedUtxos = hydratedUtxos.map(elem => {
        // Calculate the age of the UTXO.
        let age = (currentBlockHeight - elem.height) / BLOCKS_IN_A_DAY

        // Round the age to two decimal places.
        age = this.bchUtil.util.round2(age)

        // Corner case: unconfirmed UTXOs.
        if (elem.height === 0) age = 0

        const merit = elem.tokenQty * age

        // Add these new properties to the UTXO
        elem.age = age
        elem.merit = Math.floor(merit) // Round to an integer

        return elem
      })

      return updatedUtxos
    } catch (err) {
      console.error('Error in merit.js/getMerit()')
      throw err
    }
  }

  // Aggregate Merit.
  // This function aggregates the merit across all token UTXOs for an address.
  // It returns a single number, which is the aggregate merit for the address.
  async agMerit (address) {
    try {
      // Get a list of UTXOs representing PSF tokens, hydrated with token info.
      const utxos = await this.getTokenUtxos(address)

      // Further hydrate the UTXOs with age and merit values.
      const meritUtxos = await this.calcMerit(utxos)

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