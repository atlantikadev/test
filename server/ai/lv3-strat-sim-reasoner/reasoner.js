var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
//var SimulatedGame = require('./simulated-game');
var config = require('../../../config');
var logUtils = require('../../utils/log-utils');
var gameUtils = require('../../core/game-utils');
var reasonerUtils = require('./reasoner-utils');



function Level3StrategySimulationReasoner(aiPlayer, config) {

    this.aiPlayer = aiPlayer;
    this.config = config;


    this.createInitialRandomCardDistribution = function(hand) {

        // Set player indexes
        var playerIndex = this.aiPlayer.getIndex();
        var teammateIndex = (playerIndex + 2) % 4;
        var rightOppIndex = (playerIndex + 1) % 4;
        var leftOppIndex = (playerIndex + 3) % 4;

        // Set the ai player hands
        var hands = [[], [], [], []];

        // Set the ai player hands
        hands[playerIndex] = _.clone(hand);

        // Set other players hand
        var handComplement = gameUtils.getHandComplement(hand);
        handComplement = _.shuffle(handComplement);

        hands[teammateIndex] = _.first(handComplement, 10);
        //console.log(hands[otherPlayerIndexes[0]]);
        //console.log('');

        hands[rightOppIndex] = _.chain(handComplement).rest(10).take(10).value();
        //console.log(hands[otherPlayerIndexes[1]]);
        //console.log('');

        hands[leftOppIndex] = _.chain(handComplement).rest(20).take(10).value();
        //console.log(hands[otherPlayerIndexes[2]]);
        //console.log('');


        return hands;

    }


    this.createMidGameRandomCardDistribution = function (hand, analytics) {

        // Set player indexes
        var playerIndex = this.aiPlayer.getIndex();
        var teammateIndex = (playerIndex + 2) % 4;
        var rightOppIndex = (playerIndex + 1) % 4;
        var leftOppIndex = (playerIndex + 3) % 4;
        //console.log('playerIndex: ' + playerIndex);
        //console.log('playerTeammateIndex: ' + playerTeammateIndex);
        //console.log('rightOppIndex: ' + rightOppIndex);
        //console.log('leftOppIndex: ' + leftOppIndex);
        //console.log('');

        // Set the ai player hands
        var hands = [[], [], [], []];
        hands[playerIndex] = _.clone(hand);        

        // Plays grouped by player index
        var playsGroupedByPlayer = _.groupBy(this.aiPlayer.getPlays(), 'player');
        //console.log('playsGroupedByPlayer');
        //console.log(playsGroupedByPlayer);
        //console.log('');

        // Get hand complement while taking into consideration all the plays that happened
        var handComplement = gameUtils.getHandComplement(hand, this.aiPlayer.getPlays());
        handComplement = _.shuffle(handComplement);
        //console.log('handComplement');
        //console.log(handComplement);
        //console.log('');

        // Set teammate hypothetical hand taking analytics into consideration
        var teammateHandLength = _.has(playsGroupedByPlayer, teammateIndex) ? 10 - playsGroupedByPlayer[teammateIndex].length : 10;
        //console.log('teammateHandLength');
        //console.log(teammateHandLength);
        //console.log('');

        var teammatePossibleCards = [];
        for (var color in analytics.teammateTopPossibleCardByColor) {
            if (analytics.teammateTopPossibleCardByColor[color] !== 0) {
                var possibleCardsPerColor = _.filter(handComplement, function (card) {
                    return card.c === color && (card.n === analytics.teammateTopPossibleCardByColor[color] || gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[color], card.n));
                });
                if (possibleCardsPerColor.length > 0) {
                    teammatePossibleCards = teammatePossibleCards.concat(possibleCardsPerColor);
                }
            }
        }
        teammatePossibleCards = _.shuffle(teammatePossibleCards);

        hands[teammateIndex] = _.first(teammatePossibleCards, teammateHandLength);
        //console.log('hands[playerTeammateIndex]');
        //console.log(hands[playerTeammateIndex]);
        //console.log('');

        // Set opponents cards
        var opponentsPossibleCards = _.difference(handComplement, hands[teammateIndex]);
        //console.log('hands[opponentsPossibleCards]');
        //console.log(opponentsPossibleCards);
        //console.log('');

        var rightOppHandLength = _.has(playsGroupedByPlayer, rightOppIndex) ? 10 - playsGroupedByPlayer[rightOppIndex].length : 10;
        var leftOppHandLength = _.has(playsGroupedByPlayer, leftOppIndex) ? 10 - playsGroupedByPlayer[leftOppIndex].length : 10;
        //console.log('rightOppHandLength: ' + rightOppHandLength + ' - leftOppHandLength: ' + leftOppHandLength);
        //console.log('');

        hands[rightOppIndex] = _.first(opponentsPossibleCards, rightOppHandLength);
        //console.log('hands[rightOppIndex]');
        //console.log(hands[rightOppIndex]);
        //console.log('');

        hands[leftOppIndex] = _.last(opponentsPossibleCards, leftOppHandLength);
        //console.log('hands[leftOppIndex]');
        //console.log(hands[leftOppIndex]);
        //console.log('');


        return hands;

    }

}




