import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

function loadDataTable(userData) {
    $("#table-rows").html("")
    console.log(userData)
    userData.map((row, index) => {
        var htmlString = `
        <tr value="${index}">
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${row["Category"]}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${row["Date"]}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${row["Description"]}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${row["Type"]}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${parseFloat(row["Price"]).toFixed(2)} ${baseCurrency}"/>
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${(parseFloat(row["Price"]) * exchangeRate).toFixed(2)} ${convertCurrency}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${parseFloat(row["Quantity"])}"/>
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${(parseFloat(row["Price"]) * parseFloat(row["Quantity"])).toFixed(2)} ${baseCurrency}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${((parseFloat(row["Price"]) * parseFloat(row["Quantity"])) * exchangeRate).toFixed(2)} ${convertCurrency}" />
            </td>
        `

        $("#table-rows").append(htmlString + `</tr>`)
    })
}

function updateCurrencyRate(userData, data) {
    if (convertCurrency == baseCurrency) exchangeRate = 1
    else exchangeRate = parseFloat(data.data[convertCurrency])
    $("#exchange-rate").html(`${exchangeRate} ${convertCurrency}`)
    loadDataTable(userData)
}

function loadCurrencies(userData) {
    let currencyConverterURL = "https://freecurrencyapi.net/api/v2/latest"
    let currencyConverterAPI = "feacf440-6631-11ec-950a-07b3d17c06cf"

    fetch(currencyConverterURL + `?apikey=${currencyConverterAPI}` + `&base_currency=${baseCurrency}`)
    .then(response => response.json())
    .then(data => {
        $("#select-base-currency").html(baseCurrency)
        $("#select-convert-currency").html(convertCurrency)

        let currencies = Object.keys(data.data)
        $("#convert-base-dropdown").html("")
        $("#convert-convert-dropdown").html("")

        currencies.map((c) => {
            $("#convert-base-dropdown").append(`
                <li><button class="dropdown-item base-currency">${c}</button></li>
            `)

            $("#convert-convert-dropdown").append(`
                <li><button class="dropdown-item convert-currency">${c}</button></li>
            `)
        })

        $(".base-currency").on("click", (e) => {
            $("#select-base-currency").text(e.currentTarget.innerHTML)
            baseCurrency = e.currentTarget.innerHTML
        })

        $(".convert-currency").on("click", (e) => {
            $("#select-convert-currency").text(e.currentTarget.innerHTML)
            convertCurrency = e.currentTarget.innerHTML
        })

        $("#convert-button").on("click", () => {
            updateCurrencyRate(userData, data)
        })
    })
}

var exchangeRate = 1
var baseCurrency = 'USD'
var convertCurrency = 'USD'

$(document).ready(() => {
    const firebaseConfig = {
        apiKey: "AIzaSyCeWQCzSS4ZkNO6sjhkxhe1jSMfpzdf_lE",
        authDomain: "thrive-chart.firebaseapp.com",
        databaseURL: "https://thrive-chart-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "thrive-chart",
        storageBucket: "thrive-chart.appspot.com",
        messagingSenderId: "667460322691",
        appId: "1:667460322691:web:866629265a85e6ed6b22b6",
        measurementId: "G-BPWB4MX81R"
    }
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const database = getDatabase(app);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            onValue(ref(database, 'users/' + user.uid + '/data'), async (snapshot) => {
                const userData = snapshot.val();
                loadDataTable(userData, exchangeRate)
                $("#exchange-rate").html(`${exchangeRate} ${convertCurrency}`)
                loadCurrencies(userData, baseCurrency)
            })
        }
    })
})