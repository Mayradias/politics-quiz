let perguntas = []
let todasPerguntas = []
let votosDeputados = {}

let indicePergunta = 0
let totalPerguntas = 10

let respostasUsuario = {}

let tipoResumo = "critico"

// NOVO
let rankingCompletoDeputados = []
let rankingCompletoPartidos = []

function carregarResultadoURL(){

let params = new URLSearchParams(window.location.search)

let v = params.get("v")

if(!v) return

try{

respostasUsuario = JSON.parse(atob(v))

iniciarQuiz(Object.keys(respostasUsuario).length)

setTimeout(()=>{

mostrarResultado()

},500)

}catch(e){

console.log("Erro ao carregar resultado")

}

}

function renderRankingCompartilhado(d){

function gerarLista(lista){

let html=""

lista.forEach((x,i)=>{

html+=`
<li>
${i+1}. ${x.nome || x.partido}
${x.estado?`(${x.partido}-${x.estado})`:""}
 — ${x.score}%
</li>
`

})

return html

}

document.getElementById("ranking-deputados").innerHTML =
gerarLista(d.topDeputados)

document.getElementById("ranking-deputados-menores").innerHTML =
gerarLista(d.bottomDeputados)

document.getElementById("ranking-partidos").innerHTML =
gerarLista(d.topPartidos)

document.getElementById("ranking-partidos-menores").innerHTML =
gerarLista(d.bottomPartidos)

}


async function iniciarQuiz(qtd){

totalPerguntas = qtd

document.getElementById("menu-quiz").style.display="none"
document.getElementById("header-inicial").style.display="none"
document.getElementById("quiz").style.display="flex"

perguntas = await fetch("data/8_perguntas.json").then(r=>r.json())
todasPerguntas = await fetch("data/8_perguntas.json").then(r=>r.json())

perguntas = [...todasPerguntas]
votosDeputados = await fetch("data/9_votos_deputados.json").then(r=>r.json())

console.log("Perguntas carregadas:", perguntas.length)
console.log("Deputados carregados:", Object.keys(votosDeputados).length)

// pegar histórico de perguntas já usadas
let usadas = JSON.parse(localStorage.getItem("perguntasUsadas") || "[]")

// pegar top 30 perguntas mais divergentes
let topPerguntas = perguntas.slice(0,30)

// filtrar perguntas que ainda não foram usadas
let disponiveis = topPerguntas.filter(p => !usadas.includes(p.id))

// se acabaram as perguntas, resetar histórico
if(disponiveis.length < totalPerguntas){

localStorage.removeItem("perguntasUsadas")

usadas = []
disponiveis = topPerguntas

}

// embaralhar disponíveis
disponiveis = embaralhar(disponiveis)

// selecionar perguntas do quiz
perguntas = disponiveis.slice(0,totalPerguntas)

// salvar perguntas usadas
let novasUsadas = perguntas.map(p => p.id)

localStorage.setItem(
"perguntasUsadas",
JSON.stringify([...usadas, ...novasUsadas])
)

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

document.querySelectorAll(".tipo-resumo button").forEach(btn=>{
btn.classList.remove("ativo")
})

if(tipo==="objetivo"){
document.querySelectorAll(".tipo-resumo button")[0].classList.add("ativo")
}else{
document.querySelectorAll(".tipo-resumo button")[1].classList.add("ativo")
}

mostrarPergunta()

}



