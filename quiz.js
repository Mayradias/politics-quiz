let perguntas = []
let votosDeputados = {}
let indicePergunta = 0
let totalPerguntas = 10
let respostasUsuario = {}
let tipoResumo = "objetivo"

async function iniciarQuiz(qtd) {
    totalPerguntas = qtd
    document.getElementById("menu-quiz").style.display = "none"
    document.getElementById("header-inicial").style.display = "none"
    document.getElementById("quiz").style.display = "flex"

    perguntas = await fetch("data/8_perguntas.json").then(r => r.json())
    votosDeputados = await fetch("data/9_votos_deputados.json").then(r => r.json())

    perguntas = embaralhar(perguntas)
    perguntas = perguntas.slice(0, totalPerguntas)
    mostrarPergunta()
}

function embaralhar(array) {
    return array.sort(() => Math.random() - 0.5)
}

function pegarIdPergunta(p) {
    return p.votacao_id || p.id || p.votacao
}

// Normalização robusta para evitar erros de comparação
function normalizar(v) {
    if (!v) return "";
    return v.toString()
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); 
}

function mostrarPergunta() {
    document.getElementById("placar").style.display = "none"
    document.querySelector(".voto-sim").onclick = () => responder("Sim")
    document.querySelector(".voto-nao").onclick = () => responder("Não")
    document.querySelector(".voto-abst").onclick = () => responder("Abstenção")

    document.querySelectorAll(".opcoes button").forEach(btn => btn.classList.remove("selecionado"))

    let p = perguntas[indicePergunta]
    document.getElementById("contador").innerText = `Pergunta ${indicePergunta + 1} de ${totalPerguntas}`
    
    let progresso = (indicePergunta / totalPerguntas) * 100
    document.getElementById("progresso").style.width = progresso + "%"

    document.getElementById("resumo").innerText = (tipoResumo === "objetivo") ? (p.resumo_objetivo || p.resumo) : (p.resumo_critico || p.resumo);

    let frases = p.contexto.split(". ")
    let html = ""
    frases.forEach(f => { if (f.trim() !== "") html += `<p>${f.trim()}.</p>` })
    document.getElementById("contexto").innerHTML = html

    let total = p.sim + p.nao + p.abst
    document.getElementById("placar-sim").innerText = `A favor: ${Math.round((p.sim/total)*100)}%`
    document.getElementById("placar-nao").innerText = `Contra: ${Math.round((p.nao/total)*100)}%`
    document.getElementById("placar-abst").innerText = `Abstenção: ${Math.round((p.abst/total)*100)}%`
}

function responder(voto) {
    let p = perguntas[indicePergunta]
    let id = pegarIdPergunta(p)
    respostasUsuario[id] = voto
    
    document.querySelectorAll(".opcoes button").forEach(btn => btn.onclick = null)
    if (voto === "Sim") document.querySelector(".voto-sim").classList.add("selecionado")
    if (voto === "Não") document.querySelector(".voto-nao").classList.add("selecionado")
    if (voto === "Abstenção") document.querySelector(".voto-abst").classList.add("selecionado")

    document.getElementById("placar").style.display = "block"
}

function proximaPergunta() {
    indicePergunta++
    if (indicePergunta >= totalPerguntas) {
        mostrarResultado()
    } else {
        mostrarPergunta()
    }
}

function mostrarResultado() {
    document.getElementById("quiz").style.display = "none"
    document.getElementById("resultado").style.display = "block"

    let ranking = []

    for (let nomeDep in votosDeputados) {
        let deputadoObj = votosDeputados[nomeDep]
        let listaVotos = deputadoObj.votos
        let iguais = 0
        let totalValido = 0

        for (let idVotacao in respostasUsuario) {
            let votoDoDeputado = listaVotos[idVotacao]
            let votoDoUsuario = respostasUsuario[idVotacao]

            if (votoDoDeputado) {
                let vDep = normalizar(votoDoDeputado)
                let vUser = normalizar(votoDoUsuario)

                // SÓ conta se o deputado votou algo reconhecível
                if (vDep === "sim" || vDep === "nao" || vDep === "abstencao") {
                    totalValido++
                    if (vDep === vUser) {
                        iguais++
                    }
                }
            }
        }

        if (totalValido > 0) {
            let score = Math.round((iguais / totalValido) * 100)
            ranking.push({
                nome: nomeDep,
                partido: deputadoObj.partido || "S/P",
                estado: deputadoObj.estado || "UF",
                score: score,
                total: totalValido
            })
        }
    }

    // Ordena por score e usa o total de votos como desempate
    ranking.sort((a, b) => b.score - a.score || b.total - a.total)

    let top = ranking.slice(0, 5)
    let lista = document.getElementById("ranking-deputados")
    lista.innerHTML = ""

    top.forEach(d => {
        let li = document.createElement("li")
        li.innerText = `${d.nome} (${d.partido}-${d.estado}) — ${d.score}%`
        lista.appendChild(li)
    })
    
    // LOG DE SEGURANÇA: Se continuar dando 100%, olhe isso no F12
    console.log("Amostra do Ranking:", ranking.slice(0, 3));
}

function reiniciarQuiz() {
    indicePergunta = 0
    respostasUsuario = {}
    document.getElementById("resultado").style.display = "none"
    document.getElementById("menu-quiz").style.display = "block"
    document.getElementById("header-inicial").style.display = "block"
}