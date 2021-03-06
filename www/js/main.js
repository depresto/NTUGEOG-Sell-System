var product_quentity;
var product_data;
var total_price = 0;
var loc;
var user;

var INV_INDEX = [0,7,8,9,6]; //null 蘭苑存量	圖書館存量	活動中心存量	研究大樓存量
var SELL_INDEX = [0,10,11,12]; //null 蘭苑售量	圖書館售量	活動中心售量
var PRICE_INDEX = 3; //賣價
var PRODUCT_INDEX = [0,1,2]; //產品名稱

var URL_POST = "https://script.google.com/macros/s/AKfycbwqmPD8aeeHt1nwt7avVs5mGvlXoR3PNoiXEAFlyYw/dev";
var URL_GET = "https://script.google.com/macros/s/AKfycbwqmPD8aeeHt1nwt7avVs5mGvlXoR3PNoiXEAFlyYw/exec?method=read_rows";
var URL_REFRESH = "https://script.google.com/macros/s/AKfycbwqmPD8aeeHt1nwt7avVs5mGvlXoR3PNoiXEAFlyYw/exec?method=refresh_inv&loc_index=";

var refresh = null;

$(document).bind("mobileinit", function(){
	$.mobile.pushStateEnabled = false;
});

$(document).ready(function () {
	//show login page
	$.mobile.changePage('#login');
	$('#login div form button').click(function(e){
		e.preventDefault();
		$.mobile.loading( 'show', {
			text: '登入中',
			textVisible: true,
			theme: 'a',
			html: ""
		});
		loc = $('#select-location option:selected ').val();
		$('#list_inv li').not('.list_title').remove();

		var location;
		switch(loc){
			case '1': location = "蘭苑";
					break;
			case '2': location = "圖書館";
					break;
			case '3': location = "活動中心";
					break;
			case '4': location = "研究大樓";
					break;
		}
		$('header h1 span').text(location);

		getData();

		login($('#usr').val(), $('#pwd').val());
	});

	$('#list_inv').on('click','.li_inv',function(){
		id = $(this).index();
		select_num = ++product_quentity[id];
		product_name = product_data[id-1][PRODUCT_INDEX[0]]+product_data[id-1][PRODUCT_INDEX[1]]+product_data[id-1][PRODUCT_INDEX[2]];
		product_price = product_data[id-1][PRICE_INDEX];
		if (select_num == 1){
			$('#list_selected').append('<li class="li_selected" product-id="'+id+'"><a href="#" class="ul-li-has-alt-left">'+product_name+'<div class="ui-li-count">'+select_num+'</div></a><a href="#" class="ui-li-link-alt-left"></a></li>').listview('refresh');
		}else{
			$('.li_selected[product-id="'+id+'"] a div').text(select_num);
		}

		total_price += product_price;
		$('.list-bottom span').text(total_price);
	});

	//minus product
	$('#list_selected').on('click','.ul-li-has-alt-left',function(){
		select_id = $(this).parent().attr('product-id');
		select_num = --product_quentity[select_id];

		product_price = product_data[select_id-1][PRICE_INDEX];
		total_price -= product_price;
		$('.list-bottom span').text(total_price);

		if (select_num == 0){
			$(this).parent().remove();
		}else
			$('.li_selected[product-id="'+select_id+'"] a div').text(select_num);
	});

	//delete product
	$('#list_selected').on('click','.ui-li-link-alt-left',function(){
		select_id = $(this).parent().attr('product-id');
		product_price = product_data[select_id-1][PRICE_INDEX];

		select_num = product_quentity[select_id];
		total_price -= product_price * select_num;
		$('.list-bottom span').text(total_price);

		product_quentity[select_id] = 0;
		$(this).parent().remove();
	});

	//submit sales to server
	$('#sold').click(function(){
		item = {};
		data_len = product_quentity.length;
		var d = new Date();
		count = 0;
		for (i=1 ; i<data_len ; i++){
			if (product_quentity[i] != 0){
				item['id'+count] = i;
				item['name'+count] = product_data[i-1][PRODUCT_INDEX[0]]+product_data[i-1][PRODUCT_INDEX[1]]+product_data[i-1][PRODUCT_INDEX[2]];
				item['quentity'+count] = product_quentity[i];
				item['date'+count] = d.getFullYear() + "/" + (d.getMonth() +1) + "/" + d.getDate();
				item['time'+count] = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				item['price'+count] = product_data[i-1][PRICE_INDEX];
				product_id = i-1;
				product_num = $('#inv'+product_id+' .count-first').text() - product_quentity[i];
				$('#inv'+product_id+' .count-first').text(product_num);
				$('#inv_'+product_id).val(product_num);
				product_quentity[i] = 0;
				count++;
			}
		}
		item['user'] = user;
		item['loc_index'] = loc;
		item['type'] = 'sold';
		item['length'] = count;
		$('#dialog div h2 span').text('loading');
		sendData(item);
		$('#list_selected').empty();
		total_price = 0;
		$('.list-bottom span').text(total_price);
		$('#submitted').click();
	});

	$('.button-enter-inv').click(function(){
		move_loc = $('#fieldset-inv :radio:checked').val();
		if (move_loc != null){
			$('#footer-div-enter-inv span').hide();
			submit =  $('#form-enter-inv').serializeArray();
			data = {};
			data['type'] = 'move_inv';
			data['move_loc'] = move_loc;
			for (i=0 ; i<submit.length ; i++){
				data['inv'+i] = submit[i]['value'];
			}
			data['length'] = submit.length;
//			console.log(data);
			$('#dialog div h2 span').text('loading');
			$.post(URL_POST,data, function(sell_num){
				$('#dialog div h2 span').text(sell_num);
			});
			$('#inv-submitted').click();
		}else
			$('#footer-div-enter-inv span').show();
	});
});

