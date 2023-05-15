//#region GLOBAL VARIABLES

var g_dealing_cycle_duration = 250;                                                         // The time between dealing successive cards
var g_my_player_info = {};                                                                  // The current player info
var g_game_state = null;                                                                    // The current game state when in the gameplay screen
var g_socket = null;                                                                        // The current socket the app uses to communicate with the server
var g_active_screen = null;                                                                 // The current active screen
var g_screens = {};                                                                         // The list of screens this app has
var g_event_queue = [];                                                                     // The queue of events that are coming from the server
var g_disable_event_queue_processing = false;                                               // Whether the gameplay queue is processing events or busy
var g_is_game_paused = false;                                                               // Whether the game is paused (not used for now)
var g_search_results = null;                                                                // The current game search results
var g_replay_game_id = "";                                                                  // The id of the game being watched   
var g_is_replay_playing = false;                                                            // Whether the current replay is playing or is paused
var g_replay_state_list = [];                                                               // The list of UI states the replay contains
var g_replay_state_display_time = 3000;                                                     // The time a state remains displayed before the replay continues
var g_current_replay_state_index = 0;                                                       // The index of the current state
var g_replay_time_handle;                                                                   // The handle of the time so we can reset it at will
var g_replay_bidding_start_state_index = -1;                                                // The index of the state at which the bidding starts
var g_replay_bidding_end_state_index = -1;                                                  // The index of the state at which the bidding ends
var g_replay_rounds_start_state_indices = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];         // The indices at which each round state starts  


//#endregion



//#region DOCUMENT READY

$(document).ready(function () {

    // Popuplate screens
    g_screens = {
        login: $(".screen.login"),
        register: $(".screen.register"),
        menu: $(".screen.menu"),
        lobby: $(".screen.lobby"),
        gameplay: $(".screen.gameplay"),
        search: $(".screen.search"),
        watch: $(".screen.watch")
    };

    g_active_screen = g_screens.login;


    // Set events handlers
    $("#lg-login-btn").one('click', onLoginButtonClicked);
    $("#register-btn").one('click', onRegisterButtonClicked);
    $("#register-btn-valider").one('click', onRegisterValiderButtonClicked);
    $("#lg-back-to-login-btn").one('click', onBackToLoginButtonClicked);
    $("#sr-search-btn").on('click', onSearchButtonClicked);
    $("#gp-bidding-dialog-minus-10").click(onBiddingDialogMinus10);
    $("#gp-bidding-dialog-plus-10").click(onBiddingDialogPlus10);
    $("#gp-triunfo-selection-dialog .triunfo-color-btn").click(onTriunfoSelectionDialogSelect);
    $("#gp-sing-btn").on("click", onSingButtonClicked);
    $("#gp-sing-dialog .songs").on("click", ".song-color-btn", onSingDialogSelect);
    //$("#gp-info-toggle-debug-zones").click(onToggleDebugCardZones);
    //$("#wa-btn-toggle-comments").click(onToggleComments);
    $("#wa-btn-next-round").click(onGoToNextRound);
    $("#wa-btn-next-action").click(onGoToNextAction);
    $("#wa-btn-play-pause").click(onPlayPause);
    $("#wa-btn-prev-action").click(onGoToPreviousAction);
    $("#wa-btn-prev-round").click(onGoToPreviousRound);
    $("#wa-btn-close-comments").click(onCloseCommentZone);


    // Disable enter to avoid submitting and disconnecting
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    
    
    
    // Enable dragging functionality for modal setup as such
    $('.modal.draggable>.modal-dialog').draggable({
        cursor: 'move',
        handle: '.modal-header'
    });

    $('.modal.draggable>.modal-dialog>.modal-content>.modal-header').css('cursor', 'move');

});

//#endregion



//#region COMMON

function switchToScreen(screen) {
    var defer = $.Deferred();
    g_active_screen.fadeOut(500, function () {
        screen.fadeIn(500, function () {
            if (!g_active_screen.is(screen)) {
                g_active_screen.hide();
                g_active_screen = screen;                
            }
            defer.resolve();
        });
    });
    return defer.promise();
}


function onCommunicationError(jqXHR, textStatus, errorThrown) {
    console.error("The following error occurred: " + textStatus, errorThrown);
}

//#endregion



//#region LOGIN SCREEN

function resetLoginScreen() {
    $("#lg-login-btn").one('click', onLoginButtonClicked);
    $("#lg-login-btn").removeAttr('disabled'); //.prop("disabled", false);
    $("#lg-progress-indicator").hide();
}
function resetRegisterScreen() {
    $("#register-btn").one('click', onRegisterButtonClicked);
    $("#register-btn").removeAttr('disabled'); //.prop("disabled", false);
    // $("#lg-progress-indicator").hide();
}


function onLoginButtonClicked(e) {
    e.preventDefault();

    console.log('login test');
    // Disable the login button until the authentication is sorted out and show the progress indicator
    $("#lg-login-btn").attr('disabled','disabled'); //.prop('disabled', true);
    $("#lg-progress-indicator").show();


    $.post('/token', {
        email: $('#lg-email').val(),
        password: $('#lg-password').val()
    })
    .done(function (result) {
        connectToSocketWithToken(result.token);
    })
    .fail(function (jqXHR, textStatus, errorThrown){

        // Re enable the login button so the user may try again
        $("#lg-login-btn").one('click', onLoginButtonClicked);
        $("#lg-login-btn").removeAttr('disabled'); //.prop("disabled", false);
        $("#lg-progress-indicator").hide();

        // Show error dialog
        swal({
            title: 'Authentication Failed',
            text: jqXHR.responseJSON.error,
            type: 'error',
            confirmButtonText: 'Ok',
            allowOutsideClick: false
        });
    });
}
function onRegisterButtonClicked(e) {
    e.preventDefault();
    resetRegisterScreen();
    switchToScreen(g_screens.register);
}

function onBackToLoginButtonClicked(e){
    e.preventDefault();
    resetRegisterScreen();
    switchToScreen(g_screens.login);
}

function onRegisterValiderButtonClicked(e) {
    e.preventDefault();
    //console.log("hi younnes ************lllll**");
    $.post('/AddUser', {
        username: $('#lg-username').val(),
        firstname: $('#lg-firstname').val(),
        lastname: $('#lg-lastname').val(),
        email: $('#lg-l').val(),
        password: $('#lg-p').val()
    })
    .done(function (result) {
            console.log("it's done !!!!!!!!!");
    })
    switchToScreen(g_screens.login);
}


function connectToSocketWithToken(token) {

    // Initiate connection attempt
    g_socket = io.connect(window.location.href, {
        query: 'token=' + token
    });
    
    // Subscribe to general events
    //g_socket.on('connect', onSocketConnect);
    g_socket.on('disconnect', onSocketDisconnect);
    g_socket.on('WELCOME', onSocketWelcome);
    g_socket.on('joined_game', onSocketJoinedGame);
    g_socket.on('player_joined_game', onSocketPlayerJoinedGame);
    g_socket.on('started_game', onSocketStartedGame);
    g_socket.on('GAME_SEARCH_FINISHED', onSocketGameSearchFinished);

}


function onSocketConnect() {
    console.log('authenticated');
}


function onSocketDisconnect() {
    console.log('disconnected');

    // Show error dialog
    swal({
        title: 'Connection Error',
        text: 'You have been disconnected from the server! Make sure you are connected to the internet and try again',
        type: 'error',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
    });

    // Remove all listeners
    g_socket.removeAllListeners();
    g_socket = null;

    // Switch to login screen
    resetLoginScreen();
    switchToScreen(g_screens.login);

}

//#endregion



//#region MENU SCREEN

function onSocketWelcome(player_info) {
    console.log(player_info);
    g_my_player_info = player_info;

    // Switch to menu screen
    initMenuScreen();
    switchToScreen(g_screens.menu);
}


function initMenuScreen() {
    $(".screen.menu p.username span").text(g_my_player_info.username);

    $("#mn-new-game-btn").off('click');
    $("#mn-new-game-btn").one('click', onNewGameButtonClicked);
    $("#mn-new-game-btn").removeAttr('disabled');

    $("#mn-watch-game-btn").off('click');
    $("#mn-watch-game-btn").one('click', onWatchGameButtonClicked);
    $("#mn-watch-game-btn").removeAttr('disabled');

    $("#mn-progress-indicator").hide();
}



function onNewGameButtonClicked(e) {
    e.preventDefault();

    // Disable the button so it won't be clicked twice
    $("#mn-new-game-btn").attr('disabled','disabled');
    $("#mn-progress-indicator").show();

    g_socket.emit('NEW_GAME_REQUESTED');
}


function onWatchGameButtonClicked(e) {
    e.preventDefault();

    // Disable the button so it won't be clicked twice
    $("#mn-watch-game-btn").attr('disabled', 'disabled');

    // Switch to the search game screen
    initSearchScreen();
    switchToScreen(g_screens.search);    
}

//#endregion



//#region LOBBY SCREEN

function onSocketJoinedGame(players) {
    console.log(players);

    // Switch to the lobby screen
    initLobbyScreen(players);
    switchToScreen(g_screens.lobby);
}


function initLobbyScreen(players) {
    if(g_my_player_info.id === players[0].id) {
        $("#lb-start-game-btn").show();
    }
    else {
        $("#lb-start-game-btn").hide();
    }

    $("#lb-start-game-btn").one('click', onStartGameButtonClicked);
    $("#lb-start-game-btn").removeAttr('disabled');

    updateLobbyUI(players);
}


function onSocketPlayerJoinedGame(players) {
    updateLobbyUI(players);
}


function updateLobbyUI(players) {
    $(".lobby .player-slot").each(function (index) {
        if (index < players.length) {
            if ($(this).hasClass("player-slot-waiting")) {
                $(this).removeClass('player-slot-waiting').addClass('player-slot-filled');
            }
            $(this).children('p').first().text(players[index].username);
        }
        else {
            if ($(this).hasClass("player-slot-filled")) {
                $(this).removeClass('player-slot-filled').addClass('player-slot-waiting');
            }
            $(this).children('p').first().text('waiting for player...');
        }
    });
}


