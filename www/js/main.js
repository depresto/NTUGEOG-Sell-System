var product_quentity;
var product_data;
var total_price = 0;
var loc = 1;

$(document).ready(function () {
	//select product

	var location;
	switch(loc){
			case 1: location = "蘭苑";
					break;
			case 2: location = "圖書館";
					break;
			case 3: location = "活動中心";
					break;
	}
	$('header h1').append('　<b>'+location+'</b>');

	$('#list_inv').on('click','.li_inv',function(){
		id = $(this).index();
		select_num = ++product_quentity[id];
		product_name = product_data[id-1][0]+product_data[id-1][1]+product_data[id-1][2]
		product_price = product_data[id-1][3];
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

		product_price = product_data[select_id-1][3];
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
		product_price = product_data[select_id-1][3];

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
				item['name'+count] = product_data[i-1][0]+product_data[i-1][1]+product_data[i-1][2];
				item['quentity'+count] = product_quentity[i];
				item['date'+count] = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay();
				item['time'+count] = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				item['price'+count] = product_data[i-1][3];
				product_quentity[i] = 0;
				count++;
				//minus inv_count
				product_id = i-1;
				$('#inv'+product_id+' a div').text($('#inv'+product_id+' a div').text()-1);
			}
		}
		item['user'] = "test";
		item['location'] = location;
		item['type'] = 'sold';
		item['length'] = count;
		sendData(item);
		$('#list_selected').empty();
		$('#submitted').click();
	});

	$('#button-enter-inv').click(function(){
		submit =  $('form').serializeArray();
		data = {};
		for (i=0 ; i<submit.length ; i++){
			data['inv'+i] = submit[i]['value'];
		}
		data['type'] = 'enter_inv';
		data['length'] = submit.length;
		sendData(data);
	});
});

function getData(){
	var url = "https://script.google.com/macros/s/AKfycbwqmPD8aeeHt1nwt7avVs5mGvlXoR3PNoiXEAFlyYw/exec?method=read_rows";
	var local = "http://b03701118.lionfree.net/sell-system-ntugeog/get_inv.php";
	$.getJSON(url, function (data) {
		showProduct(data);
		console.log('Get data from server by google script.');
	}).fail(function (e) {
		$.getJSON(local, function (data) {
			showProduct(data);
			console.log('Get data from server by local server.');
		});
	});
}

function showProduct(data){
	product_data = data;
	data_len = data.length;
	product_quentity = new Array(data_len+1);
	setAll(product_quentity,0);
	console.log('Row:'+data_len);
	for (i=0;i<data_len;i++){
		$('#list_inv').append('<li id="inv'+i+'" class="li_inv" data-theme="c" data-icon="false">\
			<a href="#">'+data[i][0]+data[i][1]+data[i][2]+'\
				<div class="ui-li-count count-second">'+data[i][3]+'</div>\
				<div class="ui-li-count">'+data[i][5]+'</div>\
			</a>\
		</li>');
		$('#ul-enter-inv').append('<li data-theme="d" data-role="fieldcontain">\
			<label for="inv_'+i+'">'+data[i][0]+data[i][1]+data[i][2]+'</label>\
			<input type="number" name="'+i+'" id="inv_'+i+'" value="'+data[i][5]+'"/>\
		</li>');
	}
	$('#list_inv').listview('refresh');
}

function sendData(data){
	var url = "https://script.google.com/macros/s/AKfycbwqmPD8aeeHt1nwt7avVs5mGvlXoR3PNoiXEAFlyYw/dev";
	$.post(url,data, function(sell_num){
		$('#dialog div h2 span').text(sell_num);
	});
}

function setAll(arr,v) {
	for (i=0; i< arr.length; i++) {
		arr[i] = v;
	}
};
