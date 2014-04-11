var site = 1;
var bet_data = [];
var ev_data = [];
var dep = [];
var winning = 1;
var betting = 0;
var loss_streak = 0;
var win_streak = 0;
var max_loss = 0;
var max_win = 0;
var lossess = 0;
var winss = 0;
var reset_bet = 0;
var reset_steps = 0;
var marti_current_bet = 0;
var total_bets = 0;
var start_bank = 0;
var balance_now = 0;
var delayed = 0;
var start_check = 0;
var profit_now = 0;

var running = 0;

function heart_beat() {
	gui();
	load_delay();
	console.log(start_bank);

	setInterval(function () {

		bet_click();

	}, 100);
}

//-------------------------------------- scientific notation
function scientific(n) {
	n = String(n);
	var info = /([\d\.]+)e-(\d+)/i.exec(n);
	if (!info) {
		return n;
	}

	var num = info[1].replace('.', ''),
	numDecs = info[2] - 1;
	var output = "0.";
	for (var i = 0; i < numDecs; i++) {
		output += "0";
	}
	output += num;

	return output;
}

function tidy(val) {
	var fixed = 8;
	if (val > 0) {
		if (typeof val == "number")
			val = val.toFixed(fixed);
		val = val.replace(/([.].*?)0+$/, "$1");
		val = val.replace(/[.]$/, "");
		return val
	}
}

function bet_click() {
	var marti_reset_value = parseFloat($("#reset_value").val()); //value to reset to
	var marti_reset_step = parseFloat($("#reset_step").val()); //step number to reset to
	var marti_current_chance = parseFloat($("#WinChance").val());
	var hi_lo = 'lo';

	if (betting === 0 && running == 1 && reset_steps == (marti_reset_step - 1)) {

		reset_steps = 0;
		var next_bet = marti_current_bet * marti_reset_value;
		marti_current_bet = next_bet;
		next_bet = scientific(next_bet);
		$("#BetAmount").val(tidy(marti_current_bet));
		//console.log('reset_steps ' + marti_current_chance, next_bet, hi_lo);
		make_bet(marti_current_chance, next_bet, hi_lo);
		total_bets++;

	} else if (betting === 0 && running == 1 && reset_steps < marti_reset_step) {
		reset_steps++;

		var next_bet = marti_current_bet;
		next_bet = scientific(next_bet);
		$("#BetAmount").val(tidy(marti_current_bet));
		//console.log('normal_step ' + marti_current_chance, next_bet, hi_lo);
		make_bet(marti_current_chance, marti_current_bet, hi_lo);
		total_bets++;

	} else {}
}

function ping() {
	socket.on("pong", function () {
		console.log("pong")
	});
}

//-------------------------------------- increments max loss and max win display
function max_loss_streak() { // longest loss streak
	if (loss_streak > max_loss) {
		max_loss++;
	}
}

function max_win_streak() { //longest win streak
	if (win_streak > max_win) {
		max_win++;
	}
}

function load_delay() {
	setTimeout(function () {
		delayed = 1;

	}, 1500);
}

function make_bet(chance, bet, which) {
	betting = 1;
	socket.emit("bet", csrf, {
		chance : chance.toString(),
		bet : tidy(bet),
		which : which
	})
}

function bust() {
	console.log('***  Holy Fuck It Bust !!!***');
	reset_steps = 0;
	running = 0;
	winning = 1;
	$("#BetAmount").val(reset_bet);
}

socket.on('sysMsg', function (data) {
	console.log(data.Content);
});