function onStartGameButtonClicked(e) {
    e.preventDefault();

    // Disable the button so it won't be clicked twice
    $("#lb-start-game-btn").attr('disabled','disabled'); //.prop('disabled', true);

    g_socket.emit('start_game_requested');
}

//#endregion



//#region GAMEPLAY SCREEN

function onSocketStartedGame(game_info) {
    g_event_queue.push({
        event_name: 'game_started',
        event_data: game_info
    });
    processEventQueue();
}


function initGameplayScreen(game_info) {

    console.log(game_info);
    g_game_state = game_info;


    // Close results dialog if open dialogs
    $("#gp-game-results-dialog").modal('hide');
    
    
    // Clear all zones if not empty (when a game is reset for example)
    $(".drop-zone").children().hide();
    $(".debug-card-zone ul").empty();
    $("#gp-card-zone ul").empty();
    
    
    // Set global info
    // Game keyword
    $("#gp-info-game-keyword").text(g_game_state.keyword);

    // Marathon score
    $("#gp-info-tournament-score-a").text(g_game_state.marathonScore.teamAScore);
    $("#gp-info-tournament-score-b").text(g_game_state.marathonScore.teamBScore);

    // Game score
    $("#gp-info-game-score-a").text("0");
    $("#gp-info-game-score-b").text("0");
    
    // Triunfo
    $("#gp-info-game-triunfo").text("?");

    // Username
    $("#gp-info-username").text(g_my_player_info.username);
    


    // Clear all roles
    $(".player-dealer").hide();
    $(".player-buyer").hide();
    $(".player-singer").hide();


    // Set local player info
    $(".gameplay .player-info .player-name").text(g_my_player_info.username);
    if (g_game_state.index % 2 === 0) {
        $(".gameplay .player-info .player-team").text("A");
    }
    else {
        $(".gameplay .player-info .player-team").text("B");
    }


    // Set teammate player info
    var $teammate_zone = $(".gameplay .teammate-info");
    var teammate_index = (g_game_state.index + 2) % 4;

    if (g_game_state.players[teammate_index].type === "human") {
        $teammate_zone.find(".player-type").addClass("gp-icon-human");
    }
    else if (g_game_state.players[teammate_index].type === "ai") {
        $teammate_zone.find(".player-type").addClass("gp-icon-ai");
    }

    $teammate_zone.find(".player-name").text(g_game_state.players[teammate_index].username);
    $teammate_zone.find(".player-team").text(teammate_index % 2 === 0 ? "A" : "B");


    // Set left opponent info
    var $left_opp_zone = $(".gameplay .left-opponent-info");
    var opp_l_index = (g_game_state.index + 3) % 4;

    if (g_game_state.players[opp_l_index].type === "human") {
        $left_opp_zone.find(".player-type").addClass("gp-icon-human");
    }
    else if (g_game_state.players[opp_l_index].type === "ai") {
        $left_opp_zone.find(".player-type").addClass("gp-icon-ai");
    }
    $left_opp_zone.find(".player-name").text(g_game_state.players[opp_l_index].username);
    $left_opp_zone.find(".player-team").text(opp_l_index % 2 === 0 ? "A" : "B");


    // Set right opponent info
    var $right_opp_zone = $(".gameplay .right-opponent-info");
    var opp_r_index = (g_game_state.index + 1) % 4;

    if (g_game_state.players[opp_r_index].type === "human") {
        $right_opp_zone.find(".player-type").addClass("gp-icon-human");
    }
    else if (g_game_state.players[opp_r_index].type === "ai") {
        $right_opp_zone.find(".player-type").addClass("gp-icon-ai");
    }

    $right_opp_zone.find(".player-name").text(g_game_state.players[opp_r_index].username);
    $right_opp_zone.find(".player-team").text(opp_r_index % 2 === 0 ? "A" : "B");


    // Set the dealer, announce it then start dealing cards
    var $dealer_zone = getPlayerInfoZoneFromIndex(g_game_state.dealer);
    $dealer_zone.find(".player-dealer").show();



    g_socket.off('waiting_for_player');
    g_socket.on('waiting_for_player', onWaitingForPlayer);

    g_socket.off('player_provided_bid');
    g_socket.on('player_provided_bid', onPlayerProvidedBid);

    g_socket.off('player_won_bid');
    g_socket.on('player_won_bid', onPlayerWonBid);

    g_socket.off('player_chose_triunfo');
    g_socket.on('player_chose_triunfo', onPlayerChoseTriunfo);

    g_socket.off('player_performed_play');
    g_socket.on('player_performed_play', onPlayerPerformedPlay);

    g_socket.off('player_performed_song');
    g_socket.on('player_performed_song', onPlayerPerformedSong);

    g_socket.off('player_won_table');
    g_socket.on('player_won_table', onPlayerWonTable);

    g_socket.off('provide_bid_requested');
    g_socket.on('provide_bid_requested', onProvideBidRequested);

    g_socket.off('choose_triunfo_requested');
    g_socket.on('choose_triunfo_requested', onChooseTriunfoRequested);

    g_socket.off('perform_song_requested');
    g_socket.on('perform_song_requested', onPerformSongRequested);

    g_socket.off('perform_play_requested');
    g_socket.on('perform_play_requested', onPerformPlayRequested);

    g_socket.off('game_ended');
    g_socket.on('game_ended', onGameEnded);

    g_socket.off('game_terminated');
    g_socket.on('game_terminated', onGameTerminated);

    g_socket.off('player_disconnected');
    g_socket.on('player_disconnected', onPlayerDisconnected);


    return $.when();    

}


//#region GAME EVENTS

function onGameStarted(gameInfo) {
    g_event_queue.push({
        event_name: 'game_started',
        event_data: gameInfo
    });
    processEventQueue();
}


function onWaitingForPlayer(playerInTurn) {
    g_event_queue.push({
        event_name: 'waiting_for_player',
        event_data: playerInTurn
    });
    processEventQueue();
}


function onPlayerProvidedBid(bid) {
    g_event_queue.push({
        event_name: 'player_provided_bid',
        event_data: bid
    });
    processEventQueue();
}


function onPlayerWonBid(buying_bid) {
    g_event_queue.push({
        event_name: 'player_won_bid',
        event_data: buying_bid
    });
    processEventQueue();
}


function onPlayerChoseTriunfo(triunfo) {
    g_event_queue.push({
        event_name: 'player_chose_triunfo',
        event_data: triunfo
    });
    processEventQueue();
}


function onPlayerPerformedPlay(play) {
    g_event_queue.push({
        event_name: 'player_performed_play',
        event_data: play
    });
    processEventQueue();
}


function onPlayerPerformedSong(song) {
    g_event_queue.push({
        event_name: 'player_performed_song',
        event_data: song
    });
    processEventQueue();
}


function onPlayerWonTable(win) {
    g_event_queue.push({
        event_name: 'player_won_table',
        event_data: win
    });
    processEventQueue();
}


function onProvideBidRequested() {
    g_event_queue.push({
        event_name: 'provide_bid_requested',
        event_data: null
    });
    processEventQueue();
}


function onChooseTriunfoRequested() {
    g_event_queue.push({
        event_name: 'choose_triunfo_requested',
        event_data: null
    });
    processEventQueue();
}


function onPerformSongRequested(valid_colors_to_sing) {
    g_event_queue.push({
        event_name: 'perform_song_requested',
        event_data: valid_colors_to_sing
    });
    processEventQueue();
}


function onPerformPlayRequested(valid_cards_to_play) {
    g_event_queue.push({
        event_name: 'perform_play_requested',
        event_data: valid_cards_to_play
    });
    processEventQueue();
}


function onGameEnded(results) {
    g_event_queue.push({
        event_name: 'game_ended',
        event_data: results
    });
    processEventQueue();
}


function onGameTerminated() {
    g_event_queue.push({
        event_name: 'game_terminated',
        event_data: null
    });
    processEventQueue();
}


function onPlayerDisconnected(playerInfo) {

    console.log(playerInfo.username + ' disconnected!');

    // Show error dialog
    swal({
        title: 'Player Disconnected',
        text: playerInfo.username + ' has been disconnected from the server! This game will be cancelled!',
        type: 'error',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
    }).then(function() {
        console.log('Cancelled the game');
        resetGameplayData()
            .then(function() {
                closeAnyModalDialogIfAny();
                initMenuScreen();
                return switchToScreen(g_screens.menu);
            });
    });
}

//#endregion


//#region QUEUE PROCESSING

