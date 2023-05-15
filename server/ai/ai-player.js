const uuidV4 = require('uuid/v4');
var _ = require('underscore');
var gameUtils = require('../core/game-utils');
var LegacyStrategyReasoner = require('./legacy-strat-reasoner/reasoner');
var Level3StrategyReasoner = require('./lv3-strat-reasoner/reasoner');
var Level3StrategySimulationReasoner = require('./lv3-strat-sim-reasoner/reasoner');


function AiPlayer(config) {
	
    this.uuid = uuidV4();
    this.config = config;
    this.username = config.username;

    this.index = -1;
    this.dealer = -1;
	this.players = [];
    this.hand = [];
    this.handBackup = [];
	this.bids = [];
	this.maxBid = null;
	this.triunfo = '';
	this.bidAmountPerColorAsTriunfo = { 'o': 0, 'b': 0, 'c': 0, 'e': 0 };
	this.plays = [];
    this.songs = [];
    this.wins = [];
	this.analytics = {
		remainingCardsByColor: null, //{ 'o': [], 'b': [], 'c': [], 'e': [] },
		teammateTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 }, // '1' means that this player can have up to the As in this color. '0' means that he doesn't have any card in this color
		rightOppTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 },
		leftOppTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 }
	};

    switch (config.reasoner.type) {

        case 'lv3-strat':
            this.reasoner = new Level3StrategyReasoner(this, config.reasoner.options);
            break;

        case 'legacy-strat':
            this.reasoner = new LegacyStrategyReasoner(this, config.reasoner.options);
            break;

        case 'lv3-strat-sim':
            this.reasoner = new Level3StrategySimulationReasoner(this, config.reasoner.options);
            break;

    }


	this.getTopPossibleCardAnalyticsNodeFromIndex = function (index) {

		if (index === (this.index + 2) % 4) {
			return this.analytics.teammateTopPossibleCardByColor;
		}
		else if (index === (this.index + 1) % 4) {
			return this.analytics.rightOppTopPossibleCardByColor;
		}
		else if (index === (this.index + 3) % 4) {
			return this.analytics.leftOppTopPossibleCardByColor;
		}
		else {
			return null;
		}

	}

}




AiPlayer.prototype.getId = function() {
    return this.uuid;
}



AiPlayer.prototype.getIndex = function() {
    return this.index;
}



AiPlayer.prototype.getDealer = function () {
    return this.dealer;
}



AiPlayer.prototype.getTeammateIndex = function() {
    return (this.index + 2) % 4;
}



AiPlayer.prototype.getUsername = function() {
    return this.username;
}



AiPlayer.prototype.getPlayerInfo = function() {
    return {
    	id: this.uuid,
    	username: this.username,
    	type: 'ai'
    };
}



AiPlayer.prototype.isBuyer = function() {
    
    if(this.maxBid !== null) {
    	return this.maxBid.player === this.index;
    }

    return false;
}



AiPlayer.prototype.isTeammateOfBuyer = function() {
    
    if(this.maxBid !== null) {
    	return this.maxBid.player === (this.index + 2) % 4;
    }

    return false;
}



AiPlayer.prototype.isInBuyingTeam = function() {    
    return this.isBuyer() || this.isTeammateOfBuyer();
}



AiPlayer.prototype.canSingLater = function() {   

	var self = this;
    var valid_colors = [];

    // Get the songs of the player's team
    var sang_colors = _.chain(this.songs)
                            .filter(function(song) { return song.player === self.index || song.player === (self.index + 2) % 4; })
                            .map(function(song) { return song.color})
                            .value();

    // A winning bid of 90 only lets you sing once for 20 points
    if(this.maxBid.amount === 90) {
        if(sang_colors.length > 0) {
            return false;
        }
        else {
            // Get possible singing colors excluding triunfo
            valid_colors = gameUtils.getValidSingingColors(this.hand, [this.triunfo]);
        }
    }

    // A winning bid of 100 only lets you sing one time in triunfo or 2 times in other colors
    if(this.maxBid.amount === 100) {
        if(sang_colors.length >= 2) {
            return false;
        }
        else if(sang_colors.length === 1) {
            if(sang_colors.includes(this.triunfo)) {
                return false;
            }
            else {
                // Get possible singing colors that are not triunfo and not previously sang before
                valid_colors = gameUtils.getValidSingingColors(this.hand, sang_colors.concat(this.triunfo));
            }
        }
        else {
            // Get all possible singing colors since there are no previous songs
            valid_colors = gameUtils.getValidSingingColors(this.hand, []);
        }
    }


    // no limitations if we got here so get all singing colors that were not previously sang before
    valid_colors = gameUtils.getValidSingingColors(this.hand, sang_colors);
    

    return valid_colors.length > 0;
}



