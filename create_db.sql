--
-- Create the database
--

CREATE DATABASE IF NOT EXISTS `myforum`
USE `myforum`;

--
-- Create the user and give it access to the database
--

CREATE USER 'forumuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myforum.* TO 'forumuser'@'localhost';

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `topic_id` int NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `content` varchar(1000) DEFAULT 'empty',
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `FK_post_user_idx` (`user_id`),
  KEY `FK_post_topic_idx` (`topic_id`),
  CONSTRAINT `FK_post_topic` FOREIGN KEY (`topic_id`) REFERENCES `topic` (`topic_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_post_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
);

--
-- Table structure for table `reply`
--

DROP TABLE IF EXISTS `reply`;
CREATE TABLE `reply` (
  `reply_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `text` varchar(500) NOT NULL,
  `date_replied` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reply_id`),
  KEY `FK_reply_user_idx` (`user_id`),
  KEY `FK_reply_post_idx` (`post_id`),
  CONSTRAINT `FK_reply_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_reply_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
);

--
-- Table structure for table `topic`
--

DROP TABLE IF EXISTS `topic`;
CREATE TABLE `topic` (
  `topic_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
);

--
-- Table structure for table `topic_members`
--

DROP TABLE IF EXISTS `topic_members`;
CREATE TABLE `topic_members` (
  `topic_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`topic_id`,`user_id`),
  KEY `FK_user_id_idx` (`user_id`),
  CONSTRAINT `FK_topic_id` FOREIGN KEY (`topic_id`) REFERENCES `topic` (`topic_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
);

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `date_joined` datetime DEFAULT CURRENT_TIMESTAMP,
  `isModerator` tinyint DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
);

--
-- View for topic list query
--

CREATE VIEW `topiclist` AS
SELECT      topic.name
FROM        topic
ORDER BY    topic.name ASC;

--
-- View for all posts query
--

CREATE VIEW `allPosts` AS
SELECT 		  t.name, p.post_id, p.title, p.content, p.date, u.username
FROM 		    topic t 
LEFT JOIN 	post p 
ON 			    t.topic_id = p.topic_id 
LEFT JOIN 	user u 
ON 			    p.user_id = u.user_id 
WHERE 		  p.topic_id IS NOT NULL 
ORDER BY	  p.date DESC;

--
-- View for user list query
--

CREATE VIEW `userList` AS
SELECT 		  username, date_joined, user_id
FROM 		    user 
ORDER BY 	  date_joined DESC;