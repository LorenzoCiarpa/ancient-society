const metaModel = require('../models/metaModel');
const Web3 = require('web3');

const buildingAbi = require('../ABI/building-abi.json');
const fishermanAbi = require('../ABI/fisherman-abi.json');
const minerAbi = require('../ABI/miner-abi.json');
const landAbi = require('../ABI/land-abi.json');

// let chainstackHttps = "https://nd-110-171-313.p2pify.com/e84dd341a72bccce7db8670e708b37ea";
// let getblockHttps = "https://matic.getblock.io/mainnet/?api_key=d96f8372-4428-4442-a1aa-f3a2c4c5c3bd";
let getblockHttps = "https://go.getblock.io/f865429952dd40739161c7160aaeac8e";
// let chainstackHttps = "https://nd-442-678-460.p2pify.com/67498e39907c8275e286db9f113e0f64";

// const chainstacktest = "wss://ws-nd-838-287-294.p2pify.com/a60db0c137afcba5db3a2c1b4332e9e8";


var web3 = new Web3(new Web3.providers.HttpProvider(getblockHttps));


var myContractTh = new web3.eth.Contract(buildingAbi, process.env.TOWNHALL_ADDRESS);
var myContractLj = new web3.eth.Contract(buildingAbi, process.env.LUMBERJACK_ADDRESS);
var myContractSm = new web3.eth.Contract(buildingAbi, process.env.STONEMINE_ADDRESS);
var myContractLand = new web3.eth.Contract(landAbi, process.env.LAND_ADDRESS);
var myContractFisherman = new web3.eth.Contract(fishermanAbi, process.env.FISHERMAN_ADDRESS);
var myContractMiner = new web3.eth.Contract(minerAbi, process.env.MINER_ADDRESS);
var myContractFarmer = new web3.eth.Contract(minerAbi, process.env.FARMER_ADDRESS);


async function getTownhallMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 4000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    let totalSupply = await myContractTh.methods.totalSupply().call();

    if(id >= totalSupply){
        return res.json("Building not minted yet");
    }

    buildings = await metaService.getNFTWithTraits(id, 1);
    // building = await metaService.getNFT(id, 1);

    if(buildings.length == 0){
        return res.json("building not found");
    }

    console.log(buildings);


    //Versione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = await metamodService.buildMetadata(buildings);


    return res.json(response);
}

async function getLumberjackMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 4000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    let totalSupply = await myContractLj.methods.totalSupply().call();

    if(id >= totalSupply){
        return res.json("Building not minted yet");
    }

    buildings = await metaService.getNFTWithTraits(id, 2);

    if(buildings.length == 0){
        return res.json("building not found");
    }

    console.log("buildings: ", buildings);


    // Verione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = await metamodService.buildMetadata(buildings);

    return res.json(response);
}

async function getStonemineMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 4000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    let totalSupply = await myContractSm.methods.totalSupply().call();

    if(id >= totalSupply){
        return res.json("Building not minted yet");
    }

    buildings = await metaService.getNFTWithTraits(id, 3);

    if(buildings.length == 0){
        return res.json("building not found");
    }
    console.log(buildings);


    //Versione corretta
    //response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = await metamodService.buildMetadata(buildings);

    return res.json(response);
}

async function getFishermanMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 10000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    let totalSupply = await myContractFisherman.methods.totalSupply().call();

    if(id >= totalSupply){
        return res.json("Building not minted yet");
    }

    buildings = await metaService.getNFTWithTraits(id, 4);
    // building = await metaService.getNFT(id, 1);

    if(buildings.length == 0){
        return res.json("building not found");
    }

    console.log(buildings);


    //Versione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = await metamodService.buildFishermanMetadata(buildings);


    return res.json(response);
}