function processEventQueue() {
    if(!g_disable_event_queue_processing && !g_is_game_paused && g_event_queue.length > 0) {
        
        // Disable further processing until this is processed
        g_disable_event_queue_processing = true;

        // Get the first event (FIFO)
        var game_event = g_event_queue.shift();
        console.log('processing event: ' + game_event.event_name);


        switch(game_event.event_name) {

            
            case 'game_started':
                
                // Announce the dealer then deal cards
                initGameplayScreen(game_event.event_data)
                    .then(function() { return switchToScreen(g_screens.gameplay); })
                    .then(function() { return announceEvent(game_event); })
                    .then(dealMyCards)
                    .done(onQueueEventProcessed);
                break;




            case 'waiting_for_player':

                showProgressIndicatorForPlayer(game_event.event_data);
                onQueueEventProcessed();
                break;




            case 'provide_bid_requested': // INFO: game_event.event_data is null
                
                // Show progress indicator
                showProgressIndicatorForPlayer(g_game_state.index);

                showBiddingDialog()
                    .done(onQueueEventProcessed);
                break;




            case 'player_provided_bid': // INFO: game_event.event_data contains the provided bid
                
                // Register the new bid
                registerNewBid(game_event.event_data);

                // Hide progress indicator
                hideProgressIndicator();

                // Perform the bid without announcement
                performBid(game_event.event_data)
                    .done(onQueueEventProcessed);

                break;




            case 'player_won_bid': // INFO: game_event.event_data contains the winning bid (which is the max bid)

                // Announce then clear all bids
                announceEvent(game_event)
                    .then(applyBuyer)
                    .then(clearAllBids)
                    .done(onQueueEventProcessed);

                break;




            case 'choose_triunfo_requested':

                // Announce then show the triunfo selection dialog
                //announceEvent(game_event)
                //    .done(showTriunfoSelectionDialog);

                showTriunfoSelectionDialog()
                    .done(onQueueEventProcessed);

                break;




            case 'player_chose_triunfo': // INFO: game_event.event_data contains the triunfo color which is a single character string

                // Set the triunfo color
                g_game_state.triunfo = game_event.event_data;

                // Announce then apply the triunfo
                announceEvent(game_event)
                    .then(applyTriunfo)
                    .done(onQueueEventProcessed);

                break;



            
            case 'perform_song_requested':

                // Show progress indicator
                showProgressIndicatorForPlayer(g_game_state.index);

                // Show the singing dialog
                setupMySingingOptions(game_event.event_data)
                    .done(onQueueEventProcessed);

                break;




            case 'perform_play_requested':

                // Show progress indicator
                showProgressIndicatorForPlayer(g_game_state.index);

                // Set up my singing and play choices
                setUpMyTurnToPlay(game_event.event_data)
                    .done(onQueueEventProcessed);

                break;



            case 'player_performed_song':

                // Announce and apply the song
                announceEvent(game_event)
                    .then(applySong)
                    .done(onQueueEventProcessed);

                break;



            case 'player_performed_play':

                // Add the play to the list                
                g_game_state.plays.push(game_event.event_data);

                // Hide progress indicator
                hideProgressIndicator();

                // Perform the play
                removePlayCard(game_event.event_data)
                    .then(performPlay)
                    .done(onQueueEventProcessed);

                break;



            case 'player_won_table':

                // Add the win to the list
                g_game_state.wins.push(game_event.event_data);

                // Perform win
                performWin(game_event.event_data)
                    .done(onQueueEventProcessed);

                break;



            case 'game_ended':

                // Display the results dialog
                showResultDialog(game_event.event_data)
                    .done(onQueueEventProcessed);

                break;



            case 'game_terminated':

                resetGameplayData()
                    .then(function() {

                        // Close results dialog if open dialogs
                        $("#gp-game-results-dialog").modal('hide');

                        initMenuScreen();
                        return switchToScreen(g_screens.menu);

                    })
                    .done(onQueueEventProcessed);

                break;
            

        }
        
    }
}


function onQueueEventProcessed(msg) {
    g_disable_event_queue_processing = false;
    processEventQueue();
}

//#endregion


//#region ANNOUNCEMENT HANDLING

function announceEvent(game_event) {
    
    var defer = $.Deferred();
    var msg = '';
    var $announcer = $("#gp-announcer-popup");

    // Contruct the message
    switch(game_event.event_name) {

        case 'game_started':
            msg = g_game_state.players[g_game_state.dealer].username + " will be the dealer";
            break;


        case 'player_provided_bid':
            msg = g_game_state.players[game_event.event_data.player].username + "'s turn to bid";
            break;


        case 'player_won_bid':
            msg = g_game_state.players[game_event.event_data.player].username + " won the bid with " + game_event.event_data.amount;
            break;


        case 'player_chose_triunfo':
            msg = g_game_state.players[g_game_state.max_bid.player].username + " chose \"" + getColorNameFromCode(game_event.event_data) + "\" as triunfo";
            break;


        case 'player_performed_song':
            msg = g_game_state.players[game_event.event_data.player].username + " sang " + game_event.event_data.amount + " in \"" + getColorNameFromCode(game_event.event_data.color) + "\"";
            break;            

    }

    // Set the message
    $announcer.children("p").text(msg);

    // Animate the announcer
    $announcer.fadeIn(500).delay(2000).fadeOut(500).delay(1000).queue(function(next) {
        defer.resolve(game_event.event_data);
        next();
    });

    return defer.promise();
}


function announceMessage(msg) {
    var defer = $.Deferred();
    var $announcer = $("#gp-announcer-popup");

    // Set the message
    $announcer.children("p").text(msg);

    // Animate the announcer
    $announcer.fadeIn(500).delay(2000).fadeOut(500).delay(1000).queue(function(next) {
        defer.resolve(null);
        next();
    });

    return defer.promise();
}

//#endregion


//#region DEALING CARDS

function dealMyCards() {
    var defer = $.Deferred();
    var delay = 0;

    
    // Deal AI teammate debug cards if any
    if(g_game_state.teammateHand !== null) {
        var $debug_card_zone = getDebugCardZoneFromIndex((g_game_state.index + 2) % 4);
        for(var i = 0; i < g_game_state.teammateHand.length; i++) {
            var card = g_game_state.teammateHand[i];
            var $card = $('<li class="card ' + getCardClassName(card) + ' sprite" data-number="' + card.n + '" data-color="' + card.c + '" style="display:none;"></li>');
            $card.appendTo($debug_card_zone.children("ul")).fadeIn(250);
        }
    }

    // Deal AI right opp debug cards if any
    if(g_game_state.rightOppHand !== null) {
        var $debug_card_zone = getDebugCardZoneFromIndex((g_game_state.index + 1) % 4);
        for(var i = 0; i < g_game_state.rightOppHand.length; i++) {
            var card = g_game_state.rightOppHand[i];
            var $card = $('<li class="card ' + getCardClassName(card) + ' sprite" data-number="' + card.n + '" data-color="' + card.c + '" style="display:none;"></li>');
            $card.appendTo($debug_card_zone.children("ul")).fadeIn(250);
        }
    }

    // Deal AI teammate debug cards if any
    if(g_game_state.leftOppHand !== null) {
        var $debug_card_zone = getDebugCardZoneFromIndex((g_game_state.index + 3) % 4);
        for(var i = 0; i < g_game_state.leftOppHand.length; i++) {
            var card = g_game_state.leftOppHand[i];
            var $card = $('<li class="card ' + getCardClassName(card) + ' sprite" data-number="' + card.n + '" data-color="' + card.c + '" style="display:none;"></li>');
            $card.appendTo($debug_card_zone.children("ul")).fadeIn(250);
        }
    }
    

    for (var i = 0; i < g_game_state.hand.length; i++) {
        var card = g_game_state.hand[i];
        //console.log(card);
        (function (card, i) {
            setTimeout(function () {
                var $card = $('<li class="card ' + getCardClassName(card) + ' sprite" data-number="' + card.n + '" data-color="' + card.c + '" style="display:none;"><a href="#" class="gp-btn-play-s sprite"></a></li>');
                if(i < g_game_state.hand.length - 1) {
                    $card.appendTo(".gameplay .card-zone ul").fadeIn(250);
                }
                else {
                    $card.appendTo(".gameplay .card-zone ul").fadeIn(250, function() {
                        defer.resolve('dealt the cards');
                    });
                }
            }, delay);
            delay += g_dealing_cycle_duration;
        })(card, i);
    }
    return defer.promise();
}

//#endregion


//#region BIDDING
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function performBid(bid) {
    var defer = $.Deferred();
    var $player_drop_zone = getPlayerDropZoneFromIndex(bid.player);
    var $bid_amount = $player_drop_zone.find(".bid-amount");

    // If there is an existing bid
    $bid_amount
        .fadeOut(500)
        .queue(function(next) {
            $bid_amount.text(bid.amount <= 0 ? "PASS" : bid.amount);
            next();
        })
        .fadeIn(500)
        .delay(1000)
        .queue(function(next) {
            defer.resolve('performed the bid');
            next();
        });

    return defer.promise();
}


function onBiddingDialogBid(e) {
    e.preventDefault();
    placeBid(parseInt($("#gp-bidding-dialog-bid-amount").text()));
}


function onBiddingDialogPass(e) {
    e.preventDefault();
    placeBid(0);
}


function onBiddingDialogMinus10(e) {
    e.preventDefault();

    // Set the minimum acceptable bid amount
    var minAmountToBid = 70;
    if(g_game_state.max_bid !== null) {
        minAmountToBid = Math.max(minAmountToBid, g_game_state.max_bid.amount + 10);
    }

    // Check if the player can actually reduce his/her bid
    var bidAmount = parseInt($("#gp-bidding-dialog-bid-amount").text());
    if (bidAmount >= minAmountToBid + 10) {
        bidAmount -= 10;
        $("#gp-bidding-dialog-bid-amount").text(bidAmount);
    }
}


function onBiddingDialogPlus10(e) {
    e.preventDefault();
    var bidAmount = parseInt($("#gp-bidding-dialog-bid-amount").text());
    if(bidAmount < 230) {
        bidAmount += 10;
        $("#gp-bidding-dialog-bid-amount").text(bidAmount);
    }
}


function registerNewBid(newBid) {
    if(g_game_state.max_bid === null) {
        g_game_state.max_bid = newBid;
    }
    else {
        if(newBid.amount > g_game_state.max_bid.amount) {
            g_game_state.max_bid = newBid;
        }
    }
    g_game_state.bids.push(newBid);
}


function placeBid(amount) {

    // Create a new bid
    var myBid = {
        player: g_game_state.index,
        amount: amount
    };

    // Submit the bid to the server
    g_socket.emit('bid_submitted', myBid, function(response) {

        // Reset the event queue processing back to false
        //g_disable_event_queue_processing = false;

        if(response.status === 'OK') {

            // Close the dialog
            $("#gp-bidding-dialog").modal('hide');

        }
        else {
            alert('The bid you submitted was not accepeted by the server! Please try again!');
        }

    });
}


function clearAllBids() {
    // Clear all the bids to make room for play
    return $(".drop-zone .bid-amount").fadeOut(500).delay(500).promise();
}


