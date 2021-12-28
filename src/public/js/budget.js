import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

function displayMonthRetrieved() {
    let today = new Date()
    $("#next-month-button").removeAttr("disabled")

    if (dateRetrieved.getMonth() == today.getMonth() && dateRetrieved.getFullYear() == today.getFullYear()) {
        $("#next-month-button").prop("disabled", true)
    }

    $("#select-month-text").html(`${dateRetrieved.toLocaleDateString('en-us', { year:"numeric", month:"long" }) }`)
}

function displayBudget() {
    $("#budget-expense-activities").html("")
    userBudget.map((budget, index) => {
        let key = Object.keys(budget).pop()
        let spent = 0

        if (thisMonthSpent[index] != undefined) {
            spent = thisMonthSpent[index][key]
        }

        else {
            thisMonthSpent.push({[key] : spent})
        }

        let progressPercent = spent / budget[key] * 100

        if (isNaN(progressPercent)) {
            progressPercent = 0
        }

        if (progressPercent == "Infinity") {
            $("#budget-expense-activities").append(`
            <div class="row pt-2 pb-2 justify-content-center align-items-center" value="${key}">
                <div class="col-3 budget-field-text">
                    <input type="text" class="form-control-plaintext fw-bold text-secondary m-0 p-0 budget-field" readonly value="${key}" />
                    <p class="d-flex align-items-center fw-bold m-0">$<input type="number" class="form-control-plaintext fw-bold m-0 p-0 ms-1 budget-field" readonly value="${budget[key]}" /></p>
                </div>
                <div class="col-6 col-lg-4 offset-1">
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-danger" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p class="fw-bold text-primary m-0">$<span class="ps-1">${spent}</span></p>
                        <p class="fw-bold m-0 text-danger">$<span class="ps-1">${budget[key] - spent}</span></p>
                    </div>
                </div>
                <div class="col-1 ms-2 d-none expense-delete">
                    <button class="btn btn-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            `)
        }

        else if (budget[key] - spent < 0) {
            $("#budget-expense-activities").append(`
            <div class="row pt-2 pb-2 justify-content-center align-items-center" value="${key}">
                <div class="col-3 budget-field-text">
                    <input type="text" class="form-control-plaintext fw-bold text-secondary m-0 p-0 budget-field" readonly value="${key}" />
                    <p class="d-flex align-items-center fw-bold m-0">$<input type="number" class="form-control-plaintext fw-bold m-0 p-0 ms-1 budget-field" readonly value="${budget[key]}" /></p>
                </div>
                <div class="col-6 col-lg-4 offset-1">
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-danger" role="progressbar" style="width: ${progressPercent}%;" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">${progressPercent.toFixed(1)}%</div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p class="fw-bold text-primary m-0">$<span class="ps-1">${spent}</span></p>
                        <p class="fw-bold m-0 text-danger">$<span class="ps-1">${budget[key] - spent}</span></p>
                    </div>
                </div>
                <div class="col-1 ms-2 d-none expense-delete">
                    <button class="btn btn-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            `)
        }

        else {
            $("#budget-expense-activities").append(`
            <div class="row pt-2 pb-2 justify-content-center align-items-center" value="${key}">
                <div class="col-3 budget-field-text">
                    <input type="text" class="form-control-plaintext fw-bold text-secondary m-0 p-0 budget-field" readonly value="${key}" />
                    <p class="d-flex align-items-center fw-bold m-0">$<input type="number" class="form-control-plaintext fw-bold m-0 p-0 ms-1 budget-field" readonly value="${budget[key]}" /></p>
                </div>
                <div class="col-6 col-lg-4 offset-1">
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%;" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">${progressPercent.toFixed(1)}%</div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p class="fw-bold text-primary m-0">$<span class="ps-1">${spent}</span></p>
                        <p class="fw-bold m-0">$<span class="ps-1">${budget[key] - spent}</span></p>
                    </div>
                </div>
                <div class="col-1 ms-2 d-none expense-delete">
                    <button class="btn btn-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            `)
        }
    })
}

