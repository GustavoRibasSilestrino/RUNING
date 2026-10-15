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

  /* theme */
  const root=document.documentElement;
  const savedTheme=store.get('theme',null); if(savedTheme) root.dataset.theme=savedTheme;
  $('#theme').addEventListener('click',()=>{
    const dark=root.dataset.theme==='dark'||(!root.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme=dark?'light':'dark'; store.set('theme',root.dataset.theme);
  });

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
