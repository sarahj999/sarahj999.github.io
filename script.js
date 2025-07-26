document.addEventListener('DOMContentLoaded', init);
async function init() {
  const scenes = ['#scene_1', '#scene_2', '#scene_3'];
  let sceneIndex = 0;

  // Load the Data
  const data = await d3.csv("https://flunky.github.io/cars2017.csv", d => ({
    Make: d.Make,
    Fuel: d.Fuel,
    EngineCylinders: +d.EngineCylinders,
    AverageHighwayMPG: +d.AverageHighwayMPG,
    AverageCityMPG: +d.AverageCityMPG
  }));

  // sort it for selection
  const makes = Array.from(new Set(data.map(d => d.Make)));
  const fuels = Array.from(new Set(data.map(d => d.Fuel)));
  const cylinders = Array.from(new Set(data.map(d => d.EngineCylinders)));
  const mpgs = Array.from(new Set(data.map(d => d.AverageHighwayMPG)))

  console.log(makes)
  console.log(fuels)
  console.log(cylinders)

  // create methods to get counts
  // Example where Fuel === Gasoline and AverageHighwayMPG === 28
  // return count of examples
  function countBy(kVal1, exp1, kVal2, exp2, kVal3, exp3) {
    return data.filter(d => d[kVal1] === exp1 && d[kVal2] === exp2 && d[kVal3] === exp3).length;
  }
  function averageBy(kVal, exp) {
    required = data.filter(d => d[kVal] === exp);
    count = required.length;
    sum = d3.sum(required, d => d.AverageHighwayMPG);
    return sum / count;
  }


  // Narrative: High Level comparison
  // - Scatterplot for High Level View
  // - Box Plots to ID main contributors to difference in MPG
  // - Bar Chart to compare a makes difference in MPG per Fuel type

  // Define Event Listeners
  // back and forth buttons
  document.getElementById("forward").addEventListener('click', () => {
    if (sceneIndex < scenes.length - 1) {
      d3.select(scenes[sceneIndex]).classed('active', false);
      sceneIndex++;
      d3.select(scenes[sceneIndex]).classed('active', true);
      updateChart(sceneIndex);
    }
  });

  document.getElementById("back").addEventListener('click', () => {
    if (sceneIndex > 0) {
      d3.select(scenes[sceneIndex]).classed('active', false);
      sceneIndex--;
      d3.select(scenes[sceneIndex]).classed('active', true);
      updateChart(sceneIndex);
    }
  });

  document.getElementById("updateFuelData").addEventListener('click', () => {
    createBarChart(data, "Fuel", fuels);
  });
  document.getElementById("updateMakeData").addEventListener('click', () => {
    createBarChart(data, "Make", makes);
  });
  document.getElementById("updateCylindersData").addEventListener('click', () => {
    createBarChart(data, "EngineCylinders", cylinders);
  });

  // scatter plot zoom in and out

  // box plot parameters

  // bar chart parameters

  // The initial state of the chart for the Overview
  updateChart(sceneIndex);

  // Function to update chart for scene
  function updateChart(sceneIndex) {
    if (sceneIndex === 0) {
      createScatterPlot(data, makes, fuels, cylinders, mpgs);
    } else if (sceneIndex === 2) {
      createBoxPlot(data);
    } else if (sceneIndex === 1) {
      createBarChart(data, "Make", makes);
    }


  }

  // Function to Create Scatterplot
  function createScatterPlot(data, makes, fuelds, cylinders, mpgs) {
    // This clears the existing chart
    d3.select("#scatterplot").selectAll("*").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 20, bottom: 30, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#scatterplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, 12])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 130])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add a scale for bubble size
    var z = d3.scaleLinear()
      .domain([1, 20])
      .range([4, 40]);

    // Add a scale for bubble color
    var myColor = d3.scaleOrdinal()
      .domain(["Gasoline", "Diesel", "Electricity"])
      .range(d3.schemeSet2);

    var my

    // add axis labels
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Engine Cylinder Count");

    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Average Highway Miles per Gallon");

    // flatten the data to plot
    const combinations = fuels.flatMap(a =>
      cylinders.flatMap(b =>
        mpgs.map(c => [a, b, c])
      )
    );

    const newData = combinations.map((combinations) => ({
      Fuel: combinations[0],
      Cylinders: combinations[1],
      MPG: combinations[2],
      Count: countBy(
        "Fuel", combinations[0],
        "EngineCylinders", combinations[1],
        "AverageHighwayMPG", combinations[2])
    }));
    console.log(newData);


    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#scatterplot")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function (d) {
      console.log(d.toElement.__data__.Fuel)
      tooltip
        .transition()
        .duration(200)
      tooltip
        .style("opacity", 1)
        .html("Fuel: " + d.toElement.__data__.Fuel +
          ", Count: " + d.toElement.__data__.Count +
          ", Miles per Gallon: " + d.toElement.__data__.MPG)
        .style("left", (d3.mouse(this)[0] + 30) + "px")
        .style("top", (d3.mouse(this)[1] + 30) + "px")
    }
    var moveTooltip = function (d) {
      tooltip
        .style("left", (d3.mouse(this)[0] + 30) + "px")
        .style("top", (d3.mouse(this)[1] + 30) + "px")
    }
    var hideTooltip = function (d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(newData)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return x(d.Cylinders); })
      .attr("cy", function (d) { return y(d.MPG); })
      .attr("r", function (d) { return d.Count * 4; })
      .style("fill", function (d) { return myColor(d.Fuel); })
      .style("opacity", "0.6")
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip);

    // Features of the annotation
    const annotations = [
      {
        note: {
          label: "",
          title: "Electric Vehicles"
        },
        type: d3.annotationCalloutRect,
        subject: {
          width: 20,
          height: 150
        },
        x: -10,
        y: 10,
        dy: 100,
        dx: 70
      }
    ]

    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
      .annotations(annotations)
    svg.append("g")
      .call(makeAnnotations)

  }


  // Function to Create Box Plot
  function createBoxPlot(data, mapKey) {
    // This clears the existing chart
    d3.select("#box-plot").selectAll("*").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 20, bottom: 30, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#box-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) { return d.Fuel; })
      .rollup(function (d) {
        q1 = d3.quantile(d.map(function (g) { return g.AverageHighwayMPG; }).sort(d3.ascending), .25)
        median = d3.quantile(d.map(function (g) { return g.AverageHighwayMPG; }).sort(d3.ascending), .5)
        q3 = d3.quantile(d.map(function (g) { return g.AverageHighwayMPG; }).sort(d3.ascending), .75)
        interQuantileRange = q3 - q1
        min = q1 - 1.5 * interQuantileRange
        max = q3 + 1.5 * interQuantileRange
        return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max })
      })
      .entries(data)

    // Show the X scale
    const categories = data.map(d => d.Fuel)
    const uniqueCat = Array.from(new Set(categories))

    var x = d3.scaleBand()
      .range([0, width])
      .domain(uniqueCat)
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

    // Show the Y scale
    var y = d3.scaleLinear()
      .domain([0, 120])
      .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    // add axis labels
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Fuel Type");

    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Average Highway Miles per Gallon");

    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#box-plot")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function (d) {
      console.log(d.toElement.__data__.value)
      tooltip
        .transition()
        .duration(200)
      tooltip
        .style("opacity", 1)
        .html("Max: " + d.toElement.__data__.value.max +
          ", Median: " + d.toElement.__data__.value.median +
          ", Min: " + d.toElement.__data__.value.min +
          ", q1: " + d.toElement.__data__.value.q1 +
          ", q3: " + d.toElement.__data__.value.q3)
        .style("left", (d3.mouse(this)[0] + 30) + "px")
        .style("top", (d3.mouse(this)[1] + 30) + "px")
    }
    var moveTooltip = function (d) {
      tooltip
        .style("left", (d3.mouse(this)[0] + 30) + "px")
        .style("top", (d3.mouse(this)[1] + 30) + "px")
    }
    var hideTooltip = function (d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

    // Show the main vertical line
    svg
      .selectAll("vertLines")
      .data(sumstat)
      .enter()
      .append("line")
      .attr("x1", function (d) { return (x(d.key)) })
      .attr("x2", function (d) { return (x(d.key)) })
      .attr("y1", function (d) { return (y(d.value.min)) })
      .attr("y2", function (d) { return (y(d.value.max)) })
      .attr("stroke", "black")
      .style("width", 40)

    // rectangle for the main box
    var boxWidth = 100
    svg
      .selectAll("boxes")
      .data(sumstat)
      .enter()
      .append("rect")
      .attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
      .attr("y", function (d) { return (y(d.value.q3)) })
      .attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
      .attr("width", boxWidth)
      .attr("stroke", "black")
      .style("fill", "#69b3a2")
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip)

    // Show the median
    svg
      .selectAll("medianLines")
      .data(sumstat)
      .enter()
      .append("line")
      .attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
      .attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
      .attr("y1", function (d) { return (y(d.value.median)) })
      .attr("y2", function (d) { return (y(d.value.median)) })
      .attr("stroke", "black")
      .style("width", 80)

    // Features of the annotation
    const annotations = [
      {
        note: {
          label: "Median=101",
          title: "Electric"
        },
        x: 400,
        y: 50,
        dy: 100,
        dx: -100
      }
    ]

    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
      .annotations(annotations)
    svg.append("g")
      .call(makeAnnotations)
  }

  // Function to Create Bar Chart
  function createBarChart(data, mapKey, listData) {
    // This clears the existing chart

    d3.select("#bar-chart").selectAll("*").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 20, bottom: 100, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // create the datasets
    const newData0 = listData.map((listData) => ({
      group: listData,
      value: averageBy(mapKey, listData)
    }));
    const newData = newData0.sort((a, b) => d3.ascending(a.group, b.group))

    // Initialize the X axis
    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.2);
    var xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")

    // Initialize the Y axis
    var y = d3.scaleLinear()
      .range([height, 0]);
    var yAxis = svg.append("g")
      .attr("class", "myYaxis")

    // Update the X axis
    x.domain(newData.map(function (d) { return d.group; }))
    xAxis.call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function (d) {
        return "rotate(-60)";
      });

    // Update the Y axis
    y.domain([0, d3.max(newData, function (d) { return d.value })]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // add axis labels
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text(mapKey);

    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Average Highway Miles per Gallon");

    // Create the u variable
    var u = svg.selectAll("rect")
      .data(newData)

    u
      .enter()
      .append("rect") // Add a new rect for each new elements
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      .duration(1000)
      .attr("x", function (d) { return x(d.group); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.value); })
      .attr("fill", "#69b3a2")
      .style("opacity", "0.6")
      .attr("stroke", "white")

    // If less group in the new dataset, I delete the ones not in use anymore
    u
      .exit()
      .remove();

  }
}