AiPlayer.prototype.getAvailableSingingColors = function() {   

	if(!this.isInBuyingTeam()) {

		return [];

	}
	else {

		if(this.maxBid.amount <= 80) {

			return [];

		}
		else {

			// Keep a reference to self
			var self = this;

		    // Get the songs of the player's team
		    var sang_colors = _.chain(this.songs)
		                            .filter(function(song) { return song.player === self.index || song.player === (self.index + 2) % 4; })
		                            .map(function(song) { return song.color})
		                            .value();


		    
		    if(this.maxBid.amount <= 90) {

		    	// A winning bid of 90 only lets you sing once for 20 points
		        if(sang_colors.length > 0) {

		        	// You can only sing once in 20 with a bid of 90
		            return [];

		        }
		        else {

		            // Get possible singing colors excluding triunfo
		            return gameUtils.getValidSingingColors(this.hand, [this.triunfo]);

		        }
		    }
		    else if(this.maxBid.amount === 100) {

		    	// A winning bid of 100 only lets you sing one time in triunfo or 2 times in other colors
		    	if(sang_colors.length >= 2) {

		    		// You can sing once in 40 or twice in 20
		            return [];

		        }
		        else if(sang_colors.length === 1) {

		            if(sang_colors.includes(this.triunfo)) {

		            	// You have already sang once and in triunfo, you're done
		                return [];

		            }
		            else {

		                // Get possible singing colors that are not triunfo and not previously sang before
		                return gameUtils.getValidSingingColors(this.hand, sang_colors.concat(this.triunfo));

		            }
		        }
		        else {

		            // Get all possible singing colors since there are no previous songs
		            return gameUtils.getValidSingingColors(this.hand, []);

		        }

		    }
		    else {

		    	// no limitations if we got here so get all singing colors that were not previously sang before
		    	return gameUtils.getValidSingingColors(this.hand, sang_colors);

		    }

		}

	}

}



AiPlayer.prototype.getBids = function() {
    return this.bids;
}



AiPlayer.prototype.getWinningBid = function() {
    return this.maxBid;
}



AiPlayer.prototype.getPlays = function() {
    return this.plays;
}



AiPlayer.prototype.getSongs = function() {
    return this.songs;
}



AiPlayer.prototype.getTriunfo = function() {
    return this.triunfo;
}



AiPlayer.prototype.getMaxTeammateBid = function() {
    
	var teammateIndex = (this.index + 2) % 4;
	var teammateBids = _.filter(this.bids, function (bid) { return bid.player === teammateIndex; });

	if(teammateBids.length > 0) {
		return _.max(teammateBids, function (bid) { return bid.amount; });
	}
	else {
		return null;
	}

}



AiPlayer.prototype.startGame = function(gameInfo) {
    
	// Set basic data
    this.index = gameInfo.index;
    this.players = gameInfo.players;
    this.hand = gameInfo.hand;
    this.handBackup = _.clone(this.hand);
    this.dealer = gameInfo.dealer;

    // Update analystics
    this.analytics.remainingCardsByColor = gameUtils.getHandComplementGroupedByColor(this.hand);

    for(var color in this.analytics.remainingCardsByColor) {

    	this.analytics.teammateTopPossibleCardByColor[color] = this.analytics.remainingCardsByColor[color].length > 0 ? this.analytics.remainingCardsByColor[color][0] : 0;
    	this.analytics.rightOppTopPossibleCardByColor[color] = this.analytics.teammateTopPossibleCardByColor[color];
    	this.analytics.leftOppTopPossibleCardByColor[color] = this.analytics.teammateTopPossibleCardByColor[color];

    }

}



