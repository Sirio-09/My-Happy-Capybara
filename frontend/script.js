// --- CARICAMENTO DATI UTENTE ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Controlla se l'utente è loggato (se ha il token). Se no, lo caccia fuori.
    const token = localStorage.getItem("token");
    if(!token) {
        window.location.href = "login.html";
    }

    // 2. Scrive il nome utente in alto a destra
    const nomeSalvato = localStorage.getItem("nome");
    if (nomeSalvato) {
        document.getElementById("nome-utente").textContent = "Hello, " + nomeSalvato;
    } else {
        document.getElementById("nome-utente").textContent = "Ciao, Utente";
    }
});

// --- FUNZIONE DI LOGOUT ---
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    window.location.href = "login.html";
}

// --- FUNZIONAMENTO TO-DO LIST ---
function insertCheckBox() {
    const inputField = document.getElementById("input-checkbox");
    const taskText = inputField.value.trim();

    // Se l'input è vuoto non fa nulla
    if (taskText === "") return;

    const container = document.getElementById("div-checkbox");

    // Crea la label che contiene la checkbox e il testo
    const label = document.createElement("label");
    label.className = "new-label";

    // Crea l'input checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "new-checkbox";

    // Inserisce la checkbox e il testo dentro la label
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(taskText));

    // Aggiunge tutto al contenitore
    container.appendChild(label);

    // Svuota l'input
    inputField.value = "";
}

function removeCheckbox() {
    // Trova tutte le checkbox spuntate
    const checkedBoxes = document.querySelectorAll(".new-checkbox:checked");
    
    // Per ognuna, elimina il suo genitore (ovvero l'intera riga <label>)
    checkedBoxes.forEach(box => {
        box.parentElement.remove();
    });
}

// Permette di inserire premendo "Invio"
document.getElementById("input-checkbox").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        insertCheckBox();
    }
});