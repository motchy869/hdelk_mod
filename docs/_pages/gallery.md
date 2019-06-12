---
layout: single
permalink : /gallery
toc: true
toc_label: Contents
toc_sticky: true
title: Gallery
header:
  title: Gallery
  overlay_image: /assets/images/banner.svg
---

<!-- ---------------------------------------------------------------------------------------------------------------------------------------- -->

## Banner Live

<div id="title_diagram"></div>

<script>
    var title_graph = {
        color: "#555",
        children: [
            { id: "in", port: 1, highlight:1 },
            { id: "one", color: "#999", ports: ["in", "out"] },
            { id: "two", color: "#999", ports: ["in", "out"] },
            { id: "three", color: "#999", ports: ["in", "out"] },
            { id: "four", label:"", inPorts:["in"], outPorts:["out"],
              color: "#666",
              children:[
                {id:"Child1", highlight:2, ports:["in", "outA", "outB"]},
                {id:"Child2A", highlight:3, ports:["in", "out"]},
                {id:"Child2B", highlight:5, ports:["in", "out"]},
                {id:"Child3", highlight:4, ports:["inA", "inB", "out"]}
               ],
              edges:[
                [ "four.in", "Child1.in" ],
                [ "Child1.outA", "Child2A.in" ],
                [ "Child1.outB", "Child2B.in" ],
                [ "Child2A.out", "Child3.inA" ],
                [ "Child2B.out", "Child3.inB" ],
                [ "Child3.out", "four.out" ]
              ] },
            { id: "five", color: "#999", ports: ["in", "out"] },
            { id: "six", color: "#999", ports: ["in", "out"] },
            { id: "seven", color: "#999", ports: ["in", "out"] },
            { id: "out", port: 1, highlight:1 }
        ],
        edges: [
            ["in","one.in"],
            {route:["one.out","two.in"]},
            {route:["two.out","three.in"]},
            {route:["three.out","four.in"] },
            {route:["four.out","five.in"] },
            {route:["five.out","six.in"] },
            {route:["six.out","seven.in"] },
            {route:["seven.out","out"] }
        ]
    }

    hdelk.layout( title_graph, "title_diagram" );


</script>

<!-- ---------------------------------------------------------------------------------------------------------------------------------------- -->

## HDElk Architecture

<div id="HDElk_diagram"></div>

<script type="text/javascript">

    const HDElk_graph = {
        children: [
            { id: "diagram", highlight:2, type:"JSON" },
            { id: "HDElk", highlight:1, label:"", height:80, inPorts: [ "layout()" ], outPorts:[ { id:"svg", label:" " }  ],
                children: [
                    { id: "transform()", width:90, type:"JavaScript" },
                    { id: "Elk.js", type:"Library" },
                    { id: "diagram()", type:"JavaScript" },
                    { id: "SVG.js", type:"Library" },
                ],
                edges:[
                    ["HDElk.layout()", "transform()" ],
                    ["transform()", "Elk.js" ],
                    ["Elk.js", "diagram()" ],
                    ["diagram()", "SVG.js" ],
                    ["SVG.js", "HDElk.svg" ],
                ]
            },
            { id: "webpage", highlight:4, type:"HTML", ports: [ "div" ] }
        ],
        edges: [ ["diagram","HDElk.layout()"], ["HDElk.svg","webpage.div"] ]
    }

    hdelk.layout( HDElk_graph, "HDElk_diagram" );
</script>

<!-- ---------------------------------------------------------------------------------------------------------------------------------------- -->

## SpokeFPGA Pipeline Example

<div id="hello_function_tester"></div>

<script type="text/javascript">

    var graph = {
        color: "#EEE",
        children: [
            { id: "HOST", outPorts: ["usb"],
                children: [
                    { id: "term", label: "Serial Terminal", type: "10,20"  }
                ],
                edges: [
                    ["term", "HOST.usb"]
                ]
             },
            { id: "FPGA", inPorts: [ "usb"],
                children: [
                    { id: "usb_s", label:"USB CDC", inPorts: ["usb"], outPorts:[ "in", "out" ]  },
                    { id: "param1", type:"remove int string", inPorts: ["in"], outPorts:[ "out" ], southPorts:["int"]  },
                    { id: "param2", type:"remove int string", inPorts: ["in"], outPorts:[ "out" ], southPorts:["int"]  },
                    { id: "f", label:"f(a,b)->c", inPorts:["a", "b" ], outPorts:["c"], highlight:4  },
                    { id: "return", type:"add int string", inPorts: ["in"], northPorts:["int"], outPorts:[ "out" ]  },
                    { id: "unique", inPorts: ["in"], outPorts:[ "out" ]  }
                ],
                edges: [
                    ["usb_s.out","param1.in" ],
                    ["param1.out","param2.in" ], 
                    ["param1.int","f.a" ], 
                    ["param2.int","f.b" ], 
                    ["f.c","return.int" ], 
                    ["return.out","unique.in" ], 
                    ["unique.out","usb_s.in" ], 
                    ["FPGA.usb","usb_s.usb" ]
                ] }
        ],
        edges: [
            [ "HOST.usb","FPGA.usb" ]
        ]
    }

    hdelk.layout( graph, "hello_function_tester" );
</script>

## SpokeFPGA Pipeline Portly

<div id="pipe_helper_modules"></div>

<script type="text/javascript">

    var graph = {
        children: [
            { id: "p1", type:"Producer", outPorts: ["out_pipe"],
                children: [
                    { id: "p1p1", label:"", port:1, inPorts:["out_start", "out_stop", "out_data", "out_valid", "out_ready" ], outPorts: ["out_pipe"]  },
                    { id: "Internals", type:"Verilog", outPorts:["out_start", "out_stop", "out_data", "out_valid", "out_ready" ]  }
                ],
                edges: [
                    { route:["p1p1.out_pipe","p1.out_pipe"], bus:1 },
                    ["Internals.out_start","p1p1.out_start"],
                    ["Internals.out_stop","p1p1.out_stop"],
                    { route:["Internals.out_data","p1p1.out_data"], bus:1 },
                    ["Internals.out_valid","p1p1.out_valid"],
                    ["p1p1.out_ready","Internals.out_ready"] 
                ]
             },
            { id: "p2", type:"Consumer", inPorts: [ "in_pipe"],
                children: [
                    { id: "p2p1", label:"", port:1, inPorts: ["in_pipe"], outPorts:["in_start", "in_stop", "in_data", "in_valid", "in_ready" ],  },
                    { id: "Internals", type:"Verilog", inPorts:["in_start", "in_stop", "in_data", "in_valid", "in_ready" ],  }
                ],
                edges: [
                    { route:["p2.in_pipe","p2p1.in_pipe"], bus:1 },
                    ["p2p1.in_start","Internals.in_start"],
                    ["p2p1.in_stop","Internals.in_stop"],
                    { route:["p2p1.in_data","Internals.in_data"], bus:1 },
                    ["p2p1.in_valid","Internals.in_valid"],
                    ["Internals.in_ready","p2p1.in_ready"] 
                ] }
        ],
        edges: [
            { route:["p1.out_pipe","p2.in_pipe"], bus:1 }
        ]
    }

    hdelk.layout( graph, "pipe_helper_modules" );
</script>