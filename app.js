
const API = window.PULSECHECK_API || "/api/proxy.js";
const $ = s => document.querySelector(s);
let monitors = [];

function apiUrl(path, params = {}) {
    const url = new URL(API, window.location.origin);
    url.searchParams.set("path", path);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
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

function saveToken(id, value) {
    const stored = tokens();
    stored[id] = value;
    localStorage.setItem("pulsecheck_tokens", JSON.stringify(stored));
}

function delToken(id) {
    const stored = tokens();
    delete stored[id];
    localStorage.setItem("pulsecheck_tokens", JSON.stringify(stored));
}

async function api(path, options = {}, params = {}) {
    const url = apiUrl(path, params);
    console.log("🔍 Fetching:", url);

    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const raw = await response.text();
    let data;

    try {
        data = raw ? JSON.parse(raw) : {};
    } catch {
        throw new Error(`Server returned invalid JSON (HTTP ${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed (${response.status})`);
    }

    return data;
}

function host(value) {
    try {
        return new URL(value).hostname.replace(/^www\./, "");
    } catch {
        return value;
    }
}

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => element.classList.remove("show"), 2600);
}

function stats() {
    $("#total").textContent = monitors.length;
    $("#up").textContent = monitors.filter(x => x.status === "up").length;
    $("#down").textContent = monitors.filter(x => x.status === "down").length;
    const times = monitors.map(x => Number(x.response_time) || 0).filter(Boolean);
    $("#avg").textContent = times.length
        ? `${Math.round(times.reduce((a, b) => a + b, 0) / times.length)} ms`
        : "—";
}

function render() {
    stats();
    const list = $("#list");

    if (!monitors.length) {
        list.innerHTML = '<div class="empty"><b>No monitors yet</b><br>Add a URL above to create your first monitor.</div>';
        return;
    }

    list.innerHTML = monitors.map(monitor => `
        <article class="card" data-id="${esc(monitor.id)}">
            <div>
                <div class="name">${esc(host(monitor.url))}</div>
                <div class="url">${esc(monitor.url)}</div>
            </div>
            <div class="metric"><small>Status</small><strong class="status ${esc(monitor.status)}">${monitor.status === "up" ? "Online" : monitor.status === "down" ? "Offline" : "Pending"}</strong></div>
            <div class="metric"><small>Response</small><strong>${monitor.response_time ? `${Math.round(monitor.response_time)} ms` : "—"}</strong></div>
            <div class="actions">
                <button class="action" data-a="history" type="button">History</button>
                <button class="action" data-a="check" type="button">${token(monitor.id) ? "Check now" : "Add token"}</button>
                <button class="action danger" data-a="delete" type="button">Delete</button>
            </div>
            <div class="history">Loading…</div>
        </article>
    `).join("");
}

async function load(note = false) {
    try {
        const data = await api("monitors");
        monitors = data.monitors || [];
        render();
        $("#apiState").textContent = "API online ✅";
        if (note) toast("Refreshed ✅");
    } catch (error) {
        console.error("Load error:", error);
        $("#apiState").textContent = "API unavailable ❌";
        $("#list").innerHTML = `<div class="empty"><b>Could not reach API</b><br>${esc(error.message)}<br><br><span class="hint">Using API: ${esc(API)}</span></div>`;
    }
}

$("#addForm").addEventListener("submit", async event => {
    event.preventDefault();
    let url = $("#urlInput").value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    const button = $("#addBtn");
    button.disabled = true;
    $("#msg").textContent = "Creating monitor…";

    try {
        const data = await api("monitors", {
            method: "POST",
            body: JSON.stringify({ url })
        });

        if (data.monitor?.token) saveToken(data.monitor.id, data.monitor.token);
        $("#urlInput").value = "";
        $("#msg").textContent = "✅ Monitor created.";
        toast("Monitor created — token saved on this browser");
        await load();
    } catch (error) {
        console.error("Create error:", error);
        $("#msg").textContent = `❌ ${error.message}`;
        toast(`Error: ${error.message}`);
    } finally {
        button.disabled = false;
    }
});

$("#refresh").onclick = () => load(true);

$("#list").addEventListener("click", async event => {
    const button = event.target.closest("button[data-a]");
    if (!button) return;

    const card = button.closest(".card");
    const id = Number(card.dataset.id);
    const action = button.dataset.a;

    if (action === "history") {
        card.classList.toggle("open");
        if (!card.classList.contains("open")) return;
        const history = card.querySelector(".history");
        history.innerHTML = "Loading…";

        try {
            const data = await api("history", {}, { id, limit: 12 });
            const checks = data.checks || [];
            history.innerHTML = checks.length ? checks.map(check => `
                <div class="historyItem"><b class="${check.success ? "success" : "failure"}">${check.success ? "✅ UP" : "❌ DOWN"}</b><br>
                ${esc(check.status_code)} · ${esc(check.response_time)}ms<br>
                ${esc(new Date(check.checked_at).toLocaleString())}</div>
            `).join("") : "No checks yet.";
        } catch (error) {
            history.innerHTML = `❌ ${esc(error.message)}`;
        }
        return;
    }

    let monitorToken = token(id);
    if (!monitorToken) {
        monitorToken = prompt(`Paste the secret token for monitor #${id}`);
        if (!monitorToken) return;
        saveToken(id, monitorToken);
    }

    if (action === "check") {
        button.disabled = true;
        button.textContent = "Checking…";
        try {
            const result = await api("check", {
                method: "POST",
                headers: { "X-PulseCheck-Token": monitorToken }
            }, { id });
            toast(`Check complete: ${result.status === "up" ? "✅ UP" : "❌ DOWN"}`);
            await load();
        } catch (error) {
            if (/token/i.test(error.message)) delToken(id);
            toast(`❌ ${error.message}`);
        } finally {
            button.disabled = false;
            button.textContent = "Check now";
        }
    }

    if (action === "delete") {
        if (!confirm("Delete this monitor and its history?")) return;
        button.disabled = true;
        try {
            await api("monitors", {
                method: "DELETE",
                headers: { "X-PulseCheck-Token": monitorToken },
                body: JSON.stringify({ id })
            });
            delToken(id);
            toast("Monitor deleted 🗑️");
            await load();
        } catch (error) {
            if (/token/i.test(error.message)) delToken(id);
            toast(`❌ ${error.message}`);
        } finally {
            button.disabled = false;
            button.textContent = "Delete";
        }
    }
});

load();
setInterval(() => load(), 30000);
