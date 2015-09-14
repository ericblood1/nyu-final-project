//Setting Initial Variables
var pageNumber = 1;
var timer = null;
var cardsPerRow = 4; //setting this variable for future upgrades - wider screens will be able to accomdate more columns per row
var showClicks = 0;
var originalShowMoreHeight = '370px';
var originalCardsHeight = '420px';
var expandFlag = true;
var scrollFlag = true;

//Angular Filtering and custom cross filter delimited by "space"
angular.module('myApp', ['ngSanitize','firebase'])
.controller('drinksCtrl', function ($scope, $firebaseArray) {
   var ref = new Firebase('https://dapperdrinks.firebaseio.com/drinks');
   $scope.totalDrinks = $firebaseArray(ref);
	$scope.search = function (row) {
		//future upgrade - limit search fields to name and ingredients - exclude instructions
		//var searchOnlyTwoFields = angular.lowercase(row.name).indexOf($scope.searchFor|| '') !== -1 || angular.lowercase(row.ingredients).indexOf($scope.searchFor|| '') !== -1;
		var jsonStr = angular.lowercase(JSON.stringify(row));
		if ( $scope.searchFor && $scope.searchFor.trim() ) {
				var query = $scope.searchFor.trim().split(" ");
				var result = true;
				for ( var partIndex in query ) {
					if ( jsonStr.indexOf(angular.lowercase(query[partIndex])) > -1 ) {
							result = result && true;
					}
					else {
						   result = false;
					}
				}
		  return result;
		}
		else {
		  return true;
		}
	}
});



