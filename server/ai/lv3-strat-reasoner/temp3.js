var reasonerUtils = require('./reasoner-utils');
var gameUtils = require('../../core/game-utils');

var hand = [
    { n: 12, c: 'o' },
    { n: 7, c: 'o' },
    { n: 1, c: 'c' },
    { n: 3, c: 'c' },
    { n: 4, c: 'e' },
    { n: 2, c: 'e' },
    { n: 11, c: 'b' },
    { n: 6, c: 'b' },
    { n: 5, c: 'b' },
    { n: 4, c: 'b' }
];
var winningBidAmount = 90;
var triunfo = 'b';
var previousSongs = [
    
];
var analytics = {
    remainingCardsByColor: gameUtils.getHandComplementGroupedByColor(hand),
    teammateTopPossibleCardByColor: { o: 3, b: 11, c: 1, e: 1 },
    rightOppTopPossibleCardByColor: { o: 3, b: 11, c: 1, e: 1 },
    leftOppTopPossibleCardByColor: { o: 3, b: 11, c: 1, e: 1 }
};


var suspectedFutureSingingColors = reasonerUtils.getSuspectedFutureSingingColors(winningBidAmount, triunfo, previousSongs, analytics);
console.log(suspectedFutureSingingColors);