(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };

  /* offline: service worker */
  if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){
    window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
  }

  /* tabs */
  const tabs=$$('nav.tabs button'), views=$$('main section.view');
  function show(id){
    if(!views.some(v=>v.id===id)) id='inicio';
    views.forEach(v=>v.classList.toggle('on',v.id===id));
    tabs.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===id)));
    window.scrollTo(0,0);
    const act=tabs.find(b=>b.dataset.tab===id); if(act) act.scrollIntoView({inline:'center',block:'nearest'});
  }
  tabs.forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.tab}));
  $$('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();location.hash=a.dataset.go}));
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
  show(location.hash.slice(1));

  /* countdown */
  (function(){
    const start=new Date(2026,9,19), test=new Date(2026,11,26), now=new Date(); now.setHours(0,0,0,0);
    const d=Math.round((start-now)/864e5), t=Math.round((test-now)/864e5);
    if(d>0){$('#cd-n').textContent=d;$('#cd-l').textContent=d===1?'dia até o início':'dias até o início'}
    else if(t>0){$('#cd-n').textContent=t;$('#cd-l').textContent=t===1?'dia até o teste final':'dias até o teste final'}
    else{$('#cd-n').textContent='✓';$('#cd-l').textContent='ciclo concluído'}
  })();

  /* zones */
  const Z=[
    ['Z1','Recuperação','acima de 8:15 (ou caminhada rápida)',60,70,'2–3','Conversa normal, muito confortável','--z1'],
    ['Z2','Leve / base','7:30 – 8:15',70,78,'4–5','Consegue falar frases completas','--z2'],
    ['Z3','Moderado','6:50 – 7:20',78,85,'6','Fala frases curtas; respiração marcada','--z3'],
    ['Z4','Limiar','6:15 – 6:40',85,92,'7–8','Só fala poucas palavras; desconfortável, mas sustentável','--z4'],
    ['Z5','Forte (VO2)','5:45 – 6:05',92,100,'9','Não dá para falar; só aguenta poucos minutos','--z5']
  ];
  const zhtml=Z.map((z,i)=>`<div class="zone"><div class="zid" style="background:var(${z[7]})">${z[0]}</div><div class="zb">
    <h3>${z[1]}</h3>
    <div class="meta"><small>Ritmo /km</small>${z[2]}</div>
    <div class="meta"><small>% FC máx · esforço</small>${z[3]}–${z[4]}% · ${z[5]}<span class="bpm" data-i="${i}"></span></div>
    <div class="feel">${z[6]}</div></div></div>`).join('');
  $('#zones').innerHTML=zhtml;
  function fc(){
    const a=parseFloat($('#age').value), out=$('#fcmax');
    const ok=a>=14&&a<=90, max=ok?208-0.7*a:null;
    out.textContent=ok?Math.round(max)+' bpm':'—';
    $$('.bpm').forEach(el=>{
      const z=Z[el.dataset.i];
      el.textContent=ok?` · ${Math.round(max*z[3]/100)}–${Math.round(max*z[4]/100)} bpm`:'';
    });
    store.set('age',ok?a:'');
  }
  $('#age').value=store.get('age','')||''; $('#age').addEventListener('input',fc); fc();

  /* plan */
  const W=[
    ['19 a 24/out','Adaptação','',['6 × 2 min Z4 / 2 min trote Z1','~40 min'],['30 min Z2 + 4 acelerações de 15 s','~35 min'],['40 min Z2 contínuo','~40 min']],
    ['26 a 31/out','Adaptação','',['Fartlek 8 × 1 min Z4 / 1:30 Z1','~40 min'],['30 min Z2 + 4 acelerações de 20 s','~35 min'],['45 min Z2 contínuo','~45 min']],
    ['02 a 07/nov','Construção','',['5 × 3 min Z4 / 2 min trote Z1','~45 min'],['35 min Z2 + 5 subidas de 30 s forte','~45 min'],['50 min progressivo: 40 Z2 + 10 Z3','~50 min']],
    ['09 a 14/nov','Recuperação','rec',['4 × 2 min Z4 / 2 min Z1','~30 min'],['30 min Z2 bem confortável','30 min'],['3 × 5 min Z3 / 2 min Z2','~40 min']],
    ['16 a 21/nov','Construção','',['6 × 400 m Z5 / 2 min trote Z1','~40 min'],['35 min Z2 + 6 subidas de 30 s forte','~45 min'],['55 min Z2 contínuo','~55 min']],
    ['23 a 28/nov','Construção','',['3 × 6 min Z4 / 2 min Z1','~45 min'],['40 min Z2 + 6 acelerações de 20 s','~45 min'],['60 min progressivo: 50 Z2 + 10 Z3','~60 min']],
    ['30/nov a 05/dez','Pico','peak',['Pirâmide 1-2-3-2-1 min (1 e 2 min em Z5, 3 min em Z4) / recuperação igual ao tiro em Z1','~45 min'],['40 min Z2 + 6 subidas de 40 s forte','~50 min'],['60 min Z2 contínuo','~60 min']],
    ['07 a 12/dez','Recuperação','rec',['5 × 2 min Z4 / 2 min Z1','~35 min'],['30 min Z2 bem confortável','30 min'],['45 min: 30 Z2 + 15 Z3','~45 min']],
    ['14 a 19/dez','Específico','',['2 × 10 min Z4 / 3 min Z1','~45 min'],['35 min Z2 + 6 acelerações de 20 s','~40 min'],['4 × 5 min em RP (5:50–6:00/km) / 2 min Z1','~45 min']],
    ['21 a 26/dez','Polimento + teste','test',['6 × 1 min em RP / 1:30 Z1','~30 min'],['25 min Z2 + 4 acelerações de 15 s','~30 min'],['TESTE 5 km: aquec. completo + 5 km no máximo sustentável. Saia em ~6:00/km no 1º km e acelere se sobrar.','']]
  ];
  const mins=s=>parseInt((s||'').replace(/\D/g,''))||0;
  $('#weeks').innerHTML=W.map((w,i)=>{
    const tag=w[2]==='rec'?'<span class="tag rec">Recuperação</span>':w[2]==='peak'?'<span class="tag peak">Pico</span>':w[2]==='test'?'<span class="tag test">Teste 5 km</span>':`<span class="tag">${w[1]}</span>`;
    const s=(l,x,test)=>`<div class="s"><div class="l">${l}</div><p>${x[0]}${x[1]?` <span class="mini">(${x[1].replace(/^~?/,'~')})</span>`:''}</p></div>`;
    return `<article class="wk"><header><span class="num">${String(i+1).padStart(2,'0')}</span><span class="dt">Semana ${i+1} · ${w[0]}</span>${tag}</header>
      <div class="row">${s('Segunda · qualidade',w[3])}${s('Quarta · leve + técnica',w[4])}${s('Sábado · longão',w[5])}</div>
      <div class="mini" style="padding:10px 20px;border-top:1px solid var(--line)">Aquecimento e desaquecimento incluídos.</div></article>`;
  }).join('');
  const tot=W.map(w=>mins(w[3][1])+mins(w[4][1])+(mins(w[5][1])||0));
  const mx=Math.max(...tot);
  $('#vol').innerHTML=tot.map((t,i)=>`<div class="b ${W[i][2]==='rec'?'rec':W[i][2]==='peak'?'peak':''}"><span>${t}${i===9?'+':''}</span><i style="height:${t/mx*100*0.78}%"></i></div>`).join('');
  $('#vollab').innerHTML=tot.map((_,i)=>`<span>S${i+1}</span>`).join('');

  /* log */
  const DAYS=['Seg','Qua','Sáb'];
  const log=store.get('log',{});
  const lb=$('#logbody'); let lh='';
  for(let w=1;w<=10;w++)DAYS.forEach((d,j)=>{
    const k=`${w}-${d}`;
    lh+=`<tr data-k="${k}" class="${j===0?'wkstart':''}">`+
      (j===0?`<td class="wkc" rowspan="3">${w}</td>`:'')+
      `<td><b>${d}</b></td><td><input class="chk" type="checkbox" data-f="done" aria-label="Semana ${w} ${d} feito"></td>
      <td><input type="text" data-f="time" placeholder="mm:ss"></td>
      <td><input type="number" step="0.01" min="0" data-f="dist"></td>
      <td><input type="text" data-f="pace" placeholder="auto" readonly tabindex="-1"></td>
      <td><input type="number" min="40" max="230" data-f="hr"></td>
      <td><input type="number" min="1" max="10" data-f="rpe"></td>
      <td><input type="text" data-f="obs" style="min-width:160px"></td></tr>`;
  });
  lb.innerHTML=lh;

  /* registro em cartões (celular): só a semana atual fica aberta */
  const DAYFULL={'Seg':'Segunda','Qua':'Quarta','Sáb':'Sábado'};
  const curWeek=(()=>{
    const start=new Date(2026,9,19),now=new Date();now.setHours(0,0,0,0);
    const w=Math.floor((now-start)/(7*864e5))+1;
    return Math.min(10,Math.max(1,w));
  })();
  const cards=document.createElement('div');cards.id='logcards';cards.className='cards';
  let ch='';
  for(let w=1;w<=10;w++){
    ch+=`<details class="wk-card" data-w="${w}"${w===curWeek?' open':''}><summary><span class="wk-n">Semana ${w}</span><span class="wk-d">${W[w-1][0]}</span><span class="wk-c" data-wc="${w}">0/3</span></summary>`;
    DAYS.forEach(d=>{
      const k=`${w}-${d}`;
      ch+=`<div class="lc" data-k="${k}">
        <div class="lc-h"><b>${DAYFULL[d]}</b><label class="lc-done"><input class="chk" type="checkbox" data-f="done" aria-label="Semana ${w} ${DAYFULL[d]} feito"> Feito</label></div>
        <div class="lc-g">
          <label>Tempo total<input type="text" data-f="time" placeholder="mm:ss" inputmode="numeric"></label>
          <label>Distância (km)<input type="number" step="0.01" min="0" data-f="dist" inputmode="decimal"></label>
          <label>Ritmo médio<input type="text" data-f="pace" placeholder="auto" readonly tabindex="-1"></label>
          <label>FC média<input type="number" min="40" max="230" data-f="hr" inputmode="numeric"></label>
          <label>Esforço (1–10)<input type="number" min="1" max="10" data-f="rpe" inputmode="numeric"></label>
          <label class="full">Obs.<input type="text" data-f="obs"></label>
        </div></div>`;
    });
    ch+='</details>';
  }
  cards.innerHTML=ch;
  lb.closest('.tw').classList.add('log-table');
  lb.closest('.tw').after(cards);
  const sec=t=>{const p=t.trim().split(':').map(Number);if(p.some(isNaN)||!t.trim())return null;return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:null};
  const fmt=s=>{s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  function paint(){
    let n=0;
    $$('#logbody tr, #logcards .lc').forEach(tr=>{
      const d=log[tr.dataset.k]||{};
      tr.querySelectorAll('[data-f]').forEach(inp=>{
        const f=inp.dataset.f;
        if(f==='done')inp.checked=!!d.done;
        else if(f==='pace'){const t=sec(d.time||''),k=parseFloat(d.dist);inp.value=(t&&k>0)?fmt(t/k)+' /km':''}
        else if(document.activeElement!==inp)inp.value=d[f]||'';
      });
      tr.classList.toggle('done',!!d.done); if(d.done&&tr.tagName==='TR')n++;
    });
    for(let w=1;w<=10;w++){
      const c=DAYS.filter(d=>(log[w+'-'+d]||{}).done).length,s=document.querySelector(`[data-wc="${w}"]`);
      if(s){s.textContent=c+'/3';s.classList.toggle('full',c===3)}
    }
    $('#done-n').textContent=n; $('#meter').style.width=(n/30*100)+'%';
  }
  const onLog=e=>{
    const tr=e.target.closest('[data-k]'),f=e.target.dataset.f; if(!tr||!f||f==='pace')return;
    const k=tr.dataset.k; log[k]=log[k]||{}; log[k][f]=f==='done'?e.target.checked:e.target.value;
    store.set('log',log); paint();
  };
  lb.addEventListener('input',onLog);cards.addEventListener('input',onLog);
  $('#clear-log').addEventListener('click',()=>{
    if(confirm('Apagar todo o registro de treinos deste navegador?')){Object.keys(log).forEach(k=>delete log[k]);store.set('log',log);paint()}
  });
  paint();

  /* backup: exportar / importar */
  $('#export-data').addEventListener('click',()=>{
    const data={app:'ciclo1-corrida',version:1,exportedAt:new Date().toISOString(),
      log:store.get('log',{}),evo:store.get('evo',{}),age:store.get('age',''),runs:store.get('runs',[])};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='backup-corrida-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  $('#import-data').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',e=>{
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const d=JSON.parse(r.result);
        if(d.app!=='ciclo1-corrida'||typeof d.log!=='object'||typeof d.evo!=='object')throw 0;
        if(!confirm('Importar este backup vai substituir os dados atuais deste navegador. Continuar?'))return;
        store.set('log',d.log);store.set('evo',d.evo);store.set('age',d.age||'');if(Array.isArray(d.runs))store.set('runs',d.runs);
        location.reload();
      }catch(err){alert('Arquivo inválido: use um backup exportado por este site.')}
    };
    r.readAsText(f); e.target.value='';
  });

  /* ===== treino ao vivo (GPS + avisos) ===== */
  (function(){
    const R={state:'idle',dist:0,base:0,t0:null,scale:1,prevT:0,markT:0,nextDist:0,pts:[],splits:[],last:null,
      watch:null,tick:null,sim:null,lock:null,offKind:null,offSince:0,lastSpeak:-99,goalDone:false,count:null};
    const TARGETS={none:null,z1:[495,Infinity],z2:[450,495],z3:[410,440],z4:[375,400],z5:[345,365],rp:[350,360]};
    const TOL=5;
    const el=id=>document.getElementById(id);
    const stepKm=()=>{const m=parseFloat(el('r-intm').value);return m>0?m/1000:0};
    const stepT=()=>{const m=parseFloat(el('r-intt').value);return m>0?m*60:0};
    const distLabel=km=>{const m=Math.round(km*1000);if(m<1000)return m+' metros';const k=Math.floor(m/1000),r=m%1000;
      return k+(k>1?' quilômetros':' quilômetro')+(r?' e '+r+' metros':'')};
    const elapsed=()=>R.base+(R.t0?(Date.now()-R.t0)/1000*R.scale:0);
    const clock=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;
      return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0')};
    const pace=s=>(s&&isFinite(s)&&s>0&&s<3600)?Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0'):'--:--';
    const spoken=s=>{s=Math.round(s);const m=Math.floor(s/60),x=s%60;
      return (m?m+(m>1?' minutos':' minuto'):'')+(m&&x?' e ':'')+(x||!m?x+(x===1?' segundo':' segundos'):'')};
    const spokenLong=s=>{s=Math.round(s);const h=Math.floor(s/3600);return (h?h+(h>1?' horas e ':' hora e '):'')+spoken(s%3600)};
    const km2=m=>(m/1000).toFixed(2).replace('.',',');

    /* voz e vibração */
    function say(text,pattern){
      R.lastSpeak=elapsed();
      if(el('r-vib').checked&&pattern&&navigator.vibrate){try{navigator.vibrate(pattern)}catch(e){}}
      if(el('r-voice').checked&&'speechSynthesis' in window){
        try{
          speechSynthesis.cancel();
          const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=parseFloat(el('r-rate').value)||1;
          const vs=speechSynthesis.getVoices(),want=el('r-voicesel').value;
          const v=vs.find(v=>v.voiceURI===want)||vs.find(v=>/pt[-_]BR/i.test(v.lang));if(v)u.voice=v;
          speechSynthesis.speak(u);
        }catch(e){}
      }
    }
    const status=(t,alert)=>{const s=el('r-status');s.textContent=t;s.classList.toggle('alert',!!alert)};

    /* modos: corrida livre x treino de tiros */
    function setMode(m){
      const intv=m==='int';
      el('m-free').classList.toggle('on',!intv);el('m-int').classList.toggle('on',intv);
      el('m-free').setAttribute('aria-selected',String(!intv));el('m-int').setAttribute('aria-selected',String(intv));
      el('p-free').hidden=intv;el('p-int').hidden=!intv;el('l-pace').hidden=intv;
      store.set('runmode',m);
    }
    function setModeEnabled(on){el('m-free').disabled=!on;el('m-int').disabled=!on}
    el('m-free').addEventListener('click',()=>setMode('free'));
    el('m-int').addEventListener('click',()=>setMode('int'));
    document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{
      const [reps,rv,ru,sv,su]=b.dataset.p.split(',');
      el('r-reps').value=reps;el('r-runv').value=rv;el('r-runu').value=ru;el('r-restv').value=sv;el('r-restu').value=su;
      ['r-reps','r-runv','r-runu','r-restv','r-restu'].forEach(id=>el(id).dispatchEvent(new Event('change')));
    }));

    /* treino de tiros: fases */
    function buildPlan(){
      if(R.custom){
        const c=R.custom,p=[],tot=c.steps.length;
        if(c.wu>0)p.push({k:'warm',kind:'time',v:c.wu*60,label:'Aquecimento'});
        c.steps.forEach((s,i)=>{
          p.push({k:'run',kind:s.run.kind,v:s.run.v,label:'Tiro '+(i+1)+'/'+tot,i:i+1,reps:tot});
          if(s.rest)p.push({k:'rest',kind:s.rest.kind,v:s.rest.v,label:'Recuperação',verb:'Trote leve'});
        });
        if(c.cd>0)p.push({k:'cool',kind:'time',v:c.cd*60,label:'Desaquecimento'});
        return p;
      }
      const n=id=>parseFloat(el(id).value)||0,p=[];
      const wu=n('r-wu'),cd=n('r-cd'),reps=Math.max(1,Math.round(n('r-reps'))||1);
      const rv=n('r-runv')||1,ru=el('r-runu').value,sv=n('r-restv'),su=el('r-restu').value;
      if(wu>0)p.push({k:'warm',kind:'time',v:wu*60,label:'Aquecimento'});
      for(let i=1;i<=reps;i++){
        p.push({k:'run',kind:ru==='m'?'dist':'time',v:ru==='m'?rv:rv*60,label:'Tiro '+i+'/'+reps,i,reps});
        if(i<reps&&sv>0)p.push({k:'rest',kind:su==='m'?'dist':'time',v:su==='m'?sv:su==='s'?sv:sv*60,label:'Caminhar'});
      }
      if(cd>0)p.push({k:'cool',kind:'time',v:cd*60,label:'Desaquecimento'});
      return p;
    }
    const phDur=ph=>ph.kind==='dist'?distLabel(ph.v/1000):spoken(ph.v);
    const phShort=ph=>ph.kind==='dist'?Math.round(ph.v)+' m':clock(ph.v);
    function phaseText(ph){
      if(ph.k==='warm')return 'Aquecimento. '+phDur(ph)+' em ritmo leve.';
      if(ph.k==='run')return 'Tiro '+ph.i+' de '+ph.reps+'. Corra '+phDur(ph)+'.';
      if(ph.k==='rest')return (ph.verb||'Caminhe')+' por '+phDur(ph)+'.';
      return 'Desaquecimento. '+phDur(ph)+' em ritmo leve.';
    }
    function paintPhase(){
      const ph=R.plan[R.pi];if(!ph)return;
      el('r-phase').className='phase '+ph.k;
      el('r-ph-name').textContent=ph.label;
      const nx=R.plan[R.pi+1];
      el('r-ph-next').textContent=nx?'Depois: '+(nx.k==='run'?'correr ':nx.k==='rest'?(nx.verb?'trote ':'caminhar '):'')+phShort(nx):'Última fase';
    }
    function startPhase(prefix){
      const ph=R.plan[R.pi],now=elapsed();
      R.phT=now;R.phD=R.dist;R.warn={};
      paintPhase();
      status(phaseText(ph),false);
      say((prefix||'')+phaseText(ph),ph.k==='run'?[500,120,500]:ph.k==='rest'?[250]:[200]);
    }
    function intCheck(now){
      const ph=R.plan[R.pi];if(!ph)return;
      const done=ph.kind==='dist'?(R.dist-R.phD):(now-R.phT),left=ph.v-done;
      el('r-ph-left').textContent=ph.kind==='dist'?Math.max(0,Math.ceil(left))+' m':clock(Math.max(0,left));
      el('r-ph-bar').style.width=Math.min(100,done/ph.v*100)+'%';
      if(left<=0){endPhase(now,ph);return}
      if(ph.kind==='time'&&ph.v>=30&&left<=10&&!R.warn.t){R.warn.t=1;say(ph.k==='rest'?'Prepare-se. Dez segundos.':'Dez segundos.',[120])}
      if(ph.kind==='dist'&&ph.v>=300&&left<=100&&!R.warn.d){R.warn.d=1;say('Faltam cem metros.',[120])}
    }
    function endPhase(now,ph){
      const dk=(R.dist-R.phD)/1000;
      R.splits.push({label:ph.label,t:now-R.phT,total:now,step:dk});
      renderSplits();
      R.pi++;
      if(R.pi>=R.plan.length){doFinish();return}
      startPhase('');
    }
    /* ===== treino do dia, retomada e persistência ===== */
    let persistTick=0;
    function persist(){
      if(R.state!=='run'&&R.state!=='pause')return;
      store.set('runstate',{v:1,savedAt:Date.now(),mode:R.mode,state:R.state,elapsed:elapsed(),dist:R.dist,splits:R.splits,
        markT:R.markT,nextDist:R.nextDist,nextTime:R.nextTime,step:R.step,tStep:R.tStep,goalDone:R.goalDone,tGoalDone:R.tGoalDone,
        plan:R.plan,pi:R.pi,phT:R.phT,phD:R.phD,custom:R.custom||null,sim:el('r-sim').checked,scale:R.scale});
    }
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist()});
    window.addEventListener('pagehide',persist);

    function restore(s){
      R.mode=s.mode;R.dist=s.dist;R.base=s.elapsed;R.t0=null;R.splits=s.splits||[];R.markT=s.markT||0;R.prevT=s.elapsed;
      R.nextDist=s.nextDist==null?Infinity:s.nextDist;R.nextTime=s.nextTime==null?Infinity:s.nextTime;
      R.step=s.step||0;R.tStep=s.tStep||0;R.goalDone=!!s.goalDone;R.tGoalDone=!!s.tGoalDone;
      R.plan=s.plan||[];R.pi=s.pi||0;R.phT=s.phT||0;R.phD=s.phD||0;R.warn={};R.custom=s.custom||null;
      R.scale=s.scale||1;el('r-sim').checked=!!s.sim;
      R.pts=[];R.last=null;R.state='pause';R.needSensors=true;
      setMode(s.mode);setModeEnabled(false);
      if(R.mode==='int'){el('r-phase').hidden=false;paintPhase()}
      renderSplits();render();buttons();el('r-resume').hidden=true;
      status('Treino restaurado. Toque em Retomar para continuar.',false);
    }
    function checkResume(){
      const s=store.get('runstate',null);
      if(!s||Date.now()-s.savedAt>8*3600e3||!(s.state==='run'||s.state==='pause')){store.set('runstate',null);return}
      const at=new Date(s.savedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      el('r-resume-t').textContent=`Há um treino em andamento: ${clock(s.elapsed)} · ${km2(s.dist)} km (salvo às ${at}).`;
      el('r-resume').hidden=false;
      el('r-resume-yes').onclick=()=>restore(s);
      el('r-resume-no').onclick=()=>{store.set('runstate',null);el('r-resume').hidden=true};
    }

    const START=new Date(2026,9,19);
    const DFULL={'Seg':'Segunda','Qua':'Quarta','Sáb':'Sábado'};
    const mn=n=>({kind:'time',v:n*60}),sc=n=>({kind:'time',v:n}),mt=n=>({kind:'dist',v:n});
    const I=(r,run,rest)=>({t:'int',steps:Array.from({length:r},(_,i)=>({run,rest:i<r-1?rest:null}))});
    const F=(m,z,km)=>({t:'free',min:m,z:z||'z2',km:km||0});
    const SES={
      1:{'Seg':I(6,mn(2),mn(2)),'Qua':F(30),'Sáb':F(40)},
      2:{'Seg':I(8,mn(1),sc(90)),'Qua':F(30),'Sáb':F(45)},
      3:{'Seg':I(5,mn(3),mn(2)),'Qua':F(35),'Sáb':F(50)},
      4:{'Seg':I(4,mn(2),mn(2)),'Qua':F(30),'Sáb':I(3,mn(5),mn(2))},
      5:{'Seg':I(6,mt(400),mn(2)),'Qua':F(35),'Sáb':F(55)},
      6:{'Seg':I(3,mn(6),mn(2)),'Qua':F(40),'Sáb':F(60)},
      7:{'Seg':{t:'int',steps:[1,2,3,2,1].map((m,i,a)=>({run:mn(m),rest:i<a.length-1?mn(m):null}))},'Qua':F(40),'Sáb':F(60)},
      8:{'Seg':I(5,mn(2),mn(2)),'Qua':F(30),'Sáb':F(45)},
      9:{'Seg':I(2,mn(10),mn(3)),'Qua':F(35),'Sáb':I(4,mn(5),mn(2))},
      10:{'Seg':I(6,mn(1),sc(90)),'Qua':F(25),'Sáb':F(0,'rp',5)}
    };
    function nextSession(){
      const now=new Date();now.setHours(0,0,0,0);
      for(let i=0;i<90;i++){
        const d=new Date(now);d.setDate(now.getDate()+i);
        const off=Math.round((d-START)/864e5);if(off<0)continue;
        const w=Math.floor(off/7)+1;if(w>10)return null;
        const day={0:'Seg',2:'Qua',5:'Sáb'}[off%7];if(!day)continue;
        return{w,day,date:d,today:i===0};
      }
      return null;
    }
    let curSes=null;
    function showLoaded(txt){
      el('r-loaded').hidden=!txt;el('r-manual').hidden=!!txt;
      if(txt)el('r-loaded-t').textContent=txt;
    }
    function loadSession(w,day){
      if(R.state==='run'||R.state==='pause'||R.state==='count')return;
      const s=SES[w][day],txt=W[w-1][{'Seg':3,'Qua':4,'Sáb':5}[day]][0];
      if(s.t==='int'){
        R.custom={wu:10,cd:5,steps:s.steps};
        el('r-goal').value='';el('r-tgoal').value='';
        setMode('int');
        showLoaded(`Semana ${w} · ${DFULL[day]}: ${txt}. Inclui 10 min de aquecimento e 5 min de desaquecimento.`);
        status('Treino do plano carregado. Toque em Iniciar.',false);
      }else{
        R.custom=null;showLoaded(null);
        setMode('free');
        el('r-target').value=s.z;el('r-custom').hidden=true;
        el('r-tgoal').value=s.min||'';el('r-goal').value=s.km||'';
        status('Treino carregado: '+txt+'. Toque em Iniciar.',false);
      }
      window.scrollTo({top:0,behavior:'smooth'});
    }
    function renderToday(){
      const box=el('today'),n=nextSession();curSes=n;
      if(!n){box.hidden=false;el('td-k').textContent='Ciclo 1';el('td-t').textContent='Ciclo concluído';
        el('td-d').textContent='Volte com o novo tempo de 5 km para montar o Ciclo 2.';el('td-load').hidden=true;return}
      const idx={'Seg':3,'Qua':4,'Sáb':5}[n.day],info=W[n.w-1][idx];
      const done=(log[n.w+'-'+n.day]||{}).done;
      const dt=n.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
      const before=n.date<new Date(START.getTime()+1)&&!n.today&&n.w===1&&n.day==='Seg';
      el('td-k').textContent=(n.today?'Treino de hoje':'Próximo treino')+' · Semana '+n.w+' · '+DFULL[n.day]+(n.today?'':' '+dt);
      el('td-t').textContent=info[0].replace(/\s+/g,' ');
      el('td-d').textContent=(info[1]?'Duração '+info[1].replace(/^~/,'~')+' · ':'')+'Fase: '+W[n.w-1][1]+(done?' · ✓ já registrado':'');
      el('td-load').hidden=false;el('td-load').disabled=false;
    }
    el('td-load').addEventListener('click',()=>{if(curSes)loadSession(curSes.w,curSes.day)});
    el('r-loaded-x').addEventListener('click',()=>{R.custom=null;showLoaded(null)});
    ['r-reps','r-runv','r-runu','r-restv','r-restu','r-wu','r-cd'].forEach(id=>el(id).addEventListener('input',()=>{R.custom=null;showLoaded(null)}));
    /* alvo */
    function target(){
      const k=el('r-target').value;
      if(k==='custom'){const a=sec(el('r-min').value),b=sec(el('r-max').value);return(a&&b)?[Math.min(a,b),Math.max(a,b)]:null}
      return TARGETS[k]||null;
    }
    el('r-target').addEventListener('change',()=>{el('r-custom').hidden=el('r-target').value!=='custom'});

    /* distância */
    const rad=x=>x*Math.PI/180;
    function hav(a,b){
      const R0=6371000,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);
      const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
      return 2*R0*Math.asin(Math.sqrt(h));
    }
    function onFix(p){
      if(R.state!=='run'||p.acc>35)return;
      const now=elapsed();
      if(!R.last){R.last={lat:p.lat,lon:p.lon,t:now};return}
      const d=hav(R.last,p),dt=now-R.last.t;
      if(d<4)return;                       // ruído do GPS parado
      if(dt<=0||d/dt>12)return;            // salto impossível (>43 km/h)
      R.last={lat:p.lat,lon:p.lon,t:now};
      addDist(d);
    }
    function addDist(d){
      const now=elapsed(),prev=R.dist;
      R.dist+=d; R.pts.push({t:now,d:R.dist});
      const stepM=R.step*1000;
      while(R.dist>=R.nextDist){
        const tc=R.prevT+(R.nextDist-prev)/(R.dist-prev)*(now-R.prevT);
        const st=tc-R.markT; R.markT=tc;
        R.splits.push({t:st,total:tc,km:R.nextDist/1000,step:R.step});
        R.nextDist+=stepM;
        announceSplit(st);
        renderSplits();
      }
      R.prevT=now;
      const goal=parseFloat(el('r-goal').value);
      if(goal>0&&!R.goalDone&&R.dist>=goal*1000){
        R.goalDone=true;
        say('Meta de '+String(goal).replace('.',',')+' quilômetros atingida. Parabéns!',[600,150,600]);
      }
    }
    function announceSplit(st){
      const km=R.splits.length*R.step,lab=distLabel(km),pc=st/R.step;
      status(lab+' · '+pace(pc)+' /km',false);
      say(lab+'. Tempo do trecho, '+spoken(st)+'. Ritmo médio, '+spoken(R.markT/km)+' por quilômetro. Tempo total, '+spokenLong(R.markT)+'.',[350,120,350]);
    }
    function currentPace(now){
      R.pts=R.pts.filter(p=>p.t>=now-120);
      const w=R.pts.find(p=>p.t>=now-30);
      if(!w)return null;
      const dd=R.dist-w.d,dt=now-w.t;
      return(dd>=15&&dt>=8)?dt/(dd/1000):null;
    }

    /* tela */
    function render(){
      const now=elapsed(),cp=R.state==='run'?currentPace(now):null;
      el('r-time').textContent=clock(now);
      el('r-dist').textContent=km2(R.dist);
      el('r-pace').textContent=pace(cp);
      el('r-avg').textContent=R.dist>50?pace(now/(R.dist/1000)):'--:--';
      const ls=R.splits[R.splits.length-1];
      el('r-last').textContent=ls?pace(ls.t/ls.step):'--:--';
      if(R.state==='run'){if(R.mode==='int')intCheck(now);else{paceCheck(now,cp);timeCheck(now)}mediaUpdate(now,cp);if(++persistTick%4===0)persist()}
    }
    function timeCheck(now){
      if(now>=R.nextTime){
        const k=Math.floor(now/R.tStep),t=k*R.tStep;R.nextTime=(k+1)*R.tStep;
        const avg=R.dist>50?' Ritmo médio, '+spoken(now/(R.dist/1000))+' por quilômetro.':'';
        status(clock(t)+' · '+km2(R.dist)+' km',false);
        say(spokenLong(t)+' de treino. Distância, '+distLabel(R.dist/1000)+'.'+avg,[350,120,350]);
      }
      const tg=parseFloat(el('r-tgoal').value);
      if(tg>0&&!R.tGoalDone&&now>=tg*60){R.tGoalDone=true;say('Meta de tempo de '+tg+' minutos atingida. Parabéns!',[600,150,600])}
    }

    /* tela de bloqueio: áudio silencioso mantém a página viva e o Media Session mostra o treino */
    let keep=null,mediaTick=0;
    function silentWav(){
      const sr=8000,n=sr,b=new Uint8Array(44+n),dv=new DataView(b.buffer);
      const w=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i))};
      w(0,'RIFF');dv.setUint32(4,36+n,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
      dv.setUint32(24,sr,true);dv.setUint32(28,sr,true);dv.setUint16(32,1,true);dv.setUint16(34,8,true);w(36,'data');dv.setUint32(40,n,true);
      for(let i=0;i<n;i++)b[44+i]=128+(i%2);
      return URL.createObjectURL(new Blob([b],{type:'audio/wav'}));
    }
    function keepAlive(on){
      try{
        if(on){if(!keep){keep=new Audio(silentWav());keep.loop=true;keep.volume=0.02}keep.play().catch(()=>{})}
        else if(keep)keep.pause();
      }catch(e){}
      if('mediaSession' in navigator){
        try{
          if(on){
            navigator.mediaSession.setActionHandler('play',()=>el('r-pause').click());
            navigator.mediaSession.setActionHandler('pause',()=>el('r-pause').click());
          }else{navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none'}
        }catch(e){}
      }
    }
    function mediaUpdate(now,cp){
      if(!('mediaSession' in navigator)||typeof MediaMetadata==='undefined')return;
      if(++mediaTick%4)return;
      try{
        navigator.mediaSession.metadata=new MediaMetadata({
          title:clock(now)+' · '+km2(R.dist)+' km',
          artist:'Ritmo '+pace(cp)+' /km',
          album:'Cycle · Treino'});
        navigator.mediaSession.playbackState=R.state==='run'?'playing':'paused';
      }catch(e){}
    }
    function paceCheck(now,cp){
      const t=target();
      if(R.mode==='int'||!t||!el('r-pacealert').checked||cp==null||now<45||R.dist<100)return;
      const kind=cp<t[0]-TOL?'fast':cp>t[1]+TOL?'slow':null;
      if(!kind){R.offKind=null;return}
      if(R.offKind!==kind){R.offKind=kind;R.offSince=now;return}
      if(now-R.offSince>=10&&now-R.lastSpeak>=25){
        if(kind==='fast'){status('Rápido demais: '+pace(cp)+' /km',true);say('Reduza o ritmo. Você está em '+spoken(cp)+' por quilômetro.',[120,80,120])}
        else{status('Devagar demais: '+pace(cp)+' /km',true);say('Acelere um pouco. Você está em '+spoken(cp)+' por quilômetro.',[700])}
      }
    }
    function renderSplits(){
      const b=el('r-splits');
      if(!R.splits.length){b.innerHTML='<tr><td colspan="4" class="mini">As parciais aparecem aqui durante o treino.</td></tr>';return}
      b.innerHTML=R.splits.map((s,i)=>`<tr><td><b>${s.label||String(s.km).replace('.',',')+' km'}</b></td><td class="mono">${clock(s.t)}</td><td class="mono">${pace(s.t/s.step)} /km</td><td class="mono">${clock(s.total)}</td></tr>`).reverse().join('');
    }
    function buttons(){
      const s=R.state;
      el('r-start').hidden=!(s==='idle'||s==='done');
      el('r-start').textContent=s==='done'?'Novo treino':'Iniciar';
      el('r-pause').hidden=!(s==='run'||s==='pause');
      el('r-pause').textContent=s==='pause'?'Retomar':'Pausar';
      el('r-finish').hidden=!(s==='run'||s==='pause');
    }

    /* tela sempre ligada */
    async function lock(){try{if('wakeLock' in navigator)R.lock=await navigator.wakeLock.request('screen')}catch(e){}}
    function unlock(){try{R.lock&&R.lock.release()}catch(e){}R.lock=null}
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&(R.state==='run'||R.state==='pause'))lock()});

    /* controle */
    function reset(){
      R.dist=0;R.base=0;R.t0=null;R.prevT=0;R.markT=0;R.nextDist=Infinity;R.nextTime=Infinity;R.step=0;R.tStep=0;R.tGoalDone=false;
      R.pts=[];R.splits=[];R.last=null;
      R.offKind=null;R.lastSpeak=-99;R.goalDone=false;
      R.mode=R.mode||'free';R.plan=[];R.pi=0;
      el('r-summary').hidden=true;el('r-phase').hidden=true;renderSplits();render();
    }
    function startSensors(){
      if(el('r-sim').checked){
        R.sim=setInterval(()=>{
          if(R.state!=='run')return;
          const now=elapsed(),p=360+40*Math.sin(now/90);     // ~6:00/km oscilando
          addDist(1000/p*0.5*R.scale);
        },500);
      }else{
        R.watch=navigator.geolocation.watchPosition(
          pos=>onFix({lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy}),
          err=>status(err.code===1?'Localização negada. Permita o GPS nas configurações do navegador.':'Sem sinal de GPS. Vá para um local aberto.',true),
          {enableHighAccuracy:true,maximumAge:0,timeout:20000});
      }
      R.tick=setInterval(render,500);
      lock();
    }
    function begin(){
      R.state='run';R.scale=el('r-sim').checked?10:1;R.t0=Date.now();R.prevT=0;
      R.mode=el('m-int').classList.contains('on')?'int':'free';
      R.step=R.mode==='int'?0:stepKm();R.tStep=R.mode==='int'?0:stepT();
      R.nextDist=R.step>0?R.step*1000:Infinity;R.nextTime=R.tStep>0?R.tStep:Infinity;R.tGoalDone=false;
      startSensors();
      buttons();status('Treino em andamento',false);
      if(R.mode==='int'){R.plan=buildPlan();R.pi=0;el('r-phase').hidden=false;startPhase('Treino iniciado. ')}
      else say('Treino iniciado.',[200]);
    }
    el('r-start').addEventListener('click',()=>{
      if(R.state==='done')reset();
      if(!el('r-sim').checked&&!('geolocation' in navigator)){status('Este navegador não tem GPS. Use a opção de simulação para testar.',true);return}
      R.state='count';buttons();setModeEnabled(false);status('Prepare-se…',false);
      keepAlive(true);
      if('speechSynthesis' in window&&el('r-voice').checked){try{speechSynthesis.cancel()}catch(e){}}
      say('Preparar. Três, dois, um, vai!',[150,100,150,100,400]);
      R.count=setTimeout(begin,4000);
    });
    el('r-pause').addEventListener('click',()=>{
      if(R.state==='run'){
        R.base=elapsed();R.t0=null;R.state='pause';
        status('Pausado',false);say('Treino pausado.',[300]);persist();
      }else if(R.state==='pause'){
        R.t0=Date.now();R.state='run';R.last=null;R.pts=[];R.prevT=R.base;R.offKind=null;
        if(R.needSensors){R.needSensors=false;startSensors();keepAlive(true)}
        status('Treino em andamento',false);say('Treino retomado.',[200,100,200]);
      }
      buttons();
    });
    el('r-finish').addEventListener('click',()=>{if(confirm('Finalizar o treino?'))doFinish()});
    function doFinish(){
      if(R.state==='done')return;
      const total=elapsed();
      R.t0=null;R.base=total;R.state='done';
      clearInterval(R.tick);clearInterval(R.sim);
      if(R.watch!=null)navigator.geolocation.clearWatch(R.watch);R.watch=null;unlock();keepAlive(false);
      render();buttons();
      const avg=R.dist>0?total/(R.dist/1000):0;
      el('r-sum-txt').textContent=`Treino finalizado: ${km2(R.dist)} km em ${clock(total)} · ritmo médio ${pace(avg)} /km`;
      el('r-summary').hidden=false;
      status('Treino finalizado',false);
      say('Treino finalizado. '+km2(R.dist).replace(',',' vírgula ')+' quilômetros em '+spokenLong(total)+'. Ritmo médio, '+spoken(avg)+' por quilômetro.',[600,200,600]);
      const runs=store.get('runs',[]);
      runs.unshift({d:new Date().toISOString(),dist:+(R.dist/1000).toFixed(2),time:Math.round(total)});
      store.set('runs',runs.slice(0,30));renderHist();fillSlots();
      el('r-phase').hidden=true;setModeEnabled(true);
      store.set('runstate',null);R.custom=null;showLoaded(null);renderToday();
    }
    window.addEventListener('beforeunload',e=>{if(R.state==='run'||R.state==='pause'){e.preventDefault();e.returnValue=''}});

    /* salvar no registro */
    function fillSlots(){
      const s=el('r-slot');let opts='',first=null;
      for(let w=1;w<=10;w++)DAYS.forEach(d=>{const k=w+'-'+d;const done=(log[k]||{}).done;if(!done&&!first)first=k;
        opts+=`<option value="${k}">Semana ${w} · ${d}${done?' (feito)':''}</option>`});
      s.innerHTML=opts;if(first)s.value=first;
    }
    el('r-save').addEventListener('click',()=>{
      const k=el('r-slot').value;if(!k)return;
      log[k]=Object.assign(log[k]||{},{done:true,time:clock(R.base),dist:(R.dist/1000).toFixed(2)});
      store.set('log',log);paint();fillSlots();renderToday();
      status('Salvo no registro: semana '+k.replace('-',' · '),false);
    });

    function renderHist(){
      const runs=store.get('runs',[]);
      if(!runs.length)return;
      el('r-hist').innerHTML=runs.slice(0,8).map(r=>{
        const dt=new Date(r.d);
        return `<tr><td class="mono">${dt.toLocaleDateString('pt-BR')} ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td>
          <td class="mono">${String(r.dist.toFixed(2)).replace('.',',')} km</td><td class="mono">${clock(r.time)}</td>
          <td class="mono">${r.dist>0?pace(r.time/r.dist):'--:--'} /km</td></tr>`}).join('');
    }
    /* vozes disponíveis + teste */
    function loadVoices(){
      if(!('speechSynthesis' in window))return;
      const all=speechSynthesis.getVoices(),pt=all.filter(v=>/^pt/i.test(v.lang)),list=pt.length?pt:all;
      const sel=el('r-voicesel'),cur=sel.value||prefs['r-voicesel']||'';
      sel.innerHTML='<option value="">Padrão do aparelho</option>'+list.map(v=>`<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`).join('');
      if([...sel.options].some(o=>o.value===cur))sel.value=cur;
    }
    el('r-voicetest').addEventListener('click',()=>say('Quilômetro 1. Tempo do trecho, 6 minutos e 2 segundos. Ritmo médio, 6 minutos e 2 segundos por quilômetro.',[300]));

    /* lembrar configurações */
    const PREF=['r-wu','r-reps','r-runv','r-runu','r-restv','r-restu','r-cd','r-target','r-min','r-max','r-intm','r-intt','r-goal','r-tgoal','r-voice','r-vib','r-pacealert','r-voicesel','r-rate'];
    const prefs=store.get('runprefs',{});
    PREF.forEach(id=>{
      const x=el(id);if(prefs[id]==null)return;
      if(x.type==='checkbox')x.checked=!!prefs[id];else x.value=prefs[id];
      x.dispatchEvent(new Event('change'));
    });
    PREF.forEach(id=>el(id).addEventListener('change',()=>{
      const x=el(id);prefs[id]=x.type==='checkbox'?x.checked:x.value;store.set('runprefs',prefs);
    }));
    loadVoices();
    if('speechSynthesis' in window)speechSynthesis.addEventListener('voiceschanged',loadVoices);

    setMode(store.get('runmode','free'));renderToday();checkResume();
    reset();buttons();fillSlots();renderHist();
    if(!('vibrate' in navigator))el('r-vib').parentElement.title='Este aparelho/navegador não vibra';
  })();

  /* evolution */
  const EV=[['Início','19/10'],['Fim da semana 4','14/11'],['Fim da semana 8','12/12'],['Teste final (sem. 10)','26/12']];
  const evd=store.get('evo',{'0':{kg:'112',t5:'~31:00'}});
  $('#evobody').innerHTML=EV.map((r,i)=>`<tr data-i="${i}"><td><b>${r[0]}</b></td><td class="mono">${r[1]}</td>
    <td><input type="text" data-f="kg"></td><td><input type="text" data-f="t5" placeholder="mm:ss"></td>
    <td><input type="text" data-f="rhr" placeholder="bpm"></td><td><input type="text" data-f="feel" style="min-width:200px"></td></tr>`).join('');
  $$('#evobody tr').forEach(tr=>tr.querySelectorAll('[data-f]').forEach(inp=>inp.value=(evd[tr.dataset.i]||{})[inp.dataset.f]||''));
  $('#evobody').addEventListener('input',e=>{
    const tr=e.target.closest('tr'),f=e.target.dataset.f;if(!f)return;
    evd[tr.dataset.i]=evd[tr.dataset.i]||{};evd[tr.dataset.i][f]=e.target.value;store.set('evo',evd);
  });
  $('#t5').addEventListener('input',e=>{
    const t=sec(e.target.value);$('#p5').textContent=t?fmt(t/5):'—';
  });
})();
