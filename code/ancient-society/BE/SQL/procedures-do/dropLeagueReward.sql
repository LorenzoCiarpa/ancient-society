CREATE DEFINER=`developer`@`%` PROCEDURE `test_db`.`dropLeagueRewards`()
BEGIN
	DECLARE done INT DEFAULT 0;
   	DECLARE leagueR,idItemR,idRecipeR,idGearLevelR,idCardLevelR,pvpPointsR,quantityR int;
   	DECLARE idG,idC int DEFAULT 0;
	 DECLARE cursor_rewards CURSOR FOR SELECT 
        idLeague,idItem,idRecipe,idGearLevel,idCardLevel,pvpPoints,quantity  
    FROM 
        reward;
	
	DECLARE CONTINUE HANDLER FOR NOT FOUND
    BEGIN
		set done = 1;
	END;
	START TRANSACTION;
	OPEN cursor_rewards;
	FETCH NEXT FROM cursor_rewards INTO leagueR,idItemR,idRecipeR,idGearLevelR,idCardLevelR,pvpPointsR,quantityR;
	WHILE done = 0 DO
		IF(idItemR is not NULL) THEN
				INSERT INTO item_instance(address,idItem, quantity) 
			SELECT address,idItemR as idItem,quantityR as quantity
			FROM `user` WHERE idLeague=leagueR  ON DUPLICATE KEY UPDATE quantity = quantity + quantityR ;
				
		END IF;
		IF(idRecipeR is not NULL) THEN
			INSERT INTO recipe_instance(address,idRecipe,quantity)  SELECT address,idRecipeR as idRecipe ,quantityR as quantity FROM `user` WHERE idLeague=leagueR  ON DUPLICATE KEY UPDATE quantity = quantity + quantityR ;
				
		END IF;
		IF(idGearLevelR is not NULL) THEN
			SET idG = (SELECT idGear FROM gear_level WHERE idGearLevel = idGearLevelR);
			INSERT INTO gear_instance(address,idGear,idGearLevel)  SELECT address,idG as idGear,idGearLevelR as idGearLevel FROM `user` WHERE idLeague=leagueR ;
		END IF;
		IF(idCardLevelR is not NULL) THEN
			SET idC = (SELECT idCard FROM card_level WHERE idCardLevel = idCardLevelR);
			INSERT INTO card_instance(address,idCard,idCardLevel)  SELECT address,idC as idCard,idCardLevelR as idCardLevel FROM `user` WHERE idLeague=leagueR ;
		END IF;
		IF(pvpPointsR is not NULL AND quantityR is not NULL) THEN
			UPDATE `user` SET pvpPoints=pvpPoints + quantityR WHERE idLeague=leagueR;
		END IF;
	
	FETCH NEXT FROM cursor_rewards INTO leagueR,idItemR,idRecipeR,idGearLevelR,idCardLevelR,pvpPointsR,quantityR;

END WHILE;
		
COMMIT;
END