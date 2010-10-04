/*!*********************************************************************
 * ELYCHARTS
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/

(function($) {

var featuresmanager = $.elycharts.featuresmanager;
var common = $.elycharts.common;

/***********************************************************************
 * FEATURE: BALLOON
 **********************************************************************/

$.elycharts.balloonmanager = {
  
  afterShow : function(env, pieces) {
    // TODO transizioni
    
    if (env.opt.features.balloons.active && env.opt.balloons && env.opt.type == 'funnel') {
      var conf = env.opt.features.balloons;
      var lastSerie = false, lastIndex = false;
      for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].section == 'Series' && pieces[i].subSection == 'Plot') {
          for (var index = 0; index < pieces[i].paths.length; index ++)
            if (env.opt.balloons[pieces[i].serie] && env.opt.balloons[pieces[i].serie][index]) {
              lastSerie = pieces[i].serie;
              lastIndex = index;
              this.drawBalloon(env, lastSerie, index, pieces[i].paths[index].rect);
            }
        } else if (lastSerie && pieces[i].section == 'Sector' && pieces[i].serie == 'bottom' && !pieces[i].subSection && lastIndex < env.opt.balloons[lastSerie].length - 1) {
          this.drawBalloon(env, lastSerie, env.opt.balloons[lastSerie].length - 1, pieces[i].rect);
        }
      }
    }
  },
  
  drawBalloon : function(env, serie, index, rect) {
    var conf = env.opt.features.balloons;
    var balloon = env.opt.balloons[serie][index];
    
    //var offset = $(env.container).offset();
    var style = {
      position : 'absolute', 'z-index' : 25, 
      //top : offset.top + rect[1] , left: offset.left + conf.left,
      margin : rect[1] + "px 0 0 " + conf.left + "px",
      height : (conf.height ? conf.height : rect[3] - rect[1]) - conf.padding[0] * 2 ,
      width : conf.width ? conf.width : rect[0],
      padding : conf.padding[0] + 'px ' + conf.padding[1] + 'px'
    };
    
    if (typeof balloon == 'string')
      $("<div></div>").css(style).css(conf.style).html(balloon).prependTo(env.container);
    else 
      $(balloon).css(style).css(conf.style).prependTo(env.container);
    
    // Disegna la linea
    if (conf.line) {
      var path = [];
      for (var j = 0; j < conf.line.length; j++) {
        if (j == 0)
          path.push([ 'M', rect[0] - conf.line[j][0], rect[1] + conf.line[j][1]]);
        else if (j == conf.line.length - 1)
          path.push([ 'L', conf.left + (conf.width ? conf.width : rect[0]) - conf.line[j][0], rect[1] + conf.line[j][1] ]);
        else
          path.push([ 'L', rect[0] - conf.line[j][0], rect[1] + conf.line[j][1]]);
      }
      common.showPath(env, path).attr(conf.lineProps);
    }
  }
}

$.elycharts.featuresmanager.register($.elycharts.balloonmanager, 30);

})(jQuery);
