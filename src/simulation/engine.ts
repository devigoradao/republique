import {decisions} from './decisions.ts';
import {metricKeys,type Metrics,type Effect,type Game,type Profile} from './types.ts';
export const labels:Record<keyof Metrics,string>={gdp:'PIB',debt:'Dívida / PIB',inflation:'Inflação',employment:'Emprego',education:'Educação',health:'Saúde',environment:'Meio ambiente',approval:'Aprovação',inequality:'Desigualdade',capacity:'Capacidade do Estado'};
export const countries:Record<string,Partial<Metrics>>={'Brasil':{debt:74,inequality:58,environment:64},'Argentina':{debt:86,inflation:14,employment:61},'Portugal':{debt:85,health:73,education:75,inequality:35},'Chile':{debt:42,employment:68,inequality:49},'País fictício':{}};
const base:Metrics={gdp:100,debt:65,inflation:5,employment:65,education:58,health:60,environment:58,approval:55,inequality:48,capacity:62};
export function createGame(profile:Profile):Game{
 if(!profile.name.trim()||!Object.hasOwn(countries,profile.country))throw new Error('Perfil inválido');
 const metrics={...base,...countries[profile.country]};
 return {version:1,profile:{...profile,name:profile.name.trim().slice(0,50)},turn:0,term:1,metrics,initial:{...metrics},pending:[],history:[],snapshots:[{...metrics}],phase:'playing',vote:null,reelected:false,seed:42};
}
function apply(m:Metrics,e:Effect):Metrics{const n={...m};for(const k of metricKeys){n[k]=Math.round(Math.max(k==='gdp'?30:0,Math.min(k==='gdp'?400:k==='debt'?180:k==='inflation'?40:100,n[k]+(e[k]??0)))*10)/10;}return n;}
export function electionScore(g:Game){return Math.round(Math.max(10,Math.min(90,g.metrics.approval*.55+g.metrics.employment*.2+(100-g.metrics.inequality)*.15+g.metrics.health*.1-(Math.max(0,g.metrics.inflation-6)*.7))));}
export function choose(g:Game,index:number):Game{
 if(g.phase!=='playing')throw new Error('Rodada encerrada');
 const d=decisions[g.turn%24],option=d.options[index];if(!option)throw new Error('Opção inválida');
 const n:Game=structuredClone(g);const next=g.turn+1;
 n.metrics=apply(n.metrics,option.now);
 n.history.push({turn:next,title:d.title,text:`${option.title}. ${option.description}`,kind:'decision',delta:option.now});
 // Execution capacity affects benefits, but does not erase costs or adverse effects.
 const multiplier=.55+g.metrics.capacity/125;
 const delayed:Effect={};for(const key of metricKeys){const value=option.later[key];if(value!==undefined){const benefit=key==='debt'||key==='inflation'||key==='inequality'?value<0:value>0;delayed[key]=value*(benefit?multiplier:1);}}
 n.pending.push({due:g.turn+option.delay,effect:delayed,source:option.title,mechanism:option.mechanism});
 for(const p of n.pending.filter(p=>p.due<=next)){n.metrics=apply(n.metrics,p.effect);n.history.push({turn:next,title:`Efeito de: ${p.source}`,text:p.mechanism,kind:'effect',delta:p.effect});}
 n.pending=n.pending.filter(p=>p.due>next);
 const event=(title:string,text:string,delta:Effect)=>{n.metrics=apply(n.metrics,delta);n.history.push({turn:next,title,text,kind:'event',delta});};
 if(option.tag==='skills'){const educated=g.metrics.education>=65;event(educated?'Qualificação destrava novos investimentos':'Empresas encontram falta de qualificação',educated?'As políticas de formação reforçam o retorno desta decisão.':'O estoque de qualificação ainda limita a produtividade.',educated?{gdp:1.5,employment:1}:{gdp:-1});}
 if(option.tag==='work'&&g.metrics.education<55)event('Transição exige mais formação','Baixa qualificação dificulta a reorganização das empresas.',{employment:-1});
 if(next%6===4)event('Comércio global perde ritmo','Choque externo simulado: exportações desaceleram.',{gdp:-1.5,employment:-.5});
 if(next%12===8){const resilient=n.metrics.environment>=65;event(resilient?'Prevenção limita perdas com chuvas':'Chuvas intensas atingem a produção',resilient?'A proteção ambiental reduz o impacto do evento climático.':'A vulnerabilidade ambiental amplia prejuízos e internações.',resilient?{gdp:-.5}:{gdp:-2,health:-2,debt:1});}
 if(n.metrics.debt>90&&next%3===0)event('Financiamento fica mais caro','Dívida elevada aumenta o custo do crédito e limita investimentos.',{debt:1,inflation:.4,gdp:-.6});
 if(n.metrics.health<45&&next%4===0)event('Afastamentos pressionam a economia','A saúde fragilizada reduz a participação no trabalho.',{employment:-1.5,gdp:-1});
 // A bimonthly macro feedback, rather than an ideological score.
 n.metrics=apply(n.metrics,{gdp:(n.metrics.employment-65)*.015+(n.metrics.education-58)*.012-n.metrics.inflation*.02,debt:(n.metrics.debt>80?.3:0),approval:(n.metrics.health-60)*.015+(48-n.metrics.inequality)*.02-Math.max(0,n.metrics.inflation-6)*.08});
 n.turn=next;n.snapshots.push({...n.metrics});
 if(next===24){n.phase='election';n.vote=electionScore(n);}else if(next===48){n.phase='finished';n.vote=electionScore(n);}
 return n;
}
export function finishElection(g:Game,runAgain:boolean):Game{if(g.phase!=='election')throw new Error('Eleição indisponível');const n=structuredClone(g);if(runAgain&&(n.vote??0)>=50){n.phase='playing';n.term=2;n.reelected=true;}else n.phase='finished';return n;}
export function achievements(g:Game):string[]{const a:string[]=[];if(g.metrics.health>=78&&g.metrics.education>=78)a.push('Reconhecimento internacional por desenvolvimento humano (fictício)');if(g.metrics.debt<g.initial.debt-15)a.push('Dívida pública reduzida em mais de 15 pontos');if(g.metrics.environment>=80)a.push('Referência em resiliência ambiental');if(g.metrics.inequality<g.initial.inequality-10)a.push('Desigualdade reduzida em mais de 10 pontos');if(g.metrics.gdp>=125)a.push('Economia cresceu mais de 25%');return a;}
export function isGame(value:unknown):value is Game{
 if(!value||typeof value!=='object')return false;const g=value as Game;
 const validMetrics=(m:Metrics)=>!!m&&metricKeys.every(k=>Number.isFinite(m[k])&&m[k]>=(k==='gdp'?30:0)&&m[k]<=(k==='gdp'?400:k==='debt'?180:k==='inflation'?40:100));
 const validEffect=(e:Effect)=>!!e&&typeof e==='object'&&!Array.isArray(e)&&Object.entries(e).every(([k,v])=>metricKeys.includes(k as keyof Metrics)&&Number.isFinite(v));
 const validPhase=g.phase==='playing'?(g.turn<24&&g.term===1)||(g.turn>=24&&g.turn<48&&g.term===2&&g.reelected):g.phase==='election'?g.turn===24&&g.term===1:g.phase==='finished'?(g.turn===24&&g.term===1)||(g.turn===48&&g.term===2&&g.reelected):false;
 return g.version===1&&Number.isInteger(g.turn)&&g.turn>=0&&g.turn<=48&&(g.term===1||g.term===2)&&!!g.profile&&typeof g.profile.name==='string'&&!!g.profile.name.trim()&&typeof g.profile.country==='string'&&Object.hasOwn(countries,g.profile.country)&&['Esquerda','Centro','Direita'].includes(g.profile.orientation)&&validMetrics(g.metrics)&&validMetrics(g.initial)&&Array.isArray(g.pending)&&g.pending.every(p=>p&&Number.isInteger(p.due)&&p.due>g.turn&&typeof p.source==='string'&&typeof p.mechanism==='string'&&validEffect(p.effect))&&Array.isArray(g.history)&&g.history.every(h=>h&&typeof h.title==='string'&&typeof h.text==='string'&&['decision','effect','event'].includes(h.kind)&&validEffect(h.delta)&&Number.isInteger(h.turn)&&h.turn>=1&&h.turn<=g.turn)&&Array.isArray(g.snapshots)&&g.snapshots.length===g.turn+1&&g.snapshots.every(validMetrics)&&(g.vote===null||Number.isFinite(g.vote)&&g.vote>=10&&g.vote<=90)&&typeof g.reelected==='boolean'&&Number.isFinite(g.seed)&&validPhase&&(g.phase==='playing'||g.vote!==null);
}
