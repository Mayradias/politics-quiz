let perguntas = []
let votosDeputados = {}

let indicePergunta = 0
let totalPerguntas = 10

let respostasUsuario = {}

let tipoResumo = "objetivo"



async function iniciarQuiz(qtd){

totalPerguntas = qtd

document.getElementById("menu-quiz").style.display="none"
document.getElementById("header-inicial").style.display="none"
document.getElementById("quiz").style.display="flex"

perguntas = await fetch("data/8_perguntas.json").then(r=>r.json())
votosDeputados = await fetch("data/9_votos_deputados.json").then(r=>r.json())

perguntas = perguntas.sort(()=>Math.random()-0.5)

perguntas = perguntas.slice(0,totalPerguntas)

mostrarPergunta()

}



function pegarIdPergunta(p){

return p.votacao_id || p.id || p.votacao

}



function mudarResumo(tipo){

tipoResumo = tipo
mostrarPergunta()

}



function mostrarPergunta(){

document.getElementById("placar").style.display="none"

document.querySelectorAll(".opcoes button").forEach(btn=>{
btn.classList.remove("selecionado")
})

document.getElementById("placar-sim").classList.remove("placar-destaque")
document.getElementById("placar-nao").classList.remove("placar-destaque")
document.getElementById("placar-abst").classList.remove("placar-destaque")

let p = perguntas[indicePergunta]

document.getElementById("contador").innerText =
`Pergunta ${indicePergunta+1} de ${totalPerguntas}`

let progresso = (indicePergunta/totalPerguntas)*100
document.getElementById("progresso").style.width = progresso+"%"



if(tipoResumo==="objetivo"){
document.getElementById("resumo").innerText = p.resumo_objetivo || p.resumo
}else{
document.getElementById("resumo").innerText = p.resumo_critico || p.resumo
}



let frases = p.contexto.split(". ")
let html=""

frases.forEach(f=>{
if(f.trim()!==""){
html += `<p>${f.trim()}.</p>`
}
})

document.getElementById("contexto").innerHTML = html



let total = p.sim + p.nao + p.abst

let percSim = Math.round((p.sim/total)*100)
let percNao = Math.round((p.nao/total)*100)
let percAbst = Math.round((p.abst/total)*100)

document.getElementById("placar-sim").innerText = `A favor: ${percSim}%`
document.getElementById("placar-nao").innerText = `Contra: ${percNao}%`
document.getElementById("placar-abst").innerText = `Abstenção: ${percAbst}%`

}



function responder(voto){

let p = perguntas[indicePergunta]
let id = pegarIdPergunta(p)

respostasUsuario[id]=voto

document.querySelectorAll(".opcoes button").forEach(btn=>{
btn.onclick=null
})

if(voto==="Sim"){
document.getElementById("btn-sim").classList.add("selecionado")
document.getElementById("placar-sim").classList.add("placar-destaque")
}

if(voto==="Não"){
document.getElementById("btn-nao").classList.add("selecionado")
document.getElementById("placar-nao").classList.add("placar-destaque")
}

if(voto==="Abstenção"){
document.getElementById("btn-abst").classList.add("selecionado")
document.getElementById("placar-abst").classList.add("placar-destaque")
}

document.getElementById("placar").style.display="block"

}



function proximaPergunta(){

indicePergunta++

if(indicePergunta>=totalPerguntas){
mostrarResultado()
}else{
mostrarPergunta()
}

}



function mostrarResultado(){

document.getElementById("quiz").style.display="none"
document.getElementById("resultado").style.display="block"

let rankingDeputados=[]
let partidos={}

for(let dep in votosDeputados){

let deputado=votosDeputados[dep]
let votos=deputado.votos

let iguais=0
let total=0

for(let votacao in respostasUsuario){

if(votos[votacao]){

total++

if(votos[votacao]===respostasUsuario[votacao]){
iguais++
}

}

}

if(total>0){

let score=Math.round((iguais/total)*100)

rankingDeputados.push({
nome:dep,
partido:deputado.partido,
estado:deputado.estado,
score:score
})

if(!partidos[deputado.partido]){
partidos[deputado.partido]=[]
}

partidos[deputado.partido].push(score)

}

}



rankingDeputados.sort((a,b)=>b.score-a.score)

let rankingDeputadosMenos=[...rankingDeputados].reverse()

let rankingPartidos=[]

for(let p in partidos){

let media=Math.round(
partidos[p].reduce((a,b)=>a+b,0)/partidos[p].length
)

rankingPartidos.push({
partido:p,
score:media
})

}

rankingPartidos.sort((a,b)=>b.score-a.score)

let rankingPartidosMenos=[...rankingPartidos].reverse()



preencherLista("ranking-deputados-mais",rankingDeputados.slice(0,5),true)
preencherLista("ranking-deputados-menos",rankingDeputadosMenos.slice(0,5),true)

preencherLista("ranking-partidos-mais",rankingPartidos.slice(0,5),false)
preencherLista("ranking-partidos-menos",rankingPartidosMenos.slice(0,5),false)

}



function preencherLista(id,lista,deputado){

let el=document.getElementById(id)
el.innerHTML=""

lista.forEach(i=>{

let li=document.createElement("li")

if(deputado){
li.innerText=`${i.nome} (${i.partido}-${i.estado}) — ${i.score}%`
}else{
li.innerText=`${i.partido} — ${i.score}%`
}

el.appendChild(li)

})

}



function reiniciarQuiz(){

indicePergunta=0
respostasUsuario={}

document.getElementById("resultado").style.display="none"
document.getElementById("menu-quiz").style.display="block"
document.getElementById("header-inicial").style.display="block"

}