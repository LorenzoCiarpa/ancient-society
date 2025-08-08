const mysql = require('../database/connection');

const MAX_LEVELS = {
    1: 10,
    2: 12,
    3: 12,
    4: 10,
    5: 10,
    6: 2
}

//Versione 1
class MetaModel{
    /*
    constructor(buildings){
        let building = buildings[0];
        let bkService = new BackgroundService();
        building = bkService.retrieveImageNFT
        this.name = building.name + " # " + building.idBuilding;
        this.image = building.imageURL;
        this.description = building.description;
        this.attributes = [
            {
                "trait_type": "Level", 
                "value": building.level,
                "max_value": 10
            },
            {
                "trait_type": "Storage",
                "value": building.stored,
                "max_value": building.capacity
            },
            {
                "trait_type": "DropQuantity",
                "value": building.dropQuantity
            },
            {
                "trait_type": "DropInterval",
                "value": "1 Hour"
            },
            {
                "trait_type": "Stake",
                "value": building.stake ? true : false
            }
        ];

        for(let elem of buildings){
            let trait = elem.traits;
            let parsedName = trait.split("-");

            let trait_one;
            let trait_two;
            let value_one;
            let value_two;

            console.log("parsedName: ", parsedName);
            
            if(parsedName.length == 1){
                trait_one = parsedName[0];

                value_one = trait_one.split("_");
                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                console.log("value_one: ", value_one);

                this.attributes.push(
                    {
                        "value": value_one
                    }
                );

            }else if(parsedName.length == 2){
                trait_one = parsedName[0];
                trait_two = parsedName[1];

                console.log("trait_one: ", trait_one);
                console.log("trait_two: ", trait_two);


                value_one = trait_one.split("_");
                console.log("value_one: ", value_one);

                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                value_two = trait_two.split("_");
                console.log("value_two: ", value_two);

                value_two = value_two.length == 1 ? value_two[0] : value_two[0] + " " + value_two[1];

                console.log("value_one: ", value_one);
                console.log("value_two: ", value_two);



                this.attributes.push(
                    {
                        "value": value_one
                    },
                    {
                        "value": value_two
                    }
                );
            }
        }
        
    }
    */

    constructor(){}

    async buildMetadata(buildings){
        let response = {};
        let building = buildings[0];
        let bkService = new BackgroundService();

        building = await bkService.retrieveImageNFT(building);

        response.name = building.name + " # " + building.idBuilding;
        response.image = building.imageURL;
        response.description = building.description;
        response.attributes = [
            {
                "trait_type": "Level", 
                "value": building.level,
                "max_value": MAX_LEVELS[building.type]
            },
            {
                "display_type": "number",
                "trait_type": "Storage",
                "value": building.stored,
                "max_value": building.capacity
            },
            {
                "display_type": "number",
                "trait_type": "Drop Hourly Rate",
                "value": building.dropQuantity
            }
        ];

        for(let elem of buildings){
            let trait = elem.traits;
            let parsedName = trait.split("-");

            let trait_one;
            let trait_two;
            let value_one;
            let value_two;

            console.log("parsedName: ", parsedName);
            
            if(parsedName.length == 1){
                trait_one = parsedName[0];

                value_one = trait_one.split("_");
                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                console.log("value_one: ", value_one);

                response.attributes.push(
                    {
                        "value": value_one
                    }
                );

            }else if(parsedName.length == 2){
                trait_one = parsedName[0];
                trait_two = parsedName[1];

                console.log("trait_one: ", trait_one);
                console.log("trait_two: ", trait_two);


                value_one = trait_one.split("_");
                console.log("value_one: ", value_one);

                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                value_two = trait_two.split("_");
                console.log("value_two: ", value_two);

                value_two = value_two.length == 1 ? value_two[0] : value_two[0] + " " + value_two[1];

                console.log("value_one: ", value_one);
                console.log("value_two: ", value_two);



                response.attributes.push(
                    {
                        "value": value_one
                    },
                    {
                        "value": value_two
                    }
                );
            }
            if(elem.cursed){
                response.attributes.push({
                    "value": "cursed"
                })
            }
            
        }
        return response;
    }

