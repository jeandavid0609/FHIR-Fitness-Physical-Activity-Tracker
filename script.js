// --- 設定 Firely Server ---
const FHIR_SERVER_URL = "https://server.fire.ly";
const HEADERS = { "Content-Type": "application/fhir+json" };

let myChart = null;

// 1. 調閱資料
async function fetchData() {
    const pid = document.getElementById('patientId').value.trim();
    if(!pid) return alert("請輸入 ID");

    try {
        // 抓取處方
        const srRes = await fetch(`${FHIR_SERVER_URL}/ServiceRequest?patient=${pid}`, { headers: HEADERS });
        const srData = await srRes.json();
        
        document.getElementById('dashboard').classList.remove('hidden');

        if(srData.entry && srData.entry.length > 0) {
            document.getElementById('taskName').innerText = srData.entry[0].resource.code.coding[0].display;
        } else {
            document.getElementById('taskName').innerText = "未找到處方 (可直接上傳)";
        }

        updateChart(pid); // 畫圖

    } catch (e) {
        alert("讀取失敗，請確認 ID 正確。");
        console.error(e);
    }
}

// 2. 畫圖表
async function updateChart(pid) {
    const url = `${FHIR_SERVER_URL}/Observation?patient=${pid}&code=22656-1&_sort=date`;
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();

    const labels = [];
    const values = [];

    if (data.entry) {
        data.entry.forEach(entry => {
            const obs = entry.resource;
            if (obs.effectiveDateTime && obs.valueQuantity) {
                const date = new Date(obs.effectiveDateTime);
                labels.push(`${date.getHours()}:${date.getMinutes()}`);
                values.push(obs.valueQuantity.value);
            }
        });
    }

    const ctx = document.getElementById('myChart');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '深蹲次數 (Reps)',
                data: values,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        }
    });
}

// 3. 上傳資料
async function uploadObservation() {
    const pid = document.getElementById('patientId').value;
    const reps = document.getElementById('repsInput').value;
    
    if(!reps) return alert("請輸入數字");

    const obsData = {
        resourceType: "Observation",
        status: "final",
        code: { coding: [{ system: "http://loinc.org", code: "22656-1", display: "Squats" }] },
        subject: { reference: `Patient/${pid}` },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
            value: Number(reps),
            unit: "reps",
            system: "http://unitsofmeasure.org",
            code: "{reps}"
        }
    };

    await fetch(`${FHIR_SERVER_URL}/Observation`, {
        method: "POST", headers: HEADERS, body: JSON.stringify(obsData)
    });

    alert("上傳成功！");
    updateChart(pid);
}

// 4. 建立測試資料
async function createTestData() {
    alert("正在建立...");
    let res = await fetch(`${FHIR_SERVER_URL}/Patient`, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ resourceType: "Patient", name: [{ family: "Test", given: ["User"] }] })
    });
    let json = await res.json();
    document.getElementById('patientId').value = json.id;
    alert("建立成功 ID: " + json.id);
}
