var _ = require('underscore');
var reasonerUtils = require('./reasoner-utils');
var gameUtils = require('../../core/game-utils');


var hand = [
    { n: 1, c: 'o' },
    { n: 11, c: 'o' },
    { n: 12, c: 'c' },
    { n: 11, c: 'c' },
    { n: 1, c: 'b' },
    { n: 3, c: 'b' },
    { n: 12, c: 'b' },
    { n: 10, c: 'b' },
    { n: 7, c: 'b' },
    { n: 2, c: 'b' }
];
var handGroupedByColor = { o: [1, 11], c: [12, 11], b: [1, 3, 12, 10, 7, 2] };
var triunfo = 'b';
var analytics = {
    remainingCardsByColor:
    {
        o: [3, 12, 10, 7, 6, 5, 4, 2],
        b: [11, 6, 5, 4],
        c: [1, 3, 10, 7, 6, 5, 4, 2],
        e: [1, 3, 12, 11, 10, 7, 6, 5, 4, 2]
    },
    teammateTopPossibleCardByColor: { o: 3, b: 11, c: 1, e: 1 },
    rightOppTopPossibleCardByColor: { o: 3, b: 11, c: 1, e: 1 },
    leftOppTopPossibleCardByColor: { o: 3, b: 11, c: 1, e: 1 }
};
var availableSingingColors = [];


//#region STRATEGY 1.1