    async buildFishermanMetadata(buildings){
        let response = {};
        let building = buildings[0];
        let bkService = new BackgroundService();

        building = await bkService.retrieveImageNFT(building);

        response.name = building.name + " # " + building.idBuilding;
        response.image = building.imageURL;
        response.description = building.description;
        response.attributes = [
            {
                "trait_type": "Level", 
                "value": building.level,
                "max_value": 10
            }            
        ];

        for(let elem of buildings){
            let trait = elem.traits;
            let parsedName = trait.split("-");

            let trait_one;
            let trait_two;
            let value_one;
            let value_two;

            console.log("parsedName: ", parsedName);
            
            if(parsedName.length == 1){
                trait_one = parsedName[0];

                value_one = trait_one.split("_");
                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                console.log("value_one: ", value_one);

                response.attributes.push(
                    {
                        "value": value_one
                    }
                );

            }else if(parsedName.length == 2){
                trait_one = parsedName[0];
                trait_two = parsedName[1];

                console.log("trait_one: ", trait_one);
                console.log("trait_two: ", trait_two);


                value_one = trait_one.split("_");
                console.log("value_one: ", value_one);

                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                value_two = trait_two.split("_");
                console.log("value_two: ", value_two);

                value_two = value_two.length == 1 ? value_two[0] : value_two[0] + " " + value_two[1];

                console.log("value_one: ", value_one);
                console.log("value_two: ", value_two);



                response.attributes.push(
                    {
                        "value": value_one
                    },
                    {
                        "value": value_two
                    }
                );
            }
            if(elem.cursed){
                response.attributes.push({
                    "value": "cursed"
                })
            }
            
        }
        return response;
    }

    async buildFarmerMetadata(buildings){
        let response = {};
        let building = buildings[0];
        let bkService = new BackgroundService();

        building = await bkService.retrieveImageNFT(building);

        response.name = building.name + " # " + building.idBuilding;
        response.image = building.imageURL;
        response.description = building.description;
        response.attributes = [
            {
                "trait_type": "Level", 
                "value": building.level,
                "max_value": 2
            }            
        ];

        for(let elem of buildings){
            let trait = elem.traits;
            let parsedName = trait.split("-");

            let trait_one;
            let trait_two;
            let value_one;
            let value_two;

            console.log("parsedName: ", parsedName);
            
            if(parsedName.length == 1){
                trait_one = parsedName[0];

                value_one = trait_one.split("_");
                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                console.log("value_one: ", value_one);

                response.attributes.push(
                    {
                        "value": value_one
                    }
                );

            }else if(parsedName.length == 2){
                trait_one = parsedName[0];
                trait_two = parsedName[1];

                console.log("trait_one: ", trait_one);
                console.log("trait_two: ", trait_two);


                value_one = trait_one.split("_");
                console.log("value_one: ", value_one);

                value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];

                value_two = trait_two.split("_");
                console.log("value_two: ", value_two);

                value_two = value_two.length == 1 ? value_two[0] : value_two[0] + " " + value_two[1];

                console.log("value_one: ", value_one);
                console.log("value_two: ", value_two);



                response.attributes.push(
                    {
                        "value": value_one
                    },
                    {
                        "value": value_two
                    }
                );
            }
            if(elem.cursed){
                response.attributes.push({
                    "value": "cursed"
                })
            }
            
        }
        return response;
    }

    async buildFarmerPrereveal(buildings){
        let response = {};
        let building = buildings[0];
        let bkService = new BackgroundService();

        building = await bkService.retrieveImageNFT(building);

        response.name = building.name + " # " + building.idBuilding;
        // TODO cambiare img and set prereveal image
        response.image = "https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/items/pre-reveal.gif";
        response.description = building.description;
        response.attributes = [
            {
                "trait_type": "Level", 
                "value": building.level,
                "max_value": 10
            }            
        ];

        for(let elem of buildings){

            if(elem.cursed){
                response.attributes.push({
                    "value": "cursed"
                })
            }
            
        }
        return response;
    }
    
    buildLandMetadata(lands){
        console.log("entrato")
        let response = {};
        let land = lands[0];
    
        response.name = land.name + " # " + land.idLand;
        response.image = land.image + (land.traits == null ? "" : ('.' + land.traits) ) + '.jpg';
        // response.description = land.description;
        response.attributes = [
            {
            "trait_type": "Level", 
            "value": land.level,
            "max_value": 10
            }
        ];
        
        if(land.traits == null || land.traits == undefined || land.traits.length == 0){
            return response;
        }

        let trait = land.traits;
        let parsedName = trait.split(".");
    
        let trait_one;
        let trait_two;
        let value_one;
        let value_two;
    
        console.log("parsedName: ", parsedName);
        
        if(parsedName.length == 1){
            trait_one = parsedName[0];
    
            value_one = trait_one.split("_");
            value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];
    
            console.log("value_one: ", value_one);
    
            response.attributes.push(
                {
                    "value": value_one
                }
            );
    
        }else if(parsedName.length == 2){
            trait_one = parsedName[0];
            trait_two = parsedName[1];
    
            console.log("trait_one: ", trait_one);
            console.log("trait_two: ", trait_two);
    
    
            value_one = trait_one.split("_");
            console.log("value_one: ", value_one);
    
            value_one = value_one.length == 1 ? value_one[0] : value_one[0] + " " + value_one[1];
    
            value_two = trait_two.split("_");
            console.log("value_two: ", value_two);
    
            value_two = value_two.length == 1 ? value_two[0] : value_two[0] + " " + value_two[1];
    
            console.log("value_one: ", value_one);
            console.log("value_two: ", value_two);
    
    
    
            response.attributes.push(
                {
                    "value": value_one
                },
                {
                    "value": value_two
                }
            );

        }
        
        return response;
    }

}

