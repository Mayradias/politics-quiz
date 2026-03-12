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

document.getElementById("votacao-id").innerText =
"ID: " + pegarIdPergunta(p)

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

document.getElementById("placar-sim").innerText =
`A favor: ${percSim}%`

document.getElementById("placar-nao").innerText =
`Contra: ${percNao}%`

document.getElementById("placar-abst").innerText =
`Abstenção: ${percAbst}%`

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

let deputadosAnalisados = 0
let deputadosValidos = 0

let perguntasRespondidas = Object.keys(respostasUsuario).length



// ============================
// TAMANHO DA BANCADA POR PARTIDO
// ============================

let bancadaPartidos={}

for(let dep in votosDeputados){

let partido=votosDeputados[dep].partido

if(!bancadaPartidos[partido]){
bancadaPartidos[partido]=0
}

bancadaPartidos[partido]++

}



// ============================
// CALCULAR COMPATIBILIDADE DEPUTADOS
// ============================

for(let dep in votosDeputados){

deputadosAnalisados++

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

deputadosValidos++

let score=Math.round((iguais/perguntasRespondidas)*100)

ranking.push({

nome:dep,
partido:deputado.partido,
estado:deputado.estado,
score:score,
iguais:iguais

})

}

}



ranking.sort((a,b)=>b.score-a.score)

let top=ranking.slice(0,5)

let rankingAsc=[...ranking].sort((a,b)=>a.score-b.score)

let bottom=rankingAsc.slice(0,5)



// ============================
// MOSTRAR DEPUTADOS
// ============================

let lista=document.getElementById("ranking-deputados")
lista.innerHTML=""

top.forEach(d=>{

let li=document.createElement("li")

li.innerHTML =
`${d.nome} (${d.partido}-${d.estado}) — ${d.score}%<br>
<span style="font-size:13px;color:#666;">
${d.iguais} de ${perguntasRespondidas} votações iguais
</span>`

lista.appendChild(li)

})



let listaMenores=document.getElementById("ranking-deputados-menores")
listaMenores.innerHTML=""

bottom.forEach(d=>{

let li=document.createElement("li")

li.innerHTML =
`${d.nome} (${d.partido}-${d.estado}) — ${d.score}%<br>
<span style="font-size:13px;color:#666;">
${d.iguais} de ${perguntasRespondidas} votações iguais
</span>`

listaMenores.appendChild(li)

})



// ============================
// CALCULAR PARTIDOS
// ============================

let partidos={}

ranking.forEach(d=>{

if(!partidos[d.partido]){
partidos[d.partido]={soma:0,total:0}
}

partidos[d.partido].soma+=d.score
partidos[d.partido].total++

})



let rankingPartidos=[]

let partidosNoBanco=Object.keys(bancadaPartidos).length
let partidosValidos=0



for(let p in partidos){

let comparados=partidos[p].total
let bancada=bancadaPartidos[p]

if(comparados / bancada >= 0.5){

partidosValidos++

let media=Math.round(partidos[p].soma/comparados)

rankingPartidos.push({

partido:p,
score:media,
deputados:comparados

})

}

}



rankingPartidos.sort((a,b)=>b.score-a.score)

let topPartidos=rankingPartidos.slice(0,5)

let rankingPartidosAsc=[...rankingPartidos].sort((a,b)=>a.score-b.score)

let bottomPartidos=rankingPartidosAsc.slice(0,5)



// ============================
// MOSTRAR PARTIDOS
// ============================

let listaPartidos=document.getElementById("ranking-partidos")
listaPartidos.innerHTML=""

topPartidos.forEach(p=>{

let li=document.createElement("li")

li.innerHTML=
`${p.partido} — ${p.score}%<br>
<span style="font-size:13px;color:#666;">
${p.deputados} deputados comparados
</span>`

listaPartidos.appendChild(li)

})



let listaPartidosMenores=document.getElementById("ranking-partidos-menores")
listaPartidosMenores.innerHTML=""

bottomPartidos.forEach(p=>{

let li=document.createElement("li")

li.innerHTML=
`${p.partido} — ${p.score}%<br>
<span style="font-size:13px;color:#666;">
${p.deputados} deputados comparados
</span>`

listaPartidosMenores.appendChild(li)

})



// ============================
// ESTATÍSTICAS
// ============================

document.getElementById("estatisticas-quiz").innerHTML =
`Deputados analisados: ${deputadosAnalisados}<br>
Deputados com amostragem suficiente: ${deputadosValidos}<br><br>
Partidos analisados: ${partidosNoBanco}<br>
Partidos com amostragem suficiente: ${partidosValidos}`

}



function reiniciarQuiz(){

indicePergunta=0
respostasUsuario={}

document.getElementById("resultado").style.display="none"
document.getElementById("menu-quiz").style.display="block"
document.getElementById("header-inicial").style.display="block"

}