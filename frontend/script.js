const token = localStorage.getItem("token");

if(!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const nomeSalvato = localStorage.getItem("nome");
    document.getElementById("nome-utente").textContent = nomeSalvato ? "Hello, " + nomeSalvato : "Hello, User";
    
    setupCustomSelects();
    caricaTasks();
    setInterval(aggiornaRitardi, 60000);
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    window.location.href = "login.html";
}

// Funzione per creare i numeri nei menu a tendina personalizzati
function setupCustomSelects() {
    const optionsOre = document.getElementById('options-ore');
    const optionsMinuti = document.getElementById('options-minuti');

    let htmlOre = '<li data-value="">--</li>';
    for (let i = 0; i < 24; i++) {
        let val = i.toString().padStart(2, '0');
        htmlOre += `<li data-value="${val}">${val}</li>`;
    }
    optionsOre.innerHTML = htmlOre;

    let htmlMinuti = '<li data-value="">--</li>';
    for (let i = 0; i <= 55; i += 5) {
        let val = i.toString().padStart(2, '0');
        htmlMinuti += `<li data-value="${val}">${val}</li>`;
    }
    optionsMinuti.innerHTML = htmlMinuti;

    document.querySelectorAll('.custom-select').forEach(customSelect => {
        const trigger = customSelect.querySelector('.select-trigger');
        const options = customSelect.querySelector('.select-options');

        trigger.addEventListener('click', (e) => {
            document.querySelectorAll('.custom-select').forEach(el => {
                if (el !== customSelect) el.classList.remove('open');
            });
            customSelect.classList.toggle('open');
            e.stopPropagation();
        });

        options.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const value = e.target.getAttribute('data-value');
                trigger.textContent = e.target.textContent;
                customSelect.dataset.value = value;
                customSelect.classList.remove('open');
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('open'));
    });
}

function aggiornaCapybara(percentuale) {
    const mouth = document.getElementById("capybara-mouth");
    const guanciaSx = document.getElementById("guancia-sx");
    const guanciaDx = document.getElementById("guancia-dx");

    if(percentuale === 0) {
        mouth.innerHTML = `<path d="M88 92 Q100 86 112 92" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        guanciaSx.setAttribute("opacity", "0");
        guanciaDx.setAttribute("opacity", "0");
    } else if(percentuale <= 50) {
        mouth.innerHTML = `<path d="M88 89 Q100 94 112 89" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        guanciaSx.setAttribute("opacity", "0.2");
        guanciaDx.setAttribute("opacity", "0.2");
    } else if(percentuale < 100) {
        mouth.innerHTML = `<path d="M84 87 Q100 98 116 87" stroke="#6B3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
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
        document.getElementById("div-checkbox").innerHTML = ""; // Pulisci prima di caricare
        tasks.forEach(task => creaTaskDOM(task));
        aggiornaProgresso();
        aggiornaRitardi();
    } catch(err) { console.error("Errore nel caricamento:", err); }
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
        } catch(err) { console.error("Errore aggiornamento:", err); }
    };

    label.appendChild(checkbox);
    label.appendChild(taskInfo);
    container.appendChild(label);
}

async function insertCheckBox() {
    const inputField = document.getElementById("input-checkbox");
    const ore = document.getElementById("custom-ore").dataset.value;
    const minuti = document.getElementById("custom-minuti").dataset.value;
    const taskText = inputField.value.trim();

    if (taskText === "") return;

    const bodyData = { testo: taskText };
    if (ore && minuti) {
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
        
        // Reset campi
        inputField.value = "";
        document.getElementById("custom-ore").dataset.value = "";
        document.querySelector("#custom-ore .select-trigger").textContent = "--";
        document.getElementById("custom-minuti").dataset.value = "";
        document.querySelector("#custom-minuti .select-trigger").textContent = "--";
        
        aggiornaProgresso();
        aggiornaRitardi();
    } catch(err) { console.error("Errore creazione:", err); }
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
        } catch(err) { console.error("Errore eliminazione:", err); }
    }
}

document.getElementById("input-checkbox").addEventListener("keypress", (e) => {
    if (e.key === "Enter") insertCheckBox();
});