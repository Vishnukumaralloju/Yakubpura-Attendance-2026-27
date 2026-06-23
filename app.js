const url = "https://script.google.com/macros/s/AKfycbzFidAOpe3Fu5UJcw4jBobekqiAt5bOUnG0Qdc5G-_CR-lCgXX7tGsYLPzwnqCsDy-8jw/exec"; 

window.onload = function() {
    // ఈ రోజు తేదీని ఆటోమేటిక్‌గా క్యాలెండర్‌లో సెట్ చేయడానికి
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("attendanceDate").value = today;
    loadStudents();
};

// క్యాలెండర్ తేదీని (YYYY-MM-DD) గూగుల్ షీట్ ఫార్మాట్ (DD-MMM-YYYY) లోకి మార్చే ఫంక్షన్
function formatDateToSheet(dateString) {
    if (!dateString) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateString.split("-"); // [YYYY, MM, DD]
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day}-${month}-${year}`; // ఉదా: 23-Jun-2026
}

function loadStudents() {
    const className = document.getElementById("className").value;
    const container = document.getElementById("studentContainer");
    const loading = document.getElementById("loading");
    
    container.innerHTML = "";
    loading.style.display = "block";
    
    // గూగుల్ షీట్ డేటాను కనెక్ట్ చేయడం
    fetch(`${url}?className=${encodeURIComponent(className)}`)
    .then(response => response.json())
    .then(students => {
        loading.style.display = "none";
        if(!students || students.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#aaa;'>విద్యార్థులు ఎవరూ లేరు.</p>";
            return;
        }
        
        students.forEach(student => {
            const item = document.createElement("div");
            item.className = "student-item";
            item.innerHTML = `
                <div class="student-info" style="display:flex; width:80%; align-items:center;">
                    <span class="roll-no" style="color:#4caf50; font-weight:bold; width:30px;">${student.rollNo}</span>
                    <span class="name" style="color:#fff;">${student.name}</span>
                </div>
                <input type="checkbox" class="attendance-check" data-roll="${student.rollNo}" checked>
            `;
            container.appendChild(item);
        });
    })
    .catch(error => {
        loading.style.display = "none";
        console.error("Error loading students:", error);
        container.innerHTML = "<p style='text-align:center; color:#f44336;'>డేటా లోడ్ అవ్వలేదు. దయచేసి Apps Script లో New Version సేవ్ చేశారో లేదో చూడండి.</p>";
    });
}

function submitAllAttendance() {
    const className = document.getElementById("className").value;
    const rawDate = document.getElementById("attendanceDate").value;
    const msgElement = document.getElementById("msg");
    
    if(!rawDate) {
        alert("దయచేసి తేదీని ఎంచుకోండి!");
        return;
    }
    
    // తేదీని షీట్ ఫార్మాట్ లోకి మార్చడం
    const dateVal = formatDateToSheet(rawDate);
    
    const checkboxes = document.querySelectorAll(".attendance-check");
    if(checkboxes.length === 0) {
        alert("సబ్మిట్ చేయడానికి విద్యార్థుల లిస్ట్ లేదు!");
        return;
    }
    
    msgElement.style.color = "#ff9800";
    msgElement.innerText = "హాజరు షీట్‌లోకి అప్‌లోడ్ అవుతోంది... దయచేసి ఆగండి.";
    
    const attendanceData = [];
    checkboxes.forEach(cb => {
        attendanceData.push({
            rollNo: cb.getAttribute("data-roll"),
            isPresent: cb.checked
        });
    });
    
    const payload = {
        className: className,
        date: dateVal,
        attendance: attendanceData
    };
    
    fetch(url, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(res => {
        if(res.status === "success") {
            msgElement.style.color = "#4caf50";
            msgElement.innerText = `${className} తరగతి హాజరు (${dateVal}) విజయవంతంగా నమోదైనది!`;
        } else {
            msgElement.style.color = "#f44336";
            msgElement.innerText = "Error: " + res.message;
        }
    })
    .catch(error => {
        // కొన్నిసార్లు గూగుల్ రెస్పాన్స్ ని బ్రౌజర్ ఆపినా బ్యాక్‌గ్రౌండ్‌లో డేటా అప్‌డేట్ అవుతుంది
        console.error("Submission status check:", error);
        msgElement.style.color = "#4caf50";
        msgElement.innerText = "హాజరు వివరాలు పంపబడ్డాయి! ఒకసారి గూగుల్ షీట్ చెక్ చేయండి.";
    });
}