socket.on("betResult", function (data) {

	if (delayed == 1) {
		total_bets++;
	}

	if (start_check == 0) {
		start_bank = parseFloat($("#balance").html());

		start_check = 1;
		console.log('Found start balance... ' + start_bank);

	}

	balance_now = parseFloat($("#balance").html());

	profit_now = balance_now - start_bank;

	profit_now = tidy(profit_now);

	$("#profitInput").val(profit_now);
	$("#betsInput").val(total_bets);

	if (data.STATUS == "WIN") {
		console.clear();
		marti_current_bet = reset_bet;

		console.log('Balance: ' + balance_now);
		console.log('bet: ' + data.Amount);
		console.log('chance: ' + data.Target);
		console.log('lucky: ' + data.Num);
		console.log('profit_now: ' + profit_now);

		reset_steps = 0;
		betting = 0;

		if (delayed == 1) {
			depth(loss_streak);
		}

		loss_streak = 0;
		$("#c_loss").val(loss_streak);
		win_streak++;

		var x = parseFloat(balance_now);
		var y = (data.Amount);
		y = tidy(y);

		if (delayed == 1) {
			update_graphs(x, y);
		}

	} else {
		console.clear();
		console.log('Balance: ' + balance_now);
		console.log('bet: ' + data.Amount);
		console.log('chance: ' + data.Target);
		console.log('lucky: ' + data.Num);
		console.log('profit_now: ' + profit_now);

		betting = 0;
		loss_streak++;
		$("#c_loss").val(loss_streak);
		win_streak = 0;

		var x = parseFloat(balance_now);
		var y = (data.Amount);
		y = tidy(y);

		if (delayed == 1) {
			update_graphs(x, y);
		}
	}
});

//-------------------------------------- Graphing functions

//-------------------------Looks at bet depth and passes it to array ready for bar chart.
function depth(x) {
	if (!dep[x]) {
		dep[x] = 1;
	} else {
		dep[x]++;
	}
}

function generate_graph() {
	var res = [];
	var gb = parseFloat($("#graph_length").val());
	for (var i = 0; i < bet_data.length; ++i) {
		if (res.length >= gb) {
			while (res.length > gb) {
				res.shift();
			}

			res.push([i, bet_data[i]]);

		} else {
			res.push([i, bet_data[i]]);
		}
	}

	return res;
}

function generate_ev_graph() {
	var res = [];
	var gb = parseFloat($("#graph_length").val());
	for (var i = 0; i < ev_data.length; ++i) {
		if (res.length >= gb) {
			while (res.length > gb) {
				res.shift();
			}

			res.push([i, ev_data[i]]);

		} else {
			res.push([i, ev_data[i]]);
		}
	}

	return res;
}

function generate_bar_graph() {
	var res = [];
	for (var i = 0; i < dep.length; ++i) {

		res.push([i, dep[i]]);

	}

	return res;
}

function init_keybindings(chatinput) {
	//console.log('Keybindings disabled');
}

//--------------------------------------- Local storage functions
function clearItem(key, value) {
	//console.log("Removing [" + key + ":" + value + "]");
	window.localStorage.removeItem(key);
}

function setItem(key, value) {
	//console.log("Storing [" + key + ":" + value + "]");
	window.localStorage.removeItem(key);
	window.localStorage.setItem(key, value);
	//console.log("Return from setItem" + key + ":" + value);
}

function getItem(key) {
	var value;
	//console.log('Retrieving key [' + key + ']');
	value = window.localStorage.getItem(key);
	//console.log("Returning value: " + value);
	return value;
}

//--------------------------------------- store and load functions
function loads() {
	var r1 = getItem('reset_step');
	var r2 = getItem('reset_value');

	$('#reset_step').val(r1);
	$('#reset_value').val(r2);

}

function saves() {

	var reset_steps = parseFloat($("#reset_step").val());
	var reset_values = parseFloat($("#reset_value").val());

	setItem('reset_step', reset_steps);
	setItem('reset_value', reset_values);

}

function update_graphs(balance, lucky) {

	ev_data.push(lucky);
	bet_data.push(balance);

	var data1 = generate_graph();
	var data2 = generate_ev_graph();

	var data = [{
			data : data1,
			label : "profit",
			yaxis : 1,
			color : 'green',
			lines : {
				show : true
			}
		}, {
			data : data2,
			label : "bet",
			yaxis : 2,
			color : 'red',
			lines : {
				show : true
			}
		}
	];

	var options = {
		legend : {
			position : "nw",
			noColumns : 2,
			container : $("#chartLegend")
		},
		yaxes : [{}, {
				position : "right"
			}
		]
	};

	var plotb = $.plot("#g_placeholder2", [generate_bar_graph()], {
			series : {
				color : 'blue'
			},
			bars : {
				show : true
			},
			yaxis : {},
			xaxis : {}
		});

	var plot2 = $.plot("#g_placeholder", data, options);

	plotb.setData([generate_bar_graph()]);

	plotb.setupGrid();
	plotb.draw();

}

