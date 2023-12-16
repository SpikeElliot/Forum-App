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
        // query database to get topics
        let sqlquery = `SELECT name
                        FROM topic 
                        ORDER BY name ASC`;
        // execute sql query
        db.query(sqlquery, (err,result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, forumData, {topics:result});
            console.log(newData);
            res.render("topiclist.ejs", newData);
         });
    });
    app.get('/topic/:name', function(req,res) {
        // query database to get posts
        let sqlquery = `SELECT t.name, p.post_id, p.title, p.content, p.date, u.username
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
            console.log(newData);
            res.render("topic.ejs", newData);
         });
    });
    app.get('/post/:id', function(req,res) {
        forumData.userData = false;
        if (req.session.user) {
            forumData.userData = req.session.user;
        }
        // query database to get posts
        let sqlquery = `SELECT t.name, p.post_id, p.title, p.content, p.date, u.username, r.text
                        FROM post p 
                        LEFT JOIN topic t 
                        ON t.topic_id = p.topic_id 
                        LEFT JOIN user u 
                        ON p.user_id = u.user_id 
                        LEFT JOIN reply r 
                        ON p.post_id = r.post_id 
                        WHERE p.post_id = ?`;
        // execute sql query
        db.query(sqlquery, [req.params.id], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            let newData = Object.assign({}, forumData, {post:result});
            console.log(newData);
            res.render("post.ejs", newData);
         });
    });
    app.get('/allposts', function(req,res) {
        // query database to get all posts
        let sqlquery = `SELECT t.name, p.post_id, p.title, p.content, p.date, u.username
                        FROM topic t 
                        LEFT JOIN post p 
                        ON t.topic_id = p.topic_id 
                        LEFT JOIN user u 
                        ON p.user_id = u.user_id 
                        WHERE p.topic_id IS NOT NULL 
                        ORDER BY p.date DESC`;
        // execute sql query
        db.query(sqlquery, [req.params.name], (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            let newData = Object.assign({}, forumData, {posts:result});
            console.log(newData);
            res.render("allposts.ejs", newData);
         });
    });
    app.get('/userlist', function(req,res) {
        // query database to get usernames
        let sqlquery = `SELECT username, date_joined 
                        FROM user 
                        ORDER BY username ASC`;
        // execute sql query
        db.query(sqlquery, (err,result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, forumData, {users:result});
            console.log(newData);
            res.render("userlist.ejs", newData);
         });
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
            let sqlquery = `SELECT name 
                            FROM topic 
                            ORDER BY name ASC`;
            // execute sql query
            db.query(sqlquery, (err,result) => {
                if (err) {
                    res.redirect('./'); 
                }
                let newData = Object.assign({}, forumData, {topics:result});
                console.log(newData);
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
            } else {
                // create newData object by combining forumData and data found in database
                let newData = Object.assign({}, forumData, {posts:result});
                if (!newData.posts.length) { // check if array empty
                    res.send("No results found");
                } else {
                    // display search results page if array not empty
                    console.log(newData);
                    res.render("search-results.ejs", newData);
                }
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
            else {
                console.log(result);
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
                    else {
                        res.redirect(`/topic/${req.body.topic}`);
                    }
                });
            }
        });
    });
    app.post('/replied', function(req,res) {
        // saving data in database
        sqlquery = `INSERT INTO reply (user_id, post_id, text) 
                    VALUES (?,?,?)`;
        // execute sql query
        let newrecord = [req.session.user.id, req.body.repliedpostid, req.body.text];
        db.query(sqlquery, newrecord, (err,result) => {
            if (err) {
                res.redirect('./');
                return console.error(err.message);
            }
            else {
                res.redirect(`/post/${req.body.repliedpostid}`);
            }
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
          else {
            res.send('Hello ' + req.body.username + ', '
                   + ' thank you for registering! An email will be sent to you at '
                   + req.body.email);
          }
        });
    });
    app.post('/loggedin', function(req,res) {
        // checking database for matching user data
        let sqlquery = `SELECT user.username, user.user_id
                        FROM user
                        WHERE user.username = ?
                        AND user.password = ?`;
        // execute sql query
        let newrecord = [req.body.username, req.body.password];
        db.query(sqlquery, newrecord, (err,result) => {
          if (err) {
            return console.error(err.message);
          } else {
            req.session.user = {id: result[0].user_id, name: result[0].username};
            req.session.save();
          }
          res.redirect('./');
        });
    });
}
