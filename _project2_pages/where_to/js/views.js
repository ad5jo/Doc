$(document).ready(function () {
    //Width and height of map
    var x = window.innerWidth * .7;
    var y = window.innerHeight + 10;
    var occupation;
    var domainMin;
    var domainMax;
    var cityImages;
    var cityValidation;
    var occupationValidation;


    $.getScript("assets/js/list_of_jobs.js", function () {
        occupationValidation = data
        $('#occupation-auto').autocomplete({
            data,
            limit: 20,
        });

    });

    $.getScript("assets/js/list_of_cities.js", function () {
        cityValidation = data;
        $('.city-auto').autocomplete({
            data,
            limit: 20,
        });

    });


    var refresh_btn = $("<button id='refresh' class='waves-effect waves-light btn cyan lighten-3'>I'm Feeling Lucky</button>");
    var start_over = $("<button class='waves-effect waves-light btn cyan lighten-3 scroll-up start-over'>Start Over</button>");

    $(".slider").slider({
        transition: 2000,
        interval: 4000,
        indicators: false
    });


    $(".dropdown-button").click(function () {
        $("#dropdown1").css("display", "block");
        $("#dropdown1").mouseleave(function () {
            $("#dropdown1").css("display", "none");
        });
    });

    $("#dropdown1").mouseleave(function () {
        $("#dropdown1").css("display", "none");
    });

    $("#find-btn").click(function () {
        $(".slider-adjustment").css("position", "absolute");
        $("#compare-cities").css("display", "none");
        $("#heatmap").css("display", "none");
        $("#comparison").css("display", "none");
        $("#find-your-city").css("display", "block");
        $('html, body').animate({
            scrollTop: $("#find-your-city").offset().top
        }, 2000);
    });

    $("#compare-btn").click(function () {
        $(".slider-adjustment").css("position", "absolute");
        $("#find-your-city").css("display", "none");
        $("#heatmap").css("display", "none");
        $("#comparison").css("display", "none");
        $("#compare-cities").css("display", "block");
        $('html, body').animate({
            scrollTop: $("#compare-cities").offset().top
        }, 2000);
    });

    function scrollUp(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $("body").offset().top
        }, 1500);
    };

    $("#find-submit").click(function (e) {
        occupation = $("#occupation-auto").val();

        if (occupationValidation.hasOwnProperty(occupation)) {
            console.log("Occupation:" + occupationValidation);
            e.preventDefault();
            x = window.innerWidth * .7;
            y = window.innerHeight + 10;
            drawMap();
            $("#heatmap").css("display", "block");
            $("#heatmap").append(start_over);
            $('html, body').animate({
                scrollTop: $("#heatmap").offset().top
            }, 1500);
        }

    });
    $("#compare-submit").click(function (e) {
        var city1 = $('#city1').val();
        var city2 = $('#city2').val();
        var cityArr = [];
        if (cityValidation.hasOwnProperty(city1) && cityValidation.hasOwnProperty(city2)) {
            e.preventDefault();
            x = window.innerWidth * .7;
            y = window.innerHeight + 10;
            $.post("/api/logs/" + city1, function (res) {
                console.log("Sending city: " + city1);
            });
            $.post("/api/logs/" + city2, function (res) {
                console.log("Sending city: " + city2);
            });
            $.get("/api/data/" + city1, function (res) {
                cityArr.push(res);
                $.get("/api/data/" + city2, function (res) {
                    //d3 create badass map point.res
                    cityArr.push(res);
                    drawCharts(cityArr);
                    $("#comparison").css("display", "block");
                    $("#comparison").append(refresh_btn);
                    $("#comparison").append(start_over);
                    $('html, body').animate({
                        scrollTop: $("#comparison").offset().top
                    }, 2000); //this is async so it is happening after the button and therefore deleting the button
                });

            });
        }
    });

    //D3 code beyond this point
    /*  This visualization was made possible by modifying code provided by:

        Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
        https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
        
        Malcolm Maclean, tooltips example tutorial
        http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

        Mike Bostock, Pie Chart Legend
        http://bl.ocks.org/mbostock/3888852      */

    function drawMap() {

        $("#heatmap").empty();
        // D3 Projection
        var projection = d3.geo.albersUsa()
            .translate([x / 2, y / 2]) // translate to center of screen
            .scale([1000]); // scale things down so see entire US


        // Define path generator
        var path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
            .projection(projection); // tell path generator to use albersUsa projection

        var legendText = ["Nope!", "Your Destiny is Calling!"];

        //Create SVG element and append map to the SVG
        var canvas = d3.select("#heatmap")
            .append("svg")
            .attr("width", x)
            .attr("height", y);

        // Append Div for tooltip to SVG
        var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Load GeoJSON data and merge with states data
        d3.json("/assets/geojson/us-states.json", function (json) {

            // Loop through each state data value in the .csv file
            for (var i = 0; i < data.length; i++) {

                // Grab State Name
                var dataState = data[i].state;

                // Grab data value 
                var dataValue = data[i].visited;

                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {

                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {

                        // Copy the data value into the JSON
                        json.features[j].properties.visited = dataValue;

                        // Stop looking through the JSON
                        break;
                    }
                }
            }



            // Bind the data to the canvas and create one path per GeoJSON feature
            canvas.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "grey")
                .style("stroke-width", "1")
                .style("fill", "#f5f5f5");

            var cityData;

            $.get("/api/whereto/" + occupation, function (res) {
                console.log(occupation);
                cityData = res;
                var last = res.length - 1;
                domainMin = Math.floor(res[0].bang4Yabuk * 1000);
                domainMax = Math.floor(res[last].bang4Yabuk * 1000);


                var coordinateColor = d3.scale.linear()
                    .domain([domainMin, domainMax])
                    .range(["#3DC6EF", "#F9DC70"]);

                canvas.selectAll("circle")
                    .data(cityData)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {

                        return projection([d.longitude, d.latitude])[0];
                    })
                    .attr("cy", function (d) {
                        return projection([d.longitude, d.latitude])[1];
                    })
                    .attr("r", 6)

                    .attr("fill", function (d) {
                        // console.log(Math.floor(d.bang4Yabuk * 1000));
                        return coordinateColor(Math.floor(d.bang4Yabuk * 1000));
                    })
                    // .style("opacity", 0.85)  

                    // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
                    // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                    //STYLE CONTROLLED BY DIV.TOOLTIPS ABOVE
                    .on("mouseover", function (d) {
                        div.transition()
                            //when mouse over controls how fast blurb populates        
                            .duration(200)
                            //control blurb popup opacity  
                            .style("opacity", 1);
                        //writes information to the blurb
                        div.html(d.city + "," + d.stateInitial + "<br/>" + "Average Salary: $" + d.aMean + "<br/>" + "CPI: " + d.cpi)
                            //controls X placement of the blurb - left,right,center
                            .style("left", (d3.event.pageX) + "px")
                            //controls Y placement of the blurb - up,down
                            .style("top", (d3.event.pageY - 28) + "px");
                        console.log(d.city)
                    })

                    // fade out tooltip on mouse out               
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
                var legend = d3.select("#heatmap").append("svg")
                    .attr("class", "legend")
                    .attr("width", 140)
                    .attr("height", 200)
                    .selectAll("g")
                    .data(coordinateColor.domain().slice().reverse())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                        return "translate(0," + i * 20 + ")";
                    });

                legend.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", coordinateColor);

                legend.append("text")
                    .data(legendText)
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function (d) {
                        return d;
                    });
            });



            //Might have to be a bonus feature
            // var arcInfo = {
            //     type: "LineString",
            //     coordinates: [
            //         [-74.0059413, 40.7127837],
            //         [-97.7430608, 30.267153]

            //     ]
            // };

            // canvas.append("path")
            //     .attr("d", function() {
            //         return path(arcInfo);
            //     })
            //     .attr("stroke-width", "2")
            //     .attr("stroke", "black");

        });

    };
    /****************************************************************************
        CODE FOR CHARTS

    *******************************************************************************/

    function drawCharts(data) {
        $("#comparison").empty();
        var cityNames = [];
        for (var i = 0; i < data.length; i++) {
            cityNames.push(data[i].areaName1);
        }
        var cpiValues = [
            [],
            []
        ];
        cityImages = [data[0].imageLink, data[1].imageLink];
        for (var i = 0; i < data.length; i++) {
            cpiValues[i].push(data[i].cpi);
            cpiValues[i].push(data[i].costOfLivingPlusRentIndex);
            cpiValues[i].push(data[i].restaurantPriceIndex);
            cpiValues[i].push(data[i].rentIndex);
            cpiValues[i].push(data[i].groceriesIndex);
            cpiValues[i].push(data[i].localPurchasingPowerIndex);
        }

        var donutData = genData(cityNames, cpiValues, cityImages);
        var donuts = new DonutCharts();
        donuts.create(donutData);
        //This might have to be a bonus feature
        // function refresh() {
        //     donuts.update(genData([data.costOfLivingPlusRentIndex, data.cpi, data.restaurantPriceIndex, data.rentIndex]));
        // }
        // $(document).on('click', "#refresh", refresh);
    };



    function DonutCharts() {

        var charts = d3.select('#comparison');
        var chart_m,
            chart_r;

        var getCatNames = function (dataset) {
            var catNames = new Array();

            for (var i = 0; i < dataset[0].data.length; i++) {
                catNames.push(dataset[0].data[i].cat);
            }

            return catNames;
        }

        var createLegend = function (catNames) {
            var legends = charts.select('.legend')
                .selectAll('g')
                .data(catNames)
                .enter().append('g')
                .attr('transform', function (d, i) {
                    return 'translate(' + (i * 175 + 50) + ', 20)';
                    // return 'translate(' + (i * 150 + d[i-1].length) + ', 20)';
                });

            legends.append('circle')
                .attr('class', 'legend-icon')
                .attr('r', 6)
                .style('fill', function (d, i) {
                    var arr = ['#F9DC70', '#C2F970', '#3DC6EF', '#7DCED5', '#1A5D8F', '#EF1C2A']
                    return arr[i];
                });

            legends.append('text')
                .attr('dx', '1em')
                .attr('dy', '.3em')
                .text(function (d) {

                    return d;
                });
        }

        var createCenter = function (images) {

            var eventObj = {
                'mouseover': function (d, i) {
                    d3.select(this)
                        .transition()
                        .attr("r", chart_r * 0.65);
                },

                'mouseout': function (d, i) {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .ease('bounce')
                        .attr("r", chart_r * 0.6);
                },

                'click': function (d, i) {
                    var paths = charts.selectAll('.clicked');
                    pathAnim(paths, 0);
                    paths.classed('clicked', false);
                    resetAllCenterText();
                }
            }

            var body = d3.select("body");
            var svg = body.append("svg")
                .attr("width", 500)
                .attr("height", 500);

            var defs = svg.append("svg:defs");
            //TODO need to make the pictures scale better
            var circle1 = defs.append("svg:pattern")
                .attr("id", "city0")
                .attr("width", 1)
                .attr("height", 1)
                .attr("x", 0)
                .attr("y", 0)
                .append("svg:image")
                .attr("xlink:href", function (d, i) {
                    return images[0]
                })
                .attr("width", chart_r * 3)
                .attr("height", chart_r * 2.5)
                .attr("x", 0)
                .attr("y", (chart_r / 1.6) * -1);


            var circle2 = defs.append("svg:pattern")
                .attr("id", "city1")
                .attr("width", 1)
                .attr("height", 1)
                .attr("x", 0)
                .attr("y", 0)
                .append("svg:image")
                .attr("xlink:href", function (d, i) {
                    return images[1]
                })
                .attr("width", chart_r * 3)
                .attr("height", chart_r * 2.5)
                .attr("x", 0)
                .attr("y", (chart_r / 1.6) * -1);

            var donuts = d3.selectAll('.donut');

            // The circle displaying total data.
            donuts.append("svg:circle")
                .attr("r", chart_r * 0.6)
                .attr("fill", "#fff")

                .attr("fill", function (d, i) {
                    return "url(#city" + i + ")"
                })
                .on(eventObj);

            donuts.append('text')
                .attr('class', 'center-txt type')
                .attr('y', chart_r * -0.16)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style("fill", "white")
                .text(function (d, i) {
                    return d.type;
                });
            donuts.append('text')
                .attr('class', 'center-txt value')
                .attr('text-anchor', 'middle')
                .style("fill", "white");
            donuts.append('text')
                .attr('class', 'center-txt percentage')
                .attr('y', chart_r * 0.16)
                .attr('text-anchor', 'middle')
                .style('fill', 'white');
        }

        var setCenterText = function (thisDonut) {
            var sum = d3.sum(thisDonut.selectAll('.clicked').data(), function (d) {
                return d.data.val;
            });

            thisDonut.select('.value')
                .text(function (d) {
                    return (sum) ? sum.toFixed(1) + d.unit : d.total.toFixed(1) + d.unit;
                });
            thisDonut.select('.percentage')
                .text(function (d) {
                    return (sum)

                });
        }

        var resetAllCenterText = function () {
            charts.selectAll('.value')
                .text(function (d) {
                    return d.total.toFixed(1) + d.unit;
                });
            charts.selectAll('.percentage')
                .text('');
        }

        var pathAnim = function (path, dir) {
            switch (dir) {
                case 0:
                    path.transition()
                        .duration(500)
                        .ease('bounce')
                        .attr('d', d3.svg.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(chart_r)
                        );
                    break;

                case 1:
                    path.transition()
                        .attr('d', d3.svg.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(chart_r * 1.08)
                        );
                    break;
            }
        }

        var updateDonut = function () {

            var eventObj = {

                'mouseover': function (d, i, j) {
                    pathAnim(d3.select(this), 1);

                    var thisDonut = charts.select('.type' + j);
                    thisDonut.select('.value').text(function (donut_d) {
                        return d.data.val.toFixed(1) + donut_d.unit;
                    });
                    thisDonut.select('.percentage').text(function (donut_d) {
                        return (d.data.val / donut_d.total * 100).toFixed(2) + '%';
                    });
                },

                'mouseout': function (d, i, j) {
                    var thisPath = d3.select(this);
                    if (!thisPath.classed('clicked')) {
                        pathAnim(thisPath, 0);
                    }
                    var thisDonut = charts.select('.type' + j);
                    setCenterText(thisDonut);
                },

                'click': function (d, i, j) {
                    var thisDonut = charts.select('.type' + j);

                    if (0 === thisDonut.selectAll('.clicked')[0].length) {
                        thisDonut.select('circle').on('click')();
                    }

                    var thisPath = d3.select(this);
                    var clicked = thisPath.classed('clicked');
                    pathAnim(thisPath, ~~(!clicked));
                    thisPath.classed('clicked', !clicked);

                    setCenterText(thisDonut);
                }
            };

            var pie = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d.val;
                });

            var arc = d3.svg.arc()
                .innerRadius(chart_r * 0.7)
                .outerRadius(function () {
                    return (d3.select(this).classed('clicked')) ? chart_r * 1.08 : chart_r;
                });

            // Start joining data with paths
            var paths = charts.selectAll('.donut')
                .selectAll('path')
                .data(function (d, i) {
                    return pie(d.data);
                });

            paths
                .transition()
                .duration(1000)
                .attr('d', arc);

            paths.enter()
                .append('svg:path')
                .attr('d', arc)
                .style('fill', function (d, i) {
                    var arr = ['#F9DC70', '#C2F970', '#3DC6EF', '#7DCED5', '#1A5D8F', '#EF1C2A']
                    return arr[i];
                })
                .style('stroke', '#FFFFFF')
                .on(eventObj)

            paths.exit().remove();

            resetAllCenterText();
        }

        this.create = function (dataset) {
            var $charts = $('#comparison');
            chart_m = $charts.innerWidth() / dataset.length / 2 * 0.14;
            chart_r = $charts.innerWidth() / dataset.length / 2 * 0.85;

            charts.append('svg')
                .attr('class', 'legend')
                .attr('width', '100%')
                .attr('height', 50)
                .attr('transform', 'translate(0, -100)');

            var donut = charts.selectAll('.donut')
                .data(dataset)
                .enter().append('svg:svg')
                .attr('width', (chart_r + chart_m) * 2)
                .attr('height', (chart_r + chart_m) * 2)
                .append('svg:g')
                .attr('class', function (d, i) {
                    return 'donut type' + i;
                })
                .attr('transform', 'translate(' + (chart_r + chart_m) + ',' + (chart_r + chart_m) + ')');

            createLegend(getCatNames(dataset));
            createCenter(cityImages);

            updateDonut();
        }

        this.update = function (dataset) {
            // Assume no new categ of data enter
            var donut = charts.selectAll(".donut")
                .data(dataset);

            updateDonut();
        }
    }


    /*
     * Returns a json-like object.
     */
    function genData(x, y) {

        var cityNames = x;
        var unit = ['cpi', 'cpi'];
        var cat = ['Consumer Price Index', 'Cost of Living + Rent Index', 'Restaurant Price Index', 'Rent Index', 'Groceries Index', 'Local Purchasing Power'];
        var cpiValues = y;

        var dataset = new Array();

        for (var i = 0; i < cityNames.length; i++) {
            var data = new Array();
            var total = 0;

            for (var j = 0; j < cat.length; j++) {
                var value = cpiValues[i][j]
                total += value;
                data.push({
                    "cat": cat[j],
                    "val": value
                });
            }

            dataset.push({
                "type": cityNames[i],
                "unit": unit[i],
                "data": data,
                "total": total
            });
        }
        return dataset;
    }

    $(document).on("click", ".scroll-up", scrollUp);
});