var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var Game = require('../core/game');
var config = require('../../config');


//#region Define the config for the games to be played

// Disable logging to speed up game generation
config.platform.enableLogging = false;

// Assign the legacy strat reasoner to team A and lv3 strat reasoner to team B
var gameConfig = {
    persistence: {
        enabled: false
    },
    ai: {
        players: [
            {
                reasoner: {
                    type: 'lv3-strat-sim',
                    options: {
                        simCountPerBid: 64,
                        simCountPerPlay: 48
                    }
                }
            },
            {
                reasoner: {
                    type: 'lv3-strat'
                }
            },
            {
                reasoner: {
                    type: 'lv3-strat-sim',
                    options: {
                        simCountPerBid: 64,
                        simCountPerPlay: 48
                    }
                }
            },
            {
                reasoner: {
                    type: 'lv3-strat'
                }
            }
        ]
    }
}

//console.log(_.deepExtend(config.game, gameConfig).ai.players);

//#endregion

//#region Generate the games then store results

var gameData = [];
var gameCount = 10;

for (var i = 0; i < gameCount; i++) {

    var game = new Game(this, gameConfig);
    game.start();

    var results = game.getResultStats();
    gameData.push(results);

    console.log(i + 1);
    console.log('----------------------------------------------------------------------------------------');
    //console.log(results);
    //console.log('');

}

//console.log(gameData);

//#endregion

//#region Extract insights

var gamesWonByTeamA = 0;
var gamesWonByTeamB = 0;

var percentOfGamesWonByTeamA = 0.0;
var percentOfGamesWonByTeamB = 0.0;

var gamesTeamAWonBid = 0;
var gamesTeamALostItsBid = 0;
var gamesTeamAWonItsBid = 0;

var gamesTeamBWonBid = 0;
var gamesTeamBLostItsBid = 0;
var gamesTeamBWonItsBid = 0;

var teamAPointsToBidMin = 230;
var teamAScoreToBidAvg = 0.0;
var teamAPointsToBidMax = -230;
var teamAPointsToBidSum = 0;

var teamBPointsToBidMin = 230;
var teamBPointsToBidAvg = 0.0;
var teamBPointsToBidMax = -230;
var teamBPointsToBidSum = 0;

for (var i = 0; i < gameData.length; i++) {

    if (gameData[i].biddingTeam === 'A') {

        // Team A won the bid
        gamesTeamAWonBid++;

        if (gameData[i].winningTeam === 'A') {

            // Team A won the bid and won the game
            gamesTeamAWonItsBid++;
            gamesWonByTeamA++;

        }
        else {

            // Team A won the bid but lost the game
            gamesTeamALostItsBid++;
            gamesWonByTeamB++;

        }


        teamAPointsToBidSum += gameData[i].pointsToBidDifference;

        if (gameData[i].pointsToBidDifference < teamAPointsToBidMin) {
            teamAPointsToBidMin = gameData[i].pointsToBidDifference;
        }

        if (gameData[i].pointsToBidDifference > teamAPointsToBidMax) {
            teamAPointsToBidMax = gameData[i].pointsToBidDifference;
        }


    }
    else {

        // Team B won the bid
        gamesTeamBWonBid++;

        if (gameData[i].winningTeam === 'B') {

            // Team B won the bid and won the game
            gamesTeamBWonItsBid++;
            gamesWonByTeamB++;

        }
        else {

            // Team B won the bid but lost the game
            gamesTeamBLostItsBid++;
            gamesWonByTeamA++;

        }


        teamBPointsToBidSum += gameData[i].pointsToBidDifference;

        if (gameData[i].pointsToBidDifference < teamBPointsToBidMin) {
            teamBPointsToBidMin = gameData[i].pointsToBidDifference;
        }

        if (gameData[i].pointsToBidDifference > teamBPointsToBidMax) {
            teamBPointsToBidMax = gameData[i].pointsToBidDifference;
        }

    }

}

percentOfGamesWonByTeamA = 100.0 * (parseFloat(gamesWonByTeamA) / gameData.length);
percentOfGamesWonByTeamB = 100.0 * (parseFloat(gamesWonByTeamB) / gameData.length);

teamAPointsToBidAvg = parseFloat(teamAPointsToBidSum) / gameData.length;
teamBPointsToBidAvg = parseFloat(teamBPointsToBidSum) / gameData.length;


console.log('');
console.log('');

console.log('Team A won the game: ' + gamesWonByTeamA + '/' + gameData.length + ' (' + percentOfGamesWonByTeamA + '%)');
console.log('Team B won the game: ' + gamesWonByTeamB + '/' + gameData.length + ' (' + percentOfGamesWonByTeamB + '%)');
console.log('');

console.log('Team A won the bidding: ' + gamesTeamAWonBid + '/' + gameData.length + ' (' + (100.0 * (parseFloat(gamesTeamAWonBid) / gameData.length)) + '%)');
console.log('Team B won the bidding: ' + gamesTeamBWonBid + '/' + gameData.length + ' (' + (100.0 * (parseFloat(gamesTeamBWonBid) / gameData.length)) + '%)');
console.log('');

console.log('Team A won its bid: ' + gamesTeamAWonItsBid + '/' + gamesTeamAWonBid + ' times (good estimation of bidding: ' + (100.0 * (parseFloat(gamesTeamAWonItsBid) / gamesTeamAWonBid)) + '%)');
console.log('Team B won its bid: ' + gamesTeamBWonItsBid + '/' + gamesTeamBWonBid + ' times (good estimation of bidding: ' + (100.0 * (parseFloat(gamesTeamBWonItsBid) / gamesTeamBWonBid)) + '%)');
console.log('');

console.log('Team A lost its bid: ' + gamesTeamALostItsBid + '/' + gamesTeamAWonBid + ' times (wrong estimation of bidding: ' + (100.0 * (parseFloat(gamesTeamALostItsBid) / gamesTeamAWonBid)) + '%)');
console.log('Team B lost its bid: ' + gamesTeamBLostItsBid + '/' + gamesTeamBWonBid + ' times (wrong estimation of bidding: ' + (100.0 * (parseFloat(gamesTeamBLostItsBid) / gamesTeamBWonBid)) + '%)');
console.log('');

console.log('Team A points to bid difference: ' + teamAPointsToBidMin + '(Min)  ' + teamAPointsToBidAvg + '(Avg)  ' + teamAPointsToBidMax + '(Max)');
console.log('Team B points to bid difference: ' + teamBPointsToBidMin + '(Min)  ' + teamBPointsToBidAvg + '(Avg)  ' + teamBPointsToBidMax + '(Max)');
console.log('');

//#endregion
