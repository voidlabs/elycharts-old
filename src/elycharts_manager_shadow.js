/**********************************************************************
 * ELYCHARTS
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/

(function($) {

//var featuresmanager = $.elycharts.featuresmanager;
//var common = $.elycharts.common;

/***********************************************************************
 * FEATURE: SHADOW
 **********************************************************************/

$.elycharts.shadowmanager = {
  
  beforeShow : function(env, pieces) {
    if (!env.opt.features.shadows || !env.opt.features.shadows.active)
      return;
      
    // TODO if (!common.changed(env, ['labels', 'series']))
    // TODO FIX
    var shadowOffset = env.opt.features.shadows.offset;
    
    var shadows = [];
    for (var i = 0; i < pieces.length; i++) {
      var path = [];
      for (var j = 0; j < pieces[i].path.length; j++) {
        var o = pieces[i].path[j];
        switch (o[0]) {
          case 'M': case 'L':
            path.push([o[0], o[1] + shadowOffset[0], o[2] + shadowOffset[1]]);
            break;
          case 'A': case 'C':
            path.push([o[0], o[1], o[2], o[3], o[4], o[5], o[6] + shadowOffset[0], o[7] + shadowOffset[1]]);
            break;
          case 'z': case 'Z':
            path.push([o[0]]);
            break;
        }
      }
      shadows.push({path: path, attr: env.opt.features.shadows.props});
    }
    for (var i = shadows.length - 1; i >= 0; i--)
      pieces.unshift(shadows[i]);
  }
}

$.elycharts.featuresmanager.register($.elycharts.shadowmanager, 5);

})(jQuery);