// First play in the game. The player is the buyer. Singing is planned.
function strategy_1_1(handGroupedByColor, triunfo, availableSingingColors, analytics) {

    console.log('STRATEGY 1.1', 5);
    console.log('Params: handGroupedByColor', 1);
    console.log(handGroupedByColor);
    console.log('Params: triunfo', 1);
    console.log(triunfo);
    console.log('Params: availableSingingColors', 1);
    console.log(availableSingingColors);
    console.log('Params: analytics', 1);
    console.log(analytics);


    //#region OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing
    console.log('OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing', 2);

    console.log('Song count is ' + availableSingingColors.length, 1);

    var colorOfMostVulnerableSong = reasonerUtils.getColorOfMostVulnerableSong(handGroupedByColor, triunfo, availableSingingColors, analytics);
    if (colorOfMostVulnerableSong !== null) {

        console.log('The song in ' + colorOfMostVulnerableSong + ' is most vulnerable');

        //#region SUB OBJECTIVE 1.A: attempt to play the As triunfo
        console.log('SUB OBJECTIVE 1.A: attempt to play the As triunfo', 1);

        var asTriunfo = reasonerUtils.getAsTriunfo(handGroupedByColor, triunfo);
        if (asTriunfo !== null) {
            console.log('CLEAR');
            return asTriunfo;
        }
        else {
            console.log('player does not have the As in triunfo');
            console.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 1.B: playing the As of a color with at least 7 remaining cards
        console.log('SUB OBJECTIVE 1.B: playing the As of a color with at least 7 remaining cards', 1);

        var asOfColorWithAtLeast7RemainingCards = reasonerUtils.getAsOfColorWithAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
        if (asOfColorWithAtLeast7RemainingCards !== null) {
            console.log('CLEAR');
            return asOfColorWithAtLeast7RemainingCards;
        }
        else {
            console.log('player does not have a color with As and at least 7 remaining cards');
            console.log('MISS');
        }

        //#endregion

    }

    //#endregion


    //#region OBJECTIVE 2: help the teammate win the round if possible
    console.log('OBJECTIVE 2: help the teammate win the round if possible', 2);

    //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards
    console.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards', 1);

    var _7Or10OfColorWithNoAsAndAtLeast7RemainingCards = reasonerUtils.get7Or10OfColorWithNoAsAndAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
    if (_7Or10OfColorWithNoAsAndAtLeast7RemainingCards !== null) {
        console.log('CLEAR');
        return _7Or10OfColorWithNoAsAndAtLeast7RemainingCards;
    }
    else {
        console.log('player does not have a color without As, with a 7 or 10 and at least 7 remaining cards');
        console.log('MISS');
    }

    //#endregion

    //#endregion


    //#region OBJECTIVE 3: protect a vulnerable song if any
    console.log('OBJECTIVE 3: protect a vulnerable song if any', 2);

    //#region SUB OBJECTIVE 3.A: play the 7 or 6 of the same color of the vulnerable song
    console.log('SUB OBJECTIVE 3.A: play the 7 or 6 of the same color of the vulnerable song', 1);

    if (colorOfMostVulnerableSong !== null) {
        var _7Or6OfSongColor = reasonerUtils.get7Or6OfColor(handGroupedByColor, colorOfMostVulnerableSong);
        if (_7Or6OfSongColor !== null) {
            console.log('CLEAR');
            return _7Or6OfSongColor;
        }
        else {
            console.log('The player does not have the 7 nor 6 in the vulnerable song color: ' + colorOfMostVulnerableSong);
            console.log('MISS');
        }
    }
    else {
        console.log('The player does not have a vulnerable song');
        console.log('MISS');
    }

    //#endregion

    //#endregion


    //#region OBJECTIVE 4: protect a vulnerable 3 if any
    console.log('OBJECTIVE 4: protect a vulnerable 3 if any', 2);

    //#region SUB OBJECTIVE 4.A: play the weakest card in the sequence right below the 3
    console.log('SUB OBJECTIVE 4.A: play the weakest card in the sequence right below the 3', 1);

    var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
    if (colorsOfAllVulnerable3s.length > 0) {

        console.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

        var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, availableSingingColors, colorsOfAllVulnerable3s);
        if (protectionCard !== null) {
            console.log('CLEAR');
            return protectionCard;
        }
        else {
            console.log('Could not protect any vulnerable 3');
            console.log('MISS');
        }
    }
    else {
        console.log('The player does not have any 3 that is vulnerable');
        console.log('MISS');
    }

    //#endregion

    //#endregion


    //#region OBJECTIVE 5: play a vulnerable As if any
    console.log('OBJECTIVE 5: play a vulnerable As if any', 2);

    var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
    if (vulnerableAs !== null) {
        console.log('CLEAR');
        return vulnerableAs;
    }
    else {
        console.log('The player does not have any As that is vulnerable');
        console.log('MISS');
    }

    //#endregion


    //#region OBJECTIVE 6: try to make opponents lose the triunfo
    console.log('OBJECTIVE 6: try to make opponents lose the triunfo', 2);

    //#region SUB OBJECTIVE 6.A: attempt to exhaust the triunfo
    console.log('SUB OBJECTIVE 6.A: attempt to exhaust the triunfo', 1);

    if (reasonerUtils.canPlayerExhaustTriunfo(handGroupedByColor, triunfo)) {

        console.log('The player meets the requirements to exhaust the triunfo');

        var weakestWinningTriunfoCard = reasonerUtils.getWeakestWinningTriunfoCard(handGroupedByColor, triunfo, availableSingingColors, analytics);

        console.log('CLEAR');
        return weakestWinningTriunfoCard;
    }
    else {
        console.log('The player does not meet the requirements to exhaust the triunfo');
        console.log('MISS');
    }

    //#endregion


    //#region SUB OBJECTIVE 6.B: play the weakest card of the color with most cards but no As (exc triunfo)
    console.log('SUB OBJECTIVE 6.B: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

    var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, true);
    if (weakestCardOfColorWithMostCardsAndNoAs !== null) {
        console.log('CLEAR');
        return weakestCardOfColorWithMostCardsAndNoAs;
    }
    else {
        console.log('Somehow could not find the weakest card of color with most cards and no As!');
        console.log('MISS');
    }

    //#endregion


    //#region SUB OBJECTIVE 6.C: play the weakest card of all colors
    console.log('SUB OBJECTIVE 6.C: play the weakest card of all colors', 1);

    var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
    if (weakestCardOfAllColors !== null) {
        console.log('CLEAR');
        return weakestCardOfAllColors;
    }
    else {
        console.log('CLEAR');
        return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
    }

    //#endregion

    //#endregion


    console.log('ERROR: exhausted all objectives in strategy 1.1 and still could not find a card to play!');

}

    //#endregion



var card = strategy_1_1(handGroupedByColor, triunfo, availableSingingColors, analytics);
console.log(card);

//var colorOfMostVulnerableSong = reasonerUtils.getColorOfMostVulnerableSong(handGroupedByColor, triunfo, availableSingingColors, analytics);
//console.log(colorOfMostVulnerableSong);

//var validSingingColors = gameUtils.getValidSingingColors(hand, [this.triunfo]);
//console.log(validSingingColors);