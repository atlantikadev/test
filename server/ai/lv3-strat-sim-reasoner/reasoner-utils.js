var _ = require('underscore');
var config = require('../../../config');
var gameUtils = require('../../core/game-utils');
var logUtils = require('../../utils/log-utils');


module.exports = {

    createInitialPessimismBasedCardDistribution: function (hand, index, pessimismLevel) {

        // Set the ai player hands
        var hands = [[], [], [], []];

        // Set other players indexes
        var teammateIndex = (index + 2) % 4;
        var rightOppIndex = (index + 1) % 4;
        var leftOppIndex = (index + 3) % 4;

        // Set the ai player hands
        hands[index] = _.clone(hand);

        // Get complementary special & filler cards
        var complementarySpecialCards = gameUtils.getComplementaryCardsByValue(hand, 2, 11, true);
        //console.log('Complementary special cards (' + complementarySpecialCards.length + ')');
        //console.log(complementarySpecialCards);
        //console.log('');

        var complementaryFillerCards = gameUtils.getComplementaryCardsByValue(hand, 0, 0, true);
        //console.log('Complementary filler cards (' + complementaryFillerCards.length + ')');
        //console.log(complementaryFillerCards);
        //console.log('');
        
        // Calculate the value of all complementary cards
        var totalValue = _.reduce(complementarySpecialCards, function (sum, card) { return sum + gameUtils.getCardValue(card.n); }, 0);
        //console.log('Total value of complementary special cards');
        //console.log(totalValue);
        //console.log('');

        // Determine the points the teammate can get based on pessimism level using linear interpolation
        // A pessimismLevel of 0 => 0.5 * totalValue
        // A pessimismLevel of 1 => 0.1 * totalValue
        // x0 = 0    x1 = 1    y0 = 0.5    y1 = 0.1
        var minTeammateValueRatio = 0.1;
        var maxTeammateValueRatio = 0.5;
        var teammateValue = totalValue * (maxTeammateValueRatio * (1 - pessimismLevel) + minTeammateValueRatio * (pessimismLevel - 0)) / (1 - 0);
        //console.log('target teammate special cards value');
        //console.log(teammateValue);
        //console.log('');

        // Decompose the teammate value into cards
        var teammateSpecialCards = this.turnValueIntoHandCards(complementarySpecialCards, teammateValue, 10);

        hands[teammateIndex] = hands[teammateIndex].concat(teammateSpecialCards);
        //console.log('Teammate special cards (' + teammateSpecialCards.length + ')');
        //console.log(teammateSpecialCards);
        //console.log('');

        // Divide the rest of the special cards on the opponents
        var opponentsSpecialCards = _.difference(complementarySpecialCards, teammateSpecialCards);
        var rightOppSpecialCardCount = opponentsSpecialCards.length / 2;
        var leftOppSpecialCardCount = opponentsSpecialCards.length - rightOppSpecialCardCount;
        //console.log('Opps special cards (' + opponentsSpecialCards.length + ') R(' + rightOppSpecialCardCount + ') L(' + leftOppSpecialCardCount + ')');
        //console.log(opponentsSpecialCards);
        //console.log('');

        hands[rightOppIndex] = _.first(opponentsSpecialCards, rightOppSpecialCardCount);
        //console.log('Right opp special cards (' + hands[rightOppIndex].length + ')');
        //console.log(hands[rightOppIndex]);
        //console.log('');

        hands[leftOppIndex] = _.last(opponentsSpecialCards, leftOppSpecialCardCount);
        //console.log('Left opp special cards (' + hands[leftOppIndex].length + ')');
        //console.log(hands[leftOppIndex]);
        //console.log('');

        // Add filler cards to complete 10 cards for each hand
        if (hands[teammateIndex].length < 10) {
            var teammateFillerCards = _.first(complementaryFillerCards, 10 - hands[teammateIndex].length);
            hands[teammateIndex] = hands[teammateIndex].concat(teammateFillerCards);
            complementaryFillerCards = _.difference(complementaryFillerCards, teammateFillerCards);
        }

        if (hands[rightOppIndex].length < 10) {
            var rightOppFillerCards = _.first(complementaryFillerCards, 10 - hands[rightOppIndex].length);
            hands[rightOppIndex] = hands[rightOppIndex].concat(rightOppFillerCards);
            complementaryFillerCards = _.difference(complementaryFillerCards, rightOppFillerCards);
        }

        if (hands[leftOppIndex].length < 10) {
            hands[leftOppIndex] = hands[leftOppIndex].concat(complementaryFillerCards);
        }

        return hands;

    },


    turnValueIntoHandCards: function (cards, value, cardCount) {

        var currentValue = 0;
        var compatibleCards = [];

        // Shuffle the cards in case they haven't already been
        cards = _.shuffle(cards);

        for (var i = 0; i < cards.length; i++) {
            var cardValue = gameUtils.getCardValue(cards[i].n);
            if (currentValue + cardValue <= value) {
                currentValue += cardValue;
                compatibleCards.push(cards[i]);
            }
        }

        if (compatibleCards.length > cardCount) {
            compatibleCards = _.first(compatibleCards, cardCount);
        }

        return compatibleCards;

    },


    createInitialBidBasedCardDistribution: function (hand, index, teammateMaxBidAmount, rightOppMaxBidAmount, leftOppMaxBidAmount, pessimismLevel) {

        // Set the ai player hands
        var hands = [[], [], [], []];

        // Set other players indexes
        var teammateIndex = (index + 2) % 4;
        var rightOppIndex = (index + 1) % 4;
        var leftOppIndex = (index + 3) % 4;

        // Set the ai player hands
        hands[index] = _.clone(hand);

        // Get complementary special & filler cards
        var complementarySpecialCards = gameUtils.getComplementaryCardsByValue(hand, 2, 11, true);
        var complementaryFillerCards = gameUtils.getComplementaryCardsByValue(hand, 0, 0, true);
        var remainingPlayersToServe = 3;


        //#region First pass: deduce special cards for all those who did bid

        if (teammateMaxBidAmount >= 0) {

            var deducedSpecialTeammateCards = this.deduceSpecialCardsFromBid(complementarySpecialCards, teammateMaxBidAmount);
            if (deducedSpecialTeammateCards.length > 0) {

                remainingPlayersToServe--;

                hands[teammateIndex] = hands[teammateIndex].concat(deducedSpecialTeammateCards);
                complementarySpecialCards = _.difference(complementarySpecialCards, deducedSpecialTeammateCards);

            }
        }

        if (rightOppMaxBidAmount >= 0) {

            var deducedSpecialRightOpponentCards = this.deduceSpecialCardsFromBid(complementarySpecialCards, rightOppMaxBidAmount);
            if (deducedSpecialRightOpponentCards.length > 0) {

                remainingPlayersToServe--;

                hands[rightOppIndex] = hands[rightOppIndex].concat(deducedSpecialRightOpponentCards);
                complementarySpecialCards = _.difference(complementarySpecialCards, deducedSpecialRightOpponentCards);

            }
        }

        if (leftOppMaxBidAmount >= 0) {

            if (remainingPlayersToServe > 1) {

                var deducedSpecialLeftOpponentCards = this.deduceSpecialCardsFromBid(complementarySpecialCards, leftOppMaxBidAmount);
                if (deducedSpecialLeftOpponentCards.length > 0) {

                    remainingPlayersToServe--;

                    hands[leftOppIndex] = hands[leftOppIndex].concat(deducedSpecialLeftOpponentCards);
                    complementarySpecialCards = _.difference(complementarySpecialCards, deducedSpecialLeftOpponentCards);

                }

            }
            else {

                remainingPlayersToServe = 0;

                hands[leftOppIndex] = hands[leftOppIndex].concat(complementarySpecialCards);
                complementarySpecialCards = [];

            }            
        }

        //#endregion

        //#region Second pass: divide what special cards remain on those who haven't bid yet

        var teammateCardsCount = complementarySpecialCards.length / remainingPlayersToServe;
        var oppsCardCount = complementarySpecialCards.length - teammateCardsCount;
        var rightOppCardCount = oppsCardCount / 2;
        var leftOppCardCount = oppsCardCount - rightOppCardCount;

        if (hands[teammateIndex].length <= 0) {

            var teammateCards = _.first(complementarySpecialCards, teammateCardsCount);

            hands[teammateIndex] = hands[teammateIndex].concat(teammateCards);
            complementarySpecialCards = _.difference(complementarySpecialCards, teammateCards);

            //remainingPlayersToServe--;

        }

        if (hands[rightOppIndex].length <= 0) {

            var rightOppCards = _.first(complementarySpecialCards, rightOppCardCount);

            hands[rightOppIndex] = hands[rightOppIndex].concat(rightOppCards);
            complementarySpecialCards = _.difference(complementarySpecialCards, rightOppCards);

            //remainingPlayersToServe--;
        }

        if (hands[leftOppIndex].length <= 0) {

            var leftOppCards = _.clone(complementarySpecialCards);

            hands[leftOppIndex] = hands[leftOppIndex].concat(leftOppCards);
            complementarySpecialCards = [];

            //remainingPlayersToServe--;
        }

        //#endregion

        //#region Third pass: add filler cards

        if (hands[teammateIndex].length < 10) {

            var teammateFillerCards = _.first(complementaryFillerCards, 10 - hands[teammateIndex].length);

            hands[teammateIndex] = hands[teammateIndex].concat(teammateFillerCards);
            complementaryFillerCards = _.difference(complementaryFillerCards, teammateFillerCards);

        }

        if (hands[rightOppIndex].length < 10) {

            var rightOppFillerCards = _.first(complementaryFillerCards, 10 - hands[rightOppIndex].length);

            hands[rightOppIndex] = hands[rightOppIndex].concat(rightOppFillerCards);
            complementaryFillerCards = _.difference(complementaryFillerCards, rightOppFillerCards);

        }

        if (hands[leftOppIndex].length < 10) {

            var leftOppFillerCards = _.first(complementaryFillerCards, 10 - hands[leftOppIndex].length);

            hands[leftOppIndex] = hands[leftOppIndex].concat(leftOppFillerCards);
            complementaryFillerCards = [];

        }

        //#endregion

        
        return hands;

    },


    deduceSpecialCardsFromBid: function (availableSpecialCards, bidAmount) {

        var deducedSpecialCards = [];

        if (bidAmount < 0) {

            // Nothing to do, an empty list will be returned

        }
        else if (bidAmount < 70) {

            // The player passed so it's safe to assume he must have at best 3 special cards with at least one Tres and no songs
            var suspectedSpecialCards = this.findMatchingOrClosestCardsByHandDescription(availableSpecialCards, {


            });

            deducedSpecialCards = deducedSpecialCards.concat(suspectedSpecialCards);

        }
        else if (maxBidAmount <= 80) {

            // A bid amount of 70 or 80 suspects an As and Tres at best with no songs

        }
        else if (maxBidAmount <= 90) {

            // A bid amount of 90 suspects an As and Tres at best with one song (20)
            
        }
        else if (maxBidAmount <= 100) {

            // A bid amount of 100 suspects an As and Tres at best with one song (40)

        }
        else if (maxBidAmount <= 120) {

            // A bid amount of 110 or 120 suspects 2 As and Tres at best with two songs (40 + 20)
            
        }
        else {



        }

        return deducedSpecialCards;

    },


    findMatchingOrClosestCardsByHandDescription: function (availableSpecialCards, handDescription) {

    },


    createMidGameAnalyticsAwareCardDistribution: function (hand, index, plays, analytics, pessimism) {

        // Set player indexes
        var teammateIndex = (index + 2) % 4;
        var rightOppIndex = (index + 1) % 4;
        var leftOppIndex = (index + 3) % 4;

        // Set the ai player hands
        var hands = [[], [], [], []];
        hands[index] = _.clone(hand);

        // Get hand complement while taking into consideration all the plays that happened
        var handComplement = gameUtils.getHandComplement(hand, plays);
        handComplement = _.shuffle(handComplement);

        // Group plays by player to be able to deduce the number of cards required per player
        var playsGroupedByPlayer = _.groupBy(plays, 'player');
        var teammateCardCount = _.has(playsGroupedByPlayer, teammateIndex) ? 10 - playsGroupedByPlayer[teammateIndex].length : 10;
        var rightOppCardCount = _.has(playsGroupedByPlayer, rightOppIndex) ? 10 - playsGroupedByPlayer[rightOppIndex].length : 10;
        var leftOppCardCount = _.has(playsGroupedByPlayer, leftOppIndex) ? 10 - playsGroupedByPlayer[leftOppIndex].length : 10;
        var cardCountByPlayer = [0, 0, 0, 0];
        cardCountByPlayer[teammateIndex] = teammateCardCount;
        cardCountByPlayer[rightOppIndex] = rightOppCardCount;
        cardCountByPlayer[leftOppIndex] = leftOppCardCount;
        
        // Set up a holder of all the possible cards
        var possibleCardsByPlayer = [[], [], [], []];

        // Determine the possible teammate cards
        for (var color in analytics.teammateTopPossibleCardByColor) {
            if (analytics.teammateTopPossibleCardByColor[color] !== 0) {
                var possibleCardsPerColor = _.filter(handComplement, function (card) {
                    return card.c === color && (card.n === analytics.teammateTopPossibleCardByColor[color] || gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[color], card.n));
                });
                if (possibleCardsPerColor.length > 0) {
                    possibleCardsByPlayer[teammateIndex] = possibleCardsByPlayer[teammateIndex].concat(possibleCardsPerColor);
                }
            }
        }
        possibleCardsByPlayer[teammateIndex] = _.shuffle(possibleCardsByPlayer[teammateIndex]);
        //console.log('Possible Teammate Cards (' + possibleCardsByPlayer[teammateIndex].length + ')');
        //console.log(possibleCardsByPlayer[teammateIndex]);
        //console.log('');

        // Determine the possible right opp cards
        for (var color in analytics.rightOppTopPossibleCardByColor) {
            if (analytics.rightOppTopPossibleCardByColor[color] !== 0) {
                var possibleCardsPerColor = _.filter(handComplement, function (card) {
                    return card.c === color && (card.n === analytics.rightOppTopPossibleCardByColor[color] || gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[color], card.n));
                });
                if (possibleCardsPerColor.length > 0) {
                    possibleCardsByPlayer[rightOppIndex] = possibleCardsByPlayer[rightOppIndex].concat(possibleCardsPerColor);
                }
            }
        }
        possibleCardsByPlayer[rightOppIndex] = _.shuffle(possibleCardsByPlayer[rightOppIndex]);
        //console.log('Possible R Opp Cards (' + possibleCardsByPlayer[rightOppIndex].length + ')');
        //console.log(possibleCardsByPlayer[rightOppIndex]);
        //console.log('');

        // Determine the possible left opp cards
        for (var color in analytics.leftOppTopPossibleCardByColor) {
            if (analytics.leftOppTopPossibleCardByColor[color] !== 0) {
                var possibleCardsPerColor = _.filter(handComplement, function (card) {
                    return card.c === color && (card.n === analytics.leftOppTopPossibleCardByColor[color] || gameUtils.card1IsStrongerThanCard2SameColor(analytics.leftOppTopPossibleCardByColor[color], card.n));
                });
                if (possibleCardsPerColor.length > 0) {
                    possibleCardsByPlayer[leftOppIndex] = possibleCardsByPlayer[leftOppIndex].concat(possibleCardsPerColor);
                }
            }
        }
        possibleCardsByPlayer[leftOppIndex] = _.shuffle(possibleCardsByPlayer[leftOppIndex]);
        //console.log('Possible L Opp Cards (' + possibleCardsByPlayer[leftOppIndex].length + ')');
        //console.log(possibleCardsByPlayer[leftOppIndex]);
        //console.log('');



        //#region New distribution algorithm
        var temporaryHands = [[], [], [], []];

        while (hands[teammateIndex].length < cardCountByPlayer[teammateIndex]
            ||
            hands[rightOppIndex].length < cardCountByPlayer[rightOppIndex]
            ||
            hands[leftOppIndex].length < cardCountByPlayer[leftOppIndex]
        ) {

            for (var i = 0; i < 4; i++) {

                // We should only distribute cards for the other players
                if (i !== index) {

                    if (hands[i].length < cardCountByPlayer[i]) {

                        // This player needs more cards
                        if (possibleCardsByPlayer[i].length > 0) {

                            // This player can get more cards from the list of his possible cards
                            var card = possibleCardsByPlayer[i][0];

                            // Add the card to the player
                            hands[i].push(card);

                            // Remove this card from all possible cards
                            possibleCardsByPlayer[teammateIndex] = _.without(possibleCardsByPlayer[teammateIndex], card);
                            possibleCardsByPlayer[rightOppIndex] = _.without(possibleCardsByPlayer[rightOppIndex], card);
                            possibleCardsByPlayer[leftOppIndex] = _.without(possibleCardsByPlayer[leftOppIndex], card);

                        }
                        else {

                            // This player needs to borrow or transfer cards with another player

                        }
                    }

                }
            }
        }

        //#endregion


















        // Determine the smallest possible card set
        var sortedPossibleCards = _.sortBy(
            [
                { index: teammateIndex, cards: possibleCardsByPlayer[teammateIndex] },
                { index: rightOppIndex, cards: possibleCardsByPlayer[rightOppIndex] },
                { index: leftOppIndex, cards: possibleCardsByPlayer[leftOppIndex] }
            ],
            function (item) {
                return item.cards.length; 
            });

        //console.log('Sorted Possible Cards');
        //console.log(sortedPossibleCards);
        //console.log('');

        
        // Process the first
        var firstIndex = sortedPossibleCards[0].index;        
        var firstCardCount = cardCountByPlayer[firstIndex];
        var firstCards = _.first(sortedPossibleCards[0].cards, firstCardCount);
        
        sortedPossibleCards[0].cards = _.difference(sortedPossibleCards[0].cards, firstCards);
        sortedPossibleCards[1].cards = _.difference(sortedPossibleCards[1].cards, firstCards);
        sortedPossibleCards[2].cards = _.difference(sortedPossibleCards[2].cards, firstCards);

        

        // Process the second
        var secondIndex = sortedPossibleCards[1].index;
        var secondCardCount = cardCountByPlayer[secondIndex];
        var secondCards = _.first(sortedPossibleCards[1].cards, secondCardCount);
        
        sortedPossibleCards[0].cards = _.difference(sortedPossibleCards[0].cards, secondCards);
        sortedPossibleCards[1].cards = _.difference(sortedPossibleCards[1].cards, secondCards);
        sortedPossibleCards[2].cards = _.difference(sortedPossibleCards[2].cards, secondCards);

        

        // Process the third
        var thirdIndex = sortedPossibleCards[2].index;
        var thirdCardCount = cardCountByPlayer[thirdIndex];
        var thirdCards = _.first(sortedPossibleCards[2].cards, thirdCardCount);
        
        sortedPossibleCards[0].cards = _.difference(sortedPossibleCards[0].cards, thirdCards);
        sortedPossibleCards[1].cards = _.difference(sortedPossibleCards[1].cards, thirdCards);
        sortedPossibleCards[2].cards = _.difference(sortedPossibleCards[2].cards, thirdCards);


        var adjustmentOccurred = false;


        //console.log('Possible Teammate Cards (' + possibleCardsByPlayer[teammateIndex].length + ')');
        //console.log(possibleCardsByPlayer[teammateIndex]);
        //console.log('');

        //console.log('Possible R Opp Cards (' + possibleCardsByPlayer[rightOppIndex].length + ')');
        //console.log(possibleCardsByPlayer[rightOppIndex]);
        //console.log('');

        //console.log('Possible L Opp Cards (' + possibleCardsByPlayer[leftOppIndex].length + ')');
        //console.log(possibleCardsByPlayer[leftOppIndex]);
        //console.log('');

        //console.log('Sorted possible cards before any borrow or transfer operations');
        //console.log(sortedPossibleCards);
        //console.log('');


        if (secondCards.length < cardCountByPlayer[secondIndex]) {

            adjustmentOccurred = true;

            // Does first still have some left cards to exchange?
            if (sortedPossibleCards[0].cards.length > 0) {

                // Attempt to borrow or transfer cards from first
                this.borrowOrTransferCards(secondIndex, secondCards, firstCards, sortedPossibleCards[0].cards, possibleCardsByPlayer, cardCountByPlayer);
                
            }

            // Are we set? Does second have a full hand or is he still lacking cards?
            if (secondCards.length < cardCountByPlayer[secondIndex]) {

                if (sortedPossibleCards[2].cards.length > 0) {

                    // Attempt to borrow or transfer cards from third
                    this.borrowOrTransferCards(secondIndex, secondCards, thirdCards, sortedPossibleCards[2].cards, possibleCardsByPlayer, cardCountByPlayer);

                }
            }

            // We should be set

        }


        if (thirdCards.length < cardCountByPlayer[thirdIndex]) {

            adjustmentOccurred = true;

            // Does first still have some left cards to borrow or transfer?
            if (sortedPossibleCards[0].cards.length > 0) {

                // Attempt to borrow or transfer cards from first
                this.borrowOrTransferCards(thirdIndex, thirdCards, firstCards, sortedPossibleCards[0].cards, possibleCardsByPlayer, cardCountByPlayer);
               
            }

            // Are we set? Does third have a full hand or is he still lacking cards?
            if (thirdCards.length < cardCountByPlayer[thirdIndex]) {

                // We're still lacking cards for third so check exchange cards with second
                if (sortedPossibleCards[1].cards.length > 0) {

                    // Attempt to borrow or transfer cards from second
                    this.borrowOrTransferCards(thirdIndex, thirdCards, secondCards, sortedPossibleCards[1].cards, possibleCardsByPlayer, cardCountByPlayer);
                    
                }
            }

            // We should be set

            //console.log('Index');
            //console.log(index);
            //console.log('');

            //console.log('Card Count By Player:  T(' + cardCountByPlayer[teammateIndex] + ') R(' + cardCountByPlayer[rightOppIndex] + ') L(' + cardCountByPlayer[leftOppIndex] + ')');
            //console.log('');

            //console.log('Possible Teammate Cards (' + possibleCardsByPlayer[teammateIndex].length + ')');
            //console.log(possibleCardsByPlayer[teammateIndex]);
            //console.log('');

            //console.log('Possible R Opp Cards (' + possibleCardsByPlayer[rightOppIndex].length + ')');
            //console.log(possibleCardsByPlayer[rightOppIndex]);
            //console.log('');

            //console.log('Possible L Opp Cards (' + possibleCardsByPlayer[leftOppIndex].length + ')');
            //console.log(possibleCardsByPlayer[leftOppIndex]);
            //console.log('');

            //console.log('Analytics');
            //console.log(analytics);
            //console.log('');

            //console.log('First:');
            //console.log(firstCards);
            //console.log('');

            //console.log('Second:');
            //console.log(secondCards);
            //console.log('');

            //console.log('Third:');
            //console.log(thirdCards);
            //console.log('');

        }

        //console.log('Sorted possible cards after borrow and transfer operations');
        //console.log(sortedPossibleCards);
        //console.log('');
        

        hands[firstIndex] = hands[firstIndex].concat(firstCards);
        hands[secondIndex] = hands[secondIndex].concat(secondCards);
        hands[thirdIndex] = hands[thirdIndex].concat(thirdCards);


        if (hands[teammateIndex].length !== cardCountByPlayer[teammateIndex]
            ||
            hands[rightOppIndex].length !== cardCountByPlayer[rightOppIndex]
            ||
            hands[leftOppIndex].length !== cardCountByPlayer[leftOppIndex]) {


            console.log('');
            console.log('');
            console.log('');


            console.log('Index');
            console.log(index);
            console.log('');

            console.log('Analytics');
            console.log(analytics);
            console.log('');

            console.log('Card Count By Player:  T(' + cardCountByPlayer[teammateIndex] + ') R(' + cardCountByPlayer[rightOppIndex] + ') L(' + cardCountByPlayer[leftOppIndex] + ')');
            console.log('');

            console.log('Possible Teammate Cards (' + possibleCardsByPlayer[teammateIndex].length + ')');
            console.log(possibleCardsByPlayer[teammateIndex]);
            console.log('');

            console.log('Possible R Opp Cards (' + possibleCardsByPlayer[rightOppIndex].length + ')');
            console.log(possibleCardsByPlayer[rightOppIndex]);
            console.log('');

            console.log('Possible L Opp Cards (' + possibleCardsByPlayer[leftOppIndex].length + ')');
            console.log(possibleCardsByPlayer[leftOppIndex]);
            console.log('');

            console.log('Sorted Possible Cards');
            console.log(sortedPossibleCards);
            console.log('');

            console.log('Teammate Hand:');
            console.log(hands[teammateIndex]);
            console.log('');

            console.log('Right Opp Hand:');
            console.log(hands[rightOppIndex]);
            console.log('');

            console.log('Left Opp Hand:');
            console.log(hands[leftOppIndex]);
            console.log('');


            process.exit(1);

        }

        return hands;

    },


    borrowOrTransferCards: function (playerIndex, playerCards, otherPlayerCards, otherPlayerRemainingCards, possibleCardsByPlayer, cardCountByPlayer) {

        var borrowableCards = _.intersection(otherPlayerRemainingCards, possibleCardsByPlayer[playerIndex]);
        var borrowedCards = [];

        if (borrowableCards.length > 0) {

            // First does have cards second can borrow
            for (var i = 0; i < borrowableCards.length; i++) {

                // Mark the replacement card so it can be removed later
                borrowedCards.push(borrowableCards[i]);

                // Add the borrowable card to second
                playerCards.push(borrowableCards[i]);

                if (playerCards.length >= cardCountByPlayer[playerIndex]) {
                    break;
                }
            }

            //console.log('Borrowed Cards by ' + playerIndex);
            //console.log(borrowedCards);
            //console.log('');

            // Remove used cards if any
            otherPlayerRemainingCards = _.difference(otherPlayerRemainingCards, borrowedCards);

        }
        else {

            var transferableCards = _.intersection(otherPlayerCards, possibleCardsByPlayer[playerIndex]);
            var transferedCards = [];

            if (transferableCards.length > 0) {

                for (var i = 0; i < Math.min(transferableCards.length, otherPlayerRemainingCards.length); i++) {

                    // Remove one exchange card from first
                    otherPlayerCards = _.without(otherPlayerCards, transferableCards[i]);

                    // Replace the exchange card with a remaining card
                    otherPlayerCards.push(otherPlayerRemainingCards[i]);

                    // Mark the replacement card so it can be removed later
                    transferedCards.push(otherPlayerRemainingCards[i]);

                    // Add the exchange card to second
                    playerCards.push(transferableCards[i]);

                    if (playerCards.length >= cardCountByPlayer[playerIndex]) {
                        break;
                    }
                }

                //console.log('Transfered cards to ' + playerIndex);
                //console.log(transferedCards);
                //console.log('');

                // Remove used cards if any
                otherPlayerRemainingCards = _.difference(otherPlayerRemainingCards, transferedCards);

            }
        }
    },




    createMidGameAnalyticsAwareCardDistribution2: function (hand, index, plays, analytics, pessimism) {

        // Set player indexes
        var teammateIndex = (index + 2) % 4;
        var rightOppIndex = (index + 1) % 4;
        var leftOppIndex = (index + 3) % 4;


        // Set the ai player hands
        var hands = [[], [], [], []];
        hands[index] = _.clone(hand);


        // Get hand complement while taking into consideration all the plays that happened
        var handComplement = gameUtils.getHandComplement(hand, plays);
        handComplement = _.shuffle(handComplement);


        // Group plays by player to be able to deduce the number of cards required per player
        var playsGroupedByPlayer = _.groupBy(plays, 'player');
        var teammateCardCount = _.has(playsGroupedByPlayer, teammateIndex) ? 10 - playsGroupedByPlayer[teammateIndex].length : 10;
        var rightOppCardCount = _.has(playsGroupedByPlayer, rightOppIndex) ? 10 - playsGroupedByPlayer[rightOppIndex].length : 10;
        var leftOppCardCount = _.has(playsGroupedByPlayer, leftOppIndex) ? 10 - playsGroupedByPlayer[leftOppIndex].length : 10;
        var cardCountByPlayer = [0, 0, 0, 0];
        cardCountByPlayer[teammateIndex] = teammateCardCount;
        cardCountByPlayer[rightOppIndex] = rightOppCardCount;
        cardCountByPlayer[leftOppIndex] = leftOppCardCount;


        // Tag each card so we know which players it can belong to
        var taggedCards = _.map(handComplement, function (card) {
            var cardPossibleOwningPlayers = [];

            if (analytics.teammateTopPossibleCardByColor[card.c] !== 0) {
                if (card.n === analytics.teammateTopPossibleCardByColor[card.c]
                    ||
                    gameUtils.card1IsStrongerThanCard2SameColor(analytics.teammateTopPossibleCardByColor[card.c], card.n))
                {

                    cardPossibleOwningPlayers.push(teammateIndex);
                }
            }

            if (analytics.rightOppTopPossibleCardByColor[card.c] !== 0) {
                if (card.n === analytics.rightOppTopPossibleCardByColor[card.c]
                    ||
                    gameUtils.card1IsStrongerThanCard2SameColor(analytics.rightOppTopPossibleCardByColor[card.c], card.n))
                {

                    cardPossibleOwningPlayers.push(rightOppIndex);
                }
            }

            if (analytics.leftOppTopPossibleCardByColor[card.c] !== 0) {
                if (card.n === analytics.leftOppTopPossibleCardByColor[card.c]
                    ||
                    gameUtils.card1IsStrongerThanCard2SameColor(analytics.leftOppTopPossibleCardByColor[card.c], card.n))
                {

                    cardPossibleOwningPlayers.push(leftOppIndex);
                }
            }

            return {
                n: card.n,
                c: card.c,
                p: cardPossibleOwningPlayers
            };

        });


        //**********************************************************
        /*
        if (index === 0) {

            console.log('');
            console.log('');
            console.log('----------------------------------------------------------------------------------');
            console.log('');

            console.log('Analytics');
            console.log(analytics);
            console.log('');

            console.log('Card Count By Player:  T(' + cardCountByPlayer[teammateIndex] + ') R(' + cardCountByPlayer[rightOppIndex] + ') L(' + cardCountByPlayer[leftOppIndex] + ')');
            console.log('');

            console.log('Tagged cards');
            console.log(taggedCards);
            console.log('');

        }
        */
        //**********************************************************



        var temporaryHands = [[], [], [], []];

        while (temporaryHands[teammateIndex].length < cardCountByPlayer[teammateIndex]
            ||
            temporaryHands[rightOppIndex].length < cardCountByPlayer[rightOppIndex]
            ||
            temporaryHands[leftOppIndex].length < cardCountByPlayer[leftOppIndex])
        {

            for (var i = 0; i < 4; i++) {

                // We should only distribute cards for the other players
                if (i !== index) {

                    if (temporaryHands[i].length < cardCountByPlayer[i]) {
                        
                        // Try to find a card that can belong to this player
                        var compatibleCards = _.filter(taggedCards, function (card) {
                            return _.contains(card.p, i);
                        });

                        if (compatibleCards.length > 0) {

                            // Sort the compatible cards by possible owning player count
                            compatibleCards = _.sortBy(compatibleCards, function (card) { return card.p.length; });

                            // Compatible cards have been found so take one
                            var compatibleCardWithPlayerI = compatibleCards[0];

                            temporaryHands[i].push(compatibleCardWithPlayerI);
                            taggedCards = _.without(taggedCards, compatibleCardWithPlayerI);



                            //**********************************************************
                            /*
                            if (index === 0) {
                                console.log('Player ' + i + ' took ' + JSON.stringify(compatibleCardWithPlayerI) + '. Remaining: ' + taggedCards.length + ' cards');
                            }
                            */
                            //**********************************************************


                        }
                        else {

                            // No compatible cards have been found, other players must have taken some of this player's cards
                            for (var j = 0; j < 4; j++) {

                                if (j !== index && j !== i) {

                                    // Does player J have cards that can also be owned by player I
                                    var compatibleCardsWithPlayerI = _.filter(temporaryHands[j], function (card) {
                                        return _.contains(card.p, i);
                                    });

                                    // Can player J find exchange cards so he can give one of his cards to player I
                                    var compatibleCardsWithPlayerJ = _.filter(taggedCards, function (card) {
                                        return _.contains(card.p, j);
                                    });

                                    if (compatibleCardsWithPlayerI.length > 0 && compatibleCardsWithPlayerJ.length > 0) {

                                        compatibleCardsWithPlayerI = _.sortBy(compatibleCardsWithPlayerI, function (card) { return card.p.length; });
                                        compatibleCardsWithPlayerJ = _.sortBy(compatibleCardsWithPlayerJ, function (card) { return card.p.length; });

                                        var cardToGiveToPlayerI = compatibleCardsWithPlayerI[0];
                                        var cardToGiveToPlayerJ = compatibleCardsWithPlayerJ[0];

                                        // Exchange cards for player J
                                        temporaryHands[j] = _.without(temporaryHands[j], cardToGiveToPlayerI);
                                        temporaryHands[j].push(cardToGiveToPlayerJ);

                                        // Give the card to player I
                                        temporaryHands[i].push(cardToGiveToPlayerI);

                                        // Remove the card from the pool
                                        taggedCards = _.without(taggedCards, compatibleCardsWithPlayerJ);



                                        //**********************************************************
                                        /*
                                        if (index === 0) {
                                            console.log('Player ' + j + ' gave ' + JSON.stringify(cardToGiveToPlayerI) + ' to player' + i + ' and took ' + JSON.stringify(cardToGiveToPlayerJ) + '. Remaining: ' + taggedCards.length + ' cards');
                                        }
                                        */
                                        //**********************************************************
                                        

                                        // Stop right here
                                        break;

                                    }
                                }
                            }
                        }                        
                    }
                }
            }
        }

        //**********************************************************
        /*
        if (index === 0) {

            console.log('Temporary hands');
            console.log(temporaryHands);
            console.log('');

        }
        */
        //**********************************************************


        hands[teammateIndex] = _.map(temporaryHands[teammateIndex], function (card) { return { n: card.n, c: card.c }; });
        hands[rightOppIndex] = _.map(temporaryHands[rightOppIndex], function (card) { return { n: card.n, c: card.c }; });
        hands[leftOppIndex] = _.map(temporaryHands[leftOppIndex], function (card) { return { n: card.n, c: card.c }; });


        return hands;

    }


}

