module.exports = function(app, siteData) {

    // Route handlers
    app.get('/',function(req,res){
        res.render('index.ejs', siteData)
    });
}
