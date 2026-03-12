let chartInst = {};

function switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${name}`).classList.remove('hidden');
    document.getElementById('viewTitle').innerText = name;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.includes(name)) btn.classList.add('active');
    });
}

async function startAnalysis() {
    const user = document.getElementById('usernameInput').value;
    if (!user) return alert("Enter a username!");

    const res = await fetch(`http://127.0.0.1:8000/analyze/${user}`);
    const data = await res.json();

    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    document.getElementById('displayUsername').innerText = `@${user}`;
    document.getElementById('userAvatar').innerText = user[0].toUpperCase();

    // RENDER STATS (Followers, Posts, etc.)
    document.getElementById('statsRow').innerHTML = `
        ${card("Followers", data.metrics.followers_formatted, "👥")}
        ${card("Total Posts", data.metrics.total_posts, "📄")}
        ${card("Sentiment", data.metrics.pos_sentiment, "😊")}
        ${card("Engage Rate", data.metrics.avg_engagement, "🔥")}
    `;

    // RENDER SENTIMENT CARDS
    const s = data.charts.sentiment_pie;
    document.getElementById('sentCardsRow').innerHTML = `
        <div class="bg-emerald-500 p-8 rounded-3xl text-white shadow-lg"><p class="text-xs font-bold uppercase opacity-70">Positive</p><h2 class="text-3xl font-black">${s[0]}%</h2></div>
        <div class="bg-indigo-500 p-8 rounded-3xl text-white shadow-lg"><p class="text-xs font-bold uppercase opacity-70">Neutral</p><h2 class="text-3xl font-black">${s[1]}%</h2></div>
        <div class="bg-rose-500 p-8 rounded-3xl text-white shadow-lg"><p class="text-xs font-bold uppercase opacity-70">Negative</p><h2 class="text-3xl font-black">${s[2]}%</h2></div>
    `;

    renderCharts(data.charts);

    // FIXED: RENDER HASHTAGS
    const hashtagContainer = document.getElementById('finalHashtagBox');
    if (data.hashtags && data.hashtags.length > 0) {
        hashtagContainer.innerHTML = data.hashtags.map(tag => `
            <span class="bg-indigo-50 text-indigo-700 px-10 py-5 rounded-[24px] font-black border border-indigo-100 shadow-sm transition-all hover:bg-indigo-600 hover:text-white hover:scale-105 cursor-default flex items-center">
                <span class="opacity-30 mr-1 text-sm">#</span>${tag.replace('#', '')}
            </span>
        `).join('');
    }
    
    switchTab('Dashboard');
}

function renderCharts(c) {
    Object.values(chartInst).forEach(ch => ch.destroy());

    chartInst.s1 = new Chart(document.getElementById('sentMain'), {
        type: 'doughnut', data: { labels: ['Pos','Neu','Neg'], datasets: [{ data: c.sentiment_pie, backgroundColor: ['#10B981','#6366F1','#F43F5E'], borderWidth: 0 }] },
        options: { cutout: '80%', plugins: { legend: { position: 'bottom' } } }
    });

    chartInst.e1 = new Chart(document.getElementById('engMain'), {
        type: 'line', data: { labels: ['W1','W2','W3','W4','W5','W6','W7'], datasets: [{ label: 'Likes', data: c.engagement_line, borderColor: '#6366F1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)' }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
    });

    chartInst.sH = new Chart(document.getElementById('sentHistory'), {
        type: 'line', data: { labels: ['M1','M2','M3','M4','M5'], datasets: [
            { label: 'Positive', data: c.sentiment_history.positive, borderColor: '#10B981', tension: 0.3 },
            { label: 'Neutral', data: c.sentiment_history.neutral, borderColor: '#6366F1', tension: 0.3 },
            { label: 'Negative', data: c.sentiment_history.negative, borderColor: '#F43F5E', tension: 0.3 }
        ] }
    });

    chartInst.eD = new Chart(document.getElementById('engDetailed'), {
        type: 'bar', data: { labels: ['Likes','Comm','Shares'], datasets: [{ data: c.interaction_types, backgroundColor: ['#6366F1','#818CF8','#A5B4FC'], borderRadius: 10 }] }
    });
}

function card(t, v, i) {
    return `<div class="stat-card flex items-center gap-4 transition-transform hover:scale-105">
        <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">${i}</div>
        <div><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t}</p><p class="text-xl font-black text-slate-800">${v}</p></div>
    </div>`;
}