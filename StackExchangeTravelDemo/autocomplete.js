$(function() {
	// Handle Enter Key
	$("#q").keydown(function(event) {
		if (event.keyCode == 13)
		{
			fullSearch($('#q').val());
			$(".ui-menu-item").hide();
		}
	});

	// Init AutoComplete
	$("#q").autocomplete({
		//autoFocus: true,
		source: function(request, resolve) {
			// fetch new values with request.term
			execSuggest(request.term, resolve);
		},
		minLength: 2,
		select: function (event, ui) {
			fullSearch(ui.item.value);
		}
	});
	
	// Load the page with data
	fullSearch("*");
});

