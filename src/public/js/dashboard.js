import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

function loadOverview(data) {
    $("#overview-graph-container").html("<canvas id='overview-graph' style='max-height: 25rem'></canvas>")
    if (data) {
        $("#data-title").text("Overview")
        var totalAssets = 0, totalLiabilities = 0, totalExpenses = 0

        data.map((row) => {
            switch (row["Category"]) {
                case "Asset":
                    totalAssets += (parseFloat(row["Price"]) * parseFloat(row["Quantity"]))
                    break

                case "Liability":
                    totalLiabilities += (parseFloat(row["Price"]) * parseFloat(row["Quantity"]))
                    break

                case "Expense":
                    totalExpenses += (parseFloat(row["Price"]) * parseFloat(row["Quantity"]))
                    break
            }
        })
    
        new Chart(document.getElementById('overview-graph').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [
                    "Assets",
                    "Liabilities",
                    "Expenses"
                ],
                datasets: [{
                    data: [totalAssets, totalLiabilities, totalExpenses],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ],
                    hoverOffset: 4
                }]
            }
        })
    }
}

function loadViewDataOptions(data) {
    $(".view-data-list").html(`
        <li class="nav-item view-data-option" value="Overview">
            <button class="nav-link active d-flex" aria-current="page">
                <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" weight="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p class="m-0 ps-2">Overview</p>
            </button>
        </li>
    `)

    let distinctTypes = [...new Set(data.map(row => row.Type))]
    distinctTypes.map((type) => {
        $(".view-data-list").append(`
            <li class="nav-item view-data-option" value="${type}">
                <button class="nav-link d-flex" aria-current="page">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" weight="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p class="m-0 ps-2 text-nowrap">${type}</p>
                </button>
            </li>
        `)
    })
}

