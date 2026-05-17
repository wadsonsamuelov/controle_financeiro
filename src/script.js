/* ==========================================================
   FinTrack — application logic
   Gerado a partir de fintrack_v6.html
   Dependências externas: Chart.js (carregado via CDN no HTML)
   ========================================================== */
/* ══════════════════════════════
   STATE
══════════════════════════════ */
let dark=false, slim=false, activePage='home', activeFilter='todos';
let editTxId=null, editGoalId=null, editCalId=null;
let selType_='', selEvT_='', confCb=null, nextId=400;
let calY=2025, calM=3;

const MN=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const GREETINGS=[
  'Bem-vindo de volta, <strong>Sr. Wayne</strong>.','De volta aos negócios, <strong>Bruce</strong>.','Seu patrimônio está seguro aqui.','Controle total. Decisões mais inteligentes.','Pronto para organizar suas finanças?','Cada real bem gerenciado faz diferença.',
];

let TX=[
  {id:1,desc:'Salário mensal',val:6500,tipo:'receita',met:'ted',cat:'salário',data:'2025-04-01'},
  {id:2,desc:'Aluguel',val:1800,tipo:'despesa',met:'boleto',cat:'moradia',data:'2025-04-02'},
  {id:3,desc:'Supermercado',val:342.9,tipo:'despesa',met:'cartao',cat:'alimentação',data:'2025-04-03'},
  {id:4,desc:'Freelance — Web App',val:2400,tipo:'receita',met:'pix',cat:'freelance',data:'2025-04-05'},
  {id:5,desc:'Farmácia',val:178.5,tipo:'despesa',met:'cartao',cat:'saúde',data:'2025-04-07'},
  {id:6,desc:'Streaming + Apps',val:89.9,tipo:'despesa',met:'cartao',cat:'assinaturas',data:'2025-04-08'},
  {id:7,desc:'Transferência recebida',val:500,tipo:'receita',met:'pix',cat:'geral',data:'2025-04-09'},
  {id:8,desc:'Combustível',val:220,tipo:'despesa',met:'dinheiro',cat:'transporte',data:'2025-04-10'},
];
let GOALS=[
  {id:1,emoji:'🏠',nome:'Reserva de emergência',alvo:20000,atual:12000},
  {id:2,emoji:'✈️',nome:'Viagem — Europa',alvo:15000,atual:4500},
  {id:3,emoji:'💻',nome:'Notebook novo',alvo:6000,atual:5400},
  {id:4,emoji:'🚗',nome:'Carro próprio',alvo:45000,atual:8000},
];
let CEVS=[
  {id:1,tipo:'salario',titulo:'Salário',data:'2025-04-01',val:6500,obs:''},
  {id:2,tipo:'fixo',titulo:'Aluguel',data:'2025-04-05',val:1800,obs:'Vence dia 5'},
  {id:3,tipo:'recorrente',titulo:'Cartão de crédito',data:'2025-04-10',val:850,obs:''},
  {id:4,tipo:'vencimento',titulo:'IPVA',data:'2025-04-15',val:620,obs:'Parcela 2/3'},
  {id:5,tipo:'fixo',titulo:'Internet',data:'2025-04-20',val:130,obs:''},
  {id:6,tipo:'extra',titulo:'13º salário',data:'2025-04-25',val:3250,obs:'Antecipação'},
];
const STORAGE_KEYS = {
  tx: 'fintrack_tx',
  goals: 'fintrack_goals',
  cevs: 'fintrack_cevs',
  dark: 'fintrack_dark',
  slim: 'fintrack_slim'
};

function saveData() {
  localStorage.setItem(STORAGE_KEYS.tx, JSON.stringify(TX));
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(GOALS));
  localStorage.setItem(STORAGE_KEYS.cevs, JSON.stringify(CEVS));
  localStorage.setItem(STORAGE_KEYS.dark, JSON.stringify(dark));
  localStorage.setItem(STORAGE_KEYS.slim, JSON.stringify(slim));
}

function loadData() {
  try {
    const tx = localStorage.getItem(STORAGE_KEYS.tx);
    const goals = localStorage.getItem(STORAGE_KEYS.goals);
    const cevs = localStorage.getItem(STORAGE_KEYS.cevs);
    const darkSaved = localStorage.getItem(STORAGE_KEYS.dark);
    const slimSaved = localStorage.getItem(STORAGE_KEYS.slim);

    if (tx) TX = JSON.parse(tx);
    if (goals) GOALS = JSON.parse(goals);
    if (cevs) CEVS = JSON.parse(cevs);
    if (darkSaved !== null) dark = JSON.parse(darkSaved);
    if (slimSaved !== null) slim = JSON.parse(slimSaved);
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
  }
}

function applySavedUIState() {
  document.getElementById('shell')?.classList.toggle('dark', dark);
  document.body.classList.toggle('dark', dark);
  document.getElementById('sidebar')?.classList.toggle('slim', slim);

  const darkToggle = document.getElementById('set-dark-tog');
  if (darkToggle) darkToggle.classList.toggle('on', dark);
}

/* ══ UTILS ══ */
const R=v=>'R$\u00a0'+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const Cap=s=>s?s[0].toUpperCase()+s.slice(1):'';
const ML={pix:'Pix',cartao:'Cartão crédito',debito:'Cartão débito',dinheiro:'Dinheiro',boleto:'Boleto',ted:'TED/DOC'};
const MB={pix:'b-g',cartao:'b-b',debito:'b-b',dinheiro:'b-a',boleto:'b-n',ted:'b-n'};
const EVC={salario:'var(--g-str)',extra:'var(--b-str)',fixo:'var(--r-str)',recorrente:'var(--a-5)',vencimento:'var(--b-7)',outro:'var(--tx-3)'};
const EVL={salario:'Salário',extra:'Extra',fixo:'Gasto Fixo',recorrente:'Recorrente',vencimento:'Vencimento',outro:'Outro'};
const CC=['#16a34a','#2563ab','#0891b2','#7c3aed','#b45309','#dc2626','#db2777','#0d9488','#65a30d','#4338ca'];

function totals(){
  const rec=TX.filter(t=>t.tipo==='receita').reduce((a,t)=>a+t.val,0);
  const dep=TX.filter(t=>t.tipo==='despesa').reduce((a,t)=>a+t.val,0);
  return{rec,dep,sal:rec-dep};
}

