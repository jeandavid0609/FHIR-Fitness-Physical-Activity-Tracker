// 設定 FHIR Server URL (使用 HAPI Public Server R4)
const FHIR_SERVER_URL = "https://hapi.fhir.org/baseR4";

// 全域變數
let currentPatientId = "";
let myChart = null;

// 1. 建立測試資料 (Data Provider)
async function createTestData() {
    alert("正在建立測試資料，請稍候...");
    
    // 1.1 建立 Patient
    const patientData = {
        resourceType: "Patient",
        name: [{ family: "Test", given: ["FitnessUser"] }],
        gender: "other"
    };
    
    try {
        const pRes = await fetch(`${FHIR_SERVER_URL}/Patient`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patientData)
        });
        const pJson = await pRes.json();
        const newId = pJson.id;

        // 1.2 建立 ServiceRequest (運動處方: 深蹲)
        const srData = {
            resourceType: "ServiceRequest",
            status: "active",
            intent: "order",
            code: {
                coding: [{ system: "http://loinc.org", code: "22656-1", display: "Squats" }]
            },
            subject: { reference: `Patient/${newId}` }
        };

        await fetch(`${FHIR_SERVER_URL}/ServiceRequest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(srData)
        });

        // 自動填入 ID 並載入
        document.getElementById("patientIdInput").value = newId;
        alert(`測試資料建立成功！Patient ID: ${newId}`);
        loadData();

    } catch (e) {
        alert("建立失敗，可能是 Server 忙碌中，請重試。" + e);
    }
}

// 2. 調閱資料 (Read)
async function loadData() {
    currentPatientId = document.getElementById("patientIdInput").value.trim();
    if (!currentPatientId) {
        alert("請輸入 Patient ID");
        return;
    }

    // 顯示主畫面
    document.getElementById("mainContent").classList.remove("d-none");

    // 2.1 讀取 ServiceRequest (處方)
    try {
        const srUrl = `${FHIR_SERVER_URL}/ServiceRequest?patient=${currentPatientId}&status=active`;
        const srRes = await fetch(srUrl);
        const srJson = await srRes.json();

        if (srJson.entry && srJson.entry.length > 0) {
            const task = srJson.entry[0].resource.code.coding[0].display;
            document.getElementById("prescriptionTitle").innerText = "今日任務: " + task;
        } else {
            document.getElementById("prescriptionTitle").innerText = "無待辦事項";
        }

        // 2.2 讀取 Observation (歷史紀錄)
        fetchObservations();

    } catch (e) {
        console.error(e);
        alert("讀取資料失敗");
    }
}

// 3. 上傳資料 (Create)
async function uploadObservation() {
    const reps = document.getElementById("repsInput").value;
    if (!reps) {
        alert("請輸入次數");
        return;
    }

    const obsData = {
        resourceType: "Observation",
        status: "final",
        code: {
            coding: [{ system: "http://loinc.org", code: "22656-1", display: "Squats" }]
        },
        subject: { reference: `Patient/${currentPatientId}` },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
            value: Number(reps),
            unit: "reps",
            system: "http://unitsofmeasure.org",
            code: "{reps}"
        }
    };

    try {
        const res = await fetch(`${FHIR_SERVER_URL}/Observation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obsData)
        });

        if (res.ok) {
            alert("上傳成功！");
            fetchObservations(); // 重新整理圖表
        } else {
            alert("上傳失敗");
        }
    } catch (e) {
        alert("錯誤: " + e);
    }
}

// 4. 讀取 Observation 並繪圖
async function fetchObservations() {
    const url = `${FHIR_SERVER_URL}/Observation?patient=${currentPatientId}&code=22656-1&_sort=date`;
    const res = await fetch(url);
    const data = await res.json();

    const labels = [];
    const values = [];

    if (data.entry) {
        data.entry.forEach(entry => {
            const obs = entry.resource;
            if (obs.valueQuantity) {
                // 格式化時間顯示
                const date = new Date(obs.effectiveDateTime).toLocaleString();
                labels.push(date);
                values.push(obs.valueQuantity.value);
            }
        });
    }

    renderChart(labels, values);
}

// 5. 繪製圖表 (Chart.js)
function renderChart(labels, dataPoints) {
    const ctx = document.getElementById('fitnessChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '深蹲次數 (Squats Reps)',
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
