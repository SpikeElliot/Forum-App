module.exports = function(app, forumData) {

    // Route handlers
    app.get('/', function(req,res) {
        res.render('index.ejs', forumData);
    });
    app.get('/topiclist', function(req,res) {
        // query database to get topics
        let sqlquery = "SELECT `name` FROM `topic` ORDER BY `name` ASC";
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
        let sqlquery = "SELECT * FROM topic t LEFT JOIN post p ON t.topic_id = p.topic_id LEFT JOIN user u ON p.user_id = u.user_id WHERE t.name = ? ORDER BY p.date DESC";
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
    app.get('/userlist', function(req,res) {
        // query database to get usernames
        let sqlquery = "SELECT `username`, `date_joined` FROM `user` ORDER BY `username` ASC";
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
    app.get('/makepost', function(req,res) {
        // query database to get topics
        let sqlquery = "SELECT * FROM `topic` ORDER BY `name` ASC";
        // execute sql query
        db.query(sqlquery, (err,result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, forumData, {topics:result});
            console.log(newData);
            res.render("makepost.ejs", newData);
         });
    });
    app.post('/posted', function(req,res) {
        // get topic id matching topic name
        let sqlquery = "SELECT `topic_id` FROM `topic` WHERE `name` = ?";
        db.query(sqlquery, [req.body.topic], (err,result) => {
            if (err) {
              res.redirect('./');
              return console.error(err.message);
            }
            else {
                console.log(result);
                let topicID = result[0].topic_id;
                // saving data in database
                sqlquery = "INSERT INTO `post` (`user_id`, `topic_id`, `title`, `content`) VALUES (?,?,?,?)";
                // execute sql query
                let newrecord = [req.body.user, topicID, req.body.title, req.body.content];
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
    app.post('/registered', function(req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO `user` (`username`, `email`, `password`) VALUES (?,?,?)";
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
}
