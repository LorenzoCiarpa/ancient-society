DROP PROCEDURE IF EXISTS mintBuilding;
DELIMITER $$

CREATE PROCEDURE mintBuilding(
    address, 
    type_, 
    level, 
    idBuilding_, 
    name, 
    description, 
    capacity, 
    dropQuantity
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

        alreadyExist = SELECT count(*) from buildings where type = type and idBuilding = idBuilding;                   
           
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
    
END$$

DELIMITER ;