function showBiddingDialog() {

    // Set up one time event handlers
    $("#gp-bidding-dialog-pass").off('click');
    $("#gp-bidding-dialog-bid").off('click');
    $("#gp-bidding-dialog-pass").one('click', onBiddingDialogPass);    
    $("#gp-bidding-dialog-bid").one('click', onBiddingDialogBid);


    var minAmountToBid = 70;
    if(g_game_state.max_bid !== null) {
        minAmountToBid = Math.max(minAmountToBid, g_game_state.max_bid.amount + 10);
    }
    $("#gp-bidding-dialog").find(".bid-amount").text(minAmountToBid);
    $("#gp-bidding-dialog").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });

    // Return a resolved promise
    return $.when();
}


function applyBuyer() {
    var $player_info_zone = getPlayerInfoZoneFromIndex(g_game_state.max_bid.player);
    $player_info_zone.find(".player-buyer .amount").text(g_game_state.max_bid.amount);
    $player_info_zone.find(".player-buyer").show();

    // Return a resolved promise so this function returns immediately
    return $.when();
}

//#endregion


//#region TRIUNFO SELECTION

function showTriunfoSelectionDialog() {

    // Reset the dialog before display
    $("#gp-triunfo-selection-dialog .triunfo-color-btn.selected").removeClass("selected");

    // Set the event handler to fire only once
    $("#gp-triunfo-selection-dialog-confirm").one('click', onTriunfoSelectionDialogConfirm);

    // Show the modal
    $("#gp-triunfo-selection-dialog").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });

    // Return a resolved promise
    return $.when();
}


function applyTriunfo() {

    $("#gp-card-zone ul").find(".card[data-color='" + g_game_state.triunfo + "']").addClass("triunfo");
    $("#gp-info-game-triunfo").text(getColorNameFromCode(g_game_state.triunfo));

    // Return a resolved promise so this function returns immediately
    return $.when();
}


function onTriunfoSelectionDialogSelect(e) {
    e.preventDefault();
    var $previously_selected = $("#gp-triunfo-selection-dialog .triunfo-color-btn.selected").first();
    if ($previously_selected !== $(this)) {
        $previously_selected.removeClass("selected");
        $(this).addClass("selected");
    }
}


function onTriunfoSelectionDialogConfirm(e) {
    e.preventDefault();
    var triunfo = $("#gp-triunfo-selection-dialog .triunfo-color-btn.selected").first().data("color");
    if (triunfo) {
        selectTriunfo(triunfo);
    }
    else {
        alert("You need to choose the triunfo first!");
    }
}


function selectTriunfo(color) {

    // Create a triunfo object
    var triunfo = color;

    // Submit the bid to the server
    g_socket.emit('triunfo_chosen', triunfo, function(response) {

        // Reset the event queue processing back to false
        //g_disable_event_queue_processing = false;

        if(response.status === 'OK') {

            // Close the dialog
            $("#gp-triunfo-selection-dialog").modal('hide');

        }
        else {
            alert('The triunfo color you chose was rejected by the server! Please try again!');

            // Rebind the event handler so the player can try again
            $("#gp-triunfo-selection-dialog-confirm").one('click', onTriunfoSelectionDialogConfirm);
        }

    });
}

//#endregion


//#region SINGING

function setupMySingingOptions(valid_colors_to_sing) {

    // Enable song button if available
    if(valid_colors_to_sing.length > 0) {
        //console.log(valid_colors);
        
        $("#gp-sing-dialog .songs").empty();
        for (var i = 0; i < valid_colors_to_sing.length; i++) {
            var $song = $('<div class="col-md-' + (12 / valid_colors_to_sing.length) + ' song"><a href="#" data-color="' + valid_colors_to_sing[i] + '" class="song-color-btn"><div class="card ' + getCardClassName({n:12, c:valid_colors_to_sing[i]}) + ' sprite"></div><div class="card ' + getCardClassName({n:11, c:valid_colors_to_sing[i]}) + ' sprite"></div></a></div>');
            $song.appendTo("#gp-sing-dialog .songs");
        }

        $("#gp-sing-btn").show();

    }
    else {

        // Show the singing button
        $("#gp-sing-btn").hide();
        //console.log("Nothing to sing!");
    }

    // Return a resolved promise
    return $.when();

}


function onSingButtonClicked(e) {
    e.preventDefault();
    var $songs = $("#gp-sing-dialog .songs .song");
    if ($songs.length > 0) {

        // Set up one time event handlers
        $("#gp-sing-dialog-sing").off('click');
        $("#gp-sing-dialog-cancel").off('click');
        $("#gp-sing-dialog-sing").one('click', onSingDialogSing);
        $("#gp-sing-dialog-cancel").one('click', onSingDialogCancel);

        $("#gp-sing-dialog").modal('show');
    }
}


function onSingDialogSing(e) {
    e.preventDefault();
    var color = $("#gp-sing-dialog .song-color-btn.selected").first().data("color");
    if (color) {
        performSong(color);
    }
    else {
        alert("You need to choose your song first!");
    }
}


function onSingDialogCancel(e) {
    e.preventDefault();
    performSong(null);
    //$("#gp-sing-dialog").modal('hide');
}


function onSingDialogSelect(e) {
    e.preventDefault();    
    $("#gp-sing-dialog .song-color-btn").removeClass("selected");
    $(this).addClass("selected");    
    //console.log("Song selected");
}


function performSong(color) {

    // Disable singing dialog buttons
    $("#gp-sing-dialog-sing").attr('disabled','disabled');
    $("#gp-sing-dialog-cancel").attr('disabled','disabled');

    // Create a song object if we have one
    var mySong = null;
    if(color !== null) {
        mySong = {
            player: g_game_state.index,
            amount: color === g_game_state.triunfo ? 40 : 20,
            color: color
        };
    }

    // Submit the song to the server
    g_socket.emit('song_performed', mySong, function(response) {

        // Reset the event queue processing back to false
        //g_disable_event_queue_processing = false;

        if(response.status === 'OK') {

            // The song was accepted so hide the singing button
            $("#gp-sing-btn").hide();

            // Hide then reset the singing dialog
            $("#gp-sing-dialog").on('hidden.bs.modal', function (e) { 
                $("#gp-sing-dialog .songs").empty();
                $("#gp-sing-dialog-sing").removeAttr('disabled');
                $("#gp-sing-dialog-cancel").removeAttr('disabled');
             });
            $("#gp-sing-dialog").modal('hide');

        }
        else {
            alert('The song you performed was not accepeted by the server! Please try again!');
            $("#gp-sing-dialog-sing").removeAttr('disabled');
            $("#gp-sing-dialog-cancel").removeAttr('disabled');
        }
    });

}


function applySong(song) {

    var $singer_role = getPlayerInfoZoneFromIndex(song.player).find(".player-singer");

    // Update the total singing amount for player
    var previous_singing_amount = parseInt($singer_role.find(".amount").text());
    $singer_role.find(".amount").text(song.amount + previous_singing_amount);
    $singer_role.show();
    
    // Update game score
    if(song.player % 2 === 0) {
        var game_score_a = parseInt($("#gp-info-game-score-a").text());
        $("#gp-info-game-score-a").text(game_score_a + song.amount);
    }
    else {
        var game_score_b = parseInt($("#gp-info-game-score-b").text());
        $("#gp-info-game-score-b").text(game_score_b + song.amount);
    }
        
    // Return a resolved promise
    return $.when();
}

//#endregion


//#region CARD PLAY
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function performPlay(play) {
    
    var $player_drop_zone = getPlayerDropZoneFromIndex(play.player);
    var $play_card = $player_drop_zone.find(".play-card");

    $play_card.removeClass().addClass("play-card " + getCardClassName(play.card) + " sprite");
    
    if(play.card.c === g_game_state.triunfo) {
        $play_card.addClass("triunfo");
    }
    
    rotate($play_card, randomIntBetween(-5, 5));
    return $play_card.fadeTo(500, 1.0).delay(500).promise();
    
}


function setUpMyTurnToPlay(valid_cards_to_play) {

    // Set up one time event handlers
    $("#gp-card-zone ul").off("click");
    $("#gp-card-zone ul").one("click", "a.gp-btn-play-s", null, onPlayCardButtonClicked);

    // Activate valid cards to play
    activateValidCards(valid_cards_to_play);

    // Return a resolved promise
    return $.when();
}


function activateValidCards(valid_cards) {

    // Add in-turn class
    $("#gp-card-zone ul").addClass("in-turn");

    var $cards = $("#gp-card-zone ul li.card");
    $cards.each(function () {

        var number = $(this).data("number");
        var color = $(this).data("color");

        for (var i = 0; i < valid_cards.length; i++) {
            if (number === valid_cards[i].n && color === valid_cards[i].c) {
                $(this).addClass("valid");
                break;
            }
        }

        if(!$(this).hasClass("valid")) {
            $(this).addClass("invalid");
        }

    });
    
}


function onPlayCardButtonClicked(e) {
    e.preventDefault();

    // Get card data
    var n = parseInt($(this).parent().data("number"));
    var c = $(this).parent().data("color");

    // Play the card
    playCard(n, c);
}


function playCard(n, c) {

    // Create a new play
    var myPlay = {
        player: g_game_state.index,
        card: { n: n, c: c }
    };

    // Submit the play to the server
    g_socket.emit('play_performed', myPlay, function(response) {

        if(response.status === 'OK') {

            // Recede ability to play
            recedeMyTurnToPlay();

        }
        else {
            alert('The card you played was not accepeted by the server! Please try again!');
        }
    });
}


function removePlayCard(play) {
    var defer = $.Deferred();

    if(play.player === g_game_state.index) {

        $("#gp-card-zone ul").find(".card[data-number='" + play.card.n + "'][data-color='" + play.card.c + "']").fadeOut(500, function () {
            $(this).remove();
            defer.resolve(play);
        });

    }
    else {

        var $debug_card_zone = getDebugCardZoneFromIndex(play.player);
        var $card = $debug_card_zone.children('ul').find(".card[data-number='" + play.card.n + "'][data-color='" + play.card.c + "']");

        if($card.length > 0) {
            $card.fadeOut(500, function () {
                $(this).remove();
                defer.resolve(play);
            });
        }
        else {
            defer.resolve(play);
        }
    }

    return defer.promise();
}