Level3StrategySimulationReasoner.prototype.estimateBidAmount = function (hand, firstTeammateBid, triunfo) {

    // Create a hand distribution
    //var hands = this.createInitialRandomCardDistribution(hand);
    //console.log(hands);

    var playerIndex = this.aiPlayer.getIndex();


    // Get the current heighest bid
    // IMPORTANT: do not modify maxBid here as it will break the bidding in the actual game
    var maxBid = this.aiPlayer.getWinningBid();


    var gameConfig = {
        dealer: this.aiPlayer.getDealer(),
        buyer: playerIndex,
        triunfo: triunfo,
        playerInTurn: -1,
        maxBid: {
            player: playerIndex,
            amount: maxBid ? Math.max(70, maxBid.amount + 10) : 70
        },
        plays: [],
        ongoingPlays: [],
        songs: [],
        wins: [],
        hands: [],
        reasoner: {
            type: 'lv3-strat',
            options: null
        }
    };

    //console.log('');
    //console.log('');
    //console.log('');

    // Prepare for the simulation
    var simulationResults = [];
    var SimulatedGame = require('./simulated-game'); // IMPORTANT: this is required at this point to avoid cyclic dependency


    // Start simulations
    var startBidAmount = gameConfig.maxBid.amount;
    var endBidAmount = startBidAmount < 110 ? 110 : startBidAmount;
    //console.log('Start Bid Amount: ' + startBidAmount + ' - End Bid Amount: ' + endBidAmount);
    //console.log('');

    for (var i = startBidAmount; i <= endBidAmount; i = i + 10) {

        // Set the target winning bid for the next sim
        gameConfig.maxBid.amount = i;

        for (var j = 0; j < this.config.simCountPerBid; j++) {

            // Create a new random hand distribution
            //gameConfig.hands = this.createInitialRandomCardDistribution(hand);
            gameConfig.hands = reasonerUtils.createInitialPessimismBasedCardDistribution(hand, playerIndex, 1.0);
            
            // Simulate the game
            var game = new SimulatedGame(gameConfig);
            var results = game.simulate();

            // Store results
            simulationResults.push({
                bid: i,
                points: this.aiPlayer.getIndex() % 2 === 0 ? results.teamAPoints : results.teamBPoints,
                results: results
            });

        }
    }

    //console.log('simulationResults');
    //console.log(simulationResults);
    //console.log('');

    // Process simulation results
    var averagedSimulationResults = _.chain(simulationResults)
        .groupBy('bid')
        .mapObject(function (val, key) {
            var pointsSumPerBid = _.reduce(val, function (sum, result) { return sum + result.points; }, 0);
            var pointsAveragePerBid = parseFloat(pointsSumPerBid) / val.length;
            return {
                bid: key,
                points: pointsAveragePerBid
            };
        })
        .values()
        .value();

    //console.log('averagedSimulationResults');
    //console.log(averagedSimulationResults);
    //console.log('');

    var securityThreshold = 0;
    var validResults = _.filter(averagedSimulationResults, function (result) { return result.points >= result.bid; });
    if (validResults.length > 0) {

        var bestResult = _.max(validResults, function (result) { return result.points - result.bid; });
        var bid = Math.floor((bestResult.points / 10.0)) * 10;

        //console.log(bid);
        //console.log('');
        //console.log('');
        //console.log('');

        return bid;

    }
    else {

        //console.log('PASS');
        //console.log('');
        //console.log('');
        //console.log('');

        return 0;
    }

}



