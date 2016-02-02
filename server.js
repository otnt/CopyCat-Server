// MongoDB connector
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Post = require('./post');

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var base64 = require('node-base64-image');
var request = require('request');

app.use('/img', express.static('img'));

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


router.use(function(req, res, next) {
    // do logging
    console.log('received : '+req.originalUrl);//'body:%j', req.body);
    next(); // make sure we go to the next routes and don't stop here
});


router.get('/instagram/login',function(req, res){
    console.log('code:',req.query.code);
    request.post( 'https://api.instagram.com/oauth/access_token',
        { form: 
            { 
                client_id: 'ea2679a4073c4809919836b18e91b257',
                client_secret : '87e2890a23fd4defb7fc2cfc76f43d15',
                grant_type : 'authorization_code',
                redirect_uri : 'http://ec2-52-21-52-152.compute-1.amazonaws.com:8080/api/instagram/login',
                code : req.query.code
            } 
        },
        function (error, response, body) {
                console.log(body)
        }
    );
    res.json(req.query)
})


var postLimit = 5
router.route('/post/')
    // add new post
    .post(function(req, res) {
        var post = req.body;
        var imageStr = post.photoURI;
        post.photoURI = "***";

        console.log('post:%j',post);
        
        
        Post.create(req.body, function(err, result){
            console.log('result:%j',result);
            var id = result._id 
            var options = {filename: 'img/'+id};
            var imageData = new Buffer(imageStr, 'base64');
            base64.base64decoder(imageData, options, function (err, saved) {
                if (err) { console.log(err); }  
                console.log(saved);    
            });  
            if (err ===null){
                post = result;
                uri = '/img/'+id+'.jpg';
                Post.update({ "_id": id},{"photoURI":uri},function(err,result){
                    console.log(result)
                    post.photoURI = uri;
                    res.json(post);
                });
            }else
                res.send({msg:err})
        });
    })
    //get all post
    .get(function(req, res) {
        var query = Post.find({}).sort({'timestamp': -1}).limit(postLimit);
        query.exec(function(err, posts) {
            if (err)
                res.send(err);
            res.json(posts);
        });
    });



router.route('/post/before/:timestamp')
    .get(function(req, res) {
        console.log("ts:" + req.params.timestamp);
        var date = new Date(req.params.timestamp);
        var query = Post.find({"timestamp": { $gt: date}}).sort({'timestamp': -1}).limit(postLimit);
        query.exec(function(err, posts) {
            if (err)
                res.send(err);
            console.log(err+" :: "+posts);
            res.json(posts);
        });
    });

router.route('/post/after/:timestamp')
    .get(function(req, res) {
        console.log("ts:" + req.params.timestamp);
        var date = new Date(req.params.timestamp);
        var query = Post.find({"timestamp": { $lt: date}}).sort({'timestamp': -1}).limit(postLimit);
        query.exec(function(err, posts) {
            if (err)
                res.send(err);
            console.log("after: " +err+" :: "+posts);
            res.json(posts);
        });
    });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);