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


//var gameData = [];
var gameCount = 1;

for (var i = 0; i < gameCount; i++) {

    var game = new Game(this, gameConfig);
    game.start();

    //gameData.push(game.getHandBidResultsData());

    //console.log(i + 1);

    //console.log(gameData[i].hand.groupedCards);
    //console.log(gameData[i]);
}

console.log('');
console.log('');