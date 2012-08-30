/*!
 * E-Activist 'Roll-call' plugin for jQuery
 * By Adam Lofting (http://adamlofting.com / @adamlofting)
 * Based on the jquery.eactivist-supporterlist by Dave Cranwell (http://davecranwell.com / @davecranwell)
 * - Works with NetDonor for latest donation amount
 * - Lighter than eactivist-supporterlist if you don't need time of signatures
 * Licensed under the MIT License.
 * 2012-08-27
 * version 1.0.0
 */

(function($){
	$.fn.eActivistRollcall = function(options) {
		//default settings
		var settings = {
			'token':'',
			'campaignId':0,			
			'format':'{firstName} from {country}{city} gave {currency}{amount}',			
			'dataUrl':'',
			'dataSet': 1, // dataSet 1 returns first name and country. dataSet 2 returns first name and city
			'count': 5,
			'service':'RollCall', // accepts 'RollCall' or 'FundraisingRollCall',
			'fields_to_format': ['firstname', 'city', 'country'],
			'currency_symbols_to_replace': { 'GBP':'&#163;', 'EUR': '&#8364;'}
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
				dataUrl = 'http://e-activist.com/ea-dataservice/data.service?service=' +settings.service+ '&dataSet=' +settings.dataSet+ '&contentType=json&token=' +settings.token+ '&campaignId=' +settings.campaignId+ '&callback=?';
			}

			//get the data and iterate through it
			$.getJSON(dataUrl, function(data) {
				
				if(data.rows.length){
					//create a UL with LI children for each supporter
					var listElement = $('<ul></ul>');

					for(i=0; i<data.rows.length; i++){
						if (i < settings.count) {

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
								
								// format currency symbols
								if (cleanFieldName == 'currency') {
									if (replacement in settings.currency_symbols_to_replace) {
										replacement = settings.currency_symbols_to_replace[replacement];
									}
								}

								// tidy up text display
								if ($.inArray(cleanFieldName, settings.fields_to_format) >= 0) {
									replacement = capitaliseFirstLetter(replacement);
								}

								output = output.replace(formatArray[x], replacement);
							}

							listElement.append($('<li>' + output + '</li>'));
						}
					}

					$this.append(listElement);
				}
			},'json');
		});
	};

})(jQuery);