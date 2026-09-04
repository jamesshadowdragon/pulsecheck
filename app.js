const API = "/api/proxy.js";
const $ = s => document.querySelector(s);
let monitors = [];

function apiUrl(path, params = {}) {
    const url = new URL(API, window.location.origin);
    url.searchParams.set('path', path);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    }
    return url.toString();
}

const tokens = () => {
    try {
        return JSON.parse(localStorage.getItem("pulsecheck_tokens") || "{}");
    } catch {
        return {};
    }
};

const token = id => tokens()[id] || "";

function saveToken(id, t) {
    const x = tokens();
    x[id] = t;
    localStorage.setItem("pulsecheck_tokens", JSON.stringify(x));
}

function delToken(id) {
    const x = tokens();
    delete x[id];
    localStorage.setItem("pulsecheck_tokens", JSON.stringify(x));
}

async function api(path, opt = {}, params = {}) {
    const url = apiUrl(path, params);
    console.log('🔍 Fetching:', url);
    
    try {
        const response = await fetch(url, {
            ...opt,
            headers: {
                "Content-Type": "application/json",
                ...(opt.headers || {})
            }
        });
        
        let data = {};
        try {
            data = await response.json();
        } catch {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
            throw new Error(data.error || `Request failed (${response.status})`);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

function host(u) {
    try {
        return new URL(u).hostname.replace(/^www\./, "");
    } catch {
        return u;
    }
}

function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

function toast(t) {
    const e = $("#toast");
    e.textContent = t;
    e.classList.add("show");
    clearTimeout(window.__tt);
    window.__tt = setTimeout(() => e.classList.remove("show"), 2600);
}

function stats() {
    $("#total").textContent = monitors.length;
    $("#up").textContent = monitors.filter(x => x.status === "up").length;
    $("#down").textContent = monitors.filter(x => x.status === "down").length;
    const a = monitors.map(x => +x.response_time || 0).filter(Boolean);
    $("#avg").textContent = a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) + " ms" : "—";
}

function render() {
    stats();
    const l = $("#list");
    if (!monitors.length) {
        l.innerHTML = '<div class="empty"><b>No monitors yet</b><br>Add a URL above to create your first monitor.</div>';
        return;
    }
    l.innerHTML = monitors.map(m => `
        <article class="card" data-id="${m.id}">
            <div>
                <div class="name">${esc(host(m.url))}</div>
                <div class="url">${esc(m.url)}</div>
            </div>
            <div class="metric">
                <small>Status</small>
                <strong class="status ${esc(m.status)}">${m.status === "up" ? "Online" : m.status === "down" ? "Offline" : "Pending"}</strong>
            </div>
            <div class="metric">
                <small>Response</small>
                <strong>${m.response_time ? Math.round(m.response_time) + " ms" : "—"}</strong>
            </div>
            <div class="actions">
                <button class="action" data-a="history">History</button>
                <button class="action" data-a="check">${token(m.id) ? "Check now" : "Add token"}</button>
                <button class="action danger" data-a="delete">Delete</button>
            </div>
            <div class="history">Loading…</div>
        </article>
    `).join("");
}

async function load(note = false) {
    try {
        const data = await api('monitors');
        monitors = data.monitors || [];
        render();
        $("#apiState").textContent = "API online ✅";
        if (note) toast("Refreshed ✅");
    } catch (e) {
        console.error('Load error:', e);
        $("#apiState").textContent = "API unavailable ❌";
        $("#list").innerHTML = `
            <div class="empty">
                <b>Could not reach API</b><br>
                ${esc(e.message)}<br><br>
                <span style="font-size:12px;color:#666;">Using proxy: ${API}</span>
            </div>
        `;
    }
}

$("#addForm").addEventListener("submit", async e => {
    e.preventDefault();
    let u = $("#urlInput").value.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    
    const b = $("#addBtn");
    b.disabled = true;
    $("#msg").textContent = "Creating monitor…";
    
    try {
        const data = await api('monitors', {
            method: "POST",
            body: JSON.stringify({ url: u })
        });
        
        if (data.monitor?.token) {
            saveToken(data.monitor.id, data.monitor.token);
        }
        
        $("#urlInput").value = "";
        $("#msg").textContent = "✅ Monitor created.";
        toast("Monitor created — token saved on this browser");
        await load();
    } catch (err) {
        console.error('Create error:', err);
        $("#msg").textContent = "❌ " + err.message;
        toast("Error: " + err.message);
    } finally {
        b.disabled = false;
    }
});

$("#refresh").onclick = () => load(true);

$("#list").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    
    const c = b.closest(".card");
    const id = +c.dataset.id;
    const a = b.dataset.a;
    
    if (a === "history") {
        c.classList.toggle("open");
        if (!c.classList.contains("open")) return;
        
        const h = c.querySelector(".history");
        h.innerHTML = "Loading…";
        
        try {
            const data = await api('history', {}, { id, limit: 12 });
            const checks = data.checks || [];
            h.innerHTML = checks.length ? checks.map(x => `
                <div class="historyItem">
                    <b style="color:${x.success ? '#84ff9b' : '#ff7373'}">${x.success ? "✅ UP" : "❌ DOWN"}</b><br>
                    ${esc(x.status_code)} · ${esc(x.response_time)}ms<br>
                    ${esc(new Date(x.checked_at).toLocaleString())}
                </div>
            `).join("") : "No checks yet.";
        } catch (err) {
            h.innerHTML = "❌ " + esc(err.message);
        }
        return;
    }
    
    let t = token(id);
    if (!t) {
        t = prompt("Paste the secret token for monitor #" + id);
        if (!t) return;
        saveToken(id, t);
    }
    
    if (a === "check") {
        b.disabled = true;
        b.textContent = "Checking…";
        try {
            const result = await api('check', {
                method: "POST",
                headers: { "X-PulseCheck-Token": t }
            }, { id });
            toast(`Check complete: ${result.status === 'up' ? '✅ UP' : '❌ DOWN'}`);
            await load();
        } catch (err) {
            console.error('Check error:', err);
            if (/token/i.test(err.message)) delToken(id);
            toast("❌ " + err.message);
        } finally {
            b.disabled = false;
            b.textContent = "Check now";
        }
    }
    
    if (a === "delete") {
        if (!confirm("Delete this monitor and its history?")) return;
        b.disabled = true;
        try {
            await api('monitors', {
                method: "DELETE",
                headers: { "X-PulseCheck-Token": t },
                body: JSON.stringify({ id })
            });
            delToken(id);
            toast("Monitor deleted 🗑️");
            await load();
        } catch (err) {
            console.error('Delete error:', err);
            if (/token/i.test(err.message)) delToken(id);
            toast("❌ " + err.message);
        } finally {
            b.disabled = false;
            b.textContent = "Delete";
        }
    }
});

load();
setInterval(() => load(), 30000);
