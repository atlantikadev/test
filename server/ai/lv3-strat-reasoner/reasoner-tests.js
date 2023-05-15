var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var fs = require('fs');
var util = require('util');
var Game = require('../../core/game');
var config = require('../../../config');
var reasonerUtils = require('./reasoner-utils');



/*
var handGroupedByColor = { c: [3, 10, 5], e: [1, 10, 6], b: [1, 3, 12, 11] };
var triunfo = 'c';
var analytics = {
    remainingCardsByColor:
    {
        o: [1, 3, 12, 11, 10, 7, 6, 5, 4, 2],
        b: [10, 7, 6, 5, 4, 2],
        c: [1, 12, 11, 6, 4, 2],
        e: [3, 12, 11, 7, 5, 4, 2]
    },
    teammateTopPossibleCardByColor: { o: 1, b: 10, c: 1, e: 3 },
    rightOppTopPossibleCardByColor: { o: 1, b: 10, c: 1, e: 3 },
    leftOppTopPossibleCardByColor: { o: 1, b: 10, c: 1, e: 3 }
};
var availableSingingColors = ['b'];


//var weakestWinningTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, { n: 7, c: 'c' }, availableSingingColors.includes(triunfo));
//console.log(weakestWinningTriunfoCard);

//var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
//console.log(weakestCardOfAllColors);

//var weakestWinningCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, analytics.rightOppTopPossibleCardByColor[triunfo], availableSingingColors.includes(triunfo));
//console.log(weakestWinningCard);

//var weakestCardOfColorWithLeastRemainingCards = reasonerUtils.getWeakestCardOfColorWithLeastRemainingCardsAndNoTopCard(handGroupedByColor, triunfo, analytics);
//console.log(weakestCardOfColorWithLeastRemainingCards);
*/


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
                    type: 'lv3-strat'
                }
            },
            {
                reasoner: {
                    type: 'lv3-strat'
                }
            },
            {
                reasoner: {
                    type: 'lv3-strat'
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


var gameData = [];
var gameCount = 10000;

for (var i = 0; i < gameCount; i++) {

    var game = new Game(this, gameConfig);
    game.start();

    gameData.push(game.getHandBidResultsData());

    console.log(i + 1);

    //console.log(gameData[i].hand.groupedCards);
    //console.log(gameData[i]);
}

console.log('');
console.log('');

// Get only the bidding that won the game and group by bidding
var winningBidData = _.filter(gameData, function (d) { return d.pointsToBid >= 0; });
//console.log(winningBids.length);

//var gameDataGroupedByBid = _.groupBy(winningBidData, function (gd) { return gd.bid; });
//console.log(gameDataGroupedByBid);

var winningBidDataAsStringArray = _.map(gameData, function (wbd) {
    return util.format('%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d',        
        wbd.hand.colorCount,
        wbd.hand.triunfoCardCount,
        wbd.hand.maxCardCountPerColor,
        wbd.hand.minCardCountPerColor,
        wbd.hand.totalCardsValue,
        wbd.hand.maxCardValuesPerColor,
        wbd.hand.minCardValuesPerColor,
        wbd.hand.avgCardValuesPerColor,
        wbd.hand.reyCaballoCouples,        
        wbd.points,
        wbd.bid);
});

winningBidDataAsStringArray.splice(0, 0, 'Color Count,Triunfo Card Count,Max Card Count Per Color,Min Card Count Per Color,Total Cards Value,Max Card Values Per Color,Min Card Values Per Color,Avg Card Values Per Color,Rey/Caballo Card Combos,Scored Points,Winning Bid');
//console.log(winningBidDataAsStringArray);


var file = fs.createWriteStream('data.csv');
file.on('error', function (err) { /* error handling */ });
winningBidDataAsStringArray.forEach(function (line) { file.write(line + '\n'); });
file.end();

console.log('done');
