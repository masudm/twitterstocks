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





