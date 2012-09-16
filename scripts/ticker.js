/*
   Trips Ticker - Stores how many locations/external sources have been clicked
      on the client browser and keeps this information uptodate in a cookie

   _m means methods, these are general public methods
   _p means privates, these are private methods
   _h means handlers, should be only event handlers
*/
Ticker = (function() {
  var trips         = null,
      counts        = {},
      zero_padding  = 3;

  var _p = {
    // Finds the amount of elements in a json object
    json_count: function(json){
      var count = 0;
      for( var prop in json ){
        if(json.hasOwnProperty(prop)){ count++; }
      }
      return count;
    }
  };

  var _h = {
    // In charge of pulling necessary info from dom when adding a clipping
    add_clipping_event: function(e, data_class){

      var $target = $(e.target),
          trip    = $target.hasClass('x_discovery_want_to_go') ? 'want_to_go' : 'been_there',
          id      = $target.parents(data_class).attr('id');

      _m.add_clipping(trip, id);

      return false;
    }
  };

  var _m = {
    // In charge of updating cookie and display for adding a clipping
    add_clipping: function(trip_name, key){
      if(key === undefined)    { return false; }
      if(trips[trip_name][key]){ return false; }

      trips[trip_name][key] = true;
      counts[trip_name]++;
      $.cookie('trips', JSON.stringify(trips), { path: '/' });
      _m.update_ticker_display(trip_name, key);
      return true;
    },
    // Takes the count of a trip and formats it for the view
    update_ticker_display: function(trip_name, key){
      var count           = _m.clips_count(trip_name),
          remaining_zeros = zero_padding - String(count).length,
          ticker_handle   = '#footer .' + trip_name + ' .count',
          options         = { to: ticker_handle, className: 'ui-effects-transfer' },
          zeros           = '',
          output          = '';
      // Find how many zeros to pad with
      for(i = 0; i < remaining_zeros; i ++){ zeros += '0'; }
      // Wrap each number in spans for prettier styling
      output = (zeros + count).replace(/(\w)/g, "<span>$&</span>");

      $(ticker_handle).html(output);
    },
    // Getter for trips variable
    trips: function(){ return trips; },
    // Memoized trip count since array counting is expensive
    clips_count: function(name){
      if(name !== undefined){ return counts[name] || 0; }

      // Get total count
      return counts['want_to_go'] + counts['been_there'];
    },
    // Initialze the trips variable and the handlers for click events
    init: function() {
      // Remove this when we are handling logged in users too
      if(window.user !== undefined){ return false; }

      // Extract trip info from cookie
      try{
        trips = JSON.parse($.cookie('trips')) || { want_to_go: {}, been_there: {} };
      }catch(err){
        trips = { want_to_go: {}, been_there: {} };
      }

      counts['want_to_go'] = _p.json_count(trips.want_to_go);
      counts['been_there'] = _p.json_count(trips.been_there);

      _m.update_ticker_display('want_to_go');
      _m.update_ticker_display('been_there');

/*
      // Visitor clipping events for search results
      $('#clippings')
        .on('click', '.clipping .item .actions .x_discovery_want_to_go', function(event){
          _h.add_clipping_event(event, '.clipping');
          return false;
        });

      $('#clippings')
        .on('click', '.clipping .item .actions .x_discovery_been_there', function(event){
          _h.add_clipping_event(event, '.clipping');
          return false;
        });

      // Visitor clipping events for product page
      $('.location_call_to_action')
        .on('click', '.want_to_go .x_discovery_want_to_go', function(event){
          _h.add_clipping_event(event, '.location');
          return false;
        });

      $('.location_call_to_action')
        .on('click', '.been_there .x_discovery_been_there', function(event){
          _h.add_clipping_event(event, '.location');
          return false;
        });
*/
    }
  };

  return _m;
}());
