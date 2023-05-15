var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var Game = require('../../core/game');
var config = require('../../../config');


// Disable logging 
config.platform.enableLogging = false;

// Set the game config
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
};


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

var gameStartupData = {
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
    hands: [[], [], [], []]
};


var game = null;

for (var i = 0; i < 4; i++) {

    gameStartupData.dealer = i;
    gameStartupData.buyer = 0;
    gameStartupData.maxBid.player = gameStartupData.buyer;
    gameStartupData.hands[0] = _.first(hands[0], hands[0].length);
    gameStartupData.hands[1] = _.first(hands[1], hands[1].length);
    gameStartupData.hands[2] = _.first(hands[2], hands[2].length);
    gameStartupData.hands[3] = _.first(hands[3], hands[3].length);
    gameStartupData.plays = [];
    gameStartupData.wins = [];
    gameStartupData.songs = [];
    gameStartupData.ongoingPlays = [];


    game = new Game(this, gameConfig);
    var results = game.simulate(gameStartupData);
    console.log(results);

}

