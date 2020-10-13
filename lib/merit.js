/*
  This library calculates metrics that are used to assess an addresses 'merit' or
  standing within the PSF community. Merit it defined as:

  merit = token quantity x token age
*/

// npm libraries
const BCHJS = require('@psf/bch-js')

const PSF_TOKEN_ID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

class Merit {
  constructor (config) {
    // Default to new instance of bch-js
    this.bchjs = new BCHJS()
    // Overwrite default if an instance of bch-js is passed in.
    if (config && config.bchjs) this.bchjs = config.bchjs
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
}

module.exports = Merit
