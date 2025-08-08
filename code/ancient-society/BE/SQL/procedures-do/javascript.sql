DROP PROCEDURE IF EXISTS claimAll;
DELIMITER ;;
CREATE PROCEDURE `claimAll`()
BEGIN   
	
   
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
	UPDATE utente AS u
	SET ancien = ancien + CONVERT((SELECT SUM(`stored`)
							FROM buildings as b1
							WHERE b1.address = u.address
							AND b1.type = 1),DECIMAL(14,2)),
							
	wood = wood + CONVERT((SELECT SUM(`stored`)
							FROM buildings as b1
							WHERE u.address = b1.address
							AND b1.type = 2), DECIMAL(14,2)),
							
	stone = stone + CONVERT((SELECT SUM(`stored`)
							FROM buildings as b1
							WHERE u.address = b1.address
							AND b1.type = 3), DECIMAL(14,2));
                            
	UPDATE buildings 
    SET `stored` = 0;
    
    UPDATE leaderboard 
    SET experience = 0, 
    experienceFisherman = 0;
    
   COMMIT;
   
END ;;
DELIMITER ;


DROP PROCEDURE IF EXISTS createBuildingtemp;
DELIMITER ;;
CREATE PROCEDURE `createBuildingtemp`()
BEGIN   
	
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
        
	
    INSERT INTO buildingtemp (address, type, quantity, saleTime, status) 
        SELECT 
            address, 1 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1001

    UNION 

        SELECT 
            address, 2 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1002

    UNION 

        SELECT 
            address, 3 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1003

    UNION 
        SELECT 
            address, 4 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 3010

    UNION 
        SELECT 
            address, 1000 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1004
    ;

    UPDATE
        item_instance
    SET 
        quantity = 0
    WHERE 
        quantity > 0
    AND
        (
            idItem = 1001
        OR 	idItem = 1002
        OR 	idItem = 1003
        OR 	idItem = 3010
        OR  idItem = 1004
        )
    ;

    
   COMMIT;

END ;;
DELIMITER ;



DROP PROCEDURE IF EXISTS disableEvent;
DELIMITER ;;
CREATE  PROCEDURE `disableEvent`()
BEGIN

    #Remove event items 

    DELETE FROM item_instance 

    WHERE idItem IN (100001, 100002);



    #Remove items from market place

    DELETE FROM marketplace_inventory

    WHERE idItem IN (100001, 100002) AND STATUS = 1 AND endingTime > NOW();



    #Disable all recipes

    UPDATE recipe

    SET recipe.NPC = 0, recipe.landNPC = 0

    WHERE recipe.type LIKE 'Solaria%';

END ;;
DELIMITER ;





DROP PROCEDURE IF EXISTS dropItem;
DELIMITER ;;
CREATE  PROCEDURE `dropItem`(player_ VARCHAR(45), idItem_ INT, itemQuantity_ INT)
BEGIN   
	
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;

        INSERT INTO item_instance
            (address, idItem, quantity)
        VALUES
            (player_, idItem_, itemQuantity_)
        ON DUPLICATE KEY
        UPDATE quantity = quantity + itemQuantity_;
    
   COMMIT;

END ;;
DELIMITER ;





DROP PROCEDURE IF EXISTS dropTool;
DELIMITER ;;
CREATE  PROCEDURE `dropTool`(player_ VARCHAR(45), toolLevel_ INT, toolQuantity_ INT)
BEGIN   

    DECLARE _i INT DEFAULT 0; 
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

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;

        WHILE (_i < toolQuantity_) DO

            INSERT INTO tool_instance 
                (idToolLevel, idTool, durability, address, equipped) 
            VALUES 
                (toolLevel_, _idTool, _durabilityTool, player_, 0);

            SET _i = _i + 1;

        END WHILE;
    
   COMMIT;
END ;;
DELIMITER ;




