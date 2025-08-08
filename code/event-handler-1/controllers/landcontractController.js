//LIBRARIES

//ABIs
const contractAbi = require('../ABI/contract-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES

//QUERIES

//HELPERS

//MODELS
const contractModel = require('../models/lands/contractModel');

//MODELS INITIALIZATION
let contractService = new contractModel.ContractService();

//LISTENERS
let listOfListener = {
    landContract: {
        create: undefined,
        delete: undefined
    },
}
  

const initListeners = () => {
    for(let listenerProp in listOfListener){
        let listener = listOfListener[listenerProp];

        for(let eventListenerProp in listener){
            let eventListener = listener[eventListenerProp];
            
            if(eventListener != undefined) eventListener.unsubscribe();
        }
    }
    

    console.log('Initializing listeners landcontractController....')

    var myContractLandContract = new serverConfig.chain.wssWeb3.eth.Contract(contractAbi, serverConfig.chain.contracts.STAKER_LAND_ADDRESS); 


    //<-----------------CONTRACT CREATION-------------------->
    listOfListener.landContract.create = myContractLandContract.events.ContractCreated()
    .on('data', contractService.mintContractOnData)
    .on('change', contractService.mintContractOnChange)
    .on('error', contractService.mintContractOnError)

    //<-----------------CONTRACT DELETION-------------------->
    listOfListener.landContract.delete = myContractLandContract.events.ContractDeleted()  
    .on('data', contractService.deleteContractOnData)
    .on('change', contractService.deleteContractOnChange)
    .on('error', contractService.deleteContractOnError)

    console.log('Initialized listeners landcontractController....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();




