// ==UserScript==
// @name          iRacing Hide Unwanted Series
// @namespace     http://www.fuzzwahracing.com/p/hide-unwanted.html
// @description   Allows hiding of series and forum sections
// @include       *://members.iracing.com/jforum/forums/list.page
// @include       *://members.iracing.com/membersite/member/*
// @version       1.19.04.10.2
// @grant         none
// @copyright     2019+, fuzzwah (https://github.com/fuzzwah)
// @license       MIT; https://raw.githubusercontent.com/fuzzwah/iRacing-Hide-Unwanted/master/LICENSE
// @homepageURL   http://www.fuzzwahracing.com/p/hide-unwanted.html
// @updateURL     https://raw.githubusercontent.com/fuzzwah/iRacing-Hide-Unwanted/master/iRacing-Hide-Unwanted.user.js
// ==/UserScript==
var load, execute, loadAndExecute, executeJQuery
;(load = function(a, b, c) {
  var d
  ;(d = document.createElement('script')),
    d.setAttribute('src', a),
    b != null && d.addEventListener('load', b),
    c != null && d.addEventListener('error', c),
    document.body.appendChild(d)
  return d
}),
  (execute = function(a) {
    var b, c
    typeof a == 'function' ? (b = '(' + a + ')();') : (b = a),
      (c = document.createElement('script')),
      (c.textContent = b),
      document.body.appendChild(c)
    return c
  }),
  (loadAndExecute = function(a, b) {
    return load(a, function() {
      return execute(b)
    })
  }),
  (executeJQuery = function(a) {
    if (typeof jQuery == 'undefined') {
      var jqUrl = '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js'
      loadAndExecute(jqUrl, a)
    } else {
      execute(a)
    }
  })

