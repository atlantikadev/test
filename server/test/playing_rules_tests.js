var _ = require('underscore');
var utils = require('./server/core/utils');


var triunfo = 'o';
var handGroupedByColor = {
	'o': [1, 12],
	'c': [3, 6],
	'e': [7, 2, 5],
	'b': [11, 10, 7]
};

var analytics = {
	remainingCardsByColor: { 'o': [], 'b': [12], 'c': [1, 12, 10], 'e': [3, 7] },
	teammateTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 }, // '1' means that this player can have up to the As in this color. 'null' means that he doesn't have any card in this color
	rightOppTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 },
	leftOppTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 }
};

var isFirstPlayInGame = true;
var isFirstPlayInRound = false;
var isBuyer = true;
var isTeammateOfBuyer = false;
var canSing = true;
var maxTeammateBid = { amount: 70 };
var winningBid = { amount: 80 };




this.getWeakestCardOfColorWithMostCards = function(colors) {
	var colorWithMostCards = _.chain(colors)
								.filter(function (color) { return handGroupedByColor[color].length > 0;})
								.max(function (color) {
									var cardCount = handGroupedByColor[color].length;
									var weakestCardNumber = handGroupedByColor[color][cardCount - 1];
									return cardCount * 1000 - (utils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber); 
								})
								.value();
					
	var colorWithMostCardsCount = handGroupedByColor[colorWithMostCards].length;
	return {n: handGroupedByColor[colorWithMostCards][colorWithMostCardsCount - 1], c: colorWithMostCards};
}



this.getWeakestCardOfColorWithLeastCards = function(colors) {
	var colorWithLeastCards = _.chain(colors)
								.filter(function (color) { return handGroupedByColor[color].length > 0;})
								.min(function (color) {
									var cardCount = handGroupedByColor[color].length;
									var weakestCardNumber = handGroupedByColor[color][cardCount - 1];
									return cardCount * 1000 + (utils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber); 
								})
								.value();
					
	var colorWithLeastCardsCount = handGroupedByColor[colorWithLeastCards].length;
	return {n: handGroupedByColor[colorWithLeastCards][colorWithLeastCardsCount - 1], c: colorWithLeastCards};
}



this.getTopCardOfColorWithMostCards = function(colors) {
	var colorWithMostCards = _.chain(colors)
								.filter(function (color) { return handGroupedByColor[color].length > 0;})
								.max(function (color) {
									var cardCount = handGroupedByColor[color].length;
									var topCardNumber = handGroupedByColor[color][0];
									return cardCount * 1000 + (utils.getCardValue(topCardNumber) * 10 + topCardNumber); 
								})
								.value();
					
	var colorWithMostCardsCount = handGroupedByColor[colorWithMostCards].length;
	return {n: handGroupedByColor[colorWithMostCards][0], c: colorWithMostCards};
}


this.getTopCardOfColorWithLeastCards = function(colors) {
	var colorWithLeastCards = _.chain(colors)
								.filter(function (color) { return handGroupedByColor[color].length > 0;})
								.min(function (color) {
									var cardCount = handGroupedByColor[color].length;
									var topCardNumber = handGroupedByColor[color][0];
									return cardCount * 1000 - (utils.getCardValue(topCardNumber) * 10 + topCardNumber); 
								})
								.value();
					
	var colorWithLeastCardsCount = handGroupedByColor[colorWithLeastCards].length;
	return {n: handGroupedByColor[colorWithLeastCards][0], c: colorWithLeastCards};
}


this.getMostPowerfulCardInColors = function(colors) {
	var colorWithHighestCard = _.chain(colors)
									.filter(function (color) { return handGroupedByColor[color].length > 0; })
									.max(function (color) { return utils.getCardValue(handGroupedByColor[color][0]) * 10 + handGroupedByColor[color][0]; })
									.value();

	return {n: handGroupedByColor[colorWithHighestCard][0], c: colorWithHighestCard};
}


