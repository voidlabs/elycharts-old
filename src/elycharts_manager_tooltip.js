/**********************************************************************
 * ELYCHARTS
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/

(function($) {

//var featuresmanager = $.elycharts.featuresmanager;
var common = $.elycharts.common;

/***********************************************************************
 * FEATURE: TOOLTIP
 **********************************************************************/

$.elycharts.tooltipmanager = {

  afterShow : function(env, pieces) {
    if (env.tooltipContainer) {
      env.tooltipFrame.remove();
      env.tooltipFrame = null;
      env.tooltipFrameElement = null;
      env.tooltipContent.remove();
      env.tooltipContent = null;
      env.tooltipContainer.remove();
      env.tooltipContainer = null;
    }
    
    if (!$.elycharts.tooltipid)
      $.elycharts.tooltipid = 0;
    $.elycharts.tooltipid ++;
    
    // Preparo il tooltip
    env.tooltipContainer = $('<div id="elycharts_tooltip_' + $.elycharts.tooltipid + '" style="position: absolute; top: 100; left: 100; z-index: 10; overflow: hidden; white-space: nowrap; display: none"><div id="elycharts_tooltip_' + $.elycharts.tooltipid + '_frame" style="position: absolute; top: 0; left: 0; z-index: -1"></div><div id="elycharts_tooltip_' + $.elycharts.tooltipid + '_content" style="cursor: default"></div></div>').appendTo(document.body);
    env.tooltipFrame = common._RaphaelInstance('elycharts_tooltip_' + $.elycharts.tooltipid + '_frame', 500, 500);
    env.tooltipContent = $('#elycharts_tooltip_' + $.elycharts.tooltipid + '_content');
  },
  
  _prepareShow : function(env, props, mouseAreaData, tip) {
    if (env.tooltipFrameElement)
      env.tooltipFrameElement.attr(props.frameProps);
    if (props.padding)
      env.tooltipContent.css({ padding : props.padding[0] + 'px ' + props.padding[1] + 'px' });
    env.tooltipContent.css(props.contentStyle);
    env.tooltipContent.html(tip);
    
    //BIND: env.tooltipContainer.unbind().mouseover(mouseAreaData.mouseover).mouseout(mouseAreaData.mouseout);
    
    // WARN: Prendendo env.paper.canvas non va bene...
    //var offset = $(env.paper.canvas).offset();
    var offset = $(env.container).offset();

    if (env.opt.features.tooltip.fixedPos) {
      offset.top += env.opt.features.tooltip.fixedPos[1];
      offset.left += env.opt.features.tooltip.fixedPos[0];

    } else {
      var coord = this.getXY(env, props, mouseAreaData);
      if (!coord[2]) {
        offset.left += coord[0];
        while (offset.top + coord[1] < 0)
          coord[1] += 20;
        offset.top += coord[1];
      } else {
        offset.left = coord[0];
        offset.top = coord[1];
      }
    }
    
    return { top : offset.top, left : offset.left };
  },
  
  /**
   * Ritorna [x, y] oppure [x, y, true] se le coordinate sono relative alla pagina (e non al grafico)
   */
  getXY : function(env, props, mouseAreaData) {
    // NOTA Posizione mouse: mouseAreaData.event.pageX/pageY
    var x = 0, y = 0;
    if (mouseAreaData.path[0][0] == 'RECT') {
      // L'area e' su un rettangolo (un bar o un indice completo), il tooltip lo faccio subito sopra
      // Nota: per capire se e' sull'indice completo basta guardare mouseAreaData.piece == null
      x = common.getX(mouseAreaData.path[0]) - props.offset[1];
      y = common.getY(mouseAreaData.path[0]) - props.height - props.offset[0];
    }
    else if (mouseAreaData.path[0][0] == 'CIRCLE') {
      // L'area e' su un cerchio (punto di un line)
      x = common.getX(mouseAreaData.path[0]) - props.offset[1];
      y = common.getY(mouseAreaData.path[0]) - props.height - props.offset[0];
    }
    else if (mouseAreaData.path[0][0] == 'SLICE') {
      // L'area è su una fetta di torta (pie)
      var path = mouseAreaData.path[0];
      
      // Genera la posizione del tip considerando che deve stare all'interno di un cerchio che è sempre dalla parte opposta dell'area
      // e deve essere il piu' vicino possibile all'area
      var w = props.width && props.width != 'auto' ? props.width : 100;
      var h = props.height && props.height != 'auto' ? props.height : 100;
      // Raggio del cerchio che contiene il tip
      var cr = Math.sqrt(Math.pow(w,2) + Math.pow(h,2)) / 2;
      if (cr > env.opt.r)
              cr = env.opt.r;
      
      var tipangle = path[5] + (path[6] - path[5]) / 2 + 180;
      var rad = Math.PI / 180;
      x = path[1] + cr * Math.cos(- tipangle * rad) - w / 2;
      y = path[2] + cr * Math.sin(- tipangle * rad) - h / 2;
    }
    else if (mouseAreaData.piece && mouseAreaData.piece.paths && mouseAreaData.index >= 0 && mouseAreaData.piece.paths[mouseAreaData.index] && mouseAreaData.piece.paths[mouseAreaData.index].rect) {
      // L'area ha una forma complessa, ma abbiamo il rettangolo di contenimento (funnel)
      var rect = mouseAreaData.piece.paths[mouseAreaData.index].rect;
      x = rect[0] - props.offset[1];
      y = rect[1] - props.height - props.offset[0];
    }
    
    if (env.opt.features.tooltip.positionHandler)
      return env.opt.features.tooltip.positionHandler(env, props, mouseAreaData, x, y);
    else
      return [x, y];
  },
  
  onMouseEnter : function(env, serie, index, mouseAreaData) {
    var props = mouseAreaData.props.tooltip;
    if (env.emptySeries && env.opt.series.empty)
      props = $.extend(true, props, env.opt.series.empty.tooltip);
    if (!props || !props.active)
      return false;

    if (!env.opt.tooltips || (serie && (!env.opt.tooltips[serie] || !env.opt.tooltips[serie][index])) || (!serie && !env.opt.tooltips[index]))
      return this.onMouseExit(env, serie, index, mouseAreaData);
        
    var tip = serie ? env.opt.tooltips[serie][index] : env.opt.tooltips[index];
    
    // Il dimensionamento del tooltip e la view del frame SVG, lo fa solo se width ed height sono specificati
    if (props.width && props.width != 'auto' && props.height && props.height != 'auto') {
      var delta = props.frameProps && props.frameProps['stroke-width'] ? props.frameProps['stroke-width'] : 0;
      env.tooltipContainer.width(props.width + delta + 1).height(props.height + delta + 1);
      if (!env.tooltipFrameElement && props.frameProps)
        env.tooltipFrameElement = env.tooltipFrame.rect(delta / 2, delta / 2, props.width, props.height, props.roundedCorners);
    }

    env.tooltipContainer.css(this._prepareShow(env, props, mouseAreaData, tip)).fadeIn(env.opt.features.tooltip.fadeDelay);

    return true;
  },
  
  onMouseChanged : function(env, serie, index, mouseAreaData) {
    var props = mouseAreaData.props.tooltip;
    if (env.emptySeries && env.opt.series.empty)
      props = $.extend(true, props, env.opt.series.empty.tooltip);
    if (!props || !props.active)
      return false;

    if (!env.opt.tooltips || (serie && (!env.opt.tooltips[serie] || !env.opt.tooltips[serie][index])) || (!serie && !env.opt.tooltips[index]))
      return this.onMouseExit(env, serie, index, mouseAreaData);
        
    var tip = serie ? env.opt.tooltips[serie][index] : env.opt.tooltips[index];
    
    env.tooltipContainer.clearQueue();
    // Nota: Non passo da animationStackPush, i tooltip non sono legati a piece
    env.tooltipContainer.animate(this._prepareShow(env, props, mouseAreaData, tip), env.opt.features.tooltip.moveDelay, 'linear' /*swing*/);

    return true;
  },
  
  onMouseExit : function(env, serie, index, mouseAreaData) {
    var props = mouseAreaData.props.tooltip;
    if (env.emptySeries && env.opt.series.empty)
      props = $.extend(true, props, env.opt.series.empty.tooltip);
    if (!props || !props.active)
      return false;

    //env.tooltipContainer.unbind();
    env.tooltipContainer.fadeOut(env.opt.features.tooltip.fadeDelay);

    return true;
  }
}

$.elycharts.featuresmanager.register($.elycharts.tooltipmanager, 20);

})(jQuery);
