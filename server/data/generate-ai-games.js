var gameManager = require('../core/game-manager');
var dbManager = require('./db-manager');


var totalGameCount = 1000;
var savedGameCount = 0;
var saveToDb = false;


dbManager.connect(function() {	

    for (var i = 0; i < totalGameCount; i++) {

        // Create a new game then start it
        var game = gameManager.createGame();
        game.start();

        if (saveToDb) {
            // Save the game to the database
            dbManager.saveGame(game.getPersistenceData(), function () {
                savedGameCount++;
                if (savedGameCount === totalGameCount - 1) {
                    dbManager.disconnect();
                }
            });
        }
        else {
            dbManager.disconnect();
        }

    }

});