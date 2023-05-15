//var _ = require('underscore');
var Game = require('./game');
var activeGames = {};


function findGame() {
    for (var gameId in activeGames) {
        if (activeGames[gameId].canPlayerJoin()) {
            game = activeGames[gameId];
            return game;
        }
    }
    return null;
}


function createGame(gameConfig) {
    var game = new Game(this, gameConfig);
    activeGames[game.getId()] = game;
    return game;
}


function terminateGame(game) {

    // Remove the game from the list
    delete activeGames[game.getId()];

}


function updateGameId(game, oldUuid) {

    // Assign the game to a new uuid
    activeGames[game.getId()] = game;

    // Remove the old entry
    delete activeGames[oldUuid];

}


function watchGame(playerSocket) {
    
}



module.exports = {
    findGame: findGame,
    createGame: createGame,
    watchGame: watchGame,
    terminateGame: terminateGame,
    updateGameId: updateGameId
};