DROP PROCEDURE IF EXISTS enableEvent;
DELIMITER ;;
CREATE  PROCEDURE `enableEvent`()
BEGIN

    #Enable City NPC recipes

    UPDATE recipe

    SET recipe.NPC = 1

    WHERE recipe.type = 'Frostfire 2023'

    AND idRecipe IN (1300, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308);



    #Enable Land NPC recipes

    UPDATE recipe

    SET recipe.landNPC = 1

    WHERE recipe.type = 'Frostfire 2023'

    AND idRecipe IN (1309, 1310, 1311, 1312, 1313, 1314);



    #Enable Fragments Recipes

    UPDATE recipe

    SET recipe.NPC = 1

    WHERE recipe.type = 'Frostfire 2023'

    AND idRecipe IN (1315, 1316, 1317, 1318);



    #Enable Building Craft Recipes

    UPDATE recipe

    SET recipe.NPC = 1

    WHERE recipe.type = 'Frostfire 2023'

    AND idRecipe IN (1319, 1320, 1321, 1322);





    #Extra Updates 

    #=================================================================



    #Adjust Passive Cycles for Miner to be harmonized with Axe 23h30min cooldonw

    UPDATE passive_level

    SET actionCoolDown = FLOOR(actionCoolDown * 1410/1440) 

    WHERE buildingType = 5;

END ;;
DELIMITER ;





DROP PROCEDURE IF EXISTS getAccountCity;
DELIMITER ;;
CREATE  PROCEDURE `getAccountCity`(player varchar(45))
BEGIN
		
    DECLARE baseUriReveal varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/reveal/';
    DECLARE baseUriSprite varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/';
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
        
	SELECT b.id, b.type, b.level, b.name, b.description, b.stake,
		b.address, b.idBuilding, b.moreInfo,b.level,
		b.upgradeStatus, b.bundle, b.position, b.cursed,

		concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), b.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as imageURL,
		 
		concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), u.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as upgradeImage,


		concat(baseUriSprite, IF(b.upgradeStatus, 'upgrade/spriteUpgrade.webp', 
		concat(concat(concat( LOWER(REPLACE(b.name, ' ', '')), '/'), b.level), '.webp')  )) as imageSprite


		FROM buildings as b
		LEFT JOIN upgrade u
			ON (b.level) + 1 = u.level AND b.type = u.type
		LEFT JOIN inventario as i
			ON b.id = i.idBuilding

		WHERE address = player and stake = 1;
        
   COMMIT;
   

END ;;
DELIMITER ;





