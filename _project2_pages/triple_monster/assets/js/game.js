//'use strict';

var dragAndDrop;
var socket = io.connect('http://stormy-dawn-97956.herokuapp.com');
var login = $('#login').val();
var id = $('#id').val();
var h1;
var h2;
var board_game;
var player = 0;
var roomname;
var hand;
var plr_turn;

socket.emit('loadrooms');

$(window).bind("beforeunload", function() {
    if (player != 0)
        socket.emit('autolost', id, roomname);
});

socket.on('autowon', function() {
    player = 0;
    $('#players').html('');
    $('#hand').html('');
    $('.board').html('');
    $('.board').removeClass('color1');
    $('.board').removeClass('color2');

    dragAndDrop.dragula.containers = [];
    dragAndDrop.dragula.containers.push(document.getElementById('11'));
    dragAndDrop.dragula.containers.push(document.getElementById('12'));
    dragAndDrop.dragula.containers.push(document.getElementById('13'));
    dragAndDrop.dragula.containers.push(document.getElementById('21'));
    dragAndDrop.dragula.containers.push(document.getElementById('22'));
    dragAndDrop.dragula.containers.push(document.getElementById('23'));
    dragAndDrop.dragula.containers.push(document.getElementById('31'));
    dragAndDrop.dragula.containers.push(document.getElementById('32'));
    dragAndDrop.dragula.containers.push(document.getElementById('33'));
    dragAndDrop.dragula.containers.push(document.getElementById('hand'));

    socket.emit('loadrooms');

    alert('You WON the game! Your opponent has disconnected.');
});

$('#new_room').click(function() {
    socket.emit('createroom', id, login);
    socket.emit('loadrooms');
});

$(document).on('click', '.enterroom', function() {
    socket.emit('enterroom', id, login, $(this).val());
    socket.emit('loadrooms');
});

socket.on('updaterooms', function(rooms) {
    var r;
    $('#rooms').html('');
    for (var i = 0; i < rooms.length; i++) {
        r = rooms[i].name.split(' ').join('<br />');
        if (rooms[i].owner_login == login || player !== 0) {
            $('#rooms').append('<br /><button type="submit" class="enter_r enter_r_owner" value="' + rooms[i].name + '">' + r + '</button>');
        } else if (rooms[i].guest_id == id || player !== 0) {
            $('#rooms').append('<br /><button type="submit" class="enter_r enter_r_guest" value="' + rooms[i].name + '">' + r + '</button>');
        } else {
            $('#rooms').append('<br /><button type="submit" class="enter_r enterroom" value="' + rooms[i].name + '">' + r + '</button>');
        }
    }
});

socket.on('opponent', function(opponent, room_name) {
    $('#opponent').text(opponent);
    roomname = room_name;
});

socket.on('roomfull', function(full_msg) {
    $('#opponent').text(full_msg);
});

socket.on('chat_update', function(login, text, time) {
    $('#chat_text').val('');
    //$('#chat_chat').append('<div><strong>' + login + '</strong> (' + time + ')<br />' + text + '</div>');
    $('#chat').append('<li><strong>' + login + '</strong> (' + time + ')<br />' + text + '</li>');
});

