const showData = buildings => {
  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  document.querySelector("#chart-data").innerHTML = buildings
    .map(toLine)
    .join("<hr/>");
};

const drawChart = buildings => {
  //height width & margins for svg and chart size and position
  const chartSize = { width: 600, height: 400 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };

  //height and width for chart
  const [width, height] = [
    chartSize.width - margin.left - margin.right,
    chartSize.height - margin.top - margin.bottom
  ];

  //setting up svg
  const svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  //grouping the svg elements
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //putting x-axis label
  g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Tall Buildings");

  //putting y-xis label
  g.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Height (metres)");

  //y axis linear scale
  const y = d3
    .scaleLinear()
    .domain([0, 828])
    .range([height, 0]);

  // x axis scale band
  const x = d3
    .scaleBand()
    .domain(_.map(buildings, "name"))
    .range([0, width])
    .padding(0.3);

  // y axis element creation
  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => `${d}m`)
    .ticks(3);

  //x axis element creation
  const xAxis = d3.axisBottom(x);

  //add x-axis to the svg
  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  //add x-axis to the svg
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  //rotating x-axis text
  g.selectAll(".x-axis text")
    .attr("transform", "rotate(-40)")
    .attr("x", -5)
    .attr("y", 10);

  const rects = g.selectAll("rect").data(buildings);

  //add dimensions to all the rects or bar chart
  rects
    .enter()
    .append("rect")
    .attr("y", b => y(b.height))
    .attr("x", b => x(b.name))
    .attr("width", x.bandwidth)
    .attr("height", b => y(0) - y(b.height))
    .attr("fill", "grey");
};

const drawBuildings = buildings => {
  drawChart(buildings);
  showData(buildings);
};
const main = () => {
  d3.json("data/buildings.json").then(drawBuildings);
};
window.onload = main;
