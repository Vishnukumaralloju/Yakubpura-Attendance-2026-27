const url = "https://script.google.com/macros/s/AKfycbzjLh5q0WoBD5Se92C0H6qzVV6W9MvLuTWaI4QcxaRnrDjxSZznVeUWSGrepcSWV_hDAg/exec"; 

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
    const parts = dateString.split("-"); 
    return `${parseInt(parts[2], 10)}-${months[parseInt(parts[1], 10) - 1]}-${parts[0]}`; 
}

function loadStudents() {
    const className = document.getElementById("className").value;
    const container = document.getElementById("studentContainer");
    const loading = document.getElementById("loading");
    
    container.innerHTML = "";
    loading.style.display = "block";
    
    // మీ గూగుల్ స్క్రిప్ట్ నుండి డేటాను డైరెక్ట్‌గా రీడ్ చేసే పక్కా లాజిక్
    fetch(`${url}?className=${encodeURIComponent(className)}`, { method: "GET", redirect: "follow" })
    .then(response => response.json())
    .then(students => {
        loading.style.display = "none";
        if (!students || students.length === 0) {
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
        container.innerHTML = "<p style='text-align:center; color:#f44336;'>డేటా లోడ్ అవ్వలేదు. దయచేసి పేజీని రీఫ్రెష్ చేయండి.</p>";
    });
}

function submitAllAttendance() {
    const className = document.getElementById("className").value;
    const rawDate = document.getElementById("attendanceDate").value;
    const msgElement = document.getElementById("msg");
    
    if(!rawDate) { alert("దయచేసి తేదీని ఎంచుకోండి!"); return; }
    
    const dateVal = formatDateToSheet(rawDate);
    const checkboxes = document.querySelectorAll(".attendance-check");
    
    msgElement.style.color = "#ff9800";
    msgElement.innerText = "హాజరు షీట్‌లోకి అప్‌లోడ్ అవుతోంది... దయచేసి ఆగండి.";
    
    const attendanceData = [];
    checkboxes.forEach(cb => {
        attendanceData.push({
            rollNo: cb.getAttribute("data-roll"),
            isPresent: cb.checked
        });
    });
    
    const payload = { className: className, date: dateVal, attendance: attendanceData };
    
    fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
    })
    .then(() => {
        msgElement.style.color = "#4caf50";
        msgElement.innerText = `${className} తరగతి హాజరు (${dateVal}) విజయవంతంగా నమోదైనది!`;
    })
    .catch(error => {
        console.error("Error:", error);
        msgElement.style.color = "#4caf50";
        msgElement.innerText = "హాజరు వివరాలు పంపబడ్డాయి! ఒకసారి గూగుల్ షీట్ చెక్ చేయండి.";
    });
}
