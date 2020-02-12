const showCompanyData = companies => {
  const toLine = c => `<strong>${c.Name}</strong> <i>${c.CMP}</i>`;
  document.querySelector("#companies-data").innerHTML = companies
    .map(toLine)
    .join("<hr/>");
};

const drawCompanyChart = companies => {
  const chartSize = { width: 800, height: 600 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const maxHeight = _.maxBy(companies, company => company.CMP).CMP;

  const [width, height] = [
    chartSize.width - margin.left - margin.right,
    chartSize.height - margin.top - margin.bottom
  ];

  const svg = d3
    .select("#market-chart-area")
    .append("svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Companies");

  g.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("CMP");

  const y = d3
    .scaleLinear()
    .domain([0, maxHeight])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .domain(_.map(companies, "Name"))
    .range([0, width])
    .padding(0.3);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => `${d} ₹`)
    .ticks(10);

  const xAxis = d3.axisBottom(x);

  const c = d3.scaleOrdinal(d3.schemeCategory10);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  g.selectAll(".x-axis text")
    .attr("transform", "rotate(-40)")
    .attr("x", -5)
    .attr("y", 10);

  const rects = g.selectAll("rect").data(companies);

  rects
    .enter()
    .append("rect")
    .attr("y", c => y(c.CMP))
    .attr("x", c => x(c.Name))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c.CMP))
    .attr("fill", comp => c(comp.Name) );
};

const parseCompanyData = function({ Name, ...rest }) {
  const fields = _.keys(rest);
  _.forEach(fields, field => (rest[field] = +rest[field]));
  return { Name, ...rest };
};

const main = () => {
  d3.csv("data/companies.csv", parseCompanyData).then(drawCompanyChart);
};

window.onload = main;