this.getWeakestCardInColors = function(colors) {
	var colorWithWeakestCard = _.chain(colors)
									.filter(function (color) { return handGroupedByColor[color].length > 0; })
									.min(function (color) {
										var cardCount = handGroupedByColor[color].length;
										var weakestCardNumber = handGroupedByColor[color][cardCount - 1];
										return utils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber; 
									})
									.value();

	var colorWithWeakestCardCount = handGroupedByColor[colorWithWeakestCard].length;
	return {n: handGroupedByColor[colorWithWeakestCard][colorWithWeakestCardCount - 1], c: colorWithWeakestCard};
}





this.strategy_1_1 = function(handGroupedByColor, triunfo) {

		// Get all colors with an As
		var colorsWithAs = [];
		for(var color in handGroupedByColor) {
			if(handGroupedByColor[color][0] === 1) {
				colorsWithAs.push(color);
			}
		}

		// Do we have any As
		if(colorsWithAs.length > 0) {

			// Do we have an As in triunfo
			if(colorsWithAs.includes(triunfo)) {

				// We have an As in triunfo, play it
				return {n: 1, c: triunfo};

			}
			else {

				// We have one or more As but no triunfo, so play the As of the color with least number of cards (to avoid triunfo firing)
				var colorWithLeastCardsAndAs = _.min(colorsWithAs, function (color) { 
					return handGroupedByColor[color].length; 
				});

				return {n: 1, c: colorWithLeastCardsAndAs};

			}

		}
		else {

			// No As, so take the color with the least number of cards and play the weakest
			return this.getWeakestCardOfColorWithLeastCards(Object.keys(handGroupedByColor));

		}

	}



this.strategy_1_2 = function(handGroupedByColor, triunfo) {

		// Does the teammate has the triunfo color
		if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

			// Play the highest card
			return {n: handGroupedByColor[triunfo][0], c: triunfo};

		}
		else {

			// Select all colors with 3 and no As
			var colorsWithTresAndNoAs = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 1 && handGroupedByColor[color][0] === 3;
			});

			if(colorsWithTresAndNoAs.length > 0) {

				// Select the color with most number of cards and play the card just below the Tres
				var colorWithMostCards = _.max(colorsWithTresAndNoAs, function (color) { return handGroupedByColor[color].length; });
				return {n: handGroupedByColor[colorWithMostCards][1], c: colorWithMostCards};

			}
			else {

				// No As, so take the color with the least number of cards and play the weakest
				return this.getWeakestCardOfColorWithLeastCards(Object.keys(handGroupedByColor));

			}

		}

	}



this.strategy_2_1 = function(handGroupedByColor, triunfo) {

		// Does the player have at least 5 colors in triunfo including an As
		if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length >= 5 && handGroupedByColor[triunfo][0] === 1) {
			
			// Play the As triunfo
			return {n: 1, c: triunfo};

		}
		else {

			// Select all colors with 3 and no As and at least 2 cards
			var colorsWithTresAndNoAs = _.filter(Object.keys(handGroupedByColor), function (color) {
				return handGroupedByColor[color].length > 1 && handGroupedByColor[color][0] === 3;
			});

			if(colorsWithTresAndNoAs.length > 0) {

				// Select the color with most number of cards and play the card just below the Tres
				var colorWithMostCards = _.max(colorsWithTresAndNoAs, function (color) { return handGroupedByColor[color].length; });
				return {n: handGroupedByColor[colorWithMostCards][1], c: colorWithMostCards};

			}
			else {

				// Select all colors that have an As that isn't in triunfo
				var colorsWithAsNotTriunfo = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 && handGroupedByColor[color][0] === 1 && color !== triunfo;
				});

				if(colorsWithAsNotTriunfo.length > 0) {

					// Play the As of the color that has the least number of cards
					var colorWithLeastCards = _.min(colorsWithAsNotTriunfo, function (color) { return handGroupedByColor[color].length; });
					return {n: 1, c: colorWithLeastCards};

				}
				else {

					// Select the color with the most cards and play the weakest
					return this.getWeakestCardOfColorWithMostCards(Object.keys(handGroupedByColor));

				}

			}

		}

	}




