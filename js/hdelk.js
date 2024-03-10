function isString(obj) {
    return (typeof obj === 'string' || obj instanceof String);
}

var hdelk = (function(){

    /**
     * HDElkJS Style Section
     */

    var node_width = 75;
    var node_height = 75;

    var node_min_width = 20;
    var node_min_height = 20;

    var node_highlight_fill_color = ['#FFF', '#DDD', '#4bF', '#F88', '#FE6', '#7e0', '#FF72CA', '#F3E7FF', '#CDD0FF', '#eeeeee', '#a2dfff', '#ffc4c4', '#fff5b3', '#bdf67f', '#ffb9e7', '#f8f3ff', '#e6e8ff'];
    var node_fill_color = '#FFF';
    var node_stroke_color = '#666'; // This is not used in the code.
    var node_highlight_stroke_width = 2;
    var node_stroke_width = 1;
    var node_name_text_color = '#666';
    var node_highlight_name_text_color = ['#DDD', '#222', '#46C', '#922', '#A90', '#350', '#922061', '#B97AFF', '#0C0FF8', '#909090', '#a1b4e6', '#cc9191', '#d4c97f', '#9aaa7f', '#c890b1', '#dabdff', '#8588fc'];
    var node_name_font_size = 16;
    var node_type_text_color = '#666';
    var node_type_font_size = 12;
    var node_label_width_padding = 4;
    var node_label_height_padding = 4;

    var node_port_name_font_size = 16;
    var node_port_height = 22;
    var node_port_width = 4;
    var node_port_name_text_color = '#FFF';
    var node_port_fill_color = '#777';

    var node_constant_notch = 10;
    var port_height = 18;
    var port_width_padding = 10;
    var port_name_font_size = 12;
    var port_fill_color = '#777';
    var port_text_color = '#FFF';
    var port_highlight_fill_color = ['#DDD', '#444', '#06d', '#C00', '#980', '#590', '#C40070', '#AD60FF', '#7579FF', '#a1a1a1', '#7fb6ee', '#e57f7f', '#ccc27f', '#adcc7f', '#e17fb9', '#d5b0ff', '#babdff']; // It seems that `port_highlight_fill_color` is also used for stroke color.
    var port_spacing = 4;

    var edge_label_text_size = 12;
    var edge_label_fill_color = '#EEE';
    var edge_label_text_color = '#777';
    var edge_label_width_padding = 4;
    var edge_label_height_padding = 4;
    var edge_label_highlight_fill_color = ['#DDD', '#222', '#46C', '#922', '#A90', '#350', '#922061', '#B97AFF', '#0C0FF8', '#909090', '#a1b4e6', '#cc9191', '#d4c97f', '#9aaa7f', '#c890b1', '#dabdff', '#8588fc'];

    var edge_width = 1;
    var edge_color = '#888';
    var edge_highlight_color = ['#DDD', '#444', '#06d', '#C00', '#980', '#590', '#C40070', '#AD60FF', '#7579FF', '#a1a1a1', '#7fb6ee', '#e57f7f', '#ccc27f', '#adcc7f', '#e17fb9', '#d5b0ff', '#babdff'];
    var edge_highlight_width = 2;
    var edge_bus_width = 6;
    var edge_bus_color = '#AAA';
    var edge_bus_highlight_color = ['#DDD', '#444', '#06d', '#C00', '#980', '#590', '#C40070', '#AD60FF', '#7579FF', '#a1a1a1', '#7fb6ee', '#e57f7f', '#ccc27f', '#adcc7f', '#e17fb9', '#d5b0ff', '#babdff'];
    var edge_bus_highlight_width = 6;

    // var g_str_right_triangle = String.fromCodePoint(9205/*9654*//*9656*/);
    const VECTOR_ORIENTS = Object.freeze({EAST: 0, NORTH: 1, WEST: 2, SOUTH: 3});

    /**
     * Creates an SVG diagram from a JSON description.
     * @param {object} graph
     * @param {string} divname
     * @param {number} elk_thoroughness How much effort should be spent to produce a nice layout. min=1, default=32
     */
    var layout = function(graph, divname, elk_thoroughness=32) {
        const elk = new ELK({})

        // create a dummy drawing just to get text sizes
        var drawDummy = SVG(divname).size( 0, 0 ).group();

        transformNode(drawDummy, graph, elk_thoroughness);

        drawDummy.clear();

        var mp = document.getElementById( divname + "_message" );
        if ( mp ) {
            mp.style.display = "none";
        }

        try {
            var ep = elk.layout(graph);

            ep.then(function(g) {
                    var dp = document.getElementById( divname + "_preprocessed" );
                    if ( dp )
                        dp.innerHTML = "<pre style='font-size:10px'>" + JSON.stringify(graph, null, " ") + "</pre>";

                    var d = document.getElementById( divname + "_elk" );
                    if ( d )
                        d.innerHTML = "<pre style='font-size:8px'>" + JSON.stringify(g, null, " ") + "</pre>";

                    diagram( divname, g );

                    })

            ep.catch( function(err){
                var dp = document.getElementById( divname );
                dp.innerHTML = "";
                var mp = document.getElementById( divname + "_message" );
                if ( mp ) {
                    mp.innerHTML = err;
                    mp.style.display = "block";
                }
            })
        } catch( err ) {
            var dp = document.getElementById( divname );
            dp.innerHTML = "";
            console.log( err );
        }
    }

    /**
     * Takes the child object and recursively transforms sub-objects into a form that Elk.JS can use
     * @param {object} drawDummy SVG.js object to get text sizes
     * @param {object} child present child node under consideration
     * @param {number} elk_thoroughness How much effort should be spent to produce a nice layout
     */
    var transformNode = function(drawDummy, child, elk_thoroughness) {

        if ( !child.layoutOptions )
            child.layoutOptions = {};

        if ( !child.layoutOptions[ 'elk.nodeLabels.placement' ] ) {
            if ( child.children && child.children.length > 0 )
                child.layoutOptions[ 'elk.nodeLabels.placement' ] = 'V_TOP H_CENTER INSIDE';
            else
                child.layoutOptions[ 'elk.nodeLabels.placement' ] = 'V_CENTER H_CENTER INSIDE'; // 'V_TOP H_LEFT INSIDE';
        }

        if (!child.layoutOptions[ 'elk.portConstraints' ]) {
            child.layoutOptions[ 'elk.portConstraints' ] = (child.fixPortOrder) ? "FIXED_ORDER" : "FIXED_SIDE";
        }

        if ( !child.layoutOptions[ 'elk.nodeSize.constraints' ] ) {
            child.layoutOptions[ 'elk.nodeSize.constraints' ] = "NODE_LABELS PORTS MINIMUM_SIZE";
        }

        if ( !child.layoutOptions[ 'elk.spacing.portPort' ] ) {
            child.layoutOptions[ 'elk.spacing.portPort' ] = port_spacing;
        }

        if ( !child.layoutOptions['elk.nodeSize.options'] ) {
            child.layoutOptions['elk.nodeSize.options'] = '(' + node_min_width + ',' + node_min_height + ')';
        }

        child.layoutOptions['elk.layered.thoroughness'] = elk_thoroughness;
        console.log(elk_thoroughness);

        /* Not sure this has effect. */
        if (isString(child.alignment) && ['AUTOMATIC', 'LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER'].includes(child.alignment)) {
            child.layoutOptions['elk.alignment'] = child.alignment;
        }

        // child.layoutOptions['elk.layered.nodePlacement.bk.fixedAlignment'] = 'LEFTUP'; // not sure what this does

        // child.layoutOptions['elk.layered.compaction.connectedComponents'] = true; // Seems to have no effect.

        // child.layoutOptions['elk.layered.wrapping.cutting.strategy'] = 'ARD'; // Seems to have no effect.

        child.layoutOptions['elk.layered.cycleBreaking.strategy'] = 'DEPTH_FIRST'; // dramatically improves layout

        // child.layoutOptions['elk.alg.layered.options.NodePlacementStrategy'] = 'NETWORK_SIMPLEX'; // Seems to have no effect.

        child.layoutOptions['org.eclipse.elk.validateGraph'] = true;
/*
        if ( !child.layoutOptions[ 'elk.layered.nodePlacement.networkSimplex.nodeFlexibility.default' ] ) {
            child.layoutOptions[ 'elk.layered.nodePlacement.networkSimplex.nodeFlexibility.default' ] = "PORT_POSITION NODE_SIZE";
        }

        if ( !child.layoutOptions[ 'elk.layered.nodePlacement.networkSimplex.nodeFlexibility' ] ) {
            child.layoutOptions[ 'elk.layered.nodePlacement.networkSimplex.nodeFlexibility' ] = "PORT_POSITION NODE_SIZE";
        }

        */
        if ( !child.id && child.id != "" )
            child.id = "";

        if ( !child.label && child.label != "" )
            child.label = child.id

        if ( child.port ) {
            // if ( !child.height )
            //     child.height = node_port_height;
            //     if ( child.ports )
            //         child.height += ( child.ports.length - 1 ) * port_height;
            // if ( !child.width ) {
            //     var tempText = drawDummy.text(child.label).style("font-size:"+node_port_name_font_size);
            //     child.width = tempText.node.getComputedTextLength();
            //     if ( child.width == 0 )
            //        child.width = 6;
            // }
            if ( !child.color )
                child.color = (child.highlight || child.highlight == 0 ) ? port_highlight_fill_color[ child.highlight ]: node_port_fill_color;
        }

        if ( !child.labels ) {
            child.labels = [ ];
        }

        if ( child.label ) {
            child.labels.push( { text:child.label } );
        }

        if ( child.type ) {
            child.labels.push( { text:child.type, type:1 } );
        }

        var labels = child.labels;
        var calculatedNodeWidth = ( child.port ) ? node_port_width : node_min_width;
        var calculatedNodeHeight = ( child.port ) ? node_port_height : node_min_height;
        var labelHeight = 5;
        if ( labels ) {
            labels.forEach( function( item, index ) {
                var text = ( item.text ) ? item.text : "";
                var fontSize;
                if ( child.port )
                    fontSize = node_port_name_font_size;
                else
                    fontSize = ( item.type ) ? node_type_font_size : node_name_font_size;
                var tempText = drawDummy.text(text).style("font-size:"+fontSize);
                tempTextBoundingClientRect = tempText.node.getBoundingClientRect();
                item.height = tempTextBoundingClientRect.height + node_label_height_padding;
                item.width = tempTextBoundingClientRect.width + node_label_width_padding;
                if ( item.width + 10 > calculatedNodeWidth )
                    calculatedNodeWidth = item.width + node_label_width_padding;
                labelHeight += item.height + node_label_height_padding;
            } );
            if ( labelHeight > calculatedNodeHeight )
                calculatedNodeHeight = labelHeight;
        }

        if ( !child.color && ( child.highlight || child.highlight == 0 ) ) {
            child.color = node_highlight_fill_color[ child.highlight ];
        }

        // child.widths are broken when labels are left justified
        // when they're centered, all is well.
        // leaving this here in case we like left justified labels in the future.
        // if ( !child.width )
        //      child.width = calculatedNodeWidth;
        // if ( !child.height )
        //     child.height = calculatedNodeHeight;

        if ( !child.ports )
            child.ports = [];

        var ports = child.ports;

        var inPorts = child.inPorts;
        if ( inPorts ) {
            inPorts.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                // if (item.label)
                //     item.label = g_str_right_triangle + item.label; // triangle + label
                ports.unshift( item );
                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'WEST'
            } );
        }

        var westPorts = child.westPorts;
        if ( westPorts ) {
            westPorts.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                ports.unshift( item );
                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'WEST'
            } );
        }

        var eastPorts = child.eastPorts;
        if ( eastPorts ) {
            eastPorts.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                ports.push( item );
                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'EAST'
            } );
        }

        var northPorts = child.northPorts;
        if ( northPorts ) {
            northPorts.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                ports.push( item );
                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                item.vertical = 1;

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'NORTH'
            } );
        }

        var southPorts = child.southPorts;
        if ( southPorts ) {
            southPorts.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                ports.push( item );
                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                item.vertical = 1;

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'SOUTH'
            } );
        }

        var outPorts = child.outPorts;
        if ( outPorts ) {
            outPorts.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                // if (item.label)
                //     item.label = item.label + g_str_right_triangle; // label + triangle
                ports.push( item );
                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'EAST'
            } );
        }

        var parameters = child.parameters;
        if ( parameters ) {
            parameters.forEach( function( item, index ){
                if ( typeof( item ) == "string" ) {
                    var newItem = { id:item };
                    item = newItem;
                }
                ports.push( item );

                item.param = 1;
                item.vertical = 1;

                if ( !item.layoutOptions )
                    item.layoutOptions = {};

                if ( !item.layoutOptions[ 'elk.port.side' ] )
                    item.layoutOptions[ 'elk.port.side' ] = 'NORTH'
                if ( !item.layoutOptions[ 'elk.port.index' ] )
                    item.layoutOptions[ 'elk.port.index' ] = ""+index
            } );
        }

        // there must be ports by now!
        ports.forEach( function( item, index, ports ){
            if ( typeof( item ) == "string" ) {
                item = { id:item }
                ports[ index ] = item;
            }
            if ( !item.id.includes(".") ) {
                if ( !item.label && item.label != "" )
                    item.label = item.id;
                item.id = child.id + "." + item.id;
            }
            if ( !item.label && item.label != "" ) {
                item.label = item.id;
            }
            if (Array.isArray(item.rank)) {
                var rankString = "";
                for (var i = 0; i < item.rank.length; i++) {
                    rankString += "[";
                    rankString += item.rank[i]-1;
                    rankString += ":0]";
                }
                item.label = rankString + " " + item.label;
            }
            if ( !item.layoutOptions )
                item.layoutOptions = {}

            if ( !item.layoutOptions[ 'elk.port.side' ] )
                item.layoutOptions[ 'elk.port.side' ] = 'SIDES_EAST_WEST'

            if ( !item.width ) {
                var tempText = drawDummy.text(item.label).style("font-size:"+port_name_font_size);
                item.width = tempText.node.getComputedTextLength() + port_width_padding;
            }
            if ( !item.height )
                item.height = port_height;

            // swap!
            if ( item.vertical ) {
                var t = item.width;
                item.width = item.height;
                item.height = t;
            }
        } )

        var edges = child.edges;
        if ( edges ) {
            edges.forEach( function( item, index, edges ) {
                if ( Array.isArray( item ) ) {
                    var newItem = {  }
                    edges[ index ] = newItem;
                    newItem.sources = [ item[ 0 ] ];
                    newItem.targets = [ item[ 1 ] ];
                    if ( item[ 2 ] ) {
                        if ( typeof( item[2] ) == "string" )
                            newItem.label = item[ 2 ];
                        else if ( item[ 2 ] == -1 ) {
                            newItem.reverse = 1;
                        } else
                            if ( item[2 ] == 1 )
                                newItem.bus = 1;
                    }
                    if ( item[ 3 ] ) {
                        if ( typeof( item[3] ) == "string" )
                            newItem.label = item[ 3 ];
                        else if ( item[ 3 ] == -1 ) {
                            newItem.reverse = 1;
                        } else
                            if ( item[3 ] == 1 )
                                newItem.bus = 1;
                    }
                    if ( item[ 4 ] ) {
                        if ( typeof( item[4] ) == "string" )
                            newItem.label = item[ 4 ];
                        else if ( item[ 4 ] == -1 ) {
                            newItem.reverse = 1;
                            // flip the source and target
                        } else
                            if ( item[ 4 ] == 1 )
                                newItem.bus = 1;
                    }
                    item = newItem;
                }
                if ( !item.id )
                    item.id = child.id + "E" + index;
                if ( !item.sources && item.source )
                    item.sources = [ item.source ];
                if ( !item.targets && item.target )
                    item.targets = [ item.target ];
                if ( ( !item.sources || !item.targets ) && item.route ) {
                    item.sources = [ item.route[ 0 ] ];
                    item.targets = [ item.route[ 1 ] ];
                }
                if ( item.reverse ) {
                    var s = item.sources;
                    item.sources = item.targets;
                    item.targets = s;
                }
                if (item.bidir==1 && (item.label == null || item.label == "")) {
                    item.label = " "; // Avoid too short edge, otherwise the 2 arrow-heads will overlap.
                }
                if ( !item.labels && item.label ) {
                    item.labels = [ { text:item.label } ];
                }
                var labels = item.labels;
                if ( labels ) {
                    labels.forEach( function( item, index ) {
                        if ( typeof( item ) == "string" ) {
                            var newItem = { text:item }
                            labels[ index ] = newItem;
                            item = newItem;
                        }
                        if ( ( item.text || item.text == "" ) && !item.width && !item.height ) {
                            var tempText = drawDummy.text(item.text).style("font-size:" + edge_label_text_size);
                            tempTextBoundingClientRect = tempText.node.getBoundingClientRect();
                            item.width = tempTextBoundingClientRect.width + edge_label_width_padding;
                            item.height = tempTextBoundingClientRect.height + edge_label_height_padding;
                        }
                    })
                }
            } );
        }

        var children = child.children;
        if ( children ) {
            children.forEach( function( item, index ) {
                transformNode( drawDummy, item  );
            } );
        }
    }

    /**
     * Takes the output from ElkJS, renders it into SVG using SVG.js and returns the result
     * @param {string} div_id
     * @param {elkObject} diagram_layout
     * @returns {string} svg
     */
    var diagram = function( div_id, diagram_layout ) {

        var diagramElement = document.getElementById(div_id);
        diagramElement.innerHTML = "";

        var draw = SVG(div_id).size( diagram_layout.width, diagram_layout.height );

        node( draw, diagram_layout, 0, 0 );
    }

    var node = function( draw, child, offsetX, offsetY ) {
        var group = draw.group();

        var childColor;
        if ( child.color )
            childColor = child.color;
        else
            childColor = node_fill_color;

        var portColor = ( child.highlight || child.highlight == 0 ) ? port_highlight_fill_color[ child.highlight ] : port_fill_color;

        node_body( group, child.id, child.x + offsetX, child.y + offsetY, child.width, child.height, childColor, child.highlight, portColor, child.constant );

        var labels = child.labels;
        if ( labels ) {
            labels.forEach( function( item, index ){
                // group.rect( item.width, item.height ).attr({ fill:"#EEE" }).move(offsetX + child.x+item.x, offsetY + child.y+item.y );

                var labelText = ( ( item.text || item.text == "" ) ? item.text : item.id );
                var nameSize;
                var nameColor;
                if ( child.port ) {
                    nameSize = node_port_name_font_size;
                    nameColor = node_port_name_text_color;
                }
                else {
                    nameSize = node_name_font_size;
                    nameColor = ( child.highlight || child.highlight == 0 ) ? node_highlight_name_text_color[ child.highlight ] : node_name_text_color;
                }
                var nodeNameText;
                if ( item.type ) {
                    var typeColor = ( child.highlight == 0 ) ? nameColor : node_type_text_color;

                    nodeNameText = group.text(labelText).style("font-size:"+node_type_font_size).fill({color:typeColor});
                }
                else
                    nodeNameText = group.text(labelText).style("font-size:"+nameSize).fill({color:nameColor});
                if ( child.port ) {
                    var nodeNameTextWidth = nodeNameText.node.getComputedTextLength();
                    nodeNameText.move(offsetX + child.x+item.x+(item.width-nodeNameTextWidth)/2, offsetY + child.y+item.y + node_label_height_padding/2);
                }
                else
                    nodeNameText.move(offsetX + child.x + item.x, offsetY + child.y + item.y );
            } );
        }

        var edges = child.edges;
        if ( edges ) {
            edges.forEach( function( item, index ) {
                edge( group, item, offsetX + child.x, offsetY + child.y );
            } );
        }

        var children = child.children;
        if ( children ) {
            children.forEach( function( item, index ) {
                node( group, item, child.x + offsetX, child.y + offsetY  );
            } );
        }

        var ports = child.ports;
        if ( ports ) {
            ports.forEach( function( item, index ){
                var portText;
                if ( item.label)
                    portText = item.label;
                else
                    portText = item.id;

                var strokeWidth;
                var strokeColor;
                var fillColor;
                var nameColor;

                if ( item.param ) {
                    nameColor = ( child.highlight || child.highlight == 0 ) ? node_highlight_name_text_color[ child.highlight ] : node_name_text_color;
                    strokeWidth = child.highlight ? node_highlight_stroke_width : node_stroke_width;
                    strokeColor = portColor;
                    fillColor = childColor;
                } else {
                    nameColor = port_text_color;
                    strokeWidth = 0;
                    strokeColor = portColor;
                    fillColor = portColor;
                }

                group.rect(item.width, item.height).move(offsetX + child.x+item.x,offsetY + child.y+item.y)
                                                   .attr({ fill:fillColor, 'stroke-width': strokeWidth, stroke:strokeColor })
                                                   .stroke({width:strokeWidth});
                var portTextItem = group.text(portText).style("font-size:"+port_name_font_size).fill({color:nameColor});
                var portTextWidth = portTextItem.node.getComputedTextLength();


                if ( item.vertical ) {
                    //group.rect(item.width, item.height).move(offsetX + child.x+item.x,offsetY + child.y+item.y)
                    //                                   .attr({ fill:childColor, 'stroke-width': node_stroke_width, stroke:portColor })
                    //                                   .stroke({width:strokeWidth});
                    //var portTextItem = group.text(portText).style("font-size:"+port_name_font_size).fill({color:nameColor});
                    //var portTextWidth = portTextItem.node.getComputedTextLength();
                    portTextItem.transform( { rotation:90, cx:0, cy:0  } ).move( offsetY + child.y+item.y+(item.height-portTextWidth)/2, -(offsetX + child.x+item.x+item.width-(item.width-port_name_font_size)/2 + 2) );
                }
                else {
                    //group.rect( item.width, item.height ).attr({ fill:portColor }).move(offsetX + child.x+item.x, offsetY + child.y+item.y );
                    //var portTextItem = group.text(portText).style("font-size:"+port_name_font_size).fill({color:port_text_color});
                    //var portTextWidth = portTextItem.node.getComputedTextLength();
                        // draw the background
                    portTextItem.move(offsetX + child.x+item.x+(item.width-portTextWidth)/2, offsetY + child.y+item.y + 2);
                }
            } )
        }

        return group;
    }

    var node_body = function( draw, name, x, y, width, height, color, highlight, stroke_color, constant ) {
        var group = draw.group();
        var strokeWidth = highlight ? node_highlight_stroke_width : node_stroke_width;
        var shape;
        if ( constant ) {
            shape = group.polygon( [[0,0],[width-node_constant_notch,0],[width,node_constant_notch],[width,height],[0,height]]);
        } else {
            shape = group.rect(width, height);
        }
        shape.attr({ fill:color, 'stroke-width': node_stroke_width, stroke:stroke_color }).stroke({width:strokeWidth}).move(x,y);
        return group;
    }

    var edge = function( draw, edge, offsetX, offsetY ) {
        function vectorDirection(dx, dy) {
            if (dy <= dx && dy >= -dx) {
                return VECTOR_ORIENTS.EAST;
            } else if (dy < dx && dy < -dx) {
                return VECTOR_ORIENTS.NORTH;
            } else if (dy >= dx && dy <= -dx) {
                return VECTOR_ORIENTS.WEST;
            }
            return VECTOR_ORIENTS.SOUTH;
        }

        function createInvShortTermVector(termOrient, length) {
            switch (termOrient) {
                case VECTOR_ORIENTS.EAST:
                    return {x: -length, y: 0};
                case VECTOR_ORIENTS.NORTH:
                    return {x: 0, y: length};
                case VECTOR_ORIENTS.WEST:
                    return {x: length, y: 0};
                default: // SOUTH
                    return {x: 0, y: -length};
            }
        }

        var group = draw.group();

        var sections = edge.sections;

        var width;
        var color;
        if ( edge.highlight || edge.highlight == 0 ) {
            if ( edge.bus ) {
                width = edge_bus_highlight_width;
                color = edge_bus_highlight_color[ edge.highlight ];
            } else {
                width = edge_highlight_width;
                color = edge_highlight_color[ edge.highlight ];
            }
        } else {
            if ( edge.bus ) {
                width = edge_bus_width;
                color = edge_bus_color[ edge.highlight ];
            } else {
                width = edge_width;
                color = edge_color[ edge.highlight ];
            }
        }

        //         var width = ( edge.bus ) ? ( edge.highlight ?  edge_bus_highlight_width : edge_bus_width ) : ( edge.highlight ? edge_highlight_width : edge_width );
        // var color = ( edge.bus ) ? ( edge.highlight ? edge_bus_highlight_color[ edge.highlight ] : edge_bus_color ): ( edge.highlight ? edge_highlight_color[ edge.highlight ] : edge_color );

        if ( sections ) {
            sections.forEach( function( item, index ) {
                var startPoint = item.startPoint;
                var endPoint = item.endPoint;

                var bendPoints = item.bendPoints;
                var termWidth = Math.max(3, width);

                var startVector = {x:0, y:0}; // the start edge vector
                var startOrient = VECTOR_ORIENTS.EAST; // the direction of the start edge
                var termVector = {x:0, y:0}; // the terminal edge goes into the node's port
                var termOrient = VECTOR_ORIENTS.EAST; // the direction of the terminal edge
                var invShortTermVector = {x:0, y:0}; // the short inverted terminal edge vector to create space for the terminal arrow-head

                /* Draw the edge. */
                if (bendPoints == null) {
                    termVector.x = endPoint.x - startPoint.x;
                    termVector.y = endPoint.y - startPoint.y;
                    termOrient = vectorDirection(termVector.x, termVector.y);
                    invShortTermVector = createInvShortTermVector(termOrient, termWidth);
                    group.line(offsetX + startPoint.x - (edge.bidir == 1)*invShortTermVector.x, offsetY + startPoint.y - (edge.bidir == 1)*invShortTermVector.y, offsetX + endPoint.x + invShortTermVector.x, offsetY + endPoint.y + invShortTermVector.y).stroke( { color:color, width:width });
                } else {
                    var segments = [];
                    segments.push( [ offsetX + startPoint.x, offsetY + startPoint.y ] );
                    bendPoints.forEach( function( item ) {
                        segments.push( [ offsetX + item.x, offsetY + item.y ] );
                    } );
                    segments.push( [ offsetX + endPoint.x, offsetY + endPoint.y ] );
                    startVector = {x: bendPoints[0].x - startPoint.x, y: bendPoints[0].y - startPoint.y};
                    startOrient = vectorDirection(startVector.x, startVector.y);
                    var shortStartVector = createInvShortTermVector(startOrient, termWidth); shortStartVector.x *= -1; shortStartVector.y *= -1;
                    var lastBendPoint = bendPoints[ bendPoints.length - 1 ];
                    termVector.x = endPoint.x - lastBendPoint.x;
                    termVector.y = endPoint.y - lastBendPoint.y;
                    termOrient = vectorDirection(termVector.x, termVector.y);
                    invShortTermVector = createInvShortTermVector(termOrient, termWidth);
                    if (edge.bidir == 1) {
                        segments[0][0] += shortStartVector.x;
                        segments[0][1] += shortStartVector.y;
                    }
                    segments[segments.length - 1][0] += invShortTermVector.x;
                    segments[segments.length - 1][1] += invShortTermVector.y;

                    group.polyline( segments ).fill('none').stroke( { color:color, width:width } );
                }

                /* Draw the arrow-head. */
                if (edge.reverse) {
                    switch (termOrient) {
                        case VECTOR_ORIENTS.EAST:
                            group.polygon([[0,0], [0,termWidth*2], [termWidth*2,termWidth]]).fill(color).move(offsetX + endPoint.x - termWidth*2, offsetY + endPoint.y - termWidth );
                            break;
                        case VECTOR_ORIENTS.NORTH:
                            group.polygon([[0,termWidth*2], [termWidth*2,termWidth*2], [termWidth,0]]).fill(color).move(offsetX + endPoint.x - termWidth, offsetY + endPoint.y);
                            break;
                        case VECTOR_ORIENTS.WEST:
                            group.polygon([[termWidth*2,0], [termWidth*2,termWidth*2], [0,termWidth]]).fill(color).move(offsetX + endPoint.x, offsetY + endPoint.y - termWidth );
                            break;
                        default: // SOUTH
                            group.polygon([[0,0], [termWidth*2,0], [termWidth,termWidth*2]]).fill(color).move(offsetX + endPoint.x - termWidth, offsetY + endPoint.y - termWidth*2);
                    }
                } else {
                    switch (termOrient) {
                        case VECTOR_ORIENTS.EAST:
                            group.polygon([[0,0], [0,termWidth*2], [termWidth*2,termWidth]]).fill(color).move(offsetX + endPoint.x - termWidth*2, offsetY + endPoint.y - termWidth);
                            break;
                        case VECTOR_ORIENTS.NORTH:
                            group.polygon([[0,termWidth*2], [termWidth*2,termWidth*2], [termWidth,0]]).fill(color).move(offsetX + endPoint.x - termWidth, offsetY + endPoint.y);
                            break;
                        case VECTOR_ORIENTS.WEST:
                            group.polygon([[termWidth*2,0], [termWidth*2,termWidth*2], [0,termWidth]]).fill(color).move(offsetX + endPoint.x, offsetY + endPoint.y - termWidth);
                            break;
                        default: // SOUTH
                            group.polygon([[0,0], [termWidth*2,0], [termWidth,termWidth*2]]).fill(color).move(offsetX + endPoint.x - termWidth, offsetY + endPoint.y - termWidth*2);
                    }
                    if (edge.bidir) {
                        switch (startOrient) {
                            case VECTOR_ORIENTS.EAST:
                                group.polygon([[termWidth*2,0], [termWidth*2,termWidth*2], [0,termWidth]]).fill(color).move(offsetX + startPoint.x, offsetY + startPoint.y - termWidth);
                                break;
                            case VECTOR_ORIENTS.NORTH:
                                group.polygon([[0,0], [termWidth*2,0], [termWidth,termWidth*2]]).fill(color).move(offsetX + startPoint.x - termWidth, offsetY + startPoint.y - termWidth*2);
                                break;
                            case VECTOR_ORIENTS.WEST:
                                group.polygon([[0,0], [0,termWidth*2], [termWidth*2,termWidth]]).fill(color).move(offsetX + startPoint.x - termWidth*2, offsetY + startPoint.y - termWidth);
                                break;
                            default: // SOUTH
                                group.polygon([[0,termWidth*2], [termWidth*2,termWidth*2], [termWidth,0]]).fill(color).move(offsetX + startPoint.x - termWidth, offsetY + startPoint.y);
                        }
                    }
                }
            } );
        }

        var labels = edge.labels;
        if ( labels ) {

            var label_color = ( edge.highlight || edge.highlight == 0 ) ? edge_label_highlight_fill_color[ edge.highlight ] : edge_label_text_color;

            labels.forEach( function( item, index ) {

                // Handy for debugging layout
                // group.rect( item.width, item.height ).attr({ fill:edge_label_color }).move(offsetX + item.x, offsetY +item.y );

                var edgeText;
                if ( item.text)
                    edgeText = item.text;
                else
                    edgeText = item.id;
                var edgeTextItem = group.text(edgeText).style("font-size:"+edge_label_text_size).fill({color:label_color});
                edgeTextItem.move(offsetX + item.x/* + (item.width-edgeTextWidth)/2*/, offsetY + item.y + edge_label_height_padding/2);

            })
        }

    }
    return {
        layout: layout
    };
})();
