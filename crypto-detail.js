// CoinGecko API endpoint for fetching single cryptocurrency details
const apiUrl = "https://api.coingecko.com/api/v3/coins/";
const params = {
    localization: false,
    tickers: false,
    market_data: true,
    community_data: false,
    developer_data: false,
    sparkline: true
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

// Function to fetch cryptocurrency details
async function fetchCryptoDetail(id) {
    try {
        const response = await fetch(`${apiUrl}${id}`, { method: 'GET', headers: {} });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching crypto detail:", error);
    }
}

// Function to render crypto detail
async function renderCryptoDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const cryptoId = urlParams.get('id');

    const cryptoDetailContainer = document.getElementById('crypto-detail');
    const cryptoNameElement = document.getElementById('crypto-name');

    if (!cryptoId) {
        cryptoNameElement.textContent = 'Crypto Detail';
        cryptoDetailContainer.innerHTML = '<p>No cryptocurrency ID found.</p>';
        return;
    }

    const cryptoDetail = await fetchCryptoDetail(cryptoId);
    if (!cryptoDetail) {
        cryptoNameElement.textContent = 'Crypto Detail';
        cryptoDetailContainer.innerHTML = '<p>Error fetching cryptocurrency detail.</p>';
        return;
    }

    cryptoNameElement.textContent = `${cryptoDetail.name} (${cryptoDetail.symbol.toUpperCase()})`;

    // Crypto Info
    const infoElement = document.createElement('div');
    infoElement.className = 'info';

    const imgElement = document.createElement('img');
    imgElement.src = cryptoLogos[cryptoDetail.id] || "https://via.placeholder.com/40";
    imgElement.alt = `${cryptoDetail.name} logo`;

    const currentPriceElement = document.createElement('div');
    currentPriceElement.className = 'current-price';
    currentPriceElement.textContent = `$${cryptoDetail.market_data.current_price.usd.toLocaleString()}`;

    const priceChangeElement = document.createElement('div');
    priceChangeElement.className = 'price-change';
    const priceChange = cryptoDetail.market_data.price_change_percentage_24h;
    priceChangeElement.textContent = `${priceChange.toFixed(2)}%`;

    if (priceChange >= 0) {
        priceChangeElement.classList.add('green');
    } else {
        priceChangeElement.classList.add('red');
    }

    infoElement.appendChild(imgElement);
    infoElement.appendChild(currentPriceElement);
    infoElement.appendChild(priceChangeElement);

    cryptoDetailContainer.appendChild(infoElement);

    // Render chart
    renderChart('crypto-chart', cryptoDetail.sparkline_in_7d.price);
}

// Render Chart using Chart.js
function renderChart(canvasId, data) {
    new Chart(canvasId, {
        type: 'line',
        data: {
            labels: Array.from({ length: data.length }, (_, i) => i + 1),
            datasets: [{
                data: data,
                borderColor: '#ff6f61',
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
                lineTension: 0.1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

// Initial render of crypto detail
renderCryptoDetail();