this.strategy_3 = function(handGroupedByColor, triunfo, maxTeammateBid) {

		// Select the colors that are not triunfo and have no 11 or 12 (the player will try to break the song!)
		var colorsNotTriunfoExc12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 			
			return color !== triunfo &&
				   handGroupedByColor[color].length > 0 &&
				   !handGroupedByColor[color].includes(12) &&
				   !handGroupedByColor[color].includes(11);
		});

		if(colorsNotTriunfoExc12And11.length > 0) {

			// Select the colors among them that have an As
			var colorsNotTriunfoExc12And11Inc1 = _.filter(colorsNotTriunfoExc12And11, function (color) { return handGroupedByColor[color][0] === 1; });

			if(colorsNotTriunfoExc12And11Inc1.length > 0) {

				// Play the As from a color that is suspected to be sang in
				return {n: 1, c: colorsNotTriunfoExc12And11Inc1[0]};

			}
			else {

				// Select the colors among them that have a Tres
				var colorsNotTriunfoExc12And11Inc3 = _.filter(colorsNotTriunfoExc12And11, function (color) { 
					return handGroupedByColor[color][0] === 3 && handGroupedByColor[color].length > 1; 
				});

				if(colorsNotTriunfoExc12And11Inc3.length > 0) {

					// Play the card that is just below the Tres (to force them to play the 12 or 11)
					var color = colorsNotTriunfoExc12And11Inc3[0];
					return {n: handGroupedByColor[color][1], c: color};

				}
				else {

					// Select the color with the most powerful card and play that card
					return this.getMostPowerfulCardInColors(Object.keys(handGroupedByColor));

				}

			}

		}
		else {

			// All colors have either 12, 11 or both, which means that no song is possible. We should fall back to strategy 4
			return this.strategy_4(handGroupedByColor, triunfo, maxTeammateBid);

		}

	}



this.strategy_4 = function(handGroupedByColor, triunfo, maxTeammateBid) {

		// Select colors that have no As nor Tres
		var colorsExc1And3 = _.filter(Object.keys(handGroupedByColor), function (color) { 
			return handGroupedByColor[color].length > 0 &&
				   !handGroupedByColor[color].includes(1) &&
				   !handGroupedByColor[color].includes(3);
		});


		if(colorsExc1And3.length > 0) {

			// Did the teammate participate in bidding.
			if(maxTeammateBid !== null && maxTeammateBid.amount > 0) {

				// Select the color that has the highest card and play that card
				return this.getMostPowerfulCardInColors(colorsExc1And3);

			}
			else {

				// Select the color with the most cards and play the weakest
				return this.getWeakestCardOfColorWithMostCards(colorsExc1And3);

			}

		}
		else {

			// Select the colors that have a Tres without As
			var colorsExc1Inc3 = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 2 &&
					   handGroupedByColor[color][0] === 3;
			});

			if(colorsExc1Inc3.length > 0) {

				// Play the card that comes after the Tres in order to protect the Tres
				var color = colorsExc1Inc3[0];
				return {n: handGroupedByColor[color][1], c: color};

			}
			else {

				// Select the color that has an As and the least number of cards
				var colorInc1LeastCards = _.chain(Object.keys(handGroupedByColor))
					.filter(function (color) { return handGroupedByColor[color][0] === 1; })
					.min(function (color) { return handGroupedByColor[color].length; })
					.value();

				return {n: 1, c: colorInc1LeastCards};

			}

		}

	}



