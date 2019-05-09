var availableTags = [];
var azureSearchQueryApiKey = "F7C69DB770C13A280301D20FE4586C0D";	// this is a query key for demo purposes
var baseSearchURL = "https://azs-demos.search.windows.net/indexes/travel-stackexchange";

var facetFiltersString = [];
var facetFiltersCollection = [];
var currentPage = 1;
var documentsToRetrieve = 15;	// This is the maximum documents to retrieve / page
