CREATE DEFINER=`tester_user`@`%` PROCEDURE `matchmakingRoutine`(time1 int ,time2 int,time3 int, range1 int,range2 int, range3 int)
BEGIN
    DECLARE address_player, opponent VARCHAR(100);
    DECLARE joinTime_player DATETIME(6);
    DECLARE player_trophies, player_range, time_in_queue, newRange, updated int;
    DECLARE trophies_second, range_second int;
    DECLARE player_second VARCHAR(50);
    DECLARE done INT DEFAULT 0;
    DECLARE done_second INT DEFAULT 0;
	DECLARE affix1,affix2,affix3,affix4,affix5,affix6,affix7,affix8,affix9 int;
	DECLARE pool1,pool2,pool3,pool4,pool5,pool6,pool7,pool8,pool9 int;
	DECLARE	diff2,diff3,diff5,diff6,diff8,diff9 int default 0;
	DECLARE turn1Affixes,turn2Affixes,turn3Affixes VARCHAR(100);
	DECLARE lastWarId INT;
    DECLARE cursor_match CURSOR FOR SELECT
        address,
        joinTime,
        trophies,
        `range`,
        TIME_TO_SEC(TIMEDIFF(CURRENT_TIMESTAMP(), joinTime))
    FROM
        queueMatchmaking;
	
    DECLARE cursor_queue CURSOR FOR SELECT * FROM queueMatchmaking;
	DECLARE cursor_queue_second CURSOR FOR SELECT address, trophies,`range` FROM queueMatchmaking;
	DECLARE CONTINUE HANDLER FOR NOT FOUND
    BEGIN
		set done = 1;
		set done_second = 1;
	END;
   		/*start of affix randomization*/
   		set affix1 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
   		set pool1 = (SELECT pool  FROM affix WHERE idAffix = affix1);
   		set affix4 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
   		set pool4 = (SELECT pool  FROM affix WHERE idAffix = affix4);
   		set affix7 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
   		set pool7 = (SELECT pool  FROM affix WHERE idAffix = affix7);
   	
		WHILE diff2 = 0 DO
			SET affix2 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
			set pool2 = (SELECT pool  FROM affix WHERE idAffix = affix2);
			IF affix2 != affix1 AND pool2 != pool1 then
				SET diff2 = 1;
			END IF;
		END WHILE;
	
		WHILE diff3 = 0 DO
			SET affix3 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
			set pool3 = (SELECT pool  FROM affix WHERE idAffix = affix3);
			IF affix3 != affix2 AND affix3!=affix1 AND pool3 != pool2 AND pool3 != pool1 then
				SET diff3 = 1;
			END IF;
		END WHILE;
		
		WHILE diff5 = 0 DO
			SET affix5 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
			set pool5 = (SELECT pool  FROM affix WHERE idAffix = affix5);
			IF affix5 != affix4 AND pool5 != pool4 then
				SET diff5 = 1;
			END IF;
		END WHILE;
		WHILE diff6 = 0 DO
			SET affix6 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
			set pool6 = (SELECT pool  FROM affix WHERE idAffix = affix6);
			IF affix6 != affix4 AND affix6!=affix5 AND pool6 != pool4 AND pool6 != pool5  then
				SET diff6 = 1;
			END IF;
		END WHILE;
		WHILE diff8 = 0 DO
			SET affix8 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
			set pool8 = (SELECT pool  FROM affix WHERE idAffix = affix8);
			IF affix8 != affix7 AND pool8 != pool7 then
				SET diff8 = 1;
			END IF;
		END WHILE;
		WHILE diff9 = 0 DO
			SET affix9 = (SELECT idAffix  FROM affix ORDER BY RAND() LIMIT 1);
			set pool9 = (SELECT pool  FROM affix WHERE idAffix = affix9);
			IF affix9 != affix8 AND affix9 != affix7 AND pool9 != pool8 AND pool9 != pool7 then
				SET diff9 = 1;
			END IF;
		END WHILE;
		SET turn1Affixes = CONCAT_WS(",",affix1,affix2,affix3);
		SET turn2Affixes = CONCAT_WS(",",affix4,affix5,affix6);
		SET turn3Affixes = CONCAT_WS(",",affix7,affix8,affix9);
		
		/*END of affix randomization*/
	
	
	CREATE TEMPORARY TABLE matched_players (player varchar(50) PRIMARY KEY);
    START TRANSACTION;
       	SET done_second = 0;
   		        OPEN cursor_match;
		        FETCH NEXT FROM cursor_match INTO
		        address_player,
		        joinTime_player,
		        player_trophies,
		        player_range,
		        time_in_queue;
	
        WHILE done_second = 0 DO
            SET updated = 0;
            IF time_in_queue>time3 THEN
                UPDATE queueMatchmaking SET `range`=range3 WHERE address=address_player;
                SET updated=1;
            END IF;
            IF (updated=0 AND time_in_queue>time2) THEN
                UPDATE queueMatchmaking SET `range`=range2 WHERE address=address_player;
                SET updated=1;
            END IF;
            IF (updated=0 AND time_in_queue>time1) THEN
                UPDATE queueMatchmaking SET `range`=range1 WHERE address=address_player;
                SET updated=1;
            END IF;
            FETCH NEXT FROM cursor_match INTO
            address_player,
            joinTime_player,
            player_trophies,
            player_range,
            time_in_queue;
        END WHILE;
    	   SET done = 0;
       OPEN cursor_queue_second;
       FETCH NEXT FROM cursor_queue_second into
	    player_second,
	    trophies_second,
	    range_second;
       WHILE done = 0 DO
            SET opponent = NULL;
            IF player_second NOT IN(SELECT player FROM matched_players WHERE player=player_second) THEN
                SET opponent = (SELECT address FROM queueMatchmaking qm WHERE address!= player_second AND trophies < trophies_second + range_second AND trophies > trophies_second - range_second ORDER BY RAND() LIMIT 1);
                IF(opponent is not NULL) THEN
                    INSERT into war (address1, address2) VALUES (player_second, opponent);
                  	SET lastWarId = LAST_INSERT_ID();
                   	INSERT into affixHistory (turn1,turn2,turn3,idWar) VALUES (turn1Affixes,turn2Affixes,turn3Affixes,lastWarId);
                    INSERT into matched_players (player) VALUES (player_second), (opponent);
                   	UPDATE `user` SET matchCount = matchCount + 1 WHERE address IN (player_second,opponent);
                    DELETE FROM queueMatchmaking WHERE address=player_second;
                    DELETE FROM queueMatchmaking WHERE address=opponent;
                    SET lastWarId = null;
                END IF;
            END IF;
        FETCH NEXT FROM cursor_queue_second into
	    player_second,
	    trophies_second,
	    range_second;
        END WHILE;
    COMMIT;
   DROP TEMPORARY TABLE matched_players;
END