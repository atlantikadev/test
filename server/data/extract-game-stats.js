var dbManager = require('./server/db_manager');


dbManager.connect(function() {	

	dbManager.getTotalNumberOfGames()
		.then(function(result) {
			console.log('Total games count: ' + result);
			return dbManager.getTotalNumberOfGamesAIWonBid();			
		})
		.then(function(result) {
			console.log('Total games where the AI won its bid: ' + result);
			return dbManager.getTotalNumberOfGamesAILostBid();
		})
		.then(function(result) {
			console.log('Total games where the AI lost its bid: ' + result);
			return dbManager.getDiffBetweenBidAndPointsWhenAILosesBid();
		})
		.then(function(result) {
			console.log('Bid and score difference when AI loses bid: Max(' + result.max + ') - Min(' + result.min + ') - Avg(' + result.avg + ')');
			return dbManager.getDiffBetweenBidAndPointsWhenAIWonBid();
		})
		.then(function(result) {
			console.log('Bid and score difference when AI wins bid: Max(' + (result.max * -1) + ') - Min(' + (result.min * -1) + ') - Avg(' + (result.avg * -1) + ')');
			return dbManager.getWinningBidByOccurence();
		})
		.then(function(result) {
			console.log('Winning bid by occurence:');
			console.log(result);
			return dbManager.getAverageResetCountForWeakShuffling();
		})
		.then(function(result) {
			console.log('Average reset count for weak shuffling:');
			console.log(result);
			return null;
		})
		.then(function() {
			dbManager.disconnect();
		})
	

});