function recedeMyTurnToPlay() {
    // Disable song button if any
    $("#gp-sing-btn").data("singAmount", "");
    $("#gp-sing-btn").hide();

    // Deactivate all cards
    deactivateCards();
}


function deactivateCards() {

    // Remove in-turn class
    $("#gp-card-zone ul").removeClass("in-turn");

    // Remove valid class from cards
    $("#gp-card-zone ul li.card").removeClass("valid");
    $("#gp-card-zone ul li.card").removeClass("invalid");

}


function performWin(win) {
    
    var defer = $.Deferred();

    var $winning_card = getPlayerDropZoneFromIndex(win.player).find(".play-card").first();
    $(".play-card").each(function () {
        if ($(this).is($winning_card)) {
            $(this).delay(2750).fadeOut(250).queue(function(next) {

                // Update game score
                if(win.player % 2 === 0) {
                    var game_score_a = parseInt($("#gp-info-game-score-a").text());
                    game_score_a += win.value;
                    $("#gp-info-game-score-a").text(game_score_a);
                }
                else {
                    var game_score_b = parseInt($("#gp-info-game-score-b").text());
                    game_score_b += win.value;
                    $("#gp-info-game-score-b").text(game_score_b);
                }

                // If this is the last win, add the last round bonus
                if(g_game_state.wins.length === 10) {
                    if(win.player % 2 === 0) {
                        var game_score_a = parseInt($("#gp-info-game-score-a").text());
                        game_score_a += 10;
                        $("#gp-info-game-score-a").text(game_score_a);
                    }
                    else {
                        var game_score_b = parseInt($("#gp-info-game-score-b").text());
                        game_score_b += 10;
                        $("#gp-info-game-score-b").text(game_score_b);
                    }
                }

                defer.resolve('performed the win');
                next();

            });
        }
        else {
            $(this).delay(1000).fadeTo(250, 0.35).delay(1250).fadeOut(250);
        }
    })
        
    return defer.promise();    
}

//#endregion


//#region RESULTS
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function showResultDialog(results) {

    var comment = "";

    // Set the player names
    $("#gp-game-results-dialog .team-members.team-a").text(g_game_state.players[0].username + " & " + g_game_state.players[2].username);
    $("#gp-game-results-dialog .team-members.team-b").text(g_game_state.players[1].username + " & " + g_game_state.players[3].username);
    

    // Add won cards
    var $team_a_wins = $("#gp-game-results-dialog .team-won-rounds.team-a ul.rounds");
    var $team_b_wins = $("#gp-game-results-dialog .team-won-rounds.team-b ul.rounds");
    
    $team_a_wins.empty();
    $team_b_wins.empty();
    
    for(var i = 0; i < g_game_state.wins.length; i++) {
        
        var $round = $('<li class="round"><h1>' + (i + 1) +'</h1><ul class="cards"></ul></li>');
        $round.appendTo(g_game_state.wins[i].player % 2 == 0 ? $team_a_wins : $team_b_wins);
        
        for(var j = 0; j < g_game_state.wins[i].cards.length; j++) {
            
            var card = g_game_state.wins[i].cards[j];            
            var $card = $('<li class="card ' + getCardClassName(card) + ' sprite" data-number="' + card.n + '" data-color="' + card.c + '"></li>');
            
            $card.appendTo($round.children('ul.cards'));
        }
    }


    comment = (results.game.teamAScore > 0 ? "Team A" : "Team B") + " wins the game!";
    $("#gp-game-results-dialog-comment").text(comment);
    

    // Update marathon score if needed
    if(g_game_state.marathonOrder > 1) {
        $("#gp-game-results-dialog .team-game-score.team-a span").text(results.marathon.teamAScore);
        $("#gp-game-results-dialog .team-game-score.team-b span").text(results.marathon.teamBScore);
    }
    else {
        $("#gp-game-results-dialog .team-tournament-score.team-a").hide();
        $("#gp-game-results-dialog .team-tournament-score.team-b").hide();
    }
    

    // Update game score
    $("#gp-game-results-dialog .team-game-score.team-a span").text(results.game.teamAPoints + (g_game_state.max_bid.player % 2 === 0 ? "/" + g_game_state.max_bid.amount : ""));
    $("#gp-game-results-dialog .team-game-score.team-b span").text(results.game.teamBPoints + (g_game_state.max_bid.player % 2 === 1 ? "/" + g_game_state.max_bid.amount : ""));
    

    // If this is the host of the game, give him a chance to create a follow up game
    if (g_game_state.index === 0) {
        $("#gp-game-results-dialog-waiting").hide();

        $("#gp-game-results-dialog-close").show();
        $("#gp-game-results-dialog-close").one("click", onBackToMainMenu);

        $("#gp-game-results-dialog-followup-game").show();
        $("#gp-game-results-dialog-followup-game").one("click", onStartNextGameInMarathon);
    }
    else {
        $("#gp-game-results-dialog-waiting").show();
        $("#gp-game-results-dialog-followup-game").hide();
        $("#gp-game-results-dialog-close").hide();
    }
    
    
    // Show the modal
    $("#gp-game-results-dialog").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
    

    // Return a resolved promise
    return $.when();

}


function onStartNextGameInMarathon(e) {
    e.preventDefault();

    $("#gp-game-results-dialog").modal('hide');
    g_socket.emit('follow_up_game_requested');

}


function onBackToMainMenu(e) {
    e.preventDefault();

    //resetGameplayData();
    //switchToScreen(g_screens.menu);

    $("#gp-game-results-dialog").modal('hide');
    g_socket.emit('terminate_game_requested');
}

//#endregion


//#region GAMEPLAY HELPERS

function resetGameplayData() {
    
    // Reset data
    //g_my_player_info = {};
    g_game_state = null;
    g_event_queue = [];
    g_disable_event_queue_processing = false;
    g_is_game_paused = false;

    // Unsubscribe from socket events
    g_socket.off('waiting_for_player');
    g_socket.off('player_provided_bid');
    g_socket.off('player_won_bid');
    g_socket.off('player_chose_triunfo');
    g_socket.off('player_performed_play');
    g_socket.off('player_performed_song');
    g_socket.off('player_won_table');
    g_socket.off('provide_bid_requested');
    g_socket.off('choose_triunfo_requested');
    g_socket.off('perform_song_requested');
    g_socket.off('perform_play_requested');
    g_socket.off('game_ended');
    g_socket.off('game_terminated');


    return $.when();

}


function getPlayerInfoZoneFromIndex(index) {
    if(g_game_state.index === index) {
        return $(".gameplay .player-info");
    }
    else if(index === (g_game_state.index + 1) % 4){
        return $(".gameplay .right-opponent-info");
    }
    else if(index === (g_game_state.index + 2) % 4){
        return $(".gameplay .teammate-info");
    }
    else if(index === (g_game_state.index + 3) % 4){
        return $(".gameplay .left-opponent-info");
    }
    else {
        return null;
    }
}


function getPlayerDropZoneFromIndex(index) {
    if(g_game_state.index === index) {
        return $(".gameplay .player-drop-zone");
    }
    else if(index === (g_game_state.index + 1) % 4){
        return $(".gameplay .right-opponent-drop-zone");
    }
    else if(index === (g_game_state.index + 2) % 4){
        return $(".gameplay .teammate-drop-zone");
    }
    else if(index === (g_game_state.index + 3) % 4){
        return $(".gameplay .left-opponent-drop-zone");
    }
    else {
        return null;
    }
}


function getDebugCardZoneFromIndex(index) {
    if(index === (g_game_state.index + 1) % 4){
        return $(".gameplay .debug-card-zone.r-opp");
    }
    else if(index === (g_game_state.index + 2) % 4){
        return $(".gameplay .debug-card-zone.teammate");
    }
    else if(index === (g_game_state.index + 3) % 4){
        return $(".gameplay .debug-card-zone.l-opp");
    }
    else {
        return null;
    }
}


function showProgressIndicatorForPlayer(index) {
    // If progress indicator has already been shown, return
    var $progress_indicator = $("#gp-progress-indicator");
    if($progress_indicator.is(":visible") && $progress_indicator.data("playerId") === index) {
        return;
    }
    
    // Get the target drop zone to calculate coordinates
    var $player_drop_zone = getPlayerDropZoneFromIndex(index);
    var target_x = $player_drop_zone.position().left + parseInt($player_drop_zone.css('marginLeft'), 10) + 39;
    var target_y = $player_drop_zone.position().top + parseInt($player_drop_zone.css('marginTop'), 10) + 114;
    
    // Configure and display the progress indicator
    $progress_indicator.data("playerId", index);
    $progress_indicator.css('left', target_x);
    $progress_indicator.css('top', target_y);
    $progress_indicator.show();

}


function hideProgressIndicator() {
    var $progress_indicator = $("#gp-progress-indicator");
    $progress_indicator.removeData("playerId");
    $progress_indicator.hide();

}


function rotate($el, degrees) {
    $el.css({
        '-webkit-transform': 'rotate(' + degrees + 'deg)',
        '-moz-transform': 'rotate(' + degrees + 'deg)',
        '-ms-transform': 'rotate(' + degrees + 'deg)',
        '-o-transform': 'rotate(' + degrees + 'deg)',
        'transform': 'rotate(' + degrees + 'deg)',
        'zoom': 1

    });
}


function randomIntBetween(m, n) {

    return Math.floor(Math.random() * (n - m + 1)) + m;
}


function isFromMyTeam(player_index) {

    return player_index === g_game_state.index || player_index === ((g_game_state.index + 2) % 4)
}


function getCardClassName(card) {
    switch (card.c) {
        case 'o': return "c-" + card.n + "-oros";
        case 'c': return "c-" + card.n + "-copas";
        case 'e': return "c-" + card.n + "-espadas";
        case 'b': return "c-" + card.n + "-bastos";
    }
}