function loadLineGraph(data, type) {
    $("#data-title").text(type)
    $("#line-graph-container").html("<canvas id='line-graph' class='w-100' style='height: 25rem;'></canvas>")
    var dateArray = [], dataArray = []

    data.map((row) => {
        if (row["Type"] == type) { 
            dateArray.push(row["Date"])
            dataArray.push((parseFloat(row["Price"]) * parseFloat(row["Quantity"])))
        }
    })

    // Prediction Array
    var dailyGrowthPercentages = []

    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i + 1] == null) break
        dailyGrowthPercentages.push((dataArray[i + 1] / dataArray[i]) - 1)
    }

    let sumGrowth = 0;
    dailyGrowthPercentages.map((e) => {
        sumGrowth += e
    })

    let averageGrowthPercent = sumGrowth / dailyGrowthPercentages.length
    var data = parseFloat(dataArray.slice(-1))
    var predictDateArray = [], predictDataArray = []

    for (let i = 1; i <= dataArray.length - 1; i++) {
        predictDataArray.push(null)
    }

    predictDataArray.push(...dataArray.slice(-1))

    for (let i = 1; i <= 5; i++) {
        var date = new Date(dateArray.slice(-1))
        date.setDate(date.getDate() + i);
        predictDateArray.push(`${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)
        data += data * averageGrowthPercent/100
        predictDataArray.push(data.toFixed(2))
    }

    // Plotting
    new Chart(document.getElementById('line-graph').getContext('2d'), {
        type: 'line',
        data: {
            labels: [...dateArray, ...predictDateArray],
            datasets: [{
                label: type,
                data: dataArray,
                borderColor: 'rgb(13, 110, 253)',
                tension: 0.1
            }, {
                label: `Prediction (Average Growth = ${averageGrowthPercent.toFixed(2)}%)`,
                data: predictDataArray,
                borderDash: [5, 5],
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    })
}

function loadTrackOptions(data) {
    if (data) {
        $("#track-options").removeAttr("disabled")
        $("#add-to-track-button").removeAttr("disabled")
        let distinctTypes = [...new Set(data.map(row => row.Type))]
        distinctTypes.map((type) => {
            $("#track-options").append(`<option value="${type}">${type}</option>`)
        })
    }
}

function loadTracklist(data) {
    $("#track-list").html("")
    
    var savedTracklist = JSON.parse(localStorage.getItem("track-list"))
    
    if (savedTracklist == null) savedTracklist = []

    savedTracklist.map((type) => {
        addCardToTracklist(data, type)
    })
}

function addToSavedTracklist(data, type) {
    var savedTracklist = JSON.parse(localStorage.getItem("track-list"))

    if (savedTracklist == null) savedTracklist = []

    if (!savedTracklist.includes(type)) { 
        savedTracklist.push(type)
        addCardToTracklist(data, type)
    }
    
    localStorage.setItem("track-list", JSON.stringify(savedTracklist))
}

function addCardToTracklist(data, type) {
    let today = new Date().toLocaleDateString('en-SG')
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-SG')
    var todayTotal = 0, yesterdayTotal = 0

    data.map((data) => {
        if (data["Type"] == type && new Date(data["Date"]).toLocaleDateString('en-SG') == today) {
            todayTotal += (parseFloat(data["Price"]) * parseFloat(data["Quantity"]))
        }
    
        else if (data["Type"] == type && new Date(data["Date"]).toLocaleDateString('en-SG') == yesterday) {
            yesterdayTotal += (parseFloat(data["Price"]) * parseFloat(data["Quantity"]))
        }
    })

    let total = todayTotal - yesterdayTotal
    var cardHTML = `<div class="card mb-3 track-card" value="${type}">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="m-0 card-title">${type}</h6>
                                <h4 class="m-0">$${todayTotal}</h4>`

    if (total < 0) {
        cardHTML += `<div class="d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1rem" weight="1rem" class="text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <p class="text-danger m-0"> ${total}</p>
                    </div>`
    }

    else if (total == 0) {
        cardHTML += `<p class="text-muted m-0">${total}</p>`
    }

    else {
        cardHTML += `<div class="d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1rem" weight="1rem" class="text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <p class="text-success m-0"> +${total}</p>
                    </div>`
    }
    cardHTML += `</div>
                <button class="btn btn-danger ml-4 pb-2 remove-track-button">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" weight="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>`

    $("#track-list").append(cardHTML)
}

function removeFromSavedTracklist(event) {
    var savedTracklist = JSON.parse(localStorage.getItem("track-list"))

    if (savedTracklist == null) savedTracklist = []

    let type = event.currentTarget.parentElement.parentElement.attributes[1].value

    savedTracklist.splice(savedTracklist.indexOf(type), 1);

    localStorage.setItem("track-list", JSON.stringify(savedTracklist))

    event.currentTarget.parentElement.parentElement.remove()
}

function loadDataTable(data, loggedIn) {
    if (loggedIn) {
        $("#table-headers").html(`
            <th class="col-1">Category</th>
            <th class="col-1">Date</th>
            <th class="col-1">Description</th>
            <th class="col-1">Price</th>
            <th class="col-1">Quantity</th>
            <th class="col-1">Type</th>
            <th class="col-1">Total</th>
            <th class="col-1">Action</th>`
        )
    }

    // Retrieving row of data for data table
    $("#table-rows").html("")
    data.map((row, index) => {
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
                <input type="number" readonly class="form-control-plaintext" value="${row["Price"]}" />
            </td>
            <td>
                <input type="number" readonly class="form-control-plaintext" value="${row["Quantity"]}" />
            </td>
            <td>
                <input type="text" readonly class="form-control-plaintext" value="${row["Type"]}" />
            </td>
            <td class="align-middle">
                <p class="m-0">${parseFloat(row["Price"])*parseFloat(row["Quantity"])}</p>
            </td>
            `

        if (loggedIn) {
            htmlString += `
            <td class="data-table-actions">
                <button class="btn btn-primary edit-row">
                    <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button class="btn btn-success save-row d-none">
                        <svg xmlns="http://www.w3.org/2000/svg" style="height:1.5rem; width:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                </button>
            </td>`
        }

        $("#table-rows").append(htmlString + `</tr>`)
    })
}

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
            onValue(ref(database, 'users/' + user.uid + '/data'), (snapshot) => {
                const data = snapshot.val();

                loadOverview(data)
                loadViewDataOptions(data)
                loadTrackOptions(data)
                loadTracklist(data)
                loadDataTable(data, true)

                $(".view-data-list").on("click", ".view-data-option", (e) => {
                    let type = e.currentTarget.attributes[1].value
                    $(".view-data-option").children().removeClass("active")
                    $(e.currentTarget).children().addClass("active")

                    if (type == "Overview") {
                        $("#line-graph-container").hide()
                        $("#overview-graph").show()
                        loadOverview(data)
                    }

                    else {
                        $("#overview-graph").hide()
                        $("#line-graph-container").show()
                        loadLineGraph(data, type)
                    }
                })

                $("#add-to-track-button").on("click", () => {
                    addToSavedTracklist(data, $("#track-options").val())
                })

                $("#track-list").on("click", ".remove-track-button", (e) => {
                    removeFromSavedTracklist(e)
                })

                $("#table-rows").on("click", ".edit-row", (e) => {
                    let tdArray = e.currentTarget.parentElement.parentElement.children
                    tdArray[tdArray.length - 1].children[0].classList.add("d-none")
                    tdArray[tdArray.length - 1].children[1].classList.remove("d-none")

                    for (let i = 0; i < tdArray.length - 2; i++) {
                        tdArray[i].children[0].removeAttribute("readonly")
                        tdArray[i].children[0].classList.remove("form-control-plaintext")
                        tdArray[i].children[0].classList.add("form-control")
                    }
                })
                
                $("#table-rows").on("click", ".save-row", (e) => {
                    let tdArray = e.currentTarget.parentElement.parentElement.children
                    let index = e.currentTarget.parentElement.parentElement.attributes.value.value

                    var updatedRow = {
                        Category: tdArray[0].children[0].value,
                        Date: tdArray[1].children[0].value,
                        Description: tdArray[2].children[0].value,
                        Price: tdArray[3].children[0].value,
                        Quantity: tdArray[4].children[0].value,
                        Type: tdArray[5].children[0].value,
                    }

                    tdArray[6].children[0].innerHTML = parseFloat(updatedRow["Price"]) * parseFloat(updatedRow["Quantity"])
                    update(ref(database, 'users/' + user.uid + '/data/' + index), updatedRow)
                })

                $("#add-transaction-button").removeClass("d-none")
                $("#add-transaction-form").on("submit", function(e) {
                    e.preventDefault()
                    let category = $("#add-transaction-category").val()
                    let description = $("#add-transaction-description").val()
                    let date = $("#add-transaction-date").val()
                    let price = $("#add-transaction-price").val()
                    let quantity = $("#add-transaction-quantity").val()
                    let type = $("#add-transaction-type").val()
                    
                    let row = {
                        Category: category,
                        Date: date,
                        Description: description,
                        Price: price,
                        Quantity : quantity,
                        Type: type
                    }

                    $("#add-transaction-modal").modal("hide")
                    data.push(row)
                    set(ref(database, 'users/' + user.uid + '/data/' + (data.length - 1)), row)
                    loadDataTable(data, true)
                })
            })

            $("#upload-button").on("click", () => {
                $("#real-upload-button").click()
            })

            $("#real-upload-button").on("change", (e) => {
                let reader = new FileReader();
                let selectedFile = e.target.files[0]
        
                if (selectedFile) {
                    reader.readAsBinaryString(selectedFile)
                    reader.onload = (e) => {
                        let workbook = XLSX.read(e.target.result, {type: "binary"})
                        let firstSheetName = workbook.SheetNames[0]
                        let worksheet = workbook.Sheets[firstSheetName]
                        let data = XLSX.utils.sheet_to_json(worksheet, { raw: false })

                        set(ref(database, 'users/' + user.uid + '/data'), data)
                    }
                }
            })
        }

        else {
            $("#upload-button").on("click", () => {
                $("#real-upload-button").click()
            })

            $("#real-upload-button").on("change", (e) => {
                let reader = new FileReader();
                let selectedFile = e.target.files[0]
        
                if (selectedFile) {
                    reader.readAsBinaryString(selectedFile)
                    reader.onload = (e) => {
                        let workbook = XLSX.read(e.target.result, {type: "binary"})
                        let firstSheetName = workbook.SheetNames[0]
                        let worksheet = workbook.Sheets[firstSheetName]
                        let data = XLSX.utils.sheet_to_json(worksheet, { raw: false })
        
                        loadOverview(data)
                        loadViewDataOptions(data)
                        loadTrackOptions(data)
                        loadTracklist(data)
                        loadDataTable(data, false)

                        $(".view-data-list").on("click", ".view-data-option", (e) => {
                            let type = e.currentTarget.attributes[1].value
                            $(".view-data-option").children().removeClass("active")
                            $(e.currentTarget).children().addClass("active")
        
                            if (type == "Overview") {
                                $("#line-graph-container").hide()
                                $("#overview-graph").show()
                                loadOverview(data)
                            }
        
                            else {
                                $("#overview-graph").hide()
                                $("#line-graph-container").show()
                                loadLineGraph(data, type)
                            }
                        })
        
                        $("#add-to-track-button").on("click", () => {
                            addToSavedTracklist(data, $("#track-options").val())
                        })
        
                        $("#track-list").on("click", ".remove-track-button", (e) => {
                            removeFromSavedTracklist(e)
                        })
                    }
                }
            })
        }
    })
})
