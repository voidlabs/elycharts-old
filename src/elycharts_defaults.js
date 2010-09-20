/*!*********************************************************************
 * ELYCHARTS v2.1.2
 **********************************************************************/

(function($) {
if (!$.elycharts)
  $.elycharts = {};

/***********************************************************************
 * DEFAULT OPTIONS
 **********************************************************************/

$.elycharts.templates = {

  common : {
    // Tipo di grafico
    // type : 'line|pie|funnel|barline'
    
    // Permette di specificare una configurazione di default da utilizzare (definita in $.elycharts.templates.NOME)
    // La configurazione completa è quindi data da tutti i valori della conf di default alla quale viene unita (con sovrascrittura) la conf corrente
    // Il parametro è ricorsivo (la configurazione di default puo' a sua volta avere una configurazione di default)
    // Se non specificato, la configurazione di default è quella con lo stesso nome del tipo di grafico
    // template : 'NOME',
    
    /* DATI:
    // I valori associati a ogni serie del grafico. Ogni serie è associata a una chiave dell'oggetto value, il cui 
    // valore è l'array di dati relativi
    values : {},
    
    // Label associate ai valori del grafico
    // Solo in caso di label gestite da labelmanager (quindi per pie e funnel) e per label.html = true e' possibile inserire 
    // degli elementi DOM/JQUERY che verranno presi e posizionati correttament.
    labels : [],
    
    // Anchor per la gestione mediante anchormanager. Possono essere stringhe e oggetti DOM/JQUERY che verranno riposizionati
    anchors : {},
    
    tooltips : {},
    
    legend : [],
    */
    
    // Per impostare una dimensione diversa da quella del container settare width e height
    //width : x,
    //height : y
    
    // I margini del grafico rispetto al frame complessivo. Da notare che riguardano la posizione del grafico
    // principale, e NON degli elementi aggiuntivi (legenda, label e titoli degli assi...). Quindi i margini devono
    // essere impostati in genere proprio per lasciare lo spazio per questi elementi
    // Sintassi: [top, right, bottom, left]
    margins: [10, 10, 10, 10],
    
    // Per gestire al meglio l'interattivita' del grafico (tooltip, highlight, anchor...) viene inserito un secondo
    // layer per le parti sensibili al mouse. Se si sa che il grafico non avra' alcuna interattivita' si puo' impostare 
    // questo valore a false per evitare di creare il layer (ottimizzando leggermente la pagina)
    interactive : true,

    // Dati da applicare a tutte le serie del grafico
    defaultSeries : {
      // Impostare a false per disabilitare la visualizzazione della serie
      visible : true,
      
      // Impostare color qui permette di impostare velocemente plotProps.stroke+fill, tooltip.frameProps.stroke, dotProps.stroke e fillProps.fill (se non specificati)
      //color: 'blue',
      
      //plotProps : { },
      
      // Impostazioni dei tooltip
      tooltip : {
        active : true,
        // Se width ed height vengono impostati a 0 o ad "auto" (equivalenti) non vengono fissate dimensioni, quindi il contenuto si autodimensiona in funzione del tooltip
        // Impostare a 0|auto è incompatibile con il frame SVG, quindi viene automaticamente disabilitato (come se frameProps = false)
        width: 100, height: 50, 
        roundedCorners: 5, 
        padding: [6, 6] /* y, x */,
        // Se frameProps = false non disegna la cornice del tooltip (ad es. per permettere di definire la propria cornice HTML)
        frameProps : { fill: "white", "stroke-width": 2 },
        contentStyle : { "font-family": "Arial", "font-size": "12px", "line-height": "16px", color: "black" }
      },
      
      // Highlight feature
      highlight : {
        // Cambia le dimensioni dell'elemento quando deve essere evidenziato
        //scale : [x, y],
        // Opzioni di animazione effetto "scale"
        scaleSpeed : 100, scaleEasing : '',
        // Cambia gli attributi dell'elemento quando evidenziato
        //newProps : { opacity : 1 },
        // Inserisce un layer con gli attributi specificati sopra quello da evidenziare
        //overlayProps : {"fill" : "white", "fill-opacity" : .3, "stroke-width" : 0}
        // Muove l'area evidenziata. E' possibile specificare un valore X o un array [X, Y]
        //move : 10,
        // Opzioni di animazione effetto "move"
        moveSpeed : 100, moveEasing : '',
        // Opzioni di animazione da usare per riportare l'oggetto alle situazione iniziale
        restoreSpeed : 0, restoreEasing : ''
      },
      
      anchor : {
        // Aggiunge alle anchor esterne la classe selezionata quando il mouse passa sull'area
        //addClass : "",
        // Evidenzia la serie al passaggio del mouse
        //highlight : "",
        // Se impostato a true usa gli eventi mouseenter/mouseleave invece di mouseover/mouseout per l'highlight
        //useMouseEnter : false,
      },
      
      // Opzioni per la generazione animata dei grafici
      startAnimation : {
        //active : true,
        type : 'simple',
        speed : 600,
        delay : 0,
        propsFrom : {}, // applicate a tutte le props di plot
        propsTo : {}, // applicate a tutte le props di plot
        easing : '' // easing raphael: >, <, <>, backIn, backOut, bounce, elastic
        
        // Opzionale per alcune animazioni, permette di specificare un sotto-tipo
        // subType : 0|1|2
      },
      
      // Opzioni per le transizioni dei grafici durante un cambiamento di configurazione
      /* stepAnimation : {
        speed : 600,
        delay : 0,
        easing : '' // easing raphael: >, <, <>, backIn, backOut, bounce, elastic
      },*/
      
      label : {
        // Disegna o meno la label interna al grafico
        active : false,
        // Imposta un offset [X,Y] per la label (le coordinate sono relative al sistema di assi dello specifico settore disegnato. 
        // Ad es. per il piechart la X è la distanza dal centro, la Y lo spostamento ortogonale
        //offset : [x, y],
        html : false,
        // Proprieta' della label (per HTML = false)
        props : { fill: 'black', stroke: "none", "font-family": 'Arial', "font-size": "16px" },
        // Stile CSS della label (per HTML = true)
        style : { cursor : 'default' }
        // Posizionamento della label rispetto al punto centrale (+offset) identificato
        //frameAnchor : ['start|middle|end', 'top|middle|bottom']
      }
      
      /*legend : {
        dotType : 'rect',
        dotWidth : 10, dotHeight : 10, dotR : 5,
        dotProps : { },
        textProps : { font: '12px Arial', fill: "#000" }
      }*/
    },
    
    series : {
      // Serie specifica usata quando ci sono "dati vuoti" (ad esempio quando un piechart e' a 0)
      empty : {
        //plotProps : { fill : "#D0D0D0" },
        label : { active : false },
        tooltip : { active : false }
      }
      /*root : {
        values : []
      }*/
    },
    
    features : {
      tooltip : {
        // Imposta una posizione fissa per tutti i tooltip
        //fixedPos : [ x,  y]
        // Velocita' del fade
        fadeDelay : 100, 
        // Velocita' dello spostamento del tip da un'area all'altra
        moveDelay : 300
        // E' possibile specificare una funzione che filtra le coordinate del tooltip prima di mostrarlo, permettendo di modificarle
        // Nota: le coordinate del mouse sono in mouseAreaData.event.pageX/pageY, e nel caso va ritornato [mouseAreaData.event.pageX, mouseAreaData.event.pageY, true] per indicare che il sistema e' relativo alla pagina)
        //positionHandler : function(env, tooltipConf, mouseAreaData, suggestedX, suggestedY) { return [suggestedX, suggestedY] }
      },
      mousearea : {
        // 'single' le aree sensibili sono relative a ogni valore di ogni serie, se 'index' il mouse attiva tutte le serie per un indice
        type : 'single',
        // In caso di type = 'index', indica se le aree si basano sulle barre ('bar') o sui punti di una linea ('line'). Specificare 'auto' per scegliere automaticamente
        indexCenter : 'auto',
        // Quanto tempo puo' passare nel passaggio da un'area all'altra per considerarlo uno spostamento di puntatore
        areaMoveDelay : 500,
        // Se diversi chart specificano lo stesso syncTag quando si attiva l'area di uno si disattivano quelle degli altri
        syncTag: false
      },
      highlight : {
        // Evidenzia tutto l'indice con una barra ("bar"), una linea ("line") o una linea centrata sulle barre ("barline"). Se "auto" decide in autonomia tra bar e line
        //indexHighlight : 'barline',
        indexHighlightProps : { opacity : 1 /*fill : 'yellow', opacity : .3, scale : ".5 1"*/ }
      },
      animation : {
        // Valore di default per la generazione animata degli elementi del grafico (anche per le non-serie: label, grid...)
        startAnimation : {
          //active : true,
          //propsFrom : {}, // applicate a tutte le props di plot
          //propsTo : {}, // applicate a tutte le props di plot
          speed : 600,
          delay : 0,
          easing : '' // easing raphael: >, <, <>, backIn, backOut, bounce, elastic
        },
        // Valore di default per la transizione animata degli elementi del grafico (anche per le non-serie: label, grid...)
        stepAnimation : {
          speed : 600,
          delay : 0,
          easing : '' // easing raphael: >, <, <>, backIn, backOut, bounce, elastic
        }
      },
      frameAnimation : {
        active : false,
        cssFrom : { opacity : 0},
        cssTo : { opacity: 1 },
        speed : 'slow',
        easing : 'linear' // easing jQuery: 'linear' o 'swing'
      },
      pixelWorkAround : {
        active : true
      },
      label : {},
      shadows : {
        active : false,
        offset : [2, 2], // Per attivare l'ombra, [y, x]
        props : {"stroke-width": 0, "stroke-opacity": 0, "fill": "black", "fill-opacity": .3}
      },
      // BALLOONS: Applicabile solo al funnel (per ora)
      balloons : {
        active : false,
        // Width: se non specificato e' automatico
        //width : 200,
        // Height: se non specificato e' automatico
        //height : 50,
        // Lo stile CSS da applicare a ogni balloon
        style : {  },
        // Padding 
        padding : [ 5, 5 ],
        // La distanza dal bordo sinistro
        left : 10,
        // Percorso della linea: [ [ x, y iniziali (rispetto al punto di inizio standard)], ... [x, y intermedi (rispetto al punto di inizio standard)] ..., [x, y finale (rispetto all'angolo del balloon più vicino al punto di inizio)] ]
        line : [ [ 0, 0 ], [0, 0] ],
        // Proprietà della linea
        lineProps : { }
      },
      legend : {
        horizontal : false,
        x : 'auto', // X | auto, (auto solo per horizontal = true)
        y : 10, 
        width : 'auto', // X | auto, (auto solo per horizontal = true)
        height : 20,
        itemWidth : "fixed", // fixed | auto, solo per horizontal = true
        margins : [0, 0, 0, 0],
        dotMargins : [10, 5], // sx, dx
        borderProps : { fill : "white", stroke : "black", "stroke-width" : 1 },
        dotType : 'rect',
        dotWidth : 10, dotHeight : 10, dotR : 5,
        dotProps : { type : "rect", width : 10, height : 10 },
        textProps : { font: '12px Arial', fill: "#000" }
      },
      debug : {
        active : false
      }
    },
    
    nop : 0
  },

  line : {
    template : 'common',
    
    barMargins : 0,

    // Axis
    defaultAxis : {
      // [non per asse x] Normalizza il valore massimo dell'asse in modo che tutte le label abbiamo al massimo N cifre significative
      // (Es: se il max e' 135 e normalize = 2 verra' impostato il max a 140, ma se il numero di label in y e' 3 verrà impostato 150)
      normalize: 2,
      // Permette di impostare i valori minimi e massimi di asse (invece di autorilevarli)
      min: 0, //max: x,
      // Imposta un testo da usare come prefisso e suffisso delle label
      //prefix : "", suffix : "",
      // Visualizza o meno le label dell'asse
      labels: true, 
      // Distanza tra le label e l'asse relativo
      labelsDistance: 8, 
      // [solo asse x] Rotazione (in gradi) delle label. Se specificato ignora i valori di labelsAnchor e labelsProps['text-anchor']
      labelsRotate: 0, 
      // Proprieta' grafiche delle label
      labelsProps : {font: '10px Arial', fill: "#000"},
      // Compatta il numero mostrato nella label usando i suffissi specificati per migliaia, milioni...
      //labelsCompactUnits : ['k', 'M'],
      // Permette di specificare una funzione esterna che si occupa di formattare (o in generale trasformare) la label
      //labelsFormatHandler : function (label) { return label },
      // Salta le prime N label
      //labelsSkip : 0, 
      // Modifica l'allineamento standard (middle per asse x, end per asse l, start per asse right)
      //labelsAnchor : "start"
      // Nascondi automaticamente le label che vengono coperte da altre
      //labelsHideCovered : true, 
      // Inserisce un margine alla label (a sinistra se in asse x, in alto se in altri assi)
      //labelsMargin: 10,  
      // [solo asse x] Se labelsHideCovered = true, fa si che ci sia almeno un margine X a destra della label
      //labelsMarginRight: 0, 
      // Distanza del titolo dall'asse
      titleDistance : 25, titleDistanceIE : .75,
      // Proprieta' grafiche del titolo
      titleProps : {font: '12px Arial', fill: "#000", "font-weight": "bold"}
    },
    axis : {
      x : { titleDistanceIE : 1.2 }
    },
    
    defaultSeries : {
      // Tipo di serie, puo' essere 'line' o 'bar'
      type : 'line', 
      // L'asse di riferimento della serie. Gli assi "l" ed "r" sono i 2 assi visibili destro e sinistro. 
      // E' possibile inserire anche un asse arbitrario (che non sarà visibile)
      axis : 'l',
      // Specificare cumulative = true se i valori inseriti per la serie sono cumulativi
      cumulative : false,
      // In caso di type="line" indica l'arrotondamento della linea
      rounded : 1,
      // Mette il punto di intersezione al centro dell'intervallo invece che al limite (per allineamento con bars). Se 'auto' decide autonomamente
      lineCenter : 'auto',
      // Permette di impilare le serie (i valori di uno iniziano dove finiscono quelli del precedente) con un altra (purche' dello stesso tipo)
      // Specificare "true" per impilare con la serie visibile precedente, oppure il nome della serie sulla quale impilare
      // stacked : false,

      plotProps : {"stroke-width": 1, "stroke-linejoin": "round"},
      
      barWidthPerc: 100,
      //DELETED: barProps : {"width-perc" : 100, "stroke-width": 1, "fill-opacity" : .3},
      
      // Attiva o disattiva il riempimento
      fill : false, 
      fillProps : {stroke: "none", "stroke-width" : 0, "stroke-opacity": 0, opacity: .3},

      dot : true,
      dotProps : {size: 4, stroke: "#000"},
      
      startAnimation : {
        plotPropsFrom : false,
        // DELETED linePropsFrom : false,
        fillPropsFrom : false, 
        dotPropsFrom : false,
        //DELETED barPropsFrom : false,
        shadowPropsFrom : false
      }
      
    },
    
    features : {
      grid : {
        // N. di divisioni sull'asse X. Se "auto" si basa sulla label da visualizzare
        nx : "auto",
        // N. di divisione sull'asse Y
        ny : 10,
        // Disegna o meno la griglia. Si puo' specificare un array [horizontal, vertical]
        draw : true,
        // Forza la visualizzazione dei bordi/assi. Se true disegna comunque i bordi (anche se draw = false o se non ci sono label), 
        // altrimenti si basa sulle regole standard di draw e presenza label (per asse x)
        // Puo' essere un booleano singolo o un array di bordi [up, dx, down, sx]
        forceBorder : true, 
        // Proprieta' di visualizzazione griglia
        props : {stroke: '#e0e0e0', "stroke-width": 1},
        // Dimensioni extra delle rette [up, dx, down, sx]
        extra : [0, 0, 0, 0],
        // Indica se le label (e le rispettive linee del grid) vanno centrate sulle barre (true), quindi tra 2 linee, o sui punti della serie (false), quindi su una sola linea
        // Se specificato "auto" decide in autonomia
        labelsCenter : "auto",
        ticks : {
          // Attiva le barrette sugli assi [x, l, r]
          active : [false, false, false],
          // Dimensioni da prima dell'asse a dopo l'asse
          size : [10, 10],
          // Proprieta' di visualizzazione griglia
          props : {stroke: '#e0e0e0', "stroke-width": 1}
        }
      }
    },

    nop : 0
  },

  pie : {
    template : 'common',
    
    // Coordinate del centro, se non specificate vengono autodeterminate
    //cx : 0, cy : 0,
    // Raggio della torta, se non specificato viene autodeterminato
    //r : 0
    // Angolo dal quale iniziare a disegnare le fette, in gradi
    startAngle : 0,
    // Disegna la torta con le fette in senso orario (invece dell'orientamento standard per gradi, in senso antiorario)
    clockwise : false,
    // Soglia (rapporto sul totale) entro la quale una fetta non viene visualizzata
    valueThresold : 0.006,
    
    defaultSeries : {
      // r: .5, raggio usato solo per questo spicchio, se <=1 e' in rapporto al raggio generale
      // inside: X, inserisce questo spicchio dentro un altro (funziona solo inside: precedente, e non gestisce + spicchi dentro l'altro)
    }
  },

  funnel : {
    template : 'common',
    
    rh: 0, // height of ellipsis (for top and bottom cuts)
    method: 'width', // width/cutarea
    topSector: 0, // height factor of top cylinder
    topSectorProps : { fill: "#d0d0d0" },
    bottomSector: .1, // height factor of bottom cylinder
    bottomSectorProps : { fill: "#d0d0d0" },
    edgeProps : { fill: "#c0c0c0", "stroke-width": 1, opacity: 1 },

    nop : 0
  },
  
  barline : {
    template : 'common',

    // Imposta il valore massimo per la scala (altrimenti prende il valore + alto)
    // max : X
    
    // Impostare direction = rtl per creare un grafico che va da destra a sinistra
    direction : 'ltr'
  }
}

})(jQuery);
