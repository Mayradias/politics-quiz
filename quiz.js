let perguntas = []
let votosDeputados = {}

let respostasUsuario = {}

let perguntaAtual = 0

async function carregarDados(){

    perguntas = await fetch("data/perguntas.json").then(r=>r.json())

    votosDeputados = await fetch("data/votos_deputados.json").then(r=>r.json())

    mostrarPergunta()

}

function mostrarPergunta(){

    if(perguntaAtual >= perguntas.length){

        calcularResultado()

        return
    }

    let p = perguntas[perguntaAtual]

    document.getElementById("pergunta").innerText = p.resumo

    document.getElementById("contexto").innerText = p.contexto

}

function responder(voto){

    let p = perguntas[perguntaAtual]

    respostasUsuario[p.id] = voto

    perguntaAtual++

    mostrarPergunta()

}

function calcularResultado(){

    let ranking = []

    for(let deputado in votosDeputados){

        let votos = votosDeputados[deputado].votos

        let iguais = 0
        let total = 0

        for(let id in respostasUsuario){

            if(votos[id]){

                total++

                if(votos[id] === respostasUsuario[id]){

                    iguais++

                }

            }

        }

        if(total > 0){

            let score = iguais / total

            ranking.push({
                deputado: deputado,
                score: score
            })

        }

    }

    ranking.sort((a,b)=>b.score-a.score)

    mostrarRanking(ranking)

}

function mostrarRanking(ranking){

    let html = "<h2>Políticos mais compatíveis</h2>"

    for(let i=0;i<5;i++){

        let r = ranking[i]

        html += `<p>${i+1}. ${r.deputado} — ${(r.score*100).toFixed(1)}%</p>`

    }

    document.getElementById("quiz").style.display="none"

    document.getElementById("resultado").innerHTML = html

}

carregarDados()