var product_quentity;
var product_data;

$(document).ready(function () {
	//select product
	$('#list_inv').on('click','.li_inv',function(){
		product_name = $(this).text();
		product_id = $(this).index();
		select_num = ++product_quentity[product_id];
		if (select_num == 1)
			$('#list_selected').append('<li class="li_selected" product-id="'+product_id+'"><a href="#" class="ul-li-has-alt-left">'+product_name+'<div class="ui-li-count">'+select_num+'</div></a><a href="#" class="ui-li-link-alt-left"></a></li>').listview('refresh');
		else{
			$('.li_selected[product-id="'+product_id+'"] a div').text(select_num);
		}
	});

	//minus product
	$('#list_selected').on('click','.ul-li-has-alt-left',function(){
		select_id = $(this).parent().attr('product-id');
		select_num = --product_quentity[select_id];
		if (select_num == 0)
			$(this).parent().remove();
		else
			$('.li_selected[product-id="'+select_id+'"] a div').text(select_num);
	});

	//delete product
	$('#list_selected').on('click','.ui-li-link-alt-left',function(){
		select_id = $(this).parent().attr('product-id');
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
			}
		}
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
		$('#list_inv').append('<li class="li_inv" data-theme="c" data-icon="false"><a href="#">'+data[i][0]+data[i][1]+data[i][2]+'<div class="ui-li-count">'+data[i][5]+'</div></a></li>');
		$('#ul-enter-inv').append('<li data-theme="d" data-role="fieldcontain">\
			<label for="inv_'+i+'">'+data[i][0]+data[i][1]+data[i][2]+'</label>\
			<input type="number" name="'+i+'" id="inv_'+i+'" value="'+data[i][5]+'"/>\
		</li>');
	}
	$('#list_inv').listview('refresh');
}

function sendData(data){
	var url = "https://script.google.com/macros/s/AKfycbwqmPD8aeeHt1nwt7avVs5mGvlXoR3PNoiXEAFlyYw/dev";
	$.post(url,data, function(d){
		console.log(d);
	});
}

function setAll(arr,v) {
	for (i=0; i< arr.length; i++) {
		arr[i] = v;
	}
};