/* ══ PAGE NAV ══ */
const PM={
  home:{t:'Home',s:'Bem-vindo de volta, Sr. Wayne'},
  dashboard:{t:'Dashboard',s:'Visão geral · Abril 2025'},
  transacoes:{t:'Transações',s:'Gerencie suas movimentações'},
  projetos:{t:'Projetos & Metas',s:'Seus objetivos financeiros'},
  calendario:{t:'Calendário Financeiro',s:'Eventos e datas importantes'},
  distribuicao:{t:'Distribuição',s:'Análise de gastos por categoria'},
  cambio:{t:'Câmbio ao Vivo',s:'Cotações em tempo real · AwesomeAPI'},
};
function goto(page,el){
  activePage=page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const pg=document.getElementById('pg-'+page);
  if(pg) pg.classList.add('active');
  if(el) el.classList.add('active');
  else document.querySelectorAll('.nav-item').forEach(n=>{
    if((n.getAttribute('onclick')||'').includes("'"+page+"'")) n.classList.add('active');
  });
  const m=PM[page]||{t:Cap(page),s:''};
  document.getElementById('pg-title').textContent=m.t;
  document.getElementById('pg-sub').textContent=m.s;
  if(page==='distribuicao') renderDist();
  if(page==='projetos') renderGoals();
  if(page==='calendario') renderCal();
  if(page==='transacoes'){renderStrip();renderTxList();}
  if(page==='home') renderHome();
  if(page==='cambio') cambioLoad();
  return false;
}

/* ══ SIDEBAR ══ */
function toggleSlim(){
  slim = !slim;
  document.getElementById('sidebar').classList.toggle('slim', slim);
  saveData();
}

/* ══ DARK ══ */
function toggleDark(){
  dark = !dark;
  document.getElementById('shell').classList.toggle('dark', dark);
  document.body.classList.toggle('dark', dark);
  const t = document.getElementById('set-dark-tog');
  if (t) t.classList.toggle('on', dark);
  saveData();
  setTimeout(rebuildMonthlyChart, 60);
}
function toggleDarkFromSet(){toggleDark()}

/* ══ TOAST ══ */
const TICK=`<path d="M2 7l3.5 3.5 6.5-7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
const BIN=`<path d="M2 4h10M4.5 4V2.5h5V4M5 6.5v5M9 6.5v5M3 4l.8 8.5h6.4L11 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
let toastT;
function toast(msg,type='ok'){
  clearTimeout(toastT);
  document.getElementById('t-msg').textContent=msg;
  document.getElementById('t-ico').innerHTML=type==='trash'?BIN:TICK;
  const el=document.getElementById('toast');
  el.classList.add('show');
  toastT=setTimeout(()=>el.classList.remove('show'),3000);
}

/* ══ CONFIRM ══ */
function conf_(t,m,cb){
  document.getElementById('conf-title').textContent=t;
  document.getElementById('conf-msg').textContent=m;
  confCb=cb;
  document.getElementById('ov-conf').classList.add('open');
}
function cancelConf(){confCb=null;document.getElementById('ov-conf').classList.remove('open')}
document.getElementById('conf-ok').onclick=()=>{if(confCb)confCb();cancelConf()};

/* ══ USER DROPDOWN ══ */
let uDropOpen=false;
function toggleUDrop(e){
  e.stopPropagation();
  uDropOpen=!uDropOpen;
  document.getElementById('udrop').classList.toggle('open',uDropOpen);
  document.getElementById('user-btn').classList.toggle('open',uDropOpen);
}
function closeUDrop(){
  uDropOpen=false;
  document.getElementById('udrop').classList.remove('open');
  document.getElementById('user-btn').classList.remove('open');
}
document.addEventListener('click',e=>{
  const d=document.getElementById('udrop');
  const b=document.getElementById('user-btn');
  if(d&&b&&!d.contains(e.target)&&!b.contains(e.target)) closeUDrop();
});

/* ══ SETTINGS ══ */
function openSettings(tab){
  document.getElementById('ov-set').classList.add('open');
  document.querySelectorAll('.stab').forEach(t=>{
    const m=t.getAttribute('onclick').match(/'(\w+)'/);
    if(m&&m[1]===(tab||'perfil')) switchStab(tab||'perfil',t);
  });
}
function closeSettings(){document.getElementById('ov-set').classList.remove('open')}
function switchStab(id,el){
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.spanel').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  const p=document.getElementById('sp-'+id);
  if(p) p.classList.add('active');
  const dt=document.getElementById('set-dark-tog');
  if(dt) dt.classList.toggle('on',dark);
}

/* ══ HOME ══ */
function renderHome(){
  document.getElementById('home-greeting').innerHTML=GREETINGS[Math.floor(Math.random()*GREETINGS.length)];
  const{rec,dep,sal}=totals();
  document.getElementById('h-bal').textContent=R(sal);
  document.getElementById('h-in').textContent=R(rec);
  document.getElementById('h-out').textContent=R(dep);
  renderHomeRecent();
}

/* ══ DASHBOARD ══ */
function renderDash(){
  const{rec,dep,sal}=totals();
  // hero
  document.getElementById('d-bal').textContent=R(sal);
  document.getElementById('d-in').textContent=R(rec);
  document.getElementById('d-out').textContent=R(dep);
  // kpi secondary
  document.getElementById('k-in').textContent=R(rec);
  document.getElementById('k-out').textContent=R(dep);
  const rate=rec>0?Math.round(((rec-dep)/rec)*100):0;
  document.getElementById('k-rate').textContent=rate+'%';
  // monthly bars
  ['mb-in','mb-out','mb-net'].forEach(id=>{
    const vals={['mb-in']:rec,['mb-out']:dep,['mb-net']:sal};
    document.getElementById(id).textContent=R(vals[id]);
  });
  const max=rec||1;
  setTimeout(()=>{
    document.getElementById('mb-in-b').style.width='100%';
    document.getElementById('mb-out-b').style.width=Math.round(Math.min(100,(dep/max)*100))+'%';
    document.getElementById('mb-net-b').style.width=Math.round(Math.min(100,Math.max(0,(sal/max)*100)))+'%';
  },120);
  // comparison
  const diff=sal-5200; // simulated previous month
  const cmp=document.getElementById('cmp-val');
  cmp.textContent=(diff>=0?'+':'')+R(Math.abs(diff));
  cmp.className='cmp-val '+(diff>=0?'pos':'neg');
  document.querySelector('.cmp-txt').textContent=diff>=0?'vs mês anterior: saldo maior':'vs mês anterior: saldo menor';
  // recent
  renderDashRecent();
  rebuildMonthlyChart();
  document.getElementById('tx-ct').textContent=TX.length;
}

