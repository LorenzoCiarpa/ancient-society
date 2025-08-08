const logger = require("../logging/logger");
const Validator = require('../utils/validator');
const arpad = require('arpad');
const { Utils } = require("../utils/utils");

const { serverConfig } = require('../config/serverConfig')

const { MAX_LEVELS } = require('../config/buildingLevel');
const { PvpValidation } = require("../validations/pvpValidation");
const { InventoryValidation } = require("../validations/inventoryValidation");
const { InventoryService } = require("../services/pvp/inventoryService");
const { UserService } = require("../services/pvp/userService");
const { CardService } = require("../services/pvp/cardService");
const { MatchMakingService } = require("../services/pvp/matchMakingService");
const { MatchMakingQueries } = require("../queries/pvp/matchMakingQueries");
const { BattleService } = require("../services/pvp/battleService");
const { BattleQueries } = require("../queries/pvp/battleQueries");
const { UserQueries } = require("../queries/pvp/userQueries");
const schedule = require('node-schedule');
const { InventoryQueries } = require("../queries/pvp/inventoryQueries");

// if(serverConfig.routes.pvpAutoBattle){
//      const pvpAutoBattle = schedule.scheduleJob(`*/1 * * * *`, async () => {
//         console.log("pvpAutoBattle PVP")

//         try {
//             await battleServiceTest();
//         } catch (error) {
//             logger.error(`Error in battleServiceTest: ${Utils.printErrorLog(error)}`);
//             return;
//         }
//      });
// }

