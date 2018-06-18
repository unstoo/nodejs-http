/*
*
*/

// Container for all environments

const environments = {}

environments.staging = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'staging'
}

environments.production = {
  httpPort: 6000,
  httpsPort: 6001,
  envName: 'production'
}

const currentEnv = typeof(process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() : ''

const envToExport = typeof(environments[currentEnv]) == 'object' ?
  environments[currentEnv] : environments.staging

module.exports = envToExport
