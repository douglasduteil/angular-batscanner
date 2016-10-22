//

const fs = require('fs')
const path = require('path')

const babelrc = fs.readFileSync(path.join(__dirname, '..', '.babelrc'))
const config = JSON.parse(babelrc)

require('babel-core/register')(config)

