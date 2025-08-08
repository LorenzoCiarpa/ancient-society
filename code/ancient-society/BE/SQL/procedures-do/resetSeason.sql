CREATE PROCEDURE test_db.seasonReset(numberSeason int,trophiesToSub int)
BEGIN
    DECLARE address_player VARCHAR(100);
    DECLARE player_trophies, player_league,new_trophies,hide_rank int;
    DECLARE done INT DEFAULT 0;
	
    DECLARE cursor_players CURSOR FOR SELECT address,warPoints,idLeague,hideRank  FROM `user`;
    
	DECLARE CONTINUE HANDLER FOR NOT FOUND
    BEGIN
		set done = 1;
	END;

    START TRANSACTION;
   
        OPEN cursor_players;
        FETCH NEXT FROM cursor_players INTO 
        address_player, 
        player_trophies,
        player_league,
       	hide_rank;
        
        
        WHILE done = 0 DO	
            IF (player_trophies>0 AND player_league is not null AND hide_rank!=1) THEN
                INSERT into rankedHistory (idLeague, season,address,trophies) VALUES (player_league, numberSeason, address_player, player_trophies);
               	SET new_trophies = IF ((player_trophies-trophiesToSub>0) ,(player_trophies-trophiesToSub), player_trophies);
               	UPDATE `user` SET warPoints = new_trophies, idLeague = null, hideRank = 1 WHERE address = address_player;
            END IF;
            
        FETCH NEXT FROM cursor_players INTO 
        address_player, 
        player_trophies,
        player_league,
       	hide_rank;
        
        END WHILE;      
       
        
    COMMIT;

    
   
END