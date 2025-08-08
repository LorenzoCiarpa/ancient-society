DROP PROCEDURE IF EXISTS dropItem;
DELIMITER $$

CREATE PROCEDURE dropItem(player_ VARCHAR(45), idItem_ INT, itemQuantity_ INT)
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

END$$

DELIMITER ;