function getData(){
	$.getJSON(URL_GET, function (data) {
		if (loc != 4)
			showProduct(data);
		else
			showInv(data);
		console.log('Get data from server by google script.');
	});
}

function showProduct(data){
	product_data = data;
	data_len = data.length;
	product_quentity = new Array(data_len+1);
	setAll(product_quentity,0);
	console.log('Row:'+data_len);
	$('.li_inv').remove();
	for (i=0;i<data_len;i++){
		$('#list_inv').append('<li id="inv'+i+'" class="li_inv" data-theme="c" data-icon="false">\
			<a href="#">'+data[i][PRODUCT_INDEX[0]]+data[i][PRODUCT_INDEX[1]]+data[i][PRODUCT_INDEX[2]]+'\
				<div class="ui-li-count count-second">'+data[i][PRICE_INDEX]+'</div>\
				<div class="ui-li-count count-first">'+data[i][INV_INDEX[loc]]+'</div>\
			</a>\
		</li>');
	}
}

function showInv(data){
	product_data = data;
	data_len = data.length;
	product_quentity = new Array(data_len+1);
	setAll(product_quentity,0);
	console.log('Row:'+data_len);
	$('.li_enter_inv').remove();
	for (i=0;i<data_len;i++){
		$('#ul-enter-inv').append('<li class="li_enter_inv" data-theme="d" data-role="fieldcontain">\
			<label for="inv_'+i+'">'+data[i][PRODUCT_INDEX[0]]+data[i][PRODUCT_INDEX[1]]+data[i][PRODUCT_INDEX[2]]+'</label>\
			<input type="number" name="'+i+'" id="inv_'+i+'" value="0"/>\
		</li>');
	}
}

function refreshInv(){
	console.log('refresh');
	$.getJSON(URL_REFRESH+loc, function (data) {
		getInv(data);
	});
}

function getInv(data){
	data_len = data.length;
	for (i=0;i<data_len;i++){
		$('#inv'+i+' .count-first').text(data[i]);
		$('#inv_'+i).val(data[i]);
		product_data[i][INV_INDEX[loc]] = data[i];
	}
}

function sendData(data){
	$.post(URL_POST,data, function(sell_num){
		var order_index = zeroPad(sell_num,10000000);
		$('#dialog div h2 span').text(order_index);
	});
}

function setAll(arr,v) {
	for (i=0; i< arr.length; i++) {
		arr[i] = v;
	}
};

function zeroPad(nr,base){
	var  len = (String(base).length - String(nr).length)+1;
	return len > 0? new Array(len).join('0')+nr : nr;
}

function login(usr, pwd){
	data = {};
	data['type'] = "login";
	data['usr'] = usr;
	data['pwd'] = pwd;
	$.post(URL_POST, data, function(e){
		console.log(e);
		if (e == "success"){
			if (loc != 4){
				$.mobile.changePage('#main');
				setRefresh(true);
			}else
				$.mobile.changePage('#set-inv');

			var list;
			if (loc != 4)
				list = $('#list_inv');
			else
				list = $('#ul-enter-inv');
			list.listview('refresh');
			console.log('list refresh');

			$('#error_msg').hide();
			$.mobile.loading( 'hide');
			user = usr;
		}
		else{
			$('#error_msg').show();
			$.mobile.loading( 'hide');
		}
	});
}

function logout(){
	$.mobile.changePage('#login');
	setRefresh(false);
}

function setRefresh(e){
	if (e == true){
		//refresh inv number per minute
		refresh = setInterval(function() {
			refreshInv();
		}, 1000 * 60 * 1);
	}else if (e == false){
		clearInterval(refresh);
	}
}
