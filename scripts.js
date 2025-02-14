// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    collection,
    where,
    onSnapshot,
    updateDoc,
    getDocs,
    getDoc,
    query
}
    from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

var categorias = []
var indexSelected = -1

const firebaseConfig = {
    apiKey: "AIzaSyDEyu-tPkfveVEEHopkK1hBquYiWCQ_UiM",
    authDomain: "eletiva-ba09f.firebaseapp.com",
    databaseURL: "https://eletiva-ba09f-default-rtdb.firebaseio.com",
    projectId: "eletiva-ba09f",
    storageBucket: "eletiva-ba09f.firebasestorage.app",
    messagingSenderId: "784050976450",
    appId: "1:784050976450:web:da8ef46ffee5670efc6d5b",
    measurementId: "G-7RR1TP5KLZ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveResponse() {
    const nome = document.querySelector("#name").value
    const turma = document.querySelector("#class").value

    if (nome != '' && turma != '') {
        const response = await fetch("https://docs.google.com/spreadsheets/d/1tAwhbI6ve-wG_pXwd21QAzbKinRAwVb7wyHwSN-rTmA/export?format=csv")
        const text = await response.text()
        const linhas = text.split("\n").map(linha => linha.split(","))
        const alunos = linhas.map(linha => linha[0].trim())

        if (!alunos.some(aluno => aluno == nome.toUpperCase())) {

            if (categorias[indexSelected]) {
                if (categorias[indexSelected].vagas > 0) {
                    const q = query(collection(db, "Categorias"), where("nome", "==", `${categorias[indexSelected].nome}`))
                    const itemReference = (await getDocs(q)).docs[0].ref
                    const vagasDisponiveis = (await getDoc(itemReference)).data().vagas
                    if (vagasDisponiveis > 0) {
                        await updateDoc(itemReference, { vagas: vagasDisponiveis - 1 })
                        await saveAsSheet(nome.toUpperCase(), turma.toUpperCase(), (categorias[indexSelected].nome).toUpperCase())

                        alert("Sua escolha foi salva com sucesso!")
                        location.reload()
                    } else {
                        alert("Não há mais vagas disponíveis para essa categoria.")
                    }

                } else {
                    alert("Não há mais vagas disponíveis para essa categoria.")
                }
            } else {
                alert("Categoria inexistente ou não selecionada.")
            }
        } else {
            alert("Esse aluno já fez a sua escolha.")
        }
    } else {
        alert("O nome do aluno e sua turma, devem ser preenchidos")
    }


}

function createButtons() {
    document.getElementById('options-container').innerHTML = ''

    categorias.map((item, index) => {
        const button = document.createElement('button')
        button.className = 'option-button'
        button.name = `${item.nome}`
        button.textContent = `${item.nome} (${item.vagas} vagas)`;
        button.onclick = () => {
            indexSelected = index
            const buttons = document.querySelectorAll(".option-button")
            buttons.forEach(b => b.style.backgroundColor = '#4CAF50')

            button.style.backgroundColor = "blue"
        }

        document.getElementById('options-container').appendChild(button);
    })
}

function onLoad() {
    const unsub = onSnapshot(collection(db, "Categorias"), (docs) => {
        categorias = []
        docs.docs.map(doc => {
            categorias.push(doc.data())
        })
        createButtons()
    })
}

function showRegistered() {
    window.open("https://docs.google.com/spreadsheets/d/1tAwhbI6ve-wG_pXwd21QAzbKinRAwVb7wyHwSN-rTmA/edit")
}

async function saveAsSheet(nome, turma, eletiva) {
    await fetch("https://api.sheetmonkey.io/form/roeY6zxgWtAG5mGDESiYU9", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Nome: nome,
            Turma: turma,
            Eletiva: eletiva
        })
    })

}

async function resetCategories() {
    alert("Aguarde enquanto as vagas são redefinidas.")
    const queryDocs = await getDocs(collection(db, "Categorias"))
    queryDocs.docs.map(async (doc) => {
        await updateDoc(doc.ref, { vagas: 35 })
    })
    alert("Vagas redefinidas com sucesso!")
    
}

document.querySelector(".confirm-button").addEventListener("click", () => {
    saveResponse()
})

document.querySelector(".view-registrations-button").addEventListener("click", () => {
    showRegistered()
})
document.querySelector(".clear-button").addEventListener("click", () => {
    resetCategories()
})

onLoad()