CREATE TABLE `company`
(
 `companyId` int NOT NULL AUTO_INCREMENT ,
 `name`      varchar(200) NOT NULL ,
 `ticker`    varchar(10) NOT NULL ,

PRIMARY KEY (`companyId`)
);

CREATE TABLE `search`
(
 `companyId` int NOT NULL ,
 `type`      varchar(10) NOT NULL ,
 `term`      varchar(50) NOT NULL ,

PRIMARY KEY (`companyId`, `type`, `term`),
KEY `fkIdx_10` (`companyId`),
CONSTRAINT `FK_10` FOREIGN KEY `fkIdx_10` (`companyId`) REFERENCES `company` (`companyId`)
);

CREATE TABLE `stocks`.`tick` (
  `companyId` INT NOT NULL,
  `price` DECIMAL NULL,
  `sentimentPrice` DECIMAL NULL,
  `sentiment` DECIMAL NULL,
  `data` JSON NULL,
  PRIMARY KEY (`companyId`),
  CONSTRAINT `companyId`
    FOREIGN KEY (`companyId`)
    REFERENCES `stocks`.`company` (`companyId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


INSERT INTO `stocks`.`company` (`companyId`, `name`, `ticker`) VALUES ('1', 'Apple', 'AAPL');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'user', 'tim_cook');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'user', 'apple');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'track', 'apple');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'track', 'aapl');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'track', 'iphone');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'track', 'ipad');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'track', 'ios');
INSERT INTO `stocks`.`search` (`companyId`, `type`, `term`) VALUES ('1', 'track', 'mac');