function getColorNameFromCode(colorCode) {
    switch (colorCode) {
        case 'o': return "Oros";
        case 'c': return "Copas";
        case 'e': return "Espadas";
        case 'b': return "Bastos";
    }
}


function closeAnyModalDialogIfAny() {
    $(".modal").modal('hide');
}

//#endregion


//#endregion



//#region SEARCH SCREEN

function initSearchScreen() {

    // Wire up the back button
    $("#sr-back-btn").one('click', onSearchBackButtonClicked);

    // Clear the keyword search text input
    $("#sr-keyword").val('');    

    // Clear the results
    $("#sr-results").empty();

    // Request the latest 10 games from the server
    g_socket.emit('FIND_GAMES_BY_KEYWORD_PART', '');

    // Display the progress indicator
    $("#sr-spinner").show();

}


function onSearchBackButtonClicked() {
    initMenuScreen();
    switchToScreen(g_screens.menu);
}


function onSearchButtonClicked() {

    // Disable the button so it's not clicked again until the search yield
    $("#sr-search-btn").attr('disabled', 'disabled');

    // Display the progress indicator
    $("#sr-spinner").show();
    $("#sr-results").empty();

    // Request a list of games with a keyword containing the input text
    g_socket.emit('FIND_GAMES_BY_KEYWORD_PART', $("#sr-keyword").val());
}


function onSocketGameSearchFinished(results) {

    // Save the search results
    g_search_results = results;

    // Enable the search button
    $("#sr-search-btn").removeAttr('disabled');

    // Hide the progress indicator
    $("#sr-spinner").hide();

    // Clear the results
    var $searchResults = $("#sr-results");

    if (g_search_results.length <= 0) {
        $searchResults.text('No results were found');
    }
    else {
        // Add the new elements
        for (var i = 0; i < g_search_results.length; i++) {
            var gameData = g_search_results[i];
            var $gameResultItem = $('#sr-game-result-item-template').clone();

            $gameResultItem.find("span.keyword").text(gameData.keyword);
            $gameResultItem.find("span.datetime").text(moment(gameData.creationDate).format('DD/MM/YY HH:mm'));
            $gameResultItem.find("span.dealer").text(gameData.players[gameData.dealer].username);
            $gameResultItem.find("span.buyer").text(gameData.players[gameData.buyer].username);
            $gameResultItem.find("span.bid").text(gameData.winningBid.amount);
            $gameResultItem.find("span.triunfo").text(getColorNameFromCode(gameData.triunfo));

            if (gameData.buyer % 2 === 0) {
                $gameResultItem.find("p.team-a-score").text(gameData.results.teamAPoints + '/' + gameData.winningBid.amount);
                $gameResultItem.find("p.team-b-score").text(gameData.results.teamBPoints);
            }
            else {
                $gameResultItem.find("p.team-a-score").text(gameData.results.teamAPoints);
                $gameResultItem.find("p.team-b-score").text(gameData.results.teamBPoints + '/' + gameData.winningBid.amount);
            }

            for (var j = 0; j < 4; j++) {
                $gameResultItem.find("span.player-" + j + "-name").text(gameData.players[j].username);
                if (gameData.players[j].type === 'ai') {
                    $gameResultItem.find("span.player-" + j + "-icon").removeClass('sr-icon-human').addClass('sr-icon-ai');
                }
            }

            $gameResultItem.one('click', { targetItemIndex: i }, onGameResultItemClicked);
            $gameResultItem.show();

            $gameResultItem.appendTo($searchResults);
        }
    }    
}


function onGameResultItemClicked(event) {
    console.log(event.data.targetItemIndex);
    var gameData = g_search_results[event.data.targetItemIndex];

    // Build the action list


    initWatchScreen(gameData);
    switchToScreen(g_screens.watch);
}

//#endregion



//#region WATCH SCREEN

function initWatchScreen(gameData) {

    g_replay_game_id = gameData._id;
    //console.log(g_replay_game_id);

    // Wire up the back button
    $("#wa-back-btn").one('click', onWatchBackButtonClicked);


    // Reset UI
    $(".watch .card-zone ul").empty();
    $(".watch .drop-zone").children().hide();

    // Fix hand sorting in gameData
    for (var i = 0; i < 4; i++) {
        gameData.hands[i] = sortHand(gameData.hands[i]);
    }

    // Set keyword, player names and dealer
    $("#wa-game-keyword").text(gameData.keyword);
    $("#wa-game-triunfo").text('?');
    $(".watch .player-" + gameData.dealer + "-info").find("span.player-dealer").show();

    for (var i = 0; i < 4; i++) {
        $(".watch .player-" + i + "-info").find("span.player-name").text(gameData.players[i].username);
    }

    // Build replay action list
    g_replay_state_list = buildReplayStateList(gameData);
    g_current_replay_state_index = 0;

    // Render the current state
    renderCurrentState();

}