function mostrarPergunta(){

// destacar botão do tipo de resumo ativo
document.querySelectorAll(".tipo-resumo button").forEach(btn=>{
btn.classList.remove("ativo")
})

if(tipoResumo==="objetivo"){
document.querySelectorAll(".tipo-resumo button")[0].classList.add("ativo")
}else{
document.querySelectorAll(".tipo-resumo button")[1].classList.add("ativo")
}

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

document.getElementById("link-integra").href = p.url_integra

document.getElementById("votacao-id").innerText =
"ID: " + pegarIdPergunta(p)

document.getElementById("contador").innerText =
`Pergunta ${indicePergunta+1} de ${totalPerguntas}`

let progresso = (indicePergunta/totalPerguntas)*100
document.getElementById("progresso").style.width = progresso+"%"

let contexto

if(tipoResumo==="objetivo"){

document.getElementById("resumo").innerText =
p.resumo_objetivo

contexto = p.contexto_objetivo

}else{

document.getElementById("resumo").innerText =
p.resumo_critico

contexto = p.contexto_critico

}

let frases = contexto.split(". ")   

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
`A favor: ${percSim}% (${p.sim} deputados)`

document.getElementById("placar-nao").innerText =
`Contra: ${percNao}% (${p.nao} deputados)`

document.getElementById("placar-abst").innerText =
`Abstenção: ${percAbst}% (${p.abst} deputados)`
}



function responder(voto){

// limpar seleção anterior
document.querySelectorAll(".opcoes button").forEach(btn=>{
btn.classList.remove("selecionado")
})

// limpar destaque do placar
document.getElementById("placar-sim").classList.remove("placar-destaque")
document.getElementById("placar-nao").classList.remove("placar-destaque")
document.getElementById("placar-abst").classList.remove("placar-destaque")

let p = perguntas[indicePergunta]
let id = pegarIdPergunta(p)

respostasUsuario[id]=voto

console.log("Resposta registrada:", id, voto)

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



let bancadaPartidos={}

for(let dep in votosDeputados){

let partido=votosDeputados[dep].partido

if(!bancadaPartidos[partido]){
bancadaPartidos[partido]=0
}

bancadaPartidos[partido]++

}



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

rankingCompletoDeputados = ranking

let top=ranking.slice(0,5)

let rankingAsc=[...ranking].sort((a,b)=>a.score-b.score)

let bottom=rankingAsc.slice(0,5)



let lista=document.getElementById("ranking-deputados")
lista.innerHTML=""

top.forEach((d,i)=>{

let medalha=""

if(i===0) medalha="🥇"

let li=document.createElement("li")

if(i===0){
li.classList.add("primeiro-lugar")
}

li.innerHTML = `
${medalha} ${d.nome} (${d.partido}-${d.estado}) — ${d.score}%

<div class="barra-compat">
<div class="barra-compat-interna" style="width:${d.score}%"></div>
</div>

<span style="font-size:13px;color:#666;">
${d.iguais} de ${perguntasRespondidas} votações iguais
</span>
`

lista.appendChild(li)

})



let listaMenores=document.getElementById("ranking-deputados-menores")
listaMenores.innerHTML=""

bottom.forEach(d=>{

let li=document.createElement("li")

li.innerHTML = `
<span class="nome-deputado" onclick="mostrarProjetosDeputado('${d.nome}')">
${d.nome}
</span>
(${d.partido}-${d.estado}) — ${d.score}%

<div class="barra-compat">
<div class="barra-compat-interna" style="width:${d.score}%"></div>
</div>

<span style="font-size:13px;color:#666;">
${d.iguais} de ${perguntasRespondidas} votações iguais
</span>
`

listaMenores.appendChild(li)

})



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

rankingCompletoPartidos = rankingPartidos

let topPartidos=rankingPartidos.slice(0,5)

let rankingPartidosAsc=[...rankingPartidos].sort((a,b)=>a.score-b.score)

let bottomPartidos=rankingPartidosAsc.slice(0,5)



let listaPartidos=document.getElementById("ranking-partidos")
listaPartidos.innerHTML=""

topPartidos.forEach((p,i)=>{

let medalha=""

if(i===0) medalha="🥇"

let li=document.createElement("li")

if(i===0){
li.classList.add("primeiro-lugar")
}

li.innerHTML = `
${medalha} ${p.partido} — ${p.score}%

<div class="barra-compat">
<div class="barra-compat-interna" style="width:${p.score}%"></div>
</div>

<span style="font-size:13px;color:#666;">
${p.deputados} deputados comparados
</span>
`

listaPartidos.appendChild(li)

})



let listaPartidosMenores=document.getElementById("ranking-partidos-menores")
listaPartidosMenores.innerHTML=""

bottomPartidos.forEach(p=>{

let li=document.createElement("li")

li.innerHTML = `
${p.partido} — ${p.score}%

<div class="barra-compat">
<div class="barra-compat-interna" style="width:${p.score}%"></div>
</div>

<span style="font-size:13px;color:#666;">
${p.deputados} deputados comparados
</span>
`

listaPartidosMenores.appendChild(li)

})



document.getElementById("estatisticas-quiz").innerHTML =
`<b>📊 Estatísticas da análise</b><br><br>

Deputados analisados: ${deputadosAnalisados}<br>
Deputados com amostragem suficiente: ${deputadosValidos}<br><br>

Partidos analisados: ${partidosNoBanco}<br>
Partidos com amostragem suficiente: ${partidosValidos}`

}



