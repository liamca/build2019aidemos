function execMultiSelectFacetQuery(q, facetField, facetDiv, dataType)
{
	// Execute a search
	var searchAPI = baseSearchURL + "/docs?api-version=2017-11-11&queryType=full&facet=" + facetField + "&$top=0&search=" + q;
	
	// I also need to add all facet filters except the one associated with this field
	var filterQuery = '';
	for (var facet in facetFiltersString)
	{
		if ((facetFiltersString[facet].length > 0) && (facet != facetField))
		{
			var subFilterQuery = "(search.in(" + facet + ", '" + facetFiltersString[facet].join() + "', ','))";
			if (filterQuery == '')
				filterQuery = subFilterQuery;
			else
				filterQuery += " and " + subFilterQuery;
		}
	}

	// Create filter based on collection fields
	for (var facet in facetFiltersCollection)
	{
		if ((facetFiltersCollection[facet].length > 0) && (facet != facetField))
		{
			var subFilterQuery = "(" + facet + "/any(t: (search.in(t, '" + facetFiltersCollection[facet].join() + "', ','))))";
			if (filterQuery == '')
				filterQuery = subFilterQuery;
			else
				filterQuery += " and " + subFilterQuery;
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
			$( "#" + facetDiv ).html('');
			var htmlString = '';

			for (var item in data["@search.facets"][facetField])
			{
				htmlString += "<div class='col-md-12 pt-1 pl-1'>";
				htmlString += "<div class='form-check'>";
				htmlString += "<input class='form-check-input' type='checkbox' ";
				if (facetFiltersString[facetField] != undefined)
				{
					if (facetFiltersString[facetField].includes(data["@search.facets"][facetField][item].value))
						htmlString += "checked ";
				}				
				if (facetFiltersCollection[facetField] != undefined)
				{
					if (facetFiltersCollection[facetField].includes(data["@search.facets"][facetField][item].value))
						htmlString += "checked ";
				}
				htmlString += "value='' id='" + facetField + '--' + data["@search.facets"][facetField][item].value + "' onchange='onchangeMultiSelectFilter(this, \"" + dataType + "\");'>";
				htmlString += "<label class='form-check-label' for='defaultCheck1'>" + data["@search.facets"][facetField][item].value + " (" +  data["@search.facets"][facetField][item].count  + ")</label>";
				htmlString += "</div>";
				htmlString += "</div>";
			}
			
			$( "#" + facetDiv ).html(htmlString);
		}
	});
}

function onchangeMultiSelectFilter(obj, dataType)
{
	// Update if this is a selected filter or not
	var facetField = obj.id.substring(0, obj.id.indexOf("--"));
	
	// Check if this facet type has been added to facetFilters
	if (dataType == "string")
	{
		if (facetFiltersString[facetField] == undefined)
			facetFiltersString[facetField.toString()] = [];
		
		if ($(obj).is(':checked'))
			facetFiltersString[facetField.toString()].push(obj.id.substring(obj.id.indexOf("--")+2))
		else
			facetFiltersString[facetField.toString()].splice(facetFiltersString[facetField.toString()].indexOf(obj.id.substring(obj.id.indexOf("--")+2)), 1)
	} 
	else if (dataType == "collection")
	{
		if (facetFiltersCollection[facetField] == undefined)
			facetFiltersCollection[facetField.toString()] = [];
		
		if ($(obj).is(':checked'))
			facetFiltersCollection[facetField.toString()].push(obj.id.substring(obj.id.indexOf("--")+2))
		else
			facetFiltersCollection[facetField.toString()].splice(facetFiltersCollection[facetField.toString()].indexOf(obj.id.substring(obj.id.indexOf("--")+2)), 1)
	}
	
	execSearch($("#q").val());
	if (facetField != "city")
		execMultiSelectFacetQuery($("#q").val(), "city", "cityDiv", "string");
	if (facetField != "tags")
		execMultiSelectFacetQuery($("#q").val(), "tags", "tagsDiv", "collection");

}

