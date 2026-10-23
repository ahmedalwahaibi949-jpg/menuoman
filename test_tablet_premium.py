import asyncio,sys
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/31fb2f4c-4220-5253-be8b-fd8fcc2ff16f/scratchpad/'
URL=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/menuoman/index.html'
ok=0;bad=[]
def chk(c,msg):
  global ok
  if c: ok+=1
  else: bad.append(msg)
async def st(pg): return await pg.evaluate("sRunner._api.state()")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for vp,tag in [({'width':820,'height':1180},'tablet'),({'width':390,'height':844},'phone'),({'width':1440,'height':900},'desktop')]:
      pg=await b.new_page(viewport=vp,has_touch=(tag!='desktop'));errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(URL);await pg.wait_for_timeout(600)
      chk(await pg.evaluate("KINDS.tab.list.length===12&&new Set(PGT.map(d=>d.L)).size===12"),f'{tag} 12 unique designs')
      ids=await pg.evaluate("PGT.map(d=>d.id)")
      if tag!='tablet': ids=ids[::4]
      for id in ids:
        await pg.evaluate(f"location.hash='{id}'");await pg.wait_for_timeout(300)
        s=await st(pg);chk(s['intro'] or id=='',f'{tag} {id} intro plays')
        await pg.click('.single .tw .intro');await pg.wait_for_timeout(1000)
        s=await st(pg);chk(not s['intro'],f'{tag} {id} intro skip on tap')
        fit=await pg.evaluate("(()=>{const w=document.querySelector('.single .tw'),h=w.parentNode.getBoundingClientRect(),r=w.getBoundingClientRect();return r.width<=h.width+2&&r.height<=h.height+2&&r.width>200})()")
        chk(fit,f'{tag} {id} fits screen')
        for ci in [0,1,2]:
          if ci:
            await pg.click(f'.single .tw .hm .tcn [data-cat="{ci}"]');await pg.wait_for_timeout(1300)
          s=await st(pg);chk(s['ci']==ci and s['cur'] is None,f'{tag} {id} cat {ci} -> {s["ci"]}')
          k=s['items'][1]
          await pg.evaluate(f"sRunner._api.open('{k}')");await pg.wait_for_timeout(1300)
          s=await st(pg);chk(s['cur']==k,f'{tag} {id} open')
          vis=await pg.evaluate("(()=>{const i=document.querySelector('.single .tw .dt .thr img');if(!i)return 'nohero';return getComputedStyle(i).visibility==='visible'})()")
          chk(vis in (True,'nohero'),f'{tag} {id} hero visible')
          chk(await pg.evaluate("!document.querySelector('.single .tw .tfly')"),f'{tag} {id} no stuck flyer')
          if tag=='tablet' and ci==1: await pg.screenshot(path=S+f'T_{id}.png')
          await pg.click('.single .tw [data-step="1"]');await pg.wait_for_timeout(1500)
          s=await st(pg);chk(s['cur']==s['items'][2],f'{tag} {id} next')
          await pg.click('.single .tw [data-step="-1"]');await pg.wait_for_timeout(1500)
          s=await st(pg);chk(s['cur']==s['items'][1],f'{tag} {id} prev')
          await pg.click('.single .tw [data-tback]');await pg.wait_for_timeout(1300)
          s=await st(pg);chk(s['cur'] is None and s['busy']==0,f'{tag} {id} back')
          chk(await pg.evaluate("[...document.querySelectorAll('.single .tw .hm .ph')].every(p=>p.style.visibility!=='hidden')"),f'{tag} {id} photos restored')
        # real tap on an item
        tap=await pg.evaluate("""(()=>{const w=document.querySelector('.single .tw');const L=sRunner&&byId[location.hash.slice(1)].L;
          const sel={P2:'.cs .ti',P6:'.cd.top .ti',P11:'.mmore'}[L]||'.hm .ti';let el=[...w.querySelectorAll(sel)];
          if(L==='P2'){const f=w._p2.front();el=el.filter(e=>e.dataset.k===f)}
          if(L==='P11'){w.querySelector('.msc').scrollTop=1024}
          el=el.find(e=>{const r=e.getBoundingClientRect();return r.width>20&&r.top>0&&r.bottom<innerHeight});if(!el)return null;el.setAttribute('data-tap','1');return L})()""")
        await pg.wait_for_timeout(700)
        if tap:
          await pg.click('[data-tap="1"]',force=True);await pg.wait_for_timeout(1300)
          s=await st(pg);chk(s['cur'] is not None,f'{tag} {id} real tap opens ({tap})')
          await pg.keyboard.press('Escape');await pg.wait_for_timeout(1300)
          s=await st(pg);chk(s['cur'] is None,f'{tag} {id} esc back')
        else: chk(False,f'{tag} {id} no tappable item')
        # stress: rapid actions
        await pg.evaluate("(()=>{const A=sRunner._api;const k=A.state().items[0];A.open(k);A.back();A.step(1);A.cat(2);A.open(k);A.cat(0)})()");await pg.wait_for_timeout(2000)
        await pg.evaluate("sRunner._api.back()");await pg.wait_for_timeout(1500)
        s=await st(pg);chk(s['busy']==0,f'{tag} {id} rapid ok')
      await pg.evaluate("history.replaceState(null,'',location.pathname);route();showKind('tab')");await pg.wait_for_timeout(300)
      chk(await pg.evaluate("document.querySelectorAll('#grid .card').length")==12,f'{tag} 12 cards')
      await pg.evaluate("document.getElementById('grid').scrollIntoView()")
      seen=False
      for _ in range(24):
        await pg.wait_for_timeout(500)
        seen=seen or await pg.evaluate("[...document.querySelectorAll('#grid .phone.tab .tw')].some(w=>w.classList.contains('isD'))")
      chk(seen,f'{tag} preview demos open items')
      if tag=='tablet': await pg.screenshot(path=S+'gridP.png')
      await pg.click('[data-m="d3"]');await pg.wait_for_timeout(200)
      chk(await pg.evaluate("[...document.querySelectorAll('#grid .card')].filter(c=>!c.hidden).length")==5,f'{tag} 3D chip filter')
      chk(errs==[],f'{tag} errors {errs[:3]}')
      await pg.close()
    await b.close()
asyncio.run(main())
print(ok,'passed');print('\n'.join(bad) or 'ALL OK')