class BackgroundService {
    constructor(){}

    async retrieveImageNFT(building){
        
        // let bkNumber = await this.getBkNumberGivenBuildingId(building.id);
        // bkNumber = bkNumber[0];

        let bkNumber = building.idSkin;
        let imageUrl;
        let upgradeImageUrl;

        imageUrl = this.createImageUrl(building.type, 
            building.level,
            building.bundle,
            bkNumber);

        if(building.level < process.env.MAX_LEVEL){
            upgradeImageUrl = this.createImageUrl(building.type, 
                building.level + 1,
                building.bundle,
                bkNumber);
        }else{
            upgradeImageUrl = null;
        }

        building.imageURL = imageUrl;
        building.upgradeImage = upgradeImageUrl;

        return building;
        
    }

    createImageUrl(type, level, bundle, bkNumber){
        const baseUri = "https://ancient-society.s3.eu-central-1.amazonaws.com/reveal/";
        let imageUrl = baseUri;

        switch(type){
            case 1:{
                imageUrl += "townhall/" + level + "-" + bkNumber;
                break;
            }
            case 2:{
                imageUrl += "lumberjack/" + level + "-" + bkNumber;
                break;
            }
            case 3:{
                imageUrl += "stonemine/" + level + "-" + bkNumber;
                break;
            }
            case 4:{
                imageUrl += "fisherman/" + level + "-" + bkNumber;
                break;
            }
            case 5:{
                imageUrl += "miner/" + level + "-" + bkNumber;
                break;
            }
            case 6:{
                imageUrl += "farmer/" + level + "-" + bkNumber;
                break;
            }

            default:
                break;
        }

        if(bundle){
            imageUrl += "-bundle";
        }
        imageUrl += ".jpg";
        return imageUrl
    }

    async getBkNumberGivenBuildingId(primaryIdNFT){
        return new Promise((resolve, reject) => {
            let sql = "SELECT idSkin FROM inventario WHERE idBuilding = ?";
            mysql.query(sql, [primaryIdNFT, type], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

class MetaModelPrereveal{
    constructor(building){
        this.name = building.name + " # " + building.idBuilding;
        this.image = this.getImgGivenTypeAndBundle(building.type, building.bundle);
        this.description = building.description;
        this.attributes = [
            {
                "trait_type": "Level", 
                "value": building.level,
                "max_value": 10
            }
        ];

        if(building.bundle){
            this.attributes.push(
                {
                    "value": "Ancient Frame"
                }
            );
        }
        
    }

    

    // constructor(building){
    //     this.name = building.name + " # " + building.idBuilding;
    //     this.image = this.getImgGivenTypeAndBundle(building.type, building.bundle);
    //     this.description = building.description;
    //     this.attributes = [
    //         {
    //             "trait_type": "Level", 
    //             "value": building.level,
    //             "max_value": 10
    //         },
    //         {
    //             "display_type": "number",
    //             "trait_type": "Storage",
    //             "value": building.stored,
    //             "max_value": building.capacity
    //         },
    //         {
    //             "display_type": "number",
    //             "trait_type": "Drop Hourly Rate",
    //             "value": building.dropQuantity
    //         }
    //     ];
        
    // }

    getImgGivenTypeAndBundle(type, bundle){
        switch(type){
            case 1:{
                if(bundle) return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/townhall/BUNDLE-TH-PREREVEAL.gif";
                else return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/townhall/TH-PREREVEAL.gif";
            }

            case 2:{
                if(bundle) return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/lumberjack/BUNDLE-LJ-PREREVEAL.gif";
                else return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ-PREREVEAL.gif";
            }

            case 3:{
                if(bundle) return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/stonemine/BUNDLE-SM-PREREVEAL.gif";
                else return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/stonemine/SM-PREREVEAL.gif";
            }

            case 4:
                if(bundle) return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/fisherman/BUNDLE-FM-PREREVEAL.gif";
                else return "https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/fisherman/FM-PREREVEAL.gif";
            default:
                return null;
        }
    }

}

class MetaService {
    constructor() {}

    async getNFT(nftId, type){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getNFTWithTraits(nftId, type){
        return new Promise((resolve, reject) => {
            let sql = "SELECT buildings.*, inventario.idSkin, background.traits FROM buildings JOIN inventario on buildings.id = inventario.idBuilding JOIN background on inventario.idSkin = background.id WHERE buildings.idBuilding = ? AND buildings.type = ?";

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getLand(id){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM lands WHERE idLand = ?";

            mysql.query(sql, id, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

}   



module.exports = {MetaModel, MetaService, MetaModelPrereveal};