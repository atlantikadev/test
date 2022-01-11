var _ = require('underscore');
var config = require('../../config');


// This module containes the functions that concern game rules only. Any strategy related functions should be added to the utils file associated with their reasoner
module.exports = {
	
	getValidCardsToPlay: function(player_cards, table_cards, triunfo) {

		if(table_cards.length <= 0) {
	        return player_cards;
	    }

	    var most_powerful_card = this.getMostPowerfulCard(table_cards, triunfo);	    
	    if(most_powerful_card.c === triunfo) {

	    	// We need to know if the first player used triunfo or if someone did fire
	        if(table_cards[0].c === triunfo) {

	        	// The first player in the round used triunfo so take the most powerful card as a reference and try to play one more powerful with the same color
	        	var stronger_cards_of_same_color = this.getStrongerCardsOfSameColor(player_cards, most_powerful_card);
	        	if(stronger_cards_of_same_color.length > 0) {
	        		return stronger_cards_of_same_color;
	        	}
	        	else {

	        		// Attempt to get cards of the same of color even if they are weaker
	        		var cards_of_same_color = this.getCardsOfColor(player_cards, triunfo);
	        		if(cards_of_same_color.length > 0) {
	        			return cards_of_same_color;
	        		}
	        		else {

	        			// The next step would be return cards of triunfo color but since we already didn't find those in the previous step, any card would do now
	        			return player_cards;
	        		}
	        	}

	        }
	        else {

	        	// The first player didn't use triunfo so someone fired, we need to follow up to the first played card without having to play a more powerful card
	            var cards_of_same_color = this.getCardsOfColor(player_cards, table_cards[0].c);
	            if (cards_of_same_color.length > 0) {
	                return cards_of_same_color;
	            }
	            else {

					// We need to play triunfo cards that are more powerful than the current most powerful triunfo card
					var stronger_triunfo_cards = this.getStrongerCardsOfSameColor(player_cards, most_powerful_card);
					if(stronger_triunfo_cards.length > 0) {
						return stronger_triunfo_cards;
					}
					else {

						// Since we don't have more powerful triunfo cards, any triunfo card will do
						var cards_of_triunfo_color = this.getCardsOfColor(player_cards, triunfo);
						if(cards_of_triunfo_color.length > 0) {
							return cards_of_triunfo_color;
						} 
						else {
							// No triunfo so any card will do now
							return player_cards;
						}
					}
	            }
	        }
	    }
	    else {
	        
	        // We need to try and play a card of the same color as the most powerful card but stronger
	    	var stronger_cards_of_same_color = this.getStrongerCardsOfSameColor(player_cards, most_powerful_card);
        	if(stronger_cards_of_same_color.length > 0) {
        		return stronger_cards_of_same_color;
        	}
	        else {

	        	// We don't have any stronger card of the same color so any card of the same color will do
	        	var cards_of_same_color = this.getCardsOfColor(player_cards, most_powerful_card.c);
        		if(cards_of_same_color.length > 0) {
        			return cards_of_same_color;
        		}
        		else {

					// Since we don't have any cards with same color, we need to find cards of triunfo color
	            	var cards_of_triunfo_color = this.getCardsOfColor(player_cards, triunfo);
	            	if(cards_of_triunfo_color.length > 0) {
	            		return cards_of_triunfo_color;
	            	} 
	            	else {

	            		// Any card will do now
	            		return player_cards;
	            	}
        		}
	        }
	    }
	},



	getMostPowerfulCard: function(cards, triunfo) {

		var most_powerful_card = null;

	    if (cards.length > 0) {
	        most_powerful_card = cards[0];
	        for (var i = 1; i < cards.length; i++) {
	            if (this.card1IsStrongerThanCard2(cards[i], most_powerful_card, false, triunfo)) {
	                most_powerful_card = cards[i];
	            }
	        }
	    }

	    return most_powerful_card;

	},



	card1IsStrongerThanCard2: function(card1, card2, card1_precedes_card2, triunfo) {

		if (card1.c === card2.c) {
	        var card1Value = this.getCardValue(card1.n);
	        var card2Value = this.getCardValue(card2.n);
	        if (card1Value != card2Value) {
	            //console.log("card(" + card1.number + "," + card1.color + ") has a greater value than card(" + card2.number + "," + card2.color + ")");
	            return card1Value > card2Value;
	        }
	        else {
	            //console.log("card(" + card1.number + "," + card1.color + ") has a greater number than card(" + card2.number + "," + card2.color + ")");
	            return card1.n > card2.n;
	        }
	    }
	    else {
	        if (card1.c === triunfo) {
	            //console.log("card(" + card1.number + "," + card1.color + ") is stronger because it is triunfo");
	            return true;
	        }
	        else if (card2.c === triunfo) {
	            //console.log("card(" + card2.number + "," + card2.color + ") is stronger because it is triunfo");
	            return false;
	        }
	        else {
	            //console.log("Cards are of different colors and none is triunfo. " + (card1_precedes_card2 ? "card(" + card1.number + "," + card1.color + ") is stronger" : "card(" + card2.number + "," + card2.color + ") is stronger"));
	            return card1_precedes_card2;
	        }
	    }

	},



	card1IsStrongerThanCard2SameColor: function(cardNumber1, cardNumber2) {

		var card1Value = this.getCardValue(cardNumber1);
        var card2Value = this.getCardValue(cardNumber2);

        if (card1Value != card2Value) {
            return card1Value > card2Value;
        }
        else {
            return cardNumber1 > cardNumber2;
        }

	},



	getCardValue: function(card_number) {
		switch (card_number) {
	        case 1:
	            return 11;

	        case 3:
	            return 10;

	        case 12:
	            return 4;

	        case 11:
	            return 3;

	        case 10:
	            return 2;

	        default:
	            return 0;
	    }
	},



	getStrongerCardsOfSameColor: function(cards, card) {

		var stronger_cards_with_same_color = [];

	    for (var i = 0; i < cards.length; i++) {
	        if (cards[i].c === card.c) {
	            if(this.card1IsStrongerThanCard2(cards[i], card, false)) {
	                stronger_cards_with_same_color.push(cards[i]);
	            }
	        }
	    }

	    return stronger_cards_with_same_color;

	},



	getCardsOfColor:  function(cards, color) {

		var cards_with_same_color = [];

	    for (var i = 0; i < cards.length; i++) {
	        if (cards[i].c === color) {
	            cards_with_same_color.push(cards[i]);
	        }
	    }

	    return cards_with_same_color;

	},



	getValidSingingColors: function(cards, excluded_colors) {
		var valid_colors = [];
		var rey_cards = _.filter(cards, function(card) { return card.n === 12; });
		for(var i = 0; i < rey_cards.length; i++) {
			var coresponding_caballo = _.find(cards, function(card) { return card.n === 11 && card.c === rey_cards[i].c; });
			if (typeof coresponding_caballo != 'undefined' && !excluded_colors.includes(rey_cards[i].c)) {
				valid_colors.push(rey_cards[i].c);
			}
		}
		return valid_colors;
	},



	getHandComplementGroupedByColor: function(hand) {

		var handComplementGroupedByColor = { 'o': [], 'b': [], 'c': [], 'e': [] };

		var numbers = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];
		var colors = ['o', 'b', 'c', 'e'];


		// Group by color
		var handGroupedByColor = _.groupBy(hand, function(card) { return card.c; });

		// Simplify by keeping only numbers for each color
		for(var color in handGroupedByColor) {
			handGroupedByColor[color] = _.map(handGroupedByColor[color], function(card) { return card.n; });
		}


		// Create the complement of the hand
		for(var i = 0; i < colors.length; i++) {
			var color = colors[i];
			for(var j = 0; j < numbers.length; j++) {
				var number = numbers[j];
				if(_.has(handGroupedByColor, color)) {
					if(!handGroupedByColor[color].includes(number)) {
						handComplementGroupedByColor[color].push(number);
					}
				}
				else {
					handComplementGroupedByColor[color].push(number);
				}
			}
		}


		return handComplementGroupedByColor;

    },



    getHandComplement: function (hand, plays) {

        var handComplement = [];

        var numbers = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];
        var colors = ['o', 'b', 'c', 'e'];

        var excludedCards = [];
        if (plays && plays.length > 0) {
            excludedCards = _.map(plays, function (play) { return play.card; });
        }

        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            for (var j = 0; j < numbers.length; j++) {
                var number = numbers[j];
                if (
                    _.findIndex(hand, function (card) { return card.c === color && card.n === number; }) < 0
                    &&
                    _.findIndex(excludedCards, function (card) { return card.c === color && card.n === number; }) < 0
                ) {
                    handComplement.push({ n: number, c: color });
                }
            }
        }

        return handComplement;

    },



    buildDeck: function (shuffle) {

        var deck = [];

        var numbers = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];
        var colors = ['o', 'b', 'c', 'e'];

        for (var i = 0; i < colors.length; i++) {
            for (var j = 0; j < numbers.length; j++) {
                deck.push({ n: numbers[j], c: colors[i] });
            }
        }

        if (shuffle) {
            deck = _.shuffle(deck);
        }

        return deck;

    },



    getComplementaryCardsByValue: function (hand, minValue, maxValue, shuffle) {
        var self = this;
        var deck = this.buildDeck(true);
        var complementaryCards = _.filter(deck, function (deckCard) {
            var cardValue = self.getCardValue(deckCard.n);
            if (cardValue < minValue || cardValue > maxValue) {
                return false;
            }
            if (_.findIndex(hand, function (handCard) { return handCard.n === deckCard.n && handCard.c === deckCard.c; }) >= 0) {
                return false;
            }
            return true;
        });

        if (complementaryCards.length > 0 && shuffle) {
            complementaryCards = _.shuffle(complementaryCards);
        }

        return complementaryCards;

    },



	getRandomIntBetween: function(min, max) { // min and max inclusive
		return Math.floor(Math.random() * (max - min + 1)) + min;
    },



    groupHandByColorAndSimplify: function (hand) {

        var self = this;

        // Group by color
        var handGroupedByColor = _.groupBy(hand, function (card) { return card.c; });

        // Simplify by keeping only numbers for each color
        for (var color in handGroupedByColor) {

            // Keep numbers only for each card
            handGroupedByColor[color] = _.map(handGroupedByColor[color], function (card) { return card.n; });

            // Order by value
            handGroupedByColor[color] = _.sortBy(handGroupedByColor[color], function (num) { return -100 * self.getCardValue(num) - num; });

        }

        return handGroupedByColor;

    }
    

};