function gui() {
	        
	//-------------------------------------- Options
	var $o_row1 = $('<div class="row"/>');

	//graph_length
	$graph_length = $('<div style="margin-left:10px;margin-right:10px"><input id="graph_length" class="input-medium search-query" value="200"/> max graph length  </div>');
	$o_row1.append($graph_length);

	var $fieldset_o = $('<div id="chipper5" style="margin-top:8px;" class="span3 control-group"/>');
	$fieldset_o.append($o_row1);

	//-------------------------------------- builds user interface
	$container = $('<div id="chipper" class="well form-search"/>');
	$container2 = $('<div id="chipper2" class="well form-search"/>');
	$containerg = $('<div id="chipperg" class="well form-search"/>');

	var $button_group = $('<div style="width:99%;" class="button_group"/>');
	var $options_group = $('<div style="background-color:rgba(35,35,35,0.9);border:2px solid; border-color: #505050;" class="button_group"/>');

	$container.append($button_group);
	$container.append($containerg);

	  
	var $run_div = $('<div background-color:rgba(35,35,35,5);border:2px solid; border-color: #999999;" class="button_inner_group"/>');

	//-------------------------------------- Outer UI buttons
	  
	$run = $('<button id="c_run" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px">Go</button>');
	$run.click(function () {
		//-----
		//Start function
		//-----
		reset_bet = parseFloat($("#BetAmount").val());
		if (isNaN(reset_bet)) {
			reset_bet = 0.00000000;
		}
		marti_current_bet = reset_bet;
		running = 1;
	});
	  
	$run_div.append($run);

	$store = $('<button id="c_run" style="color:blue;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px">Store</button>');
	$store.click(function () {
		//-----
		saves();
		//-----
	});
	  
	$run_div.append($store);
	 

	$load = $('<button id="c_run" style="color:blue;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px">Load</button>');
	$load.click(function () {
		//-----
		loads();
		//-----
	});
	  
	$run_div.append($load);
	      
	$Stop = $('<button id="c_stop" style="color:red;margin-bottom:5px;margin-top:5px;height:22px">Stop</button>');
	  
	$Stop.click(function () {
		//-----
		//Stop function
		//-----
		running = 0;
		console.log('running = 0' + '\n');
		steps = 0;
	});
	  
	$run_div.append($Stop);

	$showhidetrigger3 = $('<button title="Toggles bot graph" class="btn btn-small bet_btn" style="margin-right:10px;border:1px solid" id="showhidetrigger3" href="#">profit/bet</button>'); //toggle hide for graph
	  
	$showhidetrigger3.click(function () {
		$('#chipper3').toggle(500);
		$.plot($("#g_placeholder"), [
				[]
			]);
	});
	  
	$container.append($showhidetrigger3);

	$showhidetrigger3 = $('<button title="Toggles bot depth graph" class="btn btn-small bet_btn" style="margin-right:10px;border:1px solid" id="showhidetrigger4" href="#">depth</button>'); //toggle hide for graph
	  
	$showhidetrigger3.click(function () {
		$('#chipperb4').toggle(500);
		$.plot($("#g_placeholder2"), [
				[]
			]);
	});
	  
	$container.append($showhidetrigger3);

	$showhidetrigger4 = $('<button title="Toggles bot option gui" class="btn btn-small bet_btn" style="margin-right:10px;border:1px solid" id="showhidetrigger4" href="#">options</button>'); //toggle hide for options
	  
	$showhidetrigger4.click(function () {
		$('#chipper5').toggle(500);
	});
	  
	$container.append($showhidetrigger4);

	$container.append($fieldset_o);

	//-------------------------------------- Inner UI input boxes


	var $row1d = $('<div style="margin-top:15px" class="span3 control-group"/>'); ////////////////////////////////////// row 1d


	var $reset_step = $('<label style="padding:5px;text-align:right;font-weight:bold;width:80px" for="WinChance">reset step</label>');
	  
	$reset_stepInput = $('<input type="text" value="7" placeholder="7" class="input-small search-query" id="reset_step">');
	 
	$row1d.append($reset_step);
	  
	$row1d.append($reset_stepInput);

	var $row1e = $('<div style="margin-top:15px" class="span3 control-group"/>'); ////////////////////////////////////// row 1e


	var $current_loss = $('<label style="padding: 5px; text-align: right; font-weight: bold; width: 80px" for="WinChance">cur loss</label>');
	  
	$current_lossInput = $('<input type="text" value="0" placeholder="0" class="input-small search-query" id="c_loss">');
	  
	$row1e.append($current_loss);
	  
	$row1e.append($current_lossInput);
	  

	var $row2d = $('<div class="span3 control-group"/>'); ////////////////////////////////////// row 2d

	  
	var $reset_value = $('<label style="padding: 5px; text-align: right; font-weight: bold; width: 80px" for="WinChance">reset mult</label>');
	  
	$reset_valueInput = $('<input type="text" value="2.1" placeholder="2.1" class="input-small search-query" id="reset_value">');
	  
	$row2d.append($reset_value);
	  
	$row2d.append($reset_valueInput);

	var $row3a = $('<div class="span3 control-group"/>'); ///////////////////////////////// row 3a

	  
	var $bets = $('<label style="padding: 5px; text-align: right; font-weight: bold; width: 80px" for="WinChance">total bets</label>');
	  
	$betsInput = $('<input type="text" value="0" placeholder="0" class="input-small search-query" id="betsInput">');
	  
	$row3a.append($bets);
	  
	$row3a.append($betsInput);

	var $row3c = $('<div class="span3 control-group"/>'); ////////////////////////////////////////////// row 3c

	  
	var $profit = $('<label style="padding: 5px; text-align: right; font-weight: bold; width: 80px" for="WinChance">Profit</label>');
	  
	$profitInput = $('<input type="text" value="0.00000000" placeholder="0.00000000" class="input-small search-query" id="profitInput">');
	  
	$row3c.append($profit);
	  
	$row3c.append($profitInput);

	//-------------------------------------- Graph Div
	var $graphDiv = $('<fieldset class="span3 control-group" id="chipper3" class="graph-container"><div style="width:500px;height:150px" id="g_placeholder" class="graph-placeholder"></div>'); //graph holder

	var $legends = $('</br><div id="chartLegend" style="float:right;margin-right:10px;border:2px solid; border-color: #999999;" ></div>');

	var $graphDiv2 = $('<fieldset class="span3 control-group" id="chipperb4" class="graph-container2"><div style="width:500px;height:100px" id="g_placeholder2" class="graph-placeholder2"></div>'); //graph holder

	//-------------------------------------- Putting it all together


	var $fieldset4 = $('<fieldset />');
	$fieldset4.append($run_div);

	var $fieldset = $('<fieldset />');
	$fieldset.append($row1d);
	$fieldset.append($row1e);

	var $fieldset2 = $('<fieldset />');
	$fieldset2.append($row2d);
	$fieldset2.append($fieldset4);

	var $fieldset3 = $('<fieldset />');
	$fieldset3.append($row3a);
	$fieldset3.append($row3c);

	$button_group.append($fieldset);
	$button_group.append($fieldset2);
	$button_group.append($fieldset3);

	$containerg.append($graphDiv);
	$button_group.append($legends);
	$containerg.append($graphDiv2);
	
	$show_bot = $('<button title="Toggles bot option gui" class="btn btn-small bet_btn" style="margin-right:10px;border:1px solid" id="show_bot" href="#">Bot</button>');
	  
	$show_bot.click(function () {
		$('#chipper').toggle(500);
	});
	  
	$('.form-search').after($show_bot);

	//-------------------------------------- Add ui elements to page     
	$('.form-search').after($container);

	  

	//-------------------------------------- Hide Graph and options Div
	$(document).ready(function () { // toggle hide function for graph
		$('#chipper').hide();
		$('#chipper3').hide();
		$('#chipperb4').hide();
		$('#chipperb5').hide();
		$('#chipper5').hide();
	});

	//$('body').css('background-image', 'url(https://www.openmerchantaccount.com/img/1403471.jpg)');

};

$(document).ready(function () {

	console.log('Bet like its your last day alive.');

	heart_beat();
});
