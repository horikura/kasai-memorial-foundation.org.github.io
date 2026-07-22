(() => {
  const body = document.body;
  const header = document.querySelector('.premium-header');
  const menu = document.querySelector('.premium-menu-button');
  const nav = document.querySelector('.premium-nav');
  const backTop = document.querySelector('.back-to-top');
  const progress = document.querySelector('.reading-progress span');

  const updateScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 18);
    backTop?.classList.toggle('is-visible', y > 600);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y/max) : 0})`;
  };
  updateScroll(); window.addEventListener('scroll', updateScroll, {passive:true});

  const closeMenu = () => {
    menu?.setAttribute('aria-expanded','false'); nav?.classList.remove('is-open'); body.classList.remove('menu-open');
    const label=menu?.querySelector('.sr-only'); if(label) label.textContent='メニューを開く';
  };
  menu?.addEventListener('click',()=>{
    const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); nav?.classList.toggle('is-open',open); body.classList.toggle('menu-open',open);
    const label=menu.querySelector('.sr-only'); if(label) label.textContent=open?'メニューを閉じる':'メニューを開く';
  });
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{ if(window.innerWidth>980) closeMenu(); });

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px -30px'});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));

  backTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));

  // Site search
  const searchDialog=document.querySelector('#site-search'); const searchInput=document.querySelector('#site-search-input'); const results=document.querySelector('#site-search-results');
  const pages=[
    ['財団について','設立理念 代表挨拶 使命 活動原則 団体概要','zaidan.html'],['葛西氏とは','葛西清重 奥州合戦 奥州仕置 葛西大崎一揆 歴史 年表','kasaishi.html'],['定款','目的 事業 メンバー 役員 会議 会計 規程','teikan.html'],['表彰・出展','葛西文化賞 奨励賞 展示 出展 推薦','hyousyou.html'],['公式YouTube','動画 チャンネル 映像 制作方針','youtube.html'],['メンバー加入','参加 申込 調査 記録 広報 賛助','member.html'],['お知らせ','設立 サイト 公開 募集','news.html'],['情報公開','運営 事業 会計 報告 法人格','disclosure.html'],['お問い合わせ','史料提供 取材 展示 共同企画 訂正','contact.html'],['個人情報保護方針','プライバシー 写真 未成年 開示 削除','privacy.html'],['サイト利用案内','著作権 免責 リンク アクセシビリティ','sitepolicy.html'],['English','English overview mission contact','english.html']
  ];
  let previousFocus=null;
  const renderSearch=(q='')=>{ const s=q.trim().toLowerCase(); const matches=s?pages.filter(p=>(p[0]+' '+p[1]).toLowerCase().includes(s)):pages.slice(0,6); results.innerHTML=matches.length?matches.map(p=>`<a href="${p[2]}"><strong>${p[0]}</strong><span>${p[1]}</span><i>→</i></a>`).join(''):'<p class="search-empty">該当するページが見つかりませんでした。</p>'; };
  const openSearch=()=>{ previousFocus=document.activeElement; searchDialog.hidden=false; requestAnimationFrame(()=>searchDialog.classList.add('is-open')); body.classList.add('dialog-open'); renderSearch(); setTimeout(()=>searchInput?.focus(),80); };
  const closeSearch=()=>{ searchDialog.classList.remove('is-open'); body.classList.remove('dialog-open'); setTimeout(()=>searchDialog.hidden=true,180); previousFocus?.focus?.(); };
  document.querySelectorAll('.search-open').forEach(b=>b.addEventListener('click',openSearch)); document.querySelectorAll('[data-search-close]').forEach(b=>b.addEventListener('click',closeSearch)); searchInput?.addEventListener('input',e=>renderSearch(e.target.value));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if(searchDialog&&!searchDialog.hidden)closeSearch();} if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});

  // News filters
  const filterButtons=document.querySelectorAll('[data-news-filter]'); const articles=document.querySelectorAll('[data-news-category]');
  filterButtons.forEach(btn=>btn.addEventListener('click',()=>{filterButtons.forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');const f=btn.dataset.newsFilter;articles.forEach(a=>a.hidden=f!=='all'&&a.dataset.newsCategory!==f);}));

  // Character counters
  document.querySelectorAll('[data-counter-for]').forEach(counter=>{const field=document.querySelector(`[name="${counter.dataset.counterFor}"]`);const update=()=>counter.textContent=field?.value.length||0;field?.addEventListener('input',update);update();});

  // Print buttons
  document.querySelectorAll('[data-print]').forEach(btn=>btn.addEventListener('click',()=>window.print()));

  // PWA registration (works only on HTTPS/localhost)
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')) window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
})();