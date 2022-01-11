var _ = require('underscore');
var underscoreDeepExtend = require('underscore-deep-extend'); _.mixin({ deepExtend: underscoreDeepExtend(_) });
var randomWords = require('random-words');
var AiPlayer = require('../ai/ai-player');
var gameUtils = require('./game-utils');
var logUtils = require('../utils/log-utils');
var dbManager = require('../data/db-manager');
var config = require('../../config');
const uuidV4 = require('uuid/v4');



function Game(gameManager, gameConfig) {

    this.gameManager = gameManager;
    this.gameConfig = _.deepExtend(config.game, gameConfig);

    this.uuid = uuidV4();
    this.creationDate = new Date();
    this.keyword = randomWords();
    this.state = 'matchmaking';
    this.phase = 'none';
    this.dealer = Math.floor(Math.random() * 4);
    this.buyer = -1;
    this.triunfo = '';
    this.playerInTurn = -1;
    this.maxBid = null;    
    this.bids = [];
    this.passedPlayers = [];
    this.hands = {};
    this.plays = [];
    this.ongoingPlays = [];
    this.wins = [];
    this.songs = [];

    this.players = [];
    this.humanPlayers = {};    
    this.virtualPlayers = {};
    this.humanSpectators = []; // This is an array while the others on top are objects

    this.results = {
        teamAScore: 0,
        teamBScore: 0,
        teamAPoints: 0,
        teamBPoints: 0
    };

    this.marathonId = uuidV4();
    this.marathonOrder = 1;
    this.marathonScore = { teamAScore: 0, teamBScore: 0};
    this.resetCount = 0;


    
    // Build a random deck for the first time
    var colors = ['o', 'c', 'e', 'b'];
    var numbers = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
    this.deck = [];
    for(var i = 0; i < colors.length; i++) {
        for(var j = 0; j < numbers.length; j++) {
            this.deck.push({n: numbers[j], c: colors[i]});
        }
    }
    this.deck = _.shuffle(this.deck);    



    


    this.startGame = function() {
        
        var self = this;

        this.startDate = new Date();
        this.state = 'ongoing';
        this.phase = 'bidding';


        // Subscribe to human players actions (all players in this.players are human at this point).
        for(var i = 0; i < this.players.length; i++) {

            var humanPlayerId = this.players[i].id;
            var humanPlayerSocket = this.humanPlayers[humanPlayerId];

            humanPlayerSocket.on('bid_submitted', function(bid, callback){ self.onHumanPlayerSubmittedBid(bid, callback); });
            humanPlayerSocket.on('triunfo_chosen', function(triunfo, callback){ self.onHumanPlayerChoseTriunfo(triunfo, callback); });
            humanPlayerSocket.on('song_performed', function(song, callback){ self.onHumanPlayerPerformedSong(song, callback); });
            humanPlayerSocket.on('play_performed', function(play, callback){ self.onHumanPlayerPerformedPlay(play, callback); });
        }


        // Add virtual players
        var aiPlayer = null;
        var humanPlayersCount = this.players.length;

        if (humanPlayersCount === 2 && this.gameConfig.matchmaking.mode === 'pvc') {
            // Add first AI player at index 1
            aiPlayer = new AiPlayer(this.gameConfig.ai.players[0]);
            this.players.splice(1, 0, aiPlayer.getPlayerInfo());
            this.virtualPlayers[aiPlayer.getId()] = aiPlayer;

            // Add second AI player at index 3
            aiPlayer = new AiPlayer(this.gameConfig.ai.players[1]);
            this.players.splice(3, 0, aiPlayer.getPlayerInfo());
            this.virtualPlayers[aiPlayer.getId()] = aiPlayer;
        }
        else {
            for (var i = humanPlayersCount + 1; i <= 4; i++) {
                var aiPlayerConfig = this.gameConfig.ai.players[i - humanPlayersCount - 1];
                aiPlayer = new AiPlayer(aiPlayerConfig);

                this.players.push(aiPlayer.getPlayerInfo());
                this.virtualPlayers[aiPlayer.getId()] = aiPlayer;
            }
        }


        // Distribute cards just as they are distributed in the real world starting with the player at the right of the dealer
        this.hands[this.players[0].id] = [];
        this.hands[this.players[1].id] = [];
        this.hands[this.players[2].id] = [];
        this.hands[this.players[3].id] = [];

        for(var i = 0; i < this.deck.length; i = i + 5) {
            var playerToServe = (this.dealer + (i / 5) + 1) % 4;
            for(var j = i; j < i + 5; j++) {
                this.hands[this.players[playerToServe].id].push(this.deck[j]);
            }
        }


        // Sort all hands by color then value according to the rules of Tijari
        for(var i = 0; i < this.players.length; i++) {
            this.hands[this.players[i].id] = this.sortHand(this.hands[this.players[i].id]);
        }


        // Update the deck state (so it may persist as it is to reduce unfruitful biddings)
        this.deck = [].concat(this.hands[this.players[0].id], this.hands[this.players[1].id], this.hands[this.players[2].id], this.hands[this.players[3].id]);

        

        // Inform players of game start
        for(var i = 0; i < this.players.length; i++) {

            // Share the hands of AI while the game is in beta
            var teammateHand = this.players[(i + 2) % 4].type === 'ai' ? this.hands[this.players[(i + 2) % 4].id] : null;
            var rightOppHand = this.players[(i + 1) % 4].type === 'ai' ? this.hands[this.players[(i + 1) % 4].id] : null;
            var leftOppHand = this.players[(i + 3) % 4].type === 'ai' ? this.hands[this.players[(i + 3) % 4].id] : null;

            // Inform players of the starting of the game
            if(this.players[i].type === 'human') {
                this.humanPlayers[this.players[i].id].emit('started_game', {
                    index: i,
                    dealer: this.dealer,
                    gameId: this.uuid,
                    keyword: this.keyword,
                    marathonId: this.marathonId,
                    marathonOrder: this.marathonOrder,
                    marathonScore: this.marathonScore,
                    players: this.players,
                    hand: this.hands[this.players[i].id],
                    bids:[],
                    max_bid: this.maxBid,
                    triunfo: '',
                    table: [],
                    plays: [],
                    wins: [],
                    showAiCards: config.game.ai.revealHand,
                    teammateHand: config.game.ai.revealHand ? teammateHand : null,
                    rightOppHand: config.game.ai.revealHand ? rightOppHand: null,
                    leftOppHand: config.game.ai.revealHand ? leftOppHand : null
                });
            }
            else if(this.players[i].type === 'ai') {
                this.virtualPlayers[this.players[i].id].startGame({
                    index: i,
                    players: this.players,
                    hand: this.hands[this.players[i].id],
                    dealer: this.dealer
                });
            }
        }
        

        // Inform spectators that the game is starting
        for(var i = 0; i < this.humanSpectators.length; i++) {
            this.humanSpectators[i].socket.emit('started_game', {
                dealer: this.dealer,
                players: this.players,
                marathon: this.marathon,
                hands: this.hands,
                bids:[],
                max_bid: this.maxBid,
                triunfo: '',
                plays: [],
                wins: []
            });
        }        


        // Start the first turn
        this.beginNextTurn(-1);

    }


    this.sortHand = function(hand) {
        return _.sortBy(hand, function(card) {
            var weight = 0;
            switch(card.c) {
                case 'o': weight += 400; break;
                case 'c': weight += 300; break;
                case 'e': weight += 200; break;
                case 'b': weight += 100; break;
            }
            switch(card.n) {
                case 1:  weight += 9; break;
                case 3:  weight += 8; break;
                case 12: weight += 7; break;
                case 11: weight += 6; break;
                case 10: weight += 5; break;
                case 7:  weight += 4; break;
                case 6:  weight += 3; break;
                case 5:  weight += 2; break;
                case 4:  weight += 1; break;
                case 2:  weight += 0; break;
            }
            return weight * -1;
        });
    }


    this.getPlayerInTurn = function(previousPlayerInTurn) {
        if(this.phase === 'bidding') {
            if(previousPlayerInTurn === -1) {
                return (this.dealer + 1) % 4;
            }
            else {
                var nextInTurn = (previousPlayerInTurn + 1) % 4;           
                while(this.passedPlayers.includes(nextInTurn)) {
                    nextInTurn = (nextInTurn + 1) % 4;
                }
                return nextInTurn;
            }
        }
        else if(this.phase === 'playing') {
            if(this.plays.length <= 0) {
                // The first to play ever is the person on the right of the dealer
                return (this.dealer + 1) % 4;
            }
            else {
                // If it's the play (4 * n) where n > 0 it's the winner of the previous round
                if(this.plays.length % 4 == 0) {
                    return this.wins[(this.plays.length / 4) - 1].player;
                }
                else {
                    //Otherwise, it's just the player on the right
                    return (previousPlayerInTurn + 1) % 4;
                }
            }
        }
    }


    this.updateBiddingInfo = function(newBid) {
        
        // Update the max bid if required
        if(this.maxBid === null) {
            this.maxBid = newBid;
        }
        else {
            if(newBid.amount > this.maxBid.amount) {
                this.maxBid = newBid;
            }
        }

        // Add the bid to the list
        this.bids.push(newBid);

        // If this is a passing bid, add the player to the passing players
        if(newBid.amount === 0) {
            this.passedPlayers.push(newBid.player);
        }
    }


    this.beginNextTurn = function(previousPlayerInTurn) {


        // Get the next player in turn
        this.playerInTurn = this.getPlayerInTurn(previousPlayerInTurn);


        if(this.phase === 'bidding') {

            if(this.players[this.playerInTurn].type === 'ai') {

                var aiPlayerInTurn = this.virtualPlayers[this.players[this.playerInTurn].id];

                // Get the AI bid
                var bid = aiPlayerInTurn.provideBid();

                // Process the bid
                this.processBid(bid);

            }
            else if(this.players[this.playerInTurn].type === 'human') {

                this.humanPlayers[this.players[this.playerInTurn].id].emit('provide_bid_requested');

                // Inform other human players & spectators of the waiting for this human player so they can may be display a progress indicator
                this.broadcastEvent('waiting_for_player', this.playerInTurn, [this.playerInTurn]);

            }

        }
        else if(this.phase === 'playing') {

            // Get the list of table cards and the list of valid cards to play
            var tableCards = _.map(this.ongoingPlays, function(play) { return play.card; });
            var validCardsToPlay = gameUtils.getValidCardsToPlay(this.hands[this.players[this.playerInTurn].id], tableCards, this.triunfo);



            if (this.plays.length % 4 === 0) {

                logUtils.log('------------------------------------------------------------------', 4);
                logUtils.log('------------------------------------------------------------------');
                logUtils.log('ROUND ' + (this.wins.length + 1));
                logUtils.log('------------------------------------------------------------------');
                logUtils.log('------------------------------------------------------------------');
            }

            logUtils.log('------------------------------------------------------------------', 2);
            logUtils.log('PLAY ' + ((this.plays.length % 4) + 1) + ': ' + this.players[this.playerInTurn].username);
            logUtils.log('------------------------------------------------------------------');              
            


            if(this.players[this.playerInTurn].type === 'ai') {

                var aiPlayerInTurn = this.virtualPlayers[this.players[this.playerInTurn].id];

                // Ask the AI to play a card. TODO: make this function async and call "processPlay" on return of async operation to improve performance
                var play = aiPlayerInTurn.performPlay(validCardsToPlay);

                // Process the play
                this.processPlay(play);

            }
            else if(this.players[this.playerInTurn].type === 'human') {                

                // Ask the human player to play a card
                this.humanPlayers[this.players[this.playerInTurn].id].emit('perform_play_requested', validCardsToPlay);

                // Inform other human players & spectators of the waiting for this human player so they can may be display a progress indicator
                this.broadcastEvent('waiting_for_player', this.playerInTurn, [this.playerInTurn]);

            }

        }

    }


    this.onHumanPlayerSubmittedBid = function(bid, callback) {

        // TODO: add server side validation, return a successful response for now
        callback({status: 'OK'});

        // Process the bid
        this.processBid(bid);

    }


    this.onHumanPlayerChoseTriunfo = function(triunfo, callback) {

        // TODO: add server side validation, return a successful response for now
        callback({status: 'OK'});

        // Set the triunfo color
        this.triunfo = triunfo;

        // Inform everyone of the triunfo selection except the bid winner
        this.broadcastEvent('player_chose_triunfo', triunfo);

        // Begin the next turn immediately
        this.beginNextTurn(this.playerInTurn);

    }


    this.onHumanPlayerPerformedSong = function(song, callback) {

        // TODO: add server side validation, return a successful response for now
        callback({status: 'OK'});


        if(song !== null) {

            // Update the singing flag
            this.hasSongOccuredInRound = true;

            // Set the round of the song then add it
            song.round = this.wins.length;
            this.songs.push(song);

            // Inform everyone about the song
            logUtils.log(this.players[song.player].username + ' sang ' + song.amount + ' in ' + song.color);
            this.broadcastEvent('player_performed_song', song);

            // Continue play
            this.beginNextTurn(this.playerInTurn);

        }
        else {

            // The human player chose not to sing. See if further singing could happen
            this.handleSinging();

        }

    }


    this.onHumanPlayerPerformedPlay = function(play, callback) {

        // TODO: add server side validation, return a successful response for now
        callback({status: 'OK'});

        // Log the played card
        logUtils.log('Player played: ' + JSON.stringify(play.card));

        // Process the play
        this.processPlay(play);

    }


    this.processBid = function(bid) {

        // Update the bidding info
        this.updateBiddingInfo(bid);
        
        // Inform everyone of the player bid
        this.broadcastEvent('player_provided_bid', bid);


        if(this.hasBiddingEnded()) {
            this.wrapUpBidding();
        }
        else {
            this.beginNextTurn(this.playerInTurn);
        }

    }


    this.processPlay = function(play) {

        // Remove the card from the player's hand
        this.removeCard(play.player, play.card);

        // Add the play to the list and to the ongoing plays list
        this.plays.push(play);
        this.ongoingPlays.push(play);

        // Inform everyone about the play
        this.broadcastEvent('player_performed_play', play);

        // Check to see if this round has ended or not and schedule the next turn
        if(this.hasRoundEnded()) {

            // Wrap up round and mark the winner of the round
            this.wrapUpRound();

            // If the game has ended, wrap up, otherwise, start next round
            if(this.hasPlayEnded()) {

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


    this.handleSinging = function() {

        // Get the last round winner and his teammate
        var last_round_winner = this.wins[this.wins.length - 1].player;
        var last_round_winner_teammate = (last_round_winner + 2) % 4;

        // If the last round winner isn't from the buying team, no singing is even possible
        if(last_round_winner !== this.buyer && last_round_winner !== (this.buyer + 2) % 4) {

            // No singing possible so just continue play
            this.beginNextTurn(this.playerInTurn);

        }
        else {

            // If a song has already been made, we're done
            if(this.hasSongOccuredInRound) {

                // No singing possible so just continue play
                this.beginNextTurn(this.playerInTurn);

            }
            else {

                // If 2 attempts have already been carried out (by buyer & teammate), no further singing allowed so just continue play
                if(this.singingAttemptsInRound >= 2) {

                    // No singing possible so just continue play
                    this.beginNextTurn(this.playerInTurn);

                }
                else {

                    // Determine which player to offer the possibility to sing to. We start by the winner of the round then his teammate
                    var singing_player = this.singingAttemptsInRound === 0 ? last_round_winner : last_round_winner_teammate;
                    this.singingAttemptsInRound++;


                    var validColorsToSing = this.getPossibleSingingColors(singing_player);
                    if(validColorsToSing.length > 0) {

                        if(this.players[singing_player].type === 'ai') {

                            // Give the AI a chance to sing and inform everyone if it does
                            var aiPlayerToSing = this.virtualPlayers[this.players[singing_player].id];

                            var song = aiPlayerToSing.performSong(validColorsToSing);
                            if(song !== null) {

                                // Update the singing flag
                                this.hasSongOccuredInRound = true;

                                // Set the round of the song then add it
                                song.round = this.wins.length;
                                this.songs.push(song);

                                // Inform everyone about the song
                                //console.log(this.players[singing_player].username + ' sang ' + song.amount + ' in ' + song.color);
                                this.broadcastEvent('player_performed_song', song);

                                // Continue play
                                this.beginNextTurn(this.playerInTurn);

                            }
                            else {

                                // The AI chose not to sing, see if further songs are possible
                                this.handleSinging();

                            }

                        }
                        else if(this.players[singing_player].type === 'human') {

                            // Ask the human player to sing a song
                            this.humanPlayers[this.players[singing_player].id].emit('perform_song_requested', validColorsToSing);

                            // Inform other human players & spectators of the waiting for this human player so they can may be display a progress indicator
                            this.broadcastEvent('waiting_for_player', singing_player, [singing_player]);

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


    this.broadcastEvent = function(eventName, data, excludedPlayerIds) {

        // Inform players
        for(var i = 0; i < this.players.length; i++) {

            // If the current player is excluded, skip him
            if(typeof excludedPlayerIds != "undefined" && excludedPlayerIds != null && excludedPlayerIds.length > 0) {
                if(excludedPlayerIds.includes(this.players[i].id)) {
                    continue;
                }
            }
            
            // Inform the player differently if it's an AI or a human
            if(this.players[i].type === 'ai') {
                switch(eventName) {
                    case 'player_provided_bid':
                        this.virtualPlayers[this.players[i].id].registerBid(data);
                        break;

                    case 'player_won_bid':
                        this.virtualPlayers[this.players[i].id].registerWinningBid(data);
                        break;

                    case 'player_chose_triunfo':
                        this.virtualPlayers[this.players[i].id].registerTriunfoColor(data);
                        break;

                    case 'player_performed_song':
                        this.virtualPlayers[this.players[i].id].registerSong(data);
                        break;

                    case 'player_performed_play':
                        this.virtualPlayers[this.players[i].id].registerPlay(data);
                        break;

                    case 'player_won_table':
                        this.virtualPlayers[this.players[i].id].registerWin(data);
                        break;

                }
            }
            else if(this.players[i].type === 'human') {

                this.humanPlayers[this.players[i].id].emit(eventName, data);

            }
            
        }

        // Inform spectators
        for(var i = 0; i < this.humanSpectators.length; i++) {

            this.humanSpectators[i].socket.emit(eventName, data);

        }

    }


    this.hasBiddingEnded = function() {
        return this.passedPlayers.length >= 3 && this.bids.length >= 4;
    }


    this.wrapUpBidding = function() {

        // Get the highest bid amount
        if(this.maxBid.amount > 0) {


            this.phase = 'playing';
            this.buyer = this.maxBid.player;


            // Get the player who won the bid
            var winningPlayer = this.players[this.buyer];

            // Inform everyone of who won the bid
            logUtils.log(this.players[this.maxBid.player].username + ' won the bid with: ' + this.maxBid.amount);
            this.broadcastEvent('player_won_bid', this.maxBid);


            // Ask the winning bid player to choose the triunfo
            if(winningPlayer.type === 'ai') {

                // Ask the AI to choose the triunfo color
                this.triunfo = this.virtualPlayers[winningPlayer.id].chooseTriunfo();

                // Inform everyone of the chosen triunfo
                logUtils.log(this.players[this.maxBid.player].username + ' chose ' + this.triunfo + ' as triunfo');
                this.broadcastEvent('player_chose_triunfo', this.triunfo);

                // Begin the next turn immediately
                this.beginNextTurn(this.playerInTurn);

            }
            else if(winningPlayer.type === 'human') {

                this.humanPlayers[winningPlayer.id].emit('choose_triunfo_requested');

            }

        }
        else {

            // Everyone passed so reset the game
            logUtils.log('Everyone passed. Game reset.');
            this.resetGame(false);

        }

    }


    this.hasRoundEnded = function() {
        return this.ongoingPlays.length == 4;
    }


    this.wrapUpRound = function() {

        // Determine the winner of the round
        var winningPlay = this.ongoingPlays[0];
        for(var i = 1; i < 4; i++) {
            if(gameUtils.card1IsStrongerThanCard2(this.ongoingPlays[i].card, winningPlay.card, false, this.triunfo)) {
                winningPlay = this.ongoingPlays[i];
            }
        }

        // Create and add a new win
        var win = {
            player: winningPlay.player,
            cards: _.map(this.ongoingPlays, function(play) { return play.card; }),
            value: _.reduce(this.ongoingPlays, function(sum, play) { return sum + gameUtils.getCardValue(play.card.n); }, 0)
        }
        this.wins.push(win);

        // Clear the ongoing plays
        this.ongoingPlays = [];

        // Inform everyone of the win
        logUtils.log(this.players[win.player].username + ' won round ' + this.wins.length);
        this.broadcastEvent('player_won_table', win);

        // Reset the singing variables for the round
        this.hasSongOccuredInRound = false;
        this.singingAttemptsInRound = 0;

    }


    this.getPossibleSingingColors = function(player) {

        // Make sure the current player belongs to the buying team
        if(player !== this.buyer && player !== (this.buyer + 2) % 4) {
            return [];
        }

        // Make sure that this isn't the first round
        if(this.wins.length <= 0) {
            return [];
        }

        // Make sure that the player belongs to the team that won the last round
        var lastWin = this.wins[this.wins.length - 1];
        if(player !== lastWin.player && player !== (lastWin.player + 2) % 4) {
            return [];
        }

        // Make sure that the winning bid was superior or equal 90, otherwise no singing is allowed
        if(this.maxBid.amount < 90) {
            return [];
        }

        // Get the songs of the player's team
        var sang_colors = _.chain(this.songs)
                                .filter(function(song) { return song.player === player || song.player === (player + 2) % 4; })
                                .map(function(song) { return song.color})
                                .value();

        // A winning bid of 90 only lets you sing once for 20 points
        if(this.maxBid.amount === 90) {
            if(sang_colors.length > 0) {
                return [];
            }
            else {
                // Get possible singing colors excluding triunfo
                return gameUtils.getValidSingingColors(this.hands[this.players[player].id], [this.triunfo]);
            }
        }

        // A winning bid of 100 only lets you sing one time in triunfo or 2 times in other colors
        if(this.maxBid.amount === 100) {
            if(sang_colors.length >= 2) {
                return [];
            }
            else if(sang_colors.length === 1) {
                if(sang_colors.includes(this.triunfo)) {
                    return [];
                }
                else {
                    // Get possible singing colors that are not triunfo and not previously sang before
                    return gameUtils.getValidSingingColors(this.hands[this.players[player].id], sang_colors.concat(this.triunfo));
                }
            }
            else {
                // Get all possible singing colors since there are no previous songs
                return gameUtils.getValidSingingColors(this.hands[this.players[player].id], []);
            }
        }


        // no limitations if we got here so get all singing colors that were not previously sang before
        return gameUtils.getValidSingingColors(this.hands[this.players[player].id], sang_colors);

    }


    this.removeCard = function(player, cardToRemove) {

        var cardIndex = _.findIndex(this.hands[this.players[player].id], function(card) { return card.n === cardToRemove.n && card.c === cardToRemove.c; });
        if(cardIndex >= 0) {
            this.hands[this.players[player].id].splice(cardIndex, 1);
        }
        else {
            logUtils.log('Could not delete the card ' + cardToRemove.n + cardToRemove.c + ' from ' + this.players[player].username + ' hand because s/he does not own it!');
            logUtils.log(this.hands[this.players[player].id]);
        }

    }


    this.hasPlayEnded = function() {
        return this.plays.length >= 40;
    }


    this.wrapUpGame = function() {

        this.endDate = new Date();
        this.state = 'closed';
        this.phase = 'ending';


        // Create the results object to be sent
        var results = {
            game: {
                teamAScore: 0,
                teamBScore: 0,
                actualTeamAScore: 0,
                actualTeamBScore: 0
            },
            marathon: this.marathon
        };


        // Count wins
        for(var i = 0; i < this.wins.length; i++) {
            if(this.wins[i].player % 2 === 0) {
                this.results.teamAPoints += this.wins[i].value;
            }
            else {
                this.results.teamBPoints += this.wins[i].value;
            }
        }

        // Count songs
        for(var i = 0; i < this.songs.length; i++) {
            if(this.songs[i].player % 2 === 0) {
                this.results.teamAPoints += this.songs[i].amount;
            }
            else {
                this.results.teamBPoints += this.songs[i].amount;
            }
        }

        // Count the last round bonus
        if(this.wins[this.wins.length - 1].player % 2 === 0) {
            this.results.teamAPoints += 10;
        }
        else {
            this.results.teamBPoints += 10;
        }


        // Now calculate the actual scores based on how the buying team fared against its bidding
        if(this.buyer % 2 === 0) {

            // Team A was the buyer, did it win?
            if(this.results.teamAPoints >= this.maxBid.amount) {

                // Team A won
                this.results.teamAScore = this.results.teamAPoints;
                this.results.teamBScore = 0;

            }
            else {

                // Team A lost the bid
                this.results.teamAScore = 0;
                this.results.teamBScore = this.maxBid.amount;

            }

        }
        else {

            // Team B was the buyer, did it win?
            if(this.results.teamBPoints >= this.maxBid.amount) {

                // Team B won
                this.results.teamBScore = this.results.teamBPoints;
                this.results.teamAScore = 0;

            }
            else {

                // Team B lost the bid
                this.results.teamBScore = 0;
                this.results.teamAScore = this.maxBid.amount;

            }

        }


        // Update cumulative scores
        this.marathonScore.teamAScore += this.results.teamAScore;
        this.marathonScore.teamBScore += this.results.teamBScore;


        // Update the deck so it may be reused
        this.deck = [];
        for(var i = 0; i < this.wins.length; i++) {
            this.deck = this.deck.concat(this.wins[i].cards);
        }


        // Display results to the console
        logUtils.log('Game ended. Team A: ' + this.results.teamAPoints + ' - Team B: ' + this.results.teamBPoints);


        // Persist game if required
        if (this.gameConfig.persistence.enabled) {
            var self = this;
            dbManager.connect(function () {
                dbManager.saveGame(self.getPersistenceData(), function () {

                    // Inform everyone that the game has ended
                    self.broadcastEvent('game_ended', {
                        game: self.results,
                        marathon: self.marathonScore
                    });

                    // Disconnect from the db
                    dbManager.disconnect();

                });
            });
        }
        else {
            this.broadcastEvent('game_ended', {
                game: this.results,
                marathon: this.marathonScore
            });
        }

    }


    this.terminateGame = function() {        

        // Inform everyone of the termination
        this.broadcastEvent('game_terminated');

        
        // Disconnect from all game specific socket events
        for(var id in this.humanPlayers) {
            //this.humanPlayers[id].removeAllListeners();
            this.humanPlayers[id].removeAllListeners('start_game_requested');
            this.humanPlayers[id].removeAllListeners('follow_up_game_requested');
            this.humanPlayers[id].removeAllListeners('terminate_game_requested');
            this.humanPlayers[id].removeAllListeners('bid_submitted');
            this.humanPlayers[id].removeAllListeners('triunfo_chosen');
            this.humanPlayers[id].removeAllListeners('song_performed');
            this.humanPlayers[id].removeAllListeners('play_performed');
            this.humanPlayers[id].removeAllListeners('disconnect');
        }


        // Clean up data
        this.state = '';
        this.phase = '';
        this.triunfo = '';
        this.maxBid = null;    
        this.bids = null;
        this.passedPlayers = null;
        this.hands = null;
        this.plays = null;
        this.ongoingPlays = null;
        this.wins = null;
        this.songs = null;
        this.humanPlayers = null;
        this.virtualPlayers = null;
        this.players = null;


        // Terminate the game and remove it from the active list
        this.gameManager.terminateGame(this);

    }


    this.shuffleDeck = function () {
        if (this.gameConfig.shuffling.mode === 'chunk') {

            // Divide the deck into chunks then shuffle the parts, not the cards
            var chunks = [];
            var start = 0;

            while(start < 40) {

                var desiredChunkSize = gameUtils.getRandomIntBetween(this.gameConfig.shuffling.minChunkSize, this.gameConfig.shuffling.maxChunkSize);
                var actualChunkSize = Math.min(desiredChunkSize, 40 - start);
                //logUtils.log('Desired chunk size: ' + desiredChunkSize + ' - Actual chunk size: ' + actualChunkSize);

                var chunk = this.deck.slice(start, start + actualChunkSize);                
                //logUtils.log(chunk);

                chunks.push(chunk);
                start += actualChunkSize;
            }

            chunks = _.shuffle(chunks);
            //logUtils.log(chunks);

            this.deck = [];
            for(var i = 0; i < chunks.length; i++) {
                this.deck = this.deck.concat(chunks[i]);
            }

        }
        else {
            this.deck = _.shuffle(this.deck);
        }
    }


    this.resetGame = function(isFollowUpGame) {

        // A game can be reset for 2 reasons: unsuccessful bidding or reuse as the next game in the marathon (instead of creating a new instance)

        // Reset uuid
        if(isFollowUpGame) {
            var oldUuid = this.uuid;
            this.uuid = uuidV4();

            this.gameManager.updateGameId(this, oldUuid);
        }


        // Reset data
        this.keyword = isFollowUpGame ? randomWords() : this.keyword;
        this.startDate = new Date();
        this.state = 'ongoing';
        this.phase = 'bidding';
        this.dealer = isFollowUpGame ? (this.dealer + 1) % 4 : Math.floor(Math.random() * 4);
        this.buyer = -1;
        this.triunfo = '';
        this.playerInTurn = -1;
        this.maxBid = null;    
        this.bids = [];
        this.passedPlayers = [];
        this.hands = {};
        this.plays = [];
        this.ongoingPlays = [];
        this.wins = [];
        this.songs = [];

        this.results.teamAScore = 0;
        this.results.teamBScore = 0;
        this.results.teamAPoints = 0;
        this.results.teamBPoints = 0;

        this.marathonOrder = isFollowUpGame ? this.marathonOrder + 1 : 1;
        this.resetCount = isFollowUpGame ? 0 : this.resetCount + 1;


        // Reshuffle the deck
        this.shuffleDeck();


        // Reset virtual players
        for(var id in this.virtualPlayers) {
            this.virtualPlayers[id].reset(isFollowUpGame);
        }


        // Distribute cards just as they are distributed in the real world starting with the player at the right of the dealer
        this.hands[this.players[0].id] = [];
        this.hands[this.players[1].id] = [];
        this.hands[this.players[2].id] = [];
        this.hands[this.players[3].id] = [];

        for(var i = 0; i < this.deck.length; i = i + 5) {
            var playerToServe = (this.dealer + (i / 5) + 1) % 4;
            for(var j = i; j < i + 5; j++) {
                this.hands[this.players[playerToServe].id].push(this.deck[j]);
            }
        }


        // Sort all hands by color then value according to the rules of Tijari
        for(var i = 0; i < this.players.length; i++) {
            this.hands[this.players[i].id] = this.sortHand(this.hands[this.players[i].id]);
        }


        // Update the deck state (so it may persist as it is to reduce unfruitful biddings)
        this.deck = [].concat(this.hands[this.players[0].id], this.hands[this.players[1].id], this.hands[this.players[2].id], this.hands[this.players[3].id]);


        // Redistribute cards to players and inform them of game start
        for(var i = 0; i < this.players.length; i++) {

            // Share the hands of AI while the game is in beta
            var teammateHand = this.players[(i + 2) % 4].type === 'ai' ? this.hands[this.players[(i + 2) % 4].id] : null;
            var rightOppHand = this.players[(i + 1) % 4].type === 'ai' ? this.hands[this.players[(i + 1) % 4].id] : null;
            var leftOppHand = this.players[(i + 3) % 4].type === 'ai' ? this.hands[this.players[(i + 3) % 4].id] : null;

            // Inform players of the starting of the game
            if(this.players[i].type === 'human') {
                this.humanPlayers[this.players[i].id].emit('started_game', {
                    index: i,
                    dealer: this.dealer,
                    gameId: this.uuid,
                    keyword: this.keyword,
                    marathonId: this.marathonId,
                    marathonOrder: this.marathonOrder,
                    marathonScore: this.marathonScore,
                    players: this.players,
                    hand: this.hands[this.players[i].id],
                    bids:[],
                    max_bid: this.maxBid,
                    triunfo: '',
                    table: [],
                    plays: [],
                    wins: [],
                    showAiCards: config.game.ai.revealHand,
                    teammateHand: config.game.ai.revealHand ? teammateHand : null,
                    rightOppHand: config.game.ai.revealHand ? rightOppHand: null,
                    leftOppHand: config.game.ai.revealHand ? leftOppHand : null
                });
            }
            else if(this.players[i].type === 'ai') {
                this.virtualPlayers[this.players[i].id].startGame({
                    index: i,
                    players: this.players,
                    hand: this.hands[this.players[i].id],
                    dealer: this.dealer
                });
            }
        }
        

        // Inform spectators that the game is starting
        for(var i = 0; i < this.humanSpectators.length; i++) {
            this.humanSpectators[i].socket.emit('started_game', {
                dealer: this.dealer,
                players: this.players,
                marathon: this.marathon,
                hands: this.hands,
                bids:[],
                max_bid: this.maxBid,
                triunfo: '',
                plays: [],
                wins: []
            });
        }


        // Start the first turn
        this.beginNextTurn(-1);

    }


    this.playerDisconnected = function(playerInfo) {

        logUtils.log(playerInfo.username + ' disconnected');


        // Inform other human players that the player has disconnected and get ready to cancel the game
        this.broadcastEvent('player_disconnected', playerInfo, [playerInfo.id]);


        // Disconnect from all game specific socket events
        for(var id in this.humanPlayers) {

            if(id === playerInfo.id) {
                this.humanPlayers[id].removeAllListeners();
            }
            else {
                this.humanPlayers[id].removeAllListeners('start_game_requested');
                this.humanPlayers[id].removeAllListeners('follow_up_game_requested');
                this.humanPlayers[id].removeAllListeners('terminate_game_requested');
                this.humanPlayers[id].removeAllListeners('bid_submitted');
                this.humanPlayers[id].removeAllListeners('triunfo_chosen');
                this.humanPlayers[id].removeAllListeners('song_performed');
                this.humanPlayers[id].removeAllListeners('play_performed');
                this.humanPlayers[id].removeAllListeners('disconnect');
            }

        }


        // Clean up data
        this.state = '';
        this.phase = '';
        this.triunfo = '';
        this.maxBid = null;    
        this.bids = null;
        this.passedPlayers = null;
        this.hands = null;
        this.plays = null;
        this.ongoingPlays = null;
        this.wins = null;
        this.songs = null;
        this.humanPlayers = null;
        this.virtualPlayers = null;
        this.players = null;


        // Terminate the game and remove it from the active list
        this.gameManager.terminateGame(this);

    }


    this.simulateGame = function (gameStartupData) {

        // Simulation starts with the playing phase
        this.state = 'ongoing';
        this.phase = 'playing';

        // Create the ai players using the previously set game config
        for (var i = 0; i < 4; i++) {
            var aiPlayerConfig = this.gameConfig.ai.players[i];
            aiPlayer = new AiPlayer(aiPlayerConfig);

            this.players.push(aiPlayer.getPlayerInfo());
            this.virtualPlayers[aiPlayer.getId()] = aiPlayer;
        }

        // Set up several startup parameters for the game to be simulated
        this.dealer = gameStartupData.dealer;
        this.buyer = gameStartupData.buyer;
        this.triunfo = gameStartupData.triunfo;
        this.playerInTurn = gameStartupData.playerInTurn;
        this.maxBid = gameStartupData.maxBid;
        this.plays = gameStartupData.plays;
        this.ongoingPlays = gameStartupData.ongoingPlays;
        this.wins = gameStartupData.wins;
        this.songs = gameStartupData.songs;

        // These parameters can be ignored for now
        //this.bids = [];
        //this.passedPlayers = [];
    
        // Distribute the hands of the players
        this.hands[this.players[0].id] = gameStartupData.hands[0];
        this.hands[this.players[1].id] = gameStartupData.hands[1];
        this.hands[this.players[2].id] = gameStartupData.hands[2];
        this.hands[this.players[3].id] = gameStartupData.hands[3];

        // Give all ai players their hands and indexes and inform them of game start
        for (var i = 0; i < this.players.length; i++) {
            this.virtualPlayers[this.players[i].id].startGame({
                index: i,
                players: this.players,
                hand: this.hands[this.players[i].id]
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


        // Continue the game now
        this.beginNextTurn(this.playerInTurn);
        
    }

}





Game.prototype.getId = function() {
    return this.uuid;
}


Game.prototype.getMarathonId = function() {
    return this.marathonId;
}


Game.prototype.getMarathonOrder = function() {
    return this.marathonOrder;
}


Game.prototype.getMarathonScore = function() {
    return { teamAScore: this.marathonScore.teamAScore, teamBScore: this.marathonScore.teamBScore };
}


Game.prototype.getDealer = function() {
    return this.dealer;
}


Game.prototype.canPlayerJoin = function() {
    return this.state === 'matchmaking' && this.players.length < 4;
}


Game.prototype.addPlayer = function(profile, socket) {
    
    var self = this;
    var playerInfo = {
        id: profile.id,
        username: profile.username,
        type: 'human'
    };


    // Add the player to the list of the players and save the socket
    this.players.push(playerInfo);
    this.humanPlayers[playerInfo.id] = socket;


    // If this is the first player to join, aka the host, listen for the start game event on that socket
    if(this.players.length === 1) {        
        
        socket.on('start_game_requested', function() {
            self.startGame();
        });

        socket.on('follow_up_game_requested', function() {
            self.resetGame(true);
        });

        socket.on('terminate_game_requested', function() {
            self.terminateGame();
        });

    }


    // Subscribe to the socket disconnection event
    socket.on('disconnect', function() {
        self.playerDisconnected(playerInfo);
    });


    // Inform the player that he has joined a game
    socket.emit('joined_game', this.players);

    // Inform other players (if any) that a new player has joined their game
    for(var id in this.humanPlayers) {
        if(id !== playerInfo.id) {
            this.humanPlayers[id].emit('player_joined_game', this.players);
        }
    }

}


Game.prototype.addSpectator = function(profile, socket) {

    var spectatorInfo = {
        id: profile.id,
        username: profile.username,
        socket: socket
    };

    // Add the spectator to the list
    this.humanSpectators.push(spectatorInfo);

    // Inform the spectator that s/he is watching the game
    socket.emit('watching_game', this.players);

    // Inform the human players that they have a new spectator
    for(var id in this.humanPlayers) {
        if(id !== playerInfo.id) {
            this.humanPlayers[id].emit('spectator_watching_game', profile);
        }
    }

}


Game.prototype.start = function() {
    this.startGame();
}


Game.prototype.reset = function (followUpGame) {
    this.resetGame(followUpGame);
}


Game.prototype.simulate = function (startupData) {
    this.simulateGame(startupData);
    return { teamAPoints: this.results.teamAPoints, teamBPoints: this.results.teamBPoints };
}


Game.prototype.getPersistenceData = function() {
    
    // Reconstruct players hands from plays OR NOT!
    var startupHands = [[], [], [], []];
    for(var i = 0; i < this.plays.length; i++) {
        startupHands[this.plays[i].player].push(this.plays[i].card);
    }

    // Prepare stats facilitator fields
    var winningBidPlayerType = this.players[this.maxBid.player].type;
    var buyingTeamWonBid = (this.maxBid.player % 2 === 0 && this.results.teamAPoints >= this.maxBid.amount) || (this.maxBid.player % 2 === 1 && this.results.teamBPoints >= this.maxBid.amount);
    var bidToPointsDifference = this.maxBid.player % 2 === 0 ? this.maxBid.amount - this.results.teamAPoints : this.maxBid.amount - this.results.teamBPoints;
    var playerTypes = _.chain(this.players).pluck('type').intersection(['ai', 'human']).value();

    // Return data for persistence
    return {
        id: this.uuid,
        keyword: this.keyword,
        creationDate: this.creationDate,
        startDate: this.startDate,
        endDate: this.endDate,
        marathon: {
            id: this.marathonId,
            order: this.marathonOrder,
            score: this.marathonScore
        },
        players: this.players,
        hands: startupHands,
        dealer: this.dealer,
        buyer: this.buyer,
        winningBid: this.maxBid,
        triunfo: this.triunfo,
        bids: this.bids,
        plays: this.plays,
        songs: this.songs,
        wins: this.wins,
        results: this.results,
        info: {
            winningBidPlayerType: winningBidPlayerType,
            buyingTeamWonBid: buyingTeamWonBid,
            bidToPointsDifference: bidToPointsDifference,
            resetCountBeforeStart: this.resetCount,
            deckShufflingMode: this.gameConfig.shuffling.mode,
            gameVersusType: playerTypes.length === 2 ? 'mixed' : playerTypes[0]
        },
        review: {
            bidding: {
                comments: []
            },
            triunfo: {
                comments: []
            },
            singing: {
                comments: []
            },
            playing: {
                comments: []
            }
        }
    };
}


Game.prototype.getResultStats = function () {

    var winningTeam = this.results.teamAScore > this.results.teamBScore ? 'A' : 'B';
    var biddingTeam = this.maxBid.player % 2 === 0 ? 'A' : 'B';
    //var buyingTeamWonBid = (this.maxBid.player % 2 === 0 && this.results.teamAPoints >= this.maxBid.amount) || (this.maxBid.player % 2 === 1 && this.results.teamBPoints >= this.maxBid.amount);
    var pointsToBidDifference = this.maxBid.player % 2 === 0 ? this.results.teamAPoints - this.maxBid.amount : this.results.teamBPoints - this.maxBid.amount;

    return {
        winningTeam: winningTeam,
        teamAPoints: this.results.teamAPoints,
        teamAScore: this.results.teamAScore,
        teamBPoints: this.results.teamBPoints,
        teamBScore: this.results.teamBScore,
        biddingTeam: biddingTeam,
        winningBidAmount: this.maxBid.amount,
        buyingTeamWonBid: winningTeam === biddingTeam,
        pointsToBidDifference: pointsToBidDifference
    }
}


Game.prototype.getHandBidResultsData = function () {

    //var winningTeam = this.results.teamAScore > this.results.teamBScore ? 'A' : 'B';
    //var biddingTeam = this.maxBid.player % 2 === 0 ? 'A' : 'B';

    // Reconstruct bidding player hand, sort it and group it
    var biddingPlayerFlatHand = [];
    var biddingPlayerGroupedHand = null;
    for (var i = 0; i < this.plays.length; i++) {
        if (this.plays[i].player === this.maxBid.player) {
            biddingPlayerFlatHand.push(this.plays[i].card);
        }
    }
    biddingPlayerFlatHand = this.sortHand(biddingPlayerFlatHand);
    biddingPlayerGroupedHand = gameUtils.groupHandByColorAndSimplify(biddingPlayerFlatHand);

    // Calculate indicators
    var colorCount = Object.keys(biddingPlayerGroupedHand).length;
    var triunfoCardCount = _.has(biddingPlayerGroupedHand, this.triunfo) ? biddingPlayerGroupedHand[this.triunfo].length : 0;


    var cardCountPerColor = _.chain(Object.keys(biddingPlayerGroupedHand))
        .map(function (color) { return biddingPlayerGroupedHand[color].length; })
        .value();

    var maxCardCountPerColor = _.max(cardCountPerColor);
    var minCardCountPerColor = _.min(cardCountPerColor);


    var totalCardsValue = _.reduce(biddingPlayerFlatHand, function (sum, card) { return sum + gameUtils.getCardValue(card.n); }, 0);

    var cardValuesPerColor = _.chain(Object.keys(biddingPlayerGroupedHand))
        .map(function (color) { return _.reduce(biddingPlayerGroupedHand[color], function (sum, cardNumber) { return sum + gameUtils.getCardValue(cardNumber); }, 0); })
        .value();

    var maxCardValuesPerColor = _.max(cardValuesPerColor);
    var minCardValuesPerColor = _.min(cardValuesPerColor);
    var avgCardValuesPerColor = parseFloat(totalCardsValue) / colorCount;


    var reyCaballoCouples = _.reduce(Object.keys(biddingPlayerGroupedHand), function (sum, color) {
        return _.intersection(biddingPlayerGroupedHand[color], [12, 11]).length === 2 ? sum + 1 : sum;
    }, 0);

    
    var points = this.maxBid.player % 2 === 0 ? this.results.teamAPoints : this.results.teamBPoints;
    var pointsToBid = points - this.maxBid.amount;


    return {
        hand: {
            groupedCards: biddingPlayerGroupedHand,
            triunfo: this.triunfo,
            colorCount: colorCount,            
            triunfoCardCount: triunfoCardCount,
            maxCardCountPerColor: maxCardCountPerColor,
            minCardCountPerColor: minCardCountPerColor,
            totalCardsValue: totalCardsValue,
            maxCardValuesPerColor: maxCardValuesPerColor,
            avgCardValuesPerColor: avgCardValuesPerColor,
            minCardValuesPerColor: minCardValuesPerColor,
            reyCaballoCouples: reyCaballoCouples            
        },        
        bid: this.maxBid.amount,
        points: points,
        pointsToBid: pointsToBid
    }
}


module.exports = Game;
