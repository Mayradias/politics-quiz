let perguntas = []
let votosDeputados = {}

let indicePergunta = 0
let totalPerguntas = 10

let respostasUsuario = {}

async function iniciarQuiz(qtd) {

    totalPerguntas = qtd

    document.getElementById("menu-quiz").style.display = "none"
    document.getElementById("header-inicial").style.display = "none"
    document.getElementById("quiz").style.display = "flex"

    perguntas = await fetch("data/8_perguntas.json").then(r => r.json())
    votosDeputados = await fetch("data/9_votos_deputados.json").then(r => r.json())

    perguntas = perguntas.slice(0, totalPerguntas)

    mostrarPergunta()

}


function mostrarPergunta() {

    document.getElementById("placar").style.display = "none"

    let p = perguntas[indicePergunta]

    document.getElementById("contador").innerText =
        `Pergunta ${indicePergunta + 1} de ${totalPerguntas}`

    let progresso = ((indicePergunta) / totalPerguntas) * 100
    document.getElementById("progresso").style.width = progresso + "%"

    document.getElementById("resumo").innerText = p.resumo

    let frases = p.contexto.split(". ")

    let html = ""

    frases.forEach(f => {

        if (f.trim() !== "") {

            html += `<p>${f.trim()}.</p>`

        }

    })

    document.getElementById("contexto").innerHTML = html

    let total = p.sim + p.nao

    let percSim = Math.round((p.sim / total) * 100)
    let percNao = Math.round((p.nao / total) * 100)

    document.getElementById("placar-sim").innerText =
        `A favor: ${percSim}%`

    document.getElementById("placar-nao").innerText =
        `Contra: ${percNao}%`

}


function responder(voto) {

    let p = perguntas[indicePergunta]

    respostasUsuario[p.votacao_id] = voto

    document.getElementById("placar").style.display = "block"

}


function proximaPergunta(){

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

    for (let dep in votosDeputados) {

        let votos = votosDeputados[dep]

        let iguais = 0
        let total = 0

        for (let votacao in respostasUsuario) {

            if (votos[votacao]) {

                total++

                if (votos[votacao] === respostasUsuario[votacao]) {

                    iguais++

                }

            }

        }

        if (total > 0) {

            let score = Math.round((iguais / total) * 100)

            ranking.push({
                nome: dep,
                score: score
            })

        }

    }

    ranking.sort((a, b) => b.score - a.score)

    let top = ranking.slice(0, 5)

    let lista = document.getElementById("ranking-deputados")

    lista.innerHTML = ""

    top.forEach(d => {

        let li = document.createElement("li")

        li.innerText = `${d.nome} — ${d.score}%`

        lista.appendChild(li)

    })

}


function reiniciarQuiz() {

    indicePergunta = 0
    respostasUsuario = {}

    document.getElementById("resultado").style.display = "none"
    document.getElementById("menu-quiz").style.display = "block"
    document.getElementById("header-inicial").style.display = "block"

}