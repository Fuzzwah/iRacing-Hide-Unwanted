// ==UserScript==
// @name          iRacing Hide Unwanted Series
// @namespace     http://iracing.fuzzwah.com/p/hide-unwanted.html
// @description   Allows hiding of series and forum sections
// @include       *://members.iracing.com/jforum/forums/list.page
// @include       *://members.iracing.com/membersite/member/*
// @version       1.22.03.11.1
// @grant         none
// @copyright     2019+, fuzzwah (https://github.com/fuzzwah)
// @license       MIT; https://raw.githubusercontent.com/fuzzwah/iRacing-Hide-Unwanted/master/LICENSE
// @homepageURL   http://iracing.fuzzwah.com/p/hide-unwanted.html
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

      var dirt_ovalTracks = [
        273, // Eldora Speedway
        274, // Williams Grove Speedway
        275, // USA International Speedway - Dirt
        279, // Volusia Speedway Park
        287, // Bristol Motor Speedway - Dirt
        288, // Lanier National Speedway - Dirt
        303, // Limaland Motorsports Park
        305, // Knoxville Raceway
        314, // The Dirt Track at Charlotte
        320, // Kokomo Speedway
        331, // Chili Bowl
        344, // Fairbury Speedway
        351, // Lernerville Speedway
        373, // Weedsport Speedway
        387, // Cedar Lake Speedway
        438, // Federated Auto Parts Raceway at I-55
      ]

      var dirt_roadTracks = [
        290, // Brands Hatch Circuit - Rallycross
        293, // [Legacy] Daytona International Speedway - 2008 - Rallycross Long
        295, // Iowa Speedway - Rallycross
        296, // [Legacy] Daytona International Speedway - 2008 - Rallycross Short
        304, // Lucas Oil Raceway - Rallycross
        306, // [Legacy] Phoenix Raceway - 2008 - Rallycross
        312, // Sonoma Raceway - Rallycross
        322, // Atlanta Motor Speedway - Rallycross Short
        323, // Atlanta Motor Speedway - Rallycross Long
        332, // Wild West Motorsports Park
        334, // Wild Horse Pass Motorsports Park
        358, // Lånkebanen (Hell RX) - Hell Rallycross
        359, // Lånkebanen (Hell RX) - Club
        360, // Lånkebanen (Hell RX) - Rallycross Short
        382, // Crandon International Raceway - Full
        383, // Crandon International Raceway - Short
        385, // Charlotte Motor Speedway - Rallycross
        386, // Circuit de Barcelona-Catalunya - Rallycross
        396, // Bark River International Raceway
      ]

      var ovalTracks = [
        11, // Stafford Motor Speedway - Full Course
        12, // Oxford Plains Speedway
        14, // South Boston Speedway
        15, // Concord Speedway
        16, // USA International Speedway - Asphalt
        17, // Lanier National Speedway - Asphalt
        19, // Irwindale Speedway - Inner
        20, // Homestead Miami Speedway - Oval
        23, // Irwindale Speedway - Outer
        27, // [Legacy] Daytona International Speedway - 2008 - Oval
        30, // Irwindale Speedway - Outer - Inner
        31, // Richmond Raceway
        33, // Martinsville Speedway
        39, // [Legacy] Charlotte Motor Speedway - 2008 - Legends Oval
        40, // [Legacy] Charlotte Motor Speedway - 2008 - Oval
        52, // Atlanta Motor Speedway - Legends Oval
        53, // Atlanta Motor Speedway - Oval
        94, // The Milwaukee Mile
        101, // Bristol Motor Speedway - Dual Pit Roads
        103, // Las Vegas Motor Speedway - Oval
        104, // [Legacy] Phoenix Raceway - 2008 - Oval
        110, // Las Vegas Motor Speedway - Legends Oval
        113, // Las Vegas Motor Speedway - Infield Legends Oval
        115, // Darlington Raceway
        116, // Talladega Superspeedway
        120, // [Legacy] Texas Motor Speedway - 2009 - Legends Oval
        121, // [Legacy] Texas Motor Speedway - 2009 - Oval
        123, // Chicagoland Speedway
        124, // [Legacy] Michigan International Speedway - 2009
        131, // New Hampshire Motor Speedway - Oval
        133, // Indianapolis Motor Speedway - Oval
        136, // [Legacy] Pocono Raceway - 2009 - Oval
        143, // Centripetal Circuit
        156, // Mid-Ohio Sports Car Course - Oval
        157, // Mid-Ohio Sports Car Course - Alt Oval
        161, // Thompson Speedway Motorsports Park - Oval
        162, // Dover International Speedway
        169, // Iowa Speedway - Oval
        171, // Iowa Speedway - Legends
        172, // Iowa Speedway - Infield Legends
        178, // Indianapolis Motor Speedway - IndyCar Oval
        188, // [Legacy] Kentucky Speedway - 2011 - Oval
        189, // [Legacy] Kentucky Speedway - 2011 - Legends
        190, // New Smyrna Speedway
        191, // Daytona International Speedway - Oval
        198, // Twin Ring Motegi - Oval
        201, // Langley Speedway
        203, // Rockingham Speedway - Oval
        214, // Kansas Speedway - Oval
        222, // New Hampshire Motor Speedway - Legends
        225, // Auto Club Speedway - Oval
        232, // Lucas Oil Raceway - Oval
        235, // Phoenix Raceway - Oval
        236, // Phoenix Raceway - Oval w/open dogleg
        237, // World Wide Technology Raceway - Oval
        243, // Autodromo Nazionale Monza - Oval - Right turning
        245, // Autodromo Nazionale Monza - Oval - Left turning
        248, // Five Flags Speedway
        256, // Southern National Motorsports Park
        271, // The Bullring
        276, // Michigan International Speedway
        277, // Pocono Raceway
        286, // Myrtle Beach Speedway
        335, // Charlotte Motor Speedway - Legends Oval - 2018
        339, // Charlotte Motor Speedway - Oval - 2018
        357, // Texas Motor Speedway - Oval
        362, // Homestead Miami Speedway - IndyCar Oval
        364, // Texas Motor Speedway - Legends Oval
        365, // Bristol Motor Speedway - Single Pit Roads
        366, // North Wilkesboro Speedway - 1987
        371, // Kentucky Speedway - Oval
        374, // Nashville Fairgrounds Speedway - Oval
        380, // Nashville Fairgrounds Speedway - Mini
        384, // IRacing Superspeedway
        400, // Nashville Superspeedway
        414, // Hickory Motor Speedway
        418, // Phoenix Raceway - Oval
        419, // Phoenix Raceway - Oval w/open dogleg        
      ]

      var roadTracks = [
        1, // [Legacy] Lime Rock Park - 2008 - Full Course
        2, // Virginia International Raceway - Full Course
        3, // Virginia International Raceway - Patriot
        4, // Virginia International Raceway - North
        5, // Virginia International Raceway - Grand West
        6, // Virginia International Raceway - Grand East
        7, // Virginia International Raceway - South
        8, // Summit Point Raceway - Jefferson Circuit
        9, // Summit Point Raceway - Summit Point Raceway
        18, // Road America - Full Course
        21, // Homestead Miami Speedway - Road Course A
        22, // Homestead Miami Speedway - Road Course B
        24, // Summit Point Raceway - Short
        26, // [Legacy] Daytona International Speedway - 2008 - Road Course
        28, // [Legacy] Daytona International Speedway - 2008 - Moto
        29, // [Legacy] Daytona International Speedway - 2008 - Short
        34, // [Legacy] Lime Rock Park - 2008 - Chicane
        37, // [Legacy] Charlotte Motor Speedway - 2008 - Road Course
        38, // [Legacy] Charlotte Motor Speedway - 2008 - Infield Road Course
        41, // [Legacy] Silverstone Circuit - 2008 - Grand Prix
        42, // [Legacy] Silverstone Circuit - 2008 - Historical Grand Prix
        43, // [Legacy] Silverstone Circuit - 2008 - International
        44, // [Legacy] Silverstone Circuit - 2008 - National
        45, // [Legacy] Silverstone Circuit - 2008 - Southern
        46, // Barber Motorsports Park - Full Course
        47, // WeatherTech Raceway at Laguna Seca - Full Course
        48, // Sonoma Raceway - Cup Historic
        49, // Sonoma Raceway - IndyCar pre-2008
        50, // Road America - Bend
        51, // Atlanta Motor Speedway - Road Course
        95, // Sebring International Raceway - International
        96, // Sebring International Raceway - Modified
        97, // Sebring International Raceway - Club
        98, // Sonoma Raceway - Cup
        99, // Barber Motorsports Park - Short A
        100, // Barber Motorsports Park - Short B
        102, // Sonoma Raceway - IndyCar 2008-2011
        105, // [Legacy] Phoenix Raceway - 2008 - Road Course
        106, // Watkins Glen International - Cup
        107, // Watkins Glen International - Boot
        108, // Watkins Glen International - Classic Boot
        109, // Watkins Glen International - Classic
        111, // Las Vegas Motor Speedway - Road Course Long
        112, // Las Vegas Motor Speedway - Road Course Short
        114, // Las Vegas Motor Speedway - Road Course Combined
        117, // [Legacy] Texas Motor Speedway - 2009 - Road Course Long
        118, // [Legacy] Texas Motor Speedway - 2009 - Road Course Short A
        119, // [Legacy] Texas Motor Speedway - 2009 - Road Course Short B
        122, // [Legacy] Texas Motor Speedway - 2009 - Road Course Combined
        126, // Road Atlanta - Club
        127, // Road Atlanta - Full Course
        128, // Road Atlanta - Short
        129, // New Hampshire Motor Speedway - Road Course
        130, // New Hampshire Motor Speedway - Road Course with North Oval
        132, // New Hampshire Motor Speedway - Road Course with South Oval
        134, // Indianapolis Motor Speedway - Road Course
        135, // Indianapolis Motor Speedway - Bike
        137, // [Legacy] Pocono Raceway - 2009 - East
        138, // [Legacy] Pocono Raceway - 2009 - South
        139, // [Legacy] Pocono Raceway - 2009 - North
        140, // [Legacy] Pocono Raceway - 2009 - International
        141, // Virginia International Raceway - Patriot Reverse
        142, // Summit Point Raceway - Jefferson Reverse
        144, // Canadian Tire Motorsports Park
        145, // Brands Hatch Circuit - Grand Prix
        146, // Brands Hatch Circuit - Indy
        147, // Circuit Park Zandvoort - Chicane
        148, // Circuit Park Zandvoort - Club
        149, // Circuit Park Zandvoort - Grand Prix
        150, // Circuit Park Zandvoort - National
        151, // Circuit Park Zandvoort - Oostelijk
        152, // Phillip Island Circuit
        153, // Mid-Ohio Sports Car Course - Full Course
        154, // Mid-Ohio Sports Car Course - Chicane
        155, // Mid-Ohio Sports Car Course - Short
        158, // WeatherTech Raceway at Laguna Seca - School
        159, // Summit Point Raceway - School
        160, // [Legacy] Lime Rock Park - 2008 - School
        163, // Circuit de Spa-Francorchamps - Grand Prix Pits
        164, // Circuit de Spa-Francorchamps - Classic Pits
        165, // Circuit de Spa-Francorchamps - Endurance
        166, // Okayama International Circuit - Full Course
        167, // Okayama International Circuit - Short
        168, // Suzuka International Racing Course - Grand Prix
        170, // Iowa Speedway - Road Course
        173, // Suzuka International Racing Course - Moto
        174, // Suzuka International Racing Course - East
        175, // Suzuka International Racing Course - West
        176, // Suzuka International Racing Course - West w/chicane
        179, // Long Beach Street Circuit
        180, // Oulton Park Circuit - International
        181, // Oulton Park Circuit - Fosters
        182, // Oulton Park Circuit - Island
        183, // Oulton Park Circuit - Intl w/out Hislop
        184, // Oulton Park Circuit - Intl w/out Brittens
        185, // Oulton Park Circuit - Intl w/no Chicanes
        186, // Oulton Park Circuit - Fosters w/Hislop
        187, // Oulton Park Circuit - Island Historic
        192, // Daytona International Speedway - Road Course
        193, // Daytona International Speedway - Moto
        194, // Daytona International Speedway - Short
        195, // Twin Ring Motegi - Grand Prix
        196, // Twin Ring Motegi - East
        197, // Twin Ring Motegi - West
        199, // Circuit Zolder - Grand Prix
        200, // Circuit Zolder - Alternate
        202, // Oran Park Raceway - Grand Prix
        204, // Rockingham Speedway - Road Course
        205, // Rockingham Speedway - Infield Road Course
        206, // Rockingham Speedway - Short Road Course
        207, // Oran Park Raceway - North
        208, // Oran Park Raceway - South
        209, // Oran Park Raceway - North A
        210, // Oran Park Raceway - North B
        211, // Oran Park Raceway - Moto
        212, // Autódromo José Carlos Pace - Grand Prix
        213, // Autódromo José Carlos Pace - Moto
        215, // Kansas Speedway - Road Course
        216, // Kansas Speedway - Infield Road Course
        217, // Irwindale Speedway - Figure Eight
        218, // Circuit Gilles Villeneuve
        219, // Mount Panorama Circuit
        220, // New Jersey Motorsports Park - Thunderbolt
        221, // New Jersey Motorsports Park - Thunderbolt w/both chicanes
        223, // New Jersey Motorsports Park - Thunderbolt w/first chicane
        224, // New Jersey Motorsports Park - Thunderbolt w/second chicane
        226, // Auto Club Speedway - Competition
        227, // Auto Club Speedway - Moto
        228, // Auto Club Speedway - Interior
        229, // Circuit of the Americas - Grand Prix
        230, // Circuit of the Americas - East
        231, // Circuit of the Americas - West
        233, // Donington Park Racing Circuit - Grand Prix
        234, // Donington Park Racing Circuit - National
        238, // World Wide Technology Raceway - Road Course
        239, // Autodromo Nazionale Monza - Grand Prix
        240, // Autodromo Nazionale Monza - Combined without chicanes
        241, // Autodromo Nazionale Monza - Junior
        242, // Autodromo Nazionale Monza - GP without chicanes
        244, // Autodromo Nazionale Monza - GP without first chicane
        246, // Autodromo Nazionale Monza - Combined without first chicane
        247, // Autodromo Nazionale Monza - Combined
        249, // Nürburgring Nordschleife - Industriefahrten
        250, // Nürburgring Grand-Prix-Strecke - Grand Prix
        252, // Nürburgring Combined - Gesamtstrecke 24h
        253, // Nürburgring Nordschleife - Touristenfahrten
        255, // Nürburgring Grand-Prix-Strecke - BES/WEC
        257, // Nürburgring Grand-Prix-Strecke - Grand Prix w/out Arena
        259, // Nürburgring Grand-Prix-Strecke - Sprintstrecke
        260, // Nürburgring Grand-Prix-Strecke - Kurzanbindung w/out Arena
        261, // Nürburgring Grand-Prix-Strecke - Müllenbachschleife
        262, // Nürburgring Combined - Gesamtstrecke VLN
        263, // Nürburgring Combined - Gesamtstrecke Short w/out Arena
        264, // Nürburgring Combined - Gesamtstrecke Long
        266, // Autodromo Internazionale Enzo e Dino Ferrari - Grand Prix
        267, // Autodromo Internazionale Enzo e Dino Ferrari - Moto
        268, // Circuit des 24 Heures du Mans - 24 Heures du Mans
        269, // Circuit des 24 Heures du Mans - Historic
        297, // Snetterton Circuit - 300
        298, // Snetterton Circuit - 200
        299, // Snetterton Circuit - 100
        319, // Detroit Grand Prix at Belle Isle - Belle Isle
        324, // Tsukuba Circuit - 2000 Full
        325, // Tsukuba Circuit - 2000 Moto
        326, // Tsukuba Circuit - 2000 Short
        327, // Tsukuba Circuit - 1000 Full
        328, // Tsukuba Circuit - 1000 Outer
        329, // Tsukuba Circuit - 1000 Chicane
        330, // Charlotte Motor Speedway - Roval - 2018
        333, // Tsukuba Circuit - 1000 Full Reverse
        336, // Charlotte Motor Speedway - Legends RC Long - 2018
        337, // Charlotte Motor Speedway - Legends RC Medium - 2018
        338, // Charlotte Motor Speedway - Legends RC Short - 2018
        340, // Charlotte Motor Speedway - Roval Long - 2018
        341, // Silverstone Circuit - Grand Prix
        342, // Silverstone Circuit - International
        343, // Silverstone Circuit - National
        345, // Circuit de Barcelona Catalunya - Grand Prix
        346, // Circuit de Barcelona Catalunya - National
        347, // Circuit de Barcelona Catalunya - Club
        348, // Circuit de Barcelona Catalunya - Moto
        349, // Circuit de Barcelona Catalunya - Historic
        350, // Charlotte Motor Speedway - Roval
        352, // Lime Rock Park - Classic
        353, // Lime Rock Park - Grand Prix
        354, // Lime Rock Park - Chicanes
        355, // Lime Rock Park - West Bend Chicane
        361, // Lånkebanen (Hell RX) - Road Short
        363, // Lånkebanen (Hell RX) - Road Long
        381, // Daytona International Speedway - NASCAR Road
        388, // Irwindale Speedway - Figure Eight Jump
        390, // Hockenheimring Baden-Württemberg - Grand Prix
        391, // Hockenheimring Baden-Württemberg - National A
        392, // Hockenheimring Baden-Württemberg - National B
        393, // Hockenheimring Baden-Württemberg - Short A
        394, // Hockenheimring Baden-Württemberg - Short B
        395, // Hockenheimring Baden-Württemberg - Outer
        397, // Sonoma Raceway - IndyCar 2012-2018
        398, // Mt. Washington Auto Road - Hillclimb
        399, // Mt. Washington Auto Road - Descent
        403, // Red Bull Ring - Grand Prix
        404, // Red Bull Ring - National
        405, // Chicago Street Circuit
        407, // Red Bull Ring - North
        413, // Hungaroring
        439, // Winton Motor Raceway - National Circuit
        440, // Winton Motor Raceway - Club Circuit
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

      // Iterate over each td that contains a link to a track, compare to known ovalTracks and remove if not listed above.
      // /membersite/member/TrackDetail.do?trkid=107
      $("table tr td div div a[href*='/membersite/member/TrackDetail.do?trkid']").each(function(
        index,
      ) {
        var href = $(this).attr('href')
        var trackID = parseInt(getURLParameter(href, 'trkid'))
        var text = $(this).text()
        var isOval = -1 != $.inArray(trackID, ovalTracks)
        var isRoad = -1 != $.inArray(trackID, roadTracks)
        var isDirtOval = -1 != $.inArray(trackID, dirt_ovalTracks)
        var isDirtRoad = -1 != $.inArray(trackID, dirt_roadTracks)
        var isUnwantedRow = text == 'Track Info' || text == ''

        if (isUnwantedRow || isOval || isDirtOval || isDirtRoad) {
          tr = $(this)
            .parent()
            .parent()
            .parent()
            .parent()
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
