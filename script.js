let stocks = [];

$(document).ready(function() {
  fetchStockData();
});

function renderStocks() {
    const stockContainer = $('#stockContainer');
    // stockContainer.empty();
  
    stocks.forEach(stock => {
      const stockElement = $('<div>').addClass('stock');
  
      const tickerElement = $('<h3>').text(stock.ticker);
      stockElement.append(tickerElement);
  
      const buttonsElement = $('<div>').addClass('buttons');
  
      const bullishButton = $('<button>').text('Bullish').click(() => updateSentiment(stock.ticker, 'bullish'));
      const neutralButton = $('<button>').text('Neutral').click(() => updateSentiment(stock.ticker, 'neutral'));
      const bearishButton = $('<button>').text('Bearish').click(() => updateSentiment(stock.ticker, 'bearish'));
  
      buttonsElement.append(bullishButton, neutralButton, bearishButton);
      stockElement.append(buttonsElement);
  
      // Update the way you access the bullish and bearish counts
      const bullishCount = parseInt(stock.bullish) || 0;
      const bearishCount = parseInt(stock.bearish) || 0;
  
      // Add the appropriate class based on the sentiment
      stockElement.addClass(bullishCount > bearishCount ? 'bullish' : 'bearish');
  
      const sentimentElement = $('<p>');
  
      let ratio;
      if (bearishCount > 0) {
        ratio = `<span style="color: green;">${bullishCount}</span> <span style="color: black;">/</span> <span style="color: red;">${bearishCount}</span>`;
      } else {
        ratio = 'N/A';
      }
  
      sentimentElement.html(`Bullish: ${bullishCount} | Bearish: ${bearishCount} | Ratio: <span class="${bullishCount > bearishCount ? 'bullish' : 'bearish'}">${ratio}</span>`);
      stockElement.append(sentimentElement);
  
      stockContainer.append(stockElement);
    });
  }

function updateSentiment(ticker, sentiment) {
    $.post('sentiment.php', { ticker: ticker, sentiment: sentiment }, function(response) {
        console.log(response.message || response.error);
        fetchStockData();
    }, 'json');
}

function addStock() {
  const newStockInput = $('#newStock');
  const newTicker = newStockInput.val().trim().toUpperCase();
  if (newTicker && Array.isArray(stocks) && !stocks.find(stock => stock.ticker === newTicker)) {
    $.post('sentiment.php', { ticker: newTicker, action: 'add' }, function(response) {
        console.log(response.message || response.error);
        newStockInput.val('');
        fetchStockData();
    }, 'json');
  }
}

function fetchStockData() {
  $.get('sentiment.php')
    .then(function(response) {
      try {
        stocks = JSON.parse(response);
        if (!Array.isArray(stocks)) {
          stocks = [];
        }
        renderStocks();
      } catch (error) {
        console.error('Error parsing JSON:', error);
        stocks = [];
        renderStocks();
      }
    })
    .catch(function(error) {
      console.error('Error fetching stock data:', error);
      stocks = [];
      renderStocks();
    });
}