function retrieveBudgetData() {
    displayMonthRetrieved()

    var totalBudget = 0, totalSpent = 0
    foundExpenses = [], thisMonthSpent = []

    userBudget.map((data) => {
        let key = Object.keys(data).pop()
        budgetKeys.push(key)
        thisMonthSpent.push({[key]: 0})
        totalBudget += data[key]
    })

    $("#total-budget").text(totalBudget)

    userData.map((data) => {
        if (data.Category == "Expense") {
            var dataDate = new Date(data.Date)

            if (dateRetrieved.getFullYear() == dataDate.getFullYear() && dateRetrieved.getMonth() == dataDate.getMonth()) {
                if (!budgetKeys.includes(data.Type)) {

                    if (!foundExpenses.some(e => Object.keys(e).pop() == data.Type)) {
                        foundExpenses.push({[data.Type]: parseFloat(data.Price)})
                    }

                    else {
                        foundExpenses.map((expense) => {
                            if (Object.keys(expense).pop() == data.Type) {
                                expense[data.Type] += parseFloat(data.Price)
                            }
                        })
                    }
                }

                thisMonthSpent.map((budget) => {
                    let key = Object.keys(budget).pop()
                    
                    if (data.Type == key) {
                        budget[key] += parseFloat(data.Price)
                        totalSpent += parseFloat(data.Price)
                    }
                })
            }
        }
    })

    $("#new-budget-expense-activities").html("")
    if (foundExpenses.length != 0) {
        $("#new-budget-expense-activities").html(`
            <div class="pt-3 container">
                <div class="row justify-content-center mb-2">
                    <div class="col-12 col-lg-8">
                        <h5 class="fw-bold text-secondary">Found Expenses</h5>
                    </div>
                </div>
                <div class="row justify-content-center">
                    <hr class="col-12 col-lg-8"/>
                </div>
            </div>
        `)
    }

    foundExpenses.map((expense) => {
        let key = Object.keys(expense).pop()
        totalSpent += parseFloat(expense[key])

        $("#new-budget-expense-activities").append(`
            <div class="row pt-2 pb-2 justify-content-center align-items-center" value="${key}">
                <div class="col-10 col-lg-8 found-expense">
                    <p class="m-0 fw-bold text-secondary">${key}</p>
                    <p class="fw-bold m-0 text-danger">-$<span class="ps-1">${expense[key]}</span></p>
                </div>
                <div class="col-2 col-lg-4 text-end d-none expense-add">
                    <button class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>
            </div>
        `)
    })

    $("#remaining-budget").text(totalBudget - totalSpent)
    let progressPercent = totalSpent / totalBudget * 100

    if (isNaN(progressPercent) || progressPercent == "Infinity") { 
        progressPercent = 0 
    }

    if (totalBudget - totalSpent < 0) {
        $("#total-budget-bar").html(`
            <div class="progress" style="height: 20px;">
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${progressPercent}%;" aria-valuenow=" ${progressPercent}" aria-valuemin="0" aria-valuemax="100"> ${progressPercent.toFixed(1)}%</div>
            </div>
            <div class="d-flex justify-content-between">
                <p class="fw-bold text-primary m-0">$<span class="ps-1">${totalSpent}</span></p>
                <p class="fw-bold m-0 text-danger">$<span class="ps-1">${totalBudget - totalSpent}</span></p>
            </div>
        `)
    } 

    else {
        $("#total-budget-bar").html(`
            <div class="progress" style="height: 20px;">
                <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%;" aria-valuenow=" ${progressPercent}" aria-valuemin="0" aria-valuemax="100"> ${progressPercent.toFixed(1)}%</div>
            </div>
            <div class="d-flex justify-content-between">
                <p class="fw-bold text-primary m-0">$<span class="ps-1">${totalSpent}</span></p>
                <p class="fw-bold m-0">$<span class="ps-1">${totalBudget - totalSpent}</span></p>
            </div>
        `)
    }
    
    displayBudget()
}

