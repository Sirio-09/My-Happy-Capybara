const token = localStorage.getItem("token");
console.log("Token salvato:", token);
console.log("Nome salvato:", localStorage.getItem("nome"));
 
if(!token) {
    window.location.href = "login.html";
}
 
document.addEventListener("DOMContentLoaded", () => {
    const nomeSalvato = localStorage.getItem("nome");
    if (nomeSalvato) {
        document.getElementById("nome-utente").textContent = "Hello, " + nomeSalvato;
    } else {
        document.getElementById("nome-utente").textContent = "Ciao, Utente";
    }
 
    caricaTasks();
});
 
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    window.location.href = "login.html";
}
 
async function caricaTasks(){
    console.log("Sto caricando le task con token:", token);
    try {
        const res = await fetch("https://my-happy-capybara.onrender.com/tasks", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
 
        console.log("Risposta dal server - Status:", res.status);
        const tasks = await res.json();
        console.log("Task ricevute:", tasks);
        
        tasks.forEach(task => {
            creaTaskDOM(task);
        });
    } catch(err) {
        console.error("Errore nel caricamento delle task:", err);
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
    checkbox.name = "checkbox-div";
 
    checkbox.onchange = async () => {
        console.log("Checkbox cambiata, invio aggiornamento...");
        try {
            const res = await fetch(`https://my-happy-capybara.onrender.com/tasks/${task._id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ completata: checkbox.checked })
            });
 
            console.log("Risposta aggiornamento - Status:", res.status);
            const risposta = await res.json();
            console.log("Task aggiornata:", risposta);
 
        } catch(err) {
            console.error("Errore nell'aggiornamento della task:", err);
        }
    };
 
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(task.testo));
    label.name = "label-div";
 
    container.appendChild(label);
}
 
async function insertCheckBox() {
    const inputField = document.getElementById("input-checkbox");
    const taskText = inputField.value.trim();
 
    if (taskText === "") return;
 
    try {
        const res = await fetch("https://my-happy-capybara.onrender.com/tasks", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ testo: taskText })
        });
 
        const task = await res.json();
        creaTaskDOM(task);
        inputField.value = "";
 
    } catch(err) {
        console.error("Errore nel creazione della task:", err);
    }
}
 
async function removeCheckbox() {
    const checkedBoxes = document.querySelectorAll(".new-checkbox:checked");
    
    checkedBoxes.forEach(async (box) => {
        const label = box.parentElement;
        const taskId = label.dataset.taskId;
        
        try {
            await fetch(`https://my-happy-capybara.onrender.com/tasks/${taskId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            label.remove();
        } catch(err) {
            console.error("Errore nell'eliminazione della task:", err);
        }
    });
}
 
document.getElementById("input-checkbox").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        insertCheckBox();
    }
});