const chartSize = {width: 800, height: 600};
const margin = {left: 100, right: 10, top: 10, bottom: 150};

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const showData = function (quotes) {
    console.log(quotes.length)
    console.log(_.first(quotes))
    console.log(_.last(quotes))
}

const initChart = function () {
    const svg = d3.select("#chart-area svg")
        .attr("width", chartSize.width)
        .attr("height", chartSize.height);

  const prices = svg
      .append("g")
      .attr("class", "Prices")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  prices.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + 140)
      .text("Time");

  prices.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .text("Close");

  prices.append("g").attr("class", "y-axis");

  prices.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`);

  prices.selectAll(".x-axis text")
      .attr("transform", "rotate(-40)")
      .attr("x", -5)
      .attr("y", 10);
}

const updateCompaniesChart = function(quotes) {
  const fq = _.first(quotes);
  const lq = _.last(quotes);
  const firstDate = new Date(fq.Date)
  const lastDate = new Date(lq.Date)
  const maxYAxisValue = _.get(_.maxBy(quotes,"Close"), "Close", 0);
  const minYaxisValue = _.get(_.minBy(quotes,"Close"), "Close", 0)

  const svg = d3.select("#chart-area svg");
  const y = d3
      .scaleLinear()
      .domain([minYaxisValue, maxYAxisValue])
      .range([height, 0]);

  const x = d3
      .scaleTime()
      .domain([firstDate,lastDate])
      .range([0, width])

  svg.select(".y-axis-label").text("Close");

  const yAxis = d3
      .axisLeft(y)
      .ticks(10);

  svg.select(".y-axis").call(yAxis);

  const xAxis = d3.axisBottom(x);

  svg.select(".x-axis").call(xAxis);

  const t = d3
      .transition()
      .duration(1000)
      .ease(d3.easeLinear);

  const prices = svg.select(".prices");

};


const parseQuoets = function ({Date, ...rest}) {
    const fields = _.keys(rest);
    _.forEach(fields, field => (rest[field] = +rest[field]));
    return {Date, ...rest};
}

function showChart(quotes) {
  initChart();
  updateCompaniesChart(quotes)
}

const main = function () {
    d3.csv("data/niftyData.csv", parseQuoets).then(showChart);
};

window.onload = main;