function renderDashRecent(){
  const el=document.getElementById('dash-recent');
  const list=[...TX].reverse().slice(0,6);
  if(!list.length){el.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx-3);font-size:13px;font-weight:500">Sem transações registradas</div>';return}
  el.innerHTML=list.map(t=>{
    const r=t.tipo==='receita';
    return `<div class="rtx-item">
      <div class="rtx-dot" style="background:${r?'var(--g-str)':'var(--r-str)'}"></div>
      <div class="rtx-info">
        <div class="rtx-name">${t.desc}</div>
        <div class="rtx-meta">${t.data} · ${Cap(t.cat)}</div>
      </div>
      <span class="badge ${r?'b-g':'b-r'}" style="font-size:10px">${r?'Receita':'Despesa'}</span>
      <div class="rtx-val ${r?'pos':'neg'}">${r?'+':'−'}${R(t.val)}</div>
    </div>`;
  }).join('');
}

let mChart=null;
function rebuildMonthlyChart(){
  const{rec,dep}=totals();
  const labels=MN.slice(0,4);
  const rData=[4200,5800,6100,rec];
  const dData=[3100,3400,2800,dep];
  const ctx=document.getElementById('ch-m');
  if(mChart) mChart.destroy();
  mChart=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[
      {label:'Receitas',data:rData,backgroundColor:'rgba(22,163,74,.4)',borderColor:'#16a34a',borderWidth:1.5,borderRadius:5,borderSkipped:false},
      {label:'Despesas',data:dData,backgroundColor:'rgba(239,68,68,.3)',borderColor:'#ef4444',borderWidth:1.5,borderRadius:5,borderSkipped:false},
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      scales:{
        x:{grid:{display:false},ticks:{font:{size:11,family:"'Plus Jakarta Sans',sans-serif"},color:'#9C9894',fontWeight:'600'}},
        y:{grid:{color:dark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'},ticks:{font:{size:10,family:"'JetBrains Mono',monospace"},color:'#9C9894',callback:v=>'R$'+v.toLocaleString('pt-BR')}},
      },
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+R(c.raw)}}},
    }
  });
}

/* ══ TRANSACTIONS ══ */
function renderStrip(){
  const{rec,dep,sal}=totals();
  document.getElementById('st-ct').textContent=TX.length;
  document.getElementById('st-in').textContent=R(rec);
  document.getElementById('st-out').textContent=R(dep);
  const el=document.getElementById('st-net');
  el.textContent=R(sal);
  el.className='strip-val '+(sal>=0?'pos':'neg');
}

