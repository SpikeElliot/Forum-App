module.exports = function(app, forumData) {

    // Route handlers
    app.get('/', function(req,res) {
        forumData.userData = false;
        if (req.session.user) {
            forumData.userData = req.session.user;
        }
        res.render('index.ejs', forumData);
    });
    app.get('/topiclist', function(req,res) {
        forumData.userData = false;
        if (req.session.user) {
            forumData.userData = req.session.user;
        }
        // query database to get topics
        let sqlquery = `SELECT * FROM topicList`;
        // execute sql query
        db.query(sqlquery, (err,result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, forumData, {topics:result});
            res.render("topiclist.ejs", newData);
         });
    });
    app.get('/topic/:name', function(req,res) {
        forumData.userData = false;
        if (req.session.user) {
            forumData.userData = req.session.user;
        }
        let sqlquery = `SELECT topic_id
                        FROM topic
                        WHERE name = ?`;
        db.query(sqlquery, [req.params.name], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            } else if (result.length == 0) {
                res.redirect('./');
                return;
            }
            forumData.topicID = result[0].topic_id;
            // query database to get posts
            sqlquery = `SELECT p.post_id, p.title, p.content, p.date, u.username
                        FROM topic t 
                        LEFT JOIN post p 
                        ON t.topic_id = p.topic_id 
                        LEFT JOIN user u 
                        ON p.user_id = u.user_id 
                        WHERE t.name = ? 
                        AND p.topic_id IS NOT NULL 
                        ORDER BY p.date DESC`;
            // execute sql query
            db.query(sqlquery, [req.params.name], (err,result) => {
                if (err) {
                    res.redirect('./');
                    return console.error(err.message);
                }
                forumData.topicName = req.params.name;
                let newData = Object.assign({}, forumData, {posts:result});
                res.render("topic.ejs", newData);
            });
        });
    });
    app.get('/post/:id', function(req,res) {
        forumData.userData = false;
        if (req.session.user) {
            forumData.userData = req.session.user;
        }
        // query database to get post info
        let sqlquery = `SELECT t.name, p.post_id, p.user_id, p.title, p.content, p.date, u.username
                        FROM post p 
                        LEFT JOIN topic t 
                        ON t.topic_id = p.topic_id 
                        LEFT JOIN user u 
                        ON p.user_id = u.user_id 
                        WHERE p.post_id = ?`;
        // execute sql query
        db.query(sqlquery, [req.params.id], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            } else if (result.length == 0) {
                res.redirect('./');
                return;
            }
            let newData = Object.assign({}, forumData, {post:result});
            //query database to get reply info for post
            sqlquery = `SELECT u.username, r.text, r.date_replied, r.user_id, r.reply_id
                        FROM user u
                        LEFT JOIN reply r
                        ON u.user_id = r.user_id
                        WHERE r.post_id = ?`;
            db.query(sqlquery, [req.params.id], (err,result) => {
                if (err) {
                    res.redirect('./');
                    return console.error(err.message);
                }
                newData = Object.assign({}, newData, {replies:result});
                res.render("post.ejs", newData);
            })
         });
    });
    app.get('/allposts', function(req,res) {
        // query database to get all posts
        let sqlquery = `SELECT * FROM allPosts`;
        // execute sql query
        db.query(sqlquery, [req.params.name], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            let newData = Object.assign({}, forumData, {posts:result});
            res.render("allposts.ejs", newData);
         });
    });
    app.get('/userlist', function(req,res) {
        forumData.userData = false;
        if (req.session.user) {
            forumData.userData = req.session.user;
        }
        // query database to get usernames
        let sqlquery = `SELECT * FROM userList`;
        // execute sql query
        db.query(sqlquery, (err,result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, forumData, {users:result});
            res.render("userlist.ejs", newData);
         });
    });
    app.get('/about', function(req,res) {
        res.render('about.ejs', forumData);
    });
    app.get('/register', function(req,res) {
        res.render('register.ejs', forumData);
    });
    app.get('/login', function(req,res) {
        res.render('login.ejs', forumData);
    });
    app.get('/logout', function(req,res) {
        req.session.destroy();
        res.redirect('./')
    });
    app.get('/makepost', function(req,res) {
        if (req.session.user) {
            // query database to get topics
            let sqlquery = `SELECT t.name 
                            FROM topic t
                            LEFT JOIN topic_members m
                            ON t.topic_id = m.topic_id
                            WHERE m.user_id = ?
                            ORDER BY name ASC`;
            // execute sql query
            db.query(sqlquery, [req.session.user.id], (err,result) => {
                if (err) {
                    res.redirect('./'); 
                    return (console.error(err.message));
                } else if (result.length == 0) {
                    res.send('Please join a topic to be able to make a post');
                    return;
                }
                let newData = Object.assign({}, forumData, {topics:result});
                res.render("makepost.ejs", newData);
            });
        } else {
            res.redirect('/login');
        }
    });
    app.get('/search', function(req,res) {
        res.render("search.ejs", forumData);
    });
    app.get('/search-result', function (req,res) {
        // sql query to execute
        let sqlquery = `SELECT t.name, p.post_id, p.title, p.content, p.date, u.username
                        FROM post p 
                        LEFT JOIN user u 
                        ON p.user_id = u.user_id 
                        LEFT JOIN topic t 
                        ON p.topic_id = t.topic_id 
                        WHERE p.title LIKE ? 
                        ORDER BY p.date DESC`;
        // search database for names containing user input submitted through form
        db.query(sqlquery, ["%" + req.query.keyword + "%"], (err, result) => {
            if (err) {
                // redirect to index page if error
                res.redirect('./');
                return console.error(err.message);
            }
            // create newData object by combining forumData and data found in database
            let newData = Object.assign({}, forumData, {posts:result});
            if (!newData.posts.length) { // check if array empty
                res.send("No results found");
            } else {
                // display search results page if array not empty
                res.render("search-results.ejs", newData);
            }
         });
    });
    app.post('/posted', function(req,res) {
        // get topic id matching topic name
        let sqlquery = `SELECT topic_id
                        FROM topic 
                        WHERE name = ?`;
        db.query(sqlquery, [req.body.topic], (err,result) => {
            if (err) {
              res.redirect('./');
              return console.error(err.message);
            }
            let topicID = result[0].topic_id;
            // saving data in database
            sqlquery = `INSERT INTO post (user_id, topic_id, title, content) 
                        VALUES (?,?,?,?)`;
            // execute sql query
            let newrecord = [req.session.user.id, topicID, req.body.title, req.body.content];
            db.query(sqlquery, newrecord, (err,result) => {
                if (err) {
                    res.redirect('./');
                    return console.error(err.message);
                }
                res.redirect(`/topic/${req.body.topic}`);
            });
        });
    });
    app.post('/topicjoined', function(req,res) {
        // saving data in database
        let sqlquery = `INSERT INTO topic_members (topic_id, user_id) 
                        VALUES (?,?)`;
        // execute sql query
        let newrecord = [req.body.topicid, req.session.user.id];
        db.query(sqlquery, newrecord, (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            req.session.user.topics.push({topic_id: Number(req.body.topicid)});
            req.session.save();
            res.redirect(`/topic/${req.body.topicname}`);
        });
    });
    app.post('/topicleft', function(req,res) {
        // saving data in database
        let sqlquery = `DELETE FROM topic_members
                        WHERE topic_id = ?
                        AND user_id = ?`;
        // execute sql query
        let newrecord = [req.body.topicid, req.session.user.id];
        db.query(sqlquery, newrecord, (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            let index = req.session.user.topics.findIndex(item => item.topic_id == req.body.topicid);
            if (index > -1) {
                req.session.user.topics.splice(index, 1);
            }
            req.session.save();
            res.redirect(`/topic/${req.body.topicname}`);
        });
    });
    app.post('/postdeleted', function(req,res) {
        // deleting selected row from post table
        let sqlquery = `DELETE FROM post
                        WHERE post_id = ?`;
        // execute sql query
        db.query(sqlquery, [req.body.deletedpostid], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            res.redirect(`/topic/${req.body.topicname}`);
        });
    });
    app.post('/topicadded', function(req,res) {
        // saving data in database
        let sqlquery = `INSERT INTO topic (name) 
                        VALUES (?)`;
        // execute sql query
        db.query(sqlquery, req.body.newtopicname, (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            res.redirect('/topiclist');
        });
    });
    app.post('/topicdeleted', function(req,res) {
        // deleting selected row from topic table
        let sqlquery = `DELETE FROM topic
                        WHERE topic_id = ?`;
        // execute sql query
        db.query(sqlquery, [req.body.deletedtopicid], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            res.redirect(`/topiclist`);
        });
    });
    app.post('/replydeleted', function(req,res) {
        // deleting selected row from reply table
        let sqlquery = `DELETE FROM reply
                        WHERE reply_id = ?`;
        // execute sql query
        db.query(sqlquery, [req.body.deletedreplyid], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            res.redirect(`/post/${req.body.repliedpostid}`);
        });
    });
    app.post('/replied', function(req,res) {
        // saving data in database
        let sqlquery = `INSERT INTO reply (user_id, post_id, text) 
                        VALUES (?,?,?)`;
        // execute sql query
        let newrecord = [req.session.user.id, req.body.repliedpostid, req.body.text];
        db.query(sqlquery, newrecord, (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            res.redirect(`/post/${req.body.repliedpostid}`);
        });
    });
    app.post('/userbanned', function(req,res) {
        // deleting selected row from user table
        let sqlquery = `DELETE FROM user
                        WHERE user_id = ?`;
        // execute sql query
        db.query(sqlquery, [req.body.banneduserid], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            res.redirect('/userlist');
        });
    });
    app.post('/registered', function(req,res) {
        // saving data in database
        let sqlquery = `INSERT INTO user (username, email, password)
                        VALUES (?,?,?)`;
        // execute sql query
        let newrecord = [req.body.username, req.body.email, req.body.password];
        db.query(sqlquery, newrecord, (err,result) => {
          if (err) {
            res.redirect('./');
            return console.error(err.message);
          }
        res.redirect('/about');
        });
    });
    app.post('/loggedin', function(req,res) {
        // checking database for matching user data
        let sqlquery = `SELECT user.username, user.user_id, user.isModerator
                        FROM user
                        WHERE user.username = ?
                        AND user.password = ?`;
        // execute sql query
        let newrecord = [req.body.username, req.body.password];
        db.query(sqlquery, newrecord, (err,result) => {
            if (err) {
                res.redirect('/login');
                return console.error(err.message);
            } else if (result.length == 0) {
                res.redirect('/login');
                return;
            }
            req.session.user = {id: result[0].user_id, name: result[0].username, isMod: result[0].isModerator};
            // get topics user has joined from database
            sqlquery = `SELECT t.topic_id
                        FROM topic t
                        LEFT JOIN topic_members m
                        ON t.topic_id = m.topic_id
                        WHERE m.user_id = ?`
            db.query(sqlquery, [req.session.user.id], (err,result) => {
                if (err) {
                    res.redirect('/login');
                    return console.error(err.message);
                }
                req.session.user.topics = result;
                req.session.save();
            });
            res.redirect('./');
        });
    });
}
