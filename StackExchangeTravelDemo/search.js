function fullSearch(q)
{
	// Basically refresh page with new search
	if (q == "")
		q = "*";
	execSearch(q);
	execMultiSelectFacetQuery(q, "Tags", "tagsDiv", "collection");
	execMultiSelectFacetQuery(q, "organizations", "organizationsDiv", "collection");
	execMultiSelectFacetQuery(q, "locations", "locationsDiv", "collection");
	execMultiSelectFacetQuery(q, "keyphrases", "keyPhrasesDiv", "collection");
	
	
}

function execSearch(q)
{
	// Execute a search
	var searchAPI = baseSearchURL + "/docs?api-version=2019-05-06&$top=" + documentsToRetrieve + "&$skip=" + documentsToRetrieve * (currentPage - 1) + "&$count=true&searchMode=all&queryType=full&search=" + q;
	
	// Build up the facet filters
	// Create filter based on string fields
	var filterQuery = '';
	$( "#summaryContainer" ).html('');
	for (var facet in facetFiltersString)
	{
		if (facetFiltersString[facet].length > 0)
		{
			var subFilterQuery = "(search.in(" + facet + ", '" + facetFiltersString[facet].join() + "', ','))";
			if (filterQuery == '')
			{
				filterQuery = subFilterQuery;
			}
			else
			{
				filterQuery += " and " + subFilterQuery;
			}
		}
	}

	// Create filter based on collection fields
	for (var facet in facetFiltersCollection)
	{
		if (facetFiltersCollection[facet].length > 0)
		{
			var subFilterQuery = "(" + facet + "/any(t: (search.in(t, '" + facetFiltersCollection[facet].join() + "', ','))))";
			if (filterQuery == '')
			{
				filterQuery = subFilterQuery;
			}
			else
			{
				filterQuery += " and " + subFilterQuery;
			}
		}
	}
	
	if (filterQuery != '')
		searchAPI += "&$filter=" + filterQuery;
	
	$.ajax({
		url: searchAPI,
		beforeSend: function (request) {
			request.setRequestHeader("api-key", azureSearchQueryApiKey);
			request.setRequestHeader("Content-Type", "application/json");
			request.setRequestHeader("Accept", "application/json; odata.metadata=none");
		},
		type: "GET",
		success: function (data) {
			
			var htmlString = '';
			$( "#summaryContainer" ).html('');


			if (data.value.length > 0)
			{
				$("#docCount").html('Total Results: ' + data["@odata.count"]);
				
				for (var item in data["value"])
				{
				
					htmlString += "<div class='card m-1'><div class='row'><div class='col-md-2 p-3'><div class='card-block px-3'>";
					htmlString += "<b>Answers: </b>" + data.value[item].AnswerCount + "<br>";
					htmlString += "<b>Views: </b>" + data.value[item].ViewCount + "<br>";
					htmlString += "<b>Score: </b>" + data.value[item].Score + "<br>";
					htmlString += "<b>Upvotes: </b>" + data.value[item].Votes.UpVotes + "<br>";
					htmlString += "<b>Downvotes: </b>" + data.value[item].Votes.DownVotes + "<br>";
					
					htmlString += "</div></div><div class='col-md-10 p-3'><div class='card-block px-3'>";
					
					htmlString += "<h4 class='card-title'>" + data.value[item].Title + "</h4>";
					htmlString += "<p><b>Last Active:</b> " + data.value[item].LastActivityDate.substring(0,10) + "</h4>";
					
					var cleanedHTML = data.value[item].BodyHTML;
					
					htmlString += "<p>" + cleanedHTML + "<br>";
					
					// Add the tags collection
					for (var i = 0; i < data.value[item].Tags.length; i++)
						htmlString += "<span class='badge badge-info'>" + data.value[item].Tags[i] + "</span>&nbsp;&nbsp;";
					
					htmlString += "</p>";
					htmlString += "</div></div></div></div>";
				}
			}
			
			$( "#summaryContainer" ).append(htmlString);
		}
	});
}

function execSuggest(q, resolve)
{
	// Execute an autocomplete search to populate type ahead
	var searchAPI = baseSearchURL + "/docs/autocomplete?api-version=2019-05-06-Preview&suggesterName=sg&autocompleteMode=twoTerms&search=" + q;
	$.ajax({
		url: searchAPI,
		beforeSend: function (request) {
			request.setRequestHeader("api-key", azureSearchQueryApiKey);
			request.setRequestHeader("Content-Type", "application/json");
			request.setRequestHeader("Accept", "application/json; odata.metadata=none");
		},
		type: "GET",
		success: function (data) {
			availableTags = [];
			for (var item in data.value)
				availableTags.push(data.value[item].queryPlusText);
			resolve(availableTags);

		}
	});
}