//Doc ready bindings
$(function() {
	
		//start the infinite scroll
		$(window).scroll(function () {
			if ($(document).height() - $(window).height() > 400 && scrollFlag) { //don't bother updating if the page isn't tall enough
			   if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) { // if you're at the bottom of the page
					$('#showMore').html('LOADING...');
					$('#showMore').addClass('loadingMore');
					//debounce added to account for double-registers
					clearTimeout(timer);
					timer = setTimeout(function() {
						$('#showMore').text('SHOW MORE');
						$('#showMore').removeClass('loadingMore');
						showMoreScroll();
					}, 2000);  					
			   }
			}
		});

	$('#searchBarInput').keyup(function(e) {
		function debounceComplete() {
		$('.card').off('mouseover');
		$('.card').on('mouseover',function(){
			if (this.offsetHeight < this.scrollHeight ) { // if there's overflow
				var overflowCalc = ((this.scrollHeight - this.offsetHeight) + 35)* (-1);
				if ($(this).find('.expandThisCard').length < 1 && expandFlag) { //if there's no 'expand message'
						$(this).append('<div class="expandThisCard">expand [+]</div>'); //add the message
						$('.expandThisCard').css('margin-top',overflowCalc + 'px');
						$(this).on('mouseleave',function(){
							$(this).find('.expandThisCard').remove();
							$(this).off('mouseleave');
						});
						$('.expandThisCard').on('click',function(){
							expandFlag = false; // on clicking, the mouseover won't trigger display of 'expand' until after we've left the card
							$(this).parent('.card').addClass('expandedCard');							
							$(this).remove();
							$('.expandedCard').on('mouseleave',function(){
								expandFlag = true;
								$(this).removeClass('expandedCard');
								$('.expandedCard').off('mouseleave');
							});
							$(this).off('click');
						});
						
					}
			}
		});
			
			
			//reset the 'no drinks found layer'
			if (!($('#nrf').html("no drinks found")))
				$('#nrf').html("no drinks found");
			$('.moreCard').hide();
			$('.moreCard').removeClass('moreCard');
			$('#showMore').css('margin-top',originalShowMoreHeight);
			$('#showMore').show();
			$('#cards').css('height',originalCardsHeight);
			showClicks = 0;
				if ($('.card').length > 4)
				   $('#showMore').show();
				else {
				   $('#showMore').hide();
				}
				if ($('.card').length < 1) {
					$('#showMoreResults').hide();
				} else {
					$('#showMoreResults').show();
				}
		}
		//This check is a custom built 'debounce' to match the angular debounce.
		clearTimeout(timer);
		timer = setTimeout(debounceComplete, 210);
	});
	
	//SHOW MORE CLICK
    var newRows = 0;
	
	function showMoreScroll() {
		
      showClicks++;
	  //check to determine how many additional rows to setup.
      var cardRows = Math.ceil($('.card').length / cardsPerRow);
      if (cardRows > (4 * showClicks) + 1) {
         newRows = 5;
         newRowsHeight = 4;
		 scrollFlag = true;
      }
      else {
		newRows = cardRows % 5;
		if (newRows == 0)
			newRows = 5;
        newRowsHeight = (newRows - 1)
        $('#showMore').hide();
		scrollFlag = false;
      }
       //counts the first item in a row (+1 to account for first row)
       var visibleRowCounter = ($('.rowStart').length) + 1;
       for (i = 1; i < newRows; i++) {
        col1 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1)));
        col2 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1))) + 1;
        col3 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1))) + 2;
        col4 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1))) + 3;
        colTop = 375 * (i) + ((showClicks - 1) * (375 * (newRows - 1)));
        $('.card').eq(col1).css('margin-left','20px')
        $('.card').eq(col1).css('margin-top',colTop)
        $('.card').eq(col1).show();
        $('.card').eq(col1).addClass('moreCard');
        $('.card').eq(col1).addClass('rowStart');
        $('.card').eq(col2).css('margin-left','338px')
        $('.card').eq(col2).css('margin-top',colTop)
        $('.card').eq(col2).show();
        $('.card').eq(col2).addClass('col2');		
        $('.card').eq(col2).addClass('moreCard');
        $('.card').eq(col3).css('margin-left','656px')
        $('.card').eq(col3).css('margin-top',colTop)
        $('.card').eq(col3).show();
        $('.card').eq(col3).addClass('col3');
        $('.card').eq(col3).addClass('moreCard');
        $('.card').eq(col4).css('margin-left','974px')
        $('.card').eq(col4).css('margin-top',colTop)
        $('.card').eq(col4).show();
        $('.card').eq(col4).addClass('col4');
        $('.card').eq(col4).addClass('moreCard');
       }
        var newHeightShowBtn = Number($('#showMore').css('margin-top').replace('px','')) + (375 * (newRows - 1));
        $('#showMore').css('margin-top',newHeightShowBtn + 'px');
        var newHeightCards = Number($('#cards').css('height').replace('px','')) + (375 * (newRowsHeight));
        $('#cards').css('height',newHeightCards + 'px');
	};
	
	
	
	
	$('#showMore').on('click', function()  {

      showClicks++;
	  //check to determine how many additional rows to setup.
      var cardRows = Math.ceil($('.card').length / cardsPerRow);
      if (cardRows > (4 * showClicks) + 1) {
         newRows = 5;
         newRowsHeight = 4;
		 scrollFlag = true;
      }
      else {
		newRows = cardRows % 5;
		if (newRows == 0)
			newRows = 5;
        newRowsHeight = (newRows - 1)
        $('#showMore').hide();
		scrollFlag = false;
      }
       //counts the first item in a row (+1 to account for first row)
       var visibleRowCounter = ($('.rowStart').length) + 1;
       for (i = 1; i < newRows; i++) {
        col1 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1)));
        col2 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1))) + 1;
        col3 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1))) + 2;
        col4 = (4 * i) + ((showClicks - 1) * (4 * (newRows - 1))) + 3;
        colTop = 375 * (i) + ((showClicks - 1) * (375 * (newRows - 1)));
        $('.card').eq(col1).css('margin-left','20px')
        $('.card').eq(col1).css('margin-top',colTop)
        $('.card').eq(col1).show();
        $('.card').eq(col1).addClass('moreCard');
        $('.card').eq(col1).addClass('rowStart');
        $('.card').eq(col2).css('margin-left','338px')
        $('.card').eq(col2).css('margin-top',colTop)
        $('.card').eq(col2).show();
        $('.card').eq(col2).addClass('col2');		
        $('.card').eq(col2).addClass('moreCard');
        $('.card').eq(col3).css('margin-left','656px')
        $('.card').eq(col3).css('margin-top',colTop)
        $('.card').eq(col3).show();
        $('.card').eq(col3).addClass('col3');
        $('.card').eq(col3).addClass('moreCard');
        $('.card').eq(col4).css('margin-left','974px')
        $('.card').eq(col4).css('margin-top',colTop)
        $('.card').eq(col4).show();
        $('.card').eq(col4).addClass('col4');
        $('.card').eq(col4).addClass('moreCard');
       }
        var newHeightShowBtn = Number($('#showMore').css('margin-top').replace('px','')) + (375 * (newRows - 1));
        $('#showMore').css('margin-top',newHeightShowBtn + 'px');
        var newHeightCards = Number($('#cards').css('height').replace('px','')) + (375 * (newRowsHeight));
        $('#cards').css('height',newHeightCards + 'px');
    });
	


	
	//FAVORITES SECTION
    $(document).on('click', '.star', function() {
        if ($(this).hasClass('saved')) {
            $(this).removeClass('saved');
            $(this).parent('div').find('.ephMessage').remove();
        } else {
            $(this).addClass('saved');
            $(this).before('<div class="ephMessage">saved</div>');
            setTimeout(function() {
                $('.ephMessage').remove()
            }, 2000);
        }
    });

});