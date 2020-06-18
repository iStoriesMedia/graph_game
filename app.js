function drawGraph(dataset){
    console.log(dataset)
    // TODO change radius depending on user's screen width
    var w = 800;
    var h = 400;
    var radius = 20;

    var force = d3.forceSimulation(dataset.nodes)
                    .force("charge", d3.forceManyBody().strength(60)
                    )
                    .force("link", d3.forceLink(dataset.edges).distance(100)
                    )
                    .force("center", d3.forceCenter().x(w/2).y(h/2))
                    .force('collision', d3.forceCollide().radius(radius * 2))
                    .on('tick', tick);

    var zoom = d3.zoom().scaleExtent([0.5, 3]).extent([[0, 0], [w, h]]).on("zoom", zoomed);


    var svg = d3.select('body').append('svg')
                    .attr("viewBox", [0, 0, w, h])
                    .attr('class', 'layout')
                    .on("wheel.zoom", null)
                    .on('dblclick.zoom', null)

    
    var g = svg.append('g')
                    .attr('transfom', `translate${w}, ${h}`);

    var defs = g.append('defs');

    defs.selectAll('marker')
        .data(dataset.edges)
        .enter()
        .append('marker')
        .attr("id", function(d){
            return 'marker_' + d.target.id;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr('class', 'markerClass')
        .style('opacity', 0)
        .attr("d", "M0,-5L10,0L0,5");
        

    var edges = g.selectAll(null)
                    .data(dataset.edges)
                    .enter()
                    .append("g")
                    .style("fill", "none")
                    .style("stroke-width", 1)
                    .append("path")
                    .attr('class', 'line-group')
                    .attr('id', function(d, i){
                        return 'arrow' + i;
                    })
                    .style("opacity", 0)
                    .attr('marker-end', function(d){
                        return 'url(#marker_' + d.target.id + ')';
                    })
                    .call(zoom);

    var label = g.selectAll(null)
                    .data(dataset.edges)
                    .enter()
                    .append('g')
        
    label.append('rect')         
                    .attr('rx', 5)
                    .attr('ry', 5)
                    .attr('class', 'labelClass')
                    .attr("paint-order", "stroke")
                    .attr("stroke", "white")
                    .attr("stroke-width", 4)
                    .attr("stroke-opacity", 1)
                    .attr("stroke-linecap", "butt")
                    .attr("stroke-linejoin", "miter")
                    .style('opacity', 0);

    label.append('text')
                    .text(function(d){
                        return d.connection;
                    })
                    .attr('x', 30)
                    .attr('y', 8.5)
                    .attr('class', 'textLabel')
                    .attr('fill', 'white')
                    .attr("text-anchor", "middle")
                    .style('opacity', 0);

    var nodes = g.selectAll(null)
                    .data(dataset.nodes)
                    .enter()
                    .append('g')
                    .call(d3.drag()
                            .on('start', dragStarted)
                            .on('drag', dragging)
                            .on('end', dragEnded))
                            .on('mouseover', function(){
                                d3.select(this).style('cursor', 'pointer')
                            });

    var nodesLabel = nodes.append('text')
        .text(function(d){
                return d.name;

        })
        .attr('text-anchor', 'middle')
        .attr('y', 30)
        .attr('class', 'nodesLabel')
        .style('opacity', 0)

    var nodesLabelText = nodes.append('text')
        .text(function(d){
            if (d.text != null){
                return d.text;
            }
            return;
        })
        .attr('text-anchor', 'middle')
        .attr('y', 40)
        .attr('class', 'nodesLabelText')
        .style('opacity', 0)

    defs.selectAll('pattern')
                            .data(dataset.nodes)
                            .enter()
                            .append('pattern')
                            .attr('class', 'pattern-class')
                            .attr('id', function(d){
                                return 'pattern' + d.id;
                            })
                            .attr('height', '100%')
                            .attr('width', '100%')
                            .attr('patternContentUnits', 'objectBoundingBox')
                            .append('image')
                            .attr('height', 1)
                            .attr('width', 1)
                            .attr('preserveAspectRatio', 'none')
                            .attr('xlink:href', function(d){
                                return d.img;
                            })

    var circles = nodes.append('circle')
                            .attr('r', radius)
                            .style("fill", function(d){
                                if (d.img != null){
                                    return "url(#pattern" + d.id + ")";
                                };
                                return 'red' 
                                
                            })
                            .attr('class','circle-node');
                            

    var button = svg.append('text')
                            .text('X Очистить все')
                            .attr('x', 20)
                            .attr('y', 30)
                            .attr('class', 'clear-button')
                            .on('click', clickButton);
    
    var zoomArr = [
        {"name": "in", 'text': '+'},
        {"name": "out", 'text': '-'}
    ];
                        
    var zoomButton = svg.selectAll(null)
                            .data(zoomArr)
                            .enter()
                            .append('g')
                            .attr('transform', function(d,i){
                                return `translate(${w - 50}, ${h - 70/(i+1)})`
                            })
                            .attr('class', 'zoomButton')
                            .attr('id', function(d){
                                return 'id_' + d.name;
                            })
                            .on('click', function(d){
                                if (d.name == 'in'){
                                    return zoom.scaleBy(svg.transition(), 1.2);
                                };
                                return zoom.scaleBy(svg.transition(), 0.8); 
                            });
    
    zoomButton.append('rect')
                    .attr('width', 30)
                    .attr('height', 30)
                    .attr('rx', 2)
                    .attr('ry', 2);
    
    zoomButton.append('text')
                    .text(function(d){
                        if (d.name == 'in'){
                            return "+";
                        }
                        return '-';
                    })
                    .attr('font-size', function(d){
                        if (d.name == 'in'){
                            return 15;
                        }
                        return 20;
                    })
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('x',15)
                    .attr('y', 18);
                                           
    function zoomed() {
        g.attr("transform", d3.event.transform);
    };
    
            
    function tick(){

        edges
            .attr("d", arcLink)
        nodes
            .attr("transform", function(d){
                // d.x = Math.max(radius, Math.min(w - radius, d.x)); // This limits 
                // d.y = Math.max(radius, Math.min(h - radius, d.y));
                return "translate(" + d.x + "," + d.y + ")";
            });

        label
            .attr('transform', function(d, i){
                var pathLength = d3.select("#arrow" + i).node().getTotalLength();
                d.point = d3.select("#arrow" + i).node().getPointAtLength(pathLength / 2);
                return "translate(" + (d.point.x - 12) + ',' + d.point.y + ')';  
            });
    };

    function dragStarted(d){
        d3.selectAll('.circle-node')
            .filter(function(x){
                return x.id == d.id
            })
            .attr('stroke', '#a2a2a2')
            .classed('active', true);

        d3.selectAll('.nodesLabel')
            .filter(function(x){
                return x.id == d.id;
            })
            .style('opacity', 1)

        d3.selectAll('.nodesLabelText')
        .filter(function(x){
            return x.id == d.id;
        })
        .style('opacity', 1)
        
        d3.selectAll('.line-group')
            .filter(function(x){
                return x.target.id == d.id || x.source.id == d.id;
            })
            .style('opacity', 1);

        d3.selectAll('.markerClass')
            .filter(function(x){
                return x.target.id == d.id || x.source.id == d.id;
            })
            .style('opacity', 1)

        d3.selectAll('.labelClass')
            .filter(function(x){
                return x.target.id == d.id || x.source.id == d.id;
            })
            .style('opacity', 1)
        
        d3.selectAll('.textLabel')
            .filter(function(x){
                return x.target.id == d.id || x.source.id == d.id;
            })
            .style('opacity', 1)

        };

    function dragging(d){
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        
        tick(); 
    };

    function dragEnded(d){
        d3.selectAll('.circle-node')
            .filter(function(x){
                return x.id == d.id
            })
            .attr('stroke', null)
            .classed('active', true);
    };


    function arcLink(d){
        var sourceX = d.source.x;
        var sourceY = d.source.y;
        var targetX = d.target.x;

        var targetY = d.target.y;

        var theta = Math.atan((targetX - sourceX) / (targetY - sourceY));
        var phi = Math.atan((targetY - sourceY) / (targetX - sourceX));
        var sinTheta = radius * Math.sin(theta);
        var cosTheta = radius * Math.cos(theta);

        var sinPhi = radius * Math.sin(phi);
        var cosPhi = radius * Math.cos(phi);
        
        if (d.target.y > d.source.y) {
            sourceX = sourceX + sinTheta;
            sourceY = sourceY + cosTheta;
        }
        else {
            sourceX = sourceX - sinTheta;
            sourceY = sourceY - cosTheta;
        }

        if (d.source.x > d.target.x) {
            targetX = targetX + cosPhi;
            targetY = targetY + sinPhi;    
        }
        else {
            targetX = targetX - cosPhi;
            targetY = targetY - sinPhi;   
        }

        // Draw an arc between the two calculated points
        var dx = targetX - sourceX,
            dy = targetY - sourceY,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
    };

    function clickButton() {
        
        d3.forceSimulation(dataset.nodes)
                    .force("charge", d3.forceManyBody().strength(60)
                    )
                    .force("link", d3.forceLink(dataset.edges).distance(100)
                    )
                    .force("center", d3.forceCenter().x(w/2).y(h/2))
                    .force('collision', d3.forceCollide().radius(radius * 2))
                    .on('tick', tick);
        
        d3.selectAll('.line-group')
            .style('opacity', 0);
        d3.selectAll('.markerClass')
            .style('opacity', 0);
        d3.selectAll('.labelClass')
            .style('opacity', 0);
    };
};

d3.json('utkin.json', drawGraph);