function buildReplayStateList(gameData) {

    var replayStateList = [];


    //#region Create the initial empty state and the first bid

    var gameStateAtT0 = {
        action: { type: 'none', data: null, index: -1 }, // type: bid, triunfo, play, song, win
        teamAPoints: 0,
        teamBPoints: 0,
        triunfo: '',
        cardZones: [ [], [], [], [] ],
        dropZones: [
            { content: 'none', data: null }, // content: none, bid or card
            { content: 'none', data: null },
            { content: 'none', data: null },
            { content: 'none', data: null }
        ],
        infoZones: [
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 }
        ],
        announce: 'Game Start',
        round: 0,
        comments: null,
        canComment: false
    };

    var gameStateAtT1 = {
        action: { type: 'bid', data: gameData.bids[0], index: 0 }, // type: bid, triunfo, play, song, win
        teamAPoints: 0,
        teamBPoints: 0,
        triunfo: '',
        cardZones: [[], [], [], []],
        dropZones: [
            { content: 'none', data: null }, // content: none, bid or card
            { content: 'none', data: null },
            { content: 'none', data: null },
            { content: 'none', data: null }
        ],
        infoZones: [
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 }
        ],
        announce: '',
        round: 0,
        comments: getCommentsForItem(gameData, 'bid', 0),
        canComment: true
    };


    for (var i = 0; i < 4; i++) {
        gameStateAtT0.cardZones[i] = [].concat(gameData.hands[i]);
        gameStateAtT1.cardZones[i] = [].concat(gameData.hands[i]);
    }

    gameStateAtT1.dropZones[gameData.bids[0].player].content = 'bid';
    gameStateAtT1.dropZones[gameData.bids[0].player].data = gameData.bids[0].amount;


    replayStateList.push(gameStateAtT0);
    replayStateList.push(gameStateAtT1);
    g_replay_bidding_start_state_index = 1;

    //#endregion


    //#region Create and add remaining bid states

    for (var i = 1; i < gameData.bids.length; i++) {

        var gameStateAtT = {
            action: { type: 'bid', data: gameData.bids[i], index: i }, // type: bid, triunfo, play, song, win
            teamAPoints: 0,
            teamBPoints: 0,
            triunfo: '',
            cardZones: [
                [].concat(replayStateList[i].cardZones[0]),
                [].concat(replayStateList[i].cardZones[1]),
                [].concat(replayStateList[i].cardZones[2]),
                [].concat(replayStateList[i].cardZones[3])
            ],
            dropZones: [
                { content: replayStateList[i].dropZones[0].content, data: replayStateList[i].dropZones[0].data }, // content: none, bid or card
                { content: replayStateList[i].dropZones[1].content, data: replayStateList[i].dropZones[1].data },
                { content: replayStateList[i].dropZones[2].content, data: replayStateList[i].dropZones[2].data },
                { content: replayStateList[i].dropZones[3].content, data: replayStateList[i].dropZones[3].data },
            ],
            infoZones: [
                { bid: 0, song: 0 },
                { bid: 0, song: 0 },
                { bid: 0, song: 0 },
                { bid: 0, song: 0 }
            ],
            announce: '',
            round: 0,
            comments: getCommentsForItem(gameData, 'bid', i),
            canComment: true
        };

        gameStateAtT.dropZones[gameData.bids[i].player].content = 'bid';
        gameStateAtT.dropZones[gameData.bids[i].player].data = gameData.bids[i].amount;

        replayStateList.push(gameStateAtT);

    }

    //#endregion


    //#region Create the winning bid state

    var winningBidState = {
        action: { type: 'none', data: null, index: -1 }, // type: bid, triunfo, play, song, win
        teamAPoints: 0,
        teamBPoints: 0,
        triunfo: '',
        cardZones: [
            [].concat(replayStateList[0].cardZones[0]),
            [].concat(replayStateList[0].cardZones[1]),
            [].concat(replayStateList[0].cardZones[2]),
            [].concat(replayStateList[0].cardZones[3])
        ],
        dropZones: [
            { content: 'none', data: null }, // content: none, bid or card
            { content: 'none', data: null },
            { content: 'none', data: null },
            { content: 'none', data: null }
        ],
        infoZones: [
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 }
        ],
        announce: '',
        round: 0,
        comments: null,
        canComment: false
    };

    winningBidState.infoZones[gameData.winningBid.player].bid = gameData.winningBid.amount;
    winningBidState.announce = gameData.players[gameData.winningBid.player].username + ' won the bidding with ' + gameData.winningBid.amount;

    replayStateList.push(winningBidState);
    g_replay_bidding_end_state_index = replayStateList.length - 1;

    //#endregion


    //#region Create the triunfo selection state

    var triunfoSelectionState = {
        action: { type: 'triunfo', data: gameData.triunfo, index: 0 }, // type: bid, triunfo, play, song, win
        teamAPoints: 0,
        teamBPoints: 0,
        triunfo: gameData.triunfo,
        cardZones: [
            [].concat(replayStateList[0].cardZones[0]),
            [].concat(replayStateList[0].cardZones[1]),
            [].concat(replayStateList[0].cardZones[2]),
            [].concat(replayStateList[0].cardZones[3])
        ],
        dropZones: [
            { content: 'none', data: null }, // content: none, bid or card
            { content: 'none', data: null },
            { content: 'none', data: null },
            { content: 'none', data: null }
        ],
        infoZones: [
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 },
            { bid: 0, song: 0 }
        ],
        announce: '',
        round: 0,
        comments: getCommentsForItem(gameData, 'triunfo', 0),
        canComment: true
    };

    triunfoSelectionState.infoZones[gameData.winningBid.player].bid = gameData.winningBid.amount;
    triunfoSelectionState.announce = gameData.players[gameData.winningBid.player].username + ' chose ' + getColorNameFromCode(gameData.triunfo) + ' as triunfo';

    replayStateList.push(triunfoSelectionState);

    //#endregion


    //#region Create remaining states

    var teamAPoints = 0;
    var teamBPoints = 0;

    for (var i = 0; i < gameData.wins.length; i++) {

        var win = gameData.wins[i];

        // Set the round start state index
        g_replay_rounds_start_state_indices[i] = replayStateList.length;


        //#region Create a singing state if any

        if (i > 0) {

            for (var k = 0; k < gameData.songs.length; k++) {

                if (gameData.songs[k].round === i) {

                    // Set the song
                    var song = gameData.songs[k];

                    // Update the scores
                    if (song.player % 2 === 0) {
                        teamAPoints += song.amount;
                    }
                    else {
                        teamBPoints += song.amount;
                    }

                    // Create the singing state
                    var singingGameState = {
                        action: { type: 'song', data: song, index: k }, // type: bid, triunfo, play, song, win
                        teamAPoints: teamAPoints,
                        teamBPoints: teamBPoints,
                        triunfo: gameData.triunfo,
                        cardZones: [
                            [].concat(replayStateList[replayStateList.length - 1].cardZones[0]),
                            [].concat(replayStateList[replayStateList.length - 1].cardZones[1]),
                            [].concat(replayStateList[replayStateList.length - 1].cardZones[2]),
                            [].concat(replayStateList[replayStateList.length - 1].cardZones[3])
                        ],
                        dropZones: [
                            { content: 'none', data: null }, // content: none, bid or card
                            { content: 'none', data: null },
                            { content: 'none', data: null },
                            { content: 'none', data: null },
                        ],
                        infoZones: [
                            { bid: replayStateList[replayStateList.length - 1].infoZones[0].bid, song: replayStateList[replayStateList.length - 1].infoZones[0].song },
                            { bid: replayStateList[replayStateList.length - 1].infoZones[1].bid, song: replayStateList[replayStateList.length - 1].infoZones[1].song },
                            { bid: replayStateList[replayStateList.length - 1].infoZones[2].bid, song: replayStateList[replayStateList.length - 1].infoZones[2].song },
                            { bid: replayStateList[replayStateList.length - 1].infoZones[3].bid, song: replayStateList[replayStateList.length - 1].infoZones[3].song }
                        ],
                        announce: '',
                        round: i + 1,
                        comments: getCommentsForItem(gameData, 'song', k),
                        canComment: true
                    };


                    // Update the song amount in the info zone
                    singingGameState.infoZones[song.player].song += song.amount;

                    // Update the announcement
                    singingGameState.announce = gameData.players[song.player].username + ' sang ' + song.amount + ' in ' + getColorNameFromCode(song.color);

                    // Add the state to the list
                    replayStateList.push(singingGameState);

                    break;
                }
            }
        }

        //#endregion


        //#region Create the current round plays states

        for (var j = i * 4; j < (i + 1) * 4; j++) {

            var play = gameData.plays[j];

            var gameStateAtT = {
                action: { type: 'play', data: play, index: j }, // type: bid, triunfo, play, song, win
                teamAPoints: teamAPoints,
                teamBPoints: teamBPoints,
                triunfo: gameData.triunfo,
                cardZones: [
                    [].concat(replayStateList[replayStateList.length - 1].cardZones[0]),
                    [].concat(replayStateList[replayStateList.length - 1].cardZones[1]),
                    [].concat(replayStateList[replayStateList.length - 1].cardZones[2]),
                    [].concat(replayStateList[replayStateList.length - 1].cardZones[3])
                ],
                dropZones: [
                    { content: replayStateList[replayStateList.length - 1].dropZones[0].content, data: replayStateList[replayStateList.length - 1].dropZones[0].data }, // content: none, bid or card
                    { content: replayStateList[replayStateList.length - 1].dropZones[1].content, data: replayStateList[replayStateList.length - 1].dropZones[1].data },
                    { content: replayStateList[replayStateList.length - 1].dropZones[2].content, data: replayStateList[replayStateList.length - 1].dropZones[2].data },
                    { content: replayStateList[replayStateList.length - 1].dropZones[3].content, data: replayStateList[replayStateList.length - 1].dropZones[3].data },
                ],
                infoZones: [
                    { bid: replayStateList[replayStateList.length - 1].infoZones[0].bid, song: replayStateList[replayStateList.length - 1].infoZones[0].song },
                    { bid: replayStateList[replayStateList.length - 1].infoZones[1].bid, song: replayStateList[replayStateList.length - 1].infoZones[1].song },
                    { bid: replayStateList[replayStateList.length - 1].infoZones[2].bid, song: replayStateList[replayStateList.length - 1].infoZones[2].song },
                    { bid: replayStateList[replayStateList.length - 1].infoZones[3].bid, song: replayStateList[replayStateList.length - 1].infoZones[3].song }
                ],
                announce: '',
                round: i + 1,
                comments: getCommentsForItem(gameData, 'play', j),
                canComment: true
            };

            // Remove the played card from the card zone that played it
            var indexOfCardToRemove = -1;
            for (var k = 0; k < gameStateAtT.cardZones[play.player].length; k++) {
                var card = gameStateAtT.cardZones[play.player][k];
                if (card.c === play.card.c && card.n === play.card.n) {
                    indexOfCardToRemove = k;
                    break;
                }
            }

            gameStateAtT.cardZones[play.player].splice(indexOfCardToRemove, 1);


            // Put the played card in the drop zone
            gameStateAtT.dropZones[play.player].content = 'card';
            gameStateAtT.dropZones[play.player].data = play.card;


            // Add the state
            replayStateList.push(gameStateAtT);

        }

        //#endregion


        //#region Create the win state

        // Update the scores
        if (win.player % 2 === 0) {
            teamAPoints += win.value;
            if (i == 9) {
                teamAPoints += 10;
            }
        }
        else {
            teamBPoints += win.value;
            if (i == 9) {
                teamBPoints += 10;
            }
        }


        // Create the win state
        var winState = {
            action: { type: 'win', data: win, index: -1 }, // type: bid, triunfo, play, song, win
            teamAPoints: teamAPoints,
            teamBPoints: teamBPoints,
            triunfo: gameData.triunfo,
            cardZones: [
                [].concat(replayStateList[replayStateList.length - 1].cardZones[0]),
                [].concat(replayStateList[replayStateList.length - 1].cardZones[1]),
                [].concat(replayStateList[replayStateList.length - 1].cardZones[2]),
                [].concat(replayStateList[replayStateList.length - 1].cardZones[3])
            ],
            dropZones: [
                { content: 'none', data: null }, // content: none, bid or card
                { content: 'none', data: null },
                { content: 'none', data: null },
                { content: 'none', data: null },
            ],
            infoZones: [
                { bid: replayStateList[replayStateList.length - 1].infoZones[0].bid, song: replayStateList[replayStateList.length - 1].infoZones[0].song },
                { bid: replayStateList[replayStateList.length - 1].infoZones[1].bid, song: replayStateList[replayStateList.length - 1].infoZones[1].song },
                { bid: replayStateList[replayStateList.length - 1].infoZones[2].bid, song: replayStateList[replayStateList.length - 1].infoZones[2].song },
                { bid: replayStateList[replayStateList.length - 1].infoZones[3].bid, song: replayStateList[replayStateList.length - 1].infoZones[3].song }
            ],
            announce: '',
            round: i + 1,
            comments: null,
            canComment: false
        };

        // Update the annoucement
        winState.announce = gameData.players[win.player].username + ' won round ' + winState.round;

        // Add the state
        replayStateList.push(winState);

        //#endregion

    }

    //#endregion


    //#region Create the closing state

    var gameStateAtEnd = {
        action: { type: 'none', data: null, index: -1 }, // type: bid, triunfo, play, song, win
        teamAPoints: replayStateList[replayStateList.length - 1].teamAPoints,
        teamBPoints: replayStateList[replayStateList.length - 1].teamBPoints,
        triunfo: gameData.triunfo,
        cardZones: [[], [], [], []],
        dropZones: [
            { content: 'none', data: null }, // content: none, bid or card
            { content: 'none', data: null },
            { content: 'none', data: null },
            { content: 'none', data: null }
        ],
        infoZones: [
            { bid: replayStateList[replayStateList.length - 1].infoZones[0].bid, song: replayStateList[replayStateList.length - 1].infoZones[0].song },
            { bid: replayStateList[replayStateList.length - 1].infoZones[1].bid, song: replayStateList[replayStateList.length - 1].infoZones[1].song },
            { bid: replayStateList[replayStateList.length - 1].infoZones[2].bid, song: replayStateList[replayStateList.length - 1].infoZones[2].song },
            { bid: replayStateList[replayStateList.length - 1].infoZones[3].bid, song: replayStateList[replayStateList.length - 1].infoZones[3].song }
        ],
        announce: 'Game End',
        round: 9,
        comments: null,
        canComment: false
    };

    // Add the state
    replayStateList.push(gameStateAtEnd);

    //#endregion


    return replayStateList;

}


