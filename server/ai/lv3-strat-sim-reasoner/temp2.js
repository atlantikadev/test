var assert = require('assert');
var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var config = require('../../../config');
var logUtils = require('../../utils/log-utils');
var gameUtils = require('../../core/game-utils');


var dealer = 1;
var playerIndex = 0;
var teammateIndex = (playerIndex + 2) % 4;
var rightOppIndex = (playerIndex + 1) % 4;
var leftOppIndex = (playerIndex + 3) % 4;


function createInitialRandomCardDistribution(hand) {

    // Set the ai player hands
    var hands = [[], [], [], []];    

    // Set the ai player hands
    hands[playerIndex] = _.clone(hand);

    // Set other players hand
    var handComplement = gameUtils.getHandComplement(hand);
    handComplement = _.shuffle(handComplement);

    hands[teammateIndex] = _.first(handComplement, 10);
    hands[rightOppIndex] = _.chain(handComplement).rest(10).take(10).value();
    hands[leftOppIndex] = _.chain(handComplement).rest(20).take(10).value();
    

    return hands;

}





function createMidGameRandomCardDistribution(hand, plays, analytics) {

    // Set player indexes
    //var playerIndex = this.aiPlayer.getIndex();
    //var teammateIndex = (playerIndex + 2) % 4;
    //var rightOppIndex = (playerIndex + 1) % 4;
    //var leftOppIndex = (playerIndex + 3) % 4;
    //console.log('playerIndex: ' + playerIndex);
    //console.log('teammateIndex: ' + teammateIndex);
    //console.log('rightOppIndex: ' + rightOppIndex);
    //console.log('leftOppIndex: ' + leftOppIndex);
    //console.log('');

    // Set the ai player hands
    var hands = [[], [], [], []];
    hands[playerIndex] = _.clone(hand);
    console.log('hand (' + hands[playerIndex].length + ')');
    console.log(hands[playerIndex]);
    console.log('');

    // Plays grouped by player index
    var playsGroupedByPlayer = _.groupBy(plays, 'player');
    console.log('playsGroupedByPlayer');
    console.log(playsGroupedByPlayer);
    console.log('');

    // Get hand complement while taking into consideration all the plays that happened
    var handComplement = gameUtils.getHandComplement(hand, plays);
    handComplement = _.shuffle(handComplement);
    console.log('handComplement (' + handComplement.length + ')');
    console.log(handComplement);
    console.log('');

    // Set teammate hypothetical hand taking analytics into consideration
    var teammateHandLength = _.has(playsGroupedByPlayer, teammateIndex) ? 10 - playsGroupedByPlayer[teammateIndex].length : 10;
    console.log('teammateHandLength');
    console.log(teammateHandLength);
    console.log('');

    var rightOppHandLength = _.has(playsGroupedByPlayer, rightOppIndex) ? 10 - playsGroupedByPlayer[rightOppIndex].length : 10;
    console.log('rightOppHandLength: ' + rightOppHandLength);
    console.log('');

    var leftOppHandLength = _.has(playsGroupedByPlayer, leftOppIndex) ? 10 - playsGroupedByPlayer[leftOppIndex].length : 10;
    console.log('leftOppHandLength: ' + leftOppHandLength);
    console.log('');



    // TODO: find a way to distribute the hand complement while taking into consideration the analytics


    return hands;

}




var colors = ['o', 'c', 'e', 'b'];
var numbers = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];
var deck = [];
for (var i = 0; i < colors.length; i++) {
    for (var j = 0; j < numbers.length; j++) {
        deck.push({ n: numbers[j], c: colors[i] });
    }
}
deck = _.shuffle(deck);
//console.log(deck);

var triunfo = 'b';

var hand = [
    { n: 3, c: 'e' },
    { n: 11, c: 'e' },
    { n: 10, c: 'e' },
    { n: 7, c: 'e' },
    { n: 3, c: 'c' },
    { n: 12, c: 'b' },
    { n: 6, c: 'b' }
];

var plays = [
    { player: 1, card: { n: 10, c: 'o' } }
    , { player: 2, card: { n: 11, c: 'o' } }
    , { player: 3, card: { n: 1, c: 'o' } }
    , { player: 0, card: { n: 4, c: 'b' } }

    , { player: 0, card: { n: 1, c: 'e' } }
    , { player: 1, card: { n: 6, c: 'e' } }
    , { player: 2, card: { n: 2, c: 'e' } }
    , { player: 3, card: { n: 2, c: 'b' } }

    , { player: 3, card: { n: 1, c: 'c' } }
    , { player: 0, card: { n: 2, c: 'c' } }
    , { player: 1, card: { n: 4, c: 'c' } }
    , { player: 2, card: { n: 5, c: 'c' } }
];

var analytics = {
    remainingCardsByColor: null, //{ 'o': [], 'b': [], 'c': [], 'e': [] },
    teammateTopPossibleCardByColor: { 'o': 3, 'b': 1, 'c': 12, 'e': 3 }, // '1' means that this player can have up to the As in this color. '0' means that he doesn't have any card in this color
    rightOppTopPossibleCardByColor: { 'o': 3, 'b': 1, 'c': 12, 'e': 3 },
    leftOppTopPossibleCardByColor: { 'o': 3, 'b': 1, 'c': 12, 'e': 0 }
};


var hands = createMidGameRandomCardDistribution(hand, plays, analytics);




/*
for (var i = 0; i < 1; i++) {

    var hands = createInitialRandomCardDistribution(hand);

    assert.equal(hands[teammateIndex].length, 10, 'the teammate hand does not have 10 cards');
    assert.equal(hands[rightOppIndex].length, 10, 'the right opp hand does not have 10 cards');
    assert.equal(hands[leftOppIndex].length, 10, 'the left opp hand does not have 10 cards');

    assert.equal(_.intersection(hands[teammateIndex], hands[rightOppIndex]).length, 0);
    assert.equal(_.intersection(hands[rightOppIndex], hands[leftOppIndex]).length, 0);
    assert.equal(_.intersection(hands[teammateIndex], hands[rightOppIndex]).length, 0);

    

}
*/