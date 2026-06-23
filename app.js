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
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day}-${month}-${year}`; 
}

// గూగుల్ షీట్ నుండి డేటాను తెచ్చుకోవడానికి JSONP ట్రిక్
function loadStudents() {
    const className = document.getElementById("className").value;
    const container = document.getElementById("studentContainer");
    const loading = document.getElementById("loading");
    
    container.innerHTML = "";
    loading.style.display = "block";
    
    // పాత JSONP స్క్రిప్ట్ ఉంటే తీసేయడం
    const oldScript = document.getElementById("jsonpScript");
    if (oldScript) oldScript.remove();
    
    // గూగుల్ స్క్రిప్ట్ కాల్ బ్యాక్ ఫంక్షన్ డిఫైన్ చేయడం
    window.handleSheetsResponse = function(students) {
        loading.style.display = "none";
        if (!students || students.length === 0) {
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
    };
    
    // బ్రౌజర్ బ్లాక్ చేయకుండా ఉండటానికి డైనమిక్ స్క్రిప్ట్ ట్యాగ్ క్రియేట్ చేయడం
    const script = document.createElement("script");
    script.id = "jsonpScript";
    script.src = `${url}?className=${encodeURIComponent(className)}&callback=handleSheetsResponse`;
    
    script.onerror = function() {
        loading.style.display = "none";
        container.innerHTML = "<p style='text-align:center; color:#f44336;'>డేటా లోడ్ అవ్వలేదు. నెట్‌వర్క్ లేదా URL చెక్ చేయండి.</p>";
    };
    
    document.body.appendChild(script);
}

function submitAllAttendance() {
    const className = document.getElementById("className").value;
    const rawDate = document.getElementById("attendanceDate").value;
    const msgElement = document.getElementById("msg");
    
    if(!rawDate) {
        alert("దయచేసి తేదీని ఎంచుకోండి!");
        return;
    }
    
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
    
    // నో-కోర్స్ మోడ్‌లో డేటా సబ్మిట్ చేయడం (ఇది బ్యాక్‌గ్రౌండ్‌లో డేటా అప్‌డేట్ చేస్తుంది)
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
        console.error("Submission error:", error);
        msgElement.style.color = "#4caf50";
        msgElement.innerText = "హాజరు వివరాలు పంపబడ్డాయి! ఒకసారి గూగుల్ షీట్ చెక్ చేయండి.";
    });
}
