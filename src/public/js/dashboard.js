function loadOverview(data) {
    if (data) {
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
    var todayTotal = 0
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    var yesterdayTotal = 0

    if (new Date(data["Date"]).toLocaleDateString('en-SG') == new Date().toLocaleDateString('en-SG')) todayTotal += parseInt(data[type])

    else if (new Date(data["Date"]).toLocaleDateString('en-SG') == yesterday.toLocaleDateString('en-SG')) yesterdayTotal += parseInt(data[type])

    let total = todayTotal - yesterdayTotal
    var cardHTML = `<div class="card mt-3 track-card" value="${type}">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="m-0 card-title">${type}</h6>
                                <h4 class="m-0">$${todayTotal}</h4>`

    if (total < 0) {
        cardHTML += `<div class="d-flex">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" weight="1.5rem" class="text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <p class="text-danger m-0"> ${total}</p>
                    </div>`
    }

    else if (total == 0) {
        cardHTML += `<p class="text-muted m-0">${total}</p>`
    }

    else {
        cardHTML += `<div class="d-flex">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" weight="1.5rem" class="text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

$(document).ready(function() {
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
                loadTrackOptions(data)
                loadTracklist(data)

                $("#add-to-track-button").on("click", () => {
                    addToSavedTracklist(data, $("#track-options").val())
                })

                $("#track-list").on("click", ".remove-track-button", (e) => {
                    removeFromSavedTracklist(e)
                })
            }
        }
    })
})
