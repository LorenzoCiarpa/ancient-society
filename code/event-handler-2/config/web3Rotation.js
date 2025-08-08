const Web3 = require('web3')
const EventEmitter = require('events');

const {serverConfig} = require('./web3Config')

const rotationEmitter = new EventEmitter();


async function reconnect(){
    console.log("Rotating web3 provider START")
    serverConfig.indexEndpoint = (serverConfig.indexEndpoint + 1) % serverConfig.endpoint.WSS_GETBLOCK.length;

    //POLYGON MAINNET
    let provider = new Web3.providers.WebsocketProvider(serverConfig.endpoint.WSS_GETBLOCK[serverConfig.indexEndpoint], serverConfig.options);
    serverConfig.chain.wssWeb3.setProvider(provider);

    //MUMBAI
    // let provider_mumbai = new Web3.providers.WebsocketProvider(serverConfig.endpoint.mumbai.WSS_CHAINSTACK[serverConfig.indexEndpoint], serverConfig.options)
    // serverConfig.chain.mumbai.wssWeb3.setProvider(provider_mumbai);
    
    //ETHEREUM MAINNET
    // let provider_eth = new Web3.providers.WebsocketProvider(serverConfig.endpoint.ethereum.WSS_CHAINSTACK[serverConfig.indexEndpoint], serverConfig.options);
    // serverConfig.chain.ethereum.wssWeb3.setProvider(provider_eth);
    console.log("Rotating web3 provider END")
    
    rotationEmitter.emit('rotate');
}


setInterval(reconnect, 1000 * 60 * 10);

module.exports.rotationEmitter = rotationEmitter
