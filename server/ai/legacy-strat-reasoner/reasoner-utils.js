var _ = require('underscore');
var config = require('../../../config');
var gameUtils = require('../../core/game-utils');


module.exports = {

    getSmartWeakestCardInSameColorCards: function (sameColorCards, avoidSingingCardsIfPossible) {

        var self = this;

        // Use a formula to discourage using singing cards
        var cardToPlay = _.min(sameColorCards, function (card) {
            var weight = gameUtils.getCardValue(card.n) * 10 + card.n;
            if ((card.n === 12 || card.n === 11) && avoidSingingCardsIfPossible) {
                weight += 1000;
            }
            return weight;
        });

        return cardToPlay;

    },



    getSmartMostPowerfulCardInSameColorCards: function (sameColorCards, avoidSingingCardsIfPossible) {

        if (sameColorCards.length === 1)
            return sameColorCards[0];


        var self = this;

        //console.log('utils.getMostPowerfulCard')
        //console.log(sameColorCards);
        //console.log(avoidSingingCardsIfPossible);

        // Use a formula to discourage using singing cards
        var cardToPlay = _.max(sameColorCards, function (card) {
            var weight = gameUtils.getCardValue(card.n) * 10 + card.n;
            if ((card.n === 12 || card.n === 11) && avoidSingingCardsIfPossible) {
                weight -= 1000;
            }
            return weight;
        });

        //console.log(cardToPlay);
        return cardToPlay;

    }

};