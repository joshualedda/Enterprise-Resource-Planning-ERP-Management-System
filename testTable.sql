DROP TABLE IF EXISTS `employee`;
CREATE TABLE IF NOT EXISTS `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `civil_status_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `employee_status_id` int DEFAULT NULL,
  `position_id` int DEFAULT NULL,
`barangay_id` int DEFAULT NULL,
  `municipality_id` int DEFAULT NULL,
  `province_id` int DEFAULT NULL,
  `region_id` int DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `address` varchar(250) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `date_started` date DEFAULT NULL,
  `date_terminated` date DEFAULT NULL,
  `email` varchar(250) DEFAULT NULL,
  `employee_code` varchar(10) DEFAULT NULL,
  `employee_image` varchar(150) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `gender` char(1) DEFAULT NULL COMMENT 'M=Male  F=Female  O=Other',
  `last_name` varchar(50) DEFAULT NULL,
  `pag_ibig` varchar(50) DEFAULT NULL,
  `phil_health` varchar(50) DEFAULT NULL,
  `phone` varchar(150) DEFAULT NULL,
  `remark` text,
  `sss` varchar(50) DEFAULT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `updated_by` int NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;




DROP TABLE IF EXISTS `employee_status`;
CREATE TABLE IF NOT EXISTS `employee_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_status_code` varchar(10) NOT NULL,
  `employee_status_name` varchar(100) NOT NULL,
 `status` ENUM('active', 'inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;



DROP TABLE IF EXISTS `civil_status`;
CREATE TABLE IF NOT EXISTS `civil_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `civil_status_code` varchar(10) NOT NULL,
  `civil_status_name` varchar(100) NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;



DROP TABLE IF EXISTS `department`;
CREATE TABLE IF NOT EXISTS `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(10) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `position`;
CREATE TABLE IF NOT EXISTS `position` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_code` varchar(10) NOT NULL,
  `position_name` varchar(100) NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;