AiPlayer.prototype.registerBid = function(bid) {
	
	// Add the bid to the list
	this.bids.push(bid);

	// Update the max bid
	if(this.maxBid === null) {
		this.maxBid = bid;
	}
	else {
		if(bid.amount > this.maxBid.amount) {
			this.maxBid = bid;
		}
	}
}



AiPlayer.prototype.registerWinningBid = function(winningBid) {	
	this.maxBid = winningBid;
}



AiPlayer.prototype.registerWin = function (win) {
    this.wins.push(win);
}



AiPlayer.prototype.getWins = function () {
    return this.wins;
}



AiPlayer.prototype.provideBid = function() {

	var self = this;

	for(var color in this.bidAmountPerColorAsTriunfo) {
		this.bidAmountPerColorAsTriunfo[color] = this.reasoner.estimateBidAmount(this.hand, 0, color);
	}

    //if (this.config.reasoner.type === 'lv3-strat-sim') {
    //    console.log(this.username + ': o(' + this.bidAmountPerColorAsTriunfo['o'] + ') - b(' + this.bidAmountPerColorAsTriunfo['b'] + ') - e(' + this.bidAmountPerColorAsTriunfo['e'] + ') - c(' + this.bidAmountPerColorAsTriunfo['c'] + ')');
    //}


	var colorWithMaxBid = _.max(Object.keys(this.bidAmountPerColorAsTriunfo), function (key) { return self.bidAmountPerColorAsTriunfo[key]; });


	if(this.maxBid !== null) {
		return {
			player: this.index,
	    	amount: this.bidAmountPerColorAsTriunfo[colorWithMaxBid] > Math.max(this.maxBid.amount, 70) ? this.bidAmountPerColorAsTriunfo[colorWithMaxBid] : 0
		};
	}
	else {
		return {
			player: this.index,
	    	amount: this.bidAmountPerColorAsTriunfo[colorWithMaxBid] >= 70 ? this.bidAmountPerColorAsTriunfo[colorWithMaxBid] : 0
		}
	}

}



AiPlayer.prototype.chooseTriunfo = function() {
    
    var self = this;

	var colorWithMaxBid = _.max(Object.keys(this.bidAmountPerColorAsTriunfo), function (key) { return self.bidAmountPerColorAsTriunfo[key]; });
	return colorWithMaxBid;

	/*
    var color = '';
    var random = Math.floor(Math.random() * 4);
	
	switch(random) {
		case 0: this.triunfo = 'o'; break;
		case 1: this.triunfo = 'b'; break;
		case 2: this.triunfo = 'e'; break;
		case 3: this.triunfo = 'c'; break;
	}

	return this.triunfo;
	*/

}



AiPlayer.prototype.registerTriunfoColor = function(triunfo) {
	//console.log(this.username + ' registered the triunfo color: ' + triunfoColor);
	this.triunfo = triunfo;
}



AiPlayer.prototype.registerSong = function(song) {
    this.songs.push(song);
}



AiPlayer.prototype.performSong = function(validColors) {
    
	if(validColors.length <= 0) {
		return null;
	}

	var color = validColors[Math.floor(Math.random() * validColors.length)];
    
    return {
    	player: this.index,
    	amount: color === this.triunfo ? 40 : 20,
    	color: color
    };
}



