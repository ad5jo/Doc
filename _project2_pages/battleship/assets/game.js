$(document).ready(function() {
	
	// Start socket.io connection with server
	var socket = io();
	
	// Fade-in welcome screen elements
	$('.hidden').fadeIn(1500).removeClass('hidden');
	setTimeout(function() {$('.hide').fadeIn(1000).removeClass('hide')}, 1500);


	var letters = [
		"A0", "B0", "C0", "D0", "E0", "F0", "G0", "H0", "I0", "J0",
		"A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1",
		"A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2", "J2",
		"A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "I3", "J3",
		"A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4", "J4",
		"A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5", "J5",
		"A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6", "J6",
		"A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7", "I7", "J7",
		"A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8", "I8", "J8",
		"A9", "B9", "C9", "D9", "E9", "F9", "G9", "H9", "I9", "J9"
	];

	var shipLocation = [];

	// Default enemy ship board
	var enemyShips = ["H3", "H4", "H5", "H6", "H7", "B1", "C1", "D1", "E1", "D9", "E9", "F9", "H0", "I0", "J0", "B4", "B5"];

	// Receive enemy board from server to replace default
	socket.on("enemies-here", function(msg) {
		console.log("receiving enemy board");	
		enemyShips = msg.split(",");
		console.log(enemyShips);
	});


	var ships = {
		carrier: { name: "Carrier", length: 5, placed: false },
		battleship: { name: "Battleship", length: 4, placed: false },
		submarine: { name: "Submarine", length: 3, placed: false },
		destroyer: { name: "Destroyer", length: 3, placed: false },
		scout: { name: "Scout", length: 2, placed: false },
		default: { length: 0 }
	};


	$("#submit-name").on("click", function() {
		$("#welcome-screen").hide();
		$("#lobby").show();
		// Send player name to the server
		socket.emit("submit-name", $("#player-name").val());
	});


	$(".room").on("click", function() {
		$("#lobby").hide();
		$("#game-board").show();
		$(".footer").hide();
	})

	// When user clicks the create room button in the lobby
	$("#create-room").on("click", function() {
		// Emit an event with a random uid and room name
		socket.emit("create-room", {
			name: $("#player-name").val(),
			id: uidGenerator()
		});
	})

	$(".ship").each(function(index, div) {
		var jDiv = $(div);
		var value = $(div).attr('value');
		jDiv.html("<p>" + ships[value].name + "</p>");
	});

	$(".rotate").on("click", function() {
		$("#P1").toggleClass("vertical");
	});

	$(".ship").on("click", function() {
		console.log("selected ship");
		$('.ship').removeClass('selected');
		$(this).toggleClass("selected");
		var value = $(this).attr('value');
		$("#P1").attr("data-ship", ships[value].name.toLowerCase());
	});

	$(".submit").on("click", function() {
		$(".enemyGrid").removeClass("disabled");
		$("#info").fadeOut();
	});


	function_create_grid("P1", "Your Ships");
	function_create_grid("P2", "Your Shots");

	$(".location").hover(function() {
		var value = 0;
		var value = $('#P1').attr('data-ship');
		if (value === undefined) {
			value = "default";
		}
		console.log(value);
		var shipLen = ships[value].length;
		var j = $(this).data("val");
		if ($("#P1").hasClass("vertical")) {
			if ($(`.${j}`).attr("data-letter")[0] === $(`.${j + ((shipLen * 10) - 10)}`).attr("data-letter")[0]) {
				var overLap = false;
				for (var i = 0; i < shipLen; i++) {
					if ($(`.${j + (i * 10)}`).hasClass("placed")) {
						overLap = true;
					}
				}
				if (!overLap) {
					if ($("#P1").hasClass("vertical")) {
						var j = $(this).data("val");
						for (var i = 0; i < shipLen; i++) {
							$(`.${j + (i * 10)}`).toggleClass("placing");
						}
					}
				}
			}
		} else if ($(`.${j}`).attr("data-letter")[1] === $(`.${j + (shipLen - 1)}`).attr("data-letter")[1]) {
			var overLap = false;
			for (var i = 0; i < shipLen; i++) {
				if ($(`.${j + i}`).hasClass("placed")) {
					overLap = true;
				}
			}
			if (!overLap) {
				var j = $(this).data("val");
				for (var i = 0; i < shipLen; i++) {
					$(`.${j + i}`).toggleClass("placing");
				}
			}
		}
	});

	$(".location").click(function() {
		var value = $('#P1').attr('data-ship');
		if (value === undefined) {
			value = "default";
		}
		var shipLen = ships[value].length;
		var shipName = ships[value].name;
		var j = $(this).data("val");
		if ($("#P1").hasClass("vertical")) {
			if ($(`.${j}`).attr("data-letter")[0] === $(`.${j + ((shipLen * 10) - 10)}`).attr("data-letter")[0]) {
				var overLap = false;
				for (var i = 0; i < shipLen; i++) {
					if ($(`.${j + (i * 10)}`).hasClass("placed")) {
						overLap = true;
					}
				}
				if (!overLap) {
					for (var i = 0; i < shipLen; i++) {
						$(`.${j + (i * 10)}`).addClass("placed");
						var data = $(`.${j + (i * 10)}`).attr("data-letter");
						shipLocation.push(data);
					}
					$(".selected").fadeOut();
					$("#P1").removeAttr("data-ship");
				}
			}
		} else if ($(`.${j}`).attr("data-letter")[1] === $(`.${j + (shipLen - 1)}`).attr("data-letter")[1]) {
			var overLap = false;
			for (var i = 0; i < shipLen; i++) {
				if ($(`.${j + i}`).hasClass("placed")) {
					overLap = true;
				}
			}
			if (!overLap) {
				for (var i = 0; i < shipLen; i++) {
					$(`.${j + i}`).addClass("placed");
					var data = $(`.${j + i}`).attr("data-letter");
					shipLocation.push(data);
				}
				$(".selected").fadeOut();
				$("#P1").removeAttr("data-ship");
			}
		}
		if (shipLocation.length > 15) {
			$(".submit").removeClass("disabled", "hidden");
			$(".submit").fadeIn(1000).fadeOut(1000).fadeIn(1000).fadeOut(1000).fadeIn(1000);
		}
	});

	$(".enemyGrid").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			var shot = $(this).data("letter");
			var select = enemyShips.indexOf(shot);
			if (enemyShips.indexOf(shot) === -1) {
				$(this).addClass("miss disabled");
				$(this).removeClass("enemyGrid");
			} else {
				$(this).addClass("hit disabled");
				$(this).removeClass("enemyGrid");
				enemyShips.splice(select, 1);
			}
			var random = letters[Math.floor(Math.random() * letters.length)];
			var enemyShot = letters.indexOf(random);
			if (shipLocation.indexOf(random) === -1) {
				$(`.${random}`).addClass("miss");
				$(`.${random}`).removeClass("location");
				letters.splice(enemyShot, 1)
			} else {
				$(`.${random}`).addClass("hit");
				$(`.${random}`).removeClass("location");
				letters.splice(enemyShot, 1)
				shipLocation.splice(enemyShot, 1)
			}
			if (enemyShips.length === 0) {
				$('.winner').modal('show');
			} else if (shipLocation === 0) {
				alert("You Lose!");
			}
		}
	});

	function function_create_grid(sID, sPlayerName) {
		$("#" + sID).append("<br>" + sPlayerName + "<br>");
		var i_cnt = 0;
		for (var c in letters) {
			for (ib = 0; ib < 10; ib++) {
				//text += cars[i] + "<br>";
				var ltr = letters[c];
				var letterBtn = $("<button>"); // 2
				letterBtn.attr('data-letter', letters[c]); // 4
				letterBtn.attr('data-val', i_cnt);
				letterBtn.text(letters[c]); // 5
				letterBtn.html(letters[c]);
				letterBtn.addClass("btn location " + i_cnt + " " + letters[c]);
				if (sID === "P2") {
					letterBtn.removeClass("location " + letters[c]);
					letterBtn.addClass("disabled enemyGrid");
				}
			}
			//letterBtn.html("<br>");
			$("#" + sID).append(letterBtn); // 6
			i_cnt++;
			if (i_cnt % 10 == 0) {
				$("#" + sID).append("<br>");
			}
		}
	}


	function uidGenerator() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return ("_"+S4()+S4()+"-"+S4());
	}


});