function renderCurrentState() {

    var currentState = g_replay_state_list[g_current_replay_state_index];


    // Set the scores
    $("#wa-game-score-a").text(currentState.teamAPoints);
    $("#wa-game-score-b").text(currentState.teamBPoints);



    // Set the triunfo if any
    if (currentState.triunfo) {
        $("#wa-game-triunfo").text(getColorNameFromCode(currentState.triunfo));
    }
    else {
        $("#wa-game-triunfo").text('?');
    }



    // Set the comments if any
    $("#wa-comments").empty();
    $("#wa-comment-textarea textarea").val('');

    if (currentState.canComment) {

        // Enable the comment toggle button
        $("#wa-btn-toggle-comments").removeAttr('disabled');
        $("#wa-btn-toggle-comments").on('click', onToggleComments);
        $("#wa-btn-submit-comment").on('click', onSubmitComment);

        // Load the comments into the UI
        var $comments = $("#wa-comments");
        for (var i = 0; i < currentState.comments.length; i++) {
            var $comment = $('<p class="wa-comment"><span class="wa-comment-author">' + currentState.comments[i].author + ':</span><span class="wa-comment-text"> ' + currentState.comments[i].content + '</span>');
            $comment.appendTo($comments);
        }

    }
    else {

        // If the comment zone is displayed, hide it
        $("#wa-comments-zone").hide();

        // This action doesn't support comments so disable the button and clear any comments
        $("#wa-btn-toggle-comments").attr('disabled', 'disabled');
        $("#wa-btn-toggle-comments").off('click', onToggleComments);
        $("#wa-btn-submit-comment").off('click');
    }



    // Set the cards
    $(".watch .card-zone ul").empty();
    for (var i = 0; i < 4; i++) {

        var $cardZone = $("#wa-card-zone-player-" + i + " ul");

        for (var j = 0; j < currentState.cardZones[i].length; j++) {

            var card = currentState.cardZones[i][j];
            var $card = $('<li class="card ' + getCardClassName(card) + ' sprite"></li>');

            if (card.c === currentState.triunfo) {
                $card.addClass('triunfo');
            }

            $card.appendTo($cardZone);
        }
    }

    // Set the drop zones
    $(".watch .drop-zone").children().hide();
    for (var i = 0; i < 4; i++) {
        var $dropZone = $("#wa-drop-zone-player-" + i);
        if (currentState.dropZones[i].content === 'bid') {
            var bidAmount = currentState.dropZones[i].data === 0 ? "PASS" : currentState.dropZones[i].data;
            $dropZone.children("h1.bid-amount").text(bidAmount).show();
        }
        else if (currentState.dropZones[i].content === 'card') {
            var card = currentState.dropZones[i].data;
            $dropZone.children("div.play-card").removeClass().addClass('play-card ' + getCardClassName(card) + ' sprite' + (card.c === currentState.triunfo ? ' triunfo' : '') ).show();
        }
    }

    // Set the info zones
    for (var i = 0; i < 4; i++) {

        var $infoZone = $(".watch .player-" + i + "-info");
        var $buyer = $infoZone.find("div.player-buyer");
        var $singer = $infoZone.find("div.player-singer");

        if (currentState.infoZones[i].bid > 0) {            
            $buyer.children("span.amount").text(currentState.infoZones[i].bid);
            $buyer.show();
        }
        else {
            $buyer.hide();
        }

        if (currentState.infoZones[i].song > 0) {
            $singer.children("span.amount").text(currentState.infoZones[i].song);
            $singer.show();
        }
        else {
            $singer.hide();
        }
    }

    // Set the announcer
    if (currentState.announce) {
        announceMessageInstantly(currentState.announce);
    }
    else {
        hideAnnouncerInstantly();
    }

}


function announceMessageInstantly(msg) {
    var $announcer = $("#wa-announcer-popup");
    $announcer.children("p").text(msg);
    $announcer.show();
}


function hideAnnouncerInstantly() {
    $("#wa-announcer-popup").hide();
}


function continuePlay() {
    if (g_is_replay_playing && g_current_replay_state_index < g_replay_state_list.length - 1) {
        g_replay_time_handle = setTimeout(function () {

            g_current_replay_state_index++;
            renderCurrentState();

            if (g_current_replay_state_index < g_replay_state_list.length - 1) {
                continuePlay();
            }
            else {
                g_is_replay_playing = false;
            }

        }, g_current_replay_state_index === 0 ? 250 : g_replay_state_display_time);
    }
}


function onToggleComments(e) {
    e.preventDefault();
    $("#wa-comments-zone").toggle();
}


function onGoToNextRound(e) {
    e.preventDefault();
    stopReplay();

    if (g_current_replay_state_index < g_replay_state_list.length - 1) {
        if (g_current_replay_state_index < g_replay_rounds_start_state_indices[9]) {
            for (var i = 0; i < 10; i++) {
                if (g_current_replay_state_index < g_replay_rounds_start_state_indices[i]) {
                    g_current_replay_state_index = g_replay_rounds_start_state_indices[i];
                    renderCurrentState();
                    break;
                }
            }
        }
        else {
            // We're in the middle of the last round so just end it
            g_current_replay_state_index = g_replay_state_list.length - 1;
            renderCurrentState();
        }
    }
    else {
        // We're already in the end so do nothing
    }
}


function onGoToNextAction(e) {
    e.preventDefault();
    stopReplay();

    if (g_current_replay_state_index < g_replay_state_list.length - 1) {
        g_current_replay_state_index++;
        renderCurrentState();
    }
    else {
        // We're already in the end so do nothing
    }
}


function onPlayPause(e) {
    e.preventDefault();
    
    if (g_is_replay_playing) {
        stopReplay();
    }
    else {        
        if (g_current_replay_state_index < g_replay_state_list.length - 1) {
            g_is_replay_playing = true;
            $("#wa-btn-play-pause span").removeClass('wa-icon-play').addClass('wa-icon-pause');
            continuePlay();
        }
    }
}


function onGoToPreviousAction(e) {
    e.preventDefault();
    stopReplay();

    if (g_current_replay_state_index > 0) {
        g_current_replay_state_index--;
        renderCurrentState();
    }
    else {
        // We're already at the beginning so ignore
    }
}


function onGoToPreviousRound(e) {
    e.preventDefault();
    stopReplay();

    if (g_current_replay_state_index > 0) {
        if (g_current_replay_state_index > g_replay_rounds_start_state_indices[0]) {
            for (var i = 9; i >= 0; i--) {
                if (g_current_replay_state_index > g_replay_rounds_start_state_indices[i]) {
                    g_current_replay_state_index = g_replay_rounds_start_state_indices[i];
                    renderCurrentState();
                    break;
                }
            }
        }
        else {
            // We're in the middle of the last round so just end it
            g_current_replay_state_index = 0;
            renderCurrentState();
        }
    }
    else {
        // We're already in the end so do nothing
    }
}


function stopReplay() {
    g_is_replay_playing = false;
    $("#wa-btn-play-pause span").removeClass('wa-icon-pause').addClass('wa-icon-play');
    clearTimeout(g_replay_time_handle);
}


function startReplay() {
    g_is_replay_playing = true;
    g_replay_time_handle = setTimeout(function () {

    }, g_replay_state_display_time);
}


function sortHand(hand) {
    return _.sortBy(hand, function (card) {
        var weight = 0;
        switch (card.c) {
            case 'o': weight += 400; break;
            case 'c': weight += 300; break;
            case 'e': weight += 200; break;
            case 'b': weight += 100; break;
        }
        switch (card.n) {
            case 1: weight += 9; break;
            case 3: weight += 8; break;
            case 12: weight += 7; break;
            case 11: weight += 6; break;
            case 10: weight += 5; break;
            case 7: weight += 4; break;
            case 6: weight += 3; break;
            case 5: weight += 2; break;
            case 4: weight += 1; break;
            case 2: weight += 0; break;
        }
        return weight * -1;
    });
}


function getCommentsForItem(gameData, itemType, itemIndex) {
    var comments = [];
    var commentSource = [];

    switch (itemType) {
        case 'bid':
            commentSource = gameData.review.bidding.comments;
            break;
            
        case 'triunfo':
            commentSource = gameData.review.triunfo.comments;
            break;

        case 'song':
            commentSource = gameData.review.singing.comments;
            break;

        case 'play':
            commentSource = gameData.review.playing.comments;
            break;
    }

    for (var i = 0; i < commentSource.length; i++) {
        var comment = commentSource[i];
        if (comment.itemIndex === itemIndex) {
            comments.push(comment);
        }
    }

    return comments;
}


function onCloseCommentZone(e) {
    e.preventDefault();
    $("#wa-comments-zone").hide();
}


function onSubmitComment(e) {
    e.preventDefault();

    if (!$("#wa-comment-textarea textarea").val())
        return;

    // Disable the button before submit to avoid duplicates
    $(this).attr('disabled', 'disabled');


    // Build the comment data
    var commentData = {
        gameId: g_replay_game_id,
        itemType: g_replay_state_list[g_current_replay_state_index].action.type,
        itemIndex: g_replay_state_list[g_current_replay_state_index].action.index,
        content: $("#wa-comment-textarea textarea").val()
    };


    // Submit the comment to the server
    g_socket.emit('NEW_COMMENT_ADDED', commentData, function (addedComment) {
        if (addedComment) {

            // Add to the state
            g_replay_state_list[g_current_replay_state_index].comments.push(addedComment);

            // Add the comment to the UI
            var $comments = $("#wa-comments");
            var $comment = $('<p class="wa-comment"><span class="wa-comment-author">' + addedComment.author + ':</span><span class="wa-comment-text"> ' + addedComment.content + '</span>');
            $comment.appendTo($comments);

            // Clear the textarea
            $("#wa-comment-textarea textarea").val('');

        }
        else {

            // Show error dialog
            swal({
                title: 'Adding Comment Failed',
                text: 'The comment could not be added. Please try again!',
                type: 'error',
                confirmButtonText: 'Ok',
                allowOutsideClick: false
            });

        }


        $("#wa-btn-submit-comment").removeAttr('disabled');

    });
}


function onWatchBackButtonClicked() {

    // Clean up (optional really)
    g_replay_state_list.length = 0;

    // Switch to the search screen
    initSearchScreen();
    switchToScreen(g_screens.search);

}

//#endregion