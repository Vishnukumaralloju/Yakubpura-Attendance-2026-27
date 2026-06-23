const url = "YOUR_NEW_APPS_SCRIPT_URL"; // మీ గూగుల్ వెబ్ యాప్ కొత్త URL ఇక్కడ పెట్టండి

// యాప్ ఓపెన్ అవ్వగానే ఆటోమేటిక్‌గా విద్యార్థుల లిస్ట్ లోడ్ అవ్వడానికి
window.onload = function() {
    loadStudents();
};

function loadStudents() {
    const className = document.getElementById("className").value;
    const container = document.getElementById("studentContainer");
    const loading = document.getElementById("loading");
    
    container.innerHTML = "";
    loading.style.display = "block";
    
    // Google Sheets నుండి విద్యార్థుల డేటాను Get చేయడం
    fetch(`${url}?className=${encodeURIComponent(className)}`)
    .then(response => response.json())
    .then(students => {
        loading.style.display = "none";
        if(students.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#aaa;'>విద్యార్థులు ఎవరూ లేరు.</p>";
            return;
        }
        
        students.forEach(student => {
            const item = document.createElement("div");
            item.className = "student-item";
            item.innerHTML = `
                <div class="student-info">
                    <span class="roll-no">${student.rollNo}</span>
                    <span class="name">${student.name}</span>
                </div>
                <input type="checkbox" class="attendance-check" data-roll="${student.rollNo}" checked>
            `;
            container.appendChild(item);
        });
    })
    .catch(error => {
        loading.style.display = "none";
        console.error("Error loading students:", error);
        container.innerHTML = "<p style='text-align:center; color:#f44336;'>డేటా లోడ్ చేయడంలో సమస్య వచ్చింది.</p>";
    });
}

function submitAllAttendance() {
    const className = document.getElementById("className").value;
    const dateVal = document.getElementById("attendanceDate").value.trim();
    const msgElement = document.getElementById("msg");
    
    const checkboxes = document.querySelectorAll(".attendance-check");
    if(checkboxes.length === 0) {
        alert("సబ్మిట్ చేయడానికి విద్యార్థుల లిస్ట్ లేదు!");
        return;
    }
    
    msgElement.style.color = "#2196f3";
    msgElement.innerText = "అటెండెన్స్ షీట్‌లోకి అప్‌లోడ్ అవుతోంది... దయచేసి ఆగండి.";
    
    const attendanceData = [];
    checkboxes.forEach(cb => {
        attendanceData.push({
            rollNo: cb.getAttribute("data-roll"),
            isPresent: cb.checked // టిక్ ఉంటే true, లేకపోతే false
        });
    });
    
    const payload = {
        className: className,
        date: dateVal,
        attendance: attendanceData
    };
    
    // డేటాను ఒకేసారి POST రిక్వెస్ట్ ద్వారా షీట్‌కు పంపడం
    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        msgElement.style.color = "#4caf50";
        msgElement.innerText = `${className} తరగతి హాజరు విజయవంతంగా నమోదైనది!`;
    })
    .catch(error => {
        console.error("Error submitting attendance:", error);
        msgElement.style.color = "#f44336";
        msgElement.innerText = "సమర్పించడంలో లోపం జరిగింది. మళ్ళీ ప్రయత్నించండి.";
    });
}
