let recommendedGoal = 0;
let activeDate = null;
let stepsChart;
let monthData = JSON.parse(localStorage.getItem("monthData")) || {};

/* AGE */
function saveAge() {
    const age = +ageInput.value;
    if (!age || age <= 0) {
        alert("Please enter a valid age 🐱");
        return;
    }

    localStorage.setItem("age", age);

    recommendedGoal = age < 18 ? 12000 : age < 50 ? 10000 : 8000;
    goalLabel.textContent = `🐾 Recommended steps: ${recommendedGoal}`;

    closeAgeModal();
}


/* CONFETTI */
function launchConfetti() {
    confetti({ particleCount: 120, spread: 80 });
}

/* CALENDAR */
function renderCalendar() {
    calendarGrid.innerHTML = "";

    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();

    monthLabel.textContent =
        date.toLocaleString("default", { month: "long", year: "numeric" });

    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += `<div></div>`;
    }

    for (let d = 1; d <= days; d++) {
        const key = `${y}-${m + 1}-${d}`;
        let cls = "day";

        if (monthData[key]) {
            cls += monthData[key].steps >= monthData[key].goal
                ? " goal-met"
                : " goal-not-met";
        }

        calendarGrid.innerHTML +=
            `<div class="${cls}" onclick="openModal('${key}')">${d}</div>`;
    }
}

/* MODAL */
function openModal(key) {
    activeDate = key;
    selectedDateLabel.textContent = key;
    const modalGif = document.getElementById("modalCatGif");
    modalGif.src = "hi.gif";
    modalGif.style.display = "block"; 
    goalInput.value = monthData[key]?.goal || recommendedGoal;
    stepsInput.value = monthData[key]?.steps || "";
    inputModal.style.display = "flex";
}

function closeModal() {
    inputModal.style.display = "none";
    catStage.className = "walk";
    catStage.textContent = "🐈‍";
}

function openAgeModal() {
    ageModal.style.display = "flex";
    ageInput.value = localStorage.getItem("age") || "";
}

function closeAgeModal() {
    ageModal.style.display = "none";
}


/* SAVE */
function saveDay() {
    const goal = +document.getElementById("goalInput").value;
    const steps = +document.getElementById("stepsInput").value;


    monthData[activeDate] = { goal, steps };
    localStorage.setItem("monthData", JSON.stringify(monthData));

    const modalGif = document.getElementById("modalCatGif");

    if (steps >= goal) {
        modalGif.src = "wow.gif"; // celebrate GIF
        modalGif.style.display = "block";
        launchConfetti();
    } else {
        modalGif.src = "sus.gif";   // sulk GIF
        modalGif.style.display = "block";
    }

    setTimeout(() => {
        inputModal.style.display = "none";
        modalGif.style.display = "none";
        catImg.src = "cat.png";
        catStage.className = "walk";
    }, 1500);

    renderCalendar();
    updateChart();
}


function resetDay() {
    delete monthData[activeDate];
    localStorage.setItem("monthData", JSON.stringify(monthData));
    closeModal();
    renderCalendar();
    updateChart();
}

/* CHART */
function updateChart() {
    const ctx = document.getElementById("stepsChart");
    const type = document.getElementById("chartType").value;

    const labels = Object.keys(monthData).map(k => k.split("-")[2]);
    const goals = Object.values(monthData).map(d => d.goal);
    const steps = Object.values(monthData).map(d => d.steps);

    if (stepsChart) stepsChart.destroy();

    stepsChart = new Chart(ctx, {
    type,
    data: {
        labels,
        datasets: [
            {
                label: "Goal",
                data: goals,
                borderColor: "rgba(33, 150, 243, 0.8)",      
                backgroundColor: "rgba(33, 150, 243, 0.4)", // semi-transparent fill
                fill: type === "radar"
            },
            {
                label: "Steps",
                data: steps,
                borderColor: "rgba(76, 175, 80, 1)",
                backgroundColor: steps.map((s, i) => {
                    return s >= goals[i] 
                        ? "rgba(76, 175, 80, 0.4)"  // green with 40% opacity
                        : "rgba(255, 152, 0, 0.4)"; // orange with 40% opacity
                }),
                fill: type === "radar"
            }
        ]
    },
    options: {
        animation: { duration: 1000 },
        scales: type === "radar" ? {} : { y: { beginAtZero: true } }
    }
});

}


/* INIT */
renderCalendar();
updateChart();
