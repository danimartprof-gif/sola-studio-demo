/* ===== SOLA — shared front-end (multi-page) ===== */
const SUPA_URL='https://supabasekong-wckks4gsg8owkososoo8sosg.128.140.44.162.sslip.io';
const SUPA_KEY='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2ODkwNjQ0MCwiZXhwIjo0OTI0NTgwMDQwLCJyb2xlIjoiYW5vbiJ9.aePQztzDdhmgXjPlJ9zxh4_Qf5ex7Au7UyEiF_jzXK0';
const SUPA_H={apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY,'Content-Type':'application/json'};

/* ---- live content from CMS ---- */
function applyCMS(cms){
  if(!cms)return;
  if(cms.accent){document.documentElement.style.setProperty('--gold',cms.accent);document.documentElement.style.setProperty('--yellow',cms.accent);}
  document.querySelectorAll('[data-cms]').forEach(el=>{const k=el.dataset.cms;if(cms[k]!=null&&cms[k]!=='')el.textContent=cms[k];});
  if(cms.seoTitle)document.title=cms.seoTitle;
  if(cms.seoDescription){const m=document.querySelector('meta[name="description"]');if(m)m.setAttribute('content',cms.seoDescription);}
}
(async function(){
  try{
    const r=await fetch(`${SUPA_URL}/rest/v1/sola_cms?id=eq.site&select=data`,{headers:{apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY}});
    const j=await r.json(); applyCMS(j&&j[0]&&j[0].data);
  }catch(e){ try{applyCMS(JSON.parse(localStorage.getItem('sola_cms')||'{}'))}catch(_){} }
})();

/* ---- loader (home only) ---- */
const loaderEl=document.getElementById('loader');
window.addEventListener('load',()=>{
  if(loaderEl){
    const tl=gsap.timeline();
    tl.to('#loader .l-word span',{y:0,duration:1,ease:'expo.out',delay:.2})
      .to('#loader .l-sun',{width:60,height:60,duration:.8,ease:'expo.out'},'-=.4')
      .to('#loader',{yPercent:-100,duration:1,ease:'expo.inOut',delay:.3})
      .add(()=>loaderEl.style.display='none');
  }
});

/* ---- Lenis smooth scroll + GSAP ---- */
const lenis=new Lenis({lerp:.09,smoothWheel:true});
function raf(t){lenis.raf(t);requestAnimationFrame(raf)}
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll',ScrollTrigger.update);
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id&&id.length>1&&id.startsWith('#')){const t=document.querySelector(id);if(t){e.preventDefault();lenis.scrollTo(id,{offset:-20})}}});
});

/* ---- reveal on scroll ---- */
gsap.utils.toArray('.reveal').forEach(el=>{
  gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 90%'}});
});

/* ---- marquee (if present) ---- */
if(document.querySelector('.marquee .track')){
  gsap.to('.marquee .track',{xPercent:-50,repeat:-1,duration:24,ease:'none'});
}

/* ---- packages accordion (if present) ---- */
document.querySelectorAll('.pk-item').forEach(item=>{
  item.addEventListener('click',()=>{
    const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.pk-item').forEach(i=>i.classList.remove('open'));
    if(!wasOpen)item.classList.add('open');
    ScrollTrigger.refresh();
  });
});

/* ---- custom cursor ---- */
(function(){
  const ring=document.querySelector('.cursor-ring');
  if(!ring)return;
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  (function loop(){rx+=(mx-rx)*.32;ry+=(my-ry)*.32;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop)})();
  document.querySelectorAll('[data-cursor]').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('is-hover'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('is-hover'));
  });
})();

/* ---- demo form feedback (if present) ---- */
(function(){
  const b=document.querySelector('form .submit');
  if(b)b.addEventListener('click',()=>{b.innerHTML="Thank you — we'll be in touch ✦";});
})();

/* ---- inline visual editor (if present) ---- */
(function(){
  const btn=document.getElementById('editBtn');
  if(!btn)return;
  const accentI=document.getElementById('editAccent'),toast=document.getElementById('editToast');
  let pass=null;
  function hex(){return (getComputedStyle(document.documentElement).getPropertyValue('--gold').trim())||'#ddba6a';}
  function showToast(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);}
  btn.addEventListener('click',()=>{
    const p=prompt('Enter the admin password to edit this page:');
    if(p==null)return; pass=p;
    document.body.classList.add('editing');
    try{accentI.value=hex();}catch(e){}
    document.querySelectorAll('[data-cms]').forEach(el=>{el.setAttribute('contenteditable','true');el.spellcheck=false;});
    try{lenis.stop();}catch(e){}
  });
  accentI.addEventListener('input',()=>{document.documentElement.style.setProperty('--gold',accentI.value);document.documentElement.style.setProperty('--yellow',accentI.value);});
  document.getElementById('editCancel').addEventListener('click',()=>location.reload());
  document.getElementById('editSave').addEventListener('click',async()=>{
    const d={accent:accentI.value};
    document.querySelectorAll('[data-cms]').forEach(el=>{d[el.dataset.cms]=el.textContent.trim();});
    let existing={};
    try{const g=await fetch(`${SUPA_URL}/rest/v1/sola_cms?id=eq.site&select=data`,{headers:SUPA_H});const j=await g.json();if(j&&j[0]&&j[0].data)existing=j[0].data;}catch(e){}
    const merged=Object.assign({},existing,d);
    try{
      const r=await fetch(`${SUPA_URL}/rest/v1/rpc/sola_cms_save`,{method:'POST',headers:SUPA_H,body:JSON.stringify({p_pass:pass,p_data:merged})});
      if(r.ok){document.body.classList.remove('editing');document.querySelectorAll('[data-cms]').forEach(el=>el.removeAttribute('contenteditable'));try{lenis.start();}catch(e){}showToast('✓ Saved & published');}
      else{showToast('✗ Wrong password');}
    }catch(e){showToast('✗ Network error');}
  });
})();
