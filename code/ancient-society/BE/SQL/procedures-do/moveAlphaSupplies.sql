DROP PROCEDURE IF EXISTS moveAlphaSupplies;
DELIMITER $$

CREATE PROCEDURE moveAlphaSupplies(player_from VARCHAR(45), player_to VARCHAR(45))
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

END$$

DELIMITER ;

