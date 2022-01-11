var config = {

    platform: {
        webPort: process.env.WEB_PORT || 4200,
        enableLogging: false,
        databaseURL: 'mongodb://unes:0000@cluster0-shard-00-00.7fzoc.mongodb.net:27017,cluster0-shard-00-01.7fzoc.mongodb.net:27017,cluster0-shard-00-02.7fzoc.mongodb.net:27017/tijari?ssl=true&replicaSet=atlas-2zeozh-shard-0&authSource=admin&retryWrites=true&w=majorityy'
    },   

    game: {
        matchmaking: {
            mode: 'pvp'                                     // Possible values: 'pvp' (player vs player: 2 humans players will be on opposing teams) or 'pvc' (player vs computer: 2 human players will be in the same team)
        },
        persistence: {
            enabled: true
        },
        shuffling: {
            mode: 'chunk',                                  // Possible values: 'chunk' (shuffling happens in chunks) or 'full' (shuffling happens on all cards)
            minChunkSize: 7,                                // Minimum number of cards in a chunk. Ignored if the mode is different than 'chunk'
            maxChunkSize: 10                                // Maximum number of cards in a chunk. Ignored if the mode is different than 'chunk'
        },
        ai: {
            revealHand: true,                               // Whether to reveal every AI hand to human players (for debugging purposes)
            generateActionReport: true,                     // Whether to generate the AI action report
            players: [
                {
                    username: 'Ami.ne',
                    reasoner: {
                        type: 'lv3-strat-sim', //'legacy-strat',
                        role: 'play',
                        options: {
                            simCountPerBid: 64,
                            simCountPerPlay: 48
                        }
                    }
                },
                {
                    username: 'Kar.im',
                    reasoner: {
                        type: 'lv3-strat-sim',
                        role: 'play',
                        options: {
                            simCountPerBid: 64,
                            simCountPerPlay: 48
                        }
                    }
                },
                {
                    username: 'Ah.med',
                    reasoner: {
                        type: 'lv3-strat-sim', //'legacy-strat',
                        role: 'play',
                        options: {
                            simCountPerBid: 64,
                            simCountPerPlay: 48
                        }
                    }
                },
                {
                    username: 'Hi.nd',
                    reasoner: {
                        type: 'lv3-strat-sim',
                        role: 'play',
                        options: {
                            simCountPerBid: 64,
                            simCountPerPlay: 48
                        }
                    }
                }
            ]
        }
    }
};


module.exports = config;