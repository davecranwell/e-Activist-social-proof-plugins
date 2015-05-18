/*!
 * Engaging Networks (E-Activist and Netdonor) thermometer plugin for jQuery
 * Copyright (c) 2011 Dave Cranwell (http://davecranwell.com / @davecranwell)
 * Extended 2012 by Adam Lofting (http://adamlofting.com / @adamlofting)
 * Licensed under the MIT License.
 * 2011-09-05
 * version 1.1.1
 */

 (function($){
	$.fn.eActivistThermometer = function(options) {
		//default settings
		var settings = {
			'token':'',
			'campaignId':0,
			'target':0,
			'duration':2000,
			'dataUrl':'',
			'initialValue':0,
			'service':'EaEmailAOTarget', // Accepts 'EaEmailAOTarget' or 'NetDonor'
			'currencySymbol':'' // only required for NetDonor (&#163; = £)
		};
		
		//necessary for thousands format
		function formatNumberThousands(number) {
			return Math.max(0, number).toFixed(0).replace(/(?=(?:\d{3})+$)(?!^)/g, ',');
		}

		return this.each(function() {
			var $this = $(this);
			
			//extend options in standard way
			if (options) {
				$.extend(settings, options);
			}
			
			//useful mainly for testing. allows you to specify an alternate URL at which json data can be found
			if(settings.dataUrl.length){
				dataUrl = settings.dataUrl;
			}else{
				dataUrl = 'http://e-activist.com/ea-dataservice/data.service?service=' + settings.service + '&resultType=summary&contentType=json&token=' + settings.token + '&campaignId=' + settings.campaignId + '&callback=?';
			}
			
			//get the data and iterate through it
			$.get(dataUrl, function(data) {
								
				//switch between registration data or donation data depending on current use
				if (settings.service === 'NetDonor') {
					targetDataColumn = 'total amount donated';
				} else {
					// stardard campaigns thermometer
					targetDataColumn = 'registrations';
				}
				
				//find array location of 'targetDataColumn' col, which may change between campaigns/requests
				var regRow = -1;
				for(j=0; j<data.rows[0].columns.length; j++){
					if(data.rows[0].columns[j].name.toLowerCase() === targetDataColumn){
						regRow=j;
					}
				}
				
				//total all the registrations/donations across all campaign rows returned (if more than one campaign supplied)
				//initialValue can be used to 'rig' the starting amount e.g to include figures from external sources
				var totalCampaignsCount = settings.initialValue;
				for(i=0; i<data.rows.length; i++){
					totalCampaignsCount += parseInt(data.rows[i].columns[regRow].value);
				}
				
				//calculate final size of "t_level" element
				var thermBodyWidth = $('.t_body', $this).width();
				var levelFinalWidthPercentage = Math.ceil(totalCampaignsCount / parseInt(settings.target) * 100/1);
				//reset to 100% if over 100%
				if(levelFinalWidthPercentage > 100) levelFinalWidthPercentage=100;
				var levelFinalWidthPx =  Math.ceil(parseInt(levelFinalWidthPercentage) / 100 * thermBodyWidth /1);
				
				if(levelFinalWidthPx < (thermBodyWidth / 2)){
					//put total next to level it if there is space
					$('.t_body .t_current', $this).removeClass("inner");
				}else{
					//put total inside it
					$('.t_body .t_current', $this).addClass("inner");
				}
				
				//update counts/targets
				$('.t_target', $this).html(settings.currencySymbol + formatNumberThousands(settings.target));
				$('.t_current', $this).html(settings.currencySymbol + formatNumberThousands(totalCampaignsCount) + " ");
				
				if(settings.duration){
					//animate counter of registrations
					var x = 1;
					var interval = setInterval(
						function(){
							x = parseInt(x) + Math.ceil((totalCampaignsCount/settings.duration) * 100);
							
							if(x >= totalCampaignsCount){
								x = totalCampaignsCount; 
								clearInterval(interval);
							}
							$('.t_body .t_current', $this).html(settings.currencySymbol + formatNumberThousands(x));
						},
					100);
					
					//animate thermometer level
					$('.t_level', $this).animate({
						width: levelFinalWidthPercentage + "%"
					}, settings.duration, function() {
						// Animation complete.
					});
				}else{
					$('.t_level', $this).css("width", levelFinalWidthPercentage + "%");
				}
			},'json');
		});
	};
	
})(jQuery);