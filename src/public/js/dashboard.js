import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

function loadOverview(data) {
    $("#overview-graph-container").html("<canvas id='overview-graph' style='max-height: 25rem'></canvas>")
    if (data) {
        $("#data-title").text("Overview")
        var totalAssets = 0, totalLiabilities = 0, totalExpenses = 0

        data.map((row) => {
            switch (row["Category"]) {
                case 'Asset':
                    totalAssets += parseInt(row["Price"])
                case 'Liability':
                    totalLiabilities += parseInt(row["Price"])
                case 'Expense':
                    totalExpenses += parseInt(row["Price"])
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
            dataArray.push(row["Price"])
        }
    })

    new Chart(document.getElementById('line-graph').getContext('2d'), {
        type: 'line',
        data: {
            labels: dateArray,
            datasets: [{
                label: type,
                data: dataArray,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
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
            todayTotal += parseInt(data["Price"])
        }
    
        else if (data["Type"] == type && new Date(data["Date"]).toLocaleDateString('en-SG') == yesterday) {
            yesterdayTotal += parseInt(data["Price"])
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

function loadDataTable(data) {
    // Retrieving headers for data table
    let headers = Object.keys(data[0])
    var headerHTML = ""
    headers.map((header) => {
        headerHTML += `<th scope="col">${header}</th>`
    })
    $("#table-headers").html(headerHTML)

    // Retrieving row of data for data table
    $("#table-rows").html("")
    data.map((row) => {
        $("#table-rows").append(`
        <tr>
            <td>${row["Category"]}</td>
            <td>${row["Date"]}</td>
            <td>${row["Description"]}</td>
            <td>${row["Price"]}</td>
            <td>${row["Type"]}</td>
        </tr>
        `)
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
                loadDataTable(data)

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

                        loadOverview(data)
                        loadViewDataOptions(data)
                        loadTrackOptions(data)
                        loadTracklist(data)
        
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