function renderTxList(){
  const el=document.getElementById('tx-list');
  let list=[...TX].reverse();
  if(activeFilter!=='todos') list=list.filter(t=>t.tipo===activeFilter||t.met===activeFilter);
  if(!list.length){
    el.innerHTML=`<div class="empty"><div class="empty-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/></svg></div><div class="empty-title">Nenhuma transação</div><div class="empty-sub">Adicione sua primeira movimentação financeira</div><button class="btn btn-primary btn-sm" style="margin-top:4px" onclick="openTxModal()">+ Adicionar agora</button></div>`;
    return;
  }
  el.innerHTML=list.map(t=>{
    const r=t.tipo==='receita';
    return `<div class="tx-row" id="tr-${t.id}">
      <div class="tx-type-dot ${r?'rec':'exp'}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="${r?'M8 13V3M4 7l4-4 4 4':'M8 3v10M4 9l4 4 4-4'}" stroke="${r?'var(--g-7)':'var(--r-7)'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="tx-main">
        <div class="tx-name">${t.desc}</div>
        <div class="tx-meta">
          <span class="badge ${r?'b-g':'b-r'}">${r?'Receita':'Despesa'}</span>
          <span class="badge ${MB[t.met]||'b-n'}">${ML[t.met]||Cap(t.met)}</span>
          <span class="badge b-n">${Cap(t.cat)}</span>
        </div>
      </div>
      <div class="tx-date">${t.data}</div>
      <div class="tx-amount ${r?'pos':'neg'}">${r?'+':'−'}${R(t.val)}</div>
      <div class="tx-acts">
        <button class="act-btn edit" onclick="openTxModal(${t.id})" title="Editar">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="act-btn del" onclick="deleteTx(${t.id})" title="Excluir">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4.5 3.5V2h4v1.5M5.5 6v4M7.5 6v4M3 3.5l.7 7.5h5.6l.7-7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

function setFilter(f,btn){
  activeFilter=f;
  document.querySelectorAll('#chips .chip').forEach(c=>c.classList.remove('on'));
  btn.classList.add('on');
  renderTxList();
}

/* TX CRUD */
function openTxModal(id,preType){
  editTxId=id||null;selType_='';
  clearTxForm();
  if(id){
    const t=TX.find(x=>x.id===id);if(!t)return;
    document.getElementById('tx-title').textContent='Editar Transação';
    document.getElementById('tx-submit').textContent='Salvar';
    selType_=t.tipo;refreshTypeTog();
    document.getElementById('f-desc').value=t.desc;
    document.getElementById('f-val').value=t.val;
    document.getElementById('f-data').value=t.data;
    document.getElementById('f-met').value=t.met;
    document.getElementById('f-cat').value=t.cat;
  } else {
    document.getElementById('tx-title').textContent='Nova Transação';
    document.getElementById('tx-submit').textContent='Adicionar';
    document.getElementById('f-data').valueAsDate=new Date();
    if(preType){selType_=preType;refreshTypeTog();}
  }
  document.getElementById('ov-tx').classList.add('open');
  setTimeout(()=>document.getElementById('f-desc').focus(),350);
}
function closeTxModal(){document.getElementById('ov-tx').classList.remove('open')}
function clearTxForm(){
  ['f-desc','f-val'].forEach(id=>{document.getElementById(id).value='';document.getElementById(id).classList.remove('err')});
  ['e-tipo','e-desc','e-val'].forEach(id=>document.getElementById(id).textContent='');
  document.getElementById('tt-in').className='tt-opt';
  document.getElementById('tt-out').className='tt-opt';
}
function selType(t){selType_=t;refreshTypeTog();document.getElementById('e-tipo').textContent=''}
function refreshTypeTog(){
  document.getElementById('tt-in').className='tt-opt'+(selType_==='receita'?' sel-in':'');
  document.getElementById('tt-out').className='tt-opt'+(selType_==='despesa'?' sel-out':'');
}
function submitTx(){
  const desc=document.getElementById('f-desc').value.trim();
  const val=parseFloat(document.getElementById('f-val').value);
  let ok=true;
  ['e-tipo','e-desc','e-val'].forEach(id=>document.getElementById(id).textContent='');
  ['f-desc','f-val'].forEach(id=>document.getElementById(id).classList.remove('err'));
  if(!selType_){document.getElementById('e-tipo').textContent='Selecione o tipo.';ok=false}
  if(!desc){document.getElementById('e-desc').textContent='Informe uma descrição.';document.getElementById('f-desc').classList.add('err');ok=false}
  if(!val||val<=0){document.getElementById('e-val').textContent='Valor inválido.';document.getElementById('f-val').classList.add('err');ok=false}
  if(!ok) return;
  const rec={desc,val,tipo:selType_,met:document.getElementById('f-met').value,cat:document.getElementById('f-cat').value,data:document.getElementById('f-data').value||new Date().toISOString().slice(0,10)};
  if(editTxId){const i=TX.findIndex(t=>t.id===editTxId);if(i>-1)TX[i]={...TX[i],...rec};toast('Transação atualizada!')}
  else{TX.push({id:nextId++,...rec});toast('Transação adicionada!')}
  saveData();
closeTxModal();
renderAll();
}
function deleteTx(id){
  const t=TX.find(x=>x.id===id);if(!t)return;
  conf_('Excluir transação',`Excluir "${t.desc}"?`,()=>{
    const row=document.getElementById('tr-'+id);
    if(row){row.classList.add('removing');setTimeout(()=>{TX=TX.filter(x=>x.id!==id);renderAll()},300)}
    else{TX=TX.filter(x=>x.id!==id);renderAll()}
    toast('Transação removida.','trash');
  });
}

/* ══ GOALS ══ */
function openGoalModal(id){
  editGoalId=id||null;
  ['g-emoji','g-nome','g-alvo','g-atual'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('e-gnome').textContent='';
  if(id){
    const g=GOALS.find(x=>x.id===id);if(!g)return;
    document.getElementById('goal-title').textContent='Editar Meta';
    document.getElementById('goal-submit').textContent='Salvar';
    ['g-emoji','g-nome','g-alvo','g-atual'].forEach(k=>{
      const map={g_emoji:'emoji',g_nome:'nome',g_alvo:'alvo',g_atual:'atual'};
      document.getElementById(k).value=g[k.replace('g-','')];
    });
    document.getElementById('g-emoji').value=g.emoji||'🎯';
    document.getElementById('g-nome').value=g.nome;
    document.getElementById('g-alvo').value=g.alvo;
    document.getElementById('g-atual').value=g.atual;
  } else {
    document.getElementById('goal-title').textContent='Nova Meta';
    document.getElementById('goal-submit').textContent='Criar Meta';
  }
  document.getElementById('ov-goal').classList.add('open');
}
function closeGoalModal(){document.getElementById('ov-goal').classList.remove('open')}
function submitGoal(){
  const nome=document.getElementById('g-nome').value.trim();
  document.getElementById('e-gnome').textContent='';
  if(!nome){document.getElementById('e-gnome').textContent='Informe um nome.';return}
  const alvo=parseFloat(document.getElementById('g-alvo').value)||10000;
  const atual=parseFloat(document.getElementById('g-atual').value)||0;
  const emoji=document.getElementById('g-emoji').value.trim()||'🎯';
  if(editGoalId){const i=GOALS.findIndex(g=>g.id===editGoalId);if(i>-1)GOALS[i]={...GOALS[i],emoji,nome,alvo,atual};toast('Meta atualizada!')}
  else{GOALS.push({id:nextId++,emoji,nome,alvo,atual});toast('Meta criada!')}
  closeGoalModal();renderGoals();
}
function deleteGoal(id){
  const g=GOALS.find(x=>x.id===id);if(!g)return;
  conf_('Excluir meta',`Excluir "${g.nome}"?`,()=>{GOALS=GOALS.filter(x=>x.id!==id);renderGoals();toast('Meta removida.','trash')});
}
function renderGoals(){
  const el=document.getElementById('goals-grid');
  if(!GOALS.length){
    el.innerHTML='<div style="grid-column:1/-1"><div class="empty"><div class="empty-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12A6 6 0 0 1 12 6zm0 2a4 4 0 1 0 0 8A4 4 0 0 0 12 8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg></div><div class="empty-title">Nenhuma meta criada</div><div class="empty-sub">Crie seu primeiro objetivo financeiro</div><button class="btn btn-primary btn-sm" style="margin-top:4px" onclick="openGoalModal()">+ Criar meta</button></div></div>';
    return;
  }
  el.innerHTML=GOALS.map(g=>{
    const pct=Math.min(100,Math.round((g.atual/g.alvo)*100));
    const done=pct>=100;
    const barCls=done?'gf-done':pct>=70?'gf-high':pct>=35?'gf-mid':'gf-low';
    return `<div class="goal-card">
      ${done?'<div class="goal-done-badge">✓ Concluído</div>':''}
      <div class="goal-card-top">
        <span class="goal-emoji">${g.emoji||'🎯'}</span>
        <div class="goal-acts">
          <button class="act-btn edit" onclick="openGoalModal(${g.id})" title="Editar"><svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button class="act-btn del" onclick="deleteGoal(${g.id})" title="Excluir"><svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4.5 3.5V2h4v1.5M5.5 6v4M7.5 6v4M3 3.5l.7 7.5h5.6l.7-7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
      </div>
      <div class="goal-name">${g.nome}</div>
      <div class="goal-target">Meta: ${R(g.alvo)}</div>
      <div class="goal-prog-wrap">
        <div class="goal-prog-header">
          <span class="goal-prog-label">Progresso</span>
          <span class="goal-prog-pct ${done?'done':''}">${pct}%</span>
        </div>
        <div class="goal-track"><div class="goal-fill ${barCls}" style="width:${pct}%"></div></div>
      </div>
      <div class="goal-foot">
        <div><div class="goal-curr">Atual: <strong>${R(g.atual)}</strong></div><div class="goal-rem">${done?'🎉 Objetivo atingido!':'Faltam '+R(g.alvo-g.atual)}</div></div>
      </div>
    </div>`;
  }).join('');
}

/* ══ CALENDAR ══ */
function renderCal(){
  document.getElementById('cal-month').textContent=MN[calM]+(calM>3?' ':' ');
  document.getElementById('cal-month').textContent=new Date(calY,calM,1).toLocaleString('pt-BR',{month:'long'}).replace(/^\w/,c=>c.toUpperCase());
  document.getElementById('cal-yr').textContent=calY;
  document.getElementById('cal-up-sub').textContent=MN[calM]+' '+calY;
  const fd=new Date(calY,calM,1).getDay();
  const dim=new Date(calY,calM+1,0).getDate();
  const dip=new Date(calY,calM,0).getDate();
  const today=new Date();
  const cells=[];
  for(let i=fd-1;i>=0;i--) cells.push({d:dip-i,cur:false});
  for(let d=1;d<=dim;d++) cells.push({d,cur:true});
  while(cells.length<42) cells.push({d:cells.length-fd-dim+1,cur:false});
  const eMap={};
  CEVS.forEach(ev=>{
    const dt=new Date(ev.data+'T12:00:00');
    if(dt.getFullYear()===calY&&dt.getMonth()===calM){
      const d=dt.getDate();
      if(!eMap[d]) eMap[d]=[];
      eMap[d].push(ev);
    }
  });
  document.getElementById('cal-days').innerHTML=cells.map(c=>{
    const isT=c.cur&&c.d===today.getDate()&&calM===today.getMonth()&&calY===today.getFullYear();
    const evs=c.cur?(eMap[c.d]||[]):[];
    const evH=evs.slice(0,2).map(e=>`<div class="cev cev-${e.tipo}" onclick="event.stopPropagation();openEditCal(${e.id})" title="${e.titulo}">${e.titulo}</div>`).join('');
    const more=evs.length>2?`<div style="font-size:9px;color:var(--tx-3);padding:1px 4px;font-weight:600">+${evs.length-2}</div>`:'';
    return `<div class="cal-day${c.cur?'':' other'}${isT?' today':''}" onclick="openCalModal('${calY}-${String(calM+1).padStart(2,'0')}-${String(c.d).padStart(2,'0')}')">
      <div class="cal-dn">${c.d}${isT?'<div class="today-pip"></div>':''}</div>
      <div class="cal-evs">${evH}${more}</div>
    </div>`;
  }).join('');
  renderCalUp();renderCalSum();
}
function renderCalUp(){
  const el=document.getElementById('cal-up-list');
  const evs=CEVS.filter(ev=>{const dt=new Date(ev.data+'T12:00:00');return dt.getFullYear()===calY&&dt.getMonth()===calM}).sort((a,b)=>a.data.localeCompare(b.data));
  if(!evs.length){el.innerHTML='<div style="text-align:center;color:var(--tx-3);font-size:13px;padding:16px;font-weight:500">Sem eventos este mês</div>';return}
  el.innerHTML=evs.map(ev=>`
    <div class="cal-up-item">
      <div class="cal-up-dot" style="background:${EVC[ev.tipo]}"></div>
      <div class="cal-up-info">
        <div class="cal-up-title">${ev.titulo}${ev.val?' — '+R(ev.val):''}</div>
        <div class="cal-up-sub">${new Date(ev.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})} · ${EVL[ev.tipo]}</div>
      </div>
      <span class="badge b-n">${ev.data.slice(8)}</span>
      <div class="cal-up-acts">
        <button class="act-btn edit" onclick="openEditCal(${ev.id})"><svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button class="act-btn del" onclick="deleteCal(${ev.id})"><svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4.5 3.5V2h4v1.5M5.5 6v4M7.5 6v4M3 3.5l.7 7.5h5.6l.7-7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </div>`).join('');
}
function renderCalSum(){
  const evs=CEVS.filter(ev=>{const dt=new Date(ev.data+'T12:00:00');return dt.getFullYear()===calY&&dt.getMonth()===calM&&ev.val});
  const inc=evs.filter(e=>e.tipo==='salario'||e.tipo==='extra').reduce((a,e)=>a+e.val,0);
  const exp=evs.filter(e=>e.tipo!=='salario'&&e.tipo!=='extra').reduce((a,e)=>a+e.val,0);
  document.getElementById('cal-summary').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:0">
      <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--br)"><span style="font-size:13px;color:var(--tx-2);font-weight:500">Total de eventos</span><span style="font-size:13px;font-weight:700;font-family:var(--fm);color:var(--tx-1)">${evs.length}</span></div>
      <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--br)"><span style="font-size:13px;color:var(--tx-2);font-weight:500">Entradas planejadas</span><span style="font-size:13px;font-weight:700;font-family:var(--fm);color:var(--g-7)">${R(inc)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:9px 0"><span style="font-size:13px;color:var(--tx-2);font-weight:500">Saídas planejadas</span><span style="font-size:13px;font-weight:700;font-family:var(--fm);color:var(--r-7)">${R(exp)}</span></div>
    </div>`;
}
function calMove(d){calM+=d;if(calM>11){calM=0;calY++}if(calM<0){calM=11;calY--}renderCal()}
function calToday(){const n=new Date();calM=n.getMonth();calY=n.getFullYear();renderCal()}

function openCalModal(dateStr){
  editCalId=null;selEvT_='';
  document.querySelectorAll('.ev-topt').forEach(o=>o.classList.remove('sel'));
  ['ev-tit','ev-obs'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ev-val').value='';
  ['e-evt','e-evt'].forEach(id=>document.getElementById(id).textContent='');
  document.getElementById('ev-dat').value=dateStr||new Date().toISOString().slice(0,10);
  document.getElementById('cal-title').textContent='Novo Evento';
  document.getElementById('cal-submit').textContent='Salvar evento';
  document.getElementById('ov-cal').classList.add('open');
}
function openEditCal(id){
  const ev=CEVS.find(x=>x.id===id);if(!ev)return;
  editCalId=id;selEvT_=ev.tipo;
  document.querySelectorAll('.ev-topt').forEach(o=>o.classList.toggle('sel',o.getAttribute('data-ev')===ev.tipo));
  document.getElementById('ev-tit').value=ev.titulo;
  document.getElementById('ev-dat').value=ev.data;
  document.getElementById('ev-val').value=ev.val||'';
  document.getElementById('ev-obs').value=ev.obs||'';
  document.getElementById('cal-title').textContent='Editar Evento';
  document.getElementById('cal-submit').textContent='Salvar';
  document.getElementById('ov-cal').classList.add('open');
}
function closeCalModal(){document.getElementById('ov-cal').classList.remove('open')}
function selEvT(t,el){
  selEvT_=t;
  document.querySelectorAll('.ev-topt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('e-evt').textContent='';
}
function submitCal(){
  const titulo=document.getElementById('ev-tit').value.trim();
  let ok=true;
  ['e-evt'].forEach(id=>document.getElementById(id).textContent='');
  if(!selEvT_){document.getElementById('e-evt').textContent='Selecione o tipo.';ok=false}
  if(!titulo){document.getElementById('e-evt').textContent='Informe um título.';document.getElementById('ev-tit').classList.add('err');ok=false}
  else document.getElementById('ev-tit').classList.remove('err');
  if(!ok) return;
  const rec={tipo:selEvT_,titulo,data:document.getElementById('ev-dat').value||new Date().toISOString().slice(0,10),val:parseFloat(document.getElementById('ev-val').value)||0,obs:document.getElementById('ev-obs').value.trim()};
  if(editCalId){const i=CEVS.findIndex(e=>e.id===editCalId);if(i>-1)CEVS[i]={...CEVS[i],...rec};toast('Evento atualizado!')}
  else{CEVS.push({id:nextId++,...rec});toast('Evento criado!')}
  closeCalModal();renderCal();
}
function deleteCal(id){
  const ev=CEVS.find(x=>x.id===id);if(!ev)return;
  conf_('Excluir evento',`Excluir "${ev.titulo}"?`,()=>{CEVS=CEVS.filter(x=>x.id!==id);renderCal();toast('Evento removido.','trash')});
}

/* ══ DISTRIBUTION ══ */
let cCat=null,cMet=null;
function renderDist(){
  const deps=TX.filter(t=>t.tipo==='despesa');
  const bC={};deps.forEach(t=>{bC[t.cat]=(bC[t.cat]||0)+t.val});
  const cK=Object.keys(bC).sort((a,b)=>bC[b]-bC[a]);
  const cT=cK.reduce((a,k)=>a+bC[k],0)||1;
  document.getElementById('dist-cat').innerHTML=cK.map((k,i)=>{
    const p=Math.round((bC[k]/cT)*100);
    return `<div class="dist-row"><div class="dist-dot" style="background:${CC[i%CC.length]}"></div><span class="dist-label">${Cap(k)}</span><div class="dist-bar"><div class="dist-bf" style="width:${p}%;background:${CC[i%CC.length]}"></div></div><span class="dist-amt">${R(bC[k])}</span></div>`;
  }).join('');
  const ctx1=document.getElementById('ch-cat');
  if(cCat) cCat.destroy();
  cCat=new Chart(ctx1,{type:'doughnut',data:{labels:cK.map(Cap),datasets:[{data:cK.map(k=>bC[k]),backgroundColor:CC,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+R(c.raw)}}}}});
  const bM={};TX.forEach(t=>{bM[t.met]=(bM[t.met]||0)+t.val});
  const mK=Object.keys(bM).sort((a,b)=>bM[b]-bM[a]);
  const mT=mK.reduce((a,k)=>a+bM[k],0)||1;
  document.getElementById('dist-met').innerHTML=mK.map((k,i)=>{
    const p=Math.round((bM[k]/mT)*100);
    return `<div class="dist-row"><div class="dist-dot" style="background:${CC[i%CC.length]}"></div><span class="dist-label">${ML[k]||Cap(k)}</span><div class="dist-bar"><div class="dist-bf" style="width:${p}%;background:${CC[i%CC.length]}"></div></div><span class="dist-amt">${R(bM[k])}</span></div>`;
  }).join('');
  const ctx2=document.getElementById('ch-met');
  if(cMet) cMet.destroy();
  cMet=new Chart(ctx2,{type:'doughnut',data:{labels:mK.map(k=>ML[k]||Cap(k)),datasets:[{data:mK.map(k=>bM[k]),backgroundColor:CC,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+R(c.raw)}}}}});
}

/* ══ RENDER ALL ══ */
function renderAll(){
  renderHome();renderDash();renderStrip();renderTxList();renderHomeRecent();
  document.getElementById('tx-ct').textContent=TX.length;
  if(activePage==='projetos') renderGoals();
  if(activePage==='calendario') renderCal();
  if(activePage==='distribuicao') renderDist();
}

/* ══ SAFE OVERLAY LISTENERS ══ */
(function(){
  const map={'ov-tx':closeTxModal,'ov-goal':closeGoalModal,'ov-cal':closeCalModal,'ov-set':closeSettings,'ov-conf':cancelConf};
  Object.entries(map).forEach(([id,fn])=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener('click',e=>{if(e.target===el)fn()});
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeTxModal();closeGoalModal();closeCalModal();closeSettings();cancelConf();closeUDrop()}
  });
})();