executeJQuery(function() {
  // On membersite, make 'series' link always go to the road filter
  $("td.simpleNav ul li a[href='/membersite/member/Series.do']").attr(
    'href',
    '/membersite/member/Series.do?cat=2',
  )

  // Give some indication that this is not the full list on forum home.
  $('.homeLink').text('Forum List (no oval)')

  //-----------------------------------------------------
  //
  //  Show countdown timer and number registered drivers in title (contributed by @kutu)
  //
  if ('racingpaneldata' in this && racingpaneldata.session) {
    var originalTitle = document.title
    setInterval(function() {
      var numRegistered = $('#racingpanel_session_numregistered')
      var countdownTimer = $('#racingpanel_countdown_timer')
      if (numRegistered.length && countdownTimer.length) {
        document.title = numRegistered.text() + ' ' + countdownTimer.text() + ' ' + originalTitle
      } else {
        document.title = originalTitle
      }
    }, 1000)
  }

  //-----------------------------------------------------
  //
  //  Remove ovals and ineligible series from dropdown menu (contributed by @kutu)
  //
  var seriesDrop = $('#datSeriesSelectorDropdown optgroup')
  if (seriesDrop.length) {
    // remove ovals
    var eligibles = seriesDrop[0].children
    var isOvalSection
    var toRemove = []
    $.each(eligibles, function(index, value) {
      // search for oval section
      if (value.disabled) {
        if (/Oval$/.test(value.text)) isOvalSection = true
        if (/Road$/.test(value.text)) isOvalSection = false
      }

      if (isOvalSection || value.disabled || value.value == 0) {
        // if we currently in oval's section
        // or current option is disabled
        // or current option is "No matching series"
        toRemove.push(value)
      } else {
        // trim spaces
        value.text = value.text.replace(/^\s*/, '')
      }
    })

    // remove not needed options
    $.each(toRemove, function(index, value) {
      value.remove()
    })

    // remove ineligible
    seriesDrop[1].remove()

    // remove root tree and select series
    var dropdown = seriesDrop[0].parentElement
    var selectedValue = dropdown.selectedOptions[0].value
    $('#datSeriesSelectorDropdown').append(eligibles)
    seriesDrop[0].remove()
    $.each(dropdown.children, function(index, value) {
      if (value.value == selectedValue) dropdown.selectedIndex = index
    })
  }

  //-----------------------------------------------------
  //
  //  Filter the hosted sessions by road tracks.
  //      See the filter_tracks.js to generate the array.
  //
  if (window.location.pathname.indexOf('/HostedSessions.do') > 0) {
    setInterval(function() {
      while ($('.hosted_sessions_table_info').length <= 0) {
        sleep(500)
        console.log('Waiting for table to show up...')
      }

      // Change something to indicate this is filtered.
      $("tr th a[name='Track']").text('Track (road only)')

      // Generated output
      var ovalTracks = [
        11, // Stafford Motor Speedway	Full Course
        12, // Oxford Plains Speedway	
        14, // South Boston Speedway	
        15, // Concord Speedway	
        16, // USA International Speedway	
        17, // Lanier National Speedway	
        19, // Irwindale Speedway	Inner
        20, // Homestead Miami Speedway	Oval
        23, // Irwindale Speedway	Outer
        27, // Daytona International Speedway - 2007	Oval
        30, // Irwindale Speedway	Outer - Inner
        31, // Richmond Raceway	
        33, // Martinsville Speedway	
        39, // Charlotte Motor Speedway	Legends Oval
        40, // Charlotte Motor Speedway	Oval
        52, // Atlanta Motor Speedway	Legends Oval
        53, // Atlanta Motor Speedway	Oval
        94, // The Milwaukee Mile	
        101, // Bristol Motor Speedway	
        103, // Las Vegas Motor Speedway	Oval
        104, // Phoenix International Raceway - 2008	Oval
        110, // Las Vegas Motor Speedway	Legends Oval
        113, // Las Vegas Motor Speedway	Infield Legends Oval
        115, // Darlington Raceway	
        116, // Talladega Superspeedway	
        120, // Texas Motor Speedway	Legends Oval
        121, // Texas Motor Speedway	Oval
        123, // Chicagoland Speedway	
        124, // Michigan International Speedway - 2014	
        131, // New Hampshire Motor Speedway	Oval
        133, // Indianapolis Motor Speedway	Oval
        136, // Pocono Raceway - 2011	Oval
        143, // Centripetal Circuit	
        156, // Mid-Ohio Sports Car Course	Oval
        157, // Mid-Ohio Sports Car Course	Alt Oval
        161, // Thompson Speedway Motorsports Park	Oval
        162, // Dover International Speedway	
        169, // Iowa Speedway	Oval
        171, // Iowa Speedway	Legends
        172, // Iowa Speedway	Infield Legends
        178, // Indianapolis Motor Speedway	IndyCar Oval
        188, // Kentucky Speedway	Oval
        189, // Kentucky Speedway	Legends
        190, // New Smyrna Speedway	
        191, // Daytona International Speedway	Oval
        198, // Twin Ring Motegi	Oval
        201, // Langley Speedway	
        203, // Rockingham Speedway	Oval
        214, // Kansas Speedway	Oval
        222, // New Hampshire Motor Speedway	Legends
        225, // Auto Club Speedway	Oval
        232, // Lucas Oil Raceway	Oval
        235, // ISM Raceway	Oval
        236, // ISM Raceway	Oval w%2Fopen dogleg
        237, // Gateway Motorsports Park	Oval
        243, // Autodromo Nazionale Monza	Oval - Right turning
        245, // Autodromo Nazionale Monza	Oval - Left turning
        248, // Five Flags Speedway	
        256, // Southern National Motorsports Park	
        271, // The Bullring	
        273, // Eldora Speedway	
        274, // Williams Grove Speedway	
        275, // USA International Speedway	Dirt
        276, // Michigan International Speedway	
        277, // Pocono Raceway	
        279, // Volusia Speedway Park	
        286, // Myrtle Beach Speedway	
        288, // Lanier National Speedway	Dirt
        303, // Limaland Motorsports Park	
        305, // Knoxville Raceway	
        314, // The Dirt Track at Charlotte	
        320, // Kokomo Speedway	
        331, // Chili Bowl	
        335, // Charlotte Motor Speedway	Legends Oval
        338, // Charlotte Motor Speedway	Legends RC Short
        339, // Charlotte Motor Speedway	Oval
        
      ]

      function getURLParameter(url, name) {
        return (
          decodeURIComponent(
            (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [
              ,
              '',
            ])[1].replace(/\+/g, '%20'),
          ) || null
        )
      }

      // Iterate over each td that contains a link to a track, compare to known roadTracks and remove if not listed above.
      // /membersite/member/TrackDetail.do?trkid=107
      $("table tr td div div a[href*='/membersite/member/TrackDetail.do?trkid']").each(function(
        index,
      ) {
        var href = $(this).attr('href')
        var trackID = parseInt(getURLParameter(href, 'trkid'))
        var text = $(this).text()
        var isOval = -1 != $.inArray(trackID, ovalTracks)
        var isUnwantedRow = text == 'Track Info' || text == ''
        //console.log("track["+ trackID + "]: " + isOval + " - " + $(this).text())

        if (isOval && !isUnwantedRow) {
          tr = $(this)
            .parent()
            .parent()
            .parent()
            .parent()
          //console.log(tr);
          console.log('Removing track[' + trackID + ']: ' + isOval + ' - ' + text)
          tr.remove()
        }
      })
    }, 1000)
  }

  //-----------------------------------------------------
  //
  //  Only execute the following if we are on the forum list page
  //
  if (window.location.pathname.indexOf('/list.page') <= 0) return
  else console.log('Skipping forum list pruning.')

  function toggleForumRowByText(forums) {
    $.each(forums, function(index, value) {
      e = $("td:contains('" + value + "')")
      e.parent().toggle()
      console.log('Removed: ' + value)
    })
  }

  function toggleForumRowByPage(forums) {
    $.each(forums, function(index, value) {
      e = $("td a[href*='/" + value + ".page']")
      text = e.text()
      e.parent()
        .parent()
        .toggle()
      console.log('Removed: ' + value + '.page - ' + text)
    })
  }

  /**
   * Remove oval
   */
  var ovalPages = [
    '619',
    '620',
    '635',
    '621',
    '3713',
    '624',
    '2911',
    '629',
    '637',
    '623',
    '631',
    '632',
    '5511',
    '6312',
    '8711',
  ]

  toggleForumRowByPage(ovalPages)
  toggleForumRowByText(['Oval Racing'])

  // toggle back on dirt oval
  // toggleForumRowByText(['Dirt Oval Racing'])

  /**
   * Remove oval
   */
  var dirtOvalPages = [
    '13915',
    '14511',
    '13916',
    '14512',
    '13917',
    '13918',
    '13912',
    '15511',
    '13713',
    '13913',
    '13911',
    '13914',
    '15311',
  ]

  toggleForumRowByPage(dirtOvalPages)

  /******************************************************
   * OPINIONATED removal below here, just oval is above
   */
  
  /**
   * Racing and championships (selected ones only)
   */
  var racingAndChampionshipsPages = [
    '644', // world champ
    '645', // pro
    '647', // licenses, ratings and scoring
    '648', // racing your latest race
    '649', // video and screenshot showcase
    '643', // world cup of iracing
    '9711', // iracers with physical challenges
    '3511', // new tire model discussion
    '12311', // job openings
    '9111', // pinned announcements
    '10512', // iracing.com world chanmpionship grand prix
    '8311', // other gaming
    '16314', // rallycross
    '8111', // road warrior
    '10513', // VRS
    '15111', // WCS
    '16313', // world of outlaws
    '16912', // nascar ignite
    '651', // real world racing
    '17911', // indy series
    '9911', // driver swaps
    '14911', // time attack
  ]

  toggleForumRowByPage(racingAndChampionshipsPages)

  /**
   * Club and Regional
   */
  var regionalHeaders = ['Regional Competitions Discussion']
  var regionalPages = ['4111']

  toggleForumRowByText(regionalHeaders)
  toggleForumRowByPage(regionalPages)

  /**
   * Paint
   */
  var paintHeaders = ["The Paint Booth"];
  var paintPages = ["639", "640"];
  toggleForumRowByText(paintHeaders);
  toggleForumRowByPage(paintPages);

  /**
   * Technical and Help
   */
  var techPages = [
    '618', // tech - other
    '617', // camera files
    '616', // tech assist
    '6912', // linux
    '6911', // osx
    '11111', // vr
  ]
  toggleForumRowByPage(techPages)
  
  var aunzPages = [
    '608', // news
    '609', // stats
    '610', // setup
    '14311', // dirt
  ]
  toggleForumRowByPage(aunzPages)  

})
