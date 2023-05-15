var _ = require('underscore');
var config = require('../../../config');
var gameUtils = require('../../core/game-utils');
var reasonerUtils = require('./reasoner-utils');



function LegacyStrategyReasoner(aiPlayer) {
	
	this.aiPlayer = aiPlayer;


	this.canBid170 = function(handGroupedByColor, triunfo, enableLogging) {

		// The player can bid 170 if he has:
		// all cards in triunfo color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 170: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 10 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 10) {
			if(enableLogging) console.log('Cannot bid 170: some of the cards are not in triunfo');
			return false;
		}
		
		return true;
	}


	this.canBid140 = function(handGroupedByColor, triunfo, enableLogging) {

		// The player can bid 140 if he has:
		// 1, 3, 12 & 11 in triunfo color AND
		// 1, 3 in a regular color
		// another 1, 3 in a regular color
		// 12 & 11 in a regular color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 140: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 4 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 4) {
			if(enableLogging) console.log('Cannot bid 140: hand has less than 4 cards of triunfo');
			return false;
		}

		// If the cards required in triunfo aren't there, no need to check the other cards
		if(_.intersection(handGroupedByColor[triunfo], [1, 3, 12, 11]).length < 4) {
			if(enableLogging) console.log('Cannot bid 140: hand does not have the 1, 3, 12 and 11 triunfo');
			return false;
		}

		// Check if there are 2 other couples of As & Tres in the remaining colors as well as 1 other song
		var regularAsTresCoupleCount = 0;
		var regularSongCount = 0;

		for(var color in handGroupedByColor) {
			if(color !== triunfo) {
				if(_.intersection(handGroupedByColor[color], [1, 3]).length == 2) {
					regularAsTresCoupleCount++;
				}
				if(_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
					regularSongCount++;
				}
			}
		}

		if(regularAsTresCoupleCount < 2) {
			if(enableLogging) console.log('Cannot bid 140: hand does not have 2 more couples of 1 and 3. It has ' + (regularAsTresCoupleCount <= 0 ? 'none' : regularAsTresCoupleCount));
			return false;
		}

		if(regularSongCount < 1) {
			if(enableLogging) console.log('Cannot bid 140: hand does not have another song in a regular color');
			return false;
		}


		return true;

	}


	this.canBid130 = function(handGroupedByColor, triunfo, enableLogging) {

		// The player can bid 130 if he has:
		// 1, 3, 12 & 11 in triunfo color AND
		// 1, 3 in a regular color
		// another 1 in a regular color
		// 12 & 11 in a regular color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 130: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 4 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 4) {
			if(enableLogging) console.log('Cannot bid 130: hand has less than 4 cards of triunfo');
			return false;
		}

		// If the cards required in triunfo aren't there, no need to check the other cards
		if(_.intersection(handGroupedByColor[triunfo], [1, 3, 12, 11]).length < 4) {
			if(enableLogging) console.log('Cannot bid 130: hand does not have the 1, 3, 12 and 11 triunfo');
			return false;
		}

		// Check if there are 1 other couple of As & Tres in the remaining colors, another 1 as well as 1 other song
		var regularAsTresCoupleCount = 0;
		var regularAsCount = 0;
		var regularSongCount = 0;

		for(var color in handGroupedByColor) {
			if(color !== triunfo) {

				if(_.contains(handGroupedByColor[color], 1)) {
					regularAsCount++;
				}

				if(_.intersection(handGroupedByColor[color], [1, 3]).length == 2) {
					regularAsTresCoupleCount++;
				}

				if(_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
					regularSongCount++;
				}
			}
		}

		if(regularAsTresCoupleCount < 1) {
			if(enableLogging) console.log('Cannot bid 130: hand does not have 1 more couple of 1 and 3. It has none');
			return false;
		}

		if(regularSongCount < 1) {
			if(enableLogging) console.log('Cannot bid 130: hand does not have another song in a regular color');
			return false;
		}

		if(regularAsCount < 2) {
			if(enableLogging) console.log('Cannot bid 130: hand does not have another As in a regular color');
			return false;
		}


		return true;

	}


	this.canBid120 = function(handGroupedByColor, triunfo, enableLogging) {

		// The player can bid 120 if he has:
		// what it takes to bid 80 AND
		// has 2 songs where one is in triunfo

		// If the player doesn't have what it takes to bid 80, no need to go further
		if(!this.canBid80(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 120: hand lacks requirements for a bid of 80');
			return false;
		}

		// If the player doesn't have a song in triunfo, no need to continue
		if(_.intersection(handGroupedByColor[triunfo], [12, 11]).length < 2) {
			if(enableLogging) console.log('Cannot bid 120: hand does not have a song in triunfo');
			return false;
		}

		// Check if there is at least one song in a regular color
		var regularSongCount = 0;

		for(var color in handGroupedByColor) {
			if(color !== triunfo) {

				if(_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
					regularSongCount++;
				}
			}
		}

		if(regularSongCount < 1) {
			if(enableLogging) console.log('Cannot bid 120: hand does not have a song in a regular color');
			return false;
		}


		return true;

	}


	this.canBid110 = function(handGroupedByColor, triunfo, enableLogging) {
		
		// The player can bid 110 if he can bid 100 and has an additional song in a regular color
		if(!this.canBid100(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 110: hand lacks requirements for a bid of 100');
			return false;
		}

		// Check if there is at least one song in a regular color
		var regularSongCount = 0;

		for(var color in handGroupedByColor) {
			if(color !== triunfo) {

				if(_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
					regularSongCount++;
				}
			}
		}

		if(regularSongCount < 1) {
			if(enableLogging) console.log('Cannot bid 110: hand does not have an additional song in a regular color');
			return false;
		}


		return true;

	}


	this.canBid100 = function(handGroupedByColor, triunfo, enableLogging) {

		// The player can bid 100 if he has what it takes to bid 70 in addition to a song in triunfo
		if(!this.canBid70(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 100: hand lacks requirements for a bid of 70');
			return false;
		}

		// Make sure we have a song in triunfo
		if(_.intersection(handGroupedByColor[triunfo], [12, 11]).length < 2) {
			if(enableLogging) console.log('Cannot bid 100: hand does not have a song in triunfo');
			return false;
		}

		return true;

	}


	this.canBid90 = function(handGroupedByColor, triunfo, enableLogging) {
		
		// The player can bid 90 in 2 cases: he satisfies a hand worth of 80 plus he also has:
		// either: 2 triunfo cards that are 12, 11 or 10 (on top of the As & Tres) as well as a Tres in the same color as the regular As
		// or: a song in a regular color 

		// If the player cannot bid 80
		if(!this.canBid80(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 90: hand lacks requirements for a bid of 80');
			return false;
		}

		// Check if there is at least one song in a regular color
		var regularSongCount = 0;

		for(var color in handGroupedByColor) {
			if(color !== triunfo) {

				if(_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
					regularSongCount++;
				}
			}
		}

		if(regularSongCount < 1) {
			
			// There's no song in a regular color, check if we have 2 triunfo colors that are 10 or better as well as one As & Tres couple
			if(_.intersection(handGroupedByColor[triunfo], [12, 11, 10]).length < 2) {
				if(enableLogging) console.log('Cannot bid 90: besides the required 1 and 3, the other triunfo cards have no value');
				return false;
			}

			// We have 2 good cards in triunfo now make sure we have a couple of As & Tres
			var regularAsTresCoupleCount = 0;

			for(var color in handGroupedByColor) {
				if(color !== triunfo) {
					if(_.intersection(handGroupedByColor[color], [1, 3]).length == 2) {
						regularAsTresCoupleCount++;
					}
				}
			}

			if(regularAsTresCoupleCount < 1) {
				if(enableLogging) console.log('Cannot bid 90: hand does not have a regular couple of 1 and 3');
				return false;
			}

		}


		return true;

	}


	this.canBid80 = function(handGroupedByColor, triunfo, enableLogging) {
		
		// The player can bid 80 if he has:
		// 1, 3 and 2 other random cards in triunfo color AND
		// another 1 in a regular color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!this.canBid70(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 80: hand lacks requirements for a bid of 70');
			return false;
		}

		// Check if there is one other As in another color
		var regularAsCount = 0;

		for(var color in handGroupedByColor) {
			if(color !== triunfo) {

				if(_.contains(handGroupedByColor[color], 1)) {
					regularAsCount++;
				}
			}
		}

		if(regularAsCount < 1) {
			if(enableLogging) console.log('Cannot bid 80: hand does not have another As in a regular color');
			return false;
		}


		return true;

	}


	this.canBid70 = function(handGroupedByColor, triunfo, enableLogging) {
		
		// The player can bid 70 if he has:
		// 1, 3 and 2 other random cards in triunfo

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			if(enableLogging) console.log('Cannot bid 70: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 4 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 4) {
			if(enableLogging) console.log('Cannot bid 70: hand has less than 4 cards of triunfo');
			return false;
		}

		// If the cards required in triunfo aren't there, no need to check the other cards
		if(_.intersection(handGroupedByColor[triunfo], [1, 3]).length < 2) {
			if(enableLogging) console.log('Cannot bid 70: hand does not have the 1 and 3 in triunfo');
			return false;
		}


		return true;

	}








	this.flattenHandGroupedByColor = function(handGroupedByColor) {
		return _.chain(Object.keys(handGroupedByColor))
					.map(function (color) {
						return _.map(handGroupedByColor[color], function (number) {
							return {n: number, c: color};
						});
					})
					.flatten()
					.value();
	}



	this.getWeakestCardOfColorWithMostCards = function(handGroupedByColor, targetColors, singingColorsToAvoid) {

		// Ungroup hand to faciliate sorting cards
		var hand = this.flattenHandGroupedByColor(handGroupedByColor);

		// Sort the cards based on a formula that discourages using singing cards unless required
		var cardToPlay = _.chain(hand)
							.filter(function (card) { return targetColors.includes(card.c); })
							.max(hand, function (card) {				
								var weight = handGroupedByColor[card.c].length * 1000 - (gameUtils.getCardValue(card.n) * 10 + card.n);
								if((card.n === 12 || card.n === 11) && Array.isArray(singingColorsToAvoid) && singingColorsToAvoid.includes(card.c)) {
									weight -= 100;
								}
								return weight;
							})
							.value();

		return cardToPlay;

	}



	this.getWeakestCardOfColorWithLeastCards = function(handGroupedByColor, targetColors, singingColorsToAvoid) {

		// Ungroup hand to faciliate sorting cards
		var hand = this.flattenHandGroupedByColor(handGroupedByColor);

		// Sort the cards based on a formula that discourages using singing cards unless required
		var cardToPlay = _.chain(hand)
							.filter(function (card) { return targetColors.includes(card.c); })
							.min(hand, function (card) {				
								var weight = handGroupedByColor[card.c].length * 1000 + (gameUtils.getCardValue(card.n) * 10 + card.n);
								if((card.n === 12 || card.n === 11) && Array.isArray(singingColorsToAvoid) && singingColorsToAvoid.includes(card.c)) {
									weight += 100;
								}
								return weight;
							})
							.value();

		return cardToPlay;

	}



	this.getTopCardOfColorWithMostCards = function(handGroupedByColor, targetColors, singingColorsToAvoid) {

		// Ungroup hand to faciliate sorting cards
		var hand = this.flattenHandGroupedByColor(handGroupedByColor);

		// Sort the cards based on a formula that discourages using singing cards unless required
		var cardToPlay = _.chain(hand)
							.filter(function (card) { return targetColors.includes(card.c); })
							.max(hand, function (card) {				
								var weight = handGroupedByColor[card.c].length * 1000 + (gameUtils.getCardValue(card.n) * 10 + card.n);
								if((card.n === 12 || card.n === 11) && Array.isArray(singingColorsToAvoid) && singingColorsToAvoid.includes(card.c)) {
									weight -= 100;
								}
								return weight;
							})
							.value();

		return cardToPlay;

	}



	this.getTopCardOfColorWithLeastCards = function(handGroupedByColor, targetColors, singingColorsToAvoid) {

		// Ungroup hand to faciliate sorting cards
		var hand = this.flattenHandGroupedByColor(handGroupedByColor);

		// Sort the cards based on a formula that discourages using singing cards unless required
		var cardToPlay = _.chain(hand)
							.filter(function (card) { return targetColors.includes(card.c); })
							.min(hand, function (card) {				
								var weight = handGroupedByColor[card.c].length * 1000 - (gameUtils.getCardValue(card.n) * 10 + card.n);
								if((card.n === 12 || card.n === 11) && Array.isArray(singingColorsToAvoid) && singingColorsToAvoid.includes(card.c)) {
									weight += 100;
								}
								return weight;
							})
							.value();

		return cardToPlay;

	}



	this.getMostPowerfulCardInColors = function(handGroupedByColor, targetColors, singingColorsToAvoid) {

		// Ungroup hand to faciliate sorting cards
		var hand = this.flattenHandGroupedByColor(handGroupedByColor);

		// Keep only cards of the required colors then use a formula to discourage using singing cards
		var cardToPlay = _.chain(hand)
							.filter(function (card) { return targetColors.includes(card.c); })
							.max(function (card) {
								var weight = gameUtils.getCardValue(card.n) * 10 + card.n;
								if((card.n === 12 || card.n === 11) && Array.isArray(singingColorsToAvoid) && singingColorsToAvoid.includes(card.c)) {
									weight -= 1000;
								}
								return weight;
							})
							.value();

		return cardToPlay;

	}



	this.getWeakestCardInColors = function(handGroupedByColor, targetColors, singingColorsToAvoid) {

		// Ungroup hand to faciliate sorting cards
		var hand = this.flattenHandGroupedByColor(handGroupedByColor);

		// Keep only cards of the required colors then use a formula to discourage using singing cards
		var cardToPlay = _.chain(hand)
							.filter(function (card) { return targetColors.includes(card.c); })
							.min(function (card) {
								var weight = gameUtils.getCardValue(card.n) * 10 + card.n;
								if((card.n === 12 || card.n === 11) && Array.isArray(singingColorsToAvoid) && singingColorsToAvoid.includes(card.c)) {
									weight += 1000;
								}
								return weight;
							})
							.value();

		return cardToPlay;

	}



	this.getSafestTriunfoCardToPlay = function (handGroupedByColor, triunfo, tableCards, mostPowerfulCard, analytics, availableSingingColors) {
		
		if(config.platform.enableLogging) {
			//console.log('');
			console.log('');
			console.log('---->');
			console.log('getSafestTriunfoCardToPlay');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: tableCards');
			console.log(tableCards);
			console.log('');
			console.log('params: mostPowerfulCard');
			console.log(mostPowerfulCard);
			console.log('');
			console.log('params: analytics');
			console.log(analytics);
			console.log('');
			console.log('params: availableSingingColors');
			console.log(availableSingingColors);
			console.log('');
		}

		// Get all triunfo cards the player has
		var triunfoCards = _.map(handGroupedByColor[triunfo], function(cardNumber) { return {n: cardNumber, c: triunfo}; });
		if(config.platform.enableLogging) {
			console.log('triunfoCards');
			console.log(triunfoCards);
			console.log('');
		}

		// Do we have to avoid playing 12 and 11 in triunfo
		var avoidSingingCards = availableSingingColors.includes(triunfo);
		if(config.platform.enableLogging) {
			console.log('avoidSingingCards');
			console.log(avoidSingingCards);
			console.log('');
		}


		// Get all the triunfo cards that are more powerful than the most powerful table card
		var morePowerfulCards = _.filter(triunfoCards, function (card) { return gameUtils.card1IsStrongerThanCard2(card, mostPowerfulCard, false, triunfo); });
		if(config.platform.enableLogging) {
			console.log('morePowerfulCards');
			console.log(morePowerfulCards);
			console.log('');
		}


		if(morePowerfulCards.length > 0) {

			// The player has more powerful cards than the most powerful card
			if(tableCards.length === 3) {

				// The player is the last to play, only play the least more powerful card
				var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(morePowerfulCards, avoidSingingCards);

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('getSafestTriunfoCardToPlay exit 1');
					console.log('<----');
					console.log('');
					console.log('');
				}

				return cardToPlay;

			}
			else {

				// The right opp will play after this player
				if(analytics.rightOppTopPossibleCardByColor[triunfo] === 0) {

					// The right opp doesn't have any triunfo left so play the least more powerful card
					var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(morePowerfulCards, avoidSingingCards);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('getSafestTriunfoCardToPlay exit 2');
						console.log('<----');
						console.log('');
						console.log('');
					}

					return cardToPlay;

				}
				else {

					// The right opp has triunfo. Get all triunfo cards that are more powerful than his possible top triunfo card
					var morePowerfulCardsThanRightOpp = _.filter(morePowerfulCards, function (card) { 
															return gameUtils.card1IsStrongerThanCard2SameColor(card.n, analytics.rightOppTopPossibleCardByColor[triunfo]);
														});

					if(morePowerfulCardsThanRightOpp.length > 0) {

						// Play the least powerful card from those
						var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(morePowerfulCardsThanRightOpp, avoidSingingCards);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('getSafestTriunfoCardToPlay exit 3');
							console.log('<----');
							console.log('');
							console.log('');
						}

						return cardToPlay;

					}
					else {

						// The right opp might have more powerful triunfo cards. Play the weakest triunfo card
						var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(triunfoCards, avoidSingingCards);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('getSafestTriunfoCardToPlay exit 4');
							console.log('<----');
							console.log('');
							console.log('');
						}

						return cardToPlay;

					}

				}

			}

		}
		else {

			// Play the weakest triunfo card
			var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(triunfoCards, avoidSingingCards);

			if(config.platform.enableLogging) {
				console.log('cardToPlay');
				console.log(cardToPlay);
				console.log('getSafestTriunfoCardToPlay exit 5');
				console.log('<----');
				console.log('');
				console.log('');
			}

			return cardToPlay;

		}

	}







	
	// This is the first play in the game. The player is the buyer. Singing is possible.
	this.strategy_1_1 = function(handGroupedByColor, triunfo, availableSingingColors) {

		if(config.platform.enableLogging) {
			console.log('strategy 1_1');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: availableSingingColors');
			console.log(availableSingingColors);
			console.log('');
		}

		// Get all colors with an As
		var colorsWithAs = [];
		for(var color in handGroupedByColor) {
			if(handGroupedByColor[color][0] === 1) {
				colorsWithAs.push(color);
			}
		}

		if(config.platform.enableLogging) {
			console.log('colorsWithAs');
			console.log(colorsWithAs);
			console.log('');						
		}


		// Do we have any As
		if(colorsWithAs.length > 0) {

			// Do we have an As in triunfo
			if(colorsWithAs.includes(triunfo)) {

				// We have an As in triunfo, play it
				var cardToPlay = {n: 1, c: triunfo};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 1_1 exit 1');						
				}

				return cardToPlay;

			}
			else {

				// We have one or more As but no triunfo, so play the As of the color with least number of cards (to avoid triunfo firing)
				var colorWithLeastCardsAndAs = _.min(colorsWithAs, function (color) { 
					return handGroupedByColor[color].length; 
				});

				if(config.platform.enableLogging) {
					console.log('colorWithLeastCardsAndAs');
					console.log(colorWithLeastCardsAndAs);
					console.log('');						
				}


				var cardToPlay = {n: 1, c: colorWithLeastCardsAndAs};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 1_1 exit 2');						
				}

				return cardToPlay;

			}

		}
		else {

			// No As, so take the color with the least number of cards and play the weakest
			var cardToPlay = this.getWeakestCardOfColorWithLeastCards(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

			if(config.platform.enableLogging) {
				console.log('cardToPlay');
				console.log(cardToPlay);
				console.log('strategy 1_1 exit 3');						
			}

			return cardToPlay;

		}

	}
	



	
	// This is the first play in the game. The player is the teammate of the buyer. Singing may or may not be possible.
	this.strategy_1_2 = function(handGroupedByColor, triunfo, analytics, availableSingingColors) {

		if(config.platform.enableLogging) {
			console.log('strategy 1_2');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: availableSingingColors');
			console.log(availableSingingColors);
			console.log('');
		}

		// Does the player have a song coming up?
		if(availableSingingColors.length > 0) {

			// Does the player (teammate of the buyer) have the As in triunfo?
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0 && handGroupedByColor[triunfo][0] === 1) {

				// Play the As triunfo to garantee winning round 1 in order to sing
				var cardToPlay = {n: 1, c: triunfo};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 1_2 exit 1');						
				}

				return cardToPlay;

			}
			else {

				// Select the colors with an As and more than 6 remaining cards (to avoid triunfo)
				var safeColorsInc1 = _.chain(Object.keys(handGroupedByColor))
										.filter(function(color) { 
											return handGroupedByColor[color].length > 0 && 
												   handGroupedByColor[color][0] === 1 &&
												   analytics.remainingCardsByColor[color].length >= 6;
										})
										.sortBy(function(color) { return -1 * analytics.remainingCardsByColor[color].length; })
										.value();

				if(config.platform.enableLogging) {
					console.log('safeColorsInc1');
					console.log(safeColorsInc1);
					console.log('');						
				}

				if(safeColorsInc1.length > 0) {

					// Play the safest As card
					var cardToPlay = {n: 1, c: safeColorsInc1[0]};

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 1_2 exit 2');						
					}

					return cardToPlay;

				}
				else {

					// There is no immediate safe card to play that would win the current round
					// Select all colors with 3 and no As
					var colorsWithTresAndNoAs = _.filter(Object.keys(handGroupedByColor), function (color) { 
													return handGroupedByColor[color].length > 1 &&
														   handGroupedByColor[color][0] === 3 &&
														   !availableSingingColors.includes(color);
												});

					if(config.platform.enableLogging) {
						console.log('colorsWithTresAndNoAs');
						console.log(colorsWithTresAndNoAs);
						console.log('');						
					}

					if(colorsWithTresAndNoAs.length > 0) {

						// Select the color with most number of cards and play the card just below the Tres so the opp plays the As making the Tres the most powerful remaining card
						var colorWithMostCards = _.max(colorsWithTresAndNoAs, function (color) { return handGroupedByColor[color].length; });

						if(config.platform.enableLogging) {
							console.log('colorWithMostCards');
							console.log(colorWithMostCards);
							console.log('');						
						}


						var cardToPlay = {n: handGroupedByColor[colorWithMostCards][1], c: colorWithMostCards};

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 1_2 exit 3');						
						}

						return cardToPlay;

					}
					else {

						// Take the color with the least number of cards and play the weakest
						var cardToPlay = this.getWeakestCardOfColorWithLeastCards(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 1_2 exit 4');						
						}

						return cardToPlay;

					}

				}

			}

		}
		else {

			// No songs, so take the color with the least number of cards and play the weakest
			var cardToPlay = this.getWeakestCardOfColorWithLeastCards(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

			if(config.platform.enableLogging) {
				console.log('cardToPlay');
				console.log(cardToPlay);
				console.log('strategy 1_2 exit 5');						
			}

			return cardToPlay;

		}

	}
	




	// This is the first play in the game. The player is the buyer. Singing is not possible.
	this.strategy_2 = function(handGroupedByColor, triunfo) {

		if(config.platform.enableLogging) {
			console.log('strategy 2');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
		}

		// Does the player have at least 5 colors in triunfo including an As
		if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length >= 5 && handGroupedByColor[triunfo][0] === 1) {
			
			// Play the As triunfo
			var cardToPlay = {n: 1, c: triunfo};

			if(config.platform.enableLogging) {
				console.log('cardToPlay');
				console.log(cardToPlay);
				console.log('strategy 2 exit 1');						
			}

			return cardToPlay;

		}
		else {

			// Select all colors with 3 and no As and at least 2 cards
			var colorsWithTresAndNoAs = _.filter(Object.keys(handGroupedByColor), function (color) {
											return handGroupedByColor[color].length > 1 && handGroupedByColor[color][0] === 3;
										});

			if(config.platform.enableLogging) {
				console.log('colorsWithTresAndNoAs');
				console.log(colorsWithTresAndNoAs);
				console.log('');						
			}

			if(colorsWithTresAndNoAs.length > 0) {

				// Select the color with most number of cards and play the card just below the Tres
				var colorWithMostCards = _.max(colorsWithTresAndNoAs, function (color) { return handGroupedByColor[color].length; });

				if(config.platform.enableLogging) {
					console.log('colorWithMostCards');
					console.log(colorWithMostCards);
					console.log('');						
				}


				var cardToPlay = {n: handGroupedByColor[colorWithMostCards][1], c: colorWithMostCards};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 2 exit 2');						
				}

				return cardToPlay;

			}
			else {

				// Select all colors that have an As that isn't in triunfo
				var colorsWithAsNotTriunfo = _.filter(Object.keys(handGroupedByColor), function (color) { 
												return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] === 1 && color !== triunfo;
											});

				if(config.platform.enableLogging) {
					console.log('colorsWithAsNotTriunfo');
					console.log(colorsWithAsNotTriunfo);
					console.log('');						
				}

				if(colorsWithAsNotTriunfo.length > 0) {

					// Play the As of the color that has the least number of cards
					var colorWithLeastCards = _.min(colorsWithAsNotTriunfo, function (color) { return handGroupedByColor[color].length; });

					if(config.platform.enableLogging) {
						console.log('colorWithLeastCards');
						console.log(colorWithLeastCards);
						console.log('');						
					}


					var cardToPlay = {n: 1, c: colorWithLeastCards};

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 2 exit 3');						
					}

					return cardToPlay;

				}
				else {

					// Select the color with the most cards and play the weakest
					var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, Object.keys(handGroupedByColor));

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 2 exit 4');						
					}

					return cardToPlay;

				}

			}

		}

	}





	// This is the first play in the game. The player is not in the buying team. Singing is possible.
	this.strategy_3 = function(handGroupedByColor, triunfo, maxTeammateBid) {

		if(config.platform.enableLogging) {
			console.log('strategy 3');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: maxTeammateBid');
			console.log(maxTeammateBid);
			console.log('');
		}

		// Select the colors that are not triunfo and have no 11 or 12 (the player will try to break the song!)
		var colorsNotTriunfoExc12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 			
			return color !== triunfo &&
				   handGroupedByColor[color].length > 0 &&
				   !handGroupedByColor[color].includes(12) &&
				   !handGroupedByColor[color].includes(11);
		});

		if(config.platform.enableLogging) {
			console.log('colorsNotTriunfoExc12And11');
			console.log(colorsNotTriunfoExc12And11);
			console.log('');						
		}

		if(colorsNotTriunfoExc12And11.length > 0) {

			// Select the colors among them that have an As
			var colorsNotTriunfoExc12And11Inc1 = _.filter(colorsNotTriunfoExc12And11, function (color) { return handGroupedByColor[color][0] === 1; });

			if(config.platform.enableLogging) {
				console.log('colorsNotTriunfoExc12And11Inc1');
				console.log(colorsNotTriunfoExc12And11Inc1);
				console.log('');						
			}


			if(colorsNotTriunfoExc12And11Inc1.length > 0) {

				// Play the As from a color that is suspected to be sang in
				var cardToPlay = {n: 1, c: colorsNotTriunfoExc12And11Inc1[0]};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 3 exit 1');						
				}

				return cardToPlay;

			}
			else {

				// Select the colors among them that have a Tres
				var colorsNotTriunfoExc12And11Inc3 = _.filter(colorsNotTriunfoExc12And11, function (color) { 
					return handGroupedByColor[color][0] === 3 && handGroupedByColor[color].length > 1; 
				});

				if(config.platform.enableLogging) {
					console.log('colorsNotTriunfoExc12And11Inc3');
					console.log(colorsNotTriunfoExc12And11Inc3);
					console.log('');						
				}


				if(colorsNotTriunfoExc12And11Inc3.length > 0) {

					// Play the card that is just below the Tres (to force them to play the 12 or 11)
					var color = colorsNotTriunfoExc12And11Inc3[0];
					var cardToPlay = {n: handGroupedByColor[color][1], c: color};

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 3 exit 2');						
					}

					return cardToPlay;

				}
				else {

					// Select the color with the most powerful card and play that card
					var cardToPlay = this.getMostPowerfulCardInColors(handGroupedByColor, Object.keys(handGroupedByColor));

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 3 exit 3');						
					}

					return cardToPlay;

				}

			}

		}
		else {

			// All colors have either 12, 11 or both, which means that no song is possible. We should fall back to strategy 4
			return this.strategy_4(handGroupedByColor, triunfo, maxTeammateBid);

		}		

	}





	// This is the first play in the game. The player is not in the buying team. Singing is not possible.
	this.strategy_4 = function(handGroupedByColor, triunfo, maxTeammateBid) {

		if(config.platform.enableLogging) {
			console.log('strategy 4');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: maxTeammateBid');
			console.log(maxTeammateBid);
			console.log('');
		}

		// Select colors that have no As nor Tres
		var colorsExc1And3 = _.filter(Object.keys(handGroupedByColor), function (color) { 
			return handGroupedByColor[color].length > 0 &&
				   !handGroupedByColor[color].includes(1) &&
				   !handGroupedByColor[color].includes(3);
		});

		if(config.platform.enableLogging) {
			console.log('colorsExc1And3');
			console.log(colorsExc1And3);
			console.log('');						
		}


		if(colorsExc1And3.length > 0) {

			// Did the teammate participate in bidding.
			if(maxTeammateBid !== null && maxTeammateBid.amount > 0) {

				// Select the color that has the highest card and play that card
				var cardToPlay = this.getMostPowerfulCardInColors(handGroupedByColor, colorsExc1And3);

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 4 exit 1');						
				}

				return cardToPlay;

			}
			else {

				// Select the color with the most cards and play the weakest
				var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, colorsExc1And3);

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 4 exit 2');						
				}

				return cardToPlay;

			}

		}
		else {

			// Select the colors that have a Tres without As
			var colorsExc1Inc3 = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 2 &&
					   handGroupedByColor[color][0] === 3;
			});

			if(config.platform.enableLogging) {
				console.log('colorsExc1Inc3');
				console.log(colorsExc1Inc3);
				console.log('');						
			}

			if(colorsExc1Inc3.length > 0) {

				// Play the card that comes after the Tres in order to protect the Tres
				var color = colorsExc1Inc3[0];
				var cardToPlay = {n: handGroupedByColor[color][1], c: color};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 4 exit 3');						
				}

				return cardToPlay;

			}
			else {

				// Select the color that has an As and the least number of cards
				var colorInc1LeastCards = _.chain(Object.keys(handGroupedByColor))
					.filter(function (color) { return handGroupedByColor[color][0] === 1; })
					.min(function (color) { return handGroupedByColor[color].length; })
					.value();

				if(config.platform.enableLogging) {
					console.log('colorInc1LeastCards');
					console.log(colorInc1LeastCards);
					console.log('');						
				}


				var cardToPlay = {n: 1, c: colorInc1LeastCards};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 4 exit 4');						
				}

				return cardToPlay;

			}

		}

	}





	// This is not the first play in the game. This is the first play in the round. The player is in the buying team. Singing is possible.
	this.strategy_5 = function(handGroupedByColor, triunfo, analytics, availableSingingColors) {

		if(config.platform.enableLogging) {
			console.log('strategy 5');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: analytics');
			console.log(analytics);
			console.log('');
			console.log('params: availableSingingColors');
			console.log(availableSingingColors);
			console.log('');
		}

		// The player has a song so he needs to win the current round at all costs
		// Check to see if there are any triunfo cards left
		if(analytics.remainingCardsByColor[triunfo].length > 0) {

			// Check to see if the player has triunfo too
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

				// The player does have triunfo. Is it more powerful than the top remaning card
				if(gameUtils.getCardValue(handGroupedByColor[triunfo][0]) > gameUtils.getCardValue(analytics.remainingCardsByColor[triunfo][0])) {

					// Play the top triunfo card, garanteed to win you the round
					var cardToPlay = {n: handGroupedByColor[triunfo][0], c: triunfo};

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 5 exit 1');						
					}

					return cardToPlay;

				}
				else {

					// Sadly, the top triunfo card the player has isn't the most powerful around
					// Find the colors in the hand of the player that have the top card with at least 3 remaining cards (to avoid triunfo)
					var topSafeColors = _.filter(Object.keys(handGroupedByColor), function (color) { 
						return handGroupedByColor[color].length > 0 &&
							   analytics.remainingCardsByColor[color].length > 2 && 
							   gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0]);
					});

					if(config.platform.enableLogging) {
						console.log('topSafeColors');
						console.log(topSafeColors);
						console.log('');						
					}

					if(topSafeColors.length > 0) {

						// Get the color with the least number of cards and play the top card
						var cardToPlay = this.getTopCardOfColorWithLeastCards(handGroupedByColor, topSafeColors, availableSingingColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 5 exit 2');						
						}

						return cardToPlay;

					}
					else {

						// There are no safe colors to play. Find the colors that at least one opponent doesn't have
						var colorsOppDontHave = _.filter(Object.keys(handGroupedByColor), function (color) { 
							return handGroupedByColor[color].length > 0 &&
								    (
								   		analytics.rightOppTopPossibleCardByColor[color] === 0 || 
								   		analytics.leftOppTopPossibleCardByColor[color] === 0
								   	);
						});

						if(colorsOppDontHave.length > 0) {

							// Play the weakest card from these colors
							var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, colorsOppDontHave, availableSingingColors);

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 5 exit 3');						
							}

							return cardToPlay;

						}
						else {

							// There are no colors opponents don't have at the moment.
							// Play the weakest card from the color that has the most cards excluding triunfo
							var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, _.without(Object.keys(handGroupedByColor), triunfo), availableSingingColors);

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 5 exit 4');						
							}

							return cardToPlay;

						}

					}

				}

			}
			else {

				// Triunfo remains but the player doesn't have any
				// Play the weakest card from the color that has the most cards
				var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 5 exit 5');						
				}

				return cardToPlay;

			}

		}
		else {

			// There are no triunfo cards remaining for other players. Check to see if the player has triunfo
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

				// The player has triunfo, play the weakest triunfo card, it's guaranteed to win
				var cardToPlay = {n: handGroupedByColor[triunfo][handGroupedByColor[triunfo].length - 1], c: triunfo};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 5 exit 6');						
				}

				return cardToPlay;

			}
			else {

				// The player doesn't have triunfo either. Find colors with top cards
				var colorsWithTopCards = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 &&
						(
							analytics.remainingCardsByColor[color].length <= 0 ||
							(
								analytics.remainingCardsByColor[color].length > 0 &&
								gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0])
							)
						);
					});

				if(config.platform.enableLogging) {
					console.log('colorsWithTopCards');
					console.log(colorsWithTopCards);
					console.log('');						
				}

				if(colorsWithTopCards.length > 0) {

					// Find the color with most cards and play the top card
					var cardToPlay = this.getTopCardOfColorWithMostCards(handGroupedByColor, colorsWithTopCards, availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 5 exit 7');						
					}

					return cardToPlay;

				}
				else {

					// Play the weakest card from the color that has the most cards excluding triunfo
					var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, _.without(Object.keys(handGroupedByColor), triunfo), availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 5 exit 8');						
					}

					return cardToPlay;

				}

			}

		}

	}





	// This is not the first play in the game. This is the first play in the round. The player is in the buying team. Singing is not possible.
	this.strategy_6 = function(handGroupedByColor, triunfo, analytics) {

		if(config.platform.enableLogging) {
			console.log('strategy 6');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: analytics');
			console.log(analytics);
			console.log('');
		}

		// Check to see if there are any triunfo cards left
		if(analytics.remainingCardsByColor[triunfo].length > 0) {

			// Find colors with top cards
			var colorsWithTopCards = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 0 &&
					(
						analytics.remainingCardsByColor[color].length <= 0 ||
						(
							analytics.remainingCardsByColor[color].length > 0 &&
							gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0])
						)
					);
				});

			if(config.platform.enableLogging) {
				console.log('colorsWithTopCards');
				console.log(colorsWithTopCards);
				console.log('');
			}


			// Check to see if the player has more triunfo cards than remaining as well as has at least one color with a top card
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > analytics.remainingCardsByColor[triunfo].length && colorsWithTopCards.length > 0) {

				var targetColorWithTopCard = colorsWithTopCards[0];

				// Play a top card  // highest triunfo card (not sure why!)
				var cardToPlay = {n: handGroupedByColor[targetColorWithTopCard][0], c: targetColorWithTopCard};  //{n: handGroupedByColor[triunfo][0], c: triunfo};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 6 exit 1');						
				}

				return cardToPlay;

			}
			else {

				// Find the colors that one of the opponents do not have
				var colorsOppDontHave = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 && 
						(
							analytics.rightOppTopPossibleCardByColor[color] === 0 ||
							analytics.leftOppTopPossibleCardByColor[color] === 0
						);
				});

				if(config.platform.enableLogging) {
					console.log('colorsOppDontHave');
					console.log(colorsOppDontHave);
					console.log('');
				}

				// Find the weakest card among these colors
				var weakestCardOfColorOppDontOwn = null;
				if(colorsOppDontHave.length > 0) {

					weakestCardOfColorOppDontOwn = this.getWeakestCardInColors(handGroupedByColor, colorsOppDontHave);

				}



				if(weakestCardOfColorOppDontOwn !== null && gameUtils.getCardValue(weakestCardOfColorOppDontOwn.n) < 10) {

					// If the weakest card isn't As or Tres, play it as it will probably be lost in favor of making the opp lose a triunfo card
					var cardToPlay = weakestCardOfColorOppDontOwn;

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 6 exit 2');						
					}

					return cardToPlay;

				}
				else {

					// The weakest card of colors the opp don't own was an As or Tres we cannot sacrifice so
					// Find any hand colors that do not have an As or Tres even though are still available
					var colorsExc1And3 = _.filter(Object.keys(handGroupedByColor), function (color) {
						return handGroupedByColor[color].length > 0 &&
							color !== triunfo &&
							!handGroupedByColor[color].includes(1) && 
							!handGroupedByColor[color].includes(3); }
					);

					if(config.platform.enableLogging) {
						console.log('colorsExc1And3');
						console.log(colorsExc1And3);
						console.log('');
					}


					if(colorsExc1And3.length > 0) {

						// Find the color with most cards and play the weakest to force the opp to use triunfo or play As & Tres.
						var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, colorsExc1And3);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 6 exit 3');						
						}

						return cardToPlay;

					}
					else {

						// Attempt to find safe colors that will help you win an owned As or Tres
						var safeColorsInc1Or3 = _.filter(Object.keys(handGroupedByColor), function (color) {
							return handGroupedByColor[color].length > 0 &&
								analytics.remainingCardsByColor[color].length > 2 &&
								(
									handGroupedByColor[color].includes(1) ||
									(
										handGroupedByColor[color].includes(3) &&
										gameUtils.card1IsStrongerThanCard2SameColor(3, analytics.remainingCardsByColor[color][0])
									)
								);
						});

						if(config.platform.enableLogging) {
							console.log('safeColorsInc1Or3');
							console.log(safeColorsInc1Or3);
							console.log('');
						}


						if(safeColorsInc1Or3.length > 0) {

							// Get the color with the least number of cards and play the top card
							var cardToPlay = this.getTopCardOfColorWithLeastCards(handGroupedByColor, safeColorsInc1Or3);

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 6 exit 4');						
							}

							return cardToPlay;

						}
						else {

							// Play the weakest card from the color that has the most cards
							var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, Object.keys(handGroupedByColor));

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 6 exit 5');						
							}

							return cardToPlay;

						}

					}

				}

			}

		}
		else {

			// The opponents cannot possibly have triunfo. Does the player have triunfo?
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

				// Find the colors that have top colors
				var topColorsExcTriunfo = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return color !== triunfo &&
							handGroupedByColor[color].length > 0 &&
							analytics.remainingCardsByColor[color].length > 0 &&
							gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0]);
				});

				if(config.platform.enableLogging) {
					console.log('topColorsExcTriunfo');
					console.log(topColorsExcTriunfo);
					console.log('');
				}

				if(topColorsExcTriunfo.length > 0) {

					// Get the color with most cards then play the top card
					var cardToPlay = this.getTopCardOfColorWithMostCards(handGroupedByColor, topColorsExcTriunfo);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 6 exit 6');						
					}

					return cardToPlay;

				}
				else {

					// There are no top colors, so find the color with most cards then play the weakest
					var cardToPlay = this.getWeakestCardOfColorWithMostCards(handGroupedByColor, Object.keys(handGroupedByColor));

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 6 exit 7');						
					}

					return cardToPlay;

				}

			}
			else {

				// No one including the player has any triunfo
				// Is there a color that has no remaining cards
				var colorsWithNoRemainingCards = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 &&
							analytics.remainingCardsByColor[color].length == 0;
				});

				if(config.platform.enableLogging) {
					console.log('colorsWithNoRemainingCards');
					console.log(colorsWithNoRemainingCards);
					console.log('');
				}

				if(colorsWithNoRemainingCards.length > 0) {

					// Play the top card among these colors
					var cardToPlay = this.getMostPowerfulCardInColors(handGroupedByColor, colorsWithNoRemainingCards);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 6 exit 8');						
					}

					return cardToPlay;

				}
				else {

					// Find a top color if any
					var topColors = _.filter(Object.keys(handGroupedByColor), function (color) { 
						return handGroupedByColor[color].length > 0 &&
								analytics.remainingCardsByColor[color].length > 0 &&
								gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0]);
					});

					if(config.platform.enableLogging) {
						console.log('topColors');
						console.log(topColors);
						console.log('');
					}

					if(topColors.length > 0) {

						// Get the color with most cards then play the top card
						var cardToPlay = this.getTopCardOfColorWithMostCards(handGroupedByColor, topColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 6 exit 9');						
						}

						return cardToPlay;

					}
					else {

						// Play the weakest card
						var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, Object.keys(handGroupedByColor));

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 6 exit 10');						
						}

						return cardToPlay;

					}

				}

			}

		}

	}





	// This is not the first play in the game. This is the first play in the round. The player is not in the buying team. There might be singing.
	this.strategy_7 = function(handGroupedByColor, triunfo, analytics) {

		if(config.platform.enableLogging) {
			console.log('strategy 7');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: analytics');
			console.log(analytics);
			console.log('');
		}

		// Select the colors that have 1 and do not have 12 or 11
		var colorsInc1Exc12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 
			return handGroupedByColor[color].length > 0 &&
					!handGroupedByColor[color].includes(12) &&
					!handGroupedByColor[color].includes(11) &&
					handGroupedByColor[color].includes(1);
		});

		if(config.platform.enableLogging) {
			console.log('colorsInc1Exc12And11');
			console.log(colorsInc1Exc12And11);
			console.log('');
		}


		if(colorsInc1Exc12And11.length > 0) {

			// Select the color with the least cards and play the As
			var colorWithLeastCards = _.min(colorsInc1Exc12And11, function (color) { return handGroupedByColor[color].length; });

			if(config.platform.enableLogging) {
				console.log('colorWithLeastCards');
				console.log(colorWithLeastCards);
				console.log('');
			}


			var cardToPlay = {n: 1, c: colorWithLeastCards};

			if(config.platform.enableLogging) {
				console.log('cardToPlay');
				console.log(cardToPlay);
				console.log('strategy 7 exit 1');						
			}

			return cardToPlay;

		}
		else {

			// Attempt to brake the song by playing a card that is inferior to Tres
			var colorsExc3And12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 0 &&
						!handGroupedByColor[color].includes(12) &&
						!handGroupedByColor[color].includes(11) &&
						!handGroupedByColor[color].includes(3);
			});

			if(config.platform.enableLogging) {
				console.log('colorsExc3And12And11');
				console.log(colorsExc3And12And11);
				console.log('');
			}

			if(colorsExc3And12And11.length > 0) {

				// Play the top card. It won't be 1 (if it were, we wouldn't get here), nor 3, nor 12 nor 11 so it might cause a song break.
				var cardToPlay = this.getMostPowerfulCardInColors(handGroupedByColor, colorsExc3And12And11);

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 7 exit 2');						
				}

				return cardToPlay;

			}
			else {

				// Select the colors where the 3 is the top card and without 12 or 11 (Note: these colors won't include any 1 naturally since if they have, we wouldn't get here)
				var colorsInc3Exc12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 &&
						!handGroupedByColor[color].includes(12) &&
						!handGroupedByColor[color].includes(11) &&
						handGroupedByColor[color].includes(3) &&
						(
							analytics.remainingCardsByColor[color].length <= 0 ||
							(
								analytics.remainingCardsByColor[color].length > 0 &&
								gameUtils.card1IsStrongerThanCard2SameColor(3, analytics.remainingCardsByColor[color][0])
							)
						);
				});

				if(config.platform.enableLogging) {
					console.log('colorsInc3Exc12And11');
					console.log(colorsInc3Exc12And11);
					console.log('');
				}

				if(colorsInc3Exc12And11.length > 0) {

					// Play the 3
					var cardToPlay = {n: 3, c: colorsInc3Exc12And11[0]};

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 7 exit 3');						
					}

					return cardToPlay;

				}
				else {

					// Get the color with most cards and play the highest card different than the 3
					var colorWithMostCards = _.chain(Object.keys(handGroupedByColor))
												.filter(function (color) { return handGroupedByColor[color].length > 0; })
												.max(function (color) { return handGroupedByColor[color].length - (handGroupedByColor[color].includes(3) ? 1 : 0); })
												.value();

					if(config.platform.enableLogging) {
						console.log('colorWithMostCards');
						console.log(colorWithMostCards);
						console.log('');
					}


					var cardToPlay = {n: handGroupedByColor[colorWithMostCards][0], c: colorWithMostCards};

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 7 exit 4');						
					}

					return cardToPlay;

				}

			}

		}

	}





	// This is not the first play in the game. This is the first play in the round. The player is not in the buying team. There is no singing possible.
	this.strategy_8 = function(handGroupedByColor, triunfo, analytics) {

		if(config.platform.enableLogging) {
			console.log('strategy 8');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: analytics');
			console.log(analytics);
			console.log('');
		}


		// Get the colors that the opp do not own
		var colorsOppDontHave = _.filter(Object.keys(handGroupedByColor), function (color) { 
			return handGroupedByColor[color].length > 0 && 
				(
					analytics.rightOppTopPossibleCardByColor[color] === 0 ||
					analytics.leftOppTopPossibleCardByColor[color] === 0
				);
		});

		if(config.platform.enableLogging) {
			console.log('colors the opponents don\'t own');
			console.log(colorsOppDontHave);
			console.log('');
		}



		if(colorsOppDontHave.length > 0) {

			// Play the weakest card in any of these colors to force the opp to use triunfo
			var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, colorsOppDontHave);

			if(config.platform.enableLogging) {
				console.log('cardToPlay');
				console.log(cardToPlay);
				console.log('strategy 8 exit 1');						
			}

			return cardToPlay;

		}
		else {

			// Attempt to find a color with at least 5 cards with a 1, 3 or both
			var ultraSafeColorsInc1Or3 = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length >= 5 && 
					(
						handGroupedByColor[color].includes(1) ||
						handGroupedByColor[color].includes(3)
					);
			});


			if(config.platform.enableLogging) {
				console.log('ultraSafeColorsInc1Or3');
				console.log(ultraSafeColorsInc1Or3);
				console.log('');
			}


			if(ultraSafeColorsInc1Or3.length > 0) {

				if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

					if(handGroupedByColor[triunfo].includes(1) || handGroupedByColor[triunfo].includes(3)) {

						// Play the weakest card in the 2nd longest color
						var colorsSortedByLength = _.chain(Object.keys(handGroupedByColor))
														.filter(function (color) { return handGroupedByColor[color].length > 0; })
														.sortBy(function (color) { 
															var cardCount = handGroupedByColor[color].length;
															var weakestCardNumber = handGroupedByColor[color][cardCount - 1]; 
															return -1 * (handGroupedByColor[color].length * 1000 - (gameUtils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber));
														})
														.value();

						if(config.platform.enableLogging) {
							console.log('colorsSortedByLength');
							console.log(colorsSortedByLength);
							console.log('');
						}

						if(colorsSortedByLength.length > 1) {

							// Play the weakest card in the 2nd longest color
							var secondLongestColor = colorsSortedByLength[1];
							var cardToPlay = {n: handGroupedByColor[secondLongestColor][handGroupedByColor[secondLongestColor].length - 1], c: secondLongestColor};

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 8 exit 2');						
							}

							return cardToPlay;

						}
						else {

							// We only have one color so return the weakest card from that
							var uniqueColor = colorsSortedByLength[0];
							var cardToPlay = {n: handGroupedByColor[uniqueColor][handGroupedByColor[uniqueColor].length - 1], c: uniqueColor};

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 8 exit 3');						
							}

							return cardToPlay;

						}

					}
					else {

						// Play the weakest triunfo card
						var cardToPlay = {n: handGroupedByColor[triunfo][handGroupedByColor[triunfo].length - 1], c: triunfo};

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 8 exit 4');						
						}

						return cardToPlay;

					}

				}
				else {

					// Play the weakest card in the 2nd longest color
					var colorsSortedByLength = _.chain(Object.keys(handGroupedByColor))
													.filter(function (color) { return handGroupedByColor[color].length > 0; })
													.sortBy(function (color) {
														var cardCount = handGroupedByColor[color].length;
														var weakestCardNumber = handGroupedByColor[color][cardCount - 1]; 
														return -1 * (handGroupedByColor[color].length * 1000 - (gameUtils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber));
													})
													.value();

					if(config.platform.enableLogging) {
						console.log('colorsSortedByLength');
						console.log(colorsSortedByLength);
						console.log('');
					}

					if(colorsSortedByLength.length > 1) {

						// Play the weakest card in the 2nd longest color
						var secondLongestColor = colorsSortedByLength[1];
						var cardToPlay = {n: handGroupedByColor[secondLongestColor][handGroupedByColor[secondLongestColor].length - 1], c: secondLongestColor};

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 8 exit 5');						
						}

						return cardToPlay;

					}
					else {

						// We only have one color so return the weakest card from that
						var uniqueColor = colorsSortedByLength[0];
						var cardToPlay = {n: handGroupedByColor[uniqueColor][handGroupedByColor[uniqueColor].length - 1], c: uniqueColor};

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 8 exit 6');						
						}

						return cardToPlay;

					}

				}

			}
			else {

				// Play the weakest card in the longest color except triunfo
				var colorsSortedByLength = _.chain(Object.keys(handGroupedByColor))
													.filter(function (color) { return handGroupedByColor[color].length > 0; })
													.sortBy(function (color) {
														var cardCount = handGroupedByColor[color].length;
														var weakestCardNumber = handGroupedByColor[color][cardCount - 1];
														if(color === triunfo)
															return 0;
														else
															return -1 * (handGroupedByColor[color].length * 1000 - (gameUtils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber));
													})
													.value();

				if(config.platform.enableLogging) {
					console.log('colorsSortedByLength');
					console.log(colorsSortedByLength);
					console.log('');
				}

				var longestColor = colorsSortedByLength[0];
				var cardToPlay = {n: handGroupedByColor[longestColor][handGroupedByColor[longestColor].length - 1], c: longestColor};

				if(config.platform.enableLogging) {
					console.log('cardToPlay');
					console.log(cardToPlay);
					console.log('strategy 8 exit 7');						
				}

				return cardToPlay;

			}

		}

	}





	// This is a follow up play.
	this.strategy_9 = function(handGroupedByColor, triunfo, analytics, validCards, ongoingPlays, availableSingingColors) {

		if(config.platform.enableLogging) {
			console.log('strategy 9');
			console.log('');
			console.log('params: handGroupedByColor');
			console.log(handGroupedByColor);
			console.log('');
			console.log('params: triunfo');
			console.log(triunfo);
			console.log('');
			console.log('params: analytics');
			console.log(analytics);
			console.log('');
			console.log('params: validCards');
			console.log(validCards);
			console.log('');
			console.log('params: ongoingPlays');
			console.log(ongoingPlays);
			console.log('');
			console.log('params: availableSingingColors');
			console.log(availableSingingColors);
			console.log('');
		}

		// There must be at least one card on the table otherwise Strategy 9 would never be called
		var tableCards = _.map(ongoingPlays, function (play) { return play.card; });
		if(config.platform.enableLogging) {
			console.log('tableCards');
			console.log(tableCards);
			console.log('');
		}

		var mostPowerfulCard = gameUtils.getMostPowerfulCard(tableCards, triunfo);
		if(config.platform.enableLogging) {
			console.log('mostPowerfulCard');
			console.log(mostPowerfulCard);
			console.log('');
		}

		var mostPowerfulPlay = _.find(ongoingPlays, function (play) { return play.card.n === mostPowerfulCard.n && play.card.c === mostPowerfulCard.c; });
		if(config.platform.enableLogging) {
			console.log('mostPowerfulPlay');
			console.log(mostPowerfulPlay);
			console.log('');
		}


		if(mostPowerfulCard.c === triunfo) {

			if(tableCards[0].c === triunfo) {

				// The first player played the triunfo. Does the player have triunfo?
				if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

					// Play the safest triunfo card possible					
					var cardToPlay = this.getSafestTriunfoCardToPlay(handGroupedByColor, triunfo, tableCards, mostPowerfulCard, analytics, availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 9 exit 1');						
					}

					return cardToPlay;

				}
				else {

					// The player doesn't have the triunfo, play the weakest card in all colors
					var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 9 exit 2');						
					}

					return cardToPlay;

				}

			}
			else {

				// The lead card wasn't triunfo so someone fired, we need to follow up to the lead card without having to play a more powerful card
				if(_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

					// Play the weakest card in this color as the triunfo will win the round
					var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, tableCards[0].c, availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 9 exit 3');						
					}

					return cardToPlay;

				}
				else {

					// The player doesn't have any card in the color of the lead, try triunfo
					if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

						// Play the safest triunfo card possible
						var cardToPlay = this.getSafestTriunfoCardToPlay(handGroupedByColor, triunfo, tableCards, mostPowerfulCard, analytics, availableSingingColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 9 exit 4');						
						}

						return cardToPlay;

					}
					else {

						// The player doesn't have triunfo so play the weakest card there is
						var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 9 exit 5');						
						}

						return cardToPlay;

					}

				}

			}

		}
		else {

			// The most powerful card isn't in triunfo, so we need to better it if possible
			if(_.has(handGroupedByColor, mostPowerfulCard.c) && handGroupedByColor[mostPowerfulCard.c].length > 0) {

				// The player does have cards in the lead card color. Try to get more powerful cards
				var morePowerfulCards = _.chain(handGroupedByColor[mostPowerfulCard.c])
											.filter(function (cardNumber) { return gameUtils.card1IsStrongerThanCard2SameColor(cardNumber, mostPowerfulCard.n); })
											.map(function (cardNumber) { return {n: cardNumber, c: mostPowerfulCard.c}; })
											.value();

				if(morePowerfulCards.length > 0) {

					// The player has more powerful cards than the most powerful card
					if(tableCards.length === 3) {

						// The player is the last to play, only play the least more powerful card
						var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(morePowerfulCards, availableSingingColors.includes(mostPowerfulCard.c));

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 9 exit 6');						
						}

						return cardToPlay;

					}
					else {

						// The player is not the last to play
						// If there's a risk the right opp might have more powerful cards or triunfo, play the least more powerful card
						if (
								(
									analytics.rightOppTopPossibleCardByColor[mostPowerfulCard.c] > 0
									&&
									gameUtils.card1IsStrongerThanCard2SameColor(morePowerfulCards[0], analytics.rightOppTopPossibleCardByColor[mostPowerfulCard.c])
								)
								||
								(
									analytics.rightOppTopPossibleCardByColor[mostPowerfulCard.c] === 0
									&&
									analytics.rightOppTopPossibleCardByColor[triunfo] === 0
								)

						) {

							// Play the most powerful card					
							var cardToPlay = reasonerUtils.getSmartMostPowerfulCardInSameColorCards(morePowerfulCards, availableSingingColors.includes(mostPowerfulCard.c));

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 9 exit 7');						
							}

							return cardToPlay;

						}
						else {

							// There are some risks so play the least more powerful card
							var cardToPlay = reasonerUtils.getSmartWeakestCardInSameColorCards(morePowerfulCards, availableSingingColors.includes(mostPowerfulCard.c));

							if(config.platform.enableLogging) {
								console.log('cardToPlay');
								console.log(cardToPlay);
								console.log('strategy 9 exit 8');						
							}

							return cardToPlay;

						}

					}

				}
				else {

					// The player doesn't have more powerful cards in the lead card color
					// If the player is the last to play and his partner is winning, play the best card
					if(tableCards.length === 3 && mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()) {

						// Play the best card possible
						var cardToPlay = this.getMostPowerfulCardInColors(handGroupedByColor, [mostPowerfulCard.c], availableSingingColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 9 exit 9');						
						}

						return cardToPlay;

					}
					else {

						// There are some risks so play the weakest available card
						var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, [mostPowerfulCard.c], availableSingingColors);

						if(config.platform.enableLogging) {
							console.log('cardToPlay');
							console.log(cardToPlay);
							console.log('strategy 9 exit 10');						
						}

						return cardToPlay;

					}

				}

			}
			else {

				// The player doesn't have any card in the lead card color
				// Does the player have triunfo?
				if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

					// Play the safest triunfo card possible
					var cardToPlay = this.getSafestTriunfoCardToPlay(handGroupedByColor, triunfo, tableCards, mostPowerfulCard, analytics, availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 9 exit 11');
					}

					return cardToPlay;

				}
				else {

					// Play the weakest card possible
					var cardToPlay = this.getWeakestCardInColors(handGroupedByColor, Object.keys(handGroupedByColor), availableSingingColors);

					if(config.platform.enableLogging) {
						console.log('cardToPlay');
						console.log(cardToPlay);
						console.log('strategy 9 exit 12');						
					}

					return cardToPlay;

				}

			}

		}

	}





	this.groupHandByColorAndSimplify = function(hand) {

		// Group by color
		var handGroupedByColor = _.groupBy(hand, function(card) { return card.c; });

		// Simplify by keeping only numbers for each color
		for(var color in handGroupedByColor) {

			// Keep numbers only for each card
			handGroupedByColor[color] = _.map(handGroupedByColor[color], function(card) { return card.n; });

			// Order by value
			handGroupedByColor[color] = _.sortBy(handGroupedByColor[color], function(num) { return -1 * gameUtils.getCardValue(num); });

		}

		return handGroupedByColor;

	}

}