AiPlayer.prototype.registerPlay = function(play) {
    
	// Add the play to the list
    this.plays.push(play);


    // Get the plays of the current round        
    var roundPlayCount = Math.floor((this.plays.length - 1) / 4.0) * 4;
    var roundPlays = _.last(this.plays, this.plays.length - roundPlayCount);

    // Get the most powerful card in the round
    var roundCards = _.map(roundPlays, function (play) { return play.card; });
    var roundMostPowerfulCard = gameUtils.getMostPowerfulCard(roundCards, this.triunfo);


    //***************************************************
    /*
    if (this.index === 0) {

        console.log('');
        console.log('');

        console.log('Plays (Triunfo: ' + this.triunfo + ')');
        console.log(roundPlays);
        console.log('');

        if (this.index !== play.player) {
            console.log('Player analytics before play');
            console.log(this.getTopPossibleCardAnalyticsNodeFromIndex(play.player));
            console.log('');
        }

    }
    */
    //**************************************************


    //#region Update the remaining cards per color analytics

	// Remove the card from the remaining cards
	this.analytics.remainingCardsByColor[play.card.c] = _.without(this.analytics.remainingCardsByColor[play.card.c], play.card.n);

	// Get the remaining cards that are weaker than this card in case someone had this as his top possible card
	var weakerRemainingCards = _.filter(this.analytics.remainingCardsByColor[play.card.c], function (cardNumber) { return gameUtils.card1IsStrongerThanCard2SameColor(play.card.n, cardNumber); });

	// Update the top possible cards by color after removal of this card from the active cards
	if(this.analytics.teammateTopPossibleCardByColor[play.card.c] === play.card.n) {
		this.analytics.teammateTopPossibleCardByColor[play.card.c] = weakerRemainingCards.length > 0 ? weakerRemainingCards[0] : 0;
	}

	if(this.analytics.rightOppTopPossibleCardByColor[play.card.c] === play.card.n) {
		this.analytics.rightOppTopPossibleCardByColor[play.card.c] = weakerRemainingCards.length > 0 ? weakerRemainingCards[0] : 0;
	}

	if(this.analytics.leftOppTopPossibleCardByColor[play.card.c] === play.card.n) {
		this.analytics.leftOppTopPossibleCardByColor[play.card.c] = weakerRemainingCards.length > 0 ? weakerRemainingCards[0] : 0;
    }

    //#endregion


    //#region Update the top possible card analytics

	// We only investigate if the play wasn't carried out by the current player
	if(play.player !== this.index) {

        // We only analyze the 2nd, 3rd and 4th play in a round
        if (roundPlays.length > 1) {

            // Get the analytics node we will be updating
            var topPossibleCardByColorAnalyticsNode = this.getTopPossibleCardAnalyticsNodeFromIndex(play.player);


            if (roundMostPowerfulCard.c === this.triunfo) {

                if (roundCards[0].c === this.triunfo) {

                    // The lead card was in triunfo. We are only interested in the following cases:
                    // 1. the player card was in triunfo but weaker than the most powerful
                    // 2. the player card was in another color

                    if (play.card.c !== this.triunfo) {

                        // The player no longer has any triunfo cards
                        topPossibleCardByColorAnalyticsNode[this.triunfo] = 0;

                    }
                    else {

                        if (gameUtils.card1IsStrongerThanCard2SameColor(roundMostPowerfulCard.n, play.card.n)) {

                            var possibleRemainingTriunfoCards = _.filter(this.analytics.remainingCardsByColor[this.triunfo], function (cardNumber) {
                                return gameUtils.card1IsStrongerThanCard2SameColor(roundMostPowerfulCard.n, cardNumber);
                            });

                            if (possibleRemainingTriunfoCards.length > 0) {

                                // This would be the top possible card for this player in triunfo
                                topPossibleCardByColorAnalyticsNode[this.triunfo] = possibleRemainingTriunfoCards[0];

                            }
                            else {

                                // The player no longer has any triunfo cards
                                topPossibleCardByColorAnalyticsNode[this.triunfo] = 0;

                            }

                        }

                    }

                }
                else {

                    // The lead card wasn't triunfo so someone fired
                    if (play.card.c !== roundCards[0].c) {

                        // The player didn't follow the lead card color
                        topPossibleCardByColorAnalyticsNode[roundCards[0].c] = 0;

                        if (play.card.c !== this.triunfo) {

                            // The player no longer has any triunfo cards
                            topPossibleCardByColorAnalyticsNode[this.triunfo] = 0;

                        }
                        else {

                            if (gameUtils.card1IsStrongerThanCard2SameColor(roundMostPowerfulCard.n, play.card.n)) {

                                var possibleRemainingTriunfoCards = _.filter(this.analytics.remainingCardsByColor[this.triunfo], function (cardNumber) {
                                    return gameUtils.card1IsStrongerThanCard2SameColor(roundMostPowerfulCard.n, cardNumber);
                                });

                                if (possibleRemainingTriunfoCards.length > 0) {

                                    // This would be the top possible card for this player in triunfo
                                    topPossibleCardByColorAnalyticsNode[this.triunfo] = possibleRemainingTriunfoCards[0];

                                }
                                else {

                                    // The player no longer has any triunfo cards
                                    topPossibleCardByColorAnalyticsNode[this.triunfo] = 0;

                                }
                            }
                        }
                    }
                }
            }
            else {

                // No one fired. Here we are interested in the following cases:
                // 1. the player played a weaker card than the most powerful
                // 2. the player player a card in a different color (not triunfo)

                if (play.card.c === roundCards[0].c) {

                    if (gameUtils.card1IsStrongerThanCard2SameColor(roundMostPowerfulCard.n, play.card.n)) {

                        // The player has played a card in the same color as the lead but weaker than the most powerful card on table so update the top possible card to be the one right below the lead if any
                        var possibleRemainingCards = _.chain(this.analytics.remainingCardsByColor[play.card.c])
                            .filter(function (cardNumber) { return gameUtils.card1IsStrongerThanCard2SameColor(roundMostPowerfulCard.n, cardNumber); })
                            .value();


                        if (possibleRemainingCards.length > 0) {

                            // This would be the top possible card for this player in this color
                            topPossibleCardByColorAnalyticsNode[play.card.c] = possibleRemainingCards[0];

                        }
                        else {

                            // The player no longer has any card in this color
                            topPossibleCardByColorAnalyticsNode[play.card.c] = 0;

                        }

                    }

                }
                else {

                    topPossibleCardByColorAnalyticsNode[roundCards[0].c] = 0;
                    topPossibleCardByColorAnalyticsNode[this.triunfo] = 0;

                }
            }
        }	
    }

    //#endregion


    //***************************************************
    /*
    if (this.index === 0) {

        if (this.index !== play.player) {
            console.log('Player analytics after play');
            console.log(this.getTopPossibleCardAnalyticsNodeFromIndex(play.player));
        }

        if (this.plays.length % 4 === 0) {
            console.log('-----------------------------------------------------------');
        }

    }
    */
    //**************************************************

}



