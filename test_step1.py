import json,sys
from playwright.sync_api import sync_playwright
R=[]
def ok(name,cond,info=""):
    R.append((name,bool(cond),info));print(("PASS" if cond else "FAIL"),name,info,flush=True)
URL='file:///home/claude/menu/wrapS.html'
with sync_playwright() as p:
    b=p.chromium.launch()
    for vp,label in [((1280,900),'desktop'),((390,844),'phone')]:
        ctx=b.new_context(viewport={'width':vp[0],'height':vp[1]},has_touch=(label=='phone'))
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
        pg.goto(URL);pg.wait_for_timeout(1200)
        ok(f'{label}: loads without errors',not errs,str(errs[:2]))
        sw=pg.evaluate('document.documentElement.scrollWidth');ok(f'{label}: no sideways scroll',sw<=vp[0],f'scrollWidth={sw}')
        # ---- picker via UI
        pg.click('[data-wiz-hero]');pg.wait_for_timeout(300)
        ok(f'{label}: picker opens from hero',pg.is_visible('.wiz.on'))
        ok(f'{label}: step 1 says 1 of 4',('1' in pg.inner_text('.wtop span')))
        pg.click('[data-o="screen"]');pg.click('[data-o="port"]');pg.wait_for_timeout(100)
        pg.click('[data-wback]');pg.wait_for_timeout(100)
        ok(f'{label}: back returns to orientation question',pg.inner_text('#wizQ').startswith('كيف'))
        pg.click('[data-o="port"]');pg.click('[data-o="full"]');pg.click('[data-o="heritage"]');pg.wait_for_timeout(600)
        st=pg.evaluate('({kind,n:PICKS.list.length,kinds:[...new Set(PICKS.list.map(d=>d.kind))],vibes:PICKS.list.map(d=>d.vibe),cards:document.querySelectorAll("#grid .card").length})')
        ok(f'{label}: picker shows results',st['kind']=='picks' and st['n']>=6 and st['cards']==st['n'],json.dumps(st,ensure_ascii=False))
        ok(f'{label}: results are full-menu kinds',set(st['kinds'])<= {'studio','full'},str(st['kinds']))
        ok(f'{label}: mostly the chosen style',st['vibes'].count('heritage')>=3,str(st['vibes']))
        # open first pick and navigate inside picks
        first=pg.evaluate('PICKS.list[0].id');pg.evaluate(f'location.hash="{first}"');pg.wait_for_timeout(500)
        pg.evaluate('wake()')
        ok(f'{label}: counter shows 1 / N',pg.inner_text('#ncount').startswith('1 /'),pg.inner_text('#ncount'))
        pg.click('.single .nnext');pg.wait_for_timeout(400)
        sec=pg.evaluate('currentId()');ok(f'{label}: next goes to 2nd pick and stays in picks',sec==pg.evaluate('PICKS.list[1].id') and pg.evaluate('kind')=='picks',sec)
        pg.click('.single .nprev');pg.wait_for_timeout(300);pg.evaluate('wake()');pg.click('.single .nprev');pg.wait_for_timeout(300)
        ok(f'{label}: previous from first wraps to last',pg.evaluate('currentId()')==pg.evaluate('PICKS.list.at(-1).id'))
        if label=='desktop':
            pg.keyboard.press('ArrowLeft');pg.wait_for_timeout(300)
            ok('desktop: ArrowLeft = next (RTL)',pg.evaluate('currentId()')==pg.evaluate('PICKS.list[0].id'))
            pg.keyboard.press('Escape');pg.wait_for_timeout(300)
            ok('desktop: Escape closes full view',not pg.evaluate('single.classList.contains("on")'))
        else:
            pg.evaluate('''()=>{const s=single,mk=(t,x)=>new TouchEvent(t,{changedTouches:[new Touch({identifier:1,target:s,clientX:x,clientY:400})],touches:t==="touchstart"?[new Touch({identifier:1,target:s,clientX:x,clientY:400})]:[]});s.dispatchEvent(mk("touchstart",100));s.dispatchEvent(mk("touchend",260))}''');pg.wait_for_timeout(300)
            ok('phone: swipe right = next',pg.evaluate('currentId()')==pg.evaluate('PICKS.list[0].id'))
            pg.evaluate('goBack()');pg.wait_for_timeout(300)
        # ---- filters on a normal tab
        pg.evaluate('showKind("studio")');pg.wait_for_timeout(300)
        pg.fill('#fq','D-012');pg.wait_for_timeout(200)
        vis=pg.evaluate('[...grid.querySelectorAll(".card:not([hidden]) .num")].map(e=>e.textContent)')
        ok(f'{label}: search by code finds exactly it',vis==['D-012'],str(vis))
        pg.fill('#fq','٠١٢');pg.wait_for_timeout(200)
        vis=pg.evaluate('[...grid.querySelectorAll(".card:not([hidden]) .num")].map(e=>e.textContent)')
        ok(f'{label}: Arabic digits search works',vis==['D-012'],str(vis))
        pg.fill('#fq','الدوائر');pg.wait_for_timeout(200)
        n=pg.evaluate('grid.querySelectorAll(".card:not([hidden])").length');ok(f'{label}: search by Arabic name',n==5,f'n={n}')
        pg.fill('#fq','zzzz');pg.wait_for_timeout(200)
        ok(f'{label}: empty state shown',pg.evaluate('grid.querySelectorAll(".card:not([hidden])").length')==0 and 'امسح' in pg.inner_text('#fcount'))
        pg.click('#fcount [data-reset]');pg.wait_for_timeout(200)
        tot=pg.evaluate('KINDS.studio.list.length');n=pg.evaluate('grid.querySelectorAll(".card:not([hidden])").length')
        ok(f'{label}: reset brings all back',n==tot and pg.input_value('#fq')=='',f'{n}/{tot}')
        vs=pg.evaluate('[...fbar.querySelectorAll("[data-v]")].map(b=>b.dataset.v).filter(v=>v!=="all")');s=0
        for v in vs:
            pg.click(f'[data-v="{v}"]');pg.wait_for_timeout(120);s+=pg.evaluate('grid.querySelectorAll(".card:not([hidden])").length')
        ok(f'{label}: style filters cover every design once',s==tot,f'{s}/{tot} via {vs}')
        pg.click('[data-v="all"]');pg.click('[data-c="red"]');pg.wait_for_timeout(150)
        cols=pg.evaluate('[...new Set([...grid.querySelectorAll(".card:not([hidden])")].map(c=>c.dataset.col))]')
        ok(f'{label}: colour filter keeps one colour',cols==['red'],str(cols))
        pg.click('[data-c="all"]');pg.wait_for_timeout(100)
        # nav honours filters
        pg.click('[data-v="lux"]');pg.wait_for_timeout(150)
        ids=pg.evaluate('navIds()');pg.evaluate(f'location.hash="{ids[0]}"');pg.wait_for_timeout(400);pg.evaluate('navGo(1)');pg.wait_for_timeout(400)
        ok(f'{label}: next follows the filtered list',pg.evaluate('currentId()')==ids[1],f'{ids[:2]}')
        pg.evaluate('goBack()');pg.wait_for_timeout(200)
        # cart still works
        pg.evaluate('cart=[];saveCart();updCart()')
        pg.click('#grid .card:not([hidden]) [data-pick]');pg.wait_for_timeout(150)
        ok(f'{label}: add to cart from grid',pg.evaluate('cart.length')==1 and not pg.evaluate('document.getElementById("cartbar").hidden'))
        # menu nav buttons
        pg.evaluate('showKind("menu")');pg.wait_for_timeout(300);m0=pg.evaluate('KINDS.menu.list[0].id')
        pg.evaluate(f'location.hash="{m0}"');pg.wait_for_timeout(600)
        pg.click('.mtop [data-nav="1"]');pg.wait_for_timeout(600)
        ok(f'{label}: QR menu next button works',pg.evaluate('currentId()')==pg.evaluate('KINDS.menu.list[1].id'))
        ok(f'{label}: menu counter shows 2 / 100','2 / 100' in pg.inner_text('.mtop'))
        pg.evaluate('goBack()');pg.wait_for_timeout(200)
        ok(f'{label}: no errors after all actions',not errs,str(errs[:3]))
        ctx.close()
    # all picker combinations (logic)
    ctx=b.new_context();pg=ctx.new_page();pg.goto(URL);pg.wait_for_timeout(800)
    res=pg.evaluate('''()=>{const out=[];const V=["lux","bold","heritage","clean","fun","any"];
      const combos=[];for(const w of ["screen","qr","both"]){const os=w==="qr"?[null]:["port","land","any"];for(const o of os){const cs=(w==="qr"||o==="land")?[null]:["full","items","mix"];for(const c of cs)for(const v of V)combos.push({where:w,orient:o,content:c,vibe:v})}}
      for(const a of combos){const L=recommend(a),ids=L.map(d=>d.id),exp=pickKinds(a);out.push({a,n:L.length,dup:ids.length!==new Set(ids).size,bad:L.filter(d=>!exp.includes(d.kind)).length,match:a.vibe==="any"?L.length:L.filter(d=>d.vibe===a.vibe).length,reel:ids.includes("studio-reel")})}return out}''')
    ok(f'picker: {len(res)} answer combinations tested',len(res)==90,str(len(res)))
    ok('picker: every combination gives 8 or 9 designs',all(r['n'] in (8,9) for r in res),str([ (r['a'],r['n']) for r in res if r['n'] not in (8,9)][:3]))
    ok('picker: no duplicates',not any(r['dup'] for r in res))
    ok('picker: only the right design types',all(r['bad']==0 for r in res),str([r['a'] for r in res if r['bad']][:3]))
    ok('picker: never suggests the showreel',not any(r['reel'] for r in res))
    weak=[(r['a'],r['match'],r['n']) for r in res if r['match']<r['n']*0.5]
    ok('picker: at least half match the chosen style',not weak,json.dumps(weak[:4],ensure_ascii=False))
    print('\nSUMMARY',sum(1 for r in R if r[1]),'/',len(R),'passed')
    b.close()