DROP PROCEDURE IF EXISTS getAccountData;
DELIMITER ;;
CREATE  PROCEDURE `getAccountData`(player varchar(45))
BEGIN   

	DECLARE landInstance INT DEFAULT (SELECT idLandInstance  
				FROM land_guest
				left join land_contract on land_guest.idContract = land_contract.idContract 
				WHERE land_guest.address = player
                AND land_contract.endingTime > current_timestamp);
			
	declare bonus INT default if (landInstance is not null , (select
																bonus 
																from land left join land_instance on land.idLand = land_instance.idLand 
																where idLandInstance = landInstance), 0);
																
	declare land_type varchar(150) default if (landInstance is not null,(select type from land left join land_instance on land.idLand = land_instance.idLand 
																where idLandInstance = landInstance) , 0);
	declare boostedType INT;

	declare lc DATETIME(6);
	
	declare dropQT FLOAT;

	/*TRACE THE AMOUNT PRODUCED TO INCREASE CURRENT_PRODUCTION */
	declare amountProduced float DEFAULT (SELECT ( (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) 
						  FROM  buildings
						  WHERE stake = 1
						  AND upgradeStatus = 0
						  AND type = 1
						  AND address = player);
									
	declare fee INT default if ((select type from land_guest where address = player) <> 'free', (select fee 
																from land_contract left join land_guest  on land_contract.idContract  = land_guest.idContract  
																where idLandInstance = landInstance and contractStatus = 'active' and land_guest.address = player), 0);												
	
	
	DECLARE bld_upgradedId INT DEFAULT (SELECT id 
				FROM buildings 
				WHERE upgradeStatus = 1
				AND endingTime < current_timestamp
				AND address = player);

	/*Calcolo experience if upgrade started after reset*/
	DECLARE upgradeTime INT DEFAULT (SELECT upgradeTime 
							FROM buildings as b
							LEFT JOIN upgrade u
								ON (b.level) + 1 = u.level AND b.type = u.type
							WHERE b.id = bld_upgradedId);
							
							
	DECLARE bld_typeInit INT DEFAULT (SELECT type 
		FROM buildings
		WHERE stake = 1
		AND upgradeStatus = 1
		AND endingTime < current_timestamp
		AND address = player);
        
	DECLARE bld_type INT DEFAULT IF(bld_typeInit IS NOT NULL, bld_typeInit, 0);
    
	DECLARE bld_upgradedDropInit FLOAT DEFAULT (SELECT (dropQuantity/3600) * upgradeTime
								FROM buildings 
								WHERE stake = 1
								AND upgradeStatus = 1
								AND endingTime < current_timestamp
								AND address = player);
                                
	DECLARE bld_upgradedDrop FLOAT DEFAULT IF(bld_upgradedDropInit IS NOT NULL, bld_upgradedDropInit, 0);
                                
    DECLARE bld_upgradedNewCapacityInit INT DEFAULT (SELECT u.newCapacity 
			FROM buildings as b
            LEFT JOIN upgrade as u
            ON (b.level) + 1 = u.level AND b.type = u.type
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player);
		
	DECLARE bld_upgradedNewCapacity INT DEFAULT IF(bld_upgradedNewCapacityInit IS NOT NULL, bld_upgradedNewCapacityInit, 0);
            
    DECLARE bld_upgradedNewDropQuantityInit FLOAT DEFAULT (SELECT u.newDropQuantity
			FROM buildings as b
            LEFT JOIN upgrade as u
            ON (b.level) + 1 = u.level AND b.type = u.type
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player);
	
    DECLARE bld_upgradedNewDropQuantity FLOAT DEFAULT IF(bld_upgradedNewDropQuantityInit IS NOT NULL, bld_upgradedNewDropQuantityInit, 0);
    
    declare bonusProduction FLOAT;
            
	
			
	DECLARE upgradeStartingTime DATETIME(6) DEFAULT (SELECT DATE_SUB(endingTime, INTERVAL upgradeTime SECOND) 
													FROM buildings as b
                                                    WHERE b.id = bld_upgradedId);
	
	DECLARE LEADERBOARDRESET DATETIME(6) DEFAULT '2023-01-03 23:00:00.000000';
	
    DECLARE baseUriReveal varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/reveal/';
    DECLARE baseUriSprite varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/';
   
   DECLARE exit handler for sqlexception
		BEGIN
			GET DIAGNOSTICS CONDITION 1
			@p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
			SELECT @p1 as RETURNED_SQLSTATE  , @p2 as MESSAGE_TEXT;
		ROLLBACK;
	END;
    
   DECLARE exit handler for sqlwarning
		BEGIN
			GET DIAGNOSTICS CONDITION 1
			@p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
			SELECT @p1 as RETURNED_SQLSTATE  , @p2 as MESSAGE_TEXT;
		ROLLBACK;
	END;
	
   
	set boostedType = case when land_type = 'forest' then 2
						when land_type = 'mountain' then 3
						else null
					end;
	set dropQt = (select dropQuantity  from buildings where stake = 1 and address = player and type = boostedType);

	set lc = (select lastClaim  from buildings where type = boostedType and stake = 1 and address = player );

	/* ENSURE NULL */
    set bonus = coalesce(bonus, 0);
    set fee = coalesce(fee, 0);
    set lc = coalesce(lc, current_timestamp);
    set dropQt = coalesce(dropQt, 0);
    
    /*NEEDED TO TRACE AMOUNT produced*/
    SET amountProduced = (SELECT  IF((`stored` + amountProduced) >= capacity, capacity - `stored`, amountProduced)
						  FROM  buildings
						  WHERE stake = 1
						  AND upgradeStatus = 0
						  AND type = 1
						  AND address = player);
    
   START TRANSACTION;
  
  /*NEEDED TO TRACE AMOUNT produced*/                         

	UPDATE production_history 
	SET currentProduction = currentProduction + ifnull(amountProduced, 0)
	WHERE idProductionHistory = (SELECT * FROM (SELECT max(ph2.idProductionHistory) 
							FROM production_history ph2) AS temp);
	
        
	IF bld_upgradedId IS NOT NULL THEN
    
		IF LEADERBOARDRESET < upgradeStartingTime THEN 
		
			UPDATE leaderboard
				SET experience = IF(experience IS NULL, 0, experience) + 
				IF(bld_type = 1, 4, IF(bld_type = 2, 1, IF(bld_type = 3, 3, 0))) * bld_upgradedDrop
				WHERE address = player;
		END IF;
    
		UPDATE buildings
			SET upgradeFirstLogin = true,
			upgradeStatus = false, 
			level = level + 1,
			capacity = bld_upgradedNewCapacity, 
			dropQuantity = bld_upgradedNewDropQuantity, 
			lastClaim = endingTime,
			lastClaimAction = IF(endingTime > LEADERBOARDRESET, endingTime, lastClaimAction)

			WHERE id = bld_upgradedId
			AND upgradeStatus = true;
            
	END IF;
        
	/*NEEDED TO UPDATE BOOSTED BUILDINGS */
	if landInstance is not null then 
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + ((dropQuantity+(dropQuantity*bonus/100)-((dropQuantity*bonus/100)*fee/100))/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + ((dropQuantity+(dropQuantity*bonus/100)-((dropQuantity*bonus/100)*fee/100))/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type = boostedType
		AND address = player;
		
		
		
	else
		
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type <> 4
		AND type <> 5
		AND address = player;
		
	
	end if;
	/*NEEDED TO UPDATE NOT BOOSTED BUILDINGS */
	if landInstance is not null then 
		
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type <> 4
		AND type <> 5
		and type <> boostedType
		AND address = player;
	end if ;
	/*NEEDED TO UPDATE LAND OWNER'S STORAGE */
	if landInstance is not null then 
		
		UPDATE land_instance 
		SET storage = storage + ((((dropQt*bonus/100)*fee/100)/3600) * timestampdiff(second, lc, current_timestamp))  
			where idLandInstance = landInstance;
	end if;
        
	SELECT b.id, b.type, b.level, b.name, b.description, b.stake,
		b.capacity, b.dropQuantity, b.dropInterval, b.address, b.idBuilding, b.moreInfo,
		b.upgradeStatus, b.endingTime, b.upgradeFirstLogin, b.stored,
		b.lastClaim, b.bundle, b.position, b.cursed, b.idToolInstance,
		b.isOldStakerContract, b.prestigeCounter,

		u.ancien, u.wood, u.stone, u.level as upgradeLevel, u.newCapacity,
		u.newDropQuantity, u.upgradeTime, u.newDescription, u.newMoreInfo,

		 concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), b.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as imageURL,
		 
		concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), u.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as upgradeImage,


		concat(baseUriSprite, IF(b.upgradeStatus, 'upgrade/spriteUpgrade.webp', 
		concat(concat(concat( LOWER(REPLACE(b.name, ' ', '')), '/'), b.level), '.webp')  )) as imageSprite


		FROM buildings as b
		LEFT JOIN upgrade u
			ON (b.level) + 1 = u.level AND b.type = u.type
		LEFT JOIN inventario as i
			ON b.id = i.idBuilding

		WHERE address = player;
        
   COMMIT;
   
END ;;
DELIMITER ;









DROP PROCEDURE IF EXISTS getBlessing;
DELIMITER ;;
CREATE  PROCEDURE `getBlessing`(player varchar(45))
BEGIN   
	
   
   
	DECLARE blessing_onGoing_status VARCHAR(15) DEFAULT 
    (SELECT status 
		FROM blessings 
		WHERE address = player
        AND (status='running' OR  status='done') 
	);
    
	DECLARE blessing_onGoing_EndingTime DATETIME(6) DEFAULT 
    (SELECT blessingEndingTime 
		FROM blessings 
		WHERE address = player
        AND (status='running' OR  status='done') 
	);
    


	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
    
    
   
   START TRANSACTION;
	
    /*IF THE ADDRESS HAS AT LEAST ON BLESSING RUNNING OR DONE*/
	IF blessing_onGoing_status = 'running' THEN 
		/*CHECK IF THE BLESSING ENDING_TIME IS OVERDUE*/
        IF current_timestamp > blessing_onGoing_EndingTime THEN 
			UPDATE blessings
			SET status = 'done'
			WHERE address = player AND status = 'running';
        END IF;
	END IF;
    
	/*RETURN THE BLESSING DATA*/
	SELECT * FROM blessings
	WHERE address = player
    AND (status='running' OR  status='done');
        
   COMMIT;
    
END ;;
DELIMITER ;








DROP PROCEDURE IF EXISTS mintBuilding;
DELIMITER ;;
CREATE  PROCEDURE `mintBuilding`(
    address varchar(45), 
    type_ int, 
    level int, 
    idBuilding_ int, 
    name varchar(50), 
    description varchar(1000), 
    capacity int, 
    dropQuantity int
)
BEGIN   
    
    declare alreadyExist int default 0;

	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;      

        set alreadyExist = (SELECT count(*) from buildings where type = type_ and idBuilding = idBuilding_);                   
           
        IF alreadyExist = 0 then 
            INSERT IGNORE INTO buildings
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
            VALUES
                (
                    address, 
                    type_, 
                    level, 
                    idBuilding_, 
                    name, 
                    description, 
                    capacity, 
                    dropQuantity, 
                    0, 
                    0, 
                    current_timestamp,
                    0, 
                    0, 
                    current_timestamp,
                    current_timestamp, 
                    0
                );
        END IF;

   COMMIT;
    
END ;;
DELIMITER ;








DROP PROCEDURE IF EXISTS moveAlphaSupplies;
DELIMITER ;;
CREATE  PROCEDURE `moveAlphaSupplies`(player_from VARCHAR(45), player_to VARCHAR(45))
BEGIN   

	DECLARE supplies_to_move INT DEFAULT IFNULL(
        (SELECT i_i.quantity 
        FROM omega_db.item_instance as i_i 
        where i_i.idItem = 303 
        and i_i.address = player_from)
    , 0);
    
    DECLARE id_item_ins INT DEFAULT 
        (SELECT i_i.idItemInstance 
        FROM omega_db.item_instance as i_i 
        where i_i.idItem = 303 
        and i_i.address = player_from);


	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
   
		UPDATE omega_db.item_instance
        SET quantity = 0
        WHERE idItemInstance = id_item_ins;

		INSERT INTO alpha_db.item_instance
			(address, idItem, quantity)
		VALUES
			(player_to, 45, supplies_to_move)
		ON DUPLICATE KEY
		UPDATE quantity = quantity + supplies_to_move;
    
   COMMIT;

END ;;
DELIMITER ;







DROP PROCEDURE IF EXISTS newGetAccountData;
DELIMITER ;;
CREATE  PROCEDURE `newGetAccountData`(player varchar(45))
BEGIN   

	DECLARE landInstance INT DEFAULT (SELECT idLandInstance  
				FROM land_guest
				left join land_contract on land_guest.idContract = land_contract.idContract 
				WHERE land_guest.address = player
                AND land_contract.endingTime > current_timestamp);
			
	declare bonus INT default if (landInstance is not null , (select
																bonus 
																from land left join land_instance on land.idLand = land_instance.idLand 
																where idLandInstance = landInstance), 0);
																
	declare land_type varchar(150) default if (landInstance is not null,(select type from land left join land_instance on land.idLand = land_instance.idLand 
																where idLandInstance = landInstance) , 0);
	declare boostedType INT;

	declare lc DATETIME(6);
	
	declare dropQT FLOAT;

	/*TRACE THE AMOUNT PRODUCED TO INCREASE CURRENT_PRODUCTION */
	declare amountProduced float DEFAULT (SELECT ( (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) 
						  FROM  buildings
						  WHERE stake = 1
						  AND upgradeStatus = 0
						  AND type = 1
						  AND address = '0x26881c56f7791e8f36cCF0A337CA2c53f0Ae10c8');
									
	declare fee INT default if ((select type from land_guest where address = player) <> 'free', (select fee 
																from land_contract left join land_guest  on land_contract.idContract  = land_guest.idContract  
																where idLandInstance = landInstance and contractStatus = 'active' and land_guest.address = player), 0);												
	
	
	DECLARE bld_upgradedId INT DEFAULT (SELECT id 
				FROM buildings 
				WHERE upgradeStatus = 1
				AND endingTime < current_timestamp
				AND address = player);

	/*Calcolo experience if upgrade started after reset*/
	DECLARE upgradeTime INT DEFAULT (SELECT upgradeTime 
							FROM buildings as b
							LEFT JOIN upgrade u
								ON (b.level) + 1 = u.level AND b.type = u.type
							WHERE b.id = bld_upgradedId);
							
							
	DECLARE bld_typeInit INT DEFAULT (SELECT type 
		FROM buildings
		WHERE stake = 1
		AND upgradeStatus = 1
		AND endingTime < current_timestamp
		AND address = player);
        
	DECLARE bld_type INT DEFAULT IF(bld_typeInit IS NOT NULL, bld_typeInit, 0);
    
	DECLARE bld_upgradedDropInit FLOAT DEFAULT (SELECT (dropQuantity/3600) * upgradeTime
								FROM buildings 
								WHERE stake = 1
								AND upgradeStatus = 1
								AND endingTime < current_timestamp
								AND address = player);
                                
	DECLARE bld_upgradedDrop FLOAT DEFAULT IF(bld_upgradedDropInit IS NOT NULL, bld_upgradedDropInit, 0);
                                
    DECLARE bld_upgradedNewCapacityInit INT DEFAULT (SELECT u.newCapacity 
			FROM buildings as b
            LEFT JOIN upgrade as u
            ON (b.level) + 1 = u.level AND b.type = u.type
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player);
		
	DECLARE bld_upgradedNewCapacity INT DEFAULT IF(bld_upgradedNewCapacityInit IS NOT NULL, bld_upgradedNewCapacityInit, 0);
            
    DECLARE bld_upgradedNewDropQuantityInit FLOAT DEFAULT (SELECT u.newDropQuantity
			FROM buildings as b
            LEFT JOIN upgrade as u
            ON (b.level) + 1 = u.level AND b.type = u.type
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player);
	
    DECLARE bld_upgradedNewDropQuantity FLOAT DEFAULT IF(bld_upgradedNewDropQuantityInit IS NOT NULL, bld_upgradedNewDropQuantityInit, 0);
    
    declare bonusProduction FLOAT;
            
	
			
	DECLARE upgradeStartingTime DATETIME(6) DEFAULT (SELECT DATE_SUB(endingTime, INTERVAL upgradeTime SECOND) 
													FROM buildings as b
                                                    WHERE b.id = bld_upgradedId);
	
	DECLARE LEADERBOARDRESET DATETIME(6) DEFAULT '2023-01-03 23:00:00.000000';
	
    DECLARE baseUriReveal varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/reveal/';
    DECLARE baseUriSprite varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/';
   
   DECLARE exit handler for sqlwarning
		BEGIN
			GET DIAGNOSTICS CONDITION 1
			@p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
			SELECT @p1 as RETURNED_SQLSTATE  , @p2 as MESSAGE_TEXT;
		ROLLBACK;
	END;
	
   
	set boostedType = case when land_type = 'forest' then 2
						when land_type = 'mountain' then 3
						else null
					end;
	set dropQt = (select dropQuantity  from buildings where stake = 1 and address = player and type = boostedType);

	set lc = (select lastClaim  from buildings where type = boostedType and stake = 1 and address = player );

	/* ENSURE NULL */
    set bonus = coalesce(bonus, 0);
    set fee = coalesce(fee, 0);
    set lc = coalesce(lc, current_timestamp);
    set dropQt = coalesce(dropQt, 0);
    
    /*NEEDED TO TRACE AMOUNT produced*/
    SET amountProduced = (SELECT  IF((`stored` + amountProduced) >= capacity, capacity - `stored`, amountProduced)
						  FROM  buildings
						  WHERE stake = 1
						  AND upgradeStatus = 0
						  AND type = 1
						  AND address = player);
    
   START TRANSACTION;
  
  /*NEEDED TO TRACE AMOUNT produced*/                         

	UPDATE production_history 
	SET currentProduction = currentProduction + ifnull(amountProduced, 0)
	WHERE idProductionHistory = (SELECT * FROM (SELECT max(ph2.idProductionHistory) 
							FROM production_history ph2) AS temp);
	
        
	IF bld_upgradedId IS NOT NULL THEN
    
		IF LEADERBOARDRESET < upgradeStartingTime THEN 
		
			UPDATE leaderboard
				SET experience = IF(experience IS NULL, 0, experience) + 
				IF(bld_type = 1, 4, IF(bld_type = 2, 1, IF(bld_type = 3, 3, 0))) * bld_upgradedDrop
				WHERE address = player;
		END IF;
    
		UPDATE buildings
			SET upgradeFirstLogin = true,
			upgradeStatus = false, 
			level = level + 1,
			capacity = bld_upgradedNewCapacity, 
			dropQuantity = bld_upgradedNewDropQuantity, 
			lastClaim = endingTime,
			lastClaimAction = IF(endingTime > LEADERBOARDRESET, endingTime, lastClaimAction)

			WHERE id = bld_upgradedId
			AND upgradeStatus = true;
            
	END IF;
        
	/*NEEDED TO UPDATE BOOSTED BUILDINGS */
	if landInstance is not null then 
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + ((dropQuantity+(dropQuantity*bonus/100)-((dropQuantity*bonus/100)*fee/100))/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + ((dropQuantity+(dropQuantity*bonus/100)-((dropQuantity*bonus/100)*fee/100))/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type = boostedType
		AND address = player;
		
		
		
	else
		
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type <> 4
		AND type <> 5
		AND address = player;
		
	
	end if;
	/*NEEDED TO UPDATE NOT BOOSTED BUILDINGS */
	if landInstance is not null then 
		
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type <> 4
		AND type <> 5
		and type <> boostedType
		AND address = player;
	end if ;
	/*NEEDED TO UPDATE LAND OWNER'S STORAGE */
	if landInstance is not null then 
		
		UPDATE land_instance 
		SET storage = storage + ((((dropQt*bonus/100)*fee/100)/3600) * timestampdiff(second, lc, current_timestamp))  
			where idLandInstance = landInstance;
	end if;
        
	SELECT b.id, b.type, b.level, b.name, b.description, b.stake,
		b.capacity, b.dropQuantity, b.dropInterval, b.address, b.idBuilding, b.moreInfo,
		b.upgradeStatus, b.endingTime, b.upgradeFirstLogin, b.stored,
		b.lastClaim, b.bundle, b.position, b.cursed, b.idToolInstance,
		b.isOldStakerContract, b.prestigeCounter,

		u.ancien, u.wood, u.stone, u.level as upgradeLevel, u.newCapacity,
		u.newDropQuantity, u.upgradeTime, u.newDescription, u.newMoreInfo,

		 concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), b.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as imageURL,
		 
		concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), u.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as upgradeImage,


		concat(baseUriSprite, IF(b.upgradeStatus, 'upgrade/spriteUpgrade.webp', 
		concat(concat(concat( LOWER(REPLACE(b.name, ' ', '')), '/'), b.level), '.webp')  )) as imageSprite


		FROM buildings as b
		LEFT JOIN upgrade u
			ON (b.level) + 1 = u.level AND b.type = u.type
		LEFT JOIN inventario as i
			ON b.id = i.idBuilding

		WHERE address = player;
        
   COMMIT;
   
    

END ;;
DELIMITER ;







DROP PROCEDURE IF EXISTS resetLeaderboard;
DELIMITER ;;
CREATE  PROCEDURE `resetLeaderboard`()
BEGIN   
	
   
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
   
   
	/*finire e fixare*/
                            
	UPDATE buildings 
    SET lastClaimStored = 0,
	lastClaimAction = '2023-01-03 23:00:00.000000';
    
    UPDATE leaderboard 
    SET experience = 0, 
    experienceFisherman = 0;
    
   COMMIT;
    
END ;;
DELIMITER ;








DROP PROCEDURE IF EXISTS rewardLeaderboardFisherman;
DELIMITER ;;
CREATE  PROCEDURE `rewardLeaderboardFisherman`(
    itemNormal int,
    quantityMaxNormal int,
    quantityMiddleNormal int,
    quantitySmallNormal int
)
BEGIN
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
       
        
        INSERT IGNORE INTO item_instance
			(address, idItem, quantity)
		SELECT address, itemNormal as idItem, 0 as quantity
		FROM leaderboard
		ORDER BY experience DESC
        LIMIT 100;
        
        
        /* NORMAL DROP TO THE FIRST*/
        UPDATE item_instance
        SET 
			quantity = quantity + quantityMaxNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 10 OFFSET 0) AS temp)
		AND idItem = itemNormal;
		
        /* NORMAL DROP TO THE SECOND*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantityMiddleNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 15 OFFSET 10) AS temp)
		AND idItem = itemNormal;
                        
		/* NORMAL DROP TO THE THIRD*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantitySmallNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 25 OFFSET 25) AS temp)
		AND idItem = itemNormal;
        
	    COMMIT;
   
END ;;
DELIMITER ;






DROP PROCEDURE IF EXISTS rewardLeaderboardGeneral;
DELIMITER ;;
CREATE  PROCEDURE `rewardLeaderboardGeneral`(
	itemSpecial int,
    itemNormal int, 
    quantityMaxSpecial int, 
    quantityMiddleSpecial int, 
    quantitySmallSpecial int, 
    quantityMaxNormal int,
    quantityMiddleNormal int,
    quantitySmallNormal int
)
BEGIN
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
        INSERT IGNORE INTO item_instance
			(address, idItem, quantity)
		SELECT address, itemSpecial as idItem, 0 as quantity
		FROM leaderboard
		ORDER BY experience DESC
        LIMIT 3;
        
        INSERT IGNORE INTO item_instance
			(address, idItem, quantity)
		SELECT address, itemNormal as idItem, 0 as quantity
		FROM leaderboard
		ORDER BY experience DESC
        LIMIT 100;
        
        /* SPECIAL DROP TO THE FIRST*/
        UPDATE item_instance
        SET 
			quantity = quantity + quantityMaxSpecial
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 1 OFFSET 0) AS temp)
		AND idItem = itemSpecial;
                        
		/* SPECIAL DROP TO THE SECOND*/              
		UPDATE item_instance
        SET 
			quantity = quantity + quantityMiddleSpecial
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 1 OFFSET 1) AS temp)
		AND idItem = itemSpecial;
		
        /* SPECIAL DROP TO THE THIRD*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantitySmallSpecial
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 1 OFFSET 2) AS temp)
		AND idItem = itemSpecial;
		
        /* NORMAL DROP TO THE FIRST*/
        UPDATE item_instance
        SET 
			quantity = quantity + quantityMaxNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 25 OFFSET 0) AS temp)
		AND idItem = itemNormal;
		
        /* NORMAL DROP TO THE SECOND*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantityMiddleNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 25 OFFSET 25) AS temp)
		AND idItem = itemNormal;
                        
		/* NORMAL DROP TO THE THIRD*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantitySmallNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 50 OFFSET 50) AS temp)
		AND idItem = itemNormal;
        
	    COMMIT;
   
    

END ;;
DELIMITER ;