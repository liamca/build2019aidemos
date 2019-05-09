$(function() {
	$('#pagination').bootpag({
		total: 1000,          // You may wish to dynamically change this based on $count coming back from search service
		page: 1,            
		maxVisible: 5,     
		leaps: true,
		href: "#result-page-{{number}}",
	});
	
	//This is a small fix to allow support for Bootstrap 4
	$('#pagination li').addClass('page-item');
	$('#pagination a').addClass('page-link');

	//page click action
	$('#pagination').on("page", function(event, num){
		currentPage = num;
		fullSearch($("#q").val());
	});
});