async function getMinerMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    let totalSupply = await myContractMiner.methods.totalSupply().call();

    if(id >= totalSupply){
        return res.json("Building not minted yet");
    }

    buildings = await metaService.getNFTWithTraits(id, 5);
    // building = await metaService.getNFT(id, 1);

    if(buildings.length == 0){
        return res.json("building not found");
    }

    console.log(buildings);


    //Versione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = await metamodService.buildFishermanMetadata(buildings);


    return res.json(response);
}

async function getFarmerMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0){
        return res.json("id cannot be less than 0");
    }

    let totalSupply = await myContractFarmer.methods.totalSupply().call();

    if(id >= totalSupply){
        return res.json("Building not minted yet");
    }

    buildings = await metaService.getNFTWithTraits(id, 6);
    // building = await metaService.getNFT(id, 1);

    if(buildings.length == 0){
        return res.json("building not found");
    }

    console.log(buildings);


    //Versione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = await metamodService.buildFarmerMetadata(buildings);


    return res.json(response);
}

async function getLandMeta(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let buildings;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);
    console.log("arrivt")

    if(id < 0 || id >= 250){
        return res.json("id cannot be less than 0 or greater than 4000");
    }
    console.log("id control")


    let totalSupply = await myContractLand.methods.totalSupply().call();
    // let totalSupply = 100;
    if(id >= totalSupply){
        return res.json("Land not minted yet");
    }
    console.log("total")


    lands = await metaService.getLand(id);
    // building = await metaService.getNFT(id, 1);
    console.log("lands")

    if(lands.length == 0){
        return res.json("land not found");
    }

    console.log(lands);


    //Versione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    let metamodService = new metaModel.MetaModel();
    response = metamodService.buildLandMetadata(lands);

    return res.json(response);
}

async function getTownhallMetaPrereveal(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let building;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 4000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    building = await metaService.getNFT(id, 1);
    // building = await metaService.getNFT(id, 1);

    if(building.length == 0){
        return res.json("building not found");
    }

    console.log(building);

    building = building[0];

    //Versione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    response = new metaModel.MetaModelPrereveal(building);


    return res.json(response);
}

async function getLumberjackMetaPrereveal(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let building;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 4000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    building = await metaService.getNFT(id, 2);

    if(building.length == 0){
        return res.json("building not found");
    }

    console.log("buildings: ", building);

    building = building[0];

    // Verione corretta
    // response = new metaModel.MetaModel(building);

    //Versione Prereveal
    response = new metaModel.MetaModelPrereveal(building);

    return res.json(response);
}

async function getStonemineMetaPrereveal(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let building;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id > 4000){
        return res.json("id cannot be less than 0 or greater than 4000");
    }

    building = await metaService.getNFT(id, 3);

    if(building.length == 0){
        return res.json("building not found");
    }
    console.log(building);

    building = building[0];

    //Versione corretta
    //response = new metaModel.MetaModel(building);

    //Versione Prereveal
    response = new metaModel.MetaModelPrereveal(building);

    return res.json(response);
}

async function getFishermanMetaPrereveal(req, res){
    let id = req.params.id;
    let metaService = new metaModel.MetaService();
    let building;
    let response;

    if(id == undefined || id == null){
        return res.json("id cannot be undefined or null");
    }

    id = parseInt(id);

    if(id < 0 || id >= 10000){
        return res.json("id cannot be less than 0 or greater than 10000");
    }

    building = await metaService.getNFT(id, 4);

    if(building.length == 0){
        return res.json("building not found");
    }
    console.log(building);

    building = building[0];

    //Versione corretta
    //response = new metaModel.MetaModel(building);

    //Versione Prereveal
    response = new metaModel.MetaModelPrereveal(building);

    return res.json(response);
}

module.exports = {getTownhallMeta, 
    getLumberjackMeta, 
    getStonemineMeta,
    getFishermanMeta,
    getMinerMeta,
    getFarmerMeta,
    getTownhallMetaPrereveal,
    getLumberjackMetaPrereveal,
    getStonemineMetaPrereveal,
    getFishermanMetaPrereveal,
    getLandMeta};
