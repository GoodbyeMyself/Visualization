const storeGenerator = require('./store-template/prompt')
const chartGenerator = require('./chart-template/prompt')
const decorateGenerator = require('./decorate-template/prompt')
const vchartGenerator = require('./vchart-template/prompt')
const informationGenerator = require('./information-template/prompt')

module.exports = (plop) => {
  plop.setHelper('eq', (a, b) => a === b)
  plop.setHelper('kebabCase', (text) =>
    String(text)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  )

  plop.setGenerator('store', storeGenerator)
  plop.setGenerator('chart', chartGenerator)
  plop.setGenerator('decorate', decorateGenerator)
  plop.setGenerator('vchart', vchartGenerator)
  plop.setGenerator('information', informationGenerator)
}
