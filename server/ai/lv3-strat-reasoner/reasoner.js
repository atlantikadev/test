var _ = require('underscore');
var config = require('../../../config');
var logUtils = require('../../utils/log-utils');
var reasonerUtils = require('./reasoner-utils');
var gameUtils = require('../../core/game-utils');


function Level3StrategyReasoner(aiPlayer, config) {


    this.aiPlayer = aiPlayer;
    this.config = config;
    

    //#region BIDDING

    this.canBid170 = function (handGroupedByColor, triunfo) {

        // The player can bid 170 if he has:
        // all cards in triunfo color

        // If the player's hand doesn't contain any triunfo, no need to continue
        if (!_.has(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 170: hand does not have triunfo');
            return false;
        }

        // If the player's hand contains less than 10 cards in triunfo, no need to continue
        if (handGroupedByColor[triunfo].length < 10) {
            logUtils.log('Cannot bid 170: some of the cards are not in triunfo');
            return false;
        }

        return true;
    }


    this.canBid140 = function (handGroupedByColor, triunfo) {

        // The player can bid 140 if he has:
        // 1, 3, 12 & 11 in triunfo color AND
        // 1, 3 in a regular color
        // another 1, 3 in a regular color
        // 12 & 11 in a regular color

        // If the player's hand doesn't contain any triunfo, no need to continue
        if (!_.has(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 140: hand does not have triunfo');
            return false;
        }

        // If the player's hand contains less than 4 cards in triunfo, no need to continue
        if (handGroupedByColor[triunfo].length < 4) {
            logUtils.log('Cannot bid 140: hand has less than 4 cards of triunfo');
            return false;
        }

        // If the cards required in triunfo aren't there, no need to check the other cards
        if (_.intersection(handGroupedByColor[triunfo], [1, 3, 12, 11]).length < 4) {
            logUtils.log('Cannot bid 140: hand does not have the 1, 3, 12 and 11 triunfo');
            return false;
        }

        // Check if there are 2 other couples of As & Tres in the remaining colors as well as 1 other song
        var regularAsTresCoupleCount = 0;
        var regularSongCount = 0;

        for (var color in handGroupedByColor) {
            if (color !== triunfo) {
                if (_.intersection(handGroupedByColor[color], [1, 3]).length == 2) {
                    regularAsTresCoupleCount++;
                }
                if (_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
                    regularSongCount++;
                }
            }
        }

        if (regularAsTresCoupleCount < 2) {
            logUtils.log('Cannot bid 140: hand does not have 2 more couples of 1 and 3. It has ' + (regularAsTresCoupleCount <= 0 ? 'none' : regularAsTresCoupleCount));
            return false;
        }

        if (regularSongCount < 1) {
            logUtils.log('Cannot bid 140: hand does not have another song in a regular color');
            return false;
        }


        return true;

    }


    this.canBid130 = function (handGroupedByColor, triunfo) {

        // The player can bid 130 if he has:
        // 1, 3, 12 & 11 in triunfo color AND
        // 1, 3 in a regular color
        // another 1 in a regular color
        // 12 & 11 in a regular color

        // If the player's hand doesn't contain any triunfo, no need to continue
        if (!_.has(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 130: hand does not have triunfo');
            return false;
        }

        // If the player's hand contains less than 4 cards in triunfo, no need to continue
        if (handGroupedByColor[triunfo].length < 4) {
            logUtils.log('Cannot bid 130: hand has less than 4 cards of triunfo');
            return false;
        }

        // If the cards required in triunfo aren't there, no need to check the other cards
        if (_.intersection(handGroupedByColor[triunfo], [1, 3, 12, 11]).length < 4) {
            logUtils.log('Cannot bid 130: hand does not have the 1, 3, 12 and 11 triunfo');
            return false;
        }

        // Check if there are 1 other couple of As & Tres in the remaining colors, another 1 as well as 1 other song
        var regularAsTresCoupleCount = 0;
        var regularAsCount = 0;
        var regularSongCount = 0;

        for (var color in handGroupedByColor) {
            if (color !== triunfo) {

                if (_.contains(handGroupedByColor[color], 1)) {
                    regularAsCount++;
                }

                if (_.intersection(handGroupedByColor[color], [1, 3]).length == 2) {
                    regularAsTresCoupleCount++;
                }

                if (_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
                    regularSongCount++;
                }
            }
        }

        if (regularAsTresCoupleCount < 1) {
            logUtils.log('Cannot bid 130: hand does not have 1 more couple of 1 and 3. It has none');
            return false;
        }

        if (regularSongCount < 1) {
            logUtils.log('Cannot bid 130: hand does not have another song in a regular color');
            return false;
        }

        if (regularAsCount < 2) {
            logUtils.log('Cannot bid 130: hand does not have another As in a regular color');
            return false;
        }


        return true;

    }


    this.canBid120 = function (handGroupedByColor, triunfo) {

        // The player can bid 120 if he has:
        // what it takes to bid 80 AND
        // has 2 songs where one is in triunfo

        // If the player doesn't have what it takes to bid 80, no need to go further
        if (!this.canBid80(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 120: hand lacks requirements for a bid of 80');
            return false;
        }

        // If the player doesn't have a song in triunfo, no need to continue
        if (_.intersection(handGroupedByColor[triunfo], [12, 11]).length < 2) {
            logUtils.log('Cannot bid 120: hand does not have a song in triunfo');
            return false;
        }

        // Check if there is at least one song in a regular color
        var regularSongCount = 0;

        for (var color in handGroupedByColor) {
            if (color !== triunfo) {

                if (_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
                    regularSongCount++;
                }
            }
        }

        if (regularSongCount < 1) {
            logUtils.log('Cannot bid 120: hand does not have a song in a regular color');
            return false;
        }


        return true;

    }


    this.canBid110 = function (handGroupedByColor, triunfo) {

        // The player can bid 110 if he can bid 100 and has an additional song in a regular color
        if (!this.canBid100(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 110: hand lacks requirements for a bid of 100');
            return false;
        }

        // Check if there is at least one song in a regular color
        var regularSongCount = 0;

        for (var color in handGroupedByColor) {
            if (color !== triunfo) {

                if (_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
                    regularSongCount++;
                }
            }
        }

        if (regularSongCount < 1) {
            logUtils.log('Cannot bid 110: hand does not have an additional song in a regular color');
            return false;
        }


        return true;

    }


    this.canBid100 = function (handGroupedByColor, triunfo) {

        // The player can bid 100 if he has what it takes to bid 70 in addition to a song in triunfo
        if (!this.canBid70(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 100: hand lacks requirements for a bid of 70');
            return false;
        }

        // Make sure we have a song in triunfo
        if (_.intersection(handGroupedByColor[triunfo], [12, 11]).length < 2) {
            logUtils.log('Cannot bid 100: hand does not have a song in triunfo');
            return false;
        }

        return true;

    }


    this.canBid90 = function (handGroupedByColor, triunfo) {

        // The player can bid 90 in 2 cases: he satisfies a hand worth of 80 plus he also has:
        // either: 2 triunfo cards that are 12, 11 or 10 (on top of the As & Tres) as well as a Tres in the same color as the regular As
        // or: a song in a regular color 

        // If the player cannot bid 80
        if (!this.canBid80(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 90: hand lacks requirements for a bid of 80');
            return false;
        }

        // Check if there is at least one song in a regular color
        var regularSongCount = 0;

        for (var color in handGroupedByColor) {
            if (color !== triunfo) {

                if (_.intersection(handGroupedByColor[color], [12, 11]).length == 2) {
                    regularSongCount++;
                }
            }
        }

        if (regularSongCount < 1) {

            // There's no song in a regular color, check if we have 2 triunfo colors that are 10 or better as well as one As & Tres couple
            if (_.intersection(handGroupedByColor[triunfo], [12, 11, 10]).length < 2) {
                logUtils.log('Cannot bid 90: besides the required 1 and 3, the other triunfo cards have no value');
                return false;
            }

            // We have 2 good cards in triunfo now make sure we have a couple of As & Tres
            var regularAsTresCoupleCount = 0;

            for (var color in handGroupedByColor) {
                if (color !== triunfo) {
                    if (_.intersection(handGroupedByColor[color], [1, 3]).length == 2) {
                        regularAsTresCoupleCount++;
                    }
                }
            }

            if (regularAsTresCoupleCount < 1) {
                logUtils.log('Cannot bid 90: hand does not have a regular couple of 1 and 3');
                return false;
            }

        }


        return true;

    }


    this.canBid80 = function (handGroupedByColor, triunfo) {

        // The player can bid 80 if he has:
        // 1, 3 and 2 other random cards in triunfo color AND
        // another 1 in a regular color

        // If the player's hand doesn't contain any triunfo, no need to continue
        if (!this.canBid70(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 80: hand lacks requirements for a bid of 70');
            return false;
        }

        // Check if there is one other As in another color
        var regularAsCount = 0;

        for (var color in handGroupedByColor) {
            if (color !== triunfo) {

                if (_.contains(handGroupedByColor[color], 1)) {
                    regularAsCount++;
                }
            }
        }

        if (regularAsCount < 1) {
            logUtils.log('Cannot bid 80: hand does not have another As in a regular color');
            return false;
        }


        return true;

    }


    this.canBid70 = function (handGroupedByColor, triunfo) {

        // The player can bid 70 if he has:
        // 1, 3 and 2 other random cards in triunfo

        // If the player's hand doesn't contain any triunfo, no need to continue
        if (!_.has(handGroupedByColor, triunfo)) {
            logUtils.log('Cannot bid 70: hand does not have triunfo');
            return false;
        }

        // If the player's hand contains less than 4 cards in triunfo, no need to continue
        if (handGroupedByColor[triunfo].length < 4) {
            logUtils.log('Cannot bid 70: hand has less than 4 cards of triunfo');
            return false;
        }

        // If the cards required in triunfo aren't there, no need to check the other cards
        if (_.intersection(handGroupedByColor[triunfo], [1, 3]).length < 2) {
            logUtils.log('Cannot bid 70: hand does not have the 1 and 3 in triunfo');
            return false;
        }


        return true;

    }

    //#endregion


    //#region PLAY

    //#region STRATEGY 1.1

    // First play in the game. The player is the buyer. Singing is planned.
    this.strategy_1_1 = function(handGroupedByColor, triunfo, availableSingingColors, analytics) {

        logUtils.log('STRATEGY 1.1', 5);
		logUtils.log('Params: handGroupedByColor', 1);
		logUtils.log(handGroupedByColor);
		logUtils.log('Params: triunfo', 1);
		logUtils.log(triunfo);
		logUtils.log('Params: availableSingingColors', 1);
		logUtils.log(availableSingingColors);
		logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);
        

        //#region OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing
        logUtils.log('OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing', 2);

        logUtils.log('Song count is ' + availableSingingColors.length, 1);
        
        var colorOfMostVulnerableSong = reasonerUtils.getColorOfMostVulnerableSong(handGroupedByColor, triunfo, availableSingingColors, analytics);
        if(colorOfMostVulnerableSong !== null) {

            logUtils.log('The song in ' + colorOfMostVulnerableSong + ' is most vulnerable');

            //#region SUB OBJECTIVE 1.A: attempt to play the As triunfo
            logUtils.log('SUB OBJECTIVE 1.A: attempt to play the As triunfo', 1);

            var asTriunfo = reasonerUtils.getAsTriunfo(handGroupedByColor, triunfo);
            if(asTriunfo !== null) {
				logUtils.log('CLEAR');
                return asTriunfo;                
            }
            else {
                logUtils.log('player does not have the As in triunfo');
				logUtils.log('MISS');
            }
            
            //#endregion


            //#region SUB OBJECTIVE 1.B: playing the As of a color with at least 7 remaining cards
            logUtils.log('SUB OBJECTIVE 1.B: playing the As of a color with at least 7 remaining cards', 1);

            var asOfColorWithAtLeast7RemainingCards = reasonerUtils.getAsOfColorWithAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
            if(asOfColorWithAtLeast7RemainingCards !== null) {
				logUtils.log('CLEAR');
                return asOfColorWithAtLeast7RemainingCards;                
            }
            else {
                logUtils.log('player does not have a color with As and at least 7 remaining cards');
				logUtils.log('MISS');
            }

            //#endregion

        }

        //#endregion


        //#region OBJECTIVE 2: help the teammate win the round if possible
        logUtils.log('OBJECTIVE 2: help the teammate win the round if possible', 2);

        //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards
        logUtils.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards', 1);
        
        var _7Or10OfColorWithNoAsAndAtLeast7RemainingCards = reasonerUtils.get7Or10OfColorWithNoAsAndAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
        if(_7Or10OfColorWithNoAsAndAtLeast7RemainingCards !== null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithNoAsAndAtLeast7RemainingCards;                
        }
        else {
            logUtils.log('player does not have a color without As, with a 7 or 10 and at least 7 remaining cards');
			logUtils.log('MISS');
        }
        
        //#endregion

        //#endregion


        //#region OBJECTIVE 3: protect a vulnerable song if any
        logUtils.log('OBJECTIVE 3: protect a vulnerable song if any', 2);

        //#region SUB OBJECTIVE 3.A: play the 7 or 6 of the same color of the vulnerable song
        logUtils.log('SUB OBJECTIVE 3.A: play the 7 or 6 of the same color of the vulnerable song', 1);

        if(colorOfMostVulnerableSong !== null) {
            var _7Or6OfSongColor = reasonerUtils.get7Or6OfColor(handGroupedByColor, colorOfMostVulnerableSong);
            if(_7Or6OfSongColor !== null) {
                logUtils.log('CLEAR');
                return _7Or6OfSongColor;                
            }
            else {
                logUtils.log('The player does not have the 7 nor 6 in the vulnerable song color: ' + colorOfMostVulnerableSong);
                logUtils.log('MISS');
            }
        }
        else {
            logUtils.log('The player does not have a vulnerable song');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 4: protect a vulnerable 3 if any', 2);
        
        //#region SUB OBJECTIVE 4.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 4.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
		if(colorsOfAllVulnerable3s.length > 0) {

			logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, availableSingingColors, colorsOfAllVulnerable3s);
            if(protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard; 
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }			
		}
		else {
			logUtils.log('The player does not have any 3 that is vulnerable');
			logUtils.log('MISS');
		}

        //#endregion

        //#endregion


        //#region OBJECTIVE 5: play a vulnerable As if any
        logUtils.log('OBJECTIVE 5: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if(vulnerableAs !== null) {
            logUtils.log('CLEAR');            
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
			logUtils.log('MISS');
        }
        
        //#endregion


        //#region OBJECTIVE 6: try to make opponents lose the triunfo
        logUtils.log('OBJECTIVE 6: try to make opponents lose the triunfo', 2);

        //#region SUB OBJECTIVE 6.A: attempt to exhaust the triunfo
        logUtils.log('SUB OBJECTIVE 6.A: attempt to exhaust the triunfo', 1);

        if(reasonerUtils.canPlayerExhaustTriunfo(handGroupedByColor, triunfo)) {
            
            logUtils.log('The player meets the requirements to exhaust the triunfo');

            var weakestWinningTriunfoCard = reasonerUtils.getWeakestWinningTriunfoCard(handGroupedByColor, triunfo, availableSingingColors, analytics);

            logUtils.log('CLEAR');
            return weakestWinningTriunfoCard;
        }
        else {
            logUtils.log('The player does not meet the requirements to exhaust the triunfo');
            logUtils.log('MISS');
        }        

        //#endregion


        //#region SUB OBJECTIVE 6.B: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 6.B: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, true);
        if(weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 6.C: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 6.C: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 1.1 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 1.2

    // First play in the game. The player is the teammate of the buyer. Singing is planned.
    this.strategy_1_2 = function(handGroupedByColor, triunfo, availableSingingColors, analytics) {
        
        logUtils.log('STRATEGY 1.2', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: availableSingingColors', 1);
        logUtils.log(availableSingingColors);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing
        logUtils.log('OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing', 2);
        
        logUtils.log('Song count is ' + availableSingingColors.length, 1);
        
        var colorOfMostVulnerableSong = reasonerUtils.getColorOfMostVulnerableSong(handGroupedByColor, triunfo, availableSingingColors, analytics);
        if(colorOfMostVulnerableSong !== null) {

            logUtils.log('The song in ' + colorOfMostVulnerableSong + ' is most vulnerable');

            //#region SUB OBJECTIVE 1.A: attempt to play the As triunfo
            logUtils.log('SUB OBJECTIVE 1.A: attempt to play the As triunfo', 1);

            var asTriunfo = reasonerUtils.getAsTriunfo(handGroupedByColor, triunfo);
            if(asTriunfo !== null) {
                logUtils.log('CLEAR');
                return asTriunfo;                
            }
            else {
                logUtils.log('player does not have the As in triunfo');
                logUtils.log('MISS');
            }
            
            //#endregion


            //#region SUB OBJECTIVE 1.B: playing the 7 or 10 triunfo if available
            logUtils.log('SUB OBJECTIVE 1.B: playing the 7 or 10 triunfo if available', 1);            

            var _7Or10Triunfo = reasonerUtils.get7Or10Triunfo(handGroupedByColor, triunfo);
            if(_7Or10Triunfo !== null) {
                logUtils.log('CLEAR');
                return _7Or10Triunfo;
            }
            else {
                logUtils.log('The player does not have the 7 nor 10 triunfo');
				logUtils.log('MISS');
            }

            //#endregion


            //#region SUB OBJECTIVE 1.C: play the weakest triunfo card
            logUtils.log('SUB OBJECTIVE 1.C: play the weakest triunfo card', 1);                        
            
            var weakestTriunfoCard = reasonerUtils.getWeakestTriunfoCard(handGroupedByColor, triunfo);
            if(weakestTriunfoCard !== null) {
                logUtils.log('CLEAR');
                return weakestTriunfoCard;
            }
            else {
                logUtils.log('player does not have any triunfo');
				logUtils.log('MISS');
            }

            //#endregion


            //#region SUB OBJECTIVE 1.D: play the As of a color with at least 7 remaining cards
            logUtils.log('SUB OBJECTIVE 1.D: play the As of a color with at least 7 remaining cards', 1);

            var asOfColorWithAtLeast7RemainingCards = reasonerUtils.getAsOfColorWithAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
            if(asOfColorWithAtLeast7RemainingCards !== null) {
				logUtils.log('CLEAR');
                return asOfColorWithAtLeast7RemainingCards;                
            }
            else {
                logUtils.log('player does not have a color with As and at least 7 remaining cards');
				logUtils.log('MISS');
            }
            
            //#endregion

        }

        //#endregion


        //#region OBJECTIVE 2: help the teammate win the round if possible
        logUtils.log('OBJECTIVE 2: help the teammate win the round if possible', 2);
        
        //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards
        logUtils.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards', 1);
        
        var _7Or10OfColorWithNoAsAndAtLeast7RemainingCards = reasonerUtils.get7Or10OfColorWithNoAsAndAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
        if(_7Or10OfColorWithNoAsAndAtLeast7RemainingCards !== null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithNoAsAndAtLeast7RemainingCards;                
        }
        else {
            logUtils.log('player does not have a color without As, with a 7 or 10 and at least 7 remaining cards');
            logUtils.log('MISS');
        }
        
        //#endregion

        //#endregion


        //#region OBJECTIVE 3: protect a vulnerable song if any
        logUtils.log('OBJECTIVE 3: protect a vulnerable song if any', 2);
        
        //#region SUB OBJECTIVE 3.A: play the 7 or 6 of the same color of the vulnerable song
        logUtils.log('SUB OBJECTIVE 3.A: play the 7 or 6 of the same color of the vulnerable song', 1);

        if(colorOfMostVulnerableSong !== null) {
            var _7Or6OfSongColor = reasonerUtils.get7Or6OfColor(handGroupedByColor, colorOfMostVulnerableSong);
            if(_7Or6OfSongColor !== null) {
                logUtils.log('CLEAR');
                return _7Or6OfSongColor;                
            }
            else {
                logUtils.log('The player does not have the 7 nor 6 in the vulnerable song color: ' + colorOfMostVulnerableSong);
                logUtils.log('MISS');
            }
        }
        else {
            logUtils.log('The player does not have a vulnerable song');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 4: protect a vulnerable 3 if any', 2);
        
        //#region SUB OBJECTIVE 4.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 4.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if(colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, availableSingingColors, colorsOfAllVulnerable3s);
            if(protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard; 
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }			
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion
        
        
        //#region OBJECTIVE 5: play a vulnerable As if any
        logUtils.log('OBJECTIVE 5: play a vulnerable As if any', 2);
        
        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if(vulnerableAs !== null) {
            logUtils.log('CLEAR');            
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }
        
        //#endregion


        //#region OBJECTIVE 6: try to make opponents lose triunfo
        logUtils.log('OBJECTIVE 6: try to make opponents lose triunfo', 2);
        
        //#region SUB OBJECTIVE 6.A: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 6.A: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, true);
        if(weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 6.B: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 6.B: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 1.2 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 2

    // First play in the game. The player is from the buying team. Singing is unavailable.
    this.strategy_2 = function(handGroupedByColor, triunfo, analytics) {
        
        logUtils.log('STRATEGY 2', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: exhaust triunfo if advantageous
        logUtils.log('OBJECTIVE 1: exhaust triunfo if advantageous', 2);
        
        //#region SUB OBJECTIVE 1.A: attempt to exhaust triunfo
        logUtils.log('SUB OBJECTIVE 1.A: attempt to exhaust triunfo', 1);

        if(reasonerUtils.canPlayerExhaustTriunfo(handGroupedByColor, triunfo)) {
            
            logUtils.log('The player meets the requirements to exhaust the triunfo');

            var weakestWinningTriunfoCard = reasonerUtils.getWeakestWinningTriunfoCard(handGroupedByColor, triunfo, [], analytics);

            logUtils.log('CLEAR');
            return weakestWinningTriunfoCard;
        }
        else {
            logUtils.log('The player does not meet the requirements to exhaust the triunfo');
            logUtils.log('MISS');
        }        

        //#endregion
                
        //#endregion


        //#region OBJECTIVE 2: help the teammate win the round if possible
        logUtils.log('OBJECTIVE 2: help the teammate win the round if possible', 2);
        
        //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards
        logUtils.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with no As and with at least 7 remaining cards', 1);
        
        var _7Or10OfColorWithNoAsAndAtLeast7RemainingCards = reasonerUtils.get7Or10OfColorWithNoAsAndAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
        if(_7Or10OfColorWithNoAsAndAtLeast7RemainingCards !== null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithNoAsAndAtLeast7RemainingCards;                
        }
        else {
            logUtils.log('player does not have a color without As, with a 7 or 10 and at least 7 remaining cards');
            logUtils.log('MISS');
        }
        
        //#endregion

        //#endregion


        //#region OBJECTIVE 3: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 3: protect a vulnerable 3 if any', 2);
        
        //#region SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if(colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, [], colorsOfAllVulnerable3s);
            if(protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard; 
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }			
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: play a vulnerable As if any
        logUtils.log('OBJECTIVE 4: play a vulnerable As if any', 2);
        
        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if(vulnerableAs !== null) {
            logUtils.log('CLEAR');            
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }
        
        //#endregion


        //#region OBJECTIVE 5: try to make opponents lose triunfo
        logUtils.log('OBJECTIVE 5: try to make opponents lose triunfo', 2);
        
        //#region SUB OBJECTIVE 5.A: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 5.A: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, true);
        if(weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 5.B: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 5.B: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 2 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 3

    // First play in the game. The player does not belong to the buying team. Singing is planned.
    this.strategy_3 = function (handGroupedByColor, triunfo, analytics, suspectedSingingColors) {
        
        logUtils.log('STRATEGY 3', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: attempt to break a song if deemed vulnerable
        logUtils.log('OBJECTIVE 1: attempt to break a song if deemed vulnerable', 2);
        
        //#region SUB OBJECTIVE 1.A: play the As of a color with no 12 nor 11 and with a max of 3 cards including the As
        logUtils.log('SUB OBJECTIVE 1.A: play the As of a color with no 12 nor 11 and with a max of 3 cards including the As', 1);

        //var songBreakerAs = reasonerUtils.getAsOfColorWithAtLeast7RemainingCardsInc12And11(handGroupedByColor, triunfo, analytics);
        var songBreakerAs = reasonerUtils.getSuitableSongBreakingAsFromColors(handGroupedByColor, analytics, suspectedSingingColors);
        if(songBreakerAs != null) {

            logUtils.log('CLEAR');
            return songBreakerAs;            

        }
        else {

            logUtils.log('player does not have a song breaking As');
            logUtils.log('MISS');

        }

        //#endregion
        

        //#region SUB OBJECTIVE 1.B: play the 10 or 7 of a color with no 12 nor 11
        logUtils.log('SUB OBJECTIVE 1.B: play the 10 or 7 of a color with no 12 nor 11', 1);

        //var songBreaker10Or7 = reasonerUtils.get10Or7OfColorWithout12And11(handGroupedByColor, triunfo);
        var songBreaker10Or7 = reasonerUtils.getSuitableSongBreaking10Or7FromColors(handGroupedByColor, analytics, suspectedSingingColors);
        if(songBreaker10Or7 != null) {

            logUtils.log('CLEAR');
            return songBreaker10Or7;            

        }
        else {

            logUtils.log('player does not have a 10 or 7 in a color with no 12 nor 11');
            logUtils.log('MISS');

        }

        //#endregion            

        //#endregion
    
    
        //#region OBJECTIVE 2: help the teammate win the round if possible so he can try to break the song
        logUtils.log('OBJECTIVE 2: help the teammate win the round if possible so he can try to break the song', 2);
        
        //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with at least 7 remaining cards and where the teammate is expected to have the top card
        logUtils.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with at least 7 remaining cards and where the teammate is expected to have the top card', 1);
        
        var _7Or10OfColorWithNoAsAndAtLeast7RemainingCards = reasonerUtils.get7Or10OfColorWithNoAsAndAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
        if(_7Or10OfColorWithNoAsAndAtLeast7RemainingCards !== null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithNoAsAndAtLeast7RemainingCards;                
        }
        else {
            logUtils.log('player does not have a color without As, with a 7 or 10 and at least 7 remaining cards');
            logUtils.log('MISS');
        }
        
        //#endregion


        //#region SUB OBJECTIVE 2.B: play the weakest card of a color where the teammate is suspected to have the top card
        logUtils.log('SUB OBJECTIVE 2.B: play the weakest card of a color where the teammate is suspected to have the top card', 2);

        var smallestCardOfColorWithNoAsAnsAtLeast7RemainingCards = reasonerUtils.getWeakestCardOfColorWithLeastCardsAndNoAs(handGroupedByColor, triunfo, false);
        if(smallestCardOfColorWithNoAsAnsAtLeast7RemainingCards != null) {
            logUtils.log('CLEAR');
            return smallestCardOfColorWithNoAsAnsAtLeast7RemainingCards;
        }
        else {
            logUtils.log('player does not have the smallest card of a color where the teammate is suspected to have the top card');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion
    

        //#region OBJECTIVE 3: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 3: protect a vulnerable 3 if any', 2);
        
        //#region SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if(colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, [], colorsOfAllVulnerable3s);
            if(protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard; 
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }			
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: exhaust own triunfo if not needed in order to pass vulnerable cards to teammate
        logUtils.log('OBJECTIVE 4: exhaust own triunfo if not needed in order to pass vulnerable cards to teammate', 2);

        //#region SUB OBJECTIVE 4.A: play the weakest triunfo card
        logUtils.log('SUB OBJECTIVE 4.A: play the weakest triunfo card', 1);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        var presentColorsCount = _.reduce(Object.keys(handGroupedByColor), function(sum, color) { return sum + (handGroupedByColor[color].length > 0 ? 1 : 0); }, 0);

        if(presentColorsCount == 4 && (vulnerableAs !== null || colorsOfAllVulnerable3s.length > 0)) {

            logUtils.log('CLEAR');
            var weakestTriunfoCard = reasonerUtils.getWeakestTriunfoCard(handGroupedByColor, triunfo);
            return weakestTriunfoCard;

        }
        else {

            logUtils.log('The player either does not have a card in each color or no vulnerable As or 3');
            logUtils.log('MISS');

        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 5: play a vulnerable As if any
        logUtils.log('OBJECTIVE 5: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if(vulnerableAs !== null) {
            logUtils.log('CLEAR');            
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }
        
        //#endregion


        //#region OBJECTIVE 6: try to make opponents lose triunfo
        logUtils.log('OBJECTIVE 6: try to make opponents lose triunfo', 2);
        
        //#region SUB OBJECTIVE 6.A: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 6.A: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, false);
        if(weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 6.B: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 6.B: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 3 and still could not find a card to play!');

    }
    
    //#endregion


    //#region STRATEGY 4

    // First play in the game. The player is not in the buying team. Singing is not planned.
    this.strategy_4 = function(handGroupedByColor, triunfo, analytics) {
        
        logUtils.log('STRATEGY 4', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: help the teammate win great cards
        logUtils.log('OBJECTIVE 1: help the teammate win great cards', 2);
        
        //#region SUB OBJECTIVE 1.A: play the 7 or 10 of a color with at least 7 remaining cards and where the teammate is expected to have the top card
        logUtils.log('SUB OBJECTIVE 1.A: play the 7 or 10 of a color with at least 7 remaining cards and where the teammate is expected to have the top card', 1);
        
        var _7Or10OfColorWithNoAsAndAtLeast7RemainingCards = reasonerUtils.get7Or10OfColorWithNoAsAndAtLeast7RemainingCards(handGroupedByColor, triunfo, analytics);
        if(_7Or10OfColorWithNoAsAndAtLeast7RemainingCards !== null) {

            logUtils.log('CLEAR');
            return _7Or10OfColorWithNoAsAndAtLeast7RemainingCards;

        }
        else {

            logUtils.log('The player does not have a color without As, with a 7 or 10 and at least 7 remaining cards');
            logUtils.log('MISS');

        }
        
        //#endregion

        //#endregion
    

        //#region OBJECTIVE 2: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 2: protect a vulnerable 3 if any', 2);
        
        //#region SUB OBJECTIVE 2.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 2.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if(colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, [], colorsOfAllVulnerable3s);
            if(protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard; 
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }			
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 3: exhaust own triunfo if not needed in order to pass good cards to teammate
        logUtils.log('OBJECTIVE 3: exhaust own triunfo if not needed in order to pass good cards to teammate', 2);

        //#region SUB OBJECTIVE 3.A: play the weakest triunfo card
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest triunfo card', 1);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        var presentColorsCount = _.reduce(Object.keys(handGroupedByColor), function(sum, color) { return sum + (handGroupedByColor[color].length > 0 ? 1 : 0); }, 0);

        if(presentColorsCount == 4 && (vulnerableAs !== null || colorsOfAllVulnerable3s.length > 0)) {

            logUtils.log('CLEAR');
            var weakestTriunfoCard = reasonerUtils.getWeakestTriunfoCard(handGroupedByColor, triunfo);
            return weakestTriunfoCard;

        }
        else {
            logUtils.log('The player either does not have a card in each color or no vulnerable As or 3');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: play a vulnerable As if any
        logUtils.log('OBJECTIVE 4: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if(vulnerableAs !== null) {
            logUtils.log('CLEAR');            
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }
        
        //#endregion


        //#region OBJECTIVE 5: try to make opponents lose triunfo
        logUtils.log('OBJECTIVE 5: try to make opponents lose triunfo', 2);
        
        //#region SUB OBJECTIVE 5.A: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 5.A: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, false);
        if(weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 5.B: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 5.B: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 4 and still could not find a card to play!');

    }
    
    //#endregion


    //#region STRATEGY 5

    // First play in round 2+. The player is in the buying team. Singing is planned.
    this.strategy_5 = function(handGroupedByColor, triunfo, availableSingingColors, analytics) {
        
        logUtils.log('STRATEGY 5', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: availableSingingColors', 1);
        logUtils.log(availableSingingColors);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing
        logUtils.log('OBJECTIVE 1: if there is a vulnerable song, try to win the round to sing', 2);
        
        logUtils.log('Song count is ' + availableSingingColors.length, 1);
        
        var colorOfMostVulnerableSong = reasonerUtils.getColorOfMostVulnerableSong(handGroupedByColor, triunfo, availableSingingColors, analytics);
        if(colorOfMostVulnerableSong !== null) {

            logUtils.log('The song in ' + colorOfMostVulnerableSong + ' is most vulnerable');            

            // If the opponents no longer have any triunfo
            if(analytics.rightOppTopPossibleCardByColor[triunfo] == 0 && analytics.leftOppTopPossibleCardByColor[triunfo] == 0) {

                logUtils.log('The opponents do not have any triunfo left');

                //#region SUB OBJECTIVE 1.A: if the player has the most powerful card in a color other than triunfo and the opponents do not have any triunfo, play that card
                logUtils.log('SUB OBJECTIVE 1.A: if the player has the most powerful card in a color other than triunfo and the opponents do not have any triunfo, play that card', 1);
            
                var myWinningCardInAnyColor = reasonerUtils.getWinningCardOfAnyColor(_.without(['o', 'c', 'b', 'e'], triunfo), handGroupedByColor, triunfo, analytics, availableSingingColors, 0);
                if(myWinningCardInAnyColor !== null) {
                    logUtils.log('CLEAR');
                    return myWinningCardInAnyColor;
                }
                else {
                    logUtils.log('The player does not have a top card in any color other than triunfo');
                    logUtils.log('MISS');
                }
                
                //#endregion

            }
            else {

                //#region SUB OBJECTIVE 1.A: if the player has the most powerful card in a color other than triunfo and the opponents do not have any triunfo, play that card
                logUtils.log('SUB OBJECTIVE 1.A: if the player has the most powerful card in a color other than triunfo and the opponents do not have any triunfo, play that card', 1);

                logUtils.log('The opponents still have triunfo');
                logUtils.log('MISS');

                //#endregion


                //#region SUB OBJECTIVE 1.B: if the player has a winning triunfo card, play that card
                logUtils.log('SUB OBJECTIVE 1.B: if the player has a winning triunfo card, play that card', 1);

                var myWinningTriunfoCard = reasonerUtils.getWinningCardOfAnyColor([triunfo], handGroupedByColor, triunfo, analytics, availableSingingColors, 0);
                if(myWinningTriunfoCard !== null) {
                    logUtils.log('CLEAR');
                    return myWinningTriunfoCard;
                }
                else {
                    logUtils.log('The player does not have a winning triunfo card');
                    logUtils.log('MISS');
                }

                //#endregion


                //#region SUB OBJECTIVE 1.C: if the player has the most powerful in a color other than triunfo for which remains more than 4 cards, risk it and play it
                logUtils.log('SUB OBJECTIVE 1.C: if the player has the most powerful in a color other than triunfo for which remains more than 4 cards, risk it and play it', 1);
                
                var remainingCardCount = 4;
                var myWinningCardOfAnyColorWithAtLeast4RemainingCards = reasonerUtils.getWinningCardOfAnyColor(_.without(['o', 'c', 'b', 'e'], triunfo), handGroupedByColor, triunfo, analytics, availableSingingColors, remainingCardCount);
                if(myWinningCardOfAnyColorWithAtLeast4RemainingCards !== null) {
                    logUtils.log('CLEAR');
                    return myWinningCardOfAnyColorWithAtLeast4RemainingCards;
                }
                else {
                    logUtils.log('The player does not have the most powerful card of a color with ' + remainingCardCount + ' remaining cards');
                    logUtils.log('MISS');
                }

                //#endregion

            }
        }

        //#endregion


        //#region OBJECTIVE 2: help the teammate win good cards
        logUtils.log('OBJECTIVE 2: help the teammate win good cards', 2);

        //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with at least 4 remaining cards and where the teammate cannot have a song
        logUtils.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with at least 4 remaining cards and where the teammate cannot have a song', 1);

        var _7Or10OfColorWithAtLeast4RemainingCards = reasonerUtils.get7Or10OfColorWith11Or12AndAtLeastXRemainingCards(handGroupedByColor, triunfo, analytics, 4);
        if(_7Or10OfColorWithAtLeast4RemainingCards != null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithAtLeast4RemainingCards;  
        }
        else {
            logUtils.log('The player does not have the 7 or 10 of a color with at least 4 remaining cards and where the teammate cannot have a song');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 2.B: if the teammate of the player has the most powerful triunfo card, play the 7 or 10 or a color with at most 2 remaining card
        logUtils.log('SUB OBJECTIVE 2.B: if the teammate of the player has the most powerful triunfo card, play the 7 or 10 or a color with at most 2 remaining card', 1);

        if(gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[triunfo], analytics.rightOppTopPossibleCardByColor[triunfo]) &&
            gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[triunfo], analytics.leftOppTopPossibleCardByColor[triunfo])) {

            logUtils.log('The teammate most powerful triunfo card possibly overpowers the opponents');

            var _7Or10OfColorWithAtMost2RemainingCards = reasonerUtils.get7Or10OfColorWithAtMostXRemainingCards(handGroupedByColor, triunfo, analytics, 2);
            if(_7Or10OfColorWithAtMost2RemainingCards != null) {
                logUtils.log('CLEAR');
                return _7Or10OfColorWithAtMost2RemainingCards; 
            }
            else {
                logUtils.log('The player does not have the 7 or 10 of a color with at most 2 remaining cards');
                logUtils.log('MISS');
            }

        }
        else {
            logUtils.log('The teammate either does not have the most powerful triunfo card or none at all');
            logUtils.log('MISS');
        }

        
        //#endregion

        //#endregion


        //#region OBJECTIVE 3: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 3: protect a vulnerable 3 if any', 2);
        
        //#region SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if(colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, availableSingingColors, colorsOfAllVulnerable3s);
            if(protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard; 
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }			
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: play a vulnerable As if any
        logUtils.log('OBJECTIVE 4: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if(vulnerableAs !== null) {
            logUtils.log('CLEAR');            
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }
        
        //#endregion


        //#region OBJECTIVE 5: make the opponents lose triunfo against useless cards
        logUtils.log('OBJECTIVE 5: make the opponents lose triunfo against useless cards', 2);
        
        //#region SUB OBJECTIVE 5.A: if opponents still have triunfo, play the weakest card (below 7) of a color the opponents do not have
        logUtils.log('SUB OBJECTIVE 5.A: if opponents still have triunfo, play the weakest card (below 7) of a color the opponents do not have', 1);

        var cardBelow7OfColorOppDoNotHave = reasonerUtils.getCardBelow7OfColorOppDoNotHave(handGroupedByColor, triunfo, analytics, true);
        if(cardBelow7OfColorOppDoNotHave != null) {
            logUtils.log('CLEAR');
            return cardBelow7OfColorOppDoNotHave;
        }
        else {
            logUtils.log('The opponents are not missing any color or they do but the player does not have any card in that color below 7');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 5.B: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 5.B: play the weakest card of the color with most cards but no As (exc triunfo)', 1);
        
        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, false);
        if(weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 5.C: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 5.C: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 5 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 6

    // First play in round 2+. The player is in the buying team. Singing is not available.
    this.strategy_6 = function (handGroupedByColor, triunfo, analytics) {

        logUtils.log('STRATEGY 6', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: passing good but vulnerable cards to the teammate if possible
        logUtils.log('OBJECTIVE 1: passing good but vulnerable cards to the teammate if possible', 2);

        var teammateTopPossibleTriunfoCard = analytics.teammateTopPossibleCardByColor[triunfo];
        var teammateMissingColor = reasonerUtils.getTeammateMissingColor(triunfo, analytics, true);
        var oppsHaveCardsInTeammateMissingColor = teammateMissingColor !== null ?
            (analytics.rightOppTopPossibleCardByColor[teammateMissingColor] > 0 && analytics.leftOppTopPossibleCardByColor[teammateMissingColor] > 0)
            :
            false;

        var colorsOfAllVulnerable1s = reasonerUtils.getColorsOfAllVulnerable1s(handGroupedByColor, triunfo, analytics);
        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        var hasValuableCardsInMissingColorToPassOn = teammateMissingColor !== null ?
            (colorsOfAllVulnerable1s.includes(teammateMissingColor) || colorsOfAllVulnerable3s.includes(teammateMissingColor))
            :
            false;

        //#region SUB OBJECTIVE 1.A: if the teammate is missing a color the opps still have and has triunfo while the player has vulnerable cards in that color, pass them on
        logUtils.log('SUB OBJECTIVE 1.A: if the teammate is missing a color the opps have and still has triunfo while the player has vulnerable cards in that color, pass them on', 1);

        if (teammateTopPossibleTriunfoCard > 0 && teammateMissingColor !== null && oppsHaveCardsInTeammateMissingColor && hasValuableCardsInMissingColorToPassOn) {

            if (colorsOfAllVulnerable1s.includes(teammateMissingColor)) {
                logUtils.log('CLEAR');
                return { n: 1, c: teammateMissingColor };
            }
            else {
                logUtils.log('CLEAR');
                return { n: 3, c: teammateMissingColor };
            }

        }
        else {
            if (teammateTopPossibleTriunfoCard <= 0) {
                logUtils.log('The teammate of the player does not have any triunfo');
                logUtils.log('MISS');
            }
            else if (teammateMissingColor === null) {
                logUtils.log('The teammate of the player does not have any missing color');
                logUtils.log('MISS');
            }
            else if (!oppsHaveCardsInTeammateMissingColor) {
                logUtils.log('The opponents may be missing cards in the same color as the teammate');
                logUtils.log('MISS');
            }
            else {
                logUtils.log('The player does not have any vulnerable As or 3 to pass on in the missing color');
                logUtils.log('MISS');
            }
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 2: let the teammate pass vulnerable cards if possible
        logUtils.log('OBJECTIVE 2: let the teammate pass vulnerable cards if possible', 2);

        logUtils.log('This objective is too unreliable to predict');
        logUtils.log('MISS');

        //#endregion


        //#region OBJECTIVE 3: attempt to remove triunfo if advantageous
        logUtils.log('OBJECTIVE 3: attempt to remove triunfo if advantageous', 2);

        //#region SUB OBJECTIVE 3.A: attempt to exhaust the triunfo if possible
        logUtils.log('SUB OBJECTIVE 3.A: attempt to exhaust the triunfo if possible', 1);

        if (reasonerUtils.canPlayerExhaustTriunfoLate(handGroupedByColor, triunfo, analytics)) {

            logUtils.log('The player meets the requirements to exhaust the triunfo');

            var weakestWinningTriunfoCard = reasonerUtils.getWeakestWinningTriunfoCard(handGroupedByColor, triunfo, [], analytics);

            logUtils.log('CLEAR');
            return weakestWinningTriunfoCard;
        }
        else {
            logUtils.log('The player does not meet the requirements to exhaust the triunfo');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: help the teammate win good cards
        logUtils.log('OBJECTIVE 4: help the teammate win good cards', 2);

        //#region SUB OBJECTIVE 4.A: play the 7 or 10 of a color with at least 4 remaining cards
        logUtils.log('SUB OBJECTIVE 4.A: play the 7 or 10 of a color with at least 4 remaining cards', 1);

        var _7Or10OfColorWithAtLeast4RemainingCards = reasonerUtils.get7Or10OfColorWith11Or12AndAtLeastXRemainingCards(handGroupedByColor, triunfo, analytics, 4);
        if (_7Or10OfColorWithAtLeast4RemainingCards != null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithAtLeast4RemainingCards;
        }
        else {
            logUtils.log('The player does not have the 7 or 10 of a color with at least 4 remaining cards');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 5: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 5: protect a vulnerable 3 if any', 2);

        //#region SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if (colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, [], colorsOfAllVulnerable3s);
            if (protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard;
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 6: play a vulnerable As if any
        logUtils.log('OBJECTIVE 6: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if (vulnerableAs !== null) {
            logUtils.log('CLEAR');
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion


        //#region OBJECTIVE 7: make the opponents lose triunfo against useless cards
        logUtils.log('OBJECTIVE 7: make the opponents lose triunfo against useless cards', 2);

        //#region SUB OBJECTIVE 7.A: play the weakest card of the color with most cards but no As (exc triunfo)
        logUtils.log('SUB OBJECTIVE 7.A: play the weakest card of the color with most cards but no As (exc triunfo)', 1);

        var weakestCardOfColorWithMostCardsAndNoAs = reasonerUtils.getWeakestCardOfColorWithMostCardsAndNoAs(handGroupedByColor, triunfo, false);
        if (weakestCardOfColorWithMostCardsAndNoAs !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCardsAndNoAs;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards and no As!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 7.B: play the weakest card of the color with most cards excluding triunfo
        logUtils.log('SUB OBJECTIVE 7.B: play the weakest card of the color with most cards excluding triunfo', 1);

        var weakestCardOfColorWithMostCards = reasonerUtils.getWeakestCardOfColorWithMostCards(handGroupedByColor, triunfo, true, false);
        if (weakestCardOfColorWithMostCards !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostCards;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with most cards!!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 7.C: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 7.C: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 6 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 7

    // First play in round 2+. The player is not in the buying team. Singing is possible.
    this.strategy_7 = function (handGroupedByColor, triunfo, analytics, winningBid, suspectedSingingColors) {

        logUtils.log('STRATEGY 7', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);
        logUtils.log('Params: winningBid', 1);
        logUtils.log(winningBid);


        //#region OBJECTIVE 1: attempt to break a song if deemed vulnerable
        logUtils.log('OBJECTIVE 1: attempt to break a song if deemed vulnerable', 2);

        //#region SUB OBJECTIVE 1.A: play the top card of a color with no 12 nor 11 where neither one has been played before and with at least 5 remaining cards
        logUtils.log('SUB OBJECTIVE 1.A: play the top card of a color with no 12 nor 11 where neither one has been played before and with at least 5 remaining cards', 1);

        var songBreakerCard = reasonerUtils.getTopCardOfColorWithAtLeastXRemainingCardsInc12And11(handGroupedByColor, triunfo, analytics, winningBid.amount <= 90, 5);
        if (songBreakerCard != null) {
            logUtils.log('CLEAR');
            return songBreakerCard;
        }
        else {
            logUtils.log('The player does not have a card that satisfies this objective');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 1.B: play the 10 or 7 of a color with no 12 nor 11 and neither has been played before
        logUtils.log('SUB OBJECTIVE 1.B: play the 10 or 7 of a color with no 12 nor 11 and neither has been played before', 1);

        var songBreaker10Or7 = reasonerUtils.get10Or7OfColorWithout12And11(handGroupedByColor, triunfo, analytics);
        if (songBreaker10Or7 != null) {
            logUtils.log('CLEAR');
            return songBreaker10Or7;
        }
        else {
            logUtils.log('player does not have a 10 or 7 in a color with no 12 nor 11');
            logUtils.log('MISS');
        }

        //#endregion            

        //#endregion


        //#region OBJECTIVE 2: help the teammate win the round if possible so he can try to break the song
        logUtils.log('OBJECTIVE 2: help the teammate win the round if possible so he can try to break the song', 2);

        //#region SUB OBJECTIVE 2.A: play the 7 or 10 of a color with the most remaining cards and where the teammate is expected to have the top card
        logUtils.log('SUB OBJECTIVE 2.A: play the 7 or 10 of a color with the most remaining cards and where the teammate is expected to have the top card', 1);

        var _7Or10OfColorWithMostRemainingCards = reasonerUtils.get7Or10OfColorWithMostRemainingCards(handGroupedByColor, triunfo, analytics, 3);
        if (_7Or10OfColorWithMostRemainingCards !== null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithMostRemainingCards;
        }
        else {
            logUtils.log('The player does not have a color with a 7 or 10 with at least 3 remaining cards');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 2.B: play the weakest card of the color with the most remaining cards
        logUtils.log('SUB OBJECTIVE 2.B: play the weakest card of the color with the most remaining cards', 2);

        var weakestCardOfColorWithMostRemainingCards = reasonerUtils.getWeakestCardOfColorWithMostRemainingCardsAndNoTopCard(handGroupedByColor, triunfo, analytics, 3);
        if (weakestCardOfColorWithMostRemainingCards != null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithMostRemainingCards;
        }
        else {
            logUtils.log('The player does not have a color with at least 3 remaining cards without a top card');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 3: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 3: protect a vulnerable 3 if any', 2);

        //#region SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if (colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, [], colorsOfAllVulnerable3s);
            if (protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard;
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: exhaust own triunfo if not needed in order to pass good cards to teammate
        logUtils.log('OBJECTIVE 4: exhaust own triunfo if not needed in order to pass good cards to teammate', 2);

        //#region SUB OBJECTIVE 4.A: play the weakest triunfo card
        logUtils.log('SUB OBJECTIVE 4.A: play the weakest triunfo card', 1);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        var presentColorsCount = _.reduce(Object.keys(handGroupedByColor), function (sum, color) { return sum + (handGroupedByColor[color].length > 0 ? 1 : 0); }, 0);

        if (presentColorsCount == 4 && (vulnerableAs !== null || colorsOfAllVulnerable3s.length > 0)) {

            logUtils.log('CLEAR');
            var weakestTriunfoCard = reasonerUtils.getWeakestTriunfoCard(handGroupedByColor, triunfo);
            return weakestTriunfoCard;

        }
        else {
            logUtils.log('The player either does not have a card in each color or no vulnerable As or 3');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 5: play a vulnerable As if any
        logUtils.log('OBJECTIVE 5: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if (vulnerableAs !== null) {
            logUtils.log('CLEAR');
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion


        //#region OBJECTIVE 6: try to make opponents lose triunfo
        logUtils.log('OBJECTIVE 6: try to make opponents lose triunfo', 2);

        //#region SUB OBJECTIVE 6.A: play the weakest card of the color with the least remaining cards and no top card
        logUtils.log('SUB OBJECTIVE 6.A: play the weakest card of the color with the least remaining cards and no top card', 1);

        var weakestCardOfColorWithLeastRemainingCards = reasonerUtils.getWeakestCardOfColorWithLeastRemainingCardsAndNoTopCard(handGroupedByColor, triunfo, analytics);
        if (weakestCardOfColorWithLeastRemainingCards !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithLeastRemainingCards;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with the least remaining cards and no top card!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 6.B: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 6.B: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 7 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 8

    // First play in round 2+. The player is not in the buying team. Singing is not possible.
    this.strategy_8 = function (handGroupedByColor, triunfo, analytics) {

        logUtils.log('STRATEGY 8', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);


        //#region OBJECTIVE 1: help the teammate win good cards
        logUtils.log('OBJECTIVE 1: help the teammate win good cards', 2);

        //#region SUB OBJECTIVE 1.A: play the 7 or 10 of a color with the most remaining cards and where the teammate is expected to have the top card
        logUtils.log('SUB OBJECTIVE 1.A: play the 7 or 10 of a color with the most remaining cards and where the teammate is expected to have the top card', 1);

        var _7Or10OfColorWithMostRemainingCards = reasonerUtils.get7Or10OfColorWithMostRemainingCards(handGroupedByColor, triunfo, analytics, 3);
        if (_7Or10OfColorWithMostRemainingCards !== null) {
            logUtils.log('CLEAR');
            return _7Or10OfColorWithMostRemainingCards;
        }
        else {
            logUtils.log('The player does not have a color with a 7 or 10 with at least 3 remaining cards');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 2: protect a vulnerable 3 if any
        logUtils.log('OBJECTIVE 2: protect a vulnerable 3 if any', 2);

        //#region SUB OBJECTIVE 2.A: play the weakest card in the sequence right below the 3
        logUtils.log('SUB OBJECTIVE 2.A: play the weakest card in the sequence right below the 3', 1);

        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
        if (colorsOfAllVulnerable3s.length > 0) {

            logUtils.log('There are ' + colorsOfAllVulnerable3s.length + ' vulnerable 3s');

            var protectionCard = reasonerUtils.attemptToProtectOneVulnerable3(handGroupedByColor, [], colorsOfAllVulnerable3s);
            if (protectionCard !== null) {
                logUtils.log('CLEAR');
                return protectionCard;
            }
            else {
                logUtils.log('Could not protect any vulnerable 3');
                logUtils.log('MISS');
            }
        }
        else {
            logUtils.log('The player does not have any 3 that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 3: exhaust own triunfo if not needed in order to pass good cards to teammate
        logUtils.log('OBJECTIVE 3: exhaust own triunfo if not needed in order to pass good cards to teammate', 2);

        //#region SUB OBJECTIVE 3.A: play the weakest triunfo card
        logUtils.log('SUB OBJECTIVE 3.A: play the weakest triunfo card', 1);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        var presentColorsCount = _.reduce(Object.keys(handGroupedByColor), function (sum, color) {
            return sum + (handGroupedByColor[color].length > 0 ? 1 : 0);
        }, 0);

        if (presentColorsCount == 4 && (vulnerableAs !== null || colorsOfAllVulnerable3s.length > 0)) {

            logUtils.log('CLEAR');
            var weakestTriunfoCard = reasonerUtils.getWeakestTriunfoCard(handGroupedByColor, triunfo);
            return weakestTriunfoCard;

        }
        else {
            logUtils.log('The player either does not have a card in each color or no vulnerable As or 3');
            logUtils.log('MISS');
        }

        //#endregion

        //#endregion


        //#region OBJECTIVE 4: play a vulnerable As if any
        logUtils.log('OBJECTIVE 4: play a vulnerable As if any', 2);

        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
        if (vulnerableAs !== null) {
            logUtils.log('CLEAR');
            return vulnerableAs;
        }
        else {
            logUtils.log('The player does not have any As that is vulnerable');
            logUtils.log('MISS');
        }

        //#endregion


        //#region OBJECTIVE 5: try to make opponents lose triunfo
        logUtils.log('OBJECTIVE 5: try to make opponents lose triunfo', 2);

        //#region SUB OBJECTIVE 5.A: play the weakest card of the color with the least remaining cards and no top card
        logUtils.log('SUB OBJECTIVE 5.A: play the weakest card of the color with the least remaining cards and no top card', 1);

        var weakestCardOfColorWithLeastRemainingCards = reasonerUtils.getWeakestCardOfColorWithLeastRemainingCardsAndNoTopCard(handGroupedByColor, triunfo, analytics);
        if (weakestCardOfColorWithLeastRemainingCards !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfColorWithLeastRemainingCards;
        }
        else {
            logUtils.log('Somehow could not find the weakest card of color with the least remaining cards and no top card!');
            logUtils.log('MISS');
        }

        //#endregion


        //#region SUB OBJECTIVE 5.B: play the weakest card of all colors
        logUtils.log('SUB OBJECTIVE 5.B: play the weakest card of all colors', 1);

        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
        if (weakestCardOfAllColors !== null) {
            logUtils.log('CLEAR');
            return weakestCardOfAllColors;
        }
        else {
            logUtils.log('CLEAR');
            return reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, false);
        }

        //#endregion

        //#endregion


        logUtils.log('ERROR: exhausted all objectives in strategy 8 and still could not find a card to play!');

    }

    //#endregion


    //#region STRATEGY 9

    this.strategy_9_card_2 = function (handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, availableSingingColors) {

        logUtils.log('CASE 1: the player is second to play', 2);

        if (tableCards[0].c === triunfo) {

            // The lead card is triunfo
            logUtils.log('The lead card is in triunfo');

            if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                // The player has the triunfo
                logUtils.log('The player has triunfo');

                if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)) {

                    // The player has at least one triunfo card that is more powerful than the lead card
                    logUtils.log('The player has cards that are more powerful than the lead');

                    if (availableSingingColors.length > 0) {

                        logUtils.log('The player has a song coming up and needs to play a winning triunfo card');

                        var minimumCardNumberToWinRound = mostPowerfulCard.n;
                        if (
                            analytics.rightOppTopPossibleCardByColor[triunfo] > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[triunfo], minimumCardNumberToWinRound)
                        ) {

                            minimumCardNumberToWinRound = analytics.rightOppTopPossibleCardByColor[triunfo];

                        }

                        logUtils.log('The player needs to better the ' + minimumCardNumberToWinRound + 't');

                        // The player has a song coming up so make sure to win the round
                        var weakestWinningTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, minimumCardNumberToWinRound, availableSingingColors.includes(triunfo));

                        logUtils.log('The player played: ' + JSON.stringify(weakestWinningTriunfoCard));

                        return weakestWinningTriunfoCard;
                        
                    }

                    logUtils.log('The right opponent might have better triunfo');

                    // The right opponent might have better triunfo. Play the weakest more powerful triunfo card
                    var weakestValidTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, mostPowerfulCard.n, availableSingingColors.includes(triunfo));

                    logUtils.log('The player played: ' + JSON.stringify(weakestValidTriunfoCard));

                    return weakestValidTriunfoCard;                    

                }
                else {

                    logUtils.log('The player has triunfo but it is weaker than the current most powerful card');

                    // The player has triunfo but it's weaker than the current most powerful card. Play the weakest triunfo card
                    var weakestTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));

                    logUtils.log('The player played: ' + JSON.stringify(weakestTriunfoCard));

                    return weakestTriunfoCard;

                }

            }
            else {

                // The player does not have any triunfo
                logUtils.log('The player does not have any triunfo');

                if (
                    analytics.teammateTopPossibleCardByColor[triunfo] > 0
                    &&
                    gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[triunfo], mostPowerfulCard.n)
                    &&
                    (
                        analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                        ||
                        gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[triunfo], analytics.rightOppTopPossibleCardByColor[triunfo])
                    )
                ) {

                    // The teammate might be able to win the round. Attempt to pass good cards to the teammate
                    logUtils.log('The teammate might be able to win the round');

                    // Attempt to pass on any vulnerable 3
                    var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                    if (colorsOfAllVulnerable3s.length > 0) {
                        return { n: 3, c: colorsOfAllVulnerable3s[0] };
                    }


                    // Attempt to pass on any vulnerable 1
                    var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                    if (vulnerableAs !== null) {
                        return vulnerableAs;
                    }


                    // Attempt to pass on 12 or 11 without braking any songs
                    var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                        return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                    });

                    if (noSongColorsWith12or11.length > 0) {
                        if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                            return { n: 12, c: noSongColorsWith12or11[0] };
                        }
                        else {
                            return { n: 11, c: noSongColorsWith12or11[0] };
                        }
                    }


                    // Attempt to pass on a 10
                    var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                        return handGroupedByColor[color].includes(10);
                    });

                    if (colorsWith10.length > 0) {
                        return { n: 10, c: colorsWith10[0] };
                    }

                }

                logUtils.log('The teammate will most likely lose the round or there were no good cards to pass on');

                // The teammate will most likely lose the round. Play the worst card possible
                var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);

                logUtils.log('The player played: ' + JSON.stringify(weakestCardOfAllColors));

                return weakestCardOfAllColors;                

            }

        }

        else {

            // The lead card is not triunfo
            logUtils.log('The lead card is not triunfo');

            if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                // The player has cards in the lead color
                logUtils.log('The player has cards in the lead color');

                if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], tableCards[0].n)) {

                    // The player has at least one more powerful card
                    logUtils.log('The player has at least one more powerful card');

                    var minCardNumberToWinRound = tableCards[0].n;
                    if (
                        analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                        &&
                        gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], analytics.rightOppTopPossibleCardByColor[tableCards[0].c])
                        &&
                        gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[tableCards[0].c], minCardNumberToWinRound)
                    ) {

                        minCardNumberToWinRound = analytics.rightOppTopPossibleCardByColor[tableCards[0].c];

                    }

                    logUtils.log('The player needs to better the ' + minCardNumberToWinRound + tableCards[0].c);

                    // Play the least powerful card in the lead color to most likely win the round
                    var weakestMorePowerfulCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, minCardNumberToWinRound, availableSingingColors.includes(tableCards[0].c));

                    logUtils.log('The player played: ' + JSON.stringify(weakestMorePowerfulCard));

                    return weakestMorePowerfulCard;

                }

                logUtils.log('The player does not have more powerful cards in the lead color');

                // The player does not have more powerful cards, he can play less powerful ones
                var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, 0, availableSingingColors.includes(tableCards[0].c));

                logUtils.log('The player played: ' + JSON.stringify(weakestCard));

                return weakestCard;

            }
            else {

                // The player does not have cards of the lead color
                logUtils.log('The player does not have cards in the lead color');

                if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                    // The player has triunfo
                    logUtils.log('The player has triunfo');

                    // Play the weakest triunfo card
                    var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));

                    logUtils.log('The player played: ' + JSON.stringify(weakestCard));

                    return weakestCard;

                }
                else {

                    // The player does not have any triunfo
                    logUtils.log('The player does not have triunfo');

                    if (
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


                        // The teammate will most likely win the round so pass on cards
                        logUtils.log('The teammate will most likely win the round');

                        // Attempt to pass on any vulnerable 3
                        var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                        if (colorsOfAllVulnerable3s.length > 0) {
                            return { n: 3, c: colorsOfAllVulnerable3s[0] };
                        }


                        // Attempt to pass on any vulnerable 1
                        var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                        if (vulnerableAs !== null) {
                            return vulnerableAs;
                        }


                        // Attempt to pass on 12 or 11 without braking any songs
                        var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                            return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                        });

                        if (noSongColorsWith12or11.length > 0) {
                            if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                                return { n: 12, c: noSongColorsWith12or11[0] };
                            }
                            else {
                                return { n: 11, c: noSongColorsWith12or11[0] };
                            }
                        }


                        // Attempt to pass on a 10
                        var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                            return handGroupedByColor[color].includes(10);
                        });

                        if (colorsWith10.length > 0) {
                            return { n: 10, c: colorsWith10[0] };
                        }

                    }

                    logUtils.log('The teammate will most likely lose the round or the player did not have cards to pass on');

                    // The teammate will most likely lose the round. Play the worst card possible
                    var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);

                    logUtils.log('The player played: ' + JSON.stringify(weakestCardOfAllColors));

                    return weakestCardOfAllColors; 

                }

            }

        }

    }


    this.strategy_9_card_3 = function (handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, mostPowerfulPlay, availableSingingColors) {

        logUtils.log('CASE 2: the player is third to play', 2);

        if (tableCards[0].c === triunfo) {

            // The lead card is triunfo
            logUtils.log('The lead card is triunfo');

            if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                // The player has the triunfo
                logUtils.log('The player has the triunfo');

                if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)) {

                    // The player has at least one triunfo card that is more powerful than the lead card
                    logUtils.log('The player has at least one triunfo card that is more powerful than the lead card');

                    if (
                        (
                            mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()
                            &&
                            (
                                analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                                ||
                                gameUtils.card1IsStrongerThanCard2SameColor(mostPowerfulCard.n, analytics.rightOppTopPossibleCardByColor[triunfo])
                            )
                        )
                    ) {

                        // The teammate will win the round so no need for me to do more than required
                        logUtils.log('The teammate will win the round so no need for me to do more than required');

                        var weakestValidTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, mostPowerfulCard.n, availableSingingColors.includes(triunfo));
                        return weakestValidTriunfoCard;

                    }


                    // My teammate has been overpowered by the left opp
                    logUtils.log('My teammate has been overpowered by the left opp');

                    if (availableSingingColors.length > 0) {

                        // The player has a song coming up so try to win the round
                        logUtils.log('The player has a song coming up so try to win the round');

                        var minimumCardNumberToWinRound = mostPowerfulCard.n;

                        if (
                            analytics.rightOppTopPossibleCardByColor[triunfo] > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[triunfo], minimumCardNumberToWinRound)
                        ) {

                            minimumCardNumberToWinRound = analytics.rightOppTopPossibleCardByColor[triunfo];

                        }


                        // Play the triunfo card that will overpower both opps
                        var weakestWinningTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, minimumCardNumberToWinRound, availableSingingColors.includes(triunfo));
                        return weakestWinningTriunfoCard;

                    }


                    // The right opponent might have better triunfo. Play the weakest more powerful triunfo card
                    logUtils.log('The right opponent might have better triunfo. Play the weakest more powerful triunfo card');

                    var weakestValidTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, mostPowerfulCard.n, availableSingingColors.includes(triunfo));
                    return weakestValidTriunfoCard;

                }
                else {

                    // The player has triunfo but it's weaker than the current most powerful card. Play the weakest triunfo card
                    logUtils.log('The player has triunfo but it is weaker than the current most powerful card.Play the weakest triunfo card');

                    var weakestTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));
                    return weakestTriunfoCard;

                }

            }
            else {

                // The player does not have any triunfo
                logUtils.log('The player does not have any triunfo');

                if (
                    (
                        mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()
                        &&
                        (
                            analytics.rightOppTopPossibleCardByColor[triunfo] === 0
                            ||
                            gameUtils.card1IsStrongerThanCard2SameColor(mostPowerfulCard.n, analytics.rightOppTopPossibleCardByColor[triunfo])
                        )
                    )
                ) {

                    // The teammate might be able to win the round. Attempt to pass good cards to the teammate
                    logUtils.log('The teammate might be able to win the round. Attempt to pass good cards to the teammate');

                    // Attempt to pass on any vulnerable 3
                    var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                    if (colorsOfAllVulnerable3s.length > 0) {
                        return { n: 3, c: colorsOfAllVulnerable3s[0] };
                    }


                    // Attempt to pass on any vulnerable 1
                    var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                    if (vulnerableAs !== null) {
                        return vulnerableAs;
                    }


                    // Attempt to pass on 12 or 11 without braking any songs
                    var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                        return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                    });

                    if (noSongColorsWith12or11.length > 0) {
                        if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                            return { n: 12, c: noSongColorsWith12or11[0] };
                        }
                        else {
                            return { n: 11, c: noSongColorsWith12or11[0] };
                        }
                    }


                    // Attempt to pass on a 10
                    var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                        return handGroupedByColor[color].includes(10);
                    });

                    if (colorsWith10.length > 0) {
                        return { n: 10, c: colorsWith10[0] };
                    }

                }


                // The teammate will most likely lose the round or no no good cards to pass on
                logUtils.log('The teammate will most likely lose the round or no no good cards to pass on');

                var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
                return weakestCardOfAllColors;

            }

        }

        else {

            // The lead card was not in triunfo
            logUtils.log('The lead card was not in triunfo');

            if (mostPowerfulCard.c === triunfo) {

                // The teammate played a card in a regular color but the left opp fired
                logUtils.log('The teammate played a card in a regular color but the left opp fired');

                if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                    // The player has cards in the lead color but is not required to play a more powerful card
                    logUtils.log('The player has cards in the lead color but is not required to play a more powerful card');

                    var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, 0, availableSingingColors.includes(tableCards[0].c));
                    return weakestCard;

                }
                else {

                    // The player does not have cards in the lead color
                    logUtils.log('The player does not have cards in the lead color');

                    if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                        // The player does have the triunfo, he must first try to overpower it as the game rules state
                        logUtils.log('The player does have the triunfo, he must first try to overpower it as the game rules state');

                        if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)) {

                            // The player has more powerful triunfo cards
                            logUtils.log('The player has more powerful triunfo cards');

                            if (availableSingingColors.length > 0) {

                                // The player has a song coming up so try to win the round
                                logUtils.log('The player has a song coming up so try to win the round');

                                var minimumCardNumberToWinRound = mostPowerfulCard.n;

                                if (
                                    analytics.rightOppTopPossibleCardByColor[triunfo] > 0
                                    &&
                                    gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                                    &&
                                    gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[triunfo], minimumCardNumberToWinRound)
                                ) {

                                    minimumCardNumberToWinRound = analytics.rightOppTopPossibleCardByColor[triunfo];

                                }


                                // Play the triunfo card that will overpower both opps
                                logUtils.log('Play the triunfo card that will overpower both opps');

                                var weakestWinningTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, minimumCardNumberToWinRound, availableSingingColors.includes(triunfo));
                                return weakestWinningTriunfoCard;

                            }


                            // The right opponent might have better triunfo. Play the weakest more powerful triunfo card
                            logUtils.log('The right opponent might have better triunfo. Play the weakest more powerful triunfo card');

                            var weakestValidTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, mostPowerfulCard.n, availableSingingColors.includes(triunfo));
                            return weakestValidTriunfoCard;

                        }
                        else {

                            // The player has only weaker triunfo card and can and should play the weakest since it's a lost round
                            logUtils.log('The player has only weaker triunfo card and can and should play the weakest since it is a lost round');

                            var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));
                            return weakestCard;

                        }

                    }
                    else {

                        // The player has no triunfo and the opps are winning the round
                        logUtils.log('The player has no triunfo and the opps are winning the round');

                        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
                        return weakestCardOfAllColors;

                    }

                }

            }
            else {

                // The most powerful card is in the same color as the lead (no one fired at this point)
                logUtils.log('The most powerful card is in the same color as the lead (no one fired at this point)');

                if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                    // The player has cards in the lead color
                    logUtils.log('The player has cards in the lead color');

                    if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], mostPowerfulCard.n)) {

                        // The player has at least one card that is stronger than the current most powerful card
                        logUtils.log('The player has at least one card that is stronger than the current most powerful card');

                        if (
                            analytics.rightOppTopPossibleCardByColor[tableCards[0].c] > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], analytics.rightOppTopPossibleCardByColor[tableCards[0].c])                            
                        ) {

                            var minCardNumberToWinRound = mostPowerfulCard.n;
                            if (gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[tableCards[0].c], minCardNumberToWinRound)) {
                                minCardNumberToWinRound = analytics.rightOppTopPossibleCardByColor[tableCards[0].c];
                            }

                            // Play the least powerful card in the lead color to most likely win the round
                            logUtils.log('Play the least powerful card in the lead color to most likely win the round');

                            var weakestMorePowerfulCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, minCardNumberToWinRound, availableSingingColors.includes(tableCards[0].c));
                            return weakestMorePowerfulCard;

                        }


                        // Play the least valid card
                        logUtils.log('Play the least valid card');

                        var weakestValidCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, mostPowerfulCard.n, availableSingingColors.includes(tableCards[0].c));
                        return weakestValidCard;

                    }
                    else {

                        // The player does not have stronger cards in the lead color, he can play weaker ones
                        logUtils.log('The player does not have stronger cards in the lead color, he can play weaker ones');

                        if (
                            mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()
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
                        ) {

                            // The teammate will most likely win the round
                            logUtils.log('The teammate will most likely win the round');

                            // Attempt to pass on any vulnerable 3
                            if (handGroupedByColor[tableCards[0].c].includes(3)) {
                                return { n: 3, c: tableCards[0].c };
                            }


                            // Attempt to pass on 12 or 11 without braking any songs
                            if (!availableSingingColors.includes(tableCards[0].c)) {
                                if (handGroupedByColor[tableCards[0].c].includes(12)) {
                                    return { n: 12, c: tableCards[0].c };
                                }
                                else if (handGroupedByColor[tableCards[0].c].includes(11)) {
                                    return { n: 11, c: tableCards[0].c };
                                }
                            }


                            // Attempt to pass on a 10
                            if (handGroupedByColor[tableCards[0].c].includes(10)) {
                                return { n: 10, c: tableCards[0].c };
                            }

                        }


                        // The teammate will most likely lose the round. Play the worst card possible in the lead color
                        logUtils.log('The teammate will most likely lose the round. Play the worst card possible in the lead color');

                        var weakestValidCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, 0, availableSingingColors.includes(tableCards[0].c));
                        return weakestValidCard; 

                    }                    

                }
                else {

                    // The player does not have any card in the lead color
                    logUtils.log('The player does not have any card in the lead color');

                    if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                        // The player has triunfo
                        logUtils.log('The player has triunfo');

                        if (
                            analytics.rightOppTopPossibleCardByColor[tableCards[0].c] === 0
                            &&
                            analytics.rightOppTopPossibleCardByColor[triunfo] > 0
                            &&
                            gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], analytics.rightOppTopPossibleCardByColor[triunfo])
                        ) {

                            // The right opp will also fire but I have a better triunfo card than his best
                            logUtils.log('The right opp will also fire but I have a better triunfo card than his best');

                            // Play the weakest winning triunfo card
                            var weakestWinningCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, analytics.rightOppTopPossibleCardByColor[triunfo], availableSingingColors.includes(triunfo));
                            return weakestWinningCard;

                        }

                        // Play the weakest triunfo card
                        logUtils.log('Play the weakest triunfo card');

                        var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));
                        return weakestCard;

                    }
                    else {

                        // The player does not have any triunfo, he can play any card
                        logUtils.log('The player does not have any triunfo, he can play any card');

                        if (
                            mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()
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
                        ) {

                            // The teammate has a good chance to win the round so pass on cards
                            logUtils.log('The teammate has a good chance to win the round so pass on cards');

                            // Attempt to pass on any vulnerable 3
                            var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                            if (colorsOfAllVulnerable3s.length > 0) {
                                return { n: 3, c: colorsOfAllVulnerable3s[0] };
                            }


                            // Attempt to pass on any vulnerable 1
                            var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                            if (vulnerableAs !== null) {
                                return vulnerableAs;
                            }


                            // Attempt to pass on 12 or 11 without braking any songs
                            var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                                return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                            });

                            if (noSongColorsWith12or11.length > 0) {
                                if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                                    return { n: 12, c: noSongColorsWith12or11[0] };
                                }
                                else {
                                    return { n: 11, c: noSongColorsWith12or11[0] };
                                }
                            }


                            // Attempt to pass on a 10
                            var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                                return handGroupedByColor[color].includes(10);
                            });

                            if (colorsWith10.length > 0) {
                                return { n: 10, c: colorsWith10[0] };
                            }

                        }


                        // We will most likely lose the round. Play the worst card possible
                        logUtils.log('We will most likely lose the round. Play the worst card possible');

                        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
                        return weakestCardOfAllColors; 

                    }

                }

            }

        }

    }


    this.strategy_9_card_4 = function (handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, mostPowerfulPlay, availableSingingColors) {

        logUtils.log('CASE 3: the player is last to play', 2);

        if (tableCards[0].c === triunfo) {

            // The lead card is triunfo
            logUtils.log('The lead card is triunfo');

            if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                // The player has triunfo
                logUtils.log('The player has triunfo');

                if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)) {

                    // The player has more powerful triunfo cards than the current most powerful
                    logUtils.log('The player has more powerful triunfo cards than the current most powerful');

                    // Play the weakest valid card
                    var weakestValidTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, mostPowerfulCard.n, availableSingingColors.includes(triunfo));
                    return weakestValidTriunfoCard;

                }
                else {

                    // The player has only less powerful triunfo and thus can play any triunfo card so play the weakest
                    logUtils.log('The player has only less powerful triunfo and thus can play any triunfo card so play the weakest');

                    var weakestTriunfoCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));
                    return weakestTriunfoCard;

                }

            }
            else {

                // The player has no triunfo and thus can play any card
                logUtils.log('The player has no triunfo and thus can play any card');

                if (mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()) {

                    // The teammate will win the round so pass on cards
                    logUtils.log('The teammate will win the round so pass on cards');

                    // Attempt to pass on any vulnerable 3
                    var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                    if (colorsOfAllVulnerable3s.length > 0) {
                        return { n: 3, c: colorsOfAllVulnerable3s[0] };
                    }


                    // Attempt to pass on any vulnerable 1
                    var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                    if (vulnerableAs !== null) {
                        return vulnerableAs;
                    }


                    // Attempt to pass on 12 or 11 without braking any songs
                    var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                        return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                    });

                    if (noSongColorsWith12or11.length > 0) {
                        if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                            return { n: 12, c: noSongColorsWith12or11[0] };
                        }
                        else {
                            return { n: 11, c: noSongColorsWith12or11[0] };
                        }
                    }


                    // Attempt to pass on a 10
                    var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                        return handGroupedByColor[color].includes(10);
                    });

                    if (colorsWith10.length > 0) {
                        return { n: 10, c: colorsWith10[0] };
                    }

                }


                // We're losing this round so play the worst card possible
                logUtils.log('We are losing this round so play the worst card possible');

                var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
                return weakestCardOfAllColors;

            }

        }

        else {

            // The lead card was not in triunfo
            logUtils.log('The lead card was not in triunfo');

            if (mostPowerfulCard.c === triunfo) {

                // The lead card was not triunfo but the most powerful one is, someone fired (teammate or left opp)
                logUtils.log('The lead card was not triunfo but the most powerful one is, someone fired (teammate or left opp)');

                if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                    // The player has cards in the lead color but is not required to play a more powerful card
                    logUtils.log('The player has cards in the lead color but is not required to play a more powerful card');

                    if (mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()) {

                        // The teammate will win the round, so play vulnerable cards from this color if any
                        logUtils.log('The teammate will win the round, so play vulnerable cards from this color if any');

                        // Attempt to pass on any vulnerable 3
                        if (handGroupedByColor[tableCards[0].c].includes(3)) {
                            return { n: 3, c: tableCards[0].c };
                        }


                        // Attempt to pass on 12 or 11 without braking any songs
                        if (!availableSingingColors.includes(tableCards[0].c)) {
                            if (handGroupedByColor[tableCards[0].c].includes(12)) {
                                return { n: 12, c: tableCards[0].c };
                            }
                            else if (handGroupedByColor[tableCards[0].c].includes(11)) {
                                return { n: 11, c: tableCards[0].c };
                            }
                        }


                        // Attempt to pass on a 10
                        if (handGroupedByColor[tableCards[0].c].includes(10)) {
                            return { n: 10, c: tableCards[0].c };
                        }

                    }


                    // We are losing this round so play the weakest card in this color
                    logUtils.log('We are losing this round so play the weakest card in this color');

                    var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, 0, availableSingingColors.includes(tableCards[0].c));
                    return weakestCard;

                }
                else {

                    // The player does not have any cards in the lead color
                    logUtils.log('The player does not have any cards in the lead color');

                    if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                        // The player has triunfo
                        logUtils.log('The player has triunfo');

                        if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[triunfo][0], mostPowerfulCard.n)) {

                            // The player has more powerful triunfo cards than those fired with, rules require him to play one of them
                            logUtils.log('The player has more powerful triunfo cards than those fired with, rules require him to play one of them');

                            // Play the weakest valid (and winning) triunfo card
                            var weakestValidCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, mostPowerfulCard.n, availableSingingColors.includes(triunfo));
                            return weakestValidCard;

                        }
                        else {

                            // The player does not have stronger triunfo cards than those that were fired with, he can play any triunfo card so play the weakest
                            logUtils.log('The player does not have stronger triunfo cards than those that were fired with, he can play any triunfo card so play the weakest');

                            // Play the weakest triunfo card
                            var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));
                            return weakestCard;

                        }

                    }
                    else {

                        // The player does not have triunfo and thus can play any card
                        logUtils.log('The player does not have triunfo and thus can play any card');

                        if (mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()) {

                            // The teammate will win the round so pass on cards
                            logUtils.log('The teammate will win the round so pass on cards');

                            // Attempt to pass on any vulnerable 3
                            var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                            if (colorsOfAllVulnerable3s.length > 0) {
                                return { n: 3, c: colorsOfAllVulnerable3s[0] };
                            }


                            // Attempt to pass on any vulnerable 1
                            var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                            if (vulnerableAs !== null) {
                                return vulnerableAs;
                            }


                            // Attempt to pass on 12 or 11 without braking any songs
                            var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                                return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                            });

                            if (noSongColorsWith12or11.length > 0) {
                                if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                                    return { n: 12, c: noSongColorsWith12or11[0] };
                                }
                                else {
                                    return { n: 11, c: noSongColorsWith12or11[0] };
                                }
                            }


                            // Attempt to pass on a 10
                            var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                                return handGroupedByColor[color].includes(10);
                            });

                            if (colorsWith10.length > 0) {
                                return { n: 10, c: colorsWith10[0] };
                            }

                        }


                        // We will lose the round. Play the worst card possible
                        logUtils.log('We will lose the round. Play the worst card possible');

                        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
                        return weakestCardOfAllColors; 

                    }

                }

            }
            else {

                // The lead card and the most powerful card are not triunfo
                logUtils.log('The lead card and the most powerful card are not triunfo');

                if (_.has(handGroupedByColor, tableCards[0].c) && handGroupedByColor[tableCards[0].c].length > 0) {

                    // The player has cards in the lead color, he is required to play more powerful ones first if possible
                    logUtils.log('The player has cards in the lead color, he is required to play more powerful ones first if possible');

                    if (gameUtils.card1IsStrongerThanCard2SameColor(handGroupedByColor[tableCards[0].c][0], mostPowerfulCard.n)) {

                        // The player has stronger cards in the lead color
                        logUtils.log('The player has stronger cards in the lead color');

                        // Play the weakest valid card in the lead colord
                        var weakestValidCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, mostPowerfulCard.n, availableSingingColors.includes(tableCards[0].c));
                        return weakestValidCard;

                    }
                    else {

                        // The player has only weaker cards in the lead color
                        logUtils.log('The player has only weaker cards in the lead color');

                        // Play the weakest card in lead color
                        var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, tableCards[0].c, 0, availableSingingColors.includes(tableCards[0].c));
                        return weakestCard;

                    }

                }
                else {

                    // The player does not have any card in the lead color
                    logUtils.log('The player does not have any card in the lead color');

                    if (_.has(handGroupedByColor, triunfo) && handGroupedByColor[triunfo].length > 0) {

                        // The player has triunfo and should play the weakest as it will win the round
                        logUtils.log('The player has triunfo and should play the weakest as it will win the round');

                        // Play the weakest triunfo card
                        var weakestCard = reasonerUtils.getWeakestPossibleCardOfColor(handGroupedByColor, triunfo, 0, availableSingingColors.includes(triunfo));
                        return weakestCard;

                    }
                    else {

                        // The player has no triunfo and thus can play any card
                        logUtils.log('The player has no triunfo and thus can play any card');

                        if (mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex()) {

                            // The teammate will win the round so attempt to pass on cards

                            // Attempt to pass on any vulnerable 3
                            var colorsOfAllVulnerable3s = reasonerUtils.getColorsOfAllVulnerable3s(handGroupedByColor, triunfo, true, analytics);
                            if (colorsOfAllVulnerable3s.length > 0) {
                                return { n: 3, c: colorsOfAllVulnerable3s[0] };
                            }


                            // Attempt to pass on any vulnerable 1
                            var vulnerableAs = reasonerUtils.getVulnerableAs(handGroupedByColor, triunfo, analytics);
                            if (vulnerableAs !== null) {
                                return vulnerableAs;
                            }


                            // Attempt to pass on 12 or 11 without braking any songs
                            var noSongColorsWith12or11 = _.filter(Object.keys(handGroupedByColor), function (color) {
                                return handGroupedByColor[color].length > 0 && !availableSingingColors.includes(color) && _.intersection(handGroupedByColor[color], [12, 11]).length > 0;
                            });

                            if (noSongColorsWith12or11.length > 0) {
                                if (handGroupedByColor[noSongColorsWith12or11[0]].includes(12)) {
                                    return { n: 12, c: noSongColorsWith12or11[0] };
                                }
                                else {
                                    return { n: 11, c: noSongColorsWith12or11[0] };
                                }
                            }


                            // Attempt to pass on a 10
                            var colorsWith10 = _.filter(Object.keys(handGroupedByColor), function (color) {
                                return handGroupedByColor[color].includes(10);
                            });

                            if (colorsWith10.length > 0) {
                                return { n: 10, c: colorsWith10[0] };
                            }

                        }


                        // The round is lost so play the worst possible card
                        logUtils.log('The round is lost so play the worst possible card');

                        var weakestCardOfAllColors = reasonerUtils.getWeakestCardOfAllColors(handGroupedByColor, triunfo, true);
                        return weakestCardOfAllColors; 

                    }

                }

            }

        }

    }


    // Follow up card
    this.strategy_9 = function (handGroupedByColor, triunfo, analytics, validCards, ongoingPlays, availableSingingColors) {

        logUtils.log('STRATEGY 9', 5);
        logUtils.log('Params: handGroupedByColor', 1);
        logUtils.log(handGroupedByColor);
        logUtils.log('Params: triunfo', 1);
        logUtils.log(triunfo);
        logUtils.log('Params: analytics', 1);
        logUtils.log(analytics);
        logUtils.log('Params: validCards', 1);
        logUtils.log(validCards);
        logUtils.log('Params: ongoingPlays', 1);
        logUtils.log(ongoingPlays);
        logUtils.log('Params: availableSingingColors', 1);
        logUtils.log(availableSingingColors);


        var tableCards = _.map(ongoingPlays, function (play) { return play.card; });
        var mostPowerfulCard = gameUtils.getMostPowerfulCard(tableCards, triunfo);
        var mostPowerfulPlay = _.find(ongoingPlays, function (play) { return play.card.n === mostPowerfulCard.n && play.card.c === mostPowerfulCard.c; });
        //var isTeammateLeadingRound = mostPowerfulPlay.player === this.aiPlayer.getTeammateIndex();


        switch (tableCards.length) {

            case 1:
                return this.strategy_9_card_2(handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, availableSingingColors);

            case 2:
                return this.strategy_9_card_3(handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, mostPowerfulPlay, availableSingingColors);

            case 3:
                return this.strategy_9_card_4(handGroupedByColor, triunfo, analytics, tableCards, mostPowerfulCard, mostPowerfulPlay, availableSingingColors);

        }


        logUtils.log('ERROR: exhausted all objectives in strategy 9 and still could not find a card to play!');

    }

    //#endregion

    //#endregion


}






