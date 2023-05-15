var _ = require('underscore');


var triunfo = 'o';
var handGroupedByColor = {
	'o': [1, 3, 11, 10],
	'c': [12, 10],
	'e': [1, 3],
	'b': [7, 6]
};


// 170 bid test
this.canBid170 = function (handGroupedByColor, triunfo) {

		// The player can bid 170 if he has:
		// all cards in triunfo color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 170: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 10 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 10) {
			console.log('Cannot bid 170: some of the cards are not in triunfo');
			return false;
		}
		
		return true;
};


this.canBid140 = function(handGroupedByColor, triunfo) {

		// The player can bid 140 if he has:
		// 1, 3, 12 & 11 in triunfo color AND
		// 1, 3 in a regular color
		// another 1, 3 in a regular color
		// 12 & 11 in a regular color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 140: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 4 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 4) {
			console.log('Cannot bid 140: hand has less than 4 cards of triunfo');
			return false;
		}

		// If the cards required in triunfo aren't there, no need to check the other cards
		if(_.intersection(handGroupedByColor[triunfo], [1, 3, 12, 11]).length < 4) {
			console.log('Cannot bid 140: hand does not have the 1, 3, 12 and 11 triunfo');
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
			console.log('Cannot bid 140: hand does not have 2 more couples of 1 and 3. It has ' + (regularAsTresCoupleCount <= 0 ? 'none' : regularAsTresCoupleCount));
			return false;
		}

		if(regularSongCount < 1) {
			console.log('Cannot bid 140: hand does not have another song in a regular color');
			return false;
		}


		return true;

}


this.canBid130 = function(handGroupedByColor, triunfo) {

		// The player can bid 130 if he has:
		// 1, 3, 12 & 11 in triunfo color AND
		// 1, 3 in a regular color
		// another 1 in a regular color
		// 12 & 11 in a regular color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 130: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 4 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 4) {
			console.log('Cannot bid 130: hand has less than 4 cards of triunfo');
			return false;
		}

		// If the cards required in triunfo aren't there, no need to check the other cards
		if(_.intersection(handGroupedByColor[triunfo], [1, 3, 12, 11]).length < 4) {
			console.log('Cannot bid 130: hand does not have the 1, 3, 12 and 11 triunfo');
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
			console.log('Cannot bid 130: hand does not have 1 more couple of 1 and 3. It has none');
			return false;
		}

		if(regularSongCount < 1) {
			console.log('Cannot bid 130: hand does not have another song in a regular color');
			return false;
		}

		if(regularAsCount < 2) {
			console.log('Cannot bid 130: hand does not have another As in a regular color');
			return false;
		}


		return true;

}


this.canBid120 = function(handGroupedByColor, triunfo) {

		// The player can bid 120 if he has:
		// what it takes to bid 80 AND
		// has 2 songs where one is in triunfo

		// If the player doesn't have what it takes to bid 80, no need to go further
		if(!this.canBid80(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 120: hand lacks requirements for a bid of 80');
			return false;
		}

		// If the player doesn't have a song in triunfo, no need to continue
		if(_.intersection(handGroupedByColor[triunfo], [12, 11]).length < 2) {
			console.log('Cannot bid 120: hand does not have a song in triunfo');
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
			console.log('Cannot bid 120: hand does not have a song in a regular color');
			return false;
		}


		return true;
	}



this.canBid110 = function(handGroupedByColor, triunfo) {
		
		// The player can bid 110 if he can bid 100 and has an additional song in a regular color
		if(!this.canBid100(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 110: hand lacks requirements for a bid of 100');
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
			console.log('Cannot bid 110: hand does not have an additional song in a regular color');
			return false;
		}


		return true;

	}



this.canBid100 = function(handGroupedByColor, triunfo) {

		// The player can bid 100 if he has what it takes to bid 70 in addition to a song in triunfo
		if(!this.canBid70(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 100: hand lacks requirements for a bid of 70');
			return false;
		}

		// Make sure we have a song in triunfo
		if(_.intersection(handGroupedByColor[triunfo], [12, 11]).length < 2) {
			console.log('Cannot bid 100: hand does not have a song in triunfo');
			return false;
		}

		return true;
	}



this.canBid90 = function(handGroupedByColor, triunfo) {
		
		// The player can bid 90 in 2 cases: he satisfies a hand worth of 80 plus he also has:
		// either: 2 triunfo cards that are 12, 11 or 10 (on top of the As & Tres) as well as a Tres in the same color as the regular As
		// or: a song in a regular color 

		// If the player cannot bid 80
		if(!this.canBid80(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 90: hand lacks requirements for a bid of 80');
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
				console.log('Cannot bid 90: besides the required 1 and 3, the other triunfo cards have no value');
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
				console.log('Cannot bid 90: hand does not have a regular couple of 1 and 3');
				return false;
			}

		}


		return true;

	}



this.canBid80 = function(handGroupedByColor, triunfo) {
		
		// The player can bid 80 if he has:
		// 1, 3 and 2 other random cards in triunfo color AND
		// another 1 in a regular color

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!this.canBid70(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 80: hand lacks requirements for a bid of 70');
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
			console.log('Cannot bid 80: hand does not have another As in a regular color');
			return false;
		}


		return true;

	}


this.canBid70 = function(handGroupedByColor, triunfo) {
		
		// The player can bid 70 if he has:
		// 1, 3 and 2 other random cards in triunfo

		// If the player's hand doesn't contain any triunfo, no need to continue
		if(!_.has(handGroupedByColor, triunfo)) {
			console.log('Cannot bid 70: hand does not have triunfo');
			return false;
		}

		// If the player's hand contains less than 4 cards in triunfo, no need to continue
		if(handGroupedByColor[triunfo].length < 4) {
			console.log('Cannot bid 70: hand has less than 4 cards of triunfo');
			return false;
		}

		// If the cards required in triunfo aren't there, no need to check the other cards
		if(_.intersection(handGroupedByColor[triunfo], [1, 3]).length < 2) {
			console.log('Cannot bid 70: hand does not have the 1 and 3 in triunfo');
			return false;
		}


		return true;

	}






if(this.canBid170(handGroupedByColor, triunfo)) {
	console.log('Can bid 170');
}
else if(this.canBid140(handGroupedByColor, triunfo)) {
	console.log('Can bid 140');
}
else if(this.canBid130(handGroupedByColor, triunfo)) {
	console.log('Can bid 130');
}
else if(this.canBid120(handGroupedByColor, triunfo)) {
	console.log('Can bid 120');
}
else if(this.canBid110(handGroupedByColor, triunfo)) {
	console.log('Can bid 110');
}
else if(this.canBid100(handGroupedByColor, triunfo)) {
	console.log('Can bid 100');
}
else if(this.canBid90(handGroupedByColor, triunfo)) {
	console.log('Can bid 90');
}
else if(this.canBid80(handGroupedByColor, triunfo)) {
	console.log('Can bid 80');
}
else if(this.canBid70(handGroupedByColor, triunfo)) {
	console.log('Can bid 70');
}
else {
	console.log('Pass');
}


