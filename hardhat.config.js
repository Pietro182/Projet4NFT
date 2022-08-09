require("@nomiclabs/hardhat-waffle");

let secret = require("./secret")

module.exports = {
  solidity: "0.8.9",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  networks: {
    rinkeby: {
      url: secret.url,
      accounts: [secret.key],
    },
  },
};