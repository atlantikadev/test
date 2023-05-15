var reasonerUtils = require('./reasoner-utils');

var index = 0;
var teammateIndex = (index + 2) % 4;
var rightOppIndex = (index + 1) % 4;
var leftOppIndex = (index + 3) % 4;

var hand = [
    { n: 3, c: 'b' },
    { n: 10, c: 'b' },
    { n: 7, c: 'b' }
];

var plays = [
    { player: 3, card: { n: 1, c: 'o' } },
    { player: 0, card: { n: 10, c: 'o' } },
    { player: 1, card: { n: 7, c: 'o' } },
    { player: 2, card: { n: 2, c: 'b' } },

    { player: 2, card: { n: 1, c: 'e' } },
    { player: 3, card: { n: 2, c: 'e' } },
    { player: 0, card: { n: 4, c: 'e' } },
    { player: 1, card: { n: 10, c: 'e' } },

    { player: 2, card: { n: 7, c: 'e' } },
    { player: 3, card: { n: 5, c: 'b' } },
    { player: 0, card: { n: 6, c: 'b' } },
    { player: 1, card: { n: 5, c: 'e' } },

    { player: 0, card: { n: 3, c: 'o' } },
    { player: 1, card: { n: 5, c: 'o' } },
    { player: 2, card: { n: 2, c: 'c' } },
    { player: 3, card: { n: 2, c: 'o' } },

    { player: 0, card: { n: 6, c: 'c' } },
    { player: 1, card: { n: 1, c: 'c' } },
    { player: 2, card: { n: 4, c: 'c' } },
    { player: 3, card: { n: 3, c: 'c' } },

    { player: 1, card: { n: 12, c: 'e' } },
    { player: 2, card: { n: 3, c: 'e' } },
    { player: 3, card: { n: 11, c: 'b' } },
    { player: 0, card: { n: 1, c: 'b' } },

    { player: 0, card: { n: 4, c: 'b' } },
    { player: 1, card: { n: 6, c: 'e' } },
    { player: 2, card: { n: 4, c: 'o' } },
    { player: 3, card: { n: 12, c: 'b' } }
];

var analytics = {
    teammateTopPossibleCardByColor: { 'o': 0, 'b': 0, 'c': 12, 'e': 11 },
    rightOppTopPossibleCardByColor: { 'o': 12, 'b': 0, 'c': 12, 'e': 11 },
    leftOppTopPossibleCardByColor: { 'o': 12, 'b': 0, 'c': 12, 'e': 0 }
}

var hands = reasonerUtils.createMidGameAnalyticsAwareCardDistribution(hand, index, plays, analytics, 0.0);

console.log('Teammate Hand:');
console.log(hands[teammateIndex]);

console.log('Right Opp Hand:');
console.log(hands[rightOppIndex]);

console.log('Left Opp Hand:');
console.log(hands[leftOppIndex]);