const token = localStorage.getItem("token");

if(!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const nomeSalvato = localStorage.getItem("nome");
    document.getElementById("nome-utente").textContent = nomeSalvato ? "Hello, " + nomeSalvato : "Hello, User";
    caricaTasks();
    
    // Controlla i ritardi ogni minuto
    setInterval(aggiornaRitardi, 60000);
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    window.location.href = "login.html";
}

function aggiornaCapybara(percentuale) {
    const mouth = document.getElementById("capybara-mouth");
    const guanciaSx = document.getElementById("guancia-sx");
    const guanciaDx = document.getElementById("guancia-dx");

    if(percentuale === 0) {
        mouth.innerHTML = `<path d="M88 92 Q100 86 112 92" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        guanciaSx.setAttribute("opacity", "0");
        guanciaDx.setAttribute("opacity", "0");
    } else if(percentuale <= 25) {
        mouth.innerHTML = `<path d="M88 90 Q100 90 112 90" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        guanciaSx.setAttribute("opacity", "0");
        guanciaDx.setAttribute("opacity", "0");
    } else if(percentuale <= 50) {
        mouth.innerHTML = `<path d="M88 89 Q100 94 112 89" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        guanciaSx.setAttribute("opacity", "0.2");
        guanciaDx.setAttribute("opacity", "0.2");
    } else if(percentuale <= 75) {
        mouth.innerHTML = `<path d="M86 88 Q100 96 114 88" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        guanciaSx.setAttribute("opacity", "0.35");
        guanciaDx.setAttribute("opacity", "0.35");
    } else if(percentuale < 100) {
        mouth.innerHTML = `<path d="M84 87 Q100 98 116 87" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M84 87 Q100 105 116 87" stroke="#E8B98A" stroke-width="1" fill="#E8B98A" opacity="0.5"/>`;
        guanciaSx.setAttribute("opacity", "0.5");
        guanciaDx.setAttribute("opacity", "0.5");
    } else {
        mouth.innerHTML = `<path d="M82 86 Q100 100 118 86" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="93" y="86" width="7" height="8" rx="2" fill="white" stroke="#6B3A1A" stroke-width="1"/><rect x="101" y="86" width="7" height="8" rx="2" fill="white" stroke="#6B3A1A" stroke-width="1"/>`;
        guanciaSx.setAttribute("opacity", "0.7");
        guanciaDx.setAttribute("opacity", "0.7");
    }
}

function aggiornaProgresso() {
    const tutte = document.querySelectorAll(".new-checkbox");
    const completate = document.querySelectorAll(".new-checkbox:checked");
    const totale = tutte.length;
    const fatte = completate.length;
    const percentuale = totale === 0 ? 0 : Math.round((fatte / totale) * 100);

    document.getElementById("progress-bar-fill").style.width = percentuale + "%";
    document.getElementById("progress-percentage").textContent = percentuale + "%";
    document.getElementById("progress-count").textContent = `${fatte} / ${totale} completed`;
    aggiornaCapybara(percentuale);
}

function aggiornaRitardi() {
    const labels = document.querySelectorAll(".new-label");
    const adesso = new Date();

    labels.forEach(label => {
        const checkbox = label.querySelector(".new-checkbox");
        const scadenzaEl = label.querySelector(".task-scadenza");

        if (scadenzaEl && scadenzaEl.dataset.orario) {
            const [ore, minuti] = scadenzaEl.dataset.orario.split(":");
            const scadenzaOggi = new Date();
            scadenzaOggi.setHours(parseInt(ore), parseInt(minuti), 0, 0);

            if (!checkbox.checked && scadenzaOggi < adesso) {
                scadenzaEl.classList.add("scaduta");
                scadenzaEl.textContent = "In ritardo: " + scadenzaEl.dataset.orario;
            } else {
                scadenzaEl.classList.remove("scaduta");
                scadenzaEl.textContent = "Entro le " + scadenzaEl.dataset.orario;
            }
        }
    });
}

async function caricaTasks(){
    try {
        const res = await fetch("https://my-happy-capybara.onrender.com/tasks", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const tasks = await res.json();
        tasks.forEach(task => creaTaskDOM(task));
        aggiornaProgresso();
        aggiornaRitardi();
    } catch(err) {
        console.error("Errore nel caricamento:", err);
    }
}

function creaTaskDOM(task){
    const container = document.getElementById("div-checkbox");
    const label = document.createElement("label");
    label.className = "new-label";
    label.dataset.taskId = task._id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "new-checkbox";
    checkbox.checked = task.completata;

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const taskTesto = document.createElement("span");
    taskTesto.className = "task-testo";
    taskTesto.textContent = task.testo;
    taskInfo.appendChild(taskTesto);

    // Se la task ha l'orario (ora arriva correttamente dal DB!), creiamo l'elemento visuale
    if(task.scadenza) {
        const taskScadenza = document.createElement("span");
        taskScadenza.className = "task-scadenza";
        taskScadenza.dataset.orario = task.scadenza;
        taskScadenza.textContent = "Entro le " + task.scadenza; 
        taskInfo.appendChild(taskScadenza);
    }

    checkbox.onchange = async () => {
        try {
            await fetch(`https://my-happy-capybara.onrender.com/tasks/${task._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ completata: checkbox.checked })
            });
            aggiornaProgresso();
            aggiornaRitardi();
        } catch(err) {
            console.error("Errore aggiornamento:", err);
        }
    };

    label.appendChild(checkbox);
    label.appendChild(taskInfo);
    container.appendChild(label);
}

async function insertCheckBox() {
    const inputField = document.getElementById("input-checkbox");
    const ore = document.getElementById("input-ore").value;
    const minuti = document.getElementById("input-minuti").value;
    const taskText = inputField.value.trim();

    if (taskText === "") return;

    // Prepariamo i dati da inviare. Se l'orario è stato inserito, lo aggiungiamo, altrimenti no.
    const bodyData = { testo: taskText };
    if (ore !== "" && minuti !== "") {
        bodyData.scadenza = `${ore}:${minuti}`;
    }

    try {
        const res = await fetch("https://my-happy-capybara.onrender.com/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bodyData)
        });
        
        const task = await res.json();
        
        creaTaskDOM(task);
        inputField.value = "";
        document.getElementById("input-ore").value = "";
        document.getElementById("input-minuti").value = "";
        
        aggiornaProgresso();
        aggiornaRitardi();
    } catch(err) {
        console.error("Errore creazione:", err);
    }
}

async function removeCheckbox() {
    const checkedBoxes = document.querySelectorAll(".new-checkbox:checked");
    for (const box of checkedBoxes) {
        const label = box.parentElement;
        const taskId = label.dataset.taskId;
        try {
            await fetch(`https://my-happy-capybara.onrender.com/tasks/${taskId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            label.remove();
            aggiornaProgresso();
        } catch(err) {
            console.error("Errore eliminazione:", err);
        }
    }
}

document.getElementById("input-checkbox").addEventListener("keypress", (e) => {
    if (e.key === "Enter") insertCheckBox();
});