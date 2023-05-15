var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var AiPlayer = require('../ai-player');
var gameUtils = require('../../core/game-utils');
var logUtils = require('../../utils/log-utils');


function SimulatedGame(gameConfig) {

	this.dealer = gameConfig.dealer;
	this.buyer = gameConfig.buyer;
	this.triunfo = gameConfig.triunfo;
	this.playerInTurn = gameConfig.playerInTurn;
	this.maxBid = _.clone(gameConfig.maxBid);
	this.results = { teamAPoints: 0, teamBPoints: 0 };

	// IMPORTANT: even when simulating a game that has been partially played (no hands contains 10 cards), the simulated game requires the initial hands
	// in order to build the right analytics up to that point in the game
	this.hands = [null, null, null, null];
	this.hands[0] = _.clone(gameConfig.hands[0]); 
	this.hands[1] = _.clone(gameConfig.hands[1]);
	this.hands[2] = _.clone(gameConfig.hands[2]);
	this.hands[3] = _.clone(gameConfig.hands[3]);

	// Clone array data so as to not affect the source config that will be reused for other simulated games
	this.plays = _.clone(gameConfig.plays);
	this.ongoingPlays = _.clone(gameConfig.ongoingPlays);	
	this.songs = _.clone(gameConfig.songs);
	this.wins = _.clone(gameConfig.wins);

	// Create the ai players partaking in the simulation
	this.players = [];
	this.virtualPlayers = {};
	for (var i = 0; i < 4; i++) {
		var aiPlayerConfig = {
			username: 'Sim.' + i,
			reasoner: gameConfig.reasoner
		};

		aiPlayer = new AiPlayer(aiPlayerConfig);

		this.players.push(aiPlayer.getPlayerInfo());
		this.virtualPlayers[aiPlayer.getId()] = aiPlayer;
	}

	// Give all ai players their hands and indexes and inform them of game start
	for (var i = 0; i < this.players.length; i++) {
		this.virtualPlayers[this.players[i].id].startGame({
			index: i,
			players: this.players,
			hand: this.hands[i],
			dealer: this.dealer
		});
	}

	// Inform all ai players of the winning bid
	for (var i = 0; i < this.players.length; i++) {
		this.virtualPlayers[this.players[i].id].registerWinningBid(this.maxBid);
	}

	// Inform all ai players of the triunfo
	for (var i = 0; i < this.players.length; i++) {
		this.virtualPlayers[this.players[i].id].registerTriunfoColor(this.triunfo);
	}

	// Inform all ai players of the plays that occurred (so they can updated their analytics)        
	for (var i = 0; i < this.plays.length; i++) {
		for (var j = 0; j < this.players.length; j++) {
			this.virtualPlayers[this.players[j].id].registerPlay(this.plays[i]);
		}
	}

	// Inform all ai players of the songs that occurred
	for (var i = 0; i < this.songs.length; i++) {
		for (var j = 0; j < this.players.length; j++) {
			this.virtualPlayers[this.players[j].id].registerSong(this.songs[i]);
		}
	}		



	this.beginNextTurn = function (previousPlayerInTurn) {

		// Get the next player in turn
		this.playerInTurn = this.getPlayerInTurn(previousPlayerInTurn);

		// Get the list of table cards and the list of valid cards to play
		var tableCards = _.map(this.ongoingPlays, function (play) { return play.card; });
		var validCardsToPlay = gameUtils.getValidCardsToPlay(this.hands[this.playerInTurn], tableCards, this.triunfo);

		var aiPlayerInTurn = this.virtualPlayers[this.players[this.playerInTurn].id];

		// Ask the AI to play a card. TODO: make this function async and call "processPlay" on return of async operation to improve performance
		var play = aiPlayerInTurn.performPlay(validCardsToPlay);

		// Process the play
		this.processPlay(play);		

	}


	this.getPlayerInTurn = function (previousPlayerInTurn) {
		if (this.plays.length <= 0) {
			// The first to play ever is the person on the right of the dealer
			return (this.dealer + 1) % 4;
		}
		else {
			// If it's the play (4 * n) where n > 0 it's the winner of the previous round
			if (this.plays.length % 4 == 0) {
				return this.wins[(this.plays.length / 4) - 1].player;
			}
			else {
				//Otherwise, it's just the player on the right
				return (previousPlayerInTurn + 1) % 4;
			}
		}
	}


	this.processPlay = function (play) {

		// Remove the card from the player's hand
		this.removeCard(play.player, play.card);

		// Add the play to the list and to the ongoing plays list
		this.plays.push(play);
		this.ongoingPlays.push(play);

		// Inform everyone about the play
		for (var i = 0; i < this.players.length; i++) {
			this.virtualPlayers[this.players[i].id].registerPlay(play);
		}

		// Check to see if this round has ended or not and schedule the next turn
		if (this.hasRoundEnded()) {

			// Wrap up round and mark the winner of the round
			this.wrapUpRound();

			// If the game has ended, wrap up, otherwise, start next round
			if (this.hasPlayEnded()) {

				// Wrap up the game
				this.wrapUpGame();

			}
			else {

				// This is the start of another round, so handle singing if needed
				this.handleSinging();

			}

		}
		else {

			// The current round is still going
			this.beginNextTurn(this.playerInTurn);

		}
	}


	this.removeCard = function (player, cardToRemove) {

		var cardIndex = _.findIndex(this.hands[player], function (card) { return card.n === cardToRemove.n && card.c === cardToRemove.c; });
		if (cardIndex >= 0) {
			this.hands[player].splice(cardIndex, 1);
		}
		else {
			logUtils.log('Could not delete the card ' + cardToRemove.n + cardToRemove.c + ' from ' + this.players[player].username + ' hand because s/he does not own it!');
			logUtils.log(this.hands[player]);
		}

	}


	this.hasRoundEnded = function () {
		return this.ongoingPlays.length == 4;
	}


	this.wrapUpRound = function () {

		// Determine the winner of the round
		var winningPlay = this.ongoingPlays[0];
		for (var i = 1; i < 4; i++) {
			if (gameUtils.card1IsStrongerThanCard2(this.ongoingPlays[i].card, winningPlay.card, false, this.triunfo)) {
				winningPlay = this.ongoingPlays[i];
			}
		}

		// Create and add a new win
		var win = {
			player: winningPlay.player,
			cards: _.map(this.ongoingPlays, function (play) { return play.card; }),
			value: _.reduce(this.ongoingPlays, function (sum, play) { return sum + gameUtils.getCardValue(play.card.n); }, 0)
		}
		this.wins.push(win);

		// Clear the ongoing plays
		this.ongoingPlays = [];

		// Inform everyone of the win
		logUtils.log(this.players[win.player].username + ' won round ' + this.wins.length);

		// Reset the singing variables for the round
		this.hasSongOccuredInRound = false;
		this.singingAttemptsInRound = 0;

	}


	this.hasPlayEnded = function () {
		return this.plays.length >= 40;
	}


	this.wrapUpGame = function () {

		//console.log('');
		//console.log(this.wins);
		//console.log('');

		// Count wins
		for (var i = 0; i < this.wins.length; i++) {
			if (this.wins[i].player % 2 === 0) {
				this.results.teamAPoints += this.wins[i].value;
			}
			else {
				this.results.teamBPoints += this.wins[i].value;
			}
		}

		// Count songs
		for (var i = 0; i < this.songs.length; i++) {
			if (this.songs[i].player % 2 === 0) {
				this.results.teamAPoints += this.songs[i].amount;
			}
			else {
				this.results.teamBPoints += this.songs[i].amount;
			}
		}

		// Count the last round bonus
		if (this.wins[this.wins.length - 1].player % 2 === 0) {
			this.results.teamAPoints += 10;
		}
		else {
			this.results.teamBPoints += 10;
		}		

	}


	this.handleSinging = function () {

		// Get the last round winner and his teammate
		var last_round_winner = this.wins[this.wins.length - 1].player;
		var last_round_winner_teammate = (last_round_winner + 2) % 4;

		// If the last round winner isn't from the buying team, no singing is even possible
		if (last_round_winner !== this.buyer && last_round_winner !== (this.buyer + 2) % 4) {

			// No singing possible so just continue play
			this.beginNextTurn(this.playerInTurn);

		}
		else {

			// If a song has already been made, we're done
			if (this.hasSongOccuredInRound) {

				// No singing possible so just continue play
				this.beginNextTurn(this.playerInTurn);

			}
			else {

				// If 2 attempts have already been carried out (by buyer & teammate), no further singing allowed so just continue play
				if (this.singingAttemptsInRound >= 2) {

					// No singing possible so just continue play
					this.beginNextTurn(this.playerInTurn);

				}
				else {

					// Determine which player to offer the possibility to sing to. We start by the winner of the round then his teammate
					var singing_player = this.singingAttemptsInRound === 0 ? last_round_winner : last_round_winner_teammate;
					this.singingAttemptsInRound++;


					var validColorsToSing = this.getPossibleSingingColors(singing_player);
					if (validColorsToSing.length > 0) {						

						// Give the AI a chance to sing and inform everyone if it does
						var aiPlayerToSing = this.virtualPlayers[this.players[singing_player].id];

						var song = aiPlayerToSing.performSong(validColorsToSing);
						if (song !== null) {

							// Update the singing flag
							this.hasSongOccuredInRound = true;

							// Set the round of the song then add it
							song.round = this.wins.length;
							this.songs.push(song);

							// Inform everyone about the song
							//console.log(this.players[singing_player].username + ' sang ' + song.amount + ' in ' + song.color);
							for (var i = 0; i < this.players.length; i++) {
								this.virtualPlayers[this.players[i].id].registerSong(song);
							}

							// Continue play
							this.beginNextTurn(this.playerInTurn);

						}
						else {

							// The AI chose not to sing, see if further songs are possible
							this.handleSinging();

						}											

					}
					else {

						// The player supposed to sing didn't have any songs so see if we need to further check his teammate
						this.handleSinging();

					}

				}

			}

		}

	}


	this.getPossibleSingingColors = function (player) {

		// Make sure the current player belongs to the buying team
		if (player !== this.buyer && player !== (this.buyer + 2) % 4) {
			return [];
		}

		// Make sure that this isn't the first round
		if (this.wins.length <= 0) {
			return [];
		}

		// Make sure that the player belongs to the team that won the last round
		var lastWin = this.wins[this.wins.length - 1];
		if (player !== lastWin.player && player !== (lastWin.player + 2) % 4) {
			return [];
		}

		// Make sure that the winning bid was superior or equal 90, otherwise no singing is allowed
		if (this.maxBid.amount < 90) {
			return [];
		}

		// Get the songs of the player's team
		var sang_colors = _.chain(this.songs)
                                .filter(function (song) { return song.player === player || song.player === (player + 2) % 4; })
                                .map(function (song) { return song.color })
                                .value();

		// A winning bid of 90 only lets you sing once for 20 points
		if (this.maxBid.amount === 90) {
			if (sang_colors.length > 0) {
				return [];
			}
			else {
				// Get possible singing colors excluding triunfo
				return gameUtils.getValidSingingColors(this.hands[player], [this.triunfo]);
			}
		}

		// A winning bid of 100 only lets you sing one time in triunfo or 2 times in other colors
		if (this.maxBid.amount === 100) {
			if (sang_colors.length >= 2) {
				return [];
			}
			else if (sang_colors.length === 1) {
				if (sang_colors.includes(this.triunfo)) {
					return [];
				}
				else {
					// Get possible singing colors that are not triunfo and not previously sang before
					return gameUtils.getValidSingingColors(this.hands[player], sang_colors.concat(this.triunfo));
				}
			}
			else {
				// Get all possible singing colors since there are no previous songs
				return gameUtils.getValidSingingColors(this.hands[player], []);
			}
		}


		// no limitations if we got here so get all singing colors that were not previously sang before
		return gameUtils.getValidSingingColors(this.hands[player], sang_colors);

	}

}


SimulatedGame.prototype.simulate = function () {

	this.beginNextTurn(this.playerInTurn);
	return { teamAPoints: this.results.teamAPoints, teamBPoints: this.results.teamBPoints };

}


SimulatedGame.prototype.simulateWithPlay = function (play) {

	this.processPlay(play);
	return { teamAPoints: this.results.teamAPoints, teamBPoints: this.results.teamBPoints };

}


module.exports = SimulatedGame;