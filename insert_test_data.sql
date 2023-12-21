-- Insert dummy data into the tables

USE myforum;

INSERT INTO topic (name) 
VALUES ('cooking'), ('politics'), ('technology'), ('movies'), ('books'), ('exercise'), ('sports'), ('celebrities'), ('videogames');

INSERT INTO user (username, password, email, isModerator) 
VALUES ('mod', 'password', 'mod@forum.com', 1);