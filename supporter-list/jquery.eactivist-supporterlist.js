/*!
 * E-Activist campaign supporter list plugin for jQuery
 * Copyright (c) 2011 Dave Cranwell (http://davecranwell.com / @davecranwell)
 * Licensed under the MIT License.
 * 2011-12-13
 * version 1.1.
 */

 (function($){
	$.fn.eActivistSupporterlist = function(options) {
		//default settings
		var settings = {
			'token':'',
			'campaignId':0,
			'count':5,
			'format':'{forename} from {town}, {datetime} {ago}',
			'agoFormat':'datetime',
			'agoText':'ago',
			'agoFormatLabelsSingular': ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'],
			'agoFormatLabelsPlural': ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'],
			'dataUrl':''
		}
		
		//simple function to make Capital Case
		function capitaliseFirstLetter(string){
			var newstring = string.toLowerCase();
			return newstring.charAt(0).toUpperCase() + newstring.slice(1);
		}

		return this.each(function() {
			var $this = $(this);
			
			//extend options in standard way
			if (options) {
				$.extend(settings, options);
			}
			
			//parse format
			var formatArray = settings.format.match(/\{[^/}]*\}/g);
			
			//useful mainly for testing. allows you to specify an alternate URL at which json data can be found
			if(settings.dataUrl.length){
				dataUrl = settings.dataUrl;
			}else{
				dataUrl = 'http://e-activist.com/ea-dataservice/data.service?service=EaEmailAOTarget&startRow=0&endRow=' +settings.count+ '&contentType=json&token=' +settings.token+ '&campaignId=' +settings.campaignId
			}
			
			//get the data and iterate through it
			$.getJSON(dataUrl, function(data) {
				
				//get current date (taking into consideration user's timezone) for optional agoFormat-ing
				var nowDate = new Date();
				/* EN's API ought to return UTC timestamps but actually doesn't. Its returning EU/London e.g a timestamp which INCLUDES BST, which it shouldn't. This adjustment below is therefore not necessary.

				var nowTime = nowDate.getTime();
				localisedTimestamp = nowTime + (nowDate.getTimezoneOffset() * 60000);
				nowDate = new Date(localisedTimestamp);
				*/
				
				if(data.rows.length){
					//create a UL with LI children for each supporter
					var listElement = $('<ul></ul>');

					for(i=0; i<data.rows.length; i++){
						//placeholder to put the actual content in
						var output = settings.format;

						//find fields chosen by user in settings.format
						for(x=0; x<formatArray.length; x++){
							
							var cleanFieldName = formatArray[x].replace(/\{|\}/g ,'').toLowerCase();
							var replacement = "";
							
							for(j=0; j<data.rows[i].columns.length; j++){
								if(data.rows[i].columns[j].name.toLowerCase() == cleanFieldName){
									replacement = data.rows[i].columns[j].value;
								}
							}
							
							//if this is the 'ago' field
							if(cleanFieldName == 'ago'){
								replacement = settings.agoText;
							}

							//check whether this is a date field to be "ago" formatted
							if(cleanFieldName == settings.agoFormat){								
								//IE<9 is speshal and doesn't support ISO-8601, so reformat ISO date to something it does 
								var actionDate = Date.parse(replacement.replace(/\-/g,'/').replace(/[^0-9\/\:]/g,' '));
								var agoVal = 0;
								
								var secs = Math.floor((nowDate - actionDate)/1000);
								var mins = Math.floor(secs /60);
								var hrs = Math.floor(mins / 60);
								var days = Math.floor(hrs / 24);
								var weeks = Math.floor(days / 7);
								var months = Math.floor(days / 30);
								var years = Math.floor(days / 365);
								
								if(years > 1){
									agoVal = years;
									formatLabel = 0;
								}else if (months > 1){
									agoVal = months;
									formatLabel = 1;
								}else if (weeks > 1){
									agoVal = weeks;
									formatLabel = 2;
								}else if (days > 1){
									agoVal = days;
									formatLabel = 3;
								}else if (hrs > 1){
									agoVal = hrs;
									formatLabel = 4;
								}else if (mins > 1){
									agoVal = mins;
									formatLabel = 5;
								}else{
									agoVal = secs;
									formatLabel = 6;
								}
								
								replacement = String(agoVal) + ' ' + ((agoVal != 1) ? settings.agoFormatLabelsPlural[formatLabel] : settings.agoFormatLabelsSingular[formatLabel]);
							}

							output = output.replace(formatArray[x], replacement);
						}

						listElement.append($('<li>' + output + '</li>'));
					}
				
					$this.append(listElement);
				}
			},'json');
		});
	};
	
})(jQuery);