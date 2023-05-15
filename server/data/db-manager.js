var bcrypt = require('bcrypt');
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var tijariGameDbUrl = 'mongodb://localhost:27017/tijari_game_db';
var tijariGameDb = null;


function connect(callback) {

	mongoClient.connect(tijariGameDbUrl, function(err, db) {	  
		if(err === null) {
			tijariGameDb = db;
			console.log("Connected to database");
			callback();
		}
		else {
			console.log(err);
		}
	});

}


function disconnect() {
	if(tijariGameDb !== null) {
		tijariGameDb.close();
		console.log("Disconnected from database");
	}
}


function saveGame(game, callback) {
	if(tijariGameDb !== null) {
		
		tijariGameDb.collection('games').insertOne(game, function(err, result) {
		    if(err === null) {
			    console.log("Game saved to database",game);
			    callback();
			}
			else {
				console.log(err);
			}
	  	});
	}
}


function getTotalNumberOfGames() {
	if(tijariGameDb !== null) {
		return tijariGameDb.collection('games').count();
	}
	return Promise.resolve(-1);
}


function getTotalNumberOfGamesAIWonBid() {
	if(tijariGameDb !== null) {		
		return tijariGameDb.collection('games').count({	$and: [ {"info.winningBidPlayerType": "ai"}, {"info.buyingTeamWonBid": true}] });
	}
	return Promise.resolve(-1);
}


function getTotalNumberOfGamesAILostBid() {
	if(tijariGameDb !== null) {		
		return tijariGameDb.collection('games').count({	$and: [ {"info.winningBidPlayerType": "ai"}, {"info.buyingTeamWonBid": false}] });
	}
	return Promise.resolve(-1);
}


function getDiffBetweenBidAndPointsWhenAILosesBid() {
	if(tijariGameDb !== null) {		
		return tijariGameDb.collection('games').aggregate([	
			{ $match: { $and: [ {"info.winningBidPlayerType": "ai"}, {"info.buyingTeamWonBid": false}] } },
			{ $group: { 
					_id: null, 
					max: { $max: "$info.bidToPointsDifference"},
					min: { $min: "$info.bidToPointsDifference"},
					avg: { $avg: "$info.bidToPointsDifference"}
				} 
			}
		])
		.toArray()
		.then(function (result) {
			return result[0];
		})
	}
	return Promise.resolve(-1);
}


function getDiffBetweenBidAndPointsWhenAIWonBid() {
	if(tijariGameDb !== null) {		
		return tijariGameDb.collection('games').aggregate([	
			{ $match: { $and: [ {"info.winningBidPlayerType": "ai"}, {"info.buyingTeamWonBid": true}] } },
			{ $group: { 
					_id: null, 
					max: { $max: "$info.bidToPointsDifference"},
					min: { $min: "$info.bidToPointsDifference"},
					avg: { $avg: "$info.bidToPointsDifference"}
				} 
			}
		])
		.toArray()
		.then(function (result) {
			return result[0];
		})
	}
	return Promise.resolve(-1);
}


function getWinningBidByOccurence() {
	if(tijariGameDb !== null) {		
		return tijariGameDb.collection('games').aggregate([	
			{ $group: { 
					_id: "$winningBid.amount", 
					count: { $sum: 1}
				} 
			},
			{
				$sort: { count: -1 }
			}
		])
		.toArray();
	}
	return Promise.resolve(-1);
}


function getAverageResetCountForWeakShuffling() {
	if(tijariGameDb !== null) {		
		return tijariGameDb.collection('games').aggregate([
			{ $match: { $and: [ {"info.gameVersusType": "ai"}, {"info.deckShufflingMode": "weak"}] } },
			{ $group: { 
					_id: null, 
					max: { $max: "$info.resetCountBeforeStart"},
					min: { $min: "$info.resetCountBeforeStart"},
					avg: { $avg: "$info.resetCountBeforeStart"}
				} 
			}
		])
		.toArray();
	}
	return Promise.resolve(-1);	
}