Level3StrategyReasoner.prototype.estimateBidAmount = function (hand, firstTeammateBid, triunfo) {

    var referenceBid = 0;
    var handGroupedByColor = gameUtils.groupHandByColorAndSimplify(hand);


    // Reference bid of 170
    if (this.canBid170(handGroupedByColor, triunfo)) {
        referenceBid = 170;
    }
    else if (this.canBid140(handGroupedByColor, triunfo)) {
        referenceBid = 140;
    }
    else if (this.canBid130(handGroupedByColor, triunfo)) {
        referenceBid = 130;
    }
    else if (this.canBid120(handGroupedByColor, triunfo)) {
        referenceBid = 120;
    }
    else if (this.canBid110(handGroupedByColor, triunfo)) {
        referenceBid = 110;
    }
    else if (this.canBid100(handGroupedByColor, triunfo)) {
        referenceBid = 100;
    }
    else if (this.canBid90(handGroupedByColor, triunfo)) {
        referenceBid = 90;
    }
    else if (this.canBid80(handGroupedByColor, triunfo)) {
        referenceBid = 80;
    }
    else if (this.canBid70(handGroupedByColor, triunfo)) {
        referenceBid = 70;
    }
    else {

        // No rule was hit, use the overpowered cards technique
        var lostPoints = 0;

        // For each card that has a value, see if this card has a risk to be lost, if so, count its score
        for (var color in handGroupedByColor) {

            var cardsInColor = handGroupedByColor[color];
            var lostPointsInColor = 30;

            for (var i = 0; i < cardsInColor.length; i++) {

                if (cardsInColor[i] === 1) {

                    // If the player has an As in a color, he probably won't lose it			
                    lostPointsInColor -= 11;

                }
                else if (cardsInColor[i] === 3) {

                    // If the player has an As or a Rey, the Tres is probably safe
                    if (_.intersection(cardsInColor, [1, 12]).length > 0) {
                        lostPointsInColor -= 10;
                    }

                }
                else if (cardsInColor[i] === 12) {

                    // If the player has an As, Tres or Caballo, the Rey is protected
                    if (_.intersection(cardsInColor, [1, 3, 11])) {
                        lostPointsInColor -= 4;
                    }

                }
                else if (cardsInColor[i] === 11) {

                    // If the player has an As, Tres, Rey or Sota, the Caballo is protected
                    if (_.intersection(cardsInColor, [1, 3, 12, 10]).length > 0) {
                        lostPointsInColor -= 3;
                    }

                }
                else if (cardsInColor[i] === 10) {

                    // If the player has an As, Tres, Rey, Caballo or a 7, the Caballo is protected
                    if (_.intersection(cardsInColor, [1, 3, 12, 11, 7]).length > 0) {
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
        var singingAmounts = _.map(singingColors, function (color) { return color === triunfo ? 40 : 20 });

        if (singingAmounts.length > 0) {

            var totalSingingAmount = _.reduce(singingAmounts, function (memo, num) { return memo + num; }, 0);
            if ((totalSingingAmount <= 20 && referenceBid + totalSingingAmount >= 90) || (totalSingingAmount <= 40 && referenceBid + totalSingingAmount >= 100) || (totalSingingAmount > 40 && referenceBid + totalSingingAmount > 100)) {

                // We can count the songs
                referenceBid += totalSingingAmount;

            }

        }



        // Add the teammate bid effect
        if (firstTeammateBid !== null) {
            if (firstTeammateBid > 0) {

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



Level3StrategyReasoner.prototype.chooseCardToPlay = function (hand, validCards, analytics) {


    if (hand.length === 0)
        return;


    if (hand.length === 1) {
        return hand[0];
    }


    var cardToPlay = null;
    var usedStrategy = '';

    var triunfo = this.aiPlayer.getTriunfo();
    var handGroupedByColor = gameUtils.groupHandByColorAndSimplify(hand);
    var plays = this.aiPlayer.getPlays();
    var songs = this.aiPlayer.getSongs();


    if (plays.length <= 0) {

        if (this.aiPlayer.isBuyer()) {

            var availableSingingColors = this.aiPlayer.getAvailableSingingColors();
            if (availableSingingColors.length > 0) { // if(this.aiPlayer.canSingLater()) {

                // Strategy 1.1: This is the first play in the game. The player is the buyer. Singing is possible.
                cardToPlay = this.strategy_1_1(handGroupedByColor, triunfo, availableSingingColors, analytics);
                usedStrategy = '1_1';

            }
            else {

                // Strategy 2: This is the first play in the game. The player is the buyer. Singing is not possible.
                cardToPlay = this.strategy_2(handGroupedByColor, triunfo, analytics);
                usedStrategy = '2';

            }

        }
        else if (this.aiPlayer.isTeammateOfBuyer()) {

            // Strategy 1.2: This is the first play in the game. The player is the teammate of the buyer.
            var availableSingingColors = this.aiPlayer.getAvailableSingingColors();

            cardToPlay = this.strategy_1_2(handGroupedByColor, triunfo, availableSingingColors, analytics);
            usedStrategy = '1_2';

        }
        else {

            // Get the suspected singing colors
            var suspectedSingingColors = reasonerUtils.getSuspectedFutureSingingColors(this.aiPlayer.getWinningBid().amount, triunfo, songs, analytics);

            //console.log(this.aiPlayer.getUsername() + ' has suspected the following singing colors:');
            //console.log(suspectedSingingColors);
            //console.log('');

            if (suspectedSingingColors.length > 0) {

                // Singing is possible
                // Strategy 3: This is the first play in the game. The player is not in the buying team. Singing is possible.
                cardToPlay = this.strategy_3(handGroupedByColor, triunfo, analytics, suspectedSingingColors);
                usedStrategy = '3';

            }
            else {

                // Singing is not possible
                // Strategy 4: This is the first play in the game. The player is not in the buying team. Singing is not possible.			
                cardToPlay = this.strategy_4(handGroupedByColor, triunfo, analytics);
                usedStrategy = '4';

            }

        }

    }
    else if (plays.length % 4 === 0) {

        if (this.aiPlayer.isInBuyingTeam()) {

            var availableSingingColors = this.aiPlayer.getAvailableSingingColors();
            if (availableSingingColors.length > 0) { // if(this.aiPlayer.canSingLater()) {

                // Strategy 5: This is not the first play in the game. This is the first play in the round. The player is in the buying team. Singing is possible.
                cardToPlay = this.strategy_5(handGroupedByColor, triunfo, availableSingingColors, analytics);
                usedStrategy = '5';

            }
            else {

                // Strategy 6: This is not the first play in the game. This is the first play in the round. The player is in the buying team. Singing is not possible.
                cardToPlay = this.strategy_6(handGroupedByColor, triunfo, analytics);
                usedStrategy = '6';

            }

        }
        else {

            // Get the suspected singing colors
            var suspectedSingingColors = reasonerUtils.getSuspectedFutureSingingColors(this.aiPlayer.getWinningBid().amount, triunfo, songs, analytics);

            //console.log(this.aiPlayer.getUsername() + ' has suspected the following singing colors:');
            //console.log(suspectedSingingColors);
            //console.log('');

            if (suspectedSingingColors.length > 0) {

                // Singing is possible
                // Strategy 7: This is not the first play in the game. This is the first play in the round. The player is not in the buying team. There might be singing. 
                cardToPlay = this.strategy_7(handGroupedByColor, triunfo, analytics, this.aiPlayer.getWinningBid(), suspectedSingingColors);
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

        if (this.aiPlayer.isInBuyingTeam()) {
            availableSingingColors = this.aiPlayer.getAvailableSingingColors();
        }

        cardToPlay = this.strategy_9(handGroupedByColor, triunfo, analytics, validCards, ongoingPlays, availableSingingColors);
        usedStrategy = '9';

    }


    if (cardToPlay && cardToPlay.n && cardToPlay.c) {

        return cardToPlay;

    }
    else {

        // Error in one of the strategies
        console.log('Error in strategy ' + usedStrategy);

        //TODO: remove this
        process.exit();

        //var cardIndex = Math.floor(Math.random() * validCards.length);
        //return validCards[cardIndex];

    }


}



module.exports = Level3StrategyReasoner;