LegacyStrategyReasoner.prototype.estimateBidAmount = function(hand, firstTeammateBid, triunfo) {

	var referenceBid = 0;
	var handGroupedByColor = this.groupHandByColorAndSimplify(hand);


	// Reference bid of 170
	if(this.canBid170(handGroupedByColor, triunfo)) {
		referenceBid = 170;
	}
	else if(this.canBid140(handGroupedByColor, triunfo)) {
		referenceBid = 140;
	}
	else if(this.canBid130(handGroupedByColor, triunfo)) {
		referenceBid = 130;
	}
	else if(this.canBid120(handGroupedByColor, triunfo)) {
		referenceBid = 120;
	}
	else if(this.canBid110(handGroupedByColor, triunfo)) {
		referenceBid = 110;
	}
	else if(this.canBid100(handGroupedByColor, triunfo)) {
		referenceBid = 100;
	}
	else if(this.canBid90(handGroupedByColor, triunfo)) {
		referenceBid = 90;
	}
	else if(this.canBid80(handGroupedByColor, triunfo)) {
		referenceBid = 80;
	}
	else if(this.canBid70(handGroupedByColor, triunfo)) {
		referenceBid = 70;
	}
	else {

		// No rule was hit, use the overpowered cards technique
		var lostPoints = 0;

		// For each card that has a value, see if this card has a risk to be lost, if so, count its score
		for(var color in handGroupedByColor) {

			var cardsInColor = handGroupedByColor[color];
			var lostPointsInColor = 30;

			for(var i = 0; i < cardsInColor.length; i++) {
				
				if(cardsInColor[i] === 1) {

					// If the player has an As in a color, he probably won't lose it			
					lostPointsInColor -= 11;

				}
				else if(cardsInColor[i] === 3) {

					// If the player has an As or a Rey, the Tres is probably safe
					if(_.intersection(cardsInColor, [1, 12]).length > 0) {
						lostPointsInColor -= 10;
					}

				}
				else if(cardsInColor[i] === 12) {

					// If the player has an As, Tres or Caballo, the Rey is protected
					if(_.intersection(cardsInColor, [1, 3, 11])) {
						lostPointsInColor -= 4;
					}

				}
				else if(cardsInColor[i] === 11) {

					// If the player has an As, Tres, Rey or Sota, the Caballo is protected
					if(_.intersection(cardsInColor, [1, 3, 12, 10]).length > 0) {
						lostPointsInColor -= 3;
					}

				}
				else if(cardsInColor[i] === 10) {

					// If the player has an As, Tres, Rey, Caballo or a 7, the Caballo is protected
					if(_.intersection(cardsInColor, [1, 3, 12, 11, 7]).length > 0) {
						lostPointsInColor -= 2;
					}
					
				}
				else {
					continue;
				}

			}

			// Update the total possible lost points to opponents
			//console.log(lostPointsInColor);
			lostPoints += lostPointsInColor;

		}

		// The reference bid would be the max number multiple of 10 that is inferior to 130 minus the possible lost points
		referenceBid = Math.floor((130 - lostPoints) / 10.0) * 10;
		//console.log("No bidding rules hit. Reference bid = " + referenceBid);



		// Add the songs if any and if possible
		var singingColors = gameUtils.getValidSingingColors(hand, []);
		var singingAmounts = _.map(singingColors, function(color) { return color === triunfo ? 40 : 20});

		if(singingAmounts.length > 0) {

			var totalSingingAmount = _.reduce(singingAmounts, function(memo, num){ return memo + num; }, 0);
			if(	(totalSingingAmount <= 20 && referenceBid + totalSingingAmount >= 90) || (totalSingingAmount <= 40 && referenceBid + totalSingingAmount >= 100) || (totalSingingAmount > 40 && referenceBid + totalSingingAmount > 100) ) {

				// We can count the songs
				referenceBid += totalSingingAmount;

			}

		}



		// Add the teammate bid effect
		if(firstTeammateBid !== null) {
			if(firstTeammateBid > 0) {

				// Add 20% of the first teammate bid to the bid
				var percentOfBid = Math.floor(firstTeammateBid * 0.2 * 0.1) * 10;
				referenceBid += percentOfBid;

			}
		}



		// If the bid is inferior to 70, pass
		/*
		if(referenceBid < 70) {
			referenceBid = 0;
		}
		*/
		
	}
	

	return referenceBid;

}


LegacyStrategyReasoner.prototype.chooseCardToPlay = function(hand, validCards, analytics) {


	if(hand.length === 0)
		return;


	if(hand.length === 1) {
		return hand[0];
	}


	var cardToPlay = null;
	var usedStrategy = '';

	var triunfo = this.aiPlayer.getTriunfo();
	var handGroupedByColor = this.groupHandByColorAndSimplify(hand);
	var plays = this.aiPlayer.getPlays();


	if(plays.length <= 0) {

		if(this.aiPlayer.isBuyer()) {

			var availableSingingColors = this.aiPlayer.getAvailableSingingColors();
			if(availableSingingColors.length > 0) { // if(this.aiPlayer.canSingLater()) {

				// Strategy 1.1: This is the first play in the game. The player is the buyer. Singing is possible.
				cardToPlay = this.strategy_1_1(handGroupedByColor, triunfo, availableSingingColors, analytics);
				usedStrategy = '1_1';

			}
			else {

				// Strategy 2: This is the first play in the game. The player is the buyer. Singing is not possible.
				cardToPlay = this.strategy_2(handGroupedByColor, triunfo);
				usedStrategy = '2';

			}

		}
		else if(this.aiPlayer.isTeammateOfBuyer()) {

			// Strategy 1.2: This is the first play in the game. The player is the teammate of the buyer.
			var availableSingingColors = this.aiPlayer.getAvailableSingingColors();

			cardToPlay = this.strategy_1_2(handGroupedByColor, triunfo, availableSingingColors, analytics);
			usedStrategy = '1_2';

		}
		else {

			// Get the teammate max bid
			var maxTeammateBid = this.aiPlayer.getMaxTeammateBid();

			if(this.aiPlayer.getWinningBid().amount >= 90) {

				// Singing is possible
				// Strategy 3: This is the first play in the game. The player is not in the buying team. Singing is possible.
				cardToPlay = this.strategy_3(handGroupedByColor, triunfo, maxTeammateBid);
				usedStrategy = '3';

			}
			else {

				// Singing is not possible
				// Strategy 4: This is the first play in the game. The player is not in the buying team. Singing is not possible.			
				cardToPlay = this.strategy_4(handGroupedByColor, triunfo, maxTeammateBid);
				usedStrategy = '4';

			}

		}

	}
	else if(plays.length % 4 === 0) {

		if(this.aiPlayer.isInBuyingTeam()) {

			var availableSingingColors = this.aiPlayer.getAvailableSingingColors();
			if(availableSingingColors.length > 0) { // if(this.aiPlayer.canSingLater()) {

				// Strategy 5: This is not the first play in the game. This is the first play in the round. The player is in the buying team. Singing is possible.
				cardToPlay = this.strategy_5(handGroupedByColor, triunfo, analytics, availableSingingColors);
				usedStrategy = '5';

			}
			else {

				// Strategy 6: This is not the first play in the game. This is the first play in the round. The player is in the buying team. Singing is not possible.
				cardToPlay = this.strategy_6(handGroupedByColor, triunfo, analytics);
				usedStrategy = '6';

			}

		}
		else {

			if(this.aiPlayer.getWinningBid().amount >= 90) { // TODO: improve the predictablility of singing

				// Singing is possible
				// Strategy 7: This is not the first play in the game. This is the first play in the round. The player is not in the buying team. There might be singing. 
				cardToPlay = this.strategy_7(handGroupedByColor, triunfo, analytics);
				usedStrategy = '7';

			}
			else {

				// Singing is not possible
				// Strategy 8: This is not the first play in the game. This is the first play in the round. The player is not in the buying team. There is no singing possible. 
				cardToPlay = this.strategy_8(handGroupedByColor, triunfo, analytics);
				usedStrategy = '8';

			}

		}

	}
	else {

		// Strategy 9: This is a follow up play.
		var ongoingPlaysStartIndex = Math.floor(plays.length / 4.0) * 4;
		var ongoingPlays = _.last(plays, plays.length - ongoingPlaysStartIndex);
		var availableSingingColors = [];

		if(this.aiPlayer.isInBuyingTeam()) {
			availableSingingColors = this.aiPlayer.getAvailableSingingColors();
		}

		cardToPlay = this.strategy_9(handGroupedByColor, triunfo, analytics, validCards, ongoingPlays, availableSingingColors);
		usedStrategy = '9';

	}


	if(cardToPlay !== null && cardToPlay.n && cardToPlay.c) {

		return cardToPlay;

	}
	else {

		// Error in one of the strategies
		console.log('Error in strategy ' + usedStrategy);

		var cardIndex = Math.floor(Math.random() * validCards.length);
    	return validCards[cardIndex];

	}
	

}


module.exports = LegacyStrategyReasoner;