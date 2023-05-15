var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var SimulatedGame = require('./simulated-game');
var config = require('../../../config');


var colors = ['o', 'c', 'e', 'b'];
var numbers = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

var deck = [];
for (var i = 0; i < colors.length; i++) {
    for (var j = 0; j < numbers.length; j++) {
        deck.push({ n: numbers[j], c: colors[i] });
    }
}
deck = _.shuffle(deck);
//console.log(deck);

var hands = [
    _.first(deck, 10),
    _.chain(deck).rest(10).take(10).value(),
    _.chain(deck).rest(20).take(10).value(),
    _.chain(deck).rest(30).value()
];
//console.log(hands);


var gameConfig = {
    dealer: 3,
    buyer: 0,
    triunfo: 'o',
    playerInTurn: -1,
    maxBid: {
        player: 0,
        amount: 70
    },
    plays: [],
    ongoingPlays: [],
    songs: [],
    wins: [],
    hands: hands,
    reasoner: {
        type: 'lv3-strat',
        options: null
    }
};

config.platform.enableLogging = true;

var game = new SimulatedGame(gameConfig);
var results = game.simulate();

console.log(results);