var express = require('express');  
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var jwt = require('jsonwebtoken');
var socketioJwt = require('socketio-jwt');
var gameManager = require('./server/core/game-manager');
var dbManager = require('./server/data/db-manager');
var config = require('./config');
//var PORT = process.env.PORT || 3000;
const uuidV4 = require('uuid/v4');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));
//add
//app.listen(PORT, () => {
  // console.log(`Our app is running on port ${ PORT }`);
//});
//end
app.get('/', function(req, res, next) {  
    res.sendFile(__dirname + '/client/index.html');
});

app.post('/token', function (req, res) {

    // Retrieve the email and password
    var email = req.body.email;
    var password = req.body.password;
    console.log('Token requested by: ' + email);
    
    dbManager.connect(function() {
        dbManager.authenticateUser(email, password)
            .then(function(user) {
                if(user !== null) {

                    // create a simplified user profile to be tokenized and sent back to the client
                    var profile = {
                        id: user.id,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        login_count: user.loginCount
                    };

                    // we are sending the profile in the token
                    var token = jwt.sign(profile, 'secret_key', { expiresIn: 60 * 5 });
                    res.json({token: token});

                }
                else {
                    res.status(401).json({error: 'Wrong email or password'});
                }
            });
    });


    /*
    // TODO: Validate the specified credentials from MongoDB later
    var isUserValid = true;
    
    if(isUserValid) {
        
        var profile = {
            id: uuidV4(),
            username: 'player'
            //first_name: 'Adil',
            //last_name: 'Kabbaj',
            //email: email
        };

        // we are sending the profile in the token
        var token = jwt.sign(profile, 'secret_key', { expiresIn: 60*5 });
        res.json({token: token});
    }
    else {
        res.status(401).json({error: 'Wrong email or password'});
    }
    */

});
app.post('/addUser', function (req, res){
    var user = {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password
    };
    console.log("******************************",user);
    dbManager.connect(function() {
        dbManager.addUser(user);
        console.log('user added !!!!!!!!!!!!')})
})

// app.post('/addGame',()=>{
   
    
// })


io.use(socketioJwt.authorize({
  secret: 'secret_key',
  handshake: true
}));


io.sockets
    .on('connection', function (socket) {
        
        console.log(socket.decoded_token.username, 'connected');        
        
        // TODO: Get relevant user data then send it back as a welcome
        socket.emit('WELCOME', {
            id: socket.decoded_token.id,
            username: socket.decoded_token.username
            //first_name: socket.decoded_token.first_name,
            //last_name: socket.decoded_token.last_name,
            //email: socket.decoded_token.email        
        });
        
        
        socket.on('NEW_GAME_REQUESTED', function() {

            // Retrieve the profile data from the socket
            var profile = socket.decoded_token;  

            // Try to find a game first
            var game = gameManager.findGame();

            // No game was found so create a new one
            if (game === null) {
                var gameConfig = {};
                game = gameManager.createGame(gameConfig);
            }

            // Add the player to the game
            game.addPlayer(profile, socket);
            dbManager.connect(function() {
                dbManager.saveGame(game);
                console.log("game saved");
                })
        });
        


        socket.on('FIND_GAMES_BY_KEYWORD_PART', function (keywordPart) {
            //console.log('Looking for games with keyword: ' + keywordPart);
            dbManager.findGamesByKeywordPart(keywordPart, 10)
                .then(function (results) {
                    //console.log(results.length);
                    socket.emit('GAME_SEARCH_FINISHED', results);
                });           

        });


        socket.on('NEW_COMMENT_ADDED', function (commentData, callback) {

            commentData.authorId = socket.decoded_token.id;
            commentData.author = socket.decoded_token.username;
            commentData.date = new Date();

            dbManager.addComment(commentData)
                .then(function () {
                    callback(commentData);
                }, function () {
                    callback(null);
                });

        });

        /*
        socket.on('disconnect', function () {
            console.log('The socket has been disconnected!');
        });
        */
        
    });


server.listen(config.platform.webPort);