async function craftPvp(req, res) {
    logger.info(`craftPvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = PvpValidation.craftPvpValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idRecipeInstance = req.body.idRecipeInstance;
    let burnGearIds = req.body.burnGearIds
    let burnCardIds = req.body.burnCardIds
    let consumableIds = req.body.consumableIds
    let craftCount = req.body.craftCount

    let response
    try {
        response = await InventoryService.craftService(address, idRecipeInstance, burnCardIds, burnGearIds, consumableIds, craftCount)
    } catch (error) {
        logger.error(`Error in InventoryService.craftService: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info("craftPvp END");
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function craftPvpNPC(req, res) {
    logger.info(`craftPvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = PvpValidation.craftPvpNPCValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;
    let burnGearIds = req.body.burnGearIds
    let burnCardIds = req.body.burnCardIds
    let consumableIds = req.body.consumableIds
    let craftCount = req.body.craftCount

    let response
    try {
        response = await InventoryService.craftServiceNpc(address, idRecipe, burnCardIds, burnGearIds, consumableIds, craftCount)
    } catch (error) {
        logger.error(`Error in InventoryService.craftServiceNpc: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info("craftPvpNPC END");
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function getUserInfoPvp(req, res) {
    logger.info(`getUserInfoPvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = PvpValidation.getUserInfoPvpValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;

    let response
    try {
        response = await UserService.getUser(address)
    } catch (error) {
        logger.error(`Error in UserService.getUserInfoPvp: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info("getUserInfoPvp END");
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function openChestPvp(req, res) {
    logger.info(`openChestPvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation
    validation = PvpValidation.openChestPvpValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idItemInstance = req.body.idItemInstance
    let openCount = req.body.openCount

    let response = {}
    try {
        response = await InventoryService.openChest(address, idItemInstance, openCount)
    } catch (error) {
        logger.error(`Error in InventoryService.openChest: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`openChestPvp END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })
}

async function getInventoryList(req, res) {
    logger.info(`getInventoryList START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = PvpValidation.getInventoryListValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address

    let response;
    try {
        response = await InventoryService.getInventoryListService(address);
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryListService: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.info("getInventoryList END");
    return res
        .status(200)
        .json({
            success: true,
            data: response
        });
}

async function getInventoryInstanceData(req, res) {
    logger.info(`getInventoryInstanceData START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = PvpValidation.getInventoryInstanceDataValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idInventoryInstance = req.body.idInventoryInstance
    let inventoryType = req.body.inventoryType

    let inventoryInstanceData = {}
    try {
        inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idInventoryInstance, inventoryType)
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }


    logger.info(`getInventoryInstanceData END`)

    return res
        .status(200)
        .json({
            success: true,
            data: inventoryInstanceData
        })
}

async function getCardList(req, res) {
    logger.info(`getCardList START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = PvpValidation.getInventoryListValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address

    let response;
    try {
        response = await InventoryService.getCardListService(address);
    } catch (error) {
        logger.error(`Error in InventoryServiceget.getInventoryListService: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.info("getCardList END");

    return res
        .status(200)
        .json({
            success: true,
            data: response,
            cardLimit: serverConfig.matchmaking.cardLimits

        });
}

async function getCardInstance(req, res) {
    logger.info(`getCardInstance START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = PvpValidation.getCardInstanceValidation(req)
    if (!validation.success) return res.status(401).json(validation)

    let address = req.locals.address;
    let idCardInstance = req.body.idCardInstance;

    let response;

    try {
        response = await InventoryService.getCardInstanceService(address, idCardInstance);
    } catch (error) {
        logger.error(`Error in InventoryService.getCardInstanceService: ${Utils.printErrorLog(error)}`)
        return res.status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (!response.success) {
        return res.status(response.status)
            .json({
                success: false,
                error: {
                    errorMessage: response.errorMessage
                }
            })
    }

    logger.info("getCardInstance END");

    return res.status(200).json({
        success: true,
        data: {
            ...response.data
        }
    })
}

async function getLeaderboard(req, res) {
    logger.info(`getLeaderboard START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getLeaderboardValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;
    let idLeague = req.body.idLeague;

    let response;

    try {
        response = await InventoryService.getLeaderboardService(address, idLeague);
    } catch (error) {
        logger.error(`Error in InventoryService.getLeaderboardService: ${Utils.printErrorLog(error)}`)
        return res.status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info("getLeaderboard END");

    res.status(200).json({
        success: true,
        data: {
            response
        }
    })
}

async function getWarHistory(req, res) {
    logger.info(`getWarHistory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getWarHistoryValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;

    let response;

    try {
        response = await InventoryService.getWarHistory(address);
    } catch (error) {
        logger.error(`Error in InventoryService.getWarHistory: ${Utils.printErrorLog(error)}`)
        return res.status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info("getWarHistory END");

    res.status(200).json({
        success: true,
        data: {
            response
        }
    });
}

async function isSigned(req, res) {
    logger.info(`isSigned PVP START address ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation;

    validation = PvpValidation.isSignedValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.body.address;
    let response;

    try {
        response = await UserService.checkUser(address);
    } catch (error) {
        logger.error(`Error in InventoryService.getUser, error: ${Utils.printErrorLog(error)}`);
        return res.json({
            success: false,
            error
        });
    }

    if (!response) {
        return res
            .status(404)
            .json({
                success: false
            });
    }

    logger.info(`isSigned PVP END`);
    return res
        .status(200)
        .json({
            success: true,
        });

}

async function signUp(req, res) {
    logger.info(`singUp PVP START address ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
    let validation;
    let response;

    validation = PvpValidation.isSignedValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let userData = req.body.user;
    try {
        response = await UserService.checkUser(address, userData);
    } catch (error) {
        logger.error(`Error in UserQueries.createUser: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }
    if (response) {
        logger.error(`User already exist: ${Utils.printErrorLog(address)}`);
        return res
            .status(401)
            .json({
                success: false,
            });
    }
    try {
        response = await UserService.createUserPvp(address, userData);
    } catch (error) {
        logger.error(`Error in UserQueries.createUser: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    logger.info(`signUp Pvp END`);
    return res
        .json({
            success: true,
        });
}

async function upgradeGear(req, res) {
    logger.info(`upgradeGear START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation
    validation = PvpValidation.upgradeGearValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idGearInstance = req.body.idGearInstance
    let consumableIds = req.body.consumableIds

    let response = {}
    try {
        response = await InventoryService.upgradeGear(address, idGearInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in InventoryService.upgradeGear: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`upgradeGear END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })
}

async function upgradeCard(req, res) {
    logger.info(`upgradeCard START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation
    validation = PvpValidation.upgradeCardValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idCardInstance = req.body.idCardInstance
    let consumableIds = req.body.consumableIds

    let response = {}
    try {
        response = await InventoryService.upgradeCard(address, idCardInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in InventoryService.upgradeGear: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`upgradeCard END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })
}

async function sendRecipe(req, res) {
    logger.info(`sendRecipe START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)



    let response;

    let validation = InventoryValidation.sendRecipeValidation(req);
    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let addressSender = req.locals.address;
    let addressReceiver = req.body.receiver;
    let idRecipeInstance = req.body.idRecipeInstance;
    let quantity = req.body.quantity;

    try {
        response = await InventoryService.sendRecipeService(
            addressSender,
            addressReceiver,
            Number(idRecipeInstance),
            Number(quantity),
        );

    } catch (error) {
        logger.error(`Error in InventoryService.sendRecipeService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse sendRecipe, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    logger.info(`sendRecipe END`);

    return res.status(200).json({
        success: true,
        data: {
            ...response.data,
        }
    })

}

async function sendItem(req, res) {
    logger.info(`sendItem START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)



    let response;

    let validation = InventoryValidation.sendItemValidation(req);
    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let addressSender = req.locals.address;
    let addressReceiver = req.body.receiver;
    let idItemInstance = req.body.idItemInstance;
    let quantity = req.body.quantity;

    try {

        response = await InventoryService.sendItemService(
            addressSender,
            addressReceiver,
            Number(idItemInstance),
            Number(quantity),
        );

    } catch (error) {
        logger.error(`Error in InventoryService.sendItemService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    logger.info(`sendItem END`);

    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse sendItem, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: {
            ...response.data,
        }
    })

}

async function sendCard(req, res) {
    logger.info(`sendCard START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let response;

    let validation = PvpValidation.sendCardValidation(req);
    if (!validation.success) return res.status(401).json(validation);

    let addressSender = req.locals.address;
    let { receiver: addressReceiver, idCardInstance } = req.body;

    try {
        response = await InventoryService.sendCardService(
            addressSender,
            addressReceiver,
            idCardInstance,
        )

    } catch (error) {
        logger.error(`Error in InventoryService.sendCardService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    logger.info('sendCard END');

    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse sendCard, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: {
            ...response.data,
        }
    });
}

async function sendGear(req, res) {
    logger.info(`sendGear START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    let response;

    let validation = PvpValidation.sendGearValidation(req);
    if (!validation.success) return res.status(401).json(validation);


    let addressSender = req.locals.address;
    let addressReceiver = req.body.receiver;
    let idGearInstance = req.body.idGearInstance;


    try {
        response = await InventoryService.sendGearService(
            addressSender,
            addressReceiver,
            idGearInstance,
        );
    } catch (error) {
        logger.error(`Error in InventoryService.sendGearService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    logger.info('sendGear END');
    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse sendGear, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: {
            ...response.data,
        }
    });
}

async function joinQueue(req, res) {
    logger.info(`joinQueue START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = PvpValidation.joinQueueValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address

    let trophies
    try {
        trophies = await BattleQueries.getTrophiesFromAddress(address)
    } catch (error) {
        logger.error(`Error in BattleQueries.getTrophiesFromAddress: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }
    trophies = trophies[0].warPoints
    if (trophies == null || trophies == undefined) {
        logger.error(`Error retrieving the trophies`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Error retrieving player trophies"
                }
            });
    }

    let response
    try {
        response = await MatchMakingService.joinQueueService(address, trophies)
    } catch (error) {
        logger.error(`Error in MatchMakingService.joinQueueService: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }

    logger.info(`JoinQueue END`)


    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })

}

async function leaveQueue(req, res) {
    logger.info(`leaveQueue START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = PvpValidation.leaveQueueValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address


    let response
    try {
        response = await MatchMakingService.leaveQueueService(address)
    } catch (error) {
        logger.error(`Error in MatchMakingService.leaveQueueService: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }

    logger.info('leaveQueue END')


    return res
        .status(200)
        .json({
            success: true,
            data: {
                response
            }
        })

}

async function checkMatchmaking(req, res) {
    logger.info(`checkMatchmaking START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = PvpValidation.checkMatchmakingValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address


    let response
    try {
        response = await MatchMakingQueries.checkWar(address)
    } catch (error) {
        logger.error(`Error in InventoryService.sendCardService: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }
    let war = {}
    if (response) {
        if (response[0] != null && response[0] != undefined) {
            war.activeWarsCount = response.length + 1
            war.idWar = response[0].idWar
            war.address1 = response[0].address1
            war.address2 = response[0].address2
        }
    }


    logger.info('leaveQueue END')


    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...war
            }
        })

}

async function checkQueueStatus(req, res) {
    logger.info(`checkQueueStatus START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = PvpValidation.checkQueueStatusValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address


    let response
    try {
        response = await MatchMakingQueries.checkQueue(address)
    } catch (error) {
        logger.error(`Error in MatchMakingQueries.checkQueue: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }
    let x = false
    if (response.length != 1) x = true

    logger.info('checkQueueStatus END')


    return res
        .status(200)
        .json({
            success: true,
            data: {
                status: x
            }
        })

}

async function changeGear(req, res) {
    logger.info(`changeGear START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let response;

    let validation = PvpValidation.changeGearValidation(req);
    if (!validation.success) return res.status(401).json(validation);

    let address = req.locals.address;
    let idCardInstance = req.body.idCardInstance;
    let idGearInstance = req.body.idGearInstance;
    let slot = req.body.slot.toLowerCase().trim();

    try {
        response = await InventoryService.changeGearService(
            address,
            idCardInstance,
            idGearInstance,
            slot
        );
    } catch (error) {
        logger.error(`Error in InventoryService.changeGearService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    logger.info('changeGear END');

    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse changeGear, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: {
            ...response.data,
        }
    });

}

async function unequipGear(req, res) {
    logger.info(`unequipGear START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let response;

    let validation = PvpValidation.unequipGearValidation(req);
    if (!validation.success) return res.status(401).json(validation);

    let address = req.locals.address;
    let idCardInstance = req.body.idCardInstance;
    let idGearInstance = req.body.idGearInstance;

    try {
        response = await InventoryService.unequipGearService(address, idCardInstance, idGearInstance);
    } catch (error) {
        logger.error(`Error in InventoryService.unequipGearService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }

    logger.info('unequipGear END');
    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse unequipGear, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: {
            ...response.data,
        }
    });
}

async function createBattle(req, res) {
    logger.info(`createBatle START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = PvpValidation.createBattleValidation(req);
    if (!validation.success) return res.status(401).json(validation)

    let address = req.locals.address;
    let idWar = req.body.idWar;
    let idArena = req.body.idArena;
    let cards = req.body.cards;
    let legendaryIds = req.body.legendaryIds

    let response;

    try {
        response = await InventoryService.createBattleService(
            address,
            idWar,
            idArena,
            cards,
            legendaryIds
        );
    } catch (error) {
        logger.error(`Error in InventoryService.createBattleService: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });
    }



    if (!response.success && response.logIp) {
        logger.error(`Error in Abuse createBattle, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`);
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    logger.info('createBattle END');
    return res.status(200).json({
        success: true,
        data: {
            ...response.data
        }
    })

}

async function battle(req, res) {
    logger.info(`battle START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    player1 = req.body.player1;
    trophies1 = req.body.trophies1;
    player2 = req.body.player2;
    trophies2 = req.body.trophies2;

    let winner, response;

    try {
        winner = await MatchMakingService.battleSimulator(player1, player2);
    } catch (error) {
        logger.error(`Error in MatchMakingService.battleSimulator: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }

    if (winner == player1) response = await MatchMakingService.eloHandler(winner, player2, trophies1, trophies2)
    if (winner == player2) response = await MatchMakingService.eloHandler(winner, player1, trophies2, trophies1)

    logger.info('battle END')
    return
    // return res
    //     .status(200)
    //     .json({
    //         success: true,
    //         data: {
    //             ...response
    //         }
    //     });
}

async function matchMakingRoutine(req, res) {
    logger.info(`matchMakingRoutine START`)

    let procedure, response;

    try {
        procedure = await MatchMakingQueries.callMatchMakingRoutine();
    } catch (error) {
        logger.error(`Error in MatchMakingQueries.callMatchMakingRoutine: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }

    try {
        response = await MatchMakingService.fixRoutine();
    } catch (error) {
        logger.error(`Error in MatchMakingQueries.callMatchMakingRoutine: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }


    logger.info(`matchMakingRoutine END, fixed wars: ${JSON.stringify(response)}`)

}

async function getActiveWar(req, res) {
    logger.info(`getActiveWar START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getActiveWarValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;

    let response;

    try {
        response = await InventoryService.getActiveWarService(address);
    } catch (error) {
        logger.error(`Error in InventoryService.getActiveWarService: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }

    if (!response.success) {
        return res.status(response.status).json({
            success: false,
            error: {
                errorMessage: response.errorMessage
            }
        })
    }

    logger.info(`getActiveWar END`);

    return res.status(200).json({
        success: true,
        data: response.data,
    })
}

async function getActiveWarInfo(req, res) {
    logger.info(`getActiveWarInfo START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getActiveWarInfoValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;
    let idWar = req.body.idWar
    let response;

    try {
        response = await InventoryService.getActiveWarInfoService(address, idWar);
    } catch (error) {
        logger.error(`Error in InventoryService.getActiveWarService: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }

    logger.info(`getActiveWarInfo END`);

    return res.status(200).json({
        success: true,
        data: {
            ...response
        }
    })
}

async function getAffix(req, res) {
    logger.info(`getAffix START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getAffixValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;
    let idWar = req.body.idWar;
    let turn = req.body.turn;

    let response;
    let affixIds;

    try {
        affixIds = await BattleQueries.getAffixGivenTurnAndIdWar(address, idWar, turn);
    } catch (error) {
        logger.error(`Error in BattleQueries.getAffixGivenTurnAndIdWar: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }

    console.log("$$$$$", affixIds)

    if (affixIds.length != 1) {
        logger.error(`Error in retrieving affixes`);
        return res.status(401).json({
            success: false,
            error,
        });
    }
    affixIds = affixIds[0].affixIds
    affixIds = affixIds.split(",");

    try {
        response = await BattleService.getAffixInfo(affixIds);
    } catch (error) {
        logger.error(`Error in BattleQueries.getAffixGivenTurnAndIdWar: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }


    logger.info(`getAffix END`);

    return res.status(200).json({
        success: true,
        data: {
            ...response
        },
    })
}

async function getAllAffixes(req, res) {
    logger.info(`getAllAffixes START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getActiveWarValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;

    let response;

    try {
        response = await BattleService.getAffixes();
    } catch (error) {
        logger.error(`Error in BattleService.getAffixes: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }


    logger.info(`getAllAffixes END`);

    return res.status(200).json({
        success: true,
        data: {
            ...response
        },
    })
}

async function battleServiceTest(req, res) {
    //logger.info(`battleServiceTest START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    // let validation = PvpValidation.getActiveWarValidation(req);

    // if (!validation.success) {
    //     return res.status(401).json(validation);
    // }
    logger.info("START BATTLESERVICE PVP")
    let succesfulWars = []
    let warsToDo
    try {
        warsToDo = await BattleQueries.getActiveWars();
    } catch (error) {
        logger.error(`Error in BattleService.getMatchInfo: ${Utils.printErrorLog(error)}`);
        return
        //  res.status(401).json({
        //     success: false,
        //     error,
        // });
    }
    logger.debug(`Wars retrieved :${JSON.stringify(warsToDo)}`);

    if (warsToDo == undefined || warsToDo == null) {
        logger.debug(`No wars need to be fought`);
        return
        //  res.status(200).json({
        //     success: true
        // })
    }
    if (warsToDo.length == 0) {
        logger.debug(`No wars need to be fought`);
        return 
        // res.status(200).json({
        //     success: true
        // })
    }
    for (let singleWar of warsToDo) {
        let idWar = singleWar.idWar
        logger.debug(`Starting the routine for the war with id :${idWar}`)
        // just to avoid inconsistent data
        let response;
        let turnsInfo
        try {
            turnsInfo = await BattleService.getMatchInfo(idWar)
        } catch (error) {
            logger.error(`Error in BattleService.getMatchInfo: ${Utils.printErrorLog(error)}`);
            return 
            // res.status(401).json({
            //     success: false,
            //     error,
            // });
        }
        let player1 = turnsInfo.p1Turns[0].address
        let player2 = turnsInfo.p2Turns[0].address


        //take the inputs given the idWar
        //do the cycle turn per turn to determine the cards 
        let winners = []
        let turns = {}
        for (let i = 0; i < 3; i++) {
            let info1, info2
            let bucket1 = turnsInfo.p1Turns[i]
            let bucket2 = turnsInfo.p2Turns[i]
            console.log("infos", bucket1, bucket2)
            try {
                info1 = await BattleService.getCardsInfo(JSON.parse(bucket1.disposition), bucket1.legendary, bucket1.affixIds, player1);
            } catch (error) {
                logger.error(`Error in BattleService.getCardsInfo: ${Utils.printErrorLog(error)}`);
                return
                //  res.status(401).json({
                //     success: false,
                //     error,
                // });
            }
            try {
                info2 = await BattleService.getCardsInfo(JSON.parse(bucket2.disposition), bucket2.legendary, bucket2.affixIds, player2);
            } catch (error) {
                logger.error(`Error in InventoryService.getCardsInfo: ${Utils.printErrorLog(error)}`);
                return
                //  res.status(401).json({
                //     success: false,
                //     error,
                // });
            }

            //a questo punto ho le matrici complete di info per ogni turno
            //lancio il service che crea il campo di battaglia
            console.log("******************************************************completata la costruzione delle matrici per entrambe i turni")
            let battle
            try {
                battle = await BattleService.doBattle(info1, info2, player1, player2);
            } catch (error) {
                logger.error(`Error in BattleService.doBattle: ${Utils.printErrorLog(error)}`);
                return
                //  res.status(401).json({
                //     success: false,
                //     error,
                // });
            }
            console.log("the winner is", battle.winner)
            winners[i] = battle.winner;
            turns["turn" + (i + 1)] = JSON.stringify(battle.storage)


        }
        //simple logic to dermine winner and looser
        let winnerUser, loserUser
        if (winners[0] == winners[1]) winnerUser = winners[0]
        if (winners[0] == winners[2]) winnerUser = winners[0]
        if (winners[1] == winners[2]) winnerUser = winners[1]
        if (winnerUser == player1) loserUser = player2
        else loserUser = player1
        let update
        try {
            update = await BattleQueries.setWarWinner(idWar, winnerUser)
        } catch (error) {
            logger.error(`Error in BattleQueries.setWarWinner: ${Utils.printErrorLog(error)}`);
            return
            //  res.status(401).json({
            //     success: false,
            //     error,
            // });
        }
        let eloResult
        try {
            eloResult = await MatchMakingService.eloHandler(winnerUser, loserUser)
        } catch (error) {
            logger.error(`Error in MatchMakingService.eloHandler: ${Utils.printErrorLog(error)}`);
            return 
            // res.status(401).json({
            //     success: false,
            //     error,
            // });
        }
        //console.log(`turns is ${JSON.stringify(turns)}`)
        let history
        try {
            history = await BattleQueries.updateHistory(idWar, turns, winners, eloResult.newTrophiesWinner, eloResult.oldTrophiesWinner, eloResult.newTrophiesLoser, eloResult.oldTrophiesLoser);
        } catch (error) {
            logger.error(`Error in BattleQueries.updateHistory: ${Utils.printErrorLog(error)}`);
            return
            //  res.status(401).json({
            //     success: false,
            //     error,
            // });
        }
        if (history.affectedRows != 1) {
            logger.error(`Could not set the warHistory`);
            return
            //  res.status(401).json({
            //     success: false,
            //     errorMessage: `Could not set the warHistory`,
            // });
        }
        succesfulWars.push(idWar)
    }

    logger.info(`battleServiceTest END`);

    return
    //  res.status(200).json({
    //     success: true,
    //     data: {
    //         succesfulWars
    //     }
    // })
}

async function getWarInstanceHistory(req, res) {
    logger.info(`getWarInstanceHistory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getWarInstanceHistoryValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;
    let idWar = req.body.idWar
    // just to avoid inconsistent data
    let response;

    try {
        response = await BattleService.getWarInstanceHistoryService(idWar)
    } catch (error) {
        logger.error(`Error in BattleService.getWarInstanceHistoryService: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }


    logger.info(`getWarInstanceHistory END`);

    return res.status(200).json({
        success: true,
        data: {
            ...response
        }
    })
}

async function getNotifications(req, res) {
    logger.info(`getNotifications START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.getNotificationsValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;
    let response;

    try {
        response = await UserQueries.getUnseenNotifications(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getUnseenNotifications: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }


    logger.info(`getNotifications END`);

    return res.status(200).json({
        success: true,
        data: response
    })
}

async function setNotificationSeen(req, res) {
    logger.info(`setNotificationSeen START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = PvpValidation.setNotificationSeenValidation(req);

    if (!validation.success) {
        return res.status(401).json(validation);
    }

    let address = req.locals.address;
    let idNotificationWar = req.body.idNotificationWar
    let response;

    try {
        response = await UserQueries.setNotificationSeen(address, idNotificationWar)
    } catch (error) {
        logger.error(`Error in UserQueries.setNotificationSeen: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }

    if (response.affectedRows != 1) {
        logger.error(`Could not set the Notification seen`);
        return res.status(401).json({
            success: false,
            errorMessage: `Could not set the Notification to seen`,
        });
    }


    logger.info(`setNotificationSeen END`);

    return res.status(200).json({
        success: true,
        data: {
        }
    })
}

async function getRecipeGemPvp(req, res) {
    logger.info(`getRecipeGemPvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);



    let recipeList


    try {
        recipeList = await InventoryQueries.getGemRecipes()
    } catch (error) {
        logger.error(`Error in InventoryQueries.getGemRecipes: ${Utils.printErrorLog(error)}`);
        return res.status(401).json({
            success: false,
            error,
        });
    }

    let recipeListFinal = []
    for (var i = 0; i < recipeList.length; ++i) {
        let recipeListRaw = recipeList[i]
        let category
        if(recipeListRaw.idCard != null) category = "card";
        if(recipeListRaw.idItem != null) category = "item";
        if(recipeListRaw.idGear != null) category = "gear";
        recipeListFinal.push({
            id: recipeListRaw.id,
            name: recipeListRaw.name,
            image: recipeListRaw.image,
            rarity: recipeListRaw.rarity,
        })
    }


    logger.info(`getRecipeGemPvp END`);

    return res.status(200).json({
        success: true,
        data: {
            recipeListFinal
        }
    })
}

async function getRecipeGemInstancePvp(req, res) {
    logger.info(`getRecipeGemInstancePvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
    let validation = InventoryValidation.getRecipeGemInstanceValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;

    let recipeGemData = {}
    try {
        recipeGemData = await InventoryService.getRecipeGemInstanceData(idRecipe, address);
    } catch (error) {
        logger.error(`Error in InventoryService getRecipeGemInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`getRecipeGemInstancePVP END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                recipeGemData
            }
        })
}

async function craftGemPvp(req, res) {
    logger.info(`craftGemPvp START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = PvpValidation.craftPvpNPCValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;
    let burnGearIds = req.body.burnGearIds
    let burnCardIds = req.body.burnCardIds
    let consumableIds = req.body.consumableIds
    let craftCount = req.body.craftCount

    let response
    try {
        response = await InventoryService.craftServiceGems(address, idRecipe, burnCardIds, burnGearIds, consumableIds, craftCount)
    } catch (error) {
        logger.error(`Error in InventoryService.craftServiceGems: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info("craftGemPvp END");
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function getBundleGemPvp(req, res) {
    logger.info(`getBundleGemPvp START  ipAddress: ${Validator.getIpAddress(req)}`);

    let gemList;

    try {
        gemList = await InventoryQueries.getBundleGem()
    } catch (error) {
        logger.error(`Error in InventoryQueries getBundleGemPvp: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (gemList.length == 0) {
        console.log("length 0")
    }

    logger.info(`getBundleGem END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                gemList
            }
        })
}


module.exports = {
    craftPvp,
    openChestPvp,
    getInventoryList,
    getInventoryInstanceData,
    getCardList,
    getCardInstance,
    getLeaderboard,
    getWarHistory,
    isSigned,
    signUp,
    upgradeGear,
    upgradeCard,
    sendRecipe,
    sendItem,
    sendCard,
    sendGear,
    joinQueue,
    leaveQueue,
    checkMatchmaking,
    changeGear,
    unequipGear,
    battle,
    unequipGear,
    createBattle,
    matchMakingRoutine,
    getActiveWar,
    getUserInfoPvp,
    checkQueueStatus,
    battleServiceTest,
    getAffix,
    getAllAffixes,
    craftPvpNPC,
    getActiveWarInfo,
    getWarInstanceHistory,
    getNotifications,
    setNotificationSeen,
    craftGemPvp,
    getRecipeGemInstancePvp,
    getRecipeGemPvp,
    getBundleGemPvp,
}