var thisMonthSpent = [], userData = [], userBudget = [], foundExpenses = [], budgetKeys = [] 
var dateRetrieved = new Date()

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
            onValue(ref(database, 'users/' + user.uid + '/budget'), (snapshot) => {
                userBudget = snapshot.val()
                displayMonthRetrieved()

                if (userBudget == null) {
                    userBudget = []
                    set(ref(database, 'users/' + user.uid + '/budget'), userBudget)
                }

                onValue(ref(database, 'users/' + user.uid + '/data'), (snapshot) => {
                    userData = snapshot.val()
                    retrieveBudgetData()
                    
                    $("#edit-budget-button").on("click", () => {
                        $("#edit-budget-button").addClass("d-none")
                        $("#save-budget-button").removeClass("d-none")

                        $(".budget-field").removeClass("form-control-plaintext")
                        $(".budget-field").addClass("form-control")
                        $(".budget-field").removeAttr("readonly")
                        
                        $("#add-budget-button-container").removeClass("d-none")
                        
                        $("#activities-title").removeClass("col-12")
                        $("#activities-title").removeClass("col-lg-8")
                        $("#activities-title").addClass("col-10")
                        $("#activities-title").addClass("col-lg-4")

                        $(".expense-delete").removeClass("d-none")
                        $(".expense-add").removeClass("d-none")

                        $(".found-expense").removeClass("col-12")
                        $(".found-expense").addClass("col-4")
                        $(".found-expense").removeClass("col-lg-8")
                        $(".found-expense").addClass("col-lg-4")

                        $(".budget-field-text").removeClass("col-3")
                        $(".budget-field-text").addClass("col-2")
                    })

                    $("#save-budget-button").on("click", () => {
                        userBudget = []

                        $("#budget-expense-activities > .row").each((i) => {
                            let budget = $("#budget-expense-activities")[0].children[i]
                            let budgetName = budget.children[0].children[0].value
                            let budgetValue = budget.children[0].children[1].children[0].value
                            
                            if (budgetName != "") {
                                userBudget.push({[budgetName] : parseFloat(budgetValue)})
                            }
                        })

                        retrieveBudgetData()
                        set(ref(database, 'users/' + user.uid + '/budget'), userBudget)

                        $("#save-budget-button").addClass("d-none")
                        $("#edit-budget-button").removeClass("d-none")

                        $(".budget-field").removeClass("form-control")
                        $(".budget-field").addClass("form-control-plaintext")
                        $(".budget-field").prop("readonly", true)

                        $("#add-budget-button-container").addClass("d-none")
                        
                        $("#activities-title").removeClass("col-lg-4")
                        $("#activities-title").addClass("col-lg-8")
                        $("#activities-title").removeClass("col-10")
                        $("#activities-title").addClass("col-12")
                        
                        $(".expense-delete").addClass("d-none")
                        $(".expense-add").addClass("d-none")
                        
                        $(".found-expense").addClass("col-lg-8")
                        $(".found-expense").removeClass("col-lg-4")
                        $(".found-expense").addClass("col-8")
                        $(".found-expense").removeClass("col-4")

                        $(".budget-field-text").removeClass("col-2")
                        $(".budget-field-text").addClass("col-3")
                    })

                    $("#add-budget-button").on("click", () => {
                        $("#budget-expense-activities").append(`
                        <div class="row pt-2 pb-2 justify-content-center align-items-center">
                            <div class="col-2 budget-field-text">
                                <input type="text" class="form-control fw-bold text-secondary m-0 p-0 budget-field" value="" />
                                <p class="d-flex align-items-center fw-bold m-0">$<input type="number" class="form-control fw-bold m-0 p-0 ms-1 budget-field" value="0" /></p>
                            </div>
                            <div class="col-6 col-lg-4 offset-1">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <p class="fw-bold text-primary m-0">$<span class="ps-1">0</span></p>
                                    <p class="fw-bold m-0">$<span class="ps-1">0</span></p>
                                </div>
                            </div>
                            <div class="col-1 ms-2 expense-delete">
                                <button class="btn btn-danger">
                                    <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        `)
                    })

                    $("#prev-month-button").on("click", () => {
                        dateRetrieved.setMonth(dateRetrieved.getMonth() - 1);
                        retrieveBudgetData()
                    })

                    $("#next-month-button").on("click", () => {
                        dateRetrieved.setMonth(dateRetrieved.getMonth() + 1);
                        retrieveBudgetData()
                    })

                    $("#budget-expense-activities").on("click", ".expense-delete", (e) => {
                        let value = e.currentTarget.parentElement.attributes.value.value

                        userBudget.map((b, index) => {
                            if (Object.keys(b).pop() == value) {
                                userBudget.splice(index, 1)
                                e.currentTarget.parentElement.remove()
                            }
                        })
                    })

                    $("#new-budget-expense-activities").on("click", ".expense-add", (e) => {
                        let key = e.currentTarget.parentElement.children[0].children[0].innerHTML
                        let value = e.currentTarget.parentElement.children[0].children[1].children[0].innerHTML
                        userBudget.push({[key]: 0})

                        if (value != 0) {
                            thisMonthSpent.push({[key] : value})
                        }

                        e.currentTarget.parentElement.remove()

                        $("#budget-expense-activities").append(`
                        <div class="row pt-2 pb-2 justify-content-center align-items-center">
                            <div class="col-4 budget-field-text">
                                <input type="text" class="form-control fw-bold text-secondary m-0 p-0 budget-field" value="${key}" />
                                <p class="d-flex align-items-center fw-bold m-0">$<input type="number" class="form-control fw-bold m-0 p-0 ms-1 budget-field" value="${0}" /></p>
                            </div>
                            <div class="col-4 offset-1">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <p class="fw-bold text-primary m-0">$<span class="ps-1">${value}</span></p>
                                    <p class="fw-bold m-0">$<span class="ps-1">0</span></p>
                                </div>
                            </div>
                            <div class="col-1 ms-2 expense-delete">
                                <button class="btn btn-danger">
                                    <svg xmlns="http://www.w3.org/2000/svg" style="width:1.5rem; height:1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        `)
                    })
                })
            })
        }
    })
})