function addUser(user) {
	if(tijariGameDb !== null) {
		return tijariGameDb.collection('users').findOne({email: user.email})
			.then(function(res) {
				if(res === null) {
					return tijariGameDb.collection('users').insertOne(user)
						.then(function(res) {
							console.log('The user: ' + user.email + ' has been successfully added to the databse!');
							return true;
						});
				}
				else {
					console.log('User with email: ' + user.email + ' already exists!');
					return false;
				}
			});
	}
	return Promise.resolve(false);
}


function authenticateUser(email, password) {
	if(tijariGameDb !== null) {
		return tijariGameDb.collection('users').findOne({email: email})
			.then(function(user) {
				console.log("email===========>",user.email);
				console.log("email===========>",user.password);

				if(user === null) {
					return null;
				}
				else {
					return user;
					// return bcrypt.compare(password, user.password)
					// 	.then(function(res) {
					// 	    if(res === true) {
					// 	    	return user;
					// 	    }
					// 	    else {
					// 	    	return null;
					// 	    }
					// 	}); 
				}
			})
	}
	return Promise.resolve(null);
}


function findGamesByKeywordPart(keywordPart, maxResults) {
    if (tijariGameDb !== null) {
        if (keywordPart) {
            var query = { keyword: { $regex: keywordPart } };
            return tijariGameDb.collection('games')
                .find(query)
                .limit(maxResults)
                .toArray();
        }
        else {
            return tijariGameDb.collection('games')
                .find()
                .limit(maxResults)
                .sort({ $natural: -1 })
                .toArray();
        }        
    }
    return Promise.resolve([]);
}


function addComment(commentData) {
    if (tijariGameDb !== null) {

        var data = null;
        switch (commentData.itemType) {
            case 'bid':
                data = {
                    $push: {
                        "review.bidding.comments": {
                            authorId: commentData.authorId,
                            author: commentData.author,
                            content: commentData.content,
                            itemIndex: commentData.itemIndex,
                            date: commentData.date
                        }
                    }
                };
                break;

            case 'triunfo':
                data = {
                    $push: {
                        "review.triunfo.comments": {
                            authorId: commentData.authorId,
                            author: commentData.author,
                            content: commentData.content,
                            itemIndex: commentData.itemIndex,
                            date: commentData.date
                        }
                    }
                };
                break;

            case 'song':
                data = {
                    $push: {
                        "review.singing.comments": {
                            authorId: commentData.authorId,
                            author: commentData.author,
                            content: commentData.content,
                            itemIndex: commentData.itemIndex,
                            date: commentData.date
                        }
                    }
                };
                break;

            case 'play':
                data = {
                    $push: {
                        "review.playing.comments": {
                            authorId: commentData.authorId,
                            author: commentData.author,
                            content: commentData.content,
                            itemIndex: commentData.itemIndex,
                            date: commentData.date
                        }
                    }
                };
                break;
        }

        if (data != null) {

            var $oid = new ObjectId(commentData.gameId);
            var selector = { _id: $oid };

            return tijariGameDb.collection('games').update(selector, data);

        }        

    }
    return Promise.reject(new Error('Failure to add comment'));
}


module.exports = {
    connect: connect,
    saveGame: saveGame,
    disconnect: disconnect,
    getTotalNumberOfGames: getTotalNumberOfGames,
    getTotalNumberOfGamesAIWonBid: getTotalNumberOfGamesAIWonBid,
    getTotalNumberOfGamesAILostBid: getTotalNumberOfGamesAILostBid,
    getDiffBetweenBidAndPointsWhenAILosesBid: getDiffBetweenBidAndPointsWhenAILosesBid,
    getDiffBetweenBidAndPointsWhenAIWonBid: getDiffBetweenBidAndPointsWhenAIWonBid,
    getWinningBidByOccurence: getWinningBidByOccurence,
    getAverageResetCountForWeakShuffling: getAverageResetCountForWeakShuffling,
    findGamesByKeywordPart: findGamesByKeywordPart,
    addUser: addUser,
    authenticateUser: authenticateUser,
    addComment: addComment
};

