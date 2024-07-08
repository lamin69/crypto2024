// CoinGecko API endpoint for top 20 cryptocurrencies excluding stable coins
const apiUrl = "https://api.coingecko.com/api/v3/coins/markets";
const params = {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: 20, // Fetch top 20
    page: 1,
    sparkline: true, // Include sparkline data for charts
    price_change_percentage: '24h' // Include 24-hour price change percentage
};

// Placeholder images for the cryptocurrencies
const cryptoLogos = {
    bitcoin: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    binancecoin: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
    cardano: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    ripple: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    dogecoin: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    polkadot: "https://cryptologos.cc/logos/polkadot-dot-logo.png",
    solana: "https://cryptologos.cc/logos/solana-sol-logo.png",
    litecoin: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    chainlink: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    stellar: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
    vechain: "https://cryptologos.cc/logos/vechain-vet-logo.png",
    filecoin: "https://cryptologos.cc/logos/filecoin-fil-logo.png",
    tron: "https://cryptologos.cc/logos/tron-trx-logo.png",
    eos: "https://cryptologos.cc/logos/eos-eos-logo.png",
    neo: "https://cryptologos.cc/logos/neo-neo-logo.png",
    tezos: "https://cryptologos.cc/logos/tezos-xtz-logo.png",
    monero: "https://cryptologos.cc/logos/monero-xmr-logo.png",
    algorand: "https://cryptologos.cc/logos/algorand-algo-logo.png",
    cosmos: "https://cryptologos.cc/logos/cosmos-atom-logo.png"
};

const viewOptions = {
    hours: { count: 24, interval: 'hour' },
    days: { count: 7, interval: 'day' },
    weeks: { count: 4, interval: 'week' }
};

// Fetch crypto data
async function fetchCryptoData() {
    try {
        const url = new URL(apiUrl);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Filter out stable coins (those ending with "usdt", "usdc", "busd", "dai")
        const filteredData = data.filter(crypto => !crypto.symbol.toLowerCase().includes("usdt") &&
                                                    !crypto.symbol.toLowerCase().includes("usdc") &&
                                                    !crypto.symbol.toLowerCase().includes("busd") &&
                                                    !crypto.symbol.toLowerCase().includes("dai"));
        
        return filteredData;
    } catch (error) {
        console.error("Error fetching crypto data:", error);
    }
}

// Render the crypto data
async function renderCryptoData() {
    const cryptoContainer = document.getElementById('crypto-container');
    cryptoContainer.innerHTML = ''; // Clear existing data
    const cryptoData = await fetchCryptoData();

    cryptoData.forEach(crypto => {
        const cryptoElement = document.createElement('div');
        cryptoElement.className = 'crypto';

        // Crypto Info
        const infoElement = document.createElement('div');
        infoElement.className = 'info';

        const imgElement = document.createElement('img');
        imgElement.src = cryptoLogos[crypto.id] || "https://via.placeholder.com/40";
        imgElement.alt = `${crypto.name} logo`;

        const nameElement = document.createElement('h2');
        nameElement.textContent = `${crypto.name} (${crypto.symbol.toUpperCase()})`;

        const priceElement = document.createElement('div');
        priceElement.className = 'price';
        priceElement.textContent = `$${crypto.current_price.toLocaleString()}`;

        infoElement.appendChild(imgElement);
        infoElement.appendChild(nameElement);
        infoElement.appendChild(priceElement);

        // 24h Change
        const changeElement = document.createElement('div');
        changeElement.className = 'change';
        changeElement.textContent = `${crypto.price_change_percentage_24h.toFixed(2)}%`;

        if (crypto.price_change_percentage_24h >= 0) {
            changeElement.classList.add('green');
        } else {
            changeElement.classList.add('red');
        }

        infoElement.appendChild(changeElement);

        // Chart Container
        const chartElement = document.createElement('div');
        chartElement.className = 'chart-container';
        
        const canvasElement = document.createElement('canvas');
        canvasElement.id = `chart-${crypto.id}`;

        chartElement.appendChild(canvasElement);

        // Click event to redirect to detailed page
        cryptoElement.addEventListener('click', () => {
            window.location.href = `crypto-detail.html?id=${crypto.id}`;
        });

        cryptoElement.appendChild(infoElement);
        cryptoElement.appendChild(chartElement);

        cryptoContainer.appendChild(cryptoElement);

        // Render chart
        renderChart(canvasElement, crypto.sparkline_in_7d.price);
    });
}

// Render Chart using Chart.js with options for view and indicators
function renderChart(canvas, data) {
    const selectedView = document.getElementById('chartView').value;
    const { count, interval } = viewOptions[selectedView];

    const dataSubset = data.slice(-count * 24 / intervalToHours(interval));
    const movingAverage = calculateMovingAverage(dataSubset, 7);

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dataSubset.map((_, index) => index),
            datasets: [
                {
                    data: dataSubset,
                    borderColor: '#ff6f61',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    lineTension: 0.1
                },
                {
                    label: '7-period MA',
                    data: movingAverage,
                    borderColor: '#33ccff',
                    fill: false,
                    borderWidth: 1,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false
                }],
                yAxes: [{
                    display: false
                }]
            }
        }
    });
}

// Utility function to convert interval to hours
function intervalToHours(interval) {
    switch (interval) {
        case 'hour': return 1;
        case 'day': return 24;
        case 'week': return 24 * 7;
        default: return 1;
    }
}

// Calculate moving average of an array
function calculateMovingAverage(data, period) {
    const movingAverage = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - period + 1);
        const end = i + 1;
        const subset = data.slice(start, end);
        const avg = subset.reduce((acc, val) => acc + val, 0) / subset.length;
        movingAverage.push(avg);
    }
    return movingAverage;
}

// Initial render of crypto data
renderCryptoData();

// Auto-refresh every 60 seconds
setInterval(renderCryptoData, 60000);
