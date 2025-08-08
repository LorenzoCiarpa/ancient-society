DROP PROCEDURE IF EXISTS addColony;
DELIMITER $$

CREATE PROCEDURE addColony(player varchar(45))
BEGIN   
    
   START TRANSACTION;

        SET @colony_index = (SELECT IF (MAX(colonyIndex), MAX(colonyIndex), 0) + 1 AS maxColonyIndex FROM colony WHERE mainCity = player
        );

        INSERT INTO utente
            (address, ancien, wood, stone)
        VALUES
            (CONCAT(CONCAT(player, '_'), @colony_index), 0, 0, 0);

        INSERT INTO profile
            (address, cityName)    
        VALUES
            (CONCAT(CONCAT(player, '_'), @colony_index), CONCAT(player, '#', @colony_index));
        
        INSERT INTO colony
            (mainCity, colonyCity, colonyIndex)
        VALUES
            (player, CONCAT(CONCAT(player, '_'), @colony_index), @colony_index);
        
        SELECT idColony, mainCity, colonyCity, colonyIndex 
        FROM colony
        WHERE mainCity = player 
        AND colonyIndex = @colony_index;

    COMMIT;
   
    

END$$

DELIMITER ;
