// ------------------------------
// 連接 MetaMask
// ------------------------------
document.getElementById("connectBtn").onclick = async () => {
    if (!window.ethereum) {
        alert("請先安裝 MetaMask");
        return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    window.signerAddress = accounts[0];

    const accountBox = document.getElementById("accountBox");
    accountBox.classList.remove("alert-secondary");
    accountBox.classList.add("alert-success");
    accountBox.textContent = "已連接錢包：" + window.signerAddress;

    window.provider = new ethers.BrowserProvider(window.ethereum);
    window.signer = await window.provider.getSigner();
    window.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, window.signer);

    alert("MetaMask 連接成功！");
};

// ------------------------------
// 工具：轉換 BigInt → Number
// ------------------------------
function convert(recordArray) {
    return recordArray.map(r => ({
        id: Number(r.id),
        doctorName: r.doctorName,
        diagnosis: r.diagnosis,
        note: r.note,
        timestamp: Number(r.timestamp),
        doctorAddr: r.doctorAddr
    }));
}

// 時間格式化
function formatTimestamp(ts) {
    if (!ts) return "-";
    const d = new Date(ts * 1000);
    return d.toLocaleString("zh-TW");
}

// ------------------------------
// 將病歷渲染成卡片 UI
// ------------------------------
function renderRecords(records) {
    const container = document.getElementById("recordsContainer");
    container.innerHTML = "";

    if (!records || records.length === 0) {
        container.innerHTML = '<p class="text-muted">尚無病歷紀錄</p>';
        return;
    }

    records.forEach((r, idx) => {
        const card = document.createElement("div");
        card.className = "card mb-2 record-card";

        card.innerHTML = `
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">病歷編號 #${r.id}</h6>
              <span class="badge bg-light text-muted badge-time">
                ${formatTimestamp(r.timestamp)}
              </span>
            </div>
            <p class="mb-1"><strong>醫師：</strong>${r.doctorName}</p>
            <p class="mb-1"><strong>診斷：</strong>${r.diagnosis}</p>
            <p class="mb-1"><strong>備註：</strong>${r.note || "（無備註）"}</p>
            <p class="mb-0 text-muted small">
              <strong>醫師地址：</strong>${r.doctorAddr}
            </p>
          </div>
        `;
        container.appendChild(card);
    });
}

// ------------------------------
// 查詢自己的病歷
// ------------------------------
document.getElementById("querySelfBtn").onclick = async () => {
    const container = document.getElementById("recordsContainer");

    if (!window.contract || !window.signerAddress) {
        container.innerHTML = '<p class="text-danger">請先連接錢包</p>';
        return;
    }

    try {
        const raw = await window.contract.getRecords(window.signerAddress);
        const cleaned = convert(raw);
        renderRecords(cleaned);
    } catch (err) {
        container.innerHTML =
            '<p class="text-danger">查詢失敗：' + err.message + "</p>";
    }
};

// ------------------------------
// 查詢他人的病歷（未授權會被合約擋）
// ------------------------------
document.getElementById("queryOtherBtn").onclick = async () => {
    const patient = document.getElementById("otherPatientAddress").value;
    const container = document.getElementById("recordsContainer");

    if (!window.contract) {
        container.innerHTML = '<p class="text-danger">請先連接錢包</p>';
        return;
    }

    if (!ethers.isAddress(patient)) {
        container.innerHTML = '<p class="text-danger">請輸入合法的病患錢包地址</p>';
        return;
    }

    try {
        const raw = await window.contract.getRecords(patient);
        const cleaned = convert(raw);
        renderRecords(cleaned);
    } catch (err) {
        container.innerHTML =
            '<p class="text-danger">❌ 無法查詢（你不是病患本人或未被授權）：<br>' +
            err.message +
            "</p>";
    }
};

// ------------------------------
// 授權醫生（病患使用）
// ------------------------------
document.getElementById("grantBtn").onclick = async () => {
    const doctor = document.getElementById("doctorAddress").value;
    const status = document.getElementById("grantStatus");

    if (!window.contract || !window.signerAddress) {
        status.textContent = "請先連接錢包";
        return;
    }

    // ❌ 禁止把自己授權給自己
    if (doctor.toLowerCase() === window.signerAddress.toLowerCase()) {
        status.textContent = "❌ 你不能授權自己！";
        return;
    }

    if (!ethers.isAddress(doctor)) {
        status.textContent = "請輸入合法的醫生錢包地址";
        return;
    }

    try {
        const tx = await window.contract.setPermission(doctor, true);
        status.textContent = "授權交易送出中...";
        await tx.wait();
        status.textContent = "✔ 已成功授權！";
    } catch (err) {
        status.textContent = "授權失敗：" + err.message;
    }
};

// ------------------------------
// 從事件 AccessChanged 判斷是否被授權（不改 Solidity）
// ------------------------------
async function isAllowed(patient, doctor) {
    const filter = window.contract.filters.AccessChanged(patient, doctor);
    const events = await window.contract.queryFilter(filter);

    if (events.length === 0) return false;

    const last = events[events.length - 1];
    const status = last.args.status ?? last.args[2];
    return status;
}

// ------------------------------
// 新增病歷（希望只有被授權醫生可以新增）
// ------------------------------
document.getElementById("addRecordBtn").onclick = async () => {
    const patient = document.getElementById("newPatient").value;
    const doctorName = document.getElementById("newDoctor").value;
    const diagnosis = document.getElementById("newDiagnosis").value;
    const note = document.getElementById("newNote").value;
    const status = document.getElementById("addStatus");

    if (!window.contract || !window.signerAddress) {
        status.textContent = "請先連接錢包";
        return;
    }
    if (!ethers.isAddress(patient)) {
        status.textContent = "請輸入合法的病患錢包地址";
        return;
    }

    const allowed = await isAllowed(patient, window.signerAddress);

    if (!allowed) {
        status.textContent = "❌ 你沒有被這位病患授權，不能新增病歷！";
        return;
    }

    try {
        const tx = await window.contract.addRecord(
            patient,
            doctorName,
            diagnosis,
            note
        );
        status.textContent = "病歷上鏈中...";
        await tx.wait();
        status.textContent = "✔ 新增成功！";
    } catch (err) {
        status.textContent = "❌ 新增失敗：" + err.message;
    }
};