function mostrarRankingCompletoPartidos(){

let div=document.getElementById("ranking-completo")

div.style.display="block"

let html="<h3>Ranking completo de partidos</h3>"

rankingCompletoPartidos.forEach((p,i)=>{

html+=`

<div class="item-ranking">

${i+1}. ${p.partido} — ${p.score}%

<div class="barra-compat">
<div class="barra-compat-interna" style="width:${p.score}%"></div>
</div>

<span style="font-size:13px;color:#666;">
${p.deputados} deputados comparados
</span>

</div>

`

})

div.innerHTML=html

}



function mostrarRankingCompletoDeputados(){

let div=document.getElementById("ranking-completo")

div.style.display="block"

let html="<h3>Ranking completo de deputados</h3>"

rankingCompletoDeputados.forEach((d,i)=>{

html+=`

<div class="item-ranking">

${i+1}. ${d.nome} (${d.partido}-${d.estado}) — ${d.score}%

<div class="barra-compat">
<div class="barra-compat-interna" style="width:${d.score}%"></div>
</div>

<span style="font-size:13px;color:#666;">
${d.iguais} votações iguais
</span>

</div>

`

})

div.innerHTML=html

}

function compartilharResultado(){

let encoded = btoa(JSON.stringify(respostasUsuario))

let url = window.location.origin + window.location.pathname + "?v=" + encoded

let texto = `Fiz um quiz com votações reais da Câmara.

Veja quais deputados votam como você:

${url}`

if(navigator.share){

navigator.share({
title:"Quiz político da Câmara",
text:texto,
url:url
})

}else{

navigator.clipboard.writeText(texto)
alert("Link copiado!")

}

}


function reiniciarQuiz(){

indicePergunta=0
respostasUsuario={}

document.getElementById("resultado").style.display="none"
document.getElementById("menu-quiz").style.display="block"
document.getElementById("header-inicial").style.display="block"

}

carregarResultadoURL()

function mostrarProjetosDeputado(nome){

let projetos = todasPerguntas.filter(p => p.autor === nome)

if(projetos.length === 0){

document.getElementById("projetos-deputado").innerHTML =
"<p>Nenhum projeto encontrado.</p>"

return

}

projetos.sort((a,b)=> new Date(b.data) - new Date(a.data))

projetos = projetos.slice(0,5)

let html = `<h3>Projetos de ${nome}</h3>`

projetos.forEach(p=>{

let resumo = p.resumo_objetivo

if(resumo.length > 140){
resumo = resumo.slice(0,140) + "..."
}

html += `

<div class="projeto-item">

<b>${p.tipo} ${p.numero}/${p.ano}</b> — ${resumo}

<br>

<a href="${p.url_integra}" target="_blank">
Ler íntegra
</a>

</div>

`

})

document.getElementById("projetos-deputado").innerHTML = html

document.getElementById("projetos-deputado").scrollIntoView({
behavior:"smooth"
})

}