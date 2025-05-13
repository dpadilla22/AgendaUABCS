USE railway;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 												TABLES
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS events;

CREATE TABLE Account(
    idAccount CHAR(6) NOT NULL PRIMARY KEY UNIQUE,
    nameUser VARCHAR(100) NOT NULL,
    emailUser VARCHAR(50) NOT NULL UNIQUE,
    passwordUser VARCHAR(100) NOT NULL
);


CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  date TIMESTAMP,
  location VARCHAR(255)
);

CREATE TABLE favorites (
  accountId CHAR(6),
  eventId INT,
  PRIMARY KEY (accountId, eventId),
  FOREIGN KEY (accountId) REFERENCES Account(idAccount) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											GENERATE ID ACCOUNT
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP TRIGGER IF EXISTS generateId;
DELIMITER //
CREATE TRIGGER generateId BEFORE INSERT ON Account
FOR EACH ROW
BEGIN
	IF NEW.idAccount IS NULL THEN
		BEGIN
			SET NEW.idAccount = CONCAT(
            CHAR(FLOOR(65 + (RAND() * 26))),
            CHAR(FLOOR(65 + (RAND() * 26))),
            LPAD(FLOOR(RAND() * 99999), 4, '0')
        );
        END;
    END IF;
END//
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 												CREATE ACCOUNT
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_CREATE_ACCOUNT;
DELIMITER //
CREATE PROCEDURE SP_CREATE_ACCOUNT(
    IN p_nameUser VARCHAR(100),
    IN p_emailUser VARCHAR(50),
    IN p_passwordUser VARCHAR(100)
)
BEGIN

	IF p_emailUser NOT REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
		BEGIN
			SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sorry, not valid email format, try again please!';
		END;
    END IF;

    INSERT INTO Account(nameUser, emailUser, passwordUser) 
    VALUES (p_nameUser, p_emailUser, p_passwordUser);
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 													LOGIN
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_LOGIN;
DELIMITER $$
CREATE PROCEDURE SP_LOGIN(
    IN l_emailUser VARCHAR(50)
)
BEGIN
    SELECT  nameUser, passwordUser
    FROM Account
    WHERE emailUser = l_emailUser;
END$$
DELIMITER ;

CALL SP_CREATE_ACCOUNT('Juan', 'juan@gmail.com', '1234568788');
