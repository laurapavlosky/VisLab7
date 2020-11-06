d3.json("airports.json", d3.AutoType).then(airports=>{
	d3.json("world-110m.json", d3.AutoType).then(worldmap=>{

        // set up SVG with viewBox
        const width = 600;
        const height = 300;

        const svg = d3.select('.map-chart').append('svg')
        .attr('viewBox', [0,0,width,height]);

        // --- MAP --- //
        // convert TopoJSON to GeoJSON
        const features = topojson.feature(worldmap, worldmap.objects.countries).features;
        console.log("features", features);
        console.log("map",worldmap)

        // create projection
        const projection = d3.geoMercator()
            .fitExtent([[0,0], [width,height]],topojson.feature(worldmap, worldmap.objects.countries))
            .scale(49);  //features

        // create path generator
        const path = d3.geoPath()
            .projection(projection);

        // create map
        svg.selectAll("path")
            .data(features)
            .join('path')
            .attr("d", path)
            .attr('fill', "black")
            .attr("opacity", 0);
    
        // add white boundary lines
        svg.append("path")
            .datum(topojson.mesh(worldmap, worldmap.objects.countries))
            .attr("d", path)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr("class", "subunit-boundary");

        // vis not coming up

        // --- FORCE --- //
        // create size scale for nodes
        const sizeScale = d3.scaleLinear()
            .domain(d3.extent(airports.nodes, d => d.passengers))
            .range([2,8]);

        // create force simulation
        const force = d3.forceSimulation(airports.nodes)
            .force('charge', d3.forceManyBody())
            .force('link', d3.forceLink(airports.links))
            .force('x', d3.forceX(width/2))
            .force('y', d3.forceY(height/2));

        // support dragging
        let drag = force => {
            function dragstarted(event) {
                if (!event.active) force.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
    
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
    
            function dragended(event) {
                if (!event.active) force.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
    
            return d3.drag()
                .filter(event => visType === "force")
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
    
        // create nodes and links
        var edges = svg.selectAll("line")
            .data(airports.links)
            .enter()
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", 1);

        var nodes = svg.selectAll("circle")
            .data(airports.nodes)
            .enter()
            .append('circle')
            .attr('r', d => sizeScale(d.passengers))
            .style('fill',"#FFA500")
            .call(drag(force));

        // append title for tooltip
        nodes.append("title")
            .text(d => d.name);
    
        // update SVG elements
        force.on('tick', function() {
            edges
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        
            nodes
                .attr("cx", d => d.x)
                .attr('cy', d => d.y);
    });


        // --- SWITCH BETWEEN LAYOUTS --- //
        let visType = "force";
        switchLayout();
        d3.selectAll("input[name=type]").on('change', event => {
            visType = event.target.value;
            switchLayout();
        })
        

        function switchLayout() {
            // geograpic layout
            if (visType == "map") {
                //stop sim
                force.alphaTarget(0.5).stop();
                // set positions of nodes
                nodes
                    .transition().duration(1000)
                    .attr("cx", d => projection([d.longitude, d.latitude])[0])
                    .attr('cy', d => projection([d.longitude, d.latitude])[1])
                // set positions of links
                edges 
                    .transition().duration(1000) 
                    .attr('x1', d => projection([d.source.longitude, d.source.latitude])[0])
                    .attr('y1', d => projection([d.source.longitude, d.source.latitude])[1])
                    .attr('x2', d => projection([d.target.longitude, d.target.latitude])[0])
                    .attr('y2', d => projection([d.target.longitude, d.target.latitude])[1]);
                // set map opcacity to 1
                svg.selectAll("path").attr('opacity', 1);
                
            }
            // force layout
            else { // how do i do transitions here
                // restart sim
                force.alphaTarget(0.3).restart();   
                // set map opacity to 0
                svg.selectAll("path").transition().duration(500).attr("opacity", 0);

            }
        }
        
        

	});
});