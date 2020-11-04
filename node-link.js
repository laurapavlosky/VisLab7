d3.json("airports.json", d3.autoType).then((data) => {
    const width = 600;
    const height = 300;

    const svg = d3.select('.node-link-chart').append('svg')
        .attr('viewBox', [0,0,width,height]);
   

    const sizeScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, d => d.passengers))
        .range([3,15]);

    const force = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-9))
        .force('link', d3.forceLink(data.links))
        .force('center', d3.forceCenter().x(width/2).y(height/2))
        //.force('position', d3.forceX(width/2))
        //.force('position', d3.forceY(height/2));

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
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
    

    var edges = svg.selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    var nodes = svg.selectAll("circle")
        .data(data.nodes)
        .enter()
        .append('circle')
        //.attr('cx', d => d.x)
        //.attr('cy', d => d.y)
        .attr('r', d => sizeScale(d.passengers))
        .style('fill',"#FFA500")
        .call(drag(force));

    nodes.append("title")
        .text(d => d.name);
    
//    nodes.call(d3.drag()  //Define what to do on drag events
//        .on("start", dragStarted)
//        .on("drag", dragging)
//         .on("end", dragEnded));

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


    
    
    // having trouble getting dragging to work   

})