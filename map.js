//d3.json("airports.json", d3.AutoType).then(airports=>{
	d3.json("world-110m.json", d3.AutoType).then(wordmap=>{

        const features = topojson.feature(wordmap, wordmap.objects.countries).features;
        console.log("features", features);
        const width = 600;
        const height = 400;

        console.log("map",wordmap)

        const svg = d3.select('.map-chart').append('svg')
        .attr('viewBox', [0,0,width,height]);

        const projection = d3.geoMercator()
            .fitExtent([[0,0], [width,height]], features);

        const path = d3.geoPath()
            .projection(projection);

        svg.selectAll("path")
            .data(features)
            .join('path')
            .attr("d", path)
            .attr('fill', "black");

        
        svg.append("path")
            .datum(topojson.mesh(wordmap, wordmap.objects.countries))
            .attr("d", path)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr("class", "subunit-boundary");
     

        // vis not coming up
        

	});
//});