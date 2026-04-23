const STATE = {
    lang: 'en',
    memories: [], currentIndex: 0, autoInterval: null,
    musicTracks: [], currentTrackIndex: 0,
    wishes: [],
    audio: null, originalVolume: 0.7,
    wishPlayer: null, wishIndex: 0, isSurpriseMode: false
};

const I18N = {
    en: {
        'gate.title':'🌸 A few thoughts... 🌸','gate.subtitle':'There are no wrong answers. Just speak your heart.','gate.enter':'🌸 Enter Himasha\'s World 🌸',
        'tag.flower':'🌸 Flower Soul','tag.blue':'💙 Blue Dreamer','tag.music':'🎵 Melody Heart',
        'therm.title':'💖 Friendship Therm','therm.days':'d','therm.hours':'h','therm.minutes':'m','therm.seconds':'s',
        'carousel.title':'📸 Your Memories','carousel.auto':'🔴 AUTO',
        'music.playlist':'Playlist','music.sub':'🎵 Background Music',
        'surprise.btn':'Open Your Surprise',
        'no.photos':'📁 Add photos to Himasha surprise2/ folder',
        'no.wishes':'🎁 No wishes found in Himasha surprise/ folder'
    },
    si: {
        'gate.title':'🌸 ඔබේ සිතුවිලි කිහිපයක්... 🌸','gate.subtitle':'වැරදි පිළිතුරු නැත. ඔබේ හදවත කියන්න.','gate.enter':'🌸 හිමාෂාගේ ලෝකයට ඇතුළු වන්න 🌸',
        'tag.flower':'🌸 මල් ආත්මය','tag.blue':'💙 නිල් සිහින දකින්නා','tag.music':'🎵 සංගීත හදවත',
        'therm.title':'💖 මිත්‍රත්ව උෂ්ණත්වය','therm.days':'දි','therm.hours':'පැ','therm.minutes':'මි','therm.seconds':'ත',
        'carousel.title':'📸 ඔබේ මතකයන්','carousel.auto':'🔴 ස්වයං',
        'music.playlist':'ගීත ලැයිස්තුව','music.sub':'🎵 පසුබිම් සංගීතය',
        'surprise.btn':'ඔබේ තෑග්ග විවෘත කරන්න',
        'no.photos':'📁 Himasha surprise2/ ෆෝල්ඩරයට ඡායාරූප එක් කරන්න',
        'no.wishes':'🎁 Himasha surprise/ ෆෝල්ඩරයේ පැතුම් නැත'
    },
    ta: {
        'gate.title':'🌸 உங்கள் மனதில்... 🌸','gate.subtitle':'தவறான பதில்கள் இல்லை. உங்கள் இதயம் சொல்வதைப் பகிருங்கள்.','gate.enter':'🌸 ஹிமாஷாவின் உலகில் நுழைய 🌸',
        'tag.flower':'🌸 மலர் ஆன்மா','tag.blue':'💙 நீல கனவு காண்பவள்','tag.music':'🎵 இசை இதயம்',
        'therm.title':'💖 நட்பு வெப்பநிலை','therm.days':'நா','therm.hours':'ம','therm.minutes':'நி','therm.seconds':'வி',
        'carousel.title':'📸 உங்கள் ஞாபகங்கள்','carousel.auto':'🔴 தானியங்கி',
        'music.playlist':'பிளேலிஸ்ட்','music.sub':'🎵 பின்னணி இசை',
        'surprise.btn':'உங்கள் பரிசைத் திற',
        'no.photos':'📁 Himasha surprise2/ கோப்புறையில் புகைப்படங்களைச் சேர்க்கவும்',
        'no.wishes':'🎁 Himasha surprise/ கோப்புறையில் வாழ்த்துக்கள் இல்லை'
    }
};

