import asyncio,sys
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/31fb2f4c-4220-5253-be8b-fd8fcc2ff16f/scratchpad/'
ok=0;bad=[]
def chk(c,msg):
  global ok
  if c: ok+=1
  else: bad.append(msg)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for vp,tag in [({'width':820,'height':1180},'tablet'),({'width':390,'height':844},'phone'),({'width':1440,'height':900},'desktop')]:
      pg=await b.new_page(viewport=vp,has_touch=(tag!='desktop'));errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('file:///home/claude/menuoman/index.html');await pg.wait_for_timeout(600)
      n=await pg.evaluate("TG.length");chk(n==100,'100 designs')
      chk(await pg.evaluate("KINDS.tab.list.length===100&&new Set(TG.map(d=>d.id)).size===100"),'unique ids')
      ids=await pg.evaluate("TL.map(L=>TG.find(d=>d.L===L.id).id)") if tag=='tablet' else ['t1-maroon','t6-saffron','t10-rose']
      for id in ids:
        await pg.evaluate(f"location.hash='{id}'");await pg.wait_for_timeout(900)
        chk(await pg.evaluate("!!document.querySelector('.single .mframe.tabm .tw')"),f'{tag} {id} frame')
        # fits inside host
        fit=await pg.evaluate("(()=>{const w=document.querySelector('.single .tw'),h=w.parentNode.getBoundingClientRect(),r=w.getBoundingClientRect();return r.width<=h.width+2&&r.height<=h.height+2&&r.width>200})()")
        chk(fit,f'{tag} {id} fits')
        for ci in range(3):
          await pg.click(f'.single .tw .tcn [data-cat="{ci}"]');await pg.wait_for_timeout(500)
          st=await pg.evaluate("sRunner._api.state()");chk(st['ci']==ci and st['cur'] is None,f'{tag} {id} cat{ci}')
          items=st['items']
          await pg.click(f'.single .tw .hm .ti[data-k="{items[1]}"]');await pg.wait_for_timeout(1000)
          st=await pg.evaluate("sRunner._api.state()");chk(st['cur']==items[1],f'{tag} {id} open {items[1]}')
          chk(await pg.evaluate("document.querySelector('.single .tw').classList.contains('isD')&&!document.querySelector('.single .tw .tfly')"),f'{tag} {id} detail shown')
          vis=await pg.evaluate("(()=>{const i=document.querySelector('.single .tw .dt .thr img');return i&&getComputedStyle(i).visibility==='visible'&&i.offsetHeight<=i.parentNode.offsetHeight+1})()")
          chk(vis,f'{tag} {id} hero visible & sized')
          await pg.click('.single .tw [data-step="1"]');await pg.wait_for_timeout(800)
          st=await pg.evaluate("sRunner._api.state()");chk(st['cur']==items[2],f'{tag} {id} next')
          await pg.click('.single .tw [data-step="-1"]');await pg.wait_for_timeout(800)
          await pg.click('.single .tw [data-step="-1"]');await pg.wait_for_timeout(800)
          st=await pg.evaluate("sRunner._api.state()");chk(st['cur']==items[0],f'{tag} {id} prev')
          if await pg.evaluate("!!document.querySelector('.single .tw .dt [data-go]')"):
            await pg.click(f'.single .tw .dt [data-go="{items[-1]}"]');await pg.wait_for_timeout(800)
            st=await pg.evaluate("sRunner._api.state()");chk(st['cur']==items[-1],f'{tag} {id} thumb')
          if tag=='tablet' and ci==1:
            await pg.screenshot(path=S+f'det_{id}.png')
          await pg.click('.single .tw [data-tback]');await pg.wait_for_timeout(900)
          st=await pg.evaluate("sRunner._api.state()");chk(st['cur'] is None,f'{tag} {id} back')
          chk(await pg.evaluate("[...document.querySelectorAll('.single .tw .hm .ph')].every(p=>p.style.visibility!=='hidden')&&!document.querySelector('.single .tw .tfly')"),f'{tag} {id} home photos restored')
        # escape key back
        await pg.click('.single .tw .hm .ti');await pg.wait_for_timeout(1000)
        await pg.keyboard.press('Escape');await pg.wait_for_timeout(900)
        st=await pg.evaluate("sRunner._api.state()");chk(st['cur'] is None,f'{tag} {id} esc back')
      # rapid clicks during flight shouldn't break
      await pg.evaluate("location.hash='t3-sky'");await pg.wait_for_timeout(900)
      await pg.click('.single .tw .hm .ti');await pg.evaluate("sRunner._api.back();sRunner._api.step(1);sRunner._api.cat(2)");await pg.wait_for_timeout(1200)
      await pg.evaluate("sRunner._api.back()");await pg.wait_for_timeout(900)
      st=await pg.evaluate("sRunner._api.state()");chk(st['busy']==0,f'{tag} rapid busy cleared')
      # gallery previews auto-demo
      await pg.evaluate("history.replaceState(null,'',location.pathname);route();showKind('tab')");await pg.wait_for_timeout(300)
      cards=await pg.evaluate("document.querySelectorAll('#grid .card').length");chk(cards==100,f'{tag} 100 cards')
      await pg.evaluate("document.getElementById('grid').scrollIntoView()");seen=False
      for _ in range(16):
        await pg.wait_for_timeout(500)
        seen=seen or await pg.evaluate("[...document.querySelectorAll('#grid .phone.tab .tw')].some(w=>w.classList.contains('isD'))")
      chk(seen,f'{tag} demo opens items')
      chk(await pg.evaluate("[...document.querySelectorAll('#grid .phone.tab')].filter(p=>p.querySelector('.tw')&&p.querySelector('.tw').innerHTML).length<=24"),f'{tag} offscreen previews stopped')
      if tag=='tablet':await pg.screenshot(path=S+'grid_tab.png')
      # filters
      await pg.click('[data-m="T7"]');await pg.wait_for_timeout(200)
      chk(await pg.evaluate("[...document.querySelectorAll('#grid .card')].filter(c=>!c.hidden).length")==10,f'{tag} chip filter')
      chk(errs==[],f'{tag} errors {errs}')
      await pg.close()
    await b.close()
asyncio.run(main())
print(ok,'passed');print('\n'.join(bad) or 'ALL OK')