/* ══════════════════════════════
   WEBGL WAVE ANIMATION
   Ported from LineWaves shader (OGL-free, standalone WebGL)
══════════════════════════════ */
(function initWave(){
  const wrap = document.getElementById('wave-canvas-wrap');
  if(!wrap) return;

  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);

  const gl = canvas.getContext('webgl', {alpha:true, premultipliedAlpha:false});
  if(!gl) return;

  gl.clearColor(0,0,0,0);

  const vert = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = `
    precision highp float;
    uniform float uTime;
    uniform vec3 uRes;
    uniform float uSpeed;
    uniform float uInner;
    uniform float uOuter;
    uniform float uWarp;
    uniform float uRot;
    uniform float uBright;
    uniform vec3 uC1;
    uniform vec3 uC2;
    uniform vec3 uC3;
    #define HALF_PI 1.5707963

    float hashF(float n){ return fract(sin(n*127.1)*43758.5453123); }
    float sNoise(float x){
      float i=floor(x); float f=fract(x);
      float u=f*f*(3.0-2.0*f);
      return mix(hashF(i),hashF(i+1.0),u);
    }
    float dispA(float c, float t){
      return sin(c*2.123)*0.2 + sin(c*3.234+t*4.345)*0.1 + sin(c*0.589+t*0.934)*0.5;
    }
    float dispB(float c, float t){
      return sin(c*1.345)*0.3 + sin(c*2.734+t*3.345)*0.2 + sin(c*0.189+t*0.934)*0.3;
    }
    vec2 rot2D(vec2 p, float a){
      return vec2(p.x*cos(a)-p.y*sin(a), p.x*sin(a)+p.y*cos(a));
    }
    void main(){
      vec2 coords = gl_FragCoord.xy / uRes.xy * 2.0 - 1.0;
      coords = rot2D(coords, uRot);
      float ht = uTime*uSpeed*0.5;
      float ft = uTime*uSpeed;
      float ax = coords.x + dispA(coords.y, ht)*uWarp;
      float ay = coords.y - dispA(coords.x*cos(ft)*1.235, ht)*uWarp;
      float bx = coords.x + dispB(coords.y, ht)*uWarp;
      float by = coords.y - dispB(coords.x*sin(ft)*1.235, ht)*uWarp;
      vec2 fa = vec2(ax,ay); vec2 fb = vec2(bx,by);
      vec2 bl = mix(fa,fb,0.5);
      float fadeT = smoothstep(0.0, 0.4, bl.y);
      float fadeB = smoothstep(0.0, -0.4, bl.y);
      float vM = 1.0 - max(fadeT, fadeB);
      float tc = mix(uOuter, uInner, vM);
      float sY = bl.y * tc;
      float nY = sNoise(abs(sY));
      float ridge = pow(step(abs(nY-bl.x)*2.0, HALF_PI)*cos(2.0*(nY-bl.x)), 5.0);
      float lines = 0.0;
      for(float i=1.0;i<3.0;i+=1.0){ lines += pow(max(fract(sY),fract(-sY)), i*2.0); }
      float pat = vM * lines;
      float cycT = ft * 1.0;
      float rC = (pat+lines*ridge)*(cos(bl.y+cycT*0.234)*0.5+1.0);
      float gC = (pat+vM*ridge)*(sin(bl.x+cycT*1.745)*0.5+1.0);
      float bC = (pat+lines*ridge)*(cos(bl.x+cycT*0.534)*0.5+1.0);
      vec3 col = (rC*uC1 + gC*uC2 + bC*uC3) * uBright;
      float alpha = clamp(length(col), 0.0, 1.0);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  function mkShader(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen triangle (covers -1..1 in both axes)
  const verts = new Float32Array([-1,-1, 3,-1, -1,3]);
  const uvs   = new Float32Array([0,0, 2,0, 0,2]);
  function mkBuf(data, attr){
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, attr);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }
  mkBuf(verts,'position'); mkBuf(uvs,'uv');

  const U = {};
  ['uTime','uRes','uSpeed','uInner','uOuter','uWarp','uRot','uBright','uC1','uC2','uC3'].forEach(n=>{
    U[n] = gl.getUniformLocation(prog, n);
  });

  // Colors: cool white-green-blue palette that works on the dark hero
  function hex3(h){
    const s=h.replace('#','');
    return [parseInt(s.slice(0,2),16)/255, parseInt(s.slice(2,4),16)/255, parseInt(s.slice(4,6),16)/255];
  }
  const c1=hex3('#4ade80'); // green
  const c2=hex3('#86efac'); // lighter green
  const c3=hex3('#bbf7d0'); // very light green

  function resize(){
    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(U.uRes, w, h, w/h);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  gl.uniform1f(U.uSpeed, 0.28);
  gl.uniform1f(U.uInner, 30.0);
  gl.uniform1f(U.uOuter, 34.0);
  gl.uniform1f(U.uWarp, 0.9);
  gl.uniform1f(U.uRot, (-42 * Math.PI) / 180);
  gl.uniform1f(U.uBright, 0.18);
  gl.uniform3fv(U.uC1, c1);
  gl.uniform3fv(U.uC2, c2);
  gl.uniform3fv(U.uC3, c3);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let raf;
  function frame(t){
    raf = requestAnimationFrame(frame);
    gl.uniform1f(U.uTime, t * 0.001);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  raf = requestAnimationFrame(frame);

  // Pause when home page is not visible
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ if(!raf) raf=requestAnimationFrame(frame); }
      else { cancelAnimationFrame(raf); raf=null; }
    });
  },{threshold:0.01});
  obs.observe(wrap);
})();

/* ══ HOME RECENT TX ══ */
function renderHomeRecent(){
  const el = document.getElementById('home-recent-tx');
  if(!el) return;
  const list = [...TX].reverse().slice(0,5);
  if(!list.length){
    el.innerHTML='<div style="padding:20px;text-align:center;color:var(--tx-3);font-size:13px;font-weight:500">Sem movimentações ainda</div>';
    return;
  }
  el.innerHTML = list.map(t=>{
    const r = t.tipo==='receita';
    return `<div class="rtx-item">
      <div class="rtx-dot" style="background:${r?'var(--g-str)':'var(--r-str)'}"></div>
      <div class="rtx-info">
        <div class="rtx-name">${t.desc}</div>
        <div class="rtx-meta">${t.data} · ${Cap(t.cat)}</div>
      </div>
      <div class="rtx-val ${r?'pos':'neg'}">${r?'+':'−'}${R(t.val)}</div>
    </div>`;
  }).join('');
}

/* ══ CÂMBIO — AwesomeAPI ══ */
let cambioRates = {};
let cambioCarregado = false;

async function cambioLoad() {
  const btn = document.getElementById('cambio-refresh-btn');
  const dot = document.getElementById('cambio-status-dot');
  const txt = document.getElementById('cambio-status-txt');
  if (btn) btn.disabled = true;
  if (dot) dot.style.background = 'var(--a-5)';
  if (txt) txt.textContent = 'Buscando cotações...';

  try {
    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    cambioRates = {
      USD: { bid: parseFloat(data.USDBRL.bid), ask: parseFloat(data.USDBRL.ask), pct: parseFloat(data.USDBRL.pctChange), high: parseFloat(data.USDBRL.high), low: parseFloat(data.USDBRL.low), name: 'Dólar', flag: '🇺🇸', code: 'USD' },
      EUR: { bid: parseFloat(data.EURBRL.bid), ask: parseFloat(data.EURBRL.ask), pct: parseFloat(data.EURBRL.pctChange), high: parseFloat(data.EURBRL.high), low: parseFloat(data.EURBRL.low), name: 'Euro', flag: '🇪🇺', code: 'EUR' },
      BTC: { bid: parseFloat(data.BTCBRL.bid), ask: parseFloat(data.BTCBRL.ask), pct: parseFloat(data.BTCBRL.pctChange), high: parseFloat(data.BTCBRL.high), low: parseFloat(data.BTCBRL.low), name: 'Bitcoin', flag: '₿', code: 'BTC' },
    };
    cambioCarregado = true;

    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (dot) dot.style.background = 'var(--g-str)';
    if (txt) txt.textContent = 'Atualizado às ' + agora + ' · Fonte: AwesomeAPI';

    renderCambioCards();
    renderCambioTabela();
    calcConv();
  } catch (e) {
    if (dot) dot.style.background = 'var(--r-str)';
    if (txt) txt.textContent = 'Falha ao buscar cotações. Verifique sua conexão.';
    const cards = document.getElementById('cambio-cards');
    if (cards) cards.innerHTML = '<div style="grid-column:1/-1;padding:32px;text-align:center;color:var(--tx-3);font-size:13px;font-weight:500">Não foi possível carregar as cotações.<br><br><button class="btn btn-ghost btn-sm" onclick="cambioLoad()">Tentar novamente</button></div>';
  }
  if (btn) btn.disabled = false;
}

function renderCambioCards() {
  const el = document.getElementById('cambio-cards');
  if (!el) return;
  el.innerHTML = Object.values(cambioRates).map(m => {
    const up = m.pct >= 0;
    const cor = up ? 'var(--g-bg)' : 'var(--r-bg)';
    const ctxt = up ? 'var(--g-txt)' : 'var(--r-txt)';
    const seta = up ? '▲' : '▼';
    const casasBid = m.code === 'BTC' ? 2 : 4;
    const bid = m.bid.toLocaleString('pt-BR', { minimumFractionDigits: casasBid, maximumFractionDigits: casasBid });
    return `<div class="card" style="padding:20px 22px">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--tx-3)">${m.flag} ${m.name} (${m.code})</div>
      <div style="font-size:26px;font-weight:800;font-family:var(--fm);letter-spacing:-.04em;color:var(--tx-1);margin:8px 0 4px">R$ ${bid}</div>
      <span style="background:${cor};color:${ctxt};font-size:12px;font-weight:600;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:3px">${seta} ${Math.abs(m.pct).toFixed(2)}%</span>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--br);display:flex;gap:16px">
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tx-4)">Máx</div><div style="font-size:12px;font-weight:600;color:var(--tx-2);font-family:var(--fm)">${m.high.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tx-4)">Mín</div><div style="font-size:12px;font-weight:600;color:var(--tx-2);font-family:var(--fm)">${m.low.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
        <div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tx-4)">Venda</div><div style="font-size:12px;font-weight:600;color:var(--tx-2);font-family:var(--fm)">${m.ask.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
      </div>
    </div>`;
  }).join('');
}

function renderCambioTabela() {
  const el = document.getElementById('cambio-tabela');
  if (!el) return;
  el.innerHTML = Object.values(cambioRates).map(m => {
    const qty = 100 / m.bid;
    const qtyFmt = m.code === 'BTC'
      ? qty.toFixed(8) + ' BTC'
      : qty.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ' ' + m.code;
    return `<div style="display:flex;align-items:center;padding:11px 20px;border-bottom:1px solid var(--br);gap:14px">
      <div style="font-size:20px;width:32px;text-align:center;flex-shrink:0">${m.flag}</div>
      <div style="font-size:13px;font-weight:600;color:var(--tx-1);flex:1">${m.name}</div>
      <div style="font-size:11px;color:var(--tx-3);font-weight:500;margin-right:8px">R$ 100,00 =</div>
      <div style="font-size:14px;font-weight:700;font-family:var(--fm);color:var(--tx-1)">${qtyFmt}</div>
    </div>`;
  }).join('');
}

function calcConv() {
  const res = document.getElementById('conv-result');
  if (!res) return;
  const val = parseFloat(document.getElementById('conv-val')?.value);
  const from = document.getElementById('conv-from')?.value;
  const to = document.getElementById('conv-to')?.value;
  if (!cambioCarregado || !val || isNaN(val) || val <= 0) {
    res.innerHTML = '<span style="font-size:13px;color:var(--tx-3);font-weight:500">Digite um valor para converter</span>';
    return;
  }
  let emBRL = from === 'BRL' ? val : (cambioRates[from] ? val * cambioRates[from].bid : null);
  if (emBRL === null) return;
  let resultado = to === 'BRL' ? emBRL : (cambioRates[to] ? emBRL / cambioRates[to].bid : null);
  if (resultado === null) return;
  const syms = { BRL: 'R$', USD: 'US$', EUR: '€', BTC: '₿' };
  const casas = to === 'BTC' ? 8 : 2;
  const resultFmt = resultado.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const origFmt = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  res.innerHTML = `<div style="text-align:center">
    <div style="font-size:12px;color:var(--tx-3);font-weight:500;margin-bottom:6px">${syms[from]} ${origFmt} =</div>
    <div style="font-size:30px;font-weight:800;font-family:var(--fm);letter-spacing:-.04em;color:var(--tx-1)">${syms[to]} ${resultFmt}</div>
    ${from!=='BRL'&&to!=='BRL'?`<div style="font-size:11px;color:var(--tx-4);margin-top:4px;font-weight:500">via R$ ${emBRL.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>`:''}
  </div>`;
}

function swapConv() {
  const f = document.getElementById('conv-from');
  const t = document.getElementById('conv-to');
  if (!f || !t) return;
  [f.value, t.value] = [t.value, f.value];
  calcConv();
}

/* ══ INIT ══ */
const _now = new Date();
calM = _now.getMonth();
calY = _now.getFullYear();

loadData();
applySavedUIState();
renderAll();