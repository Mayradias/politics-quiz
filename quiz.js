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

console.log("Perguntas carregadas:", perguntas.length)
console.log("Deputados carregados:", Object.keys(votosDeputados).length)

perguntas = embaralhar(perguntas)

perguntas = perguntas.slice(0,totalPerguntas)

mostrarPergunta()

}



function embaralhar(array){
return array.sort(()=>Math.random()-0.5)
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

document.querySelector(".voto-sim").onclick = ()=>responder("Sim")
document.querySelector(".voto-nao").onclick = ()=>responder("Não")
document.querySelector(".voto-abst").onclick = ()=>responder("Abstenção")

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

console.log("Resposta registrada:", id, voto)

document.querySelectorAll(".opcoes button").forEach(btn=>{
btn.onclick = null
})

if(voto==="Sim"){
document.querySelector(".voto-sim").classList.add("selecionado")
document.getElementById("placar-sim").classList.add("placar-destaque")
}

if(voto==="Não"){
document.querySelector(".voto-nao").classList.add("selecionado")
document.getElementById("placar-nao").classList.add("placar-destaque")
}

if(voto==="Abstenção"){
document.querySelector(".voto-abst").classList.add("selecionado")
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

let ranking=[]

let perguntasRespondidas = Object.keys(respostasUsuario).length

for(let dep in votosDeputados){

let deputado=votosDeputados[dep]
let votos=deputado.votos

let iguais=0
let total=0

for(let votacao in respostasUsuario){

let votoDeputado = votos[votacao]

if(
votoDeputado==="Sim" ||
votoDeputado==="Não" ||
votoDeputado==="Abstenção"
){

total++

if(votoDeputado===respostasUsuario[votacao]){
iguais++
}

}

}

if(total / perguntasRespondidas >= 0.8){

let score=Math.round((iguais/perguntasRespondidas)*100)

ranking.push({

nome:dep,
partido:deputado.partido,
estado:deputado.estado,
score:score

})

}

}

ranking.sort((a,b)=>b.score-a.score)

let top=ranking.slice(0,5)

let lista=document.getElementById("ranking-deputados")

lista.innerHTML=""

if(top.length===0){

lista.innerHTML="<li>Nenhum deputado teve votos comparáveis suficientes.</li>"
return

}

top.forEach(d=>{

let li=document.createElement("li")

li.innerText = `${d.nome} (${d.partido}-${d.estado}) — ${d.score}%`

lista.appendChild(li)

})

}

}

console.log(dep,"→ comparações:",total,"iguais:",iguais)

if(total >= minimoComparacoes){

console.log("✔ PASSOU NO FILTRO")

let score=Math.round((iguais/total)*100)

ranking.push({
nome:dep,
partido:deputado.partido,
estado:deputado.estado,
score:score
})

}else{

console.log("✖ REPROVADO NO FILTRO")

}

}



ranking.sort((a,b)=>b.score-a.score)

let top=ranking.slice(0,5)

let lista=document.getElementById("ranking-deputados")
lista.innerHTML=""

if(top.length===0){
lista.innerHTML="<li>Nenhum deputado teve votos comparáveis suficientes.</li>"
return
}

top.forEach(d=>{
let li=document.createElement("li")
li.innerText = `${d.nome} (${d.partido}-${d.estado}) — ${d.score}%`
lista.appendChild(li)
})

}



function reiniciarQuiz(){

indicePergunta=0
respostasUsuario={}

document.getElementById("resultado").style.display="none"
document.getElementById("menu-quiz").style.display="block"
document.getElementById("header-inicial").style.display="block"

}