document.addEventListener('DOMContentLoaded', init);
async function init() {
  const scenes = ['#scene_1', '#scene_2', '#scene_3'];
  let sceneIndex = 0;

  // Load the Data
  const data = await d3.csv("https://flunky.github.io/cars2017.csv", d=>({
    Make: +d.Make,
    Fuel:	+d.Fuel,
    EngineCylinders: +d.EngineCylinders,
    AverageHighwayMPG: +d.AverageHighwayMPG,
    AverageCityMPG: +d.AverageCityMPG
  }));

  // Narrative: High Level comparison
  // - Scatterplot for High Level View
  // - Box Plots to ID main contributors to difference in MPG
  // - Bar Chart to compare a makes difference in MPG per Fuel type

  // Define Event Listeners
  // back and forth buttons


  // scatter plot zoom in and out

  // box plot parameters

  // bar chart parameters

  // The initial state of the chart for the Overview
  updateChart(sceneIndex);
  
  // Function to Create Scatterplot
  function createScatterPlot(data){
    // This clears the existing chart
    d3.select("#scatterplot").selectAll("*").remove();

    // Create the scatter plot
    const svg = d3.select("scatterplot").append("svg")
      .attr("width", 800)
      .attr("height", 600);

    // setup the margins
    const margin = {top:20, right:30, bottom:60, left:50};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", 'translate(${margin.left},${margin.top})');

    // setup the scale for the x and y axis
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.EngineCylinders), d3.max(data, d =>d.EngineCylinders)])
      .range([0, width]);
    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.AverageHighwayMPG), d3.max(data, d =>d.AverageHighwayMPG)])
      .range([height, 0]);

    // update the image with the scales
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));
    svg.append("g")
      .call(d3.axisLef(yScale));

    // Add the scatterplot dots
    svg.append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {return xScale(d.EngineCylinders);})
      .attr("cy", function (d) {return yScale(d.AverageHighwayMPG);})
      .attr("r", 1.5)
      .style("fill", "blue");
  }
}
    

  // Function to Create Box PLot

  // Function to Create Bar Chart


  
