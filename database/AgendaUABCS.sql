USE railway;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 												TABLES
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS suggestions;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS events;

CREATE TABLE Account(
    idAccount CHAR(6) NOT NULL PRIMARY KEY UNIQUE,
    nameUser VARCHAR(100) NOT NULL,
    identifierUser VARCHAR(30) NOT NULL UNIQUE,
    emailUser VARCHAR(50) NOT NULL UNIQUE,
    passwordUser VARCHAR(100) NOT NULL
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imageUrl TEXT, 
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL
);

CREATE TABLE favorites (
  accountId CHAR(6),
  eventId INT,
  PRIMARY KEY (accountId, eventId),
  FOREIGN KEY (accountId) REFERENCES Account(idAccount) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE departments (
  idDepartment INT AUTO_INCREMENT PRIMARY KEY,
  nameDepartment VARCHAR(100) NOT NULL
);

CREATE TABLE suggestions (
  idSuggestion INT AUTO_INCREMENT PRIMARY KEY,
  titleEventSuggestion VARCHAR(150) NOT NULL,
  idDepartment INT NOT NULL,
  dateEventSuggestion DATE NOT NULL,
  timeEventSuggestion TIME NOT NULL,
  locationEventSuggestion VARCHAR(255) NOT NULL,
  accountId CHAR(6) NOT NULL,
  FOREIGN KEY (accountId) REFERENCES Account(idAccount) ON DELETE CASCADE,
  FOREIGN KEY (idDepartment) REFERENCES departments(idDepartment) ON DELETE CASCADE
);

CREATE TABLE comments (
  idComment INT AUTO_INCREMENT PRIMARY KEY,
  titleComment VARCHAR(255) NOT NULL,
  descriptionComment TEXT NOT NULL,
  dateComment TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accountId CHAR(6) NOT NULL,
  FOREIGN KEY (accountId) REFERENCES Account(idAccount) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accountId CHAR(6) NOT NULL,
  eventId INT NULL,
  message TEXT NOT NULL,
  dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isRead BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (accountId) REFERENCES Account(idAccount) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accountId CHAR(6) NOT NULL,
  eventId INT NOT NULL,
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
    DECLARE v_identifier VARCHAR(30);
    DECLARE v_base_identifier VARCHAR(30);
    DECLARE v_counter INT DEFAULT 0;

    IF p_emailUser NOT REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    BEGIN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Sorry, not valid email format, try again please!';
    END;
    END IF;

    IF CHAR_LENGTH(p_passwordUser) < 60 THEN
    BEGIN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Password encrypted is not valid. Must be at least 60 characters.';
    END;
    END IF;

    IF EXISTS (SELECT 1 FROM Account WHERE emailUser = p_emailUser) THEN
    BEGIN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already registered.';
    END;
    END IF;

	SET v_base_identifier = SUBSTRING_INDEX(p_emailUser, '@', 1);
	SET v_identifier = v_base_identifier;

	WHILE EXISTS (SELECT 1 FROM Account WHERE identifierUser = v_identifier) DO
		SET v_counter = v_counter + 1;
		SET v_identifier = CONCAT(v_base_identifier, '_', v_counter);
	END WHILE;

    INSERT INTO Account(nameUser, identifierUser, emailUser, passwordUser) 
    VALUES (p_nameUser, v_identifier, p_emailUser, p_passwordUser);
    
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 												CREATE EVENT
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_CREATE_EVENT;
DELIMITER //
CREATE PROCEDURE SP_CREATE_EVENT(
    IN p_imageUrl TEXT,
    IN p_title VARCHAR(255),
    IN p_department VARCHAR(100),
    IN p_date TIMESTAMP,
    IN p_location VARCHAR(255)
)
BEGIN

	IF p_title IS NULL OR LENGTH(TRIM(p_title)) = 0 THEN
    SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'The title cant be empty';
	END IF;


    INSERT INTO events(imageUrl, title, department, date, location) 
    VALUES (p_imageUrl, p_title, p_department, p_date, p_location);
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											CREATE DEPARTMENT
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_CREATE_DEPARTMENT;
DELIMITER //
CREATE PROCEDURE SP_CREATE_DEPARTMENT(
    IN p_nameDepartment VARCHAR(100)
)
BEGIN

	IF p_nameDepartment IS NULL OR LENGTH(TRIM(p_nameDepartment)) = 0 THEN
    SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'The name of the department cant be empty';
	END IF;


    INSERT INTO departments(nameDepartment) 
    VALUES (p_nameDepartment);
    
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											CREATE SUGGESTION
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_CREATE_SUGGESTION;
DELIMITER //
CREATE PROCEDURE SP_CREATE_SUGGESTION(
    IN p_titleEventSuggestion VARCHAR(150),
    IN p_idDepartment INT,
    IN p_dateEventSuggestion DATE,
    IN p_timeEventSuggestion TIME,
    IN p_locationEventSuggestion VARCHAR(255),
    IN p_accountId CHAR(6)
)
BEGIN

    IF p_titleEventSuggestion IS NULL OR LENGTH(TRIM(p_titleEventSuggestion)) = 0 THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'The title of the suggestion cant be empty';
    END IF;

    IF p_locationEventSuggestion IS NULL OR LENGTH(TRIM(p_locationEventSuggestion)) = 0 THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'The location of the suggestion cant be empty';
    END IF;

    INSERT INTO suggestions(titleEventSuggestion, idDepartment, dateEventSuggestion, timeEventSuggestion, locationEventSuggestion, accountId) 
    VALUES (p_titleEventSuggestion, p_idDepartment, p_dateEventSuggestion, p_timeEventSuggestion, p_locationEventSuggestion, p_accountId);

END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											CREATE NOTIFICATION
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_CREATE_NOTIFICATION;
DELIMITER //
CREATE PROCEDURE SP_CREATE_NOTIFICATION(
    IN p_accountId CHAR(6),
    IN p_eventId INT,
    IN p_message TEXT
)
BEGIN
    DECLARE v_account_exists INT;
    DECLARE v_event_exists INT;

    SELECT COUNT(*) INTO v_account_exists
    FROM Account
    WHERE idAccount = p_accountId;

    IF v_account_exists = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'The specified account does not exist';
    END IF;

    IF p_eventId IS NOT NULL THEN
        SELECT COUNT(*) INTO v_event_exists
        FROM events
        WHERE id = p_eventId;

        IF v_event_exists = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'The specified event does not exist';
        END IF;
    END IF;

    INSERT INTO notifications (accountId, eventId, message)
    VALUES (p_accountId, p_eventId, p_message);
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											CREATE COMMENT
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_CREATE_COMMENT;
DELIMITER //
CREATE PROCEDURE SP_CREATE_COMMENT(
    IN p_titleComment VARCHAR(255),
    IN p_descriptionComment TEXT,
    IN p_accountId CHAR(6)
)
BEGIN
    DECLARE v_account_exists INT;

    SELECT COUNT(*) INTO v_account_exists
    FROM Account
    WHERE idAccount = p_accountId;

    IF v_account_exists = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'The specified account does not exist';
    END IF;

    INSERT INTO comments (titleComment, descriptionComment, accountId)
    VALUES (p_titleComment, p_descriptionComment, p_accountId);
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											MARK ATTENDANCE
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_MARK_ATTENDANCE;
DELIMITER //
CREATE PROCEDURE SP_MARK_ATTENDANCE(
    IN p_accountId CHAR(6),
    IN p_eventId INT
)
BEGIN
    DECLARE v_account_exists INT;
    DECLARE v_event_exists INT;
    DECLARE v_already_marked INT;

    -- Verificar si la cuenta existe
    SELECT COUNT(*) INTO v_account_exists
    FROM Account
    WHERE idAccount = p_accountId;

    IF v_account_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The specified account does not exist';
    END IF;

    -- Verificar si el evento existe
    SELECT COUNT(*) INTO v_event_exists
    FROM events
    WHERE id = p_eventId;

    IF v_event_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The specified event does not exist';
    END IF;

    -- Verificar si ya existe un registro de asistencia
    SELECT COUNT(*) INTO v_already_marked
    FROM attendance
    WHERE accountId = p_accountId AND eventId = p_eventId;

    IF v_already_marked > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The attendance for this account and event has already been marked.';
    END IF;

    -- Registrar la asistencia
    INSERT INTO attendance (accountId, eventId)
    VALUES (p_accountId, p_eventId);
END //

DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 											UNMARK ATTENDANCE
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_UNMARK_ATTENDANCE;
DELIMITER //
CREATE PROCEDURE SP_UNMARK_ATTENDANCE(
    IN p_accountId CHAR(6),
    IN p_eventId INT
)
BEGIN
    DECLARE v_exists INT;

    SELECT COUNT(*) INTO v_exists
    FROM attendance
    WHERE accountId = p_accountId AND eventId = p_eventId;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No attendance record found for the specified account and event.';
    END IF;

    DELETE FROM attendance
    WHERE accountId = p_accountId AND eventId = p_eventId;
END //
DELIMITER ;

-- ////////////////////////////////////////////////////////////////////////////////////////////////////
-- 													LOGIN
-- ////////////////////////////////////////////////////////////////////////////////////////////////////

DROP PROCEDURE IF EXISTS SP_LOGIN;
DELIMITER $$
CREATE PROCEDURE SP_LOGIN(
    IN l_identifierUser VARCHAR(50)
)
BEGIN
    SELECT  nameUser, passwordUser
    FROM Account
    WHERE identifierUser = l_identifierUser;
END$$
DELIMITER ;

SELECT * FROM Account;
