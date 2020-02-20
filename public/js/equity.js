const chartSize = { width: 1400, height: 700 };
const margin = { left: 100, right: 10, top: 10, bottom: 150 };

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const initChart = function() {
  const svg = d3
    .select("#chart-area svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const prices = svg
    .append("g")
    .attr("class", "Prices")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  prices
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Time");

  prices
    .append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Close");

  prices.append("g").attr("class", "y-axis");

  prices
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);

  prices
    .selectAll(".x-axis text")
    .attr("transform", "rotate(-40)")
    .attr("x", -5)
    .attr("y", 10);
};

const updateChart = function(quotes) {
  const { firstDate, lastDate } = getFirstAndLastDate(quotes);
  const maxYAxisValue = _.get(_.maxBy(quotes, "Close"), "Close", 0);
  const minCloseValue = _.get(_.minBy(quotes, "Close"), "Close", 0);
  const minSMAValue = _.get(_.minBy(quotes, "sma"), "sma", 0);
  const minYAxisValue = Math.min(minCloseValue, minSMAValue);
  const svg = d3.select("#chart-area svg");
  const y = d3
    .scaleLinear()
    .domain([minYAxisValue, maxYAxisValue])
    .range([height, 0]);

  const x = d3
    .scaleTime()
    .domain([firstDate, lastDate])
    .range([0, width]);

  svg.select(".y-axis-label").text("Close");

  const yAxis = d3.axisLeft(y).ticks(10);

  svg.select(".y-axis").call(yAxis);

  const xAxis = d3.axisBottom(x);

  svg.select(".x-axis").call(xAxis);

  const line = fieldName =>
    d3
      .line()
      .x(q => x(q.time))
      .y(q => y(q[fieldName]));

  const prices = svg.select(".Prices");
  prices
    .append("path")
    .attr("class", "close")
    .attr("d", line("Close")(quotes));

  prices
    .append("path")
    .attr("class", "sma")
    .attr("d", line("sma")(quotes.filter(quote => quote.sma)));
};

const formatDate = function(date) {
  return _.first(new this.Date(date).toJSON().split("T"));
};

function isWithinDateRange(begin, date, end) {
  return begin < date.getTime() && date.getTime() <= end;
}

const getQuotesInSelectedRange = function(begin, end, quotes) {
  return quotes.filter(quote => isWithinDateRange(begin, quote.time, end));
};

const showRangedData = function(quotes) {
  const { firstDate, lastDate } = getFirstAndLastDate(quotes);
  const startingYear = firstDate.getTime();
  const endingYear = lastDate.getTime();
  const slider = createD3RangeSlider(
    startingYear,
    endingYear,
    "#slider-container"
  );
  slider.onChange(newRange => {
    d3.select("#range-label").text(
      formatDate(newRange.begin) + " to " + formatDate(newRange.end)
    );
    d3.selectAll("path").remove();
    updateChart(getQuotesInSelectedRange(newRange.begin, newRange.end, quotes));
  });

  slider.range(startingYear, endingYear);
};

const parseQuotes = function({ Date, ...rest }) {
  const fields = _.keys(rest);
  _.forEach(fields, field => (rest[field] = +rest[field]));
  return { Date, time: new this.Date(Date), ...rest };
};

function getHundredDayAverageFrom(quotes, i, spanForAverage) {
  const hunderdDaysQuotes = quotes.slice(i - spanForAverage, i);
  const sumOfHundredCloses = hunderdDaysQuotes.reduce((x, y) => x + y.Close, 0);
  const average = sumOfHundredCloses / spanForAverage;
  return _.round(average);
}

const analyzeData = function(quotes, spanForAverage) {
  for (let i = spanForAverage; i < quotes.length; i++) {
    quotes[i - 1].sma = getHundredDayAverageFrom(quotes, i);
  }
};

function getFirstAndLastDate(quotes) {
  const fq = _.first(quotes);
  const lq = _.last(quotes);
  const firstDate = fq.time;
  const lastDate = lq.time;
  return { firstDate, lastDate };
}

const showChart = function(quotes) {
  analyzeData(quotes, 100);
  initChart();
  showRangedData(quotes);
  updateChart(quotes);
};

const main = function() {
  d3.csv("data/niftyData.csv", parseQuotes).then(showChart);
};

window.onload = main;