this.strategy_5 = function(handGroupedByColor, triunfo, analytics) {

		// The player has a song so he needs to win the current round at all costs
		// Check to see if there are any triunfo cards left
		if(analytics.remainingCardsByColor[triunfo].length > 0) {

			// Check to see if the player has triunfo too
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

				// The player does have triunfo. Is it more powerful than the top remaning card
				if(utils.getCardValue(handGroupedByColor[triunfo][0]) > utils.getCardValue(analytics.remainingCardsByColor[triunfo][0])) {

					// Play the top triunfo card, garanteed to win you the round
					return {n: handGroupedByColor[triunfo][0], c: triunfo};

				}
				else {

					// Sadly, the top triunfo card the player has isn't the most powerful around
					// Find the colors in the hand of the player that have the top card with at least 3 remaining cards (to avoid triunfo)
					var topSafeColors = _.filter(Object.keys(handGroupedByColor), function (color) { 
						return handGroupedByColor[color].length > 0 &&
							   analytics.remainingCardsByColor[color].length > 2 && 
							   utils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0]);
					});

					if(topSafeColors.length > 0) {

						// Get the color with the least number of cards and play the top card
						return this.getTopCardOfColorWithLeastCards(topSafeColors);

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
							return this.getWeakestCardInColors(colorsOppDontHave);

						}
						else {

							// There are no colors opponents don't have at the moment.
							// Play the weakest card from the color that has the most cards excluding triunfo
							return this.getWeakestCardOfColorWithMostCards(_.without(Object.keys(handGroupedByColor), triunfo));
						}

					}

				}

			}
			else {

				// Triunfo remains but the player doesn't have any
				// Play the weakest card from the color that has the most cards
				return this.getWeakestCardOfColorWithMostCards(Object.keys(handGroupedByColor));

			}

		}
		else {

			// There are no triunfo cards remaining for other players. Check to see if the player has triunfo
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

				// The player has triunfo, play the weakest triunfo card, it's guaranteed to win
				return {n: handGroupedByColor[triunfo][handGroupedByColor[triunfo].length - 1], c: triunfo};

			}
			else {

				// The player doesn't have triunfo either. Find colors with top cards
				var colorsWithTopCards = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 &&
						(
							analytics.remainingCardsByColor[color].length <= 0 ||
							(
								analytics.remainingCardsByColor[color].length > 0 &&
								utils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0])
							)
						);
					});

				if(colorsWithTopCards.length > 0) {

					// Find the color with most cards and play the top card
					return this.getTopCardOfColorWithMostCards(colorsWithTopCards);

				}
				else {

					// Play the weakest card from the color that has the most cards excluding triunfo
					return this.getWeakestCardOfColorWithMostCards(_.without(Object.keys(handGroupedByColor), triunfo));

				}

			}

		}

	}




