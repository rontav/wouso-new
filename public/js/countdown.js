jQuery.fn.anim_progressbar = function (aOptions) {

  // def values
  var iCms = 1000;
  var iMms = 60 * iCms;
  var iHms = 3600 * iCms;
  var iDms = 24 * 3600 * iCms;

  // Get countdown time, in seconds, from 'data-time' attribute and
  // tansform in miliseconds
  var time = $(this).data('time') * iCms

  // def options
  var aDefOpts = {
    start: new Date(), // now
    finish: new Date().setTime(new Date().getTime() + time),
    interval: 100
  }
  var aOpts = jQuery.extend(aDefOpts, aOptions);
  var vPb = this;

  // each progress bar
  return this.each(
    function() {
      var iDuration = aOpts.finish - aOpts.start;

      // calling original progressbar
      $(vPb).children('.pbar').progressbar().attr('id', 'pbar');

      // looping process
      var vInterval = setInterval(function() {
        var iLeftMs = aOpts.finish - new Date(); // left time in MS
        var iElapsedMs = new Date() - aOpts.start, // elapsed time in MS

        iDays = parseInt(iLeftMs / iDms),
        iHours = parseInt((iLeftMs - (iDays * iDms)) / iHms),
        iMin = parseInt((iLeftMs - (iDays * iDms) - (iHours * iHms)) / iMms),
        iSec = parseInt((iLeftMs - (iDays * iDms) - (iMin * iMms) - (iHours * iHms)) / iCms),
        iPerc = (iElapsedMs > 0) ? iElapsedMs / iDuration * 100 : 0;

        // format clock to two digits
        iMin = ('0' + iMin).slice(-2);
        iSec = ('0' + iSec).slice(-2);

        // make sure time is always included
        var pbarWidth = document.getElementById('pbar').offsetWidth;
        if (pbarWidth * iPerc / 100 < 60)
          iPerc = '60px'
        else
          iPerc = iPerc + '%'

        // display current positions and progress
        //$(vPb).children('.percent').html('<b>'+iPerc.toFixed(1)+'%</b>');
        //$(vPb).children('.elapsed').html(iDays+' days '+iHours+'h:'+iMin+'m:'+iSec+'s</b>');
        $(vPb).children('.elapsed').html(iMin+':'+iSec+'</b>');
        $(vPb).children('.pbar').children('.ui-progressbar-value').css('width', iPerc).css('text-align', 'right').html(iMin + ':' + iSec);

        // in case of Finish
        if (parseInt(iPerc.substring(0,3)) >= 100) {
          clearInterval(vInterval);
          $(vPb).children('.percent').html('<b>100%</b>');
          $(vPb).children('.pbar').children('.ui-progressbar-value').css('text-align', 'right').html('--:--');

          // Call timeout function if available
          if (typeof do_on_timeout == 'function')
            do_on_timeout()
        }
      }, aOpts.interval)
    }
  )
}

// from second #5 till 15
var iNow = new Date().setTime(new Date().getTime() + 5 * 1000) // now plus 5 secs
var iEnd = new Date().setTime(new Date().getTime() + 15 * 1000) // now plus 15 secs
