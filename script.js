const API_URL = "https://api.yupra.my.id/api/ai/copilot";

let sessions = JSON.parse(localStorage.getItem('pk_sessions') || '[]');
let currentId = null;
let isStreaming = false;

window.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  if (sessions.length) {
    loadSession(sessions[sessions.length - 1].id);
  }
});

function getSession(id) {
  return sessions.find(s => s.id === (id || currentId));
}

function save() {
  localStorage.setItem('pk_sessions', JSON.stringify(sessions));
}

function newChat() {
  const id = Date.now().toString();
  sessions.push({ id, title: 'New chat', messages: [] });
  save();
  loadSession(id);
  closeSidebar();
}

function loadSession(id) {
  currentId = id;
  renderHistory();
  const session = getSession();
  const list = document.getElementById('messages-list');
  const welcome = document.getElementById('welcome');
  list.innerHTML = '';
  if (!session || session.messages.length === 0) {
    welcome.style.display = 'flex';
    list.style.display = 'none';
  } else {
    welcome.style.display = 'none';
    list.style.display = 'flex';
    session.messages.forEach(m => appendBubble(m.role, m.content, false));
    scrollToBottom();
  }
}

function renderHistory() {
  const el = document.getElementById('history-list');
  if (!sessions.length) {
    el.innerHTML = '<div style="padding:12px 18px;font-size:12.5px;color:var(--text-dim)">No chats yet</div>';
    return;
  }
  el.innerHTML = [...sessions].reverse().map(s => `
    <div class="h-item ${s.id === currentId ? 'active' : ''}" onclick="loadSession('${s.id}')">
      <span class="h-icon">💬</span>
      <span style="overflow:hidden;text-overflow:ellipsis">${escHtml(s.title)}</span>
    </div>
  `).join('');
}

function clearHistory() {
  if (!confirm('Clear all chat history?')) return;
  sessions = [];
  currentId = null;
  save();
  renderHistory();
  document.getElementById('messages-list').innerHTML = '';
  document.getElementById('messages-list').style.display = 'none';
  document.getElementById('welcome').style.display = 'flex';
}

async function sendMessage(text) {
  const input = document.getElementById('msg-input');
  const msg = (text !== undefined ? text : input.value).trim();
  if (!msg || isStreaming) return;

  if (!currentId) newChat();

  const session = getSession();
  input.value = '';
  autoResize(input);

  document.getElementById('welcome').style.display = 'none';
  const list = document.getElementById('messages-list');
  list.style.display = 'flex';

  session.messages.push({ role: 'user', content: msg });
  if (session.title === 'New chat') session.title = msg.slice(0, 44) + (msg.length > 44 ? '…' : '');
  save();
  renderHistory();
  appendBubble('user', msg);
  scrollToBottom();

  const typingEl = showTyping();
  isStreaming = true;
  setSendDisabled(true);

  try {
    const res = await fetch(`${API_URL}?text=${encodeURIComponent(msg)}`, {
      method: 'GET'
    });

    typingEl.remove();

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    let reply = data.result || "I'm sorry, I couldn't process that.";

    session.messages.push({ role: 'assistant', content: reply });
    save();
    appendBubble('ai', reply);
    scrollToBottom();

  } catch (err) {
    if (document.getElementById('typing-wrap')) typingEl.remove();
    showToast('⚠️ Error connecting to kervens API');
    console.error('KERVENS API error:', err);
  }

  isStreaming = false;
  setSendDisabled(false);
}

function appendBubble(role, content, doScroll = true) {
  const list = document.getElementById('messages-list');
  const wrap = document.createElement('div');
  wrap.className = `msg-wrap ${role === 'user' ? 'user' : 'ai'}`;

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  const av = document.createElement('div');
  av.className = `avatar ${role === 'user' ? 'u' : 'a'}`;
  av.textContent = role === 'user' ? 'You' : '🤖';
  const name = document.createElement('span');
  name.textContent = role === 'user' ? 'You' : 'KERVENS AI';

  if (role === 'user') { meta.appendChild(name); meta.appendChild(av); }
  else { meta.appendChild(av); meta.appendChild(name); }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (role === 'ai') {
    bubble.innerHTML = renderMD(content);
    bubble.querySelectorAll('pre code').forEach(el => {
      hljs.highlightElement(el);
      const pre = el.parentElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      const btn = document.createElement('button');
      btn.className = 'copy-btn'; btn.textContent = 'Copy';
      btn.onclick = () => { navigator.clipboard.writeText(el.textContent); btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 2000); };
      wrapper.appendChild(btn);
    });
  } else {
    bubble.textContent = content;
  }

  wrap.appendChild(meta);
  wrap.appendChild(bubble);
  list.appendChild(wrap);
  if (doScroll) scrollToBottom();
}

function showTyping() {
  const list = document.getElementById('messages-list');
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap ai'; wrap.id = 'typing-wrap';
  const meta = document.createElement('div'); meta.className = 'msg-meta';
  const av = document.createElement('div'); av.className = 'avatar a'; av.textContent = '🤖';
  const name = document.createElement('span'); name.textContent = 'KERVENS AI';
  meta.appendChild(av); meta.appendChild(name);
  const bubble = document.createElement('div');
  bubble.className = 'bubble typing-bubble';
  bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  wrap.appendChild(meta); wrap.appendChild(bubble);
  list.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function renderMD(text) {
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
    return marked.parse(text);
  }
  return text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function scrollToBottom() {
  const a = document.getElementById('msg-area');
  requestAnimationFrame(() => { a.scrollTop = a.scrollHeight; });
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 180) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function setSendDisabled(v) {
  document.getElementById('send-btn').disabled = v;
}

function useSuggestion(text) {
  document.getElementById('msg-input').value = text;
  autoResize(document.getElementById('msg-input'));
  sendMessage();
}

let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-btn').textContent = isDark ? '🌙' : '☀️';
}

function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5000);
}