function applyLanguage(lang) {
    STATE.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
    });
    document.querySelectorAll('.gate-input').forEach(inp => {
        inp.placeholder = lang==='en'?'Your answer...':(lang==='si'?'ඔබේ පිළිතුර...':'உங்கள் பதில்...');
    });
    if (window.appData) renderGateQuestions();
    updateQuote();
    if (STATE.memories.length) {
        const cap = document.getElementById('caption');
        const mem = STATE.memories[STATE.currentIndex];
        if (mem) cap.textContent = mem.name;
    }
    if (!STATE.musicTracks.length) {
        document.getElementById('currentTrack').textContent = I18N[lang]['music.playlist'];
    }
    const noPhotosMsg = document.querySelector('.no-photos-msg');
    if (noPhotosMsg) noPhotosMsg.textContent = I18N[lang]['no.photos'];
}

function renderGateQuestions() {
    const questions = window.appData.gate;
    const container = document.getElementById('gateQuestions');
    container.innerHTML = questions.map(q => `
        <div class="gate-question">
            <label>${q[STATE.lang] || q.en}</label>
            <input type="text" class="gate-input" id="gateAns${q.id}" placeholder="${STATE.lang==='en'?'Your answer...':(STATE.lang==='si'?'ඔබේ පිළිතුර...':'உங்கள் பதில்...')}">
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    setupGate();
    setInterval(updateTime, 1000);
    applyLanguage('en');
});

async function loadConfig() {
    const res = await fetch('/api/init');
    const data = await res.json();
    STATE.memories = data.memories;
    STATE.musicTracks = data.music;
    STATE.wishes = data.wishes;
    window.appData = data;
}

function setupGate() {
    renderGateQuestions();
    document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', e => {
        const lang = e.target.dataset.lang;
        document.querySelectorAll('.lang-btn').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        applyLanguage(lang);
    }));
    document.getElementById('enterBtn').addEventListener('click', () => {
        document.getElementById('gate').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        initMainApp();
    });
}

function initMainApp() {
    if (STATE.memories.length) {
        renderCarousel();
        startAutoCarousel();
    } else {
        const carouselDiv = document.querySelector('.carousel');
        const msg = document.createElement('p');
        msg.className = 'no-photos-msg';
        msg.style.padding = '20px';
        msg.textContent = I18N[STATE.lang]['no.photos'];
        carouselDiv.appendChild(msg);
    }
    if (STATE.musicTracks.length) {
        setupMusicPlayer();
        selectTrack(0);
    }
    setupLanguageSwitch();
    updateFriendship(window.appData.friendship);
    setInterval(async () => {
        const res = await fetch('/api/friendship');
        updateFriendship(await res.json());
    }, 1000);
    updateQuote();
    startParticles();
    document.getElementById('surpriseBtn').addEventListener('click', startSurprise);
}

function renderCarousel() {
    const track = document.getElementById('carouselTrack');
    track.innerHTML = STATE.memories.map(m => `<div class="carousel-slide"><img src="${m.url}" alt=""></div>`).join('');
    document.getElementById('dots').innerHTML = STATE.memories.map((_,i) => `<span class="dot ${i===0?'active':''}" data-index="${i}"></span>`).join('');
    document.querySelectorAll('.dot').forEach(d => d.addEventListener('click', e => goToPhoto(parseInt(e.target.dataset.index))));
}

function startAutoCarousel() {
    STATE.autoInterval = setInterval(() => {
        STATE.currentIndex = (STATE.currentIndex + 1) % STATE.memories.length;
        updateCarousel();
    }, 4000);
}
function goToPhoto(index) { STATE.currentIndex = index; updateCarousel(); resetAutoTimer(); }
function resetAutoTimer() { clearInterval(STATE.autoInterval); startAutoCarousel(); }
function updateCarousel() {
    document.getElementById('carouselTrack').style.transform = `translateX(-${STATE.currentIndex*100}%)`;
    document.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i===STATE.currentIndex));
    const cap = document.getElementById('caption');
    if (STATE.memories[STATE.currentIndex]) cap.textContent = STATE.memories[STATE.currentIndex].name;
}

function setupMusicPlayer() {
    STATE.audio = document.getElementById('bgMusic');
    STATE.audio.volume = STATE.originalVolume;
    document.getElementById('playBtn').addEventListener('click', () => STATE.audio.play());
    document.getElementById('pauseBtn').addEventListener('click', () => STATE.audio.pause());
    document.getElementById('nextTrackBtn').addEventListener('click', nextTrack);
    document.getElementById('volume').addEventListener('input', e => {
        STATE.originalVolume = e.target.value / 100;
        if (!STATE.isSurpriseMode) STATE.audio.volume = STATE.originalVolume;
    });
    STATE.audio.addEventListener('ended', nextTrack);
}
function selectTrack(index) {
    STATE.currentTrackIndex = index;
    STATE.audio.src = STATE.musicTracks[index].url;
    document.getElementById('currentTrack').textContent = STATE.musicTracks[index].name;
    STATE.audio.play().catch(()=>{});
}
function nextTrack() {
    if (STATE.musicTracks.length) {
        STATE.currentTrackIndex = (STATE.currentTrackIndex + 1) % STATE.musicTracks.length;
        selectTrack(STATE.currentTrackIndex);
    }
}

function startSurprise() {
    if (STATE.wishes.length === 0) {
        alert(I18N[STATE.lang]['no.wishes']);
        return;
    }
    STATE.isSurpriseMode = true;
    STATE.audio.volume = 0.1;
    megaConfetti();
    STATE.wishIndex = 0;
    playNextWish();
}
function playNextWish() {
    if (STATE.wishIndex >= STATE.wishes.length) {
        STATE.isSurpriseMode = false;
        STATE.audio.volume = STATE.originalVolume;
        return;
    }
    const wish = STATE.wishes[STATE.wishIndex];
    STATE.wishPlayer = new Audio(wish.url);
    STATE.wishPlayer.volume = 0.9;
    STATE.wishPlayer.play();
    STATE.wishPlayer.onended = () => { STATE.wishIndex++; playNextWish(); };
}

function updateFriendship(d) {
    document.getElementById('thermPercent').textContent = d.percent+'%';
    document.getElementById('thermFill').style.width = d.percent+'%';
    document.getElementById('days').textContent = d.days;
    document.getElementById('hours').textContent = d.hours;
    document.getElementById('minutes').textContent = d.minutes;
    document.getElementById('seconds').textContent = d.seconds;
}

async function updateQuote() {
    const res = await fetch(`/api/quote/${STATE.lang}`);
    document.getElementById('quoteText').textContent = (await res.json()).quote;
}
document.getElementById('refreshQuote').addEventListener('click', updateQuote);

function setupLanguageSwitch() {
    document.querySelectorAll('.lang').forEach(b => b.addEventListener('click', e => {
        const lang = e.target.dataset.lang;
        document.querySelectorAll('.lang').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        applyLanguage(lang);
    }));
}

function updateTime() {
    document.getElementById('liveTime').textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function startParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    function resize() { w=window.innerWidth; h=window.innerHeight; canvas.width=w; canvas.height=h; }
    window.addEventListener('resize', resize); resize();
    for(let i=0;i<40;i++) particles.push({x:Math.random()*w,y:Math.random()*h,s:Math.random()*3+1,vx:Math.random()*.5-.25,vy:Math.random()*.5-.25,c:`rgba(79,172,254,${.2+Math.random()*.3})`});
    function animate() {
        ctx.clearRect(0,0,w,h);
        particles.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fillStyle=p.c; ctx.fill();
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function megaConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = [];
    for(let i=0;i<100;i++) particles.push({x:canvas.width/2,y:canvas.height/2,s:Math.random()*8+4,vx:(Math.random()-.5)*15,vy:Math.random()*-10-5,c:`hsl(${Math.random()*360},70%,60%)`});
    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,p.s,p.s);
            p.x+=p.vx; p.y+=p.vy; p.vy+=.5;
        });
        if(particles.some(p=>p.y<canvas.height)) requestAnimationFrame(draw);
    }
    draw();
}
