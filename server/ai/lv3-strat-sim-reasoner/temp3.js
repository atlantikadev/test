var reasonerUtils = require('./reasoner-utils');

var index = 0;
var teammateIndex = (index + 2) % 4;
var rightOppIndex = (index + 1) % 4;
var leftOppIndex = (index + 3) % 4;

var hand = [
    { n: 3, c: 'e' },
    { n: 11, c: 'e' },
    { n: 10, c: 'e' },
    { n: 7, c: 'e' },
    { n: 3, c: 'c' },
    { n: 12, c: 'b' },
    { n: 6, c: 'b' },
    { n: 1, c: 'o' },
    { n: 7, c: 'o' },
    { n: 2, c: 'o' }
];


var hands = reasonerUtils.createInitialPessimismBasedCardDistribution(hand, index, 0.5);

console.log('Teammate Hand:');
console.log(hands[teammateIndex]);

console.log('Right Opp Hand:');
console.log(hands[rightOppIndex]);

console.log('Left Opp Hand:');
console.log(hands[leftOppIndex]);