Level3StrategySimulationReasoner.prototype.chooseCardToPlay = function (hand, validCards, analytics) {

    //console.log('');
    //console.log('');
    //console.log('');
    //console.log('');
    //console.log('');
    //console.log('');
    //console.log(this.aiPlayer.getUsername());
    //console.log('CHOOSE CARD TO PLAY');
    //console.log('');
    //console.log('');


    if (hand.length === 0)
        return;


    if (hand.length === 1) {
        return hand[0];
    }


    if (validCards.length === 1) {
        return validCards[0];
    }


    // Create a hand distribution
    //var hands = this.createMidGameRandomCardDistribution(hand, analytics);
    

    // Prepare some variables
    var playerIndex = this.aiPlayer.getIndex();
    var dealer = this.aiPlayer.getDealer();
    var winningBid = _.clone(this.aiPlayer.getWinningBid());
    var buyer = winningBid.player;
    var triunfo = this.aiPlayer.getTriunfo();
    var plays = _.clone(this.aiPlayer.getPlays());
    var wins = _.clone(this.aiPlayer.getWins());
    var songs = _.clone(this.aiPlayer.getSongs());

    //console.log('REAL PLAYS (' + plays.length + ')');
    //console.log(plays);
    //console.log('');

    //console.log('Player card count: ' + hands[playerIndex].length);
    //console.log('Player teammate card count: ' + hands[(playerIndex + 2) % 4].length);
    //console.log('Player right opp card count: ' + hands[(playerIndex + 1) % 4].length);
    //console.log('Player left opp card count: ' + hands[(playerIndex + 3) % 4].length);
    //console.log('');

    //console.log('REAL WINS');
    //console.log(wins);
    //console.log('');

    var ongoingPlays = [];
    if (plays.length > 0 && plays.length % 4 !== 0) {
        var ongoingPlaysStartIndex = Math.floor(plays.length / 4.0) * 4;
        ongoingPlays = _.last(plays, plays.length - ongoingPlaysStartIndex);
    }


    var gameConfig = {
        dealer: dealer,
        buyer: buyer,
        triunfo: triunfo,
        playerInTurn: playerIndex,
        maxBid: winningBid,
        plays: plays,
        ongoingPlays: ongoingPlays,
        songs: songs,
        wins: wins,
        hands: [],
        reasoner: {
            type: 'lv3-strat',
            role: 'sim',
            options: null
        }
    };


    // Prepare for the simulation
    var simulationResults = [];
    var SimulatedGame = require('./simulated-game'); // IMPORTANT: this is required at this point to avoid cyclic dependency

    for (var i = 0; i < validCards.length; i++) {

        for (var j = 0; j < this.config.simCountPerPlay; j++) {

            // Create a new random hand distribution
            //gameConfig.hands = this.createMidGameRandomCardDistribution(hand, analytics);
            gameConfig.hands = reasonerUtils.createMidGameAnalyticsAwareCardDistribution2(hand, playerIndex, plays, analytics, 1.0);

            var game = new SimulatedGame(gameConfig);
            var results = game.simulateWithPlay({
                player: playerIndex,
                card: validCards[i]
            });


            simulationResults.push({
                cardAsString: validCards[i].n + '.' + validCards[i].c, 
                card: validCards[i],
                points: playerIndex % 2 === 0 ? results.teamAPoints : results.teamBPoints,
                results: results
            });

        }
    }

    //console.log('simulationResults');
    //console.log(simulationResults);
    //console.log('');

    // Process simulation results
    var averagedSimulationResults = _.chain(simulationResults)
        .groupBy('cardAsString')
        .mapObject(function (val, key) {
            var pointsSum = _.reduce(val, function (sum, result) { return sum + result.points; }, 0);
            var pointsAverage = parseFloat(pointsSum) / val.length;
            var card = val[0].card;
            return {
                card: card,
                points: pointsAverage
            };
        })
        .values()
        .value();

    //console.log('averagedSimulationResults');
    //console.log(averagedSimulationResults);
    //console.log('');


    var bestResult = _.max(averagedSimulationResults, function (result) { return result.points - (gameUtils.getCardValue(result.card.n) * 10 + result.card.n); });
    //console.log('Played card');
    //console.log(bestResult.card);
    //console.log('');

    return bestResult.card;

    //return validCards[0];    

}



module.exports = Level3StrategySimulationReasoner;


