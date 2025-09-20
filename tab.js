(() => {
    // ---------- DOM ----------
    const timeEl = document.getElementById("time");
    const dateEl = document.getElementById("date");
    const quoteEl = document.getElementById("quote");
    const authorEl = document.getElementById("author");
    const nextQuoteBtn = document.getElementById("next-quote");
    const topSitesEl = document.getElementById("top-sites");
    const searchInput = document.getElementById("search-input");
    const suggestionsEl = document.getElementById("suggestions");
    const streakEl = document.getElementById("streak");
		let auto = true;

    // ---------- Clock ----------
    function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ---------- Particle Background ----------
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = innerWidth);
    let h = (canvas.height = innerHeight);
    const PTR = { x: w / 2, y: h / 2 };
    let particleMode = "normal"; // normal, snow, confetti, rain

    window.addEventListener("resize", () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });
    window.addEventListener("mousemove", e => { PTR.x = e.clientX; PTR.y = e.clientY; });

    // ---------- Particle Class ----------
    class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * w; this.y = Math.random() * h;
        const speed = 0.2 + Math.random() * 0.9;
        const dir = Math.random() * Math.PI * 2;
        this.vx = Math.cos(dir) * speed; this.vy = Math.sin(dir) * speed;
        this.r = 1 + Math.random() * 2.5; this.alpha = 0.2 + Math.random() * 0.6;
        this.color = `hsla(${Math.random()*360},80%,70%,${this.alpha})`;
    }
    step() {
        if(particleMode === "snow"){ this.y += 0.6; this.x += Math.sin(this.y*0.01)*0.5; if(this.y>h+5) this.reset(); }
        else if(particleMode === "rain"){ this.y += 4; if(this.y>h+10) this.reset(); }
        else { this.x += this.vx; this.y += this.vy; if(this.x<-50 || this.x>w+50 || this.y<-50 || this.y>h+50) this.reset(); }
    }
    draw() {
        ctx.beginPath();
        if(particleMode==="confetti"){ ctx.fillStyle=this.color; ctx.fillRect(this.x,this.y,this.r*2,this.r*2); }
        else ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle = particleMode==="confetti"?this.color:`rgba(255,255,255,${this.alpha})`;
        ctx.fill();
    }
    }

    const PARTICLE_COUNT = Math.round((w * h) / 9000);
    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    function connectParticles() {
    if(particleMode!=="normal") return;
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist * maxDist) {
            const alpha = 0.12 * (1 - Math.sqrt(d2) / maxDist);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        }
    }
    }

    function frame() {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(22,28,36,0.9)"); g.addColorStop(0.6, "rgba(10,15,22,0.8)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    for (let p of particles) {
        if(particleMode==="normal"){ const dx = PTR.x - p.x, dy = PTR.y - p.y, d2 = dx*dx+dy*dy; if(d2<120*120){ p.x-=dx*0.0006; p.y-=dy*0.0006; } }
        p.step(); p.draw();
    }
    connectParticles();
    requestAnimationFrame(frame);
    }
    frame();

    // ---------- Seasonal / Fun Modes ----------
    function updateParticleMode() {
    const now = new Date();
    const month = now.getMonth()+1; const day = now.getDate();
    if(month===12) particleMode="snow";
    else if(month===1 && day===1) particleMode="confetti";
    else particleMode="normal";
    }
    updateParticleMode();

    // ---------- Local Quotes from JSON ----------
    let quotes = [];
    let currentQuoteIndex = 0;
    async function loadQuotes() {
      try {
          const res = await fetch(chrome.runtime.getURL("quotes.json"));
          quotes = await res.json();
          showQuote(currentQuoteIndex);
      } catch(e){
          quotes=[{text:"The best way to get started is to quit talking and begin doing.", author:"Walt Disney"}];
          showQuote(0);
          console.error("Failed to load quotes.json", e);
      }
    }

    function showQuote(index){
      const q=quotes[index%quotes.length];
      quoteEl.textContent=`“${q.text}”`;
      authorEl.textContent=q.author?`— ${q.author}`:"";
    }
    nextQuoteBtn.addEventListener("click",() => { 
			currentQuoteIndex=(currentQuoteIndex+1)%quotes.length;
			showQuote(currentQuoteIndex);
			if (!auto) {
				auto = true;
				autoRotateQuotes();
			}
		});
    loadQuotes();

    // ---------- Local Shortcuts ----------
    let shortcuts = JSON.parse(localStorage.getItem("shortcuts")||"null")||[
    {title:"Google", url:"https://www.google.com"},
    {title:"YouTube", url:"https://www.youtube.com"},
    {title:"GitHub", url:"https://github.com"}
    ];
    function saveShortcuts(){ localStorage.setItem("shortcuts", JSON.stringify(shortcuts)); }
    function normalizeUrl(url){ url=url.trim(); return /^https?:\/\//i.test(url)?url:"https://"+url; }

    function renderShortcuts(){
			topSitesEl.innerHTML="";
			shortcuts.forEach((s,i)=>{
				const a=document.createElement("a"); a.className="tile"; a.href=normalizeUrl(s.url); a.target="_blank"; a.rel="noopener noreferrer";
				const favicon=document.createElement("img"); favicon.className="favicon"; favicon.src=`https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(normalizeUrl(s.url))}`;
				a.appendChild(favicon);
				const title=document.createElement("div"); title.className="title"; title.textContent=s.title; a.appendChild(title);
				const btn=document.createElement("button"); btn.textContent="✕"; btn.title="Remove shortcut";
				btn.style.cssText="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.4);border:0;color:white;border-radius:50%;cursor:pointer;";
				btn.addEventListener("click",ev=>{ ev.preventDefault(); shortcuts.splice(i,1); saveShortcuts(); renderShortcuts(); });
				a.style.position="relative"; a.appendChild(btn);
				topSitesEl.appendChild(a);
			});
			
			const addTile=document.createElement("div"); addTile.className="tile"; addTile.style.cursor="pointer";
			addTile.innerHTML="<div style='font-size:2rem;'>＋</div><div class='title'>Add</div>";
			addTile.addEventListener("click",()=>{
					const url=prompt("Enter site URL:"); if(!url) return; const title=prompt("Enter site name:",url); if(!title) return;
					shortcuts.push({title,url:normalizeUrl(url)}); saveShortcuts(); renderShortcuts();
			});
			topSitesEl.appendChild(addTile);
    }
    renderShortcuts();

    // ---------- Streak Tracking ----------
    function updateStreak(){
			const today = new Date().toDateString();
			const last = localStorage.getItem("lastOpenDate");
			let streak = parseInt(localStorage.getItem("streakCount")||"0");
			if(last===today){} // already counted today
			else if(last && new Date(last).getTime() === new Date(today).getTime()-86400000){ streak++; }
			else { streak=1; }
			localStorage.setItem("lastOpenDate", today);
			localStorage.setItem("streakCount", streak);
			if(streakEl) streakEl.textContent=`🔥 Streak: ${streak} days`;
    }
    updateStreak();

    // ---------- Search Enhancements ----------
    const engines = { google:"https://www.google.com/search?q=", ddg:"https://duckduckgo.com/?q=", bing:"https://www.bing.com/search?q=" };
    let currentEngine="google";
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")||"[]");
    let suggestionItems=[], activeIndex=-1, debounceTimer=null;

    function clearSuggestions(){ suggestionsEl.innerHTML=""; suggestionsEl.classList.remove("visible"); suggestionItems=[]; activeIndex=-1; }
    function showSuggestions(list){
    suggestionsEl.innerHTML="";
    if(!list||!list.length){ clearSuggestions(); return; }
    suggestionsEl.classList.add("visible"); suggestionItems=list.slice(0,6); activeIndex=-1;
    suggestionItems.forEach((s,idx)=>{ const div=document.createElement("div"); div.className="suggestion"; div.textContent=s; div.dataset.index=idx;
        div.addEventListener("mousedown",ev=>{ ev.preventDefault(); navigateToSuggestion(idx); }); suggestionsEl.appendChild(div); });
    }

    async function fetchSuggestions(q){
    try{ const res=await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`); if(!res.ok) throw new Error();
        const data=await res.json(); return Array.isArray(data[1])?data[1]:[]; } catch{return [];}
    }

    async function onInputChange(){
    const q=searchInput.value.trim(); if(!q){ clearSuggestions(); return; }
    if(debounceTimer) clearTimeout(debounceTimer);
    debounceTimer=setTimeout(async ()=>{
        const googleSug = await fetchSuggestions(q);
        const historySug = searchHistory.filter(h=>h.toLowerCase().includes(q.toLowerCase()));
        const merged=[...new Set([...historySug,...googleSug])];
        showSuggestions(merged.length?merged:[q]);
    },160);
    }

    function navigateToSuggestion(index){
    const s = suggestionItems[index]; if(!s) return; performSearch(s);
    }

   function performSearch(query) {
        if(!query) return;
        if(checkEasterEgg(query)) return;

        searchHistory.unshift(query);
        searchHistory=[...new Set(searchHistory)].slice(0,20);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        const isUrlLike=/^[a-zA-Z\-]+:\/\//.test(query)||/^[\w-]+\.[\w.-]+(\/.*)?$/.test(query);
        window.location.href = isUrlLike ? normalizeUrl(query) : engines[currentEngine]+encodeURIComponent(query);
    }


    searchInput.addEventListener("input",onInputChange);
    searchInput.addEventListener("keydown",e=>{
    const items=suggestionsEl.querySelectorAll(".suggestion");
    if(e.key==="ArrowDown"){ e.preventDefault(); if(!items.length) return; activeIndex=Math.min(activeIndex+1,items.length-1); updateActiveSuggestion(items); }
    else if(e.key==="ArrowUp"){ e.preventDefault(); if(!items.length) return; activeIndex=Math.max(activeIndex-1,0); updateActiveSuggestion(items); }
    else if(e.key==="Enter"){ e.preventDefault(); if(activeIndex>=0 && suggestionItems[activeIndex]) navigateToSuggestion(activeIndex); else performSearch(searchInput.value.trim()); }
    else if(e.key==="Escape"){ clearSuggestions(); }
    });

    function updateActiveSuggestion(items){ items.forEach(it=>it.classList.remove("active")); if(activeIndex>=0 && items[activeIndex]){ items[activeIndex].classList.add("active"); searchInput.value=items[activeIndex].textContent; } }
    document.addEventListener("click",ev=>{ if(!document.getElementById("search-wrap").contains(ev.target)) clearSuggestions(); });

    // ---------- Easter Eggs ----------
	function checkEasterEgg(query) {
    query = query.toLowerCase();
    let triggered = false;

    const triggers = [
        { key: ":confetti", action: () => { particleMode = "confetti"; } },
        { key: ":snow", action: () => { particleMode = "snow"; } },
        { key: ":rain", action: () => { particleMode = "rain"; } },
        { key: "*fire*", action: () => { flashBackground("orange"); } },
        { key: "love^^", action: () => { particleMode = "confetti"; showQuoteWithText("❤️ Spread love!"); } },
        { key: "!party", action: () => { particleMode = "confetti"; rotateQuotes(2500, 120); } },
        { key: "happy!", action: () => { randomParticleColors(); } },
        { key: "*star*", action: () => { spawnStars(); } },
        { key: "sun**", action: () => { particleMode = "confetti"; flashBackground("yellow"); } },
        { key: "magic**", action: () => { particleMode = "confetti"; showQuoteWithText("✨ Magic is real!"); } },
        { key: "\"birthday", action: () => { particleMode = "confetti"; showQuoteWithText("🎉 Happy Birthday!"); } },
        { key: "&!sina", action: () => { screenShake(); showQuoteWithText("The Lord has entered, mighty and glorious!"); } },
        { key: "hello", action: () => { showQuoteWithText("👋 Hello there!"); } },
        { key: "dream()", action: () => { particleMode = "snow"; showQuoteWithText("💭 Keep dreaming!"); } },
        { key: "mehdi.!", action: () => { showQuoteWithText("Congratulations, your belly just became a VIP lounge for fat."); } },
    ];

    for (const trigger of triggers) {
        if (query.includes(trigger.key)) {
            trigger.action();
            triggered = true;
						auto = false;
        }
    }

    return triggered;
	}

// ---------- Helper Functions for Easter Eggs ----------

// Temporarily flash the background with a color
function flashBackground(color) {
  const original = canvas.style.backgroundColor;
  canvas.style.backgroundColor = color;
  setTimeout(() => { canvas.style.backgroundColor = original; }, 500);
}

// Show custom text/emoji in quote box
function showQuoteWithText(text) {
  quoteEl.textContent = text;
  authorEl.textContent = "";
}

// Rotate through random quotes quickly for a few seconds
function rotateQuotes(duration, interval) {
  if (!quotes || !quotes.length) return;
  let endTime = Date.now() + duration;
  const rot = setInterval(() => {
    const idx = Math.floor(Math.random() * quotes.length);
    showQuote(idx);
    if (Date.now() > endTime) clearInterval(rot);
  }, interval);
}

function autoRotateQuotes() {
	const loop = setInterval(() => {
		if (!auto) {
			clearInterval(loop);
			return;
		}

		currentQuoteIndex = (currentQuoteIndex+1)%quotes.length
    showQuote(currentQuoteIndex);	
  }, 7000);
}
autoRotateQuotes();

// Randomly change particle colors for a short burst
function randomParticleColors(duration = 2000) {
  const originalColors = particles.map(p => p.color);
  particles.forEach(p => p.color = `hsla(${Math.random()*360},80%,70%,${p.alpha})`);
  setTimeout(() => {
    particles.forEach((p,i) => p.color = originalColors[i]);
  }, duration);
}

// Spawn small star particles around the cursor
function spawnStars(count = 30, duration = 2000) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: PTR.x + (Math.random() * 100 - 50),
      y: PTR.y + (Math.random() * 100 - 50),
      vx: Math.random()*2-1,
      vy: Math.random()*2-1,
      r: Math.random()*2+1,
      alpha: 1
    });
  }
  const start = Date.now();
  function drawStars() {
    const now = Date.now();
    if (now - start > duration) return;
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.alpha -= 0.02;
      if(s.alpha>0){
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      }
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();
}

// Shake the canvas for a short duration
function screenShake(intensity = 9, duration = 3000) {
  const start = Date.now();
  function shake() {
    const now = Date.now();
    if(now - start > duration){
      canvas.style.transform = "";
      return;
    }
    const x = (Math.random() * 2 - 1) * intensity;
    const y = (Math.random() * 2 - 1) * intensity;
    canvas.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(shake);
  }
  shake();
}

})();