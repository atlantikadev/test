var mongoClient = require('mongodb').MongoClient;
var tijariGameDbUrl = 'mongodb://app:TiJaRi2017@ds135830.mlab.com:35830/tijari_game_db';

var playerType = 'ai'; // 'human' or 'ai'
var playerUsername = 'Ami.ne'; // only valid for human players. ignored for ai

var gamesPlayerWasInvolved = [];
var gamesPlayerHimselfWonBidding = [];
var gamesPlayerTeammateWonBidding = [];

mongoClient.connect(tijariGameDbUrl, function (err, db) {
    if (err === null) {

        var humanQuery = {
            "info.winningBidPlayerType": "human",
            "info.buyingTeamWonBid": true,
            "players.username": playerUsername,
            "creationDate": { $gte: new Date("2017-12-01") }
        };

        var aiQuery = {
            "info.winningBidPlayerType": "ai",
            "info.buyingTeamWonBid": true,
            "creationDate": { $gte: new Date("2017-12-01") }
        };


        var dbo = db.db("tijari_game_db");
        dbo.collection("games").find(playerType === 'human' ? humanQuery : aiQuery)
            .toArray()
            .then(function (results) {

                gamesPlayerWasInvolved = results;
                console.log('Games player was invloved in: ' + gamesPlayerWasInvolved.length);

                var expInd = calculatePlayerExpertiseIndex();
                console.log('Experience index for "' + (playerType === 'human' ? playerUsername : 'ai') + '": ' + expInd);

                dbo.close();

            });

    }
    else {
        console.log(err);
    }
});


function calculatePlayerExpertiseIndex() {

    for (var i = 0; i < gamesPlayerWasInvolved.length; i++) {

        var game = gamesPlayerWasInvolved[i];

        if (game.players[game.winningBid.player].username === playerUsername) {
            gamesPlayerHimselfWonBidding.push(game);
        }
        else if (game.players[(game.winningBid.player + 2) % 4].username === playerUsername) {
            gamesPlayerTeammateWonBidding.push(game);
        }

    }

    
    var sumOfScoreMinusBidPart1 = 0.0;
    for (var i = 0; i < gamesPlayerHimselfWonBidding.length; i++) {
        sumOfScoreMinusBidPart1 -= gamesPlayerHimselfWonBidding[i].info.bidToPointsDifference;
    }
    var ExpIndexPart1 = parseFloat(sumOfScoreMinusBidPart1) / gamesPlayerHimselfWonBidding.length;


    var sumOfScoreMinusBidPart2 = 0.0;
    for (var i = 0; i < gamesPlayerTeammateWonBidding.length; i++) {
        sumOfScoreMinusBidPart2 -= gamesPlayerTeammateWonBidding[i].info.bidToPointsDifference;
    }
    var ExpIndexPart2 = parseFloat(sumOfScoreMinusBidPart2) / (gamesPlayerHimselfWonBidding.length * 2);


    return ExpIndexPart1 + ExpIndexPart2;

}


