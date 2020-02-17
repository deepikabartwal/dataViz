const chartSize = { width: 800, height: 600 };
const margin = { left: 100, right: 10, top: 10, bottom: 150 };

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const c = d3.scaleOrdinal(d3.schemeCategory10);

const percentageFormat = d => `${d}%`;
const kCroreFormat = d => `${d / 1000}k Cr ₹`;
const inrFormat = d => `${d} ₹`;

const formats = {
  CMP: inrFormat,
  MarketCap: kCroreFormat,
  DivYld: percentageFormat,
  ROCE: percentageFormat,
  QNetProfit: kCroreFormat,
  QSales: kCroreFormat
};

const initChart = () => {
  const svg = d3
    .select("#market-chart-area svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("class", "companies")
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

  g.append("g").attr("class", "y-axis");

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);

  g.selectAll(".x-axis text")
    .attr("transform", "rotate(-40)")
    .attr("x", -5)
    .attr("y", 10);
};

const updateCompaniesChart = function(companies, fieldName) {
  const format = formats[fieldName];
  const maxYAxisValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);

  const svg = d3.select("#market-chart-area svg");
  const y = d3
    .scaleLinear()
    .domain([0, maxYAxisValue])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .domain(_.map(companies, "Name"))
    .range([0, width])
    .padding(0.3);

  svg.select(".y-axis-label").text(fieldName);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(format)
    .ticks(10);

  svg.select(".y-axis").call(yAxis);

  const xAxis = d3.axisBottom(x);

  svg.select(".x-axis").call(xAxis);

  const t = d3
    .transition()
    .duration(1000)
    .ease(d3.easeLinear);

  const g = svg.select(".companies");

  const rects = g.selectAll("rect").data(companies, c => c.Name);

  rects.exit().remove();

  rects
    .enter()
    .append("rect")
    .attr("y", c => y(0))
    .attr("x", c => x(c.Name))
    .merge(rects)
    .transition(t)
    .attr("y", b => y(b[fieldName]))
    .attr("x", b => x(b.Name))
    .attr("height", b => y(0) - y(b[fieldName]))
    .attr("fill", b => c(b.Name))
    .attr("width", x.bandwidth);

  svg
    .selectAll("rect")
    .data(companies, c => c.Name)
    .transition(t)
    .attr("y", c => y(c[fieldName]))
    .attr("x", c => x(c.Name))
    .attr("height", c => y(0) - y(c[fieldName]))
    .attr("width", x.bandwidth);
};

const parseCompanyData = function({ Name, ...rest }) {
  const fields = _.keys(rest);
  _.forEach(fields, field => (rest[field] = +rest[field]));
  return { Name, ...rest };
};

const getNextField = (function() {
  const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");
  let step = 0;
  return function() {
    return fields[step++ % fields.length];
  };
})();

const drawCompanies = companies => {
  initChart();

  updateCompaniesChart(companies, getNextField());

  setInterval(() => updateCompaniesChart(companies, getNextField()), 2000);

  frequentlyMoveCompanies(companies, []);
};

const frequentlyMoveCompanies = (src, dest) => {
  setInterval(() => {
    const c = src.shift();
    if (c) dest.push(c);
    else [src, dest] = [dest, src];
  }, 2000);
};

const main = () => {
  d3.csv("data/companies.csv", parseCompanyData).then(drawCompanies);
};

window.onload = main;
