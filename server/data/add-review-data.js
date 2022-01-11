var mongoClient = require('mongodb').MongoClient;
var tijariGameDbUrl = 'mongodb://app:TiJaRi2017@ds135830.mlab.com:35830/tijari_game_db';


mongoClient.connect(tijariGameDbUrl, function (err, db) {
    if (err === null) {

        var dbo = db.db("tijari_game_db");
        dbo.collection("games").update(
            { },
            {
                $set: {
                    "review": {
                        "bidding": {
                            "comments": []
                        },
                        "triunfo": {
                            "comments": []
                        },
                        "singing": {
                            "comments": []
                        },
                        "playing": {
                            "comments": []
                        }
                    }
                }
            },
            { multi: true },
            function (err, res) {
                if (err) throw err;
                console.log("Documents updated");
                db.close();
            });
        
    }
    else {
        console.log(err);
    }
});