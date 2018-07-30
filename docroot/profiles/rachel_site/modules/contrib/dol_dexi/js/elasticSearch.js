(function ($) {
    $(document).ready(function () {

        var searchInput = "";
        var sortSelect = "";
        var agencySelect = "";
        var pageNumber = "1";

        // This clears the search results before updating them
        function clearAPI() {
            $('.dexi-results').html("");
        }

        // This is what fetches the data
        function callAPI() {
            $.ajax({
                type: 'GET',
                url: '/api/v1/dol_dexi' + queryBuilder(),
                success: function (data) {
                    var totalResults = data['data']['hits']['total'];
                    var totalPages = Math.ceil(totalResults/20);
                    var shownResults = (data['data']['hits']['hits']).length;
                    var searchedValue = $('.elastic-jobs input').val();

                    var data = data['data']['hits']['hits'];

                    // Sort by date
                    if($('.elastic-sort select').val() == 'date') {
                        data.sort(function(a,b) {
                            var a = Date.parse(a._source.meta_data.last_indexed.substring(0,10));
                            var b = Date.parse(b._source.meta_data.last_indexed.substring(0,10));
                            return a - b
                        });
                    }

                    clearAPI();

                    // This shows how many items are in the results
                    $('.dexi-results').append('<span>Showing </span>' + shownResults + '<span> of </span>' + totalResults + '<span> results for "</span><strong>' + searchedValue + '</strong>"');
                    // This is what displays the data
                    data.map(function elasticResults (node) {
                        $('.dexi-results').append('' +
                            '<a href="' + node['_id'] + '">' +
                            '<div class="row dol-feed-block" style="max-width:100%;flex-wrap:nowrap">' +
                            '<div class="left-teaser-text">' +
                            '<span>' + node['_source']['meta_data']['last_indexed'] + '</span>' +
                            '<h4>' + node['_source']['indexed_content']['title'] + '</h4>' +
                            '<span>' + node['highlight']['indexed_content.body'] + '</span>' +
                            '</div>' +
                            '</div>' +
                            '</a>' +
                            '</div>'
                        );
                    });

                    if (totalResults === 0) {
                        $('.dexi-results').append('' +
                            '<div id="elastic-no-results">' +
                            '<h3>Your search did not return any results. Please try the search suggestions below.</h3>' +
                            '<br><h4>Tips for searching</h4>' +
                            '<br>' +
                            '<ul>' +
                            '<li><span>Check the spelling of your search</span></li>' +
                            '<li><span>Try a different search</span></li>' +
                            '<li><span>Try using more general words in your search</span></li>' +
                            '<li><span>View our <a href="/general/siteindex">A to Z Index</a></span></li>' +
                            '<li><span>Alternatively, you can try using the menus to find what you\'re looking for</span></li>' +
                            '</ul>' +
                            '</div>');
                        $('#pager-container').html('');
                    }
                    else {
                        $(function() {
                            $('#pagination-demo').pagination({
                                pages: totalPages,
                                displayedPages: 9,
                                edges: 1,
                                currentPage: pageNumber,
                                prevText: '<i class="fa fa-angle-left"></i>',
                                nextText: '<i class="fa fa-angle-right"></i>',
                                cssStyle: 'light-theme',
                                ellipsePageSet: false,
                                onPageClick: function (pageValue, event) {
                                    event.preventDefault();
                                    pageNumber = pageValue;
                                    callAPI();
                                    $('html, body').animate({
                                        scrollTop: $("#page-title-area").offset().top
                                    }, 1000);
                                }
                            });
                        });

                        $('#pager-container').html('<ul id="pagination-demo" class="pagination-sm"></ul>');
                    }
                }
            });
        }

        $(".elastic-jobs input").keyup(function() {
            searchInput = $(this).val();
            callAPI();
        });

        $(".elastic-sort select").change(function() {
            sortSelect = $(this).val();
            callAPI();
        });

        $(".elastic-agency select").change(function() {
            agencySelect = $(this).val();
            callAPI();
        });

        function queryBuilder() {
            return '?_format=json&sortBy=' + sortSelect + '&agency=' + agencySelect + '&search=' + searchInput + '&page=' + pageNumber;
        }

        // Prevent the form from submitting since there's no submit button
        $("#views-exposed-form-elastic-search").submit(function(e){
            e.preventDefault();
        });

    });
}(jQuery));