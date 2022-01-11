var _ = require('underscore');
var config = require('../../../config');
var gameUtils = require('../../core/game-utils');
var logUtils = require('../../utils/log-utils');


module.exports = {


    isSongOfColorVulnerable: function (handGroupedByColor, triunfo, songColor, analytics) {

        if (!_.has(handGroupedByColor, songColor)) {
            logUtils.log('The hand in question does not even have this color, let alone a song in it! Is this a joke?!');
            return false;
        }

        if (_.intersection(handGroupedByColor[songColor], [12, 11]).length !== 2) {
            logUtils.log('The hand in question does not have a song in the specified color! Is this a joke?!');
            return false;
        }

        if (handGroupedByColor[songColor].length <= 2) {
            // The song is vulnerable because the hand has only the 12 & 11 in the song color
            return true;
        }

        if (analytics.remainingCardsByColor[songColor].length > 0) {
            var myTopCardInSongColor = handGroupedByColor[songColor][0];
            var remainingTopCardInColor = analytics.remainingCardsByColor[songColor][0];

            if (gameUtils.getCardValue(myTopCardInSongColor) <= gameUtils.getCardValue(remainingTopCardInColor)) {
                return true;
            }
        }

        return false;
    },



    calculateSongVulnerability: function (handGroupedByColor, triunfo, songColor, analytics) {

        if (!_.has(handGroupedByColor, songColor)) {
            logUtils.log('The hand in question does not even have this color, let alone a song in it! Is this a joke?!');
            return -1;
        }

        if (_.intersection(handGroupedByColor[songColor], [12, 11]).length !== 2) {
            logUtils.log('The hand in question does not have a song in the specified color! Is this a joke?!');
            return -1;
        }

        if (handGroupedByColor[songColor].length <= 2) {
            // The song is vulnerable because the hand has only the 12 & 11 in the song color
            return 100;
        }

        if (analytics.remainingCardsByColor[songColor].length > 0) {
            var myTopCardInSongColor = handGroupedByColor[songColor][0];
            var remainingTopCardInColor = analytics.remainingCardsByColor[songColor][0];

            if (gameUtils.getCardValue(myTopCardInSongColor) <= gameUtils.getCardValue(remainingTopCardInColor)) {
                return 50;
            }
        }

        return 0;

    },



    getColorsOfAllVulnerable3s: function (handGroupedByColor, triunfo, excludeTriunfo, analytics) {
        var vulnerable3s = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (excludeTriunfo && color === triunfo) {
                return false;
            }
            return _.contains(handGroupedByColor[color], 3) && _.intersection(handGroupedByColor[color], [1, 12]).length === 0 && _.intersection(analytics.remainingCardsByColor[color], [1, 12]).length === 2;
        });
        return vulnerable3s;
    },



    getVulnerable3ProtectorCardNumber: function (handGroupedByColor, tresColor, excludeSongCards) {
        var targetCards = excludeSongCards ? [10, 7] : [12, 11, 10, 7];
        var intersection = _.intersection(handGroupedByColor[tresColor], targetCards);
        for (var i = 0; i < intersection.length; i++) {
            var nextCardNumberInSequence = intersection[i] !== 10 ? intersection[i] - 1 : 7;
            if (i < intersection.length - 1) {
                if (intersection[i + 1] !== nextCardNumberInSequence) {
                    return intersection[i];
                }
            }
            else {
                return intersection[i];
            }
        }
    },



    getColorsOfAllVulnerable1s: function (handGroupedByColor, triunfo, analytics) {
        var vulnerable1s = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (color === triunfo) {
                return false;
            }
            return _.contains(handGroupedByColor[color], 1) && analytics.remainingCardsByColor[color].length <= 4 && analytics.remainingCardsByColor[triunfo].length >= 1;
        });
        return vulnerable1s;
    },



    canPlayerExhaustTriunfo: function (handGroupedByColor, triunfo) {
        if (!_.has(handGroupedByColor, triunfo)) {
            return false;
        }

        if (handGroupedByColor[triunfo].length < 5) {
            return false;
        }

        var triunfoCardsValue = 0;
        for (var i = 0; i < handGroupedByColor[triunfo].length; i++) {
            triunfoCardsValue += gameUtils.getCardValue(handGroupedByColor[triunfo][i]);
        }
        if (triunfoCardsValue < 25) {
            return false;
        }


        var colorsWith1 = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (color === triunfo) {
                return false;
            }
            return _.contains(handGroupedByColor[color], 1);
        });

        var colorsWith3 = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (color === triunfo) {
                return false;
            }
            return _.contains(handGroupedByColor[color], 3);
        });

        if ((colorsWith1.length * 10) + colorsWith3.length < 11) { // A trick to see if less than an As & Tres
            return false;
        }


        return true;
    },



    canPlayerExhaustTriunfoLate: function (handGroupedByColor, triunfo, analytics) {
        if (!_.has(handGroupedByColor, triunfo)) {
            return false;
        }

        if (handGroupedByColor[triunfo].length <= analytics.remainingCardsByColor[triunfo].length) {
            return false;
        }

        if (gameUtils.card1IsStrongerThanCard2SameColor(analytics.remainingCardsByColor[triunfo][0], handGroupedByColor[triunfo][0])) {
            return false;
        }

        return true;
    },



    getColorOfMostVulnerableSong: function (handGroupedByColor, triunfo, availableSingingColors, analytics) {
        var mostVulnerableSongIndex = -1;
        var mostVulnerableSongVulnerability = 0;

        for (var i = 0; i < availableSingingColors.length; i++) {
            var songVulnerability = this.calculateSongVulnerability(handGroupedByColor, triunfo, availableSingingColors[i], analytics);
            if (songVulnerability > mostVulnerableSongVulnerability) {
                mostVulnerableSongVulnerability = songVulnerability;
                mostVulnerableSongIndex = i;
            }
        }

        return mostVulnerableSongIndex < 0 ? null : availableSingingColors[mostVulnerableSongIndex];
    },



    getAsTriunfo: function (handGroupedByColor, triunfo) {
        if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0 && handGroupedByColor[triunfo][0] === 1) {
            return { n: 1, c: triunfo };
        }
        else {
            return null;
        }
    },



    getAsOfColorWithAtLeast7RemainingCards: function (handGroupedByColor, triunfo, analytics) {
        var colorWithAsAnd7RemainingCards = _.find(Object.keys(handGroupedByColor), function (color) {
            if (color === triunfo) {
                return false;
            }
            return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] === 1 && analytics.remainingCardsByColor[color].length >= 7;
        });

        if (colorWithAsAnd7RemainingCards !== undefined) {
            return { n: 1, c: colorWithAsAnd7RemainingCards };
        }
        else {
            return null;
        }
    },



    get7Or10OfColorWithNoAsAndAtLeast7RemainingCards: function (handGroupedByColor, triunfo, analytics) {
        var colorWithoutAsWith7Or10And7RemainingCards = _.find(Object.keys(handGroupedByColor), function (color) {
            if (color === triunfo) {
                return false;
            }
            return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] !== 1 && analytics.remainingCardsByColor[color].length >= 7 && _.intersection(handGroupedByColor[color], [7, 10]).length > 0;
        });

        if (colorWithoutAsWith7Or10And7RemainingCards !== undefined) {
            var intersection = _.intersection(handGroupedByColor[colorWithoutAsWith7Or10And7RemainingCards], [7, 10]);
            return { n: intersection[0], c: colorWithoutAsWith7Or10And7RemainingCards };
        }
        else {
            return null;
        }
    },



    get7Or6OfColor: function (handGroupedByColor, color) {
        var intersection = _.intersection(handGroupedByColor[color], [7, 6]);
        if (intersection.length > 0) {
            return { n: intersection[0], c: color };
        }
        else {
            return null;
        }
    },



    attemptToProtectOneVulnerable3: function (handGroupedByColor, availableSingingColors, colorsOfAllVulnerable3s) {
        for (var i = 0; i < colorsOfAllVulnerable3s.length; i++) {
            var protectorCardNumber = this.getVulnerable3ProtectorCardNumber(handGroupedByColor, colorsOfAllVulnerable3s[i], _.contains(availableSingingColors, colorsOfAllVulnerable3s[i]));
            if (protectorCardNumber > 0) {
                return { n: protectorCardNumber, c: colorsOfAllVulnerable3s[i] };
            }
        }
        return null;
    },



    getVulnerableAs: function (handGroupedByColor, triunfo, analytics, color) {
        var colorsOfAllVulnerable1s = this.getColorsOfAllVulnerable1s(handGroupedByColor, triunfo, analytics);
        if (colorsOfAllVulnerable1s.length > 0) {
            logUtils.log('There are ' + colorsOfAllVulnerable1s.length + ' vulnerable As in the following colors:');
            logUtils.log(colorsOfAllVulnerable1s);
            if (color && colorsOfAllVulnerable1s.includes(color)) {
                return { n: 1, c: color };
            }
            else {
                return { n: 1, c: colorsOfAllVulnerable1s[0] };
            }            
        }
        else {
            return null;
        }
    },



    getWeakestWinningTriunfoCard: function (handGroupedByColor, triunfo, availableSingingColors, analytics) {
        // This function assumes that the player does have a winning triunfo card, it just retrieves the weakest winning
        var avoidSingingCards = availableSingingColors.includes(triunfo);
        var topRemainingTriunfoCard = analytics.remainingCardsByColor[triunfo].length > 0 ? analytics.remainingCardsByColor[triunfo][0] : -1;

        // Get the triunfo cards that are more powerful than the top remaining triunfo card
        var winningTriunfoCards = _.filter(handGroupedByColor[triunfo], function (number) {
            if (avoidSingingCards && (number === 12 || number === 11)) {
                return false;
            }
            if (topRemainingTriunfoCard == -1) {
                return true;
            }
            return gameUtils.card1IsStrongerThanCard2SameColor(number, topRemainingTriunfoCard);
        });

        if (winningTriunfoCards.length <= 0) {
            return null;
        }

        return { n: winningTriunfoCards[winningTriunfoCards.length - 1], c: triunfo };
    },



    getWeakestCardOfColorWithMostCardsAndNoAs: function (handGroupedByColor, triunfo, avoidSingingCards) {
        var colorsWithMostCardsAndNo1 = _.filter(Object.keys(handGroupedByColor), function (color) {
            return color !== triunfo && handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] !== 1;
        });

        if (colorsWithMostCardsAndNo1.length > 0) {

            var colorWithMostCardsAndNo1 = _.max(colorsWithMostCardsAndNo1, function (color) {
                var weakestCardIndex = handGroupedByColor[color].length - 1;
                var weakestCardNumber = handGroupedByColor[color][weakestCardIndex];

                var singingColorTax = 0;
                if (avoidSingingCards && (weakestCardNumber === 12 || weakestCardNumber === 11)) {
                    singingColorTax = 500;
                }

                var weight = handGroupedByColor[color].length * 1000 - (gameUtils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber + singingColorTax);
                return weight;
            });

            return { n: handGroupedByColor[colorWithMostCardsAndNo1][handGroupedByColor[colorWithMostCardsAndNo1].length - 1], c: colorWithMostCardsAndNo1 };
        }
        else {
            return null;
        }
    },



    get7Or10Triunfo: function (handGroupedByColor, triunfo) {
        if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {
            var intersectWith7Or10Triunfo = _.intersection(handGroupedByColor[triunfo], [7, 10]);
            if (intersectWith7Or10Triunfo.length > 0) {
                return { n: intersectWith7Or10Triunfo[0], c: triunfo };
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },



    getWeakestTriunfoCard: function (handGroupedByColor, triunfo) {
        if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {
            return { n: handGroupedByColor[triunfo][handGroupedByColor[triunfo].length - 1], c: triunfo };
        }
        else {
            return null;
        }
    },



    getAsOfColorWithAtLeast7RemainingCardsInc12And11: function (handGroupedByColor, triunfo, analytics) {
        var colorWithAsAnd7RemainingCards = _.find(Object.keys(handGroupedByColor), function (color) {
            if (color === triunfo) {
                return false;
            }
            return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] === 1 && analytics.remainingCardsByColor[color].length >= 7 && _.intersection(analytics.remainingCardsByColor[color], [12, 11]).length == 2;
        });

        if (colorWithAsAnd7RemainingCards !== undefined) {
            return { n: 1, c: colorWithAsAnd7RemainingCards };
        }
        else {
            return null;
        }
    },



    get10Or7OfColorWithout12And11: function (handGroupedByColor, triunfo, analytics) {
        var colorWithout12Nor11With10Or7 = _.find(Object.keys(handGroupedByColor), function (color) {
            if (handGroupedByColor[color].length <= 0) {
                return false;
            }
            if (_.intersection(handGroupedByColor[color], [12, 11]).length > 0) {
                return false;
            }
            if (_.intersection(handGroupedByColor[color], [10, 7]).length < 1) {
                return false;
            }
            if (analytics && _.intersection(analytics.remainingCardsByColor[color], [12, 11]).length < 2) {
                return false;
            }
            return true;
        });

        if (colorWithout12Nor11With10Or7 !== undefined) {
            var intersection = _.intersection(handGroupedByColor[colorWithout12Nor11With10Or7], [10, 7]);
            return { n: intersection[0], c: colorWithout12Nor11With10Or7 };
        }
        else {
            return null;
        }
    },



    getWeakestCardOfColorWithLeastCardsAndNoAs: function (handGroupedByColor, triunfo, avoidSingingCards) {
        var colorsWithLeastCardsAndNo1 = _.filter(Object.keys(handGroupedByColor), function (color) {
            return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] !== 1;
        });

        if (colorsWithLeastCardsAndNo1.length > 0) {

            var colorWithLeastCardsAndNo1 = _.min(colorsWithLeastCardsAndNo1, function (color) {
                var weakestCardIndex = handGroupedByColor[color].length - 1;
                var weakestCardNumber = handGroupedByColor[color][weakestCardIndex];

                var singingColorTax = 0;
                if (avoidSingingCards && (weakestCardNumber === 12 || weakestCardNumber === 11)) {
                    singingColorTax = 500;
                }

                var weight = handGroupedByColor[color].length * 1000 + (gameUtils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber + singingColorTax);
                return weight;
            });

            return { n: handGroupedByColor[colorWithLeastCardsAndNo1][handGroupedByColor[colorWithLeastCardsAndNo1].length - 1], c: colorWithLeastCardsAndNo1 };

        }
        else {
            return null;
        }
    },



    getWinningCardOfAnyColor: function (colors, handGroupedByColor, triunfo, analytics, availableSingingColors, remainingCardCount) {
        _.each(colors, function (color) {
            if (analytics.remainingCardsByColor[color].length >= remainingCardCount) {

                var topRemainingCardNumberInThisColor = analytics.remainingCardsByColor[color].length > 0 ? analytics.remainingCardsByColor[color][0] : -1;

                if (_.has(handGroupedByColor, color) && handGroupedByColor[color].length > 0) {
                    var winningCardNumbers = _.filter(handGroupedByColor[color], function (cardNumber) {
                        if (availableSingingColors.includes(color) && (cardNumber == 12 || cardNumber == 11)) {
                            return false;
                        }
                        if (topRemainingCardNumberInThisColor == -1) {
                            return true;
                        }
                        if (gameUtils.card1IsStrongerThanCard2(cardNumber, topRemainingCardNumberInThisColor)) {
                            return true;
                        }
                        return false;
                    });
                    if (winningCardNumbers.length > 0) {
                        return winningCardNumbers[winningCardNumbers.length - 1];
                    }
                }

                return null;
            }
        });

        return null;
    },



    get7Or10OfColorWith11Or12AndAtLeastXRemainingCards: function (handGroupedByColor, triunfo, analytics, remainingCardCount) {
        var compatibleColor = _.find(Object.keys(handGroupedByColor), function (color) {
            if (handGroupedByColor[color].length < 0) {
                return false;
            }
            if (analytics.remainingCardsByColor[color].length < remainingCardCount) {
                return false;
            }
            if (_.intersection(handGroupedByColor, [11, 12]).length <= 0) {
                return false;
            }
            if (_.intersection(handGroupedByColor, [7, 10]).length <= 0) {
                return false;
            }
            return true;
        });

        if (compatibleColor !== undefined) {
            return { n: _.intersection(handGroupedByColor[compatibleColor], [7, 10])[0], c: compatibleColor };
        }
        else {
            return null;
        }
    },



    get7Or10OfColorWithAtMostXRemainingCards: function (handGroupedByColor, triunfo, analytics, remainingCardCount) {
        var compatibleColor = _.find(Object.keys(handGroupedByColor), function (color) {
            if (handGroupedByColor[color].length < 0) {
                return false;
            }
            if (analytics.remainingCardsByColor[color].length > remainingCardCount) {
                return false;
            }
            if (_.intersection(handGroupedByColor, [7, 10]).length <= 0) {
                return false;
            }
            return true;
        });

        if (compatibleColor !== undefined) {
            return { n: _.intersection(handGroupedByColor[compatibleColor], [7, 10])[0], c: compatibleColor };
        }
        else {
            return null;
        }
    },



    getOppMissingColor: function (triunfo, analytics, excludeTriunfo) {
        var colors = ['o', 'c', 'b', 'e'];
        if (excludeTriunfo) {
            colors = _.without(colors, triunfo);
        }
        var missingColor = _.find(colors, function (color) {
            if (analytics.rightOppTopPossibleCardByColor[color] == 0 && analytics.leftOppTopPossibleCardByColor[color] == 0) {
                return true;
            }
            return false;
        });
        if (missingColor !== undefined) {
            return missingColor;
        }
        return null;
    },



    getWeakestCardOfColorBelowCard: function (handGroupedByColor, color, cardNumber) {
        if (!_.has(handGroupedByColor, color)) {
            return null;
        }
        if (handGroupedByColor[color].length <= 0) {
            return null;
        }
        var weakestCardNumber = handGroupedByColor[color][handGroupedByColor[color].length - 1];
        if (gameUtils.card1IsStrongerThanCard2SameColor(weakestCardNumber, cardNumber)) {
            return null;
        }
        return weakestCardNumber;
    },



    getCardBelow7OfColorOppDoNotHave: function (handGroupedByColor, triunfo, analytics, excludeTriunfo) {
        var colors = ['o', 'c', 'b', 'e'];
        if (excludeTriunfo) {
            colors = _.without(colors, triunfo);
        }
        var missingColor = _.find(colors, function (color) {
            if (analytics.rightOppTopPossibleCardByColor[color] > 0 || analytics.leftOppTopPossibleCardByColor[color] > 0) {
                return false;
            }
            if (!_.has(handGroupedByColor, color)) {
                return false;
            }
            if (handGroupedByColor[color].length <= 0) {
                return false;
            }
            var weakestCardNumber = handGroupedByColor[color][handGroupedByColor[color].length - 1];
            if (gameUtils.card1IsStrongerThanCard2SameColor(weakestCardNumber, 7)) {
                return false;
            }
            return true;
        });
        if (missingColor !== undefined) {
            return { n: handGroupedByColor[missingColor][handGroupedByColor[missingColor].length - 1], c: missingColor };
        }
        return null;
    },



    getTeammateMissingColor: function (triunfo, analytics, excludeTriunfo) {
        var colors = ['o', 'c', 'b', 'e'];
        if (excludeTriunfo) {
            colors = _.without(colors, triunfo);
        }
        var missingColor = _.find(colors, function (color) {
            if (analytics.teammateTopPossibleCardByColor[color] == 0) {
                return true;
            }
            return false;
        });
        if (missingColor !== undefined) {
            return missingColor;
        }
        return null;
    },



    getWeakestCardOfColorWithMostCards: function (handGroupedByColor, triunfo, avoidTriunfo, avoidSingingCards) {
        var colorsWithMostCards = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (avoidTriunfo && color === triunfo) {
                return false;
            }
            return handGroupedByColor[color].length > 0;
        });

        if (colorsWithMostCards.length > 0) {

            var colorWithMostCards = _.max(colorsWithMostCards, function (color) {
                var weakestCardIndex = handGroupedByColor[color].length - 1;
                var weakestCardNumber = handGroupedByColor[color][weakestCardIndex];

                var singingColorTax = 0;
                if (avoidSingingCards && (weakestCardNumber === 12 || weakestCardNumber === 11)) {
                    singingColorTax = 500;
                }

                var weight = handGroupedByColor[color].length * 1000 - (gameUtils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber + singingColorTax);
                return weight;
            });

            return { n: handGroupedByColor[colorWithMostCards][handGroupedByColor[colorWithMostCards].length - 1], c: colorWithMostCards };
        }
        else {
            return null;
        }
    },



    getTopCardOfColorWithAtLeastXRemainingCardsInc12And11: function (handGroupedByColor, triunfo, analytics, avoidTriunfo, remainingCardCount) {
        var colors = ['o', 'c', 'b', 'e'];
        if (avoidTriunfo) {
            colors = _.without(colors, triunfo);
        }
        var possibleSongColors = _.filter(colors, function (color) {
            if (analytics.remainingCardsByColor[color] < Math.max(remainingCardCount, 1)) {
                return false;
            }
            if (!_.has(handGroupedByColor, color)) {
                return false;
            }
            if (handGroupedByColor[color].length <= 0) {
                return false;
            }
            if (_.intersection(analytics.remainingCardsByColor[color], [12, 11]).length < 2) {
                return false;
            }
            if (gameUtils.card1IsStrongerThanCard2SameColor(analytics.remainingCardsByColor[color][0], handGroupedByColor[color][0])) {
                return false;
            }
            return true;
        });

        if (possibleSongColors.length > 0) {
            var targetSongColor = possibleSongColors[0];
            return { n: handGroupedByColor[targetSongColor][0], c: targetSongColor };
        }
        else {
            return null;
        }
    },



    get7Or10OfColorWithMostRemainingCards: function (handGroupedByColor, triunfo, analytics, minRemainingCardCount) {
        var colorsWith7Or10 = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (!_.has(handGroupedByColor, color)) {
                return false;
            }
            if (handGroupedByColor[color].length <= 0) {
                return false;
            }
            if (analytics.remainingCardsByColor[color].length < Math.max(minRemainingCardCount, 1)) {
                return false;
            }
            if (_.intersection(handGroupedByColor[color], [7, 10]).length <= 0) {
                return false;
            }            
            return true;
        });

        if (colorsWith7Or10.length > 0) {
            var bestColorWith7Or10 = _.max(colorsWith7Or10, function (color) {
                return analytics.remainingCardsByColor[color].length;
            });

            var intersection = _.intersection(handGroupedByColor[bestColorWith7Or10], [7, 10]);
            return { n: intersection[0], c: bestColorWith7Or10 };
        }
        else {
            return null;
        }
    },



    getWeakestCardOfColorWithMostRemainingCardsAndNoTopCard: function (handGroupedByColor, triunfo, analytics, minRemainingCardCount) {
        var suitableColors = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (!_.has(handGroupedByColor, color)) {
                return false;
            }
            if (handGroupedByColor[color].length <= 0) {
                return false;
            }
            if (analytics.remainingCardsByColor[color].length < Math.max(minRemainingCardCount, 1)) {
                return false;
            }
            if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0])) {
                return false; // The player must not have the top color of this color since he wants his teammate to win the round with it
            }
            return true;
        });

        if (suitableColors.length > 0) {
            var bestColor = _.max(suitableColors, function (color) {
                var numberOfWeakestCardInColor = handGroupedByColor[color][handGroupedByColor[color].length - 1];
                return analytics.remainingCardsByColor[color].length * 1000 - gameUtils.getCardValue(numberOfWeakestCardInColor) * 10 - numberOfWeakestCardInColor;
            });

            return { n: handGroupedByColor[bestColor][handGroupedByColor[bestColor].length - 1], c: bestColor };
        }
        else {
            return null;
        }
    },



    getWeakestCardOfColorWithLeastRemainingCardsAndNoTopCard: function(handGroupedByColor, triunfo, analytics) {
        var suitableColors = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (!_.has(handGroupedByColor, color)) {
                return false;
            }
            if (handGroupedByColor[color].length <= 0) {
                return false;
            }
            if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0])) {
                return false; // The player must not have the top card of this color since he wants his teammate to win the round with it
            }
            return true;
        });

        if (suitableColors.length > 0) {
            var bestColor = _.min(suitableColors, function (color) {
                var numberOfWeakestCardInColor = handGroupedByColor[color][handGroupedByColor[color].length - 1];
                return analytics.remainingCardsByColor[color].length * 1000 + gameUtils.getCardValue(numberOfWeakestCardInColor) * 10 + numberOfWeakestCardInColor;
            });

            return { n: handGroupedByColor[bestColor][handGroupedByColor[bestColor].length - 1], c: bestColor };
        }
        else {
            return null;
        }
    },



    getWeakestPossibleCardOfColor: function (handGroupedByColor, color, minimumCardNumber, avoidSingingCards) {
        if (!_.has(handGroupedByColor, color)) {
            return null;
        }
        if (handGroupedByColor[color].length <= 0) {
            return null;
        }
        if (minimumCardNumber === 0) {
            return { n: handGroupedByColor[color][handGroupedByColor[color].length - 1], c: color };
        }

        var morePowerfulCards = _.filter(handGroupedByColor[color], function (number) {
            return gameUtils.card1IsStrongerThanCard2SameColor(number, minimumCardNumber);
        });
        //console.log(morePowerfulCards);
        if (morePowerfulCards.length > 0) {
            var cardNumber = _.min(handGroupedByColor[color], function (number) {
                var singingColorTax = 0;
                if (avoidSingingCards && (number === 12 || number === 11)) {
                    singingColorTax = number === 12 ? 750 : 500;
                }
                var weight = gameUtils.getCardValue(number) * 1000 + number + singingColorTax;
                return weight * -1;
            });
            return { n: cardNumber, c: color };
        }
        else {
            return { n: handGroupedByColor[color][handGroupedByColor[color].length - 1], c: color };
        }        
    },



    getWeakestCardOfAllColors: function (handGroupedByColor, triunfo, excludeTriunfo) {
        var suitableColors = _.filter(Object.keys(handGroupedByColor), function (color) {
            if (excludeTriunfo && color === triunfo) {
                return false;
            }
            return handGroupedByColor[color].length > 0;
        });
        
        if (suitableColors.length > 0) {
            var colorWithWeakestCard = _.min(suitableColors, function (color) {
                var weakestCardNumber = handGroupedByColor[color][handGroupedByColor[color].length - 1];
                var weight = gameUtils.getCardValue(weakestCardNumber) * 1000 + weakestCardNumber;
                return weight;
            });
            return { n: handGroupedByColor[colorWithWeakestCard][handGroupedByColor[colorWithWeakestCard].length - 1], c: colorWithWeakestCard };
        }
        else {
            return null;
        }
    },



    canTeamWithPlayer2ndToPlayWinRound: function (handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard) {
        
    },



    willMyTeamMostLikelyWinThisRound: function (handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, isTeammateLeadingRound) {

        //#region The player is the last to play (the teammate is second to play)

        if (tableCards.length === 3) {            

            if (isTeammateLeadingRound) {

                // Since the teammate is already leading the round, we have won this round
                return true;

            }
            else {

                if (tableCards[0].c === triunfo) {

                    // We will win if I have a more powerful triunfo card than the currently most powerful
                    return _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0 && gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n);

                }
                else {

                    if (mostPowerfulCard.c === triunfo) {

                        // The lead card was not triunfo but at least the left opponent fired and has the most powerful card

                        if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                            // Since I have cards in the lead card color that I'm forced to play, the left opp triunfo card will win
                            return false;

                        }
                        else {

                            // I don't have any card in the lead card color. We'll win the round if I have triunfo and my triunfo card overpowers the left opp's one
                            return _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0 && gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n);

                        }

                    }
                    else {

                        // The lead card and the most powerful card are not triunfo and the teammate is not leading the round

                        if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                            // Since I have cards in the lead color, we win if I have more powerful cards and we lose otherwise
                            return gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], mostPowerfulCard.n);

                        }
                        else {

                            // Since I don't have any cards in the lead color, we win if I have triunfo, we lose otherwise
                            return _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0;

                        }
                    }
                }
            }
        }

        //#endregion

        //#region The player is the third to play (the teammate is first to play)

        else if (tableCards.length === 2) {

            if (tableCards[0].c === triunfo) {

                if (
                    (
                        isTeammateLeadingRound
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            (
                                analytics.rightOppTopPossibleCardByColor[triunfo] > 0
                                &&
                                gameUtils.card1IsStrongerThanCard2SameColor(mostPowerfulCard.n, analytics.rightOppTopPossibleCardByColor[triunfo])
                            )
                        )                    
                    )
                    ||
                    (
                        (
                            _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)
                        )
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                        )
                    )
                ) {

                    // We win the round if my teammate has the most powerful triunfo card or I do
                    return true;

                }                

                return false;

            }
            else {

                if (mostPowerfulCard.c === triunfo) {

                    // The lead card was not triunfo and the left opponent fired and has the most powerful card

                    if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                        // Since I have cards in the lead card color that I'm forced to play, we lose
                        return false;

                    }
                    else {

                        // I don't have any card in the lead card color. We'll win the round if I have triunfo and my triunfo card overpowers the left opp's one and the right opponent's

                        if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                            if (gameUtils.card1IsStrongerThanCard2SameColor(mostPowerfulCard.n, handGroupedByColor[triunfo][0])) {
                                return false;
                            }

                            if (
                                analytics.rightOppTopPossibleCardByColor[triunfo] > 0
                                &&
                                gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[triunfo], handGroupedByColor[triunfo][0])
                            ) {
                                return false;
                            }

                            return true;

                        }
                        else {

                            // The left opp fired and I don't have any triunfo, we lose
                            return false;

                        }

                    }

                }
                else {

                    if (
                        (
                            isTeammateLeadingRound
                            &&
                            (
                                (
                                    analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                                    &&
                                    gameUtils.card1IsStrongerThanCard2SameColor(mostPowerfulCard.n, analytics.rightOppTopPossibleCardByColor[tableCards[0].c])
                                )
                                ||
                                (
                                    analytics.rightOppTopPossibleCardByColor[tableCards[0].c] === 0
                                    &&
                                    analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                                )
                            )
                        )
                        ||
                        (
                            _.has(handGroupedByColor, tableCards[0].c)
                            &&
                            handGroupedByColor[tableCards[0].c].length > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], mostPowerfulCard.n)
                            &&
                            analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], analytics.rightOppTopPossibleCardByColor[tableCards[0].c])
                        )
                        ||
                        (
                            (!_.has(handGroupedByColor, tableCards[0].c) || handGroupedByColor[tableCards[0].c].length <= 0)
                            &&
                            _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0
                            &&
                            (
                                analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                                ||
                                gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                            )
                        )
                    ) {

                        return true;

                    }

                    return false;

                }

            }

        }

        //#endregion

        //#region The player is the second to play

        else {

            if (tableCards[0].c === triunfo) {

                if (
                    (
                        _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0
                        &&
                        gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                        )
                    )
                    ||
                    (
                        analytics.teammateTopPossibleCardByColor[triunfo] > 0
                        &&
                        gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[triunfo], mostPowerfulCard.n)
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[triunfo], analytics.rightOppTopPossibleCardByColor[triunfo])
                        )
                    )
                    
                ) {

                    return true;

                }

                return false;

            }
            else {

                if (
                    (
                        _.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0
                        &&
                        gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], tableCards[0].n)
                        &&
                        (
                            (
                                analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                                &&
                                gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], analytics.rightOppTopPossibleCardByColor[tableCards[0].c])
                            )
                            ||
                            (
                                analytics.rightOppTopPossibleCardByColor[tableCards[0].c] === 0
                                &&
                                analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            )
                        )
                    )
                    ||
                    (
                        (!_.has(handGroupedByColor, tableCards[0].c) || handGroupedByColor[tableCards[0].c].length <= 0)
                        &&
                        _.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                            ||
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                        )
                    )
                    ||
                    (
                        analytics.teammateTopPossibleCardByColor[tableCards[0].c] > 0
                        &&
                        gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[tableCards[0].c], tableCards[0].n)
                        &&
                        (
                            (
                                analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                                &&
                                gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[tableCards[0].c], analytics.rightOppTopPossibleCardByColor[tableCards[0].c])
                            )
                            ||
                            (
                                analytics.rightOppTopPossibleCardByColor[tableCards[0].c] === 0
                                &&
                                analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            )
                        )
                    )
                    ||
                    (
                        analytics.teammateTopPossibleCardByColor[tableCards[0].c] === 0
                        &&
                        analytics.teammateTopPossibleCardByColor[triunfo] > 0
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                            ||
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[tableCards[0].c], analytics.rightOppTopPossibleCardByColor[triunfo])
                        )
                    )
                ) {

                    return true;

                }

                return false;

            }

        }

        //#endregion

    },



    getSuspectedFutureSingingColors: function (winningBidAmount, triunfo, previousSongs, analytics) {

        var availableColors = ['o', 'b', 'c', 'e'];
        var remainingSingingAmount = 0;

        var alreadySangAmount = 0;
        if (previousSongs.length > 0) {
            alreadySangAmount = _.reduce(previousSongs, function (memo, song) { return memo + song.amount; });
        }


        // Add previously sang colors as impossible cards to sing in the future
        var impossibleColorsToSingIn = _.map(previousSongs, function (song) { return song.color; });


        // Add impossible colors to sing in based on the previous sang amount
        if (winningBidAmount >= 110) {
            remainingSingingAmount = 100 - alreadySangAmount;
        }
        else if (winningBidAmount >= 100) {
            remainingSingingAmount = 40 - alreadySangAmount;
            if (remainingSingingAmount < 40 && remainingSingingAmount > 0) {
                impossibleColorsToSingIn.push(triunfo);
            }
        }
        else if (winningBidAmount >= 90) {
            remainingSingingAmount = 20 - alreadySangAmount;
            impossibleColorsToSingIn.push(triunfo);
        }
        else {
            remainingSingingAmount = 0;
        }


        // Add impossible colors to sing in based on analytics
        _.each(Object.keys(analytics.remainingCardsByColor), function (color) {
            if (_.intersection(analytics.remainingCardsByColor[color], [12, 11]).length < 2) {
                impossibleColorsToSingIn.push(color);
            }
        });



        return remainingSingingAmount > 0 ? _.difference(availableColors, impossibleColorsToSingIn) : [];
        
    },



    getSuitableSongBreakingAsFromColors: function (handGroupedByColor, analytics, suspectedSingingColors) {
        var suitableSongBreakingAsColor = _.find(Object.keys(handGroupedByColor), function (color) {
            return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] === 1 && analytics.remainingCardsByColor[color].length >= 7 && _.contains(suspectedSingingColors, color);
        });

        if (suitableSongBreakingAsColor !== undefined) {
            return { n: 1, c: suitableSongBreakingAsColor };
        }
        else {
            return null;
        }
    },



    getSuitableSongBreaking10Or7FromColors: function (handGroupedByColor, analytics, suspectedSingingColors) {
        var suitableSongBreakingColor = _.find(Object.keys(handGroupedByColor), function (color) {
            return _.intersection(handGroupedByColor[color], [10, 7]).length > 0 && _.contains(suspectedSingingColors, color);
        });

        if (suitableSongBreakingColor !== undefined) {
            var intersection = _.intersection(handGroupedByColor[suitableSongBreakingColor], [10, 7]);
            return { n: intersection[0], c: suitableSongBreakingColor };
        }
        else {
            return null;
        }
    }


};