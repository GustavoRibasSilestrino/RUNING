(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };

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
  const sec=t=>{const p=t.trim().split(':').map(Number);if(p.some(isNaN)||!t.trim())return null;return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:null};
  const fmt=s=>{s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  function paint(){
    let n=0;
    $$('#logbody tr').forEach(tr=>{
      const d=log[tr.dataset.k]||{};
      tr.querySelectorAll('[data-f]').forEach(inp=>{
        const f=inp.dataset.f;
        if(f==='done')inp.checked=!!d.done;
        else if(f==='pace'){const t=sec(d.time||''),k=parseFloat(d.dist);inp.value=(t&&k>0)?fmt(t/k)+' /km':''}
        else if(document.activeElement!==inp)inp.value=d[f]||'';
      });
      tr.classList.toggle('done',!!d.done); if(d.done)n++;
    });
    $('#done-n').textContent=n; $('#meter').style.width=(n/30*100)+'%';
  }
  lb.addEventListener('input',e=>{
    const tr=e.target.closest('tr'),f=e.target.dataset.f; if(!f||f==='pace')return;
    const k=tr.dataset.k; log[k]=log[k]||{}; log[k][f]=f==='done'?e.target.checked:e.target.value;
    store.set('log',log); paint();
  });
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
    const stepKm=()=>parseFloat(el('r-int').value)||1;
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
          const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=1.0;
          const v=speechSynthesis.getVoices().find(v=>/pt[-_]BR/i.test(v.lang));if(v)u.voice=v;
          speechSynthesis.speak(u);
        }catch(e){}
      }
    }
    const status=(t,alert)=>{const s=el('r-status');s.textContent=t;s.classList.toggle('alert',!!alert)};

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
      const stepM=stepKm()*1000;
      while(R.dist>=R.nextDist){
        const tc=R.prevT+(R.nextDist-prev)/(R.dist-prev)*(now-R.prevT);
        const st=tc-R.markT; R.markT=tc;
        R.splits.push({t:st,total:tc,km:R.nextDist/1000});
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
      const n=R.splits.length,km=n*stepKm(),avg=R.markT/(R.dist/1000||1);
      const lab=Number.isInteger(km)?km+(km>1?' quilômetros':' quilômetro'):String(km).replace('.',',')+' quilômetro';
      const pc=st/stepKm();
      status(lab+' · '+pace(pc)+' /km',false);
      say(lab+'. Tempo do trecho, '+spoken(st)+'. Ritmo médio, '+spoken(R.markT/(km||1))+' por quilômetro. Tempo total, '+spokenLong(R.markT)+'.',[350,120,350]);
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
      el('r-last').textContent=ls?pace(ls.t/stepKm()):'--:--';
      if(R.state==='run')paceCheck(now,cp);
    }
    function paceCheck(now,cp){
      const t=target();
      if(!t||!el('r-pacealert').checked||cp==null||now<45||R.dist<100)return;
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
      b.innerHTML=R.splits.map((s,i)=>`<tr><td><b>${String(s.km).replace('.',',')} km</b></td><td class="mono">${clock(s.t)}</td><td class="mono">${pace(s.t/stepKm())} /km</td><td class="mono">${clock(s.total)}</td></tr>`).reverse().join('');
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
      R.dist=0;R.base=0;R.t0=null;R.prevT=0;R.markT=0;R.nextDist=stepKm()*1000;R.pts=[];R.splits=[];R.last=null;
      R.offKind=null;R.lastSpeak=-99;R.goalDone=false;
      el('r-summary').hidden=true;renderSplits();render();
    }
    function begin(){
      R.state='run';R.scale=el('r-sim').checked?10:1;R.t0=Date.now();R.prevT=0;
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
      lock();buttons();status('Treino em andamento',false);
      say('Treino iniciado.',[200]);
    }
    el('r-start').addEventListener('click',()=>{
      if(R.state==='done')reset();
      if(!el('r-sim').checked&&!('geolocation' in navigator)){status('Este navegador não tem GPS. Use a opção de simulação para testar.',true);return}
      R.state='count';buttons();status('Prepare-se…',false);
      if('speechSynthesis' in window&&el('r-voice').checked){try{speechSynthesis.cancel()}catch(e){}}
      say('Preparar. Três, dois, um, vai!',[150,100,150,100,400]);
      R.count=setTimeout(begin,4000);
    });
    el('r-pause').addEventListener('click',()=>{
      if(R.state==='run'){
        R.base=elapsed();R.t0=null;R.state='pause';
        status('Pausado',false);say('Treino pausado.',[300]);
      }else if(R.state==='pause'){
        R.t0=Date.now();R.state='run';R.last=null;R.pts=[];R.prevT=R.base;R.offKind=null;
        status('Treino em andamento',false);say('Treino retomado.',[200,100,200]);
      }
      buttons();
    });
    el('r-finish').addEventListener('click',()=>{
      if(!confirm('Finalizar o treino?'))return;
      const total=elapsed();
      R.t0=null;R.base=total;R.state='done';
      clearInterval(R.tick);clearInterval(R.sim);
      if(R.watch!=null)navigator.geolocation.clearWatch(R.watch);R.watch=null;unlock();
      render();buttons();
      const avg=R.dist>0?total/(R.dist/1000):0;
      el('r-sum-txt').textContent=`Treino finalizado: ${km2(R.dist)} km em ${clock(total)} · ritmo médio ${pace(avg)} /km`;
      el('r-summary').hidden=false;
      status('Treino finalizado',false);
      say('Treino finalizado. '+km2(R.dist).replace(',',' vírgula ')+' quilômetros em '+spokenLong(total)+'. Ritmo médio, '+spoken(avg)+' por quilômetro.',[600,200,600]);
      const runs=store.get('runs',[]);
      runs.unshift({d:new Date().toISOString(),dist:+(R.dist/1000).toFixed(2),time:Math.round(total)});
      store.set('runs',runs.slice(0,30));renderHist();fillSlots();
    });
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
      store.set('log',log);paint();fillSlots();
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