AiPlayer.prototype.performPlay = function (validCards) {
    //if (this.config.reasoner.role === 'sim') {
    //    console.log(this.username + '(' + this.config.reasoner.type + '): PERFORMPLAY CALLED');
    //}
	var cardToPlay = this.reasoner.chooseCardToPlay(this.hand, validCards, this.analytics);
	return {
		player: this.index,
		card: cardToPlay
	};

	/*
    var cardIndex = Math.floor(Math.random() * validCards.length);
    var card = validCards[cardIndex];
	return {
		player: this.index,
		card: card
	};
	*/
}



AiPlayer.prototype.reset = function(followUp) {
    this.index = followUp ? this.index : -1;
    this.dealer = followUp ? (this.dealer + 1) % 4 : this.dealer;
    this.players = [];
    this.hand = [];
    this.handBackup = [];
    this.bids = [];
	this.maxBid = null;
	this.triunfo = '';
	this.bidAmountPerColorAsTriunfo = { 'o': 0, 'b': 0, 'c': 0, 'e': 0 };
	this.plays = [];
    this.songs = [];
    this.wins = [];
	this.analytics = {
		remainingCardsByColor: null, //{ 'o': [], 'b': [], 'c': [], 'e': [] },
		teammateTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 }, 
		rightOppTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 },
		leftOppTopPossibleCardByColor: { 'o': 1, 'b': 1, 'c': 1, 'e': 1 }
	};
}



module.exports = AiPlayer;