DROP PROCEDURE IF EXISTS createChallengeInstance;
DELIMITER $$

CREATE PROCEDURE createChallengeInstance(
    idItemTicket_ INT,
    idItem_ INT, 
    itemQuantity_ INT,
    toolLevel_ INT)

BEGIN
   
   DECLARE _idTool INT DEFAULT 
    (
        SELECT idTool 
        FROM tool_level 
        WHERE idToolLevel = toolLevel_
    ); 
    DECLARE _durabilityTool INT DEFAULT 
    (
        SELECT durabilityTotal
        FROM tool_level
        WHERE idToolLevel = toolLevel_
    ); 

	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
       
        
    -- INSERT IGNORE INTO item_instance
    --     (address, idItem, quantity)
    -- SELECT address, idItem_ as idItem, itemQuantity_ as quantity
    -- FROM item_instance
    -- WHERE idItem = idItemTicket_;
    
    
    /* NORMAL DROP TO THE FIRST*/
    -- UPDATE item_instance
    -- SET 
    --     quantity = quantity + quantityMaxNormal
    -- WHERE
    --     address in (SELECT * FROM (SELECT address 
    --                 FROM leaderboard
    --                 ORDER BY experienceFisherman DESC
    --                 limit 10 OFFSET 0) AS temp)
    -- AND idItem = itemNormal;

    INSERT INTO profile 
                (address) 
    SELECT address
    FROM item_instance
    WHERE idItem = idItemTicket_;
    
    /* NORMAL DROP TO THE SECOND*/
    INSERT INTO tool_instance 
                (idToolLevel, idTool, durability, address, equipped) 
    SELECT toolLevel_ AS idToolLevel, _idTool AS idTool, _durabilityTool as durablity, address, 0 as equipped
    FROM item_instance
    WHERE idItem = idItemTicket_;
                    
    /* DROP TOWN HALL*/
    INSERT INTO buildings
        (
            address, 
            type, 
            level, 
            idBuilding, 
            name, 
            description, 
            capacity, 
            dropQuantity,
            stake,
            upgradeStatus,
            endingTime,
            upgradeFirstLogin,
            `stored`,
            lastClaim,
            lastClaimAction,
            position
        )
    SELECT 
        address, 
        1 as type, 
        1 as level, 
        (SELECT max(idBuilding) + 1 from buildings where type = 1) as idBuilding, 
        'Town Hall' as name,
        'The bustling center of the city, the Town Hall echoes with the sounds of everyday life and hosts the most important community meetings.' as description,
        420 as capacity,
        2.5 as dropQuantity,
        1 as stake,
        0 as upgradeStatus,
        '2022-10-27 10:00:00.000000' as endingTime,
        0 as upgradeFirstLogin,
        0 as `stored`,
        '2022-10-27 10:00:00.000000' as lastClaim,
        '2022-10-27 10:00:00.000000' as lastClaimAction,
        1 as position

    FROM item_instance
    WHERE idItem = idItemTicket_;

    /*DROP LUMBERJACK*/
    INSERT INTO buildings
        (
            address, 
            type, 
            level, 
            idBuilding, 
            name, 
            description, 
            capacity, 
            dropQuantity,
            stake,
            upgradeStatus,
            endingTime,
            upgradeFirstLogin,
            `stored`,
            lastClaim,
            lastClaimAction,
            position
        )
    SELECT 
        address, 
        2 as type, 
        1 as level, 
        (SELECT max(idBuilding) + 1 from buildings where type = 2) as idBuilding, 
        'Lumberjack' as name,
        'As the demand for wood continuously increases over time due to its functionality, spurring conflicts between neighboring cities, the Lumberjack plays an important role in the history of civilization together with the Stone Mine.' as description,
        1922 as capacity,
        11.4 as dropQuantity,
        1 as stake,
        0 as upgradeStatus,
        '2022-10-27 10:00:00.000000' as endingTime,
        0 as upgradeFirstLogin,
        0 as `stored`,
        '2022-10-27 10:00:00.000000' as lastClaim,
        '2022-10-27 10:00:00.000000' as lastClaimAction,
        2 as position

    FROM item_instance
    WHERE idItem = idItemTicket_;

    /*DROP STONEMINE*/
    INSERT INTO buildings
        (
            address, 
            type, 
            level, 
            idBuilding, 
            name, 
            description, 
            capacity, 
            dropQuantity,
            stake,
            upgradeStatus,
            endingTime,
            upgradeFirstLogin,
            `stored`,
            lastClaim,
            lastClaimAction,
            position
        )
    SELECT 
        address, 
        3 as type, 
        1 as level, 
        (SELECT max(idBuilding) + 1 from buildings where type = 3) as idBuilding, 
        'Stone Mine' as name,
        'From simple hunters to constructors, the discovery of stone completely changed the way the Ancient Society looked at the world.' as description,
        640 as capacity,
        3.8 as dropQuantity,
        1 as stake,
        0 as upgradeStatus,
        '2022-10-27 10:00:00.000000' as endingTime,
        0 as upgradeFirstLogin,
        0 as `stored`,
        '2022-10-27 10:00:00.000000' as lastClaim,
        '2022-10-27 10:00:00.000000' as lastClaimAction,
        3 as position

    FROM item_instance
    WHERE idItem = idItemTicket_;

    /*DROP FISHERMAN*/
    INSERT INTO buildings
        (
            address, 
            type, 
            level, 
            idBuilding, 
            name, 
            description, 
            capacity, 
            dropQuantity,
            stake,
            upgradeStatus,
            endingTime,
            upgradeFirstLogin,
            `stored`,
            lastClaim,
            lastClaimAction,
            position
        )
    SELECT 
        address, 
        4 as type, 
        1 as level, 
        (SELECT max(idBuilding) + 1 from buildings where type = 4) as idBuilding, 
        'Fisherman' as name,
        "Don't upgrade this Fisherman, nothing will happen and you'll just lose the Resources" as description,
        -1 as capacity,
        -1 as dropQuantity,
        1 as stake,
        0 as upgradeStatus,
        '2022-10-27 10:00:00.000000' as endingTime,
        0 as upgradeFirstLogin,
        0 as `stored`,
        '2022-10-27 10:00:00.000000' as lastClaim,
        '2022-10-27 10:00:00.000000' as lastClaimAction,
        7 as position

    FROM item_instance
    WHERE idItem = idItemTicket_;
    
    COMMIT;

    

END$$

DELIMITER ;