socket.on('game', function(hand1, hand2, board, player_n, turn, opponent, winner, room_name) {
    $('#hand').removeAttr('onmousedown');
    hand1 = JSON.parse(hand1);
    hand2 = JSON.parse(hand2);
    board = JSON.parse(board);
    h1 = hand1;
    h2 = hand2;
    board_game = board;
    plr_turn = turn;
    if (player === 0) {
        if (turn) alert('You start the game!');
        player = player_n;
        $('#players').html(login + ' x ' + opponent);

        dragAndDrop.dragula.containers = [];
        dragAndDrop.dragula.containers.push(document.getElementById('11'));
        dragAndDrop.dragula.containers.push(document.getElementById('12'));
        dragAndDrop.dragula.containers.push(document.getElementById('13'));
        dragAndDrop.dragula.containers.push(document.getElementById('21'));
        dragAndDrop.dragula.containers.push(document.getElementById('22'));
        dragAndDrop.dragula.containers.push(document.getElementById('23'));
        dragAndDrop.dragula.containers.push(document.getElementById('31'));
        dragAndDrop.dragula.containers.push(document.getElementById('32'));
        dragAndDrop.dragula.containers.push(document.getElementById('33'));
        dragAndDrop.dragula.containers.push(document.getElementById('hand'));
    }
    roomname = room_name;

    $('#hand').html('');
    var cards = '';
    var color;
    hand = player === 1 ? h1 : h2;
    for (var i = 0; i < 5; i++) {
        if (hand[i] !== 0) {
            cards = '<span></span>' + hand[i].up + '<br />' + hand[i].left + ' + ' + hand[i].right + '<br />' + hand[i].down;
            //$('#hand').append('<div class="card_wrapper col m12 c' + player + '" data-card="' + i + '">' + cards + '</div><br />');
            //$('#hand').append('<div class="card_wrapper col m12 c' + player + '" data-card="' + i + '"><div id="' + i + '" class="card">' + cards + '</div></div><br />');
            $('#hand').append('<div class="card_wrapper card col m12 c' + player + '" data-card="' + i + '"><img class="card-image" src="' + hand[i].image_url + '"><div class="powers text-blue">' + cards + '</div></div><br />');
        }
    }

    $('.board').html('');
    $('.board').removeClass('color1');
    $('.board').removeClass('color2');

    if (board.length !== 0) {
        cards = '';
        for (var i = 0; i < board.length; i++) {
            if ($('.pos_' + board[i].pos).hasClass('color1')) $('.pos_' + board[i].pos).removeClass('color1');
            if ($('.pos_' + board[i].pos).hasClass('color2')) $('.pos_' + board[i].pos).removeClass('color2');

            cards = board[i].up + '<br />' + board[i].left + ' + ' + board[i].right + '<br />' + board[i].down;
            $('.pos_' + board[i].pos).html('<div class="card_wrapper card c' + board[i].owner + '" data-card="' + i + '"><img class="card-image" src="' + board[i].image_url + '"><div class="powers text-blue">' + cards + '</div></div><br />');
            $('.pos_' + board[i].pos).addClass('color' + board[i].owner);
        }
    }

    socket.emit('loadrooms');

    if (!turn) dragAndDrop.dragula.containers.pop();
    else if (turn && dragAndDrop.dragula.containers.findIndex(element => {
            return element == document.getElementById('hand');
        }) == -1) {
        dragAndDrop.dragula.containers.push(document.getElementById('hand'));
    }

    if (winner !== false && winner == id) {
        alert('You WON this match!');
        player = 0;
    } else if (winner !== false && winner != id) {
        alert('You LOST this match!');
        player = 0;
    }
});

// $('.board').click(function() {
//
// });

$('#chat_text').keypress(function(event) {
    if (event.which == 13 && $(this).val() !== '') {
        socket.emit('chat', login, $(this).val(), roomname + ' chat');
    }
});

$(document).ready(function() {

    // Drag and Drop
    dragAndDrop = {
        init: function() {
            this.dragula();
            this.eventListeners();
        },

        eventListeners: function() {
            this.dragula.on('drop', this.dropped.bind(this));
        },

        dragula: function() {
            this.dragula = dragula([
                document.getElementById('11'),
                document.getElementById('12'),
                document.getElementById('13'),
                document.getElementById('21'),
                document.getElementById('22'),
                document.getElementById('23'),
                document.getElementById('31'),
                document.getElementById('32'),
                document.getElementById('33'),
                document.getElementById('hand')
            ], {
                moves: this.canMove.bind(this),
                accepts: this.canAccept.bind(this),
                revertOnSpill: true
            });
        },

        canMove: function() {
            return true;
        },

        canAccept: function() {
            return true;
        },

        disableUsedCell: function(target) {
            let array = this.dragula.containers;
            let indexOfTarget = array.findIndex(element => {
                return element == target;
            });
            array.splice(indexOfTarget, 1);
        },

        dropped: function(el, target) {
            if (target.id != 'hand') {
                this.disableUsedCell(target);
            }

            var index = $(el).attr('data-card');

            board_game.push({
                pos: $(target).data('position'),
                owner: player,
                image_url: hand[index].image_url,
                up: hand[index].up,
                left: hand[index].left,
                right: hand[index].right,
                down: hand[index].down
            });
            socket.emit('play', h1, h2, board_game, roomname, id, login, index, player, plr_turn);
        }

    };

    dragAndDrop.init();

});