this.strategy_6 = function(handGroupedByColor, triunfo, analytics) {

		// Check to see if there are any triunfo cards left
		if(analytics.remainingCardsByColor[triunfo].length > 0) {

			// Find colors with top cards
			var colorsWithTopCards = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 0 &&
					(
						analytics.remainingCardsByColor[color].length <= 0 ||
						(
							analytics.remainingCardsByColor[color].length > 0 &&
							utils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0])
						)
					);
				});


			// Check to see if the player has more triunfo cards than remaining as well as has at least one color with a top card
			if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > analytics.remainingCardsByColor[triunfo].length && colorsWithTopCards.length > 0) {

				// Play the highest triunfo card (not sure why!)
				return {n: handGroupedByColor[triunfo][0], c: triunfo};

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

				// Find the weakest card among these colors
				var weakestCardOfColorOppDontOwn = null;
				if(colorsOppDontHave.length > 0) {

					weakestCardOfColorOppDontOwn = this.getWeakestCardInColors(colorsOppDontHave);

				}



				if(weakestCardOfColorOppDontOwn !== null && utils.getCardValue(weakestCardOfColorOppDontOwn.n) < 10) {

					// If the weakest card isn't As or Tres, play it as it will probably be lost in favor of making the opp lose a triunfo card
					return weakestCardOfColorOppDontOwn;

				}
				else {

					// The weakest card of colors the opp don't own was an As or Tres we cannot sacrifice so
					// Find any hand colors that do not have an As or Tres even though are still available
					var colorsExc1And3 = _.filter(Object.keys(handGroupedByColor), function (color) {
						return handGroupedByColor[color].length > 0 &&
							!handGroupedByColor[color].includes(1) && 
							!handGroupedByColor[color].includes(3); }
					);


					if(colorsExc1And3.length > 0) {

						// Find the color with most cards and play the weakest to force the opp to use triunfo or play As & Tres.
						return this.getWeakestCardOfColorWithMostCards(colorsExc1And3);

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
										utils.card1IsStrongerThanCard2SameColor(3, analytics.remainingCardsByColor[color][0])
									)
								);
						});


						if(safeColorsInc1Or3.length > 0) {

							// Get the color with the least number of cards and play the top card
							return this.getTopCardOfColorWithLeastCards(safeColorsInc1Or3);

						}
						else {

							// Play the weakest card from the color that has the most cards
							return this.getWeakestCardOfColorWithMostCards(Object.keys(handGroupedByColor));

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
							utils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0]);
				});

				if(topColorsExcTriunfo.length > 0) {

					// Get the color with most cards then play the top card
					return this.getTopCardOfColorWithMostCards(topColorsExcTriunfo);

				}
				else {

					// There are no top colors, so find the color with most cards then play the weakest
					return this.getWeakestCardOfColorWithMostCards(Object.keys(handGroupedByColor));

				}

			}
			else {

				// No one including the player has any triunfo
				// Is there a color that has no remaining cards
				var colorsWithNoRemainingCards = _.filter(Object.keys(handGroupedByColor), function (color) { 
					return handGroupedByColor[color].length > 0 &&
							analytics.remainingCardsByColor[color].length == 0;
				});

				if(colorsWithNoRemainingCards.length > 0) {

					// Play the top card among these colors
					return this.getMostPowerfulCardInColors(colorsWithNoRemainingCards);

				}
				else {

					// Find a top color if any
					var topColors = _.filter(Object.keys(handGroupedByColor), function (color) { 
						return handGroupedByColor[color].length > 0 &&
								analytics.remainingCardsByColor[color].length > 0 &&
								utils.card1IsStrongerThanCard2SameColor(handGroupedByColor[color][0], analytics.remainingCardsByColor[color][0]);
					});

					if(topColors.length > 0) {

						// Get the color with most cards then play the top card
						return this.getTopCardOfColorWithMostCards(topColorsExcTriunfo);

					}
					else {

						// Play the weakest card
						return this.getWeakestCardInColors(Object.keys(handGroupedByColor));

					}

				}

			}

		}

	}




this.strategy_7 = function(handGroupedByColor, triunfo, analytics) {

		// Select the colors that have 1 and do not have 12 or 11
		var colorsInc1Exc12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 
			return handGroupedByColor[color].length > 0 &&
					!handGroupedByColor[color].includes(12) &&
					!handGroupedByColor[color].includes(11) &&
					handGroupedByColor[color].includes(1);
		});

		if(colorsInc1Exc12And11.length > 0) {

			// Select the color with the least cards and play the As
			var colorWithLeastCards = _.min(colorsInc1Exc12And11, function (color) { return handGroupedByColor[color].length; });

			return {n: 1, c: colorWithLeastCards};

		}
		else {

			// Attempt to brake the song by playing a card that is inferior to Tres
			var colorsExc3And12And11 = _.filter(Object.keys(handGroupedByColor), function (color) { 
				return handGroupedByColor[color].length > 0 &&
						!handGroupedByColor[color].includes(12) &&
						!handGroupedByColor[color].includes(11) &&
						!handGroupedByColor[color].includes(3);
			});

			if(colorsExc3And12And11.length > 0) {

				// Play the top card. It won't be 1 (if it were, we wouldn't get here), nor 3, nor 12 nor 11 so it might cause a song break.
				return this.getMostPowerfulCardInColors(colorsExc3And12And11);

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
								utils.card1IsStrongerThanCard2SameColor(3, analytics.remainingCardsByColor[color][0])
							)
						);
				});

				if(colorsInc3Exc12And11.length > 0) {

					// Play the 3
					return {n: 3, c: colorsInc3Exc12And11[0]};

				}
				else {

					// Get the color with most cards and play the highest card different than the 3
					var colorWithMostCards = _.chain(Object.keys(handGroupedByColor))
												.filter(function (color) { return handGroupedByColor[color].length > 0; })
												.max(function (color) { return handGroupedByColor[color].length - (handGroupedByColor[color].includes(3) ? 1 : 0); })
												.value();



					return {n: handGroupedByColor[colorWithMostCards][0], c: colorWithMostCards};

				}

			}

		}

	}




this.strategy_8 = function(handGroupedByColor, triunfo, analytics) {

		// Get the colors that the opp do not own
		var colorsOppDontHave = _.filter(Object.keys(handGroupedByColor), function (color) { 
			return handGroupedByColor[color].length > 0 && 
				(
					analytics.rightOppTopPossibleCardByColor[color] === 0 ||
					analytics.leftOppTopPossibleCardByColor[color] === 0
				);
		});

		if(colorsOppDontHave.length > 0) {

			// Play the weakest card in any of these colors to force the opp to use triunfo
			return this.getWeakestCardInColors(colorsOppDontHave);

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

			if(ultraSafeColorsInc1Or3.length > 0) {

				if(_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

					if(handGroupedByColor[triunfo].includes(1) || handGroupedByColor[triunfo].includes(3)) {

						// Play the weakest card in the 2nd longest color
						var colorsSortedByLength = _.chain(Object.keys(handGroupedByColor))
														.filter(function (color) { return handGroupedByColor[color].length > 0; })
														.sortBy(function (color) { 
															var cardCount = handGroupedByColor[color].length;
															var weakestCardNumber = handGroupedByColor[color][cardCount - 1]; 
															return -1 * (handGroupedByColor[color].length * 1000 - (utils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber));
														})
														.value();

						if(colorsSortedByLength.length > 1) {

							// Play the weakest card in the 2nd longest color
							var secondLongestColor = colorsSortedByLength[1];
							return {n: handGroupedByColor[secondLongestColor][handGroupedByColor[secondLongestColor].length - 1], c: secondLongestColor};

						}
						else {

							// We only have one color so return the weakest card from that
							var uniqueColor = colorsSortedByLength[0];
							return {n: handGroupedByColor[uniqueColor][handGroupedByColor[uniqueColor].length - 1], c: uniqueColor};

						}

					}
					else {

						// Play the weakest triunfo card
						return {n: handGroupedByColor[triunfo][handGroupedByColor[triunfo].length - 1], c: triunfo};

					}

				}
				else {

					// Play the weakest card in the 2nd longest color
					var colorsSortedByLength = _.chain(Object.keys(handGroupedByColor))
													.filter(function (color) { return handGroupedByColor[color].length > 0; })
													.sortBy(function (color) {
														var cardCount = handGroupedByColor[color].length;
														var weakestCardNumber = handGroupedByColor[color][cardCount - 1]; 
														return -1 * (handGroupedByColor[color].length * 1000 - (utils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber));
													})
													.value();

					if(colorsSortedByLength.length > 1) {

						// Play the weakest card in the 2nd longest color
						var secondLongestColor = colorsSortedByLength[1];
						return {n: handGroupedByColor[secondLongestColor][handGroupedByColor[secondLongestColor].length - 1], c: secondLongestColor};

					}
					else {

						// We only have one color so return the weakest card from that
						var uniqueColor = colorsSortedByLength[0];
						return {n: handGroupedByColor[uniqueColor][handGroupedByColor[uniqueColor].length - 1], c: uniqueColor};

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
															return -1 * (handGroupedByColor[color].length * 1000 - (utils.getCardValue(weakestCardNumber) * 10 + weakestCardNumber));
													})
													.value();

				var longestColor = colorsSortedByLength[0];
				return {n: handGroupedByColor[longestColor][handGroupedByColor[longestColor].length - 1], c: longestColor};

			}

		}

	}



/*
console.log('-------------------------------------------------------------------');
console.log('Weakest card of the color with the least cards:');
console.log(this.getWeakestCardOfColorWithLeastCards(Object.keys(handGroupedByColor)));
console.log('-------------------------------------------------------------------');
console.log('Weakest card of the color with the most cards:');
console.log(this.getWeakestCardOfColorWithMostCards(Object.keys(handGroupedByColor)));
console.log('-------------------------------------------------------------------');
console.log('Top card of the color with the least cards:');
console.log(this.getTopCardOfColorWithLeastCards(Object.keys(handGroupedByColor)));
console.log('-------------------------------------------------------------------');
console.log('Top card of the color with the most cards:');
console.log(this.getTopCardOfColorWithMostCards(Object.keys(handGroupedByColor)));
console.log('-------------------------------------------------------------------');
console.log('Most powerful card in colors:');
console.log(this.getMostPowerfulCardInColors(Object.keys(handGroupedByColor)));
console.log('-------------------------------------------------------------------');
console.log('Weakest card in colors:');
console.log(this.getWeakestCardInColors(Object.keys(handGroupedByColor)));
console.log('-------------------------------------------------------------------');
*/

handGroupedByColor = {
	'c': [3, 6],
	'e': [7, 2, 5],
	'b': [11, 10, 7]
};



utils.getMostPowerfulCard([{n:12, c:'o'}, {n:11, c:'o'}], [].includes('o'));
//console.log(utils.getMostPowerfulCard([{n:12, c:'o'}], [].includes('o')));

/*
if(isFirstPlayInGame) {

	if(isBuyer) {

		if(canSing) {

			// Strategy 1.1
			console.log('strategy_1_1');
			console.log(this.strategy_1_1(handGroupedByColor, triunfo));

		}
		else {

			// Strategy 2.1
			console.log('strategy_2_1');
			console.log(this.strategy_2_1(handGroupedByColor, triunfo));

		}

	}
	else if(isTeammateOfBuyer) {

		// Strategy 1.2
		console.log('strategy_1_2');
		console.log(this.strategy_1_2(handGroupedByColor, triunfo));

	}
	else {

		// Get the teammate max bid
		//var maxTeammateBid = this.aiPlayer.getMaxTeammateBid();

		if(winningBid.amount >= 90) {

			// Singing is possible
			// Strategy 3
			console.log('strategy_3');
			console.log(this.strategy_3(handGroupedByColor, triunfo, maxTeammateBid));

		}
		else {

			// Singing is not possible
			// Strategy 4
			console.log('strategy_4');
			return this.strategy_4(handGroupedByColor, triunfo, maxTeammateBid);

		}

	}

}
else if(isFirstPlayInRound) {

	if(isBuyer || isTeammateOfBuyer) {

		if(canSing) {

			// Strategy 5
			console.log('strategy_5');
			console.log(this.strategy_5(handGroupedByColor, triunfo, analytics));

		}
		else {

			// Strategy 6
			console.log('strategy_6');
			console.log(this.strategy_6(handGroupedByColor, triunfo, analytics));

		}

	}
	else {

		if(winningBid.amount >= 90) {

			// Singing is possible
			// Strategy 7
			console.log('strategy_7');
			console.log(this.strategy_7(handGroupedByColor, triunfo, analytics));

		}
		else {

			// Singing is not possible
			// Strategy 8
			console.log('strategy_8');
			console.log(this.strategy_8(handGroupedByColor, triunfo, analytics));

		}

	}

}
else {

	// Follow up card in a round
	// Strategy 9
	//var ongoingPlaysStartIndex = Math.floor(plays.length / 4.0) * 4;
	//var ongoingPlays = _.last(plays, plays.length - ongoingPlaysStartIndex);
	console.log('strategy_9');
	//console.log(this.strategy_9(handGroupedByColor, triunfo, analytics, validCards, ongoingPlays));

}
*/
