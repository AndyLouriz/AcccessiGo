/* ══════════════════════════════════════════════════════════
   AccessiGo — script.js
   Barangay Sta. Rita Accessibility Mapping App
   ══════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════
const API_BASE = 'http://localhost:3000/api';
let   USE_API  = true;

// ═══════════════════════════════════════════════════════════
//  ADMIN CREDENTIALS  (change these for production)
// ═══════════════════════════════════════════════════════════
const ADMIN_EMAIL    = 'admin@accessigo.ph';
const ADMIN_PASSWORD = 'admin1234';

// ═══════════════════════════════════════════════════════════
//  FALLBACK DATA
// ═══════════════════════════════════════════════════════════
const FALLBACK_LOCATIONS = [
  { id:0,  name:"Barangay Hall — Main Entrance",   type:"ramp",     street:"Sta. Rita St., Zone 1",       description:"Gently sloped concrete ramp, handrails both sides. Wide enough for power wheelchairs.", rating:5, check_ins:14, map_x:"31%", map_y:"44%", audio_cue:"Barangay Hall main entrance ramp ahead. Gentle slope with handrails on both sides. Safe for all wheelchairs.", status:"active" },
  { id:1,  name:"Sta. Rita Parish Church",          type:"ramp",     street:"Church Road, Zone 2",          description:"Newly installed ramp at the main church entrance. No side rail on left; approach carefully.", rating:3, check_ins:9,  map_x:"52%", map_y:"28%", audio_cue:"Sta. Rita Parish Church entrance ahead. Ramp has a gentle slope but no left side rail. Approach with caution.", status:"active" },
  { id:2,  name:"Sta. Rita Day Care Center",        type:"ramp",     street:"Purok 3, Zone 3",              description:"Low ramp at day care entrance. Suitable for strollers and standard wheelchairs.", rating:4, check_ins:7,  map_x:"22%", map_y:"62%", audio_cue:"Sta. Rita Day Care Center ramp ahead on your right. Low incline with smooth surface. Suitable for strollers and wheelchairs.", status:"active" },
  { id:3,  name:"Senior Citizens Center",           type:"ramp",     street:"Rizal Ave., Zone 1",           description:"Dedicated PWD and senior entrance with ramp and grab bars. Well-maintained.", rating:5, check_ins:18, map_x:"68%", map_y:"38%", audio_cue:"Senior Citizens Center ahead. Dedicated accessible entrance on your right with ramp and grab bars. Well maintained.", status:"active" },
  { id:4,  name:"Sta. Rita Health Center",          type:"ramp",     street:"Health Center Rd., Zone 2",    description:"Double ramp at main entrance. One ramp under repair — use the south ramp.", rating:3, check_ins:11, map_x:"44%", map_y:"58%", audio_cue:"Sta. Rita Health Center ahead. Use the south ramp on your right. One ramp is under repair.", status:"active" },
  { id:5,  name:"Public Market — Gate A",           type:"ramp",     street:"Market St., Zone 4",           description:"Accessible ramp at Gate A. Gate B has stairs only.", rating:3, check_ins:6,  map_x:"78%", map_y:"52%", audio_cue:"Public Market Gate A ahead. Ramp access available at this gate. Gate B has stairs only.", status:"active" },
  { id:6,  name:"Barangay Hall — Audio Kiosk",     type:"audio",    street:"Sta. Rita St., Zone 1",        description:"Interactive audio kiosk announcing barangay services, schedules, and emergency contacts.", rating:5, check_ins:10, map_x:"34%", map_y:"46%", audio_cue:"You have arrived at the Barangay Hall audio kiosk. Press the large button to hear available services, schedules, and emergency contacts.", status:"active" },
  { id:7,  name:"Sta. Rita Chapel Wayside",         type:"audio",    street:"Chapel Lane, Zone 2",          description:"Audio waypoint at the chapel intersection. Announces road names and safe crossing directions.", rating:4, check_ins:8,  map_x:"55%", map_y:"31%", audio_cue:"Intersection of Chapel Lane and Rizal Avenue. Traffic light is 10 meters ahead. Safe crossing available.", status:"active" },
  { id:8,  name:"Sta. Rita Elementary School",     type:"audio",    street:"School Road, Zone 3",          description:"Audio guide at school main gate.", rating:4, check_ins:5,  map_x:"62%", map_y:"64%", audio_cue:"Sta. Rita Elementary School main gate ahead. School hours are 7:30 AM to 4:30 PM. Accessible entrance available.", status:"active" },
  { id:9,  name:"Basketball Court Junction",        type:"audio",    street:"Purok 5 Road, Zone 4",         description:"Audio waypoint at the court junction. Active in evenings.", rating:3, check_ins:4,  map_x:"20%", map_y:"35%", audio_cue:"Basketball Court junction. Purok 5 road continues straight.", status:"active" },
  { id:10, name:"Sta. Rita Health Center Desk",    type:"audio",    street:"Health Center Rd., Zone 2",    description:"Audio guide at the health center reception for patients with visual impairments.", rating:5, check_ins:7,  map_x:"47%", map_y:"60%", audio_cue:"Welcome to the Sta. Rita Health Center. Press 1 for check-up.", status:"active" },
  { id:11, name:"Sta. Rita Multi-Purpose Hall",    type:"elevator", street:"Zone 1, near Barangay Hall",   description:"Platform lift for stage access. Request key from barangay staff.", rating:4, check_ins:5,  map_x:"29%", map_y:"50%", audio_cue:"Multi-Purpose Hall platform lift is at the side entrance.", status:"active" },
  { id:12, name:"Sta. Rita Health Center — 2F",    type:"elevator", street:"Health Center Rd., Zone 2",    description:"Small passenger elevator to second floor. Capacity: 3 persons or 1 wheelchair.", rating:3, check_ins:9,  map_x:"46%", map_y:"63%", audio_cue:"Health Center elevator is inside the building, turn left at the main entrance.", status:"active" },
  { id:13, name:"Barangay Hall",                    type:"service",  street:"Sta. Rita St., Zone 1",        description:"Main government office. Services include clearances, assistance programs.", rating:5, check_ins:22, map_x:"31%", map_y:"42%", audio_cue:"Barangay Hall. Main office is straight ahead past the ramp.", status:"active" },
  { id:14, name:"Sta. Rita Health Center",          type:"service",  street:"Health Center Rd., Zone 2",    description:"Free consultations, vaccination, and referral services. PWD priority lane available.", rating:5, check_ins:15, map_x:"43%", map_y:"55%", audio_cue:"Sta. Rita Health Center. PWD and senior citizens have priority lanes.", status:"active" },
  { id:15, name:"Purok 1 Community Store",          type:"service",  street:"Purok 1, Zone 1",              description:"Community-run sari-sari store with wide aisles and low counters.", rating:4, check_ins:3,  map_x:"18%", map_y:"53%", audio_cue:"Purok 1 community store. Wide entrance with no step.", status:"active" },
  { id:16, name:"Water Station — Zone 2",           type:"service",  street:"Rizal Ave., Zone 2",           description:"Accessible water refilling station. Push-button dispensers at wheelchair height.", rating:4, check_ins:4,  map_x:"58%", map_y:"44%", audio_cue:"Water refilling station ahead. Dispensers are at wheelchair height.", status:"active" },
  { id:17, name:"Sta. Rita Elementary School",     type:"service",  street:"School Road, Zone 3",          description:"Public elementary school. Accessible comfort rooms and ground-floor classrooms.", rating:4, check_ins:8,  map_x:"61%", map_y:"62%", audio_cue:"Sta. Rita Elementary School. Accessible comfort rooms near main building.", status:"active" },
  { id:18, name:"Senior Citizens Center",           type:"service",  street:"Rizal Ave., Zone 1",           description:"Social services, livelihood programs, and daily activity center.", rating:5, check_ins:12, map_x:"66%", map_y:"36%", audio_cue:"Senior Citizens Center. Fully accessible building.", status:"active" },
  { id:19, name:"Public Market — Sta. Rita",        type:"service",  street:"Market St., Zone 4",           description:"Main public market. PWD-designated lanes.", rating:3, check_ins:10, map_x:"79%", map_y:"50%", audio_cue:"Sta. Rita Public Market. Use Gate A for ramp access.", status:"active" },
  { id:20, name:"Sta. Rita Fire Station",           type:"service",  street:"Zone 4, Main Road",            description:"Emergency services. Ground floor accessible. Call 117 for fire emergencies.", rating:4, check_ins:3,  map_x:"82%", map_y:"30%", audio_cue:"Fire Station is on your left. Ground floor is accessible.", status:"active" },
  { id:21, name:"Sta. Rita Mini Park",              type:"park",     street:"Zone 2, near Chapel",          description:"Small community park with paved pathways and benches. Fully wheelchair accessible.", rating:5, check_ins:11, map_x:"50%", map_y:"38%", audio_cue:"Sta. Rita Mini Park entrance is ahead. Paved pathways and shaded benches.", status:"active" },
  { id:22, name:"Purok 3 Covered Court",            type:"park",     street:"Purok 3, Zone 3",              description:"Barangay covered court. Level floor, accessible entrances on all sides.", rating:4, check_ins:7,  map_x:"24%", map_y:"70%", audio_cue:"Purok 3 covered court ahead. Level surface, accessible from all sides.", status:"active" },
  { id:23, name:"Zone 4 Barangay Plaza",            type:"park",     street:"Zone 4, Main Road",            description:"Open plaza used for community gatherings. Paved, flat, and accessible.", rating:4, check_ins:6,  map_x:"75%", map_y:"68%", audio_cue:"Barangay Plaza ahead. Open, flat, and paved surface.", status:"active" },
  { id:24, name:"Rizal Ave. Broken Pavement",       type:"danger",   street:"Rizal Ave., Zone 2 corner",    description:"Large crack and sunken pavement near the intersection. Avoid with wheelchairs.", rating:1, check_ins:17, map_x:"60%", map_y:"47%", audio_cue:"Warning! Broken pavement ahead on Rizal Avenue.", status:"active" },
  { id:25, name:"Market St. Flooded Drain",         type:"danger",   street:"Market St., near Gate B",      description:"Open drainage canal floods during rain. No cover. Hazardous after heavy rain.", rating:1, check_ins:13, map_x:"74%", map_y:"55%", audio_cue:"Danger! Open drainage canal on Market Street near Gate B.", status:"active" },
  { id:26, name:"Narrow Sidewalk — Zone 3",         type:"danger",   street:"School Road, Zone 3",          description:"Sidewalk too narrow for wheelchairs due to parked motorcycles.", rating:2, check_ins:8,  map_x:"64%", map_y:"70%", audio_cue:"Caution. Narrow sidewalk on School Road in Zone 3.", status:"active" },
  { id:27, name:"Chapel Road — Steep Incline",      type:"danger",   street:"Chapel Road, Zone 2",          description:"Steep downhill slope. No guardrails. Dangerous for manual wheelchair users when wet.", rating:2, check_ins:9,  map_x:"52%", map_y:"24%", audio_cue:"Warning. Steep incline ahead on Chapel Road. No guardrails.", status:"active" },
];

// ═══════════════════════════════════════════════════════════
//  RUNTIME DATA
// ═══════════════════════════════════════════════════════════
let LOCATIONS = [];

// ═══════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════
let currentFilter  = 'all';
let audioPlaying   = false;
let selLocId       = null;
let navTargetId    = null;
let selReportType  = 'ramp';
let mapZoom        = 1;
let mapPan         = { x: 0, y: 0 };
let isDragging     = false;
let dragStart      = { x: 0, y: 0 };
let currentUser    = null;
let authToken      = null;
let refreshToken   = null;
let toastTimer     = null;
const synth        = window.speechSynthesis;

// Initialize speech synthesis
if (synth) {
  // Load voices
  synth.getVoices();
  // Some browsers load voices asynchronously
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => synth.getVoices();
  }
}

// ═══════════════════════════════════════════════════════════
//  API HELPERS
// ═══════════════════════════════════════════════════════════
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  let res;
  try {
    res = await fetch(API_BASE + path, { ...options, headers });
  } catch {
    USE_API = false;
    throw new Error('Network error');
  }
  if (res.status === 401) {
    const data = await res.json();
    if (data.code === 'TOKEN_EXPIRED' && refreshToken) {
      const refreshed = await fetch(API_BASE + '/auth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshed.ok) {
        const rData = await refreshed.json();
        authToken = rData.token;
        saveTokens(authToken, refreshToken);
        return apiFetch(path, options);
      }
    }
    clearAuth();
    // Don't redirect automatically — let the calling function handle the error
  }
  return res;
}
async function apiGet(path)        { return apiFetch(path, { method: 'GET' }); }
async function apiPost(path, body) { return apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }); }
async function apiPut(path, body)  { return apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }); }
async function apiDelete(path)     { return apiFetch(path, { method: 'DELETE' }); }

// ═══════════════════════════════════════════════════════════
//  AUTH — Token storage
// ═══════════════════════════════════════════════════════════
function saveTokens(a, r) {
  localStorage.setItem('ago_token', a || '');
  localStorage.setItem('ago_refresh', r || '');
}
function loadTokens() {
  authToken    = localStorage.getItem('ago_token')   || null;
  refreshToken = localStorage.getItem('ago_refresh') || null;
}
function clearAuth() {
  authToken = null; refreshToken = null; currentUser = null;
  localStorage.removeItem('ago_token');
  localStorage.removeItem('ago_refresh');
  localStorage.removeItem('ago_user');
}

async function loadAuth() {
  loadTokens();
  const saved = localStorage.getItem('ago_user');
  if (saved) { currentUser = JSON.parse(saved); applyUser(); }
  if (authToken && USE_API) {
    try {
      const res = await fetch(API_BASE + '/auth/me', { headers: { 'Authorization': `Bearer ${authToken}` } });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        localStorage.setItem('ago_user', JSON.stringify(currentUser));
        applyUser();
      } else { clearAuth(); applyGuest(); }
    } catch { /* offline */ }
  }
}

function applyUser() {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'moderator';
  document.getElementById('guest-btns').style.display = 'none';
  document.getElementById('user-btns').style.display  = 'block';

  // Avatar — gold tint for admins
  const avatar = document.getElementById('hdr-avatar');
  avatar.textContent = currentUser.name.charAt(0).toUpperCase();
  avatar.classList.toggle('avatar-admin', isAdmin);

  document.getElementById('hdr-uname').textContent  = currentUser.name.split(' ')[0];
  document.getElementById('drop-name').textContent  = currentUser.name;
  document.getElementById('drop-email').textContent = currentUser.email;

  // Admin-only UI elements
  const roleEl      = document.getElementById('drop-role');
  const adminItem   = document.getElementById('drop-admin-item');
  const adminNavBtn = document.getElementById('nb-admin');
  if (roleEl)      roleEl.style.display      = isAdmin ? 'flex' : 'none';
  if (adminItem)   adminItem.style.display   = isAdmin ? 'flex' : 'none';
  if (adminNavBtn) adminNavBtn.style.display = isAdmin ? 'inline-flex' : 'none';
}

function applyGuest() {
  document.getElementById('guest-btns').style.display = 'flex';
  document.getElementById('user-btns').style.display  = 'none';
  const adminNavBtn = document.getElementById('nb-admin');
  if (adminNavBtn) adminNavBtn.style.display = 'none';
}

// ── Regular auth modals ───────────────────────────────────
function openLogin()  { document.getElementById('login-modal').classList.add('open'); }
function openSignup() { document.getElementById('signup-modal').classList.add('open'); }
function closeAuth()  {
  document.getElementById('login-modal').classList.remove('open');
  document.getElementById('signup-modal').classList.remove('open');
}
function switchToSignup() { closeAuth(); openSignup(); }
function switchToLogin()  { closeAuth(); openLogin(); }

async function doLogin() {
  const email = document.getElementById('li-email').value.trim();
  const pw    = document.getElementById('li-pw').value;
  const err   = document.getElementById('li-err');
  err.classList.remove('show');
  if (USE_API) {
    try {
      const res  = await apiPost('/auth/login', { email, password: pw });
      const data = await res.json();
      if (!res.ok) { err.textContent = data.error || 'Incorrect email or password.'; err.classList.add('show'); return; }
      authToken = data.token; refreshToken = data.refreshToken; currentUser = data.user;
      saveTokens(authToken, refreshToken);
      localStorage.setItem('ago_user', JSON.stringify(currentUser));
      closeAuth(); applyUser();
      showToast('Welcome back, ' + currentUser.name.split(' ')[0] + '!');
      return;
    } catch { /* fall through */ }
  }
  // Offline fallback
  const users = JSON.parse(localStorage.getItem('ago_users') || '[]');
  const found = users.find(u => u.email === email && u.password === pw);
  if (!found) { err.textContent = 'Incorrect email or password.'; err.classList.add('show'); return; }
  currentUser = { id: found.id || Date.now(), name: found.name, email: found.email, role: 'user' };
  localStorage.setItem('ago_user', JSON.stringify(currentUser));
  closeAuth(); applyUser();
  showToast('Welcome back, ' + currentUser.name.split(' ')[0] + '!');
}

async function doSignup() {
  const name  = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pw    = document.getElementById('su-pw').value;
  const err   = document.getElementById('su-err');
  err.classList.remove('show');
  if (!name || !email || pw.length < 6) { err.textContent = 'Please fill all fields (password min 6 chars).'; err.classList.add('show'); return; }
  if (USE_API) {
    try {
      const res  = await apiPost('/auth/register', { name, email, password: pw });
      const data = await res.json();
      if (!res.ok) { err.textContent = data.error || (data.errors?.[0]?.msg) || 'Registration failed.'; err.classList.add('show'); return; }
      authToken = data.token; refreshToken = data.refreshToken; currentUser = data.user;
      saveTokens(authToken, refreshToken);
      localStorage.setItem('ago_user', JSON.stringify(currentUser));
      closeAuth(); applyUser();
      showToast('Account created! Welcome, ' + currentUser.name.split(' ')[0] + '!');
      return;
    } catch { /* fall through */ }
  }
  const users = JSON.parse(localStorage.getItem('ago_users') || '[]');
  if (users.find(u => u.email === email)) { err.textContent = 'Email already registered.'; err.classList.add('show'); return; }
  const newUser = { id: Date.now(), name, email, password: pw, role: 'user', joined: new Date().toLocaleDateString() };
  users.push(newUser);
  localStorage.setItem('ago_users', JSON.stringify(users));
  currentUser = { id: newUser.id, name, email, role: 'user' };
  localStorage.setItem('ago_user', JSON.stringify(currentUser));
  closeAuth(); applyUser();
  showToast('Account created! Welcome, ' + name.split(' ')[0] + '!');
}

async function logout() {
  try { if (USE_API && refreshToken) await apiPost('/auth/logout', { refreshToken }); } catch {}
  clearAuth(); applyGuest(); closeDrop();
  // If on admin view, go back home
  if (document.getElementById('admin-view').classList.contains('active')) showView('home');
  showToast('Signed out successfully.');
}

function toggleDrop() { document.getElementById('user-drop').classList.toggle('open'); }
function closeDrop()  { document.getElementById('user-drop').classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('#user-btns')) closeDrop(); });

// ═══════════════════════════════════════════════════════════
//  ADMIN AUTH
// ═══════════════════════════════════════════════════════════
function openAdminLogin() {
  closeAuth();
  document.getElementById('admin-modal').classList.add('open');
  setTimeout(() => document.getElementById('adm-email').focus(), 100);
}
function closeAdminLogin() {
  document.getElementById('admin-modal').classList.remove('open');
  document.getElementById('adm-err').classList.remove('show');
}

async function doAdminLogin() {
  const email = document.getElementById('adm-email').value.trim();
  const pw    = document.getElementById('adm-pw').value;
  const err   = document.getElementById('adm-err');
  err.classList.remove('show');

  // Try API first
  if (USE_API) {
    try {
      const res  = await apiPost('/auth/login', { email, password: pw });
      const data = await res.json();
      if (res.ok && (data.user.role === 'admin' || data.user.role === 'moderator')) {
        authToken = data.token; refreshToken = data.refreshToken; currentUser = data.user;
        saveTokens(authToken, refreshToken);
        localStorage.setItem('ago_user', JSON.stringify(currentUser));
        closeAdminLogin(); applyUser();
        showToast('Welcome, Admin ' + currentUser.name.split(' ')[0] + '!');
        showView('admin'); refreshAdminDashboard();
        return;
      } else if (res.ok) {
        err.textContent = 'This account does not have admin privileges.';
        err.classList.add('show'); return;
      }
    } catch { /* fall through to local check */ }
  }

  // Offline: hardcoded credentials
  if (email === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
    currentUser = { id: 0, name: 'Administrator', email: ADMIN_EMAIL, role: 'admin' };
    localStorage.setItem('ago_user', JSON.stringify(currentUser));
    closeAdminLogin(); applyUser();
    showToast('Welcome, Administrator!');
    showView('admin'); refreshAdminDashboard();
  } else {
    err.textContent = 'Invalid admin credentials.';
    err.classList.add('show');
  }
}

// Enter key in admin form
document.addEventListener('DOMContentLoaded', () => {
  const admPw = document.getElementById('adm-pw');
  if (admPw) admPw.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
});

// ═══════════════════════════════════════════════════════════
//  VIEWS
// ═══════════════════════════════════════════════════════════
function showView(v) {
  // Guard admin view
  if (v === 'admin') {
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator');
    if (!isAdmin) { showToast('Admin access required.'); openAdminLogin(); return; }
  }
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b  => b.classList.remove('active'));
  document.getElementById(v + '-view').classList.add('active');
  const nb = document.getElementById('nb-' + v);
  if (nb) nb.classList.add('active');
  if (v === 'map')   {
    renderCards();
    buildMarkers();
    // Start location tracking when map is shown
    startLocationTracking();
  }
  if (v === 'admin') { refreshAdminDashboard(); }
}
function gotoMap() { showView('map'); }
function gotoReport() {
  if (!currentUser) { showToast('Please sign in to report a location.'); openLogin(); return; }
  showView('report');
}

// ═══════════════════════════════════════════════════════════
//  MAP SVG
// ═══════════════════════════════════════════════════════════
const MAP_SVG = `
<svg id="main-map-svg" viewBox="0 0 900 800" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <path class="m-water" d="M0 720 Q80 710 160 730 Q240 750 320 725 Q400 700 480 720 Q560 740 640 715 Q720 690 800 710 Q860 720 900 715 L900 800 L0 800Z"/>
  <rect class="m-park" x="340" y="120" width="130" height="100" rx="6"/>
  <rect class="m-park" x="90"  y="390" width="100" height="80"  rx="6"/>
  <rect class="m-park" x="570" y="520" width="120" height="90"  rx="6"/>
  <rect class="m-park" x="760" y="150" width="80"  height="70"  rx="6"/>
  <line class="m-road-major" x1="0"   y1="130" x2="900" y2="130"/>
  <line class="m-road-major" x1="420" y1="0"   x2="420" y2="800"/>
  <line class="m-road-major" x1="0"   y1="540" x2="900" y2="540"/>
  <line class="m-road-major" x1="200" y1="0"   x2="200" y2="800"/>
  <line class="m-road-sec"   x1="0"   y1="280" x2="900" y2="280"/>
  <line class="m-road-sec"   x1="650" y1="0"   x2="650" y2="800"/>
  <line class="m-road-sec"   x1="0"   y1="430" x2="900" y2="430"/>
  <line class="m-road-minor" x1="0"   y1="200" x2="900" y2="200"/>
  <line class="m-road-minor" x1="0"   y1="360" x2="900" y2="360"/>
  <line class="m-road-minor" x1="0"   y1="490" x2="900" y2="490"/>
  <line class="m-road-minor" x1="0"   y1="620" x2="900" y2="620"/>
  <line class="m-road-minor" x1="100" y1="0"   x2="100" y2="800"/>
  <line class="m-road-minor" x1="320" y1="0"   x2="320" y2="800"/>
  <line class="m-road-minor" x1="530" y1="0"   x2="530" y2="800"/>
  <line class="m-road-minor" x1="760" y1="0"   x2="760" y2="800"/>
  <rect class="m-bldg-imp" x="215" y="145" width="90" height="40" rx="3"/>
  <rect class="m-bldg" x="215" y="205" width="60" height="40" rx="3"/>
  <rect class="m-bldg" x="285" y="205" width="25" height="40" rx="3"/>
  <rect class="m-bldg" x="215" y="300" width="90" height="50" rx="3"/>
  <rect class="m-bldg" x="215" y="370" width="90" height="45" rx="3"/>
  <rect class="m-bldg" x="110" y="145" width="70" height="40" rx="3"/>
  <rect class="m-bldg" x="110" y="205" width="70" height="60" rx="3"/>
  <rect class="m-bldg" x="110" y="300" width="70" height="45" rx="3"/>
  <rect class="m-bldg" x="110" y="445" width="70" height="35" rx="3"/>
  <rect class="m-bldg" x="110" y="555" width="70" height="50" rx="3"/>
  <rect class="m-bldg" x="215" y="445" width="90" height="35" rx="3"/>
  <rect class="m-bldg" x="215" y="555" width="90" height="50" rx="3"/>
  <rect class="m-bldg-imp" x="435" y="145" width="80" height="60" rx="3"/>
  <rect class="m-bldg-imp" x="335" y="238" width="70" height="30" rx="3"/>
  <rect class="m-bldg" x="435" y="215" width="80" height="50" rx="3"/>
  <rect class="m-bldg" x="435" y="295" width="80" height="50" rx="3"/>
  <rect class="m-bldg" x="435" y="370" width="80" height="45" rx="3"/>
  <rect class="m-bldg" x="335" y="295" width="70" height="50" rx="3"/>
  <rect class="m-bldg" x="335" y="370" width="70" height="45" rx="3"/>
  <rect class="m-bldg" x="335" y="445" width="70" height="35" rx="3"/>
  <rect class="m-bldg" x="435" y="445" width="80" height="35" rx="3"/>
  <rect class="m-bldg" x="335" y="555" width="70" height="50" rx="3"/>
  <rect class="m-bldg" x="435" y="555" width="80" height="50" rx="3"/>
  <rect class="m-bldg-imp" x="545" y="295" width="90" height="50" rx="3"/>
  <rect class="m-bldg" x="545" y="145" width="90" height="40" rx="3"/>
  <rect class="m-bldg" x="545" y="205" width="90" height="70" rx="3"/>
  <rect class="m-bldg" x="545" y="370" width="90" height="45" rx="3"/>
  <rect class="m-bldg" x="545" y="445" width="90" height="35" rx="3"/>
  <rect class="m-bldg" x="665" y="145" width="80" height="40" rx="3"/>
  <rect class="m-bldg" x="665" y="205" width="80" height="60" rx="3"/>
  <rect class="m-bldg" x="665" y="295" width="80" height="50" rx="3"/>
  <rect class="m-bldg" x="665" y="370" width="80" height="45" rx="3"/>
  <rect class="m-bldg" x="665" y="445" width="80" height="35" rx="3"/>
  <rect class="m-bldg" x="665" y="555" width="80" height="50" rx="3"/>
  <rect class="m-bldg-imp" x="775" y="220" width="70" height="50" rx="3"/>
  <rect class="m-bldg" x="775" y="295" width="70" height="50" rx="3"/>
  <rect class="m-bldg" x="775" y="370" width="70" height="45" rx="3"/>
  <rect class="m-bldg" x="775" y="445" width="70" height="70" rx="3"/>
  <rect class="m-bldg" x="775" y="555" width="70" height="50" rx="3"/>
  <rect class="m-bldg" x="10" y="145" width="75" height="40" rx="3"/>
  <rect class="m-bldg" x="10" y="205" width="75" height="60" rx="3"/>
  <rect class="m-bldg" x="10" y="295" width="75" height="50" rx="3"/>
  <rect class="m-bldg" x="10" y="370" width="75" height="45" rx="3"/>
  <rect class="m-bldg" x="10" y="445" width="75" height="35" rx="3"/>
  <rect class="m-bldg" x="10" y="555" width="75" height="50" rx="3"/>
  <rect class="m-bldg" x="10" y="630" width="870" height="60" rx="3"/>
  <text class="m-road-label" x="30"  y="122">Main Road</text>
  <text class="m-road-label" x="425" y="90">Rizal Avenue</text>
  <text class="m-road-label" x="30"  y="272">Church Road</text>
  <text class="m-road-label" x="30"  y="422">Health Center Rd.</text>
  <text class="m-road-label" x="30"  y="532">Zone 4 Main Road</text>
  <text class="m-road-label" x="205" y="90">Sta. Rita St.</text>
  <text class="m-road-label" x="655" y="90">School Road</text>
  <text class="m-place-label" x="225" y="168">Barangay Hall</text>
  <text class="m-place-sub"   x="225" y="178">Zone 1</text>
  <text class="m-place-label" x="452" y="158">Sta. Rita</text>
  <text class="m-place-sub"   x="452" y="168">Parish Church</text>
  <text class="m-place-label" x="352" y="250">Mini Park</text>
  <text class="m-place-label" x="555" y="310">Elem. School</text>
  <text class="m-place-label" x="672" y="218">Sr. Ctzns. Ctr.</text>
  <text class="m-place-label" x="448" y="460">Health Ctr.</text>
  <text class="m-place-label" x="783" y="458">Public Market</text>
  <text class="m-place-label" x="783" y="233">Fire Station</text>
  <text class="m-place-label" x="98"  y="402">Day Care</text>
  <text class="m-place-label" x="578" y="534">Plaza Z4</text>
  <text style="font-family:'Syne',sans-serif;fill:#333;font-size:11px;font-weight:700" x="130" y="260">ZONE 1</text>
  <text style="font-family:'Syne',sans-serif;fill:#333;font-size:11px;font-weight:700" x="350" y="320">ZONE 2</text>
  <text style="font-family:'Syne',sans-serif;fill:#333;font-size:11px;font-weight:700" x="555" y="490">ZONE 3</text>
  <text style="font-family:'Syne',sans-serif;fill:#333;font-size:11px;font-weight:700" x="790" y="490">ZONE 4</text>
</svg>`;

// ═══════════════════════════════════════════════════════════
//  MAP BUILD & TRANSFORM
// ═══════════════════════════════════════════════════════════
function buildMap(containerId) {
  const wrap = document.querySelector('#' + containerId + ' .map-svg-wrap') || document.getElementById(containerId);
  if (wrap) wrap.innerHTML = MAP_SVG;
  if (containerId === 'map-wrap') {
    const svg = document.getElementById('main-map-svg');
    if (svg) {
      svg.addEventListener('mousedown', e => { isDragging = true; dragStart = { x: e.clientX - mapPan.x, y: e.clientY - mapPan.y }; });
      window.addEventListener('mousemove', e => { if (!isDragging) return; mapPan.x = e.clientX - dragStart.x; mapPan.y = e.clientY - dragStart.y; applyTransform(); });
      window.addEventListener('mouseup', () => { isDragging = false; });
      svg.addEventListener('wheel', e => { e.preventDefault(); mapZoom = Math.min(2.5, Math.max(0.5, mapZoom - e.deltaY * 0.001)); applyTransform(); }, { passive: false });
    }
  }
}
function applyTransform() {
  const svg = document.getElementById('main-map-svg');
  const layer = document.getElementById('marker-layer');
  const ul = document.getElementById('user-loc');
  if (svg)   svg.style.transform   = `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`;
  if (layer) layer.style.transform = `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`;
  if (ul)    ul.style.transform    = `translate(calc(-50% + ${mapPan.x}px), calc(-50% + ${mapPan.y}px))`;
}
function zoomIn()    { mapZoom = Math.min(2.5, mapZoom + 0.2); applyTransform(); }
function zoomOut()   { mapZoom = Math.max(0.5, mapZoom - 0.2); applyTransform(); }
function resetZoom() { mapZoom = 1; mapPan = { x: 0, y: 0 }; applyTransform(); showToast('Map reset'); }

// ═══════════════════════════════════════════════════════════
//  LOCATION NAVIGATION
// ═══════════════════════════════════════════════════════════
let userLocation = null;
let locationWatchId = null;

function locateMe() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by this browser');
    return;
  }

  showToast('Getting your location...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      userLocation = { lat: latitude, lng: longitude };

      if (!isWithinBarangay(latitude, longitude)) {
        showToast('You appear to be outside Barangay Sta. Rita. Location features may be limited.');
        // Still show approximate position on map
        updateUserLocation('50%', '50%');
        return;
      }

      // Convert GPS coordinates to map coordinates
      const mapCoords = gpsToMapCoords(latitude, longitude);

      if (mapCoords) {
        updateUserLocation(mapCoords.x, mapCoords.y);

        // Find and show nearby locations
        const nearby = findNearestLocations(latitude, longitude, 2);
        if (nearby.length > 0) {
          const nearest = nearby[0];
          const distance = Math.round(nearest.distance);
          showToast(`Location found! Nearest: ${nearest.name} (${distance}m away)`);

          // Auto-select the nearest location in the sidebar
          setTimeout(() => {
            const card = document.getElementById('card-' + nearest.id);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              card.style.background = 'rgba(255,255,255,0.1)';
              setTimeout(() => card.style.background = '', 2000);
            }
          }, 1000);
        } else {
          showToast(`Location found: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`);
        }
      }
    },
    (error) => {
      let errorMsg = 'Unable to get your location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'Location access denied. Please enable location permissions in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'Location information unavailable. Check your GPS settings.';
          break;
        case error.TIMEOUT:
          errorMsg = 'Location request timed out. Try again.';
          break;
      }
      showToast(errorMsg);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000 // 5 minutes
    }
  );
}

function gpsToMapCoords(lat, lng) {
  // Barangay Sta. Rita approximate boundaries
  const bounds = {
    north: 14.65,
    south: 14.62,
    east: 121.05,
    west: 121.02
  };

  // Check if coordinates are within barangay bounds
  if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) {
    return null; // Outside barangay area
  }

  // Convert to map percentage coordinates (0-100%)
  const latPercent = ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;
  const lngPercent = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;

  return {
    x: `${lngPercent}%`,
    y: `${latPercent}%`
  };
}

function isWithinBarangay(lat, lng) {
  const bounds = {
    north: 14.65,
    south: 14.62,
    east: 121.05,
    west: 121.02
  };
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

function findNearestLocations(userLat, userLng, limit = 3) {
  if (!LOCATIONS.length) return [];

  return LOCATIONS
    .filter(loc => loc.status === 'active')
    .map(loc => {
      // Convert map percentages back to approximate GPS (simplified)
      const bounds = { north: 14.65, south: 14.62, east: 121.05, west: 121.02 };
      const lat = bounds.north - (parseFloat(loc.map_y || '50%') / 100) * (bounds.north - bounds.south);
      const lng = bounds.west + (parseFloat(loc.map_x || '50%') / 100) * (bounds.east - bounds.west);

      // Calculate distance using Haversine formula (approximate)
      const dLat = (lat - userLat) * Math.PI / 180;
      const dLng = (lng - userLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = 6371 * c * 1000; // Distance in meters

      return { ...loc, distance, lat, lng };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function updateUserLocation(x, y) {
  const userLoc = document.getElementById('user-loc');
  if (userLoc) {
    userLoc.style.left = x;
    userLoc.style.top = y;
    userLoc.style.display = 'block';

    // Add pulse animation to indicate location update
    userLoc.classList.add('location-updated');
    setTimeout(() => userLoc.classList.remove('location-updated'), 1000);
  }
}

function startLocationTracking() {
  if (!navigator.geolocation) return;

  if (locationWatchId) {
    navigator.geolocation.clearWatch(locationWatchId);
  }

  locationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      userLocation = { lat: latitude, lng: longitude };

      const mapCoords = gpsToMapCoords(latitude, longitude);
      if (mapCoords) {
        updateUserLocation(mapCoords.x, mapCoords.y);
      }
    },
    (error) => {
      console.log('Location tracking error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }
  );
}

function stopLocationTracking() {
  if (locationWatchId) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
}


// ═══════════════════════════════════════════════════════════
//  MARKERS
// ═══════════════════════════════════════════════════════════
const ICON = {
  ramp:     `<path d="M3 17l18-10"/><line x1="3" y1="17" x2="3" y2="21"/><line x1="21" y1="7" x2="21" y2="11"/>`,
  audio:    `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`,
  elevator: `<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7l3-3 3 3M9 17l3 3 3-3"/>`,
  danger:   `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  park:     `<path d="M12 22V12m0 0C12 7 7 4 7 4s5 .5 5 8zm0 0c0-7.5 5-8 5-8s-5 3-5 8"/>`,
  service:  `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  info:     `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
};

function buildMarkers() {
  const layer = document.getElementById('marker-layer');
  if (!layer) return;
  layer.innerHTML = '';
  layer.style.pointerEvents = 'none';
  LOCATIONS.filter(l => l.status !== 'pending' && l.status !== 'archived').forEach(loc => {
    if (currentFilter !== 'all' && loc.type !== currentFilter) return;
    const pin = document.createElement('div');
    pin.className = `mpin pin-${loc.type}`;
    pin.id = `loc-${loc.id}`;
    const px = loc.map_x || loc.x || '50%';
    const py = loc.map_y || loc.y || '50%';
    pin.style.cssText = `left:${px};top:${py};pointer-events:all`;
    pin.innerHTML = `
      <div class="mpin-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[loc.type] || ICON.info}</svg>
      </div>
      <div class="mpin-tip">${loc.name}</div>`;
    pin.onclick = () => { selectLoc(loc.id); scrollToCard(loc.id); };
    layer.appendChild(pin);
  });
  document.getElementById('map-count').textContent = LOCATIONS.filter(l => l.status === 'active').length;
}

function scrollToCard(id) {
  const el = document.getElementById('card-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ═══════════════════════════════════════════════════════════
//  LOCATION CARDS
// ═══════════════════════════════════════════════════════════
const TYPE_LABEL = { ramp:'Ramp', audio:'Audio', elevator:'Elevator', danger:'Hazard', park:'Park', service:'Service', info:'Info' };

function renderCards() {
  const q    = document.getElementById('loc-search')?.value.toLowerCase() || '';
  const list = document.getElementById('card-list');
  if (!list) return;
  const filtered = LOCATIONS.filter(l => {
    if (l.status === 'pending' || l.status === 'archived') return false;
    if (currentFilter !== 'all' && l.type !== currentFilter) return false;
    const desc = l.description || l.desc || '';
    return !q || l.name.toLowerCase().includes(q) || l.street.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });
  if (!filtered.length) { list.innerHTML = `<div style="text-align:center;color:var(--g500);padding:28px;font-size:.8rem">No spots found.</div>`; return; }
  list.innerHTML = filtered.map(l => {
    const stars = Math.round(l.rating || 0);
    const desc  = (l.description || l.desc || '').slice(0, 80);
    return `<div class="loc-card lc-${l.type} fade-in" id="card-${l.id}" onclick="selectLoc(${l.id})">
      <div class="lc-head"><div class="lc-name">${l.name}</div><div class="lc-badge lb-${l.type}">${TYPE_LABEL[l.type] || l.type}</div></div>
      <div class="lc-sub">${l.street}<br>${desc}…</div>
      <div class="lc-foot">
        <div class="lc-rating">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}<span style="color:var(--g500);margin-left:3px">${l.check_ins ?? l.ct ?? 0}</span></div>
        <div class="lc-acts">
          <button class="lc-btn" onclick="event.stopPropagation();playLocAudio(${l.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>Audio</button>
          <button class="lc-btn nb" onclick="event.stopPropagation();openNavModal(${l.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>Navigate</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  renderCards(); buildMarkers();
}
function selectLoc(id) {
  selLocId = id;
  const loc = LOCATIONS.find(l => l.id === id);
  if (loc) showToast(loc.name);
}

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
function openNavModal(id) {
  navTargetId = id;
  const loc = LOCATIONS.find(l => l.id === id);
  if (!loc) return;
  document.getElementById('nm-title').textContent = 'Navigate to ' + loc.name;
  document.getElementById('nm-body').textContent  = `Start audio-guided accessible navigation to "${loc.name}" at ${loc.street}? The route will prioritize wheelchair-friendly paths.`;
  document.getElementById('nav-modal').classList.add('open');
}
function closeNav() { document.getElementById('nav-modal').classList.remove('open'); }

function startNav() {
  closeNav();
  if (navTargetId === null) return;
  if (!userLocation) {
    showToast('Please tap My Location first to start navigation');
    return;
  }
  const loc = LOCATIONS.find(l => l.id === navTargetId);
  if (!loc) return;

  const box = document.getElementById('route-box');
  box.classList.add('vis');
  document.getElementById('rb-title').textContent = 'Route — ' + loc.name;

  const userMap = gpsToMapCoords(userLocation.lat, userLocation.lng) || { x: '50%', y: '50%' };
  const targetMap = { x: loc.map_x || loc.x || '50%', y: loc.map_y || loc.y || '50%' };
  const direction = getCardinalDirection(userMap, targetMap);
  const streetName = (loc.street || '').split(',')[0] || 'main road';

  const steps = [
    'Navigation started. Start at your current location.',
    `Head ${direction} toward ${streetName}.`,
    `Follow the accessible route to ${loc.name}.`,
    'You will arrive at your destination soon.'
  ];

  document.getElementById('rb-steps').innerHTML = steps.map((s, i) => `<li class="step"><div class="sdot${i === 0 ? ' on' : ''}"></div><div>${s}</div></li>`).join('');

  drawRoute(userMap, targetMap);
  highlightMapTarget(loc.id);
  centerMapOnRoute(userMap, targetMap);

  let p = 0;
  const fill = document.getElementById('prog-fill');
  fill.style.width = '0%';
  const t = setInterval(() => { p += 1.5; fill.style.width = Math.min(p, 100) + '%'; if (p >= 100) clearInterval(t); }, 60);

  // Speak navigation steps sequentially with delays
  speakNavigationSteps(steps, 0);

  if (USE_API) apiPost(`/locations/${navTargetId}/checkin`, {}).catch(() => {});
  showToast('Navigation started');
}

function speakNavigationSteps(steps, index) {
  if (index >= steps.length) {
    // After all steps, play the location audio cue
    setTimeout(() => playLocAudio(navTargetId), 1000);
    return;
  }

  // Update UI to show current step
  const stepElements = document.querySelectorAll('.step .sdot');
  stepElements.forEach((dot, i) => {
    dot.classList.toggle('on', i === index);
  });

  speak(steps[index]);

  // Schedule next step after current speech ends
  const delay = Math.max(3000, steps[index].length * 50); // Minimum 3 seconds, plus time based on text length
  setTimeout(() => speakNavigationSteps(steps, index + 1), delay);
}

// Test voice assistant function
function testVoiceAssistant() {
  speak('Voice assistant test. This is AccessiGo voice guidance. Navigation instructions will be spoken clearly.');
  showToast('Voice test started');
}
function closeRoute() { document.getElementById('route-box').classList.remove('vis'); stopAudio(); clearRoute(); }

function getCardinalDirection(start, end) {
  const dx = parseFloat(end.x) - parseFloat(start.x);
  const dy = parseFloat(start.y) - parseFloat(end.y);
  const horiz = Math.abs(dx) > 10 ? (dx > 0 ? 'east' : 'west') : '';
  const vert = Math.abs(dy) > 10 ? (dy > 0 ? 'north' : 'south') : '';
  if (vert && horiz) return `${vert} and ${horiz}`;
  if (vert) return vert;
  if (horiz) return horiz;
  return 'forward';
}

function centerMapOnRoute(start, end) {
  const sx = parseFloat(start.x);
  const sy = parseFloat(start.y);
  const ex = parseFloat(end.x);
  const ey = parseFloat(end.y);
  const midX = (sx + ex) / 2;
  const midY = (sy + ey) / 2;
  mapPan.x = -midX + 50;
  mapPan.y = -midY + 50;
  applyTransform();
}

function drawRoute(start, end) {
  clearRoute();
  const layer = document.getElementById('route-layer');
  if (!layer) return;
  const rect = layer.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const sx = rect.width * parseFloat(start.x) / 100;
  const sy = rect.height * parseFloat(start.y) / 100;
  const ex = rect.width * parseFloat(end.x) / 100;
  const ey = rect.height * parseFloat(end.y) / 100;
  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const line = document.createElement('div');
  line.className = 'route-line';
  line.style.width = `${Math.max(dist, 2)}px`;
  line.style.left = `${sx}px`;
  line.style.top = `${sy}px`;
  line.style.transform = `rotate(${angle}rad)`;
  layer.appendChild(line);

  const arrow = document.createElement('div');
  arrow.className = 'route-arrow';
  arrow.style.left = `${ex}px`;
  arrow.style.top = `${ey}px`;
  arrow.style.transform = `translate(-50%, -100%) rotate(${angle}rad)`;
  layer.appendChild(arrow);

  const targetDot = document.createElement('div');
  targetDot.className = 'route-target';
  targetDot.style.left = `${ex}px`;
  targetDot.style.top = `${ey}px`;
  layer.appendChild(targetDot);
}

function clearRoute() {
  const layer = document.getElementById('route-layer');
  if (!layer) return;
  layer.innerHTML = '';
}

function highlightMapTarget(id) {
  document.querySelectorAll('.mpin.highlighted').forEach(el => el.classList.remove('highlighted'));
  const target = document.getElementById('loc-' + id);
  if (target) {
    target.classList.add('highlighted');
    setTimeout(() => target.classList.remove('highlighted'), 4000);
  }
}

function findNearestRamp() {
  if (!userLocation) {
    showToast('Please get your location first using the "My Location" button');
    return;
  }

  const ramps = LOCATIONS.filter(loc => loc.type === 'ramp' && loc.status === 'active');
  if (ramps.length === 0) {
    showToast('No ramps found in the database');
    return;
  }

  const nearestRamp = ramps
    .map(ramp => {
      const bounds = { north: 14.65, south: 14.62, east: 121.05, west: 121.02 };
      const lat = bounds.north - (parseFloat(ramp.map_y || '50%') / 100) * (bounds.north - bounds.south);
      const lng = bounds.west + (parseFloat(ramp.map_x || '50%') / 100) * (bounds.east - bounds.west);
      const dLat = (lat - userLocation.lat) * Math.PI / 180;
      const dLng = (lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c * 1000;
      return { ...ramp, distance, lat, lng };
    })
    .sort((a, b) => a.distance - b.distance)[0];

  if (nearestRamp) {
    const distance = Math.round(nearestRamp.distance);
    showToast(`Nearest ramp: ${nearestRamp.name} (${distance}m away)`);
    const rampId = nearestRamp.id;
    const rampElement = document.getElementById('loc-' + rampId);
    if (rampElement) {
      rampElement.classList.add('highlighted');
      setTimeout(() => rampElement.classList.remove('highlighted'), 3000);
    }
    const card = document.getElementById('card-' + rampId);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.style.background = 'rgba(255,255,255,0.1)';
      setTimeout(() => card.style.background = '', 3000);
    }

    const userMap = gpsToMapCoords(userLocation.lat, userLocation.lng) || { x: '50%', y: '50%' };
    const targetMap = { x: nearestRamp.map_x || nearestRamp.x || '50%', y: nearestRamp.map_y || nearestRamp.y || '50%' };
    drawRoute(userMap, targetMap);
    centerMapOnRoute(userMap, targetMap);
  }
}

// ═══════════════════════════════════════════════════════════
//  AUDIO GUIDANCE
// ═══════════════════════════════════════════════════════════
function playLocAudio(id) {
  const loc = LOCATIONS.find(l => l.id === id);
  if (!loc) return;
  selLocId = id;
  const cue = loc.audio_cue || loc.audio || loc.name + ' is at ' + loc.street + '.';
  setAudioState(true, loc.name, cue.slice(0, 55) + '…');
  speak(cue);
}
function toggleAudio() {
  if (audioPlaying) stopAudio();
  else if (selLocId !== null) playLocAudio(selLocId);
  else { speak('AccessiGo audio guidance is ready. Select a location to begin navigation.'); setAudioState(true, 'AccessiGo Active', 'Select a location to begin'); }
}
function toggleGlobalAudio() {
  if (audioPlaying) stopAudio();
  else { speak('AccessiGo audio guidance is active.'); setAudioState(true, 'Audio Guidance', 'Active'); showToast('Audio guidance enabled'); }
}
function stopAudio() { synth && synth.cancel(); setAudioState(false, 'Audio Guide Ready', 'Select a location to start'); }
function setAudioState(on, title, sub) {
  audioPlaying = on;
  document.getElementById('a-title').textContent     = title;
  document.getElementById('a-sub').textContent       = sub;
  document.getElementById('a-play-ico').style.display  = on ? 'none'  : 'block';
  document.getElementById('a-pause-ico').style.display = on ? 'block' : 'none';
  const wave = document.getElementById('a-wave');
  if (wave) on ? wave.classList.add('playing') : wave.classList.remove('playing');
}
function speak(text) {
  if (!synth) {
    console.warn('Speech synthesis not supported');
    showToast('Voice guidance not available on this device');
    return;
  }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;  // Slightly faster for clearer speech
  u.pitch = 1.1; // Slightly higher pitch for better clarity
  u.lang = 'en-US';
  u.volume = 1.0;

  // Get available voices and use a clear English voice if available
  const voices = synth.getVoices();
  const englishVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Female'));
  if (englishVoice) {
    u.voice = englishVoice;
  }

  u.onstart = () => setAudioState(true, 'Speaking...', text.slice(0, 40) + '...');
  u.onend = () => setAudioState(false, 'Audio Guide Ready', 'Select a location to start');
  u.onerror = (e) => {
    console.error('Speech synthesis error:', e);
    setAudioState(false, 'Audio Guide Ready', 'Voice error - try again');
    showToast('Voice guidance error - please try again');
  };

  try {
    synth.speak(u);
  } catch (error) {
    console.error('Speech synthesis failed:', error);
    showToast('Voice guidance failed to start');
  }
}

// ═══════════════════════════════════════════════════════════
//  REPORT
// ═══════════════════════════════════════════════════════════
function selType(btn, type) {
  document.querySelectorAll('.tybtn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  selReportType = type;
}

async function submitReport() {
  const name   = document.getElementById('rpt-name').value.trim();
  const street = document.getElementById('rpt-street').value.trim();
  const desc   = document.getElementById('rpt-desc').value.trim();
  if (!name || !street) { showToast('Please fill in name and street.'); return; }
  const newLoc = {
    id: LOCATIONS.length > 0 ? Math.max(...LOCATIONS.map(l => l.id)) + 1 : 100,
    name, type: selReportType, street,
    description: desc || 'No description.',
    rating: parseInt(document.getElementById('rpt-rating').value),
    check_ins: 1, map_x: '50%', map_y: '50%',
    audio_cue: document.getElementById('rpt-audio').value || name + ' is at ' + street + '.',
    status: 'pending',
    reporter: document.getElementById('rpt-rname').value.trim() || 'Anonymous',
    submitted: new Date().toLocaleDateString(),
  };
  if (USE_API) {
    try {
      const res  = await apiPost('/locations', { name: newLoc.name, type: newLoc.type, street: newLoc.street, description: newLoc.description, rating: newLoc.rating, audio_cue: newLoc.audio_cue });
      if (res.status === 401) {
        showToast('Your session expired. Please sign in again.');
        setTimeout(() => openLogin(), 500);
        return;
      }
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Submission failed.'); return; }
      if (data.location.status === 'active') { LOCATIONS.push(data.location); updateStats(); }
      ['rpt-name','rpt-street','rpt-desc','rpt-audio','rpt-rname'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      showToast(data.message || 'Location submitted! Thank you.');
      setTimeout(() => showView('map'), 1000);
      return;
    } catch (err) {
      showToast('Network error. Saving offline...');
    }
  }
  // Offline — add to pending list in localStorage
  LOCATIONS.push(newLoc);
  const pending = JSON.parse(localStorage.getItem('ago_pending') || '[]');
  pending.push(newLoc);
  localStorage.setItem('ago_pending', JSON.stringify(pending));
  ['rpt-name','rpt-street','rpt-desc','rpt-audio','rpt-rname'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  showToast('Location submitted for review. Thank you!');
  setTimeout(() => showView('map'), 1000);
}

function recordAudio() {
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) { showToast('Voice input not supported — type instead.'); return; }
  const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'en-US';
  rec.onresult = e => { document.getElementById('rpt-audio').value = e.results[0][0].transcript; showToast('Voice recorded!'); };
  rec.onerror  = () => showToast('Could not record. Type instead.');
  rec.start(); showToast('Listening…');
}

// ═══════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════
function showToast(msg) {
  clearTimeout(toastTimer);
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast').classList.add('show');
  toastTimer = setTimeout(() => document.getElementById('toast').classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════════════════════
//  MINI MAP
// ═══════════════════════════════════════════════════════════
function buildHomeMiniMap() {
  const wrap = document.getElementById('home-map-wrap');
  if (!wrap) return;
  wrap.innerHTML = `<div class="map-grid-bg" style="position:absolute;inset:0;z-index:1"></div><div style="position:absolute;inset:0;z-index:2">${MAP_SVG}</div>`;
  const svg = wrap.querySelector('svg');
  if (svg) { svg.style.cssText = 'width:100%;height:100%;cursor:pointer'; svg.onclick = () => showView('map'); }
  const ml = document.createElement('div');
  ml.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none';
  LOCATIONS.slice(0, 5).forEach(loc => {
    const px = loc.map_x || loc.x || '50%';
    const py = loc.map_y || loc.y || '50%';
    const p  = document.createElement('div');
    p.className = `mpin pin-${loc.type}`;
    p.style.cssText = `left:${px};top:${py};pointer-events:all`;
    p.innerHTML = `<div class="mpin-inner" style="width:20px;height:20px"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="width:9px;height:9px">${ICON[loc.type] || ICON.info}</svg></div><div class="mpin-tip">${loc.name}</div>`;
    p.onclick = () => showView('map');
    ml.appendChild(p);
  });
  wrap.appendChild(ml);
}

// ═══════════════════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════════════════
function updateStats() { const el = document.getElementById('ab-locs'); if (el) el.textContent = LOCATIONS.filter(l => l.status === 'active').length; }
function animateCount(id, end, dur = 1400) {
  const el = document.getElementById(id); if (!el) return;
  let start = 0; const step = end / (dur / 16);
  const t = setInterval(() => { start = Math.min(start + step, end); el.textContent = Math.round(start); if (start >= end) clearInterval(t); }, 16);
}
async function loadStats() {
  if (USE_API) {
    try {
      const res  = await fetch(API_BASE + '/stats');
      if (res.ok) {
        const data = await res.json();
        animateCount('s-locs',    data.totalLocations,   1200);
        animateCount('s-routes',  data.totalRoutes,       1200);
        animateCount('s-contrib', data.totalContributors, 1400);
        animateCount('s-audio',   data.totalAudioGuides,  1200);
        const el = document.getElementById('ab-locs'); if (el) el.textContent = data.totalLocations;
        return;
      }
    } catch {}
  }
  const active = LOCATIONS.filter(l => l.status === 'active');
  animateCount('s-locs',    active.length, 1200);
  animateCount('s-routes',  active.filter(l => ['ramp','elevator','park'].includes(l.type) && l.rating >= 3).length, 1200);
  animateCount('s-contrib', 96, 1400);
  animateCount('s-audio',   active.filter(l => l.type === 'audio').length, 1200);
  updateStats();
}

// ═══════════════════════════════════════════════════════════
//  ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
function adminTab(tab) {
  document.querySelectorAll('.adm-nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
  const navEl = document.getElementById('adn-' + tab);
  const tabEl = document.getElementById('admt-' + tab);
  if (navEl) navEl.classList.add('active');
  if (tabEl) tabEl.classList.add('active');
  if (tab === 'overview')  renderAdminOverview();
  if (tab === 'locations') renderAdminLocations();
  if (tab === 'pending')   renderAdminPending();
  if (tab === 'users')     renderAdminUsers();
}

function refreshAdminDashboard() {
  const admUname = document.getElementById('adm-uname');
  if (admUname && currentUser) admUname.textContent = currentUser.name.split(' ')[0];
  updateAdminCounts();
  renderAdminOverview();
}

function updateAdminCounts() {
  const active  = LOCATIONS.filter(l => l.status === 'active').length;
  const pending = getPendingLocations().length;
  const users   = getUsers().length;
  const audio   = LOCATIONS.filter(l => l.type === 'audio').length;

  setEl('adn-loc-count',   active);
  setEl('adn-pend-count',  pending);
  setEl('adn-user-count',  users);
  setEl('adms-total',      active);
  setEl('adms-pending',    pending);
  setEl('adms-users',      users);
  setEl('adms-audio',      audio);
}

function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// Data helpers
function getPendingLocations() {
  const ls = JSON.parse(localStorage.getItem('ago_pending') || '[]');
  const fromArr = LOCATIONS.filter(l => l.status === 'pending');
  // Merge, deduplicate by id
  const merged = [...fromArr];
  ls.forEach(p => { if (!merged.find(m => m.id === p.id)) merged.push(p); });
  return merged;
}
function getUsers() {
  return JSON.parse(localStorage.getItem('ago_users') || '[]');
}

// ── Overview ─────────────────────────────────────────────
function renderAdminOverview() {
  updateAdminCounts();
  const types  = ['ramp','audio','elevator','service','park','danger'];
  const colors = { ramp:'#d0d0d0', audio:'#909090', elevator:'#666', service:'#686868', park:'#505050', danger:'#444' };
  const active = LOCATIONS.filter(l => l.status === 'active');
  const total  = active.length || 1;
  const bars   = document.getElementById('adm-type-bars');
  if (!bars) return;
  bars.innerHTML = types.map(t => {
    const cnt  = active.filter(l => l.type === t).length;
    const pct  = Math.round((cnt / total) * 100);
    const label = TYPE_LABEL[t] || t;
    return `<div class="adm-bar-row">
      <div class="adm-bar-label">${label}</div>
      <div class="adm-bar-track"><div class="adm-bar-fill" style="width:${pct}%;background:${colors[t]}"></div></div>
      <div class="adm-bar-count">${cnt}</div>
    </div>`;
  }).join('');
}

// ── Locations table ───────────────────────────────────────
function renderAdminLocations() {
  const q    = (document.getElementById('adm-loc-search')?.value || '').toLowerCase();
  const type = document.getElementById('adm-loc-type')?.value || '';
  const tbody = document.getElementById('adm-loc-tbody');
  if (!tbody) return;

  let list = [...LOCATIONS];
  if (type) list = list.filter(l => l.type === type);
  if (q)    list = list.filter(l => l.name.toLowerCase().includes(q) || l.street.toLowerCase().includes(q));

  const sub = document.getElementById('adm-loc-subtitle');
  if (sub) sub.textContent = `${list.length} of ${LOCATIONS.length} locations`;

  if (!list.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--g500);padding:24px">No locations found.</td></tr>`; return; }

  tbody.innerHTML = list.map(l => {
    const stars = Math.round(l.rating || 0);
    const status = l.status || 'active';
    return `<tr>
      <td><div class="adm-td-name">${l.name}</div></td>
      <td><span class="adm-type-pill adm-type-${l.type}">${TYPE_LABEL[l.type] || l.type}</span></td>
      <td class="adm-td-street">${l.street}</td>
      <td>${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</td>
      <td>${l.check_ins ?? l.ct ?? 0}</td>
      <td><span class="adm-status-pill adm-status-${status}">${status}</span></td>
      <td>
        <div class="adm-row-acts">
          <button class="adm-act-btn" onclick="openEditModal(${l.id})" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="adm-act-btn adm-act-del" onclick="deleteLocation(${l.id})" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Pending ───────────────────────────────────────────────
function renderAdminPending() {
  const list = getPendingLocations();
  const el   = document.getElementById('adm-pending-list');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="adm-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;color:var(--g600);margin-bottom:12px"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><div>No pending submissions</div><div style="color:var(--g500);font-size:.78rem;margin-top:4px">All caught up!</div></div>`;
    return;
  }
  el.innerHTML = list.map(l => `
    <div class="adm-pending-card fade-in" id="pcard-${l.id}">
      <div class="adm-pc-top">
        <div>
          <div class="adm-pc-name">${l.name}</div>
          <div class="adm-pc-meta">
            <span class="adm-type-pill adm-type-${l.type}">${TYPE_LABEL[l.type] || l.type}</span>
            <span style="color:var(--g500)">${l.street}</span>
            ${l.reporter ? `<span style="color:var(--g600)">by ${l.reporter}</span>` : ''}
            ${l.submitted ? `<span style="color:var(--g600)">${l.submitted}</span>` : ''}
          </div>
        </div>
        <div class="adm-pc-acts">
          <button class="adm-approve-btn" onclick="approveLocation(${l.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Approve
          </button>
          <button class="adm-reject-btn" onclick="rejectLocation(${l.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </button>
        </div>
      </div>
      ${l.description ? `<div class="adm-pc-desc">${l.description}</div>` : ''}
      ${l.audio_cue   ? `<div class="adm-pc-audio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px;flex-shrink:0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>${l.audio_cue}</div>` : ''}
    </div>`).join('');
}

function approveLocation(id) {
  const loc = LOCATIONS.find(l => l.id === id);
  if (loc) loc.status = 'active';
  // Remove from pending localStorage
  const pending = JSON.parse(localStorage.getItem('ago_pending') || '[]').filter(p => p.id !== id);
  localStorage.setItem('ago_pending', JSON.stringify(pending));
  if (USE_API) apiPost(`/admin/approve/${id}`, {}).catch(() => {});
  showToast('Location approved and published!');
  updateAdminCounts(); renderAdminPending();
}

function rejectLocation(id) {
  LOCATIONS = LOCATIONS.filter(l => l.id !== id);
  const pending = JSON.parse(localStorage.getItem('ago_pending') || '[]').filter(p => p.id !== id);
  localStorage.setItem('ago_pending', JSON.stringify(pending));
  if (USE_API) apiPost(`/admin/reject/${id}`, {}).catch(() => {});
  showToast('Submission rejected.');
  updateAdminCounts(); renderAdminPending();
}

// ── Users ────────────────────────────────────────────────
function renderAdminUsers() {
  const users = getUsers();
  const sub   = document.getElementById('adm-users-sub');
  if (sub) sub.textContent = `${users.length} registered user${users.length !== 1 ? 's' : ''}`;
  const tbody = document.getElementById('adm-users-tbody');
  if (!tbody) return;
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--g500);padding:24px">No registered users yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><div class="adm-td-name">${u.name}</div></td>
      <td style="color:var(--g400)">${u.email}</td>
      <td><span class="adm-status-pill adm-status-${u.role === 'admin' ? 'active' : 'pending'}">${u.role || 'user'}</span></td>
      <td style="color:var(--g500)">${u.joined || '—'}</td>
      <td>
        <div class="adm-row-acts">
          <button class="adm-act-btn adm-act-del" onclick="deleteUser('${u.email}')" title="Remove user">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function deleteUser(email) {
  if (!confirm(`Remove user ${email}? This cannot be undone.`)) return;
  const users = getUsers().filter(u => u.email !== email);
  localStorage.setItem('ago_users', JSON.stringify(users));
  showToast('User removed.');
  renderAdminUsers(); updateAdminCounts();
}

// ── Edit Location Modal ───────────────────────────────────
function openEditModal(id) {
  const loc = LOCATIONS.find(l => l.id === id);
  if (!loc) return;
  document.getElementById('edit-id').value     = id;
  document.getElementById('edit-name').value   = loc.name;
  document.getElementById('edit-type').value   = loc.type;
  document.getElementById('edit-street').value = loc.street;
  document.getElementById('edit-desc').value   = loc.description || loc.desc || '';
  document.getElementById('edit-rating').value = loc.rating || 3;
  document.getElementById('edit-audio').value  = loc.audio_cue || loc.audio || '';
  document.getElementById('edit-status').value = loc.status || 'active';
  document.getElementById('edit-modal').classList.add('open');
}
function closeEditModal() { document.getElementById('edit-modal').classList.remove('open'); }

async function saveEditLocation() {
  const id     = parseInt(document.getElementById('edit-id').value);
  const loc    = LOCATIONS.find(l => l.id === id);
  if (!loc) return;
  loc.name        = document.getElementById('edit-name').value.trim();
  loc.type        = document.getElementById('edit-type').value;
  loc.street      = document.getElementById('edit-street').value.trim();
  loc.description = document.getElementById('edit-desc').value.trim();
  loc.rating      = parseInt(document.getElementById('edit-rating').value);
  loc.audio_cue   = document.getElementById('edit-audio').value.trim();
  loc.status      = document.getElementById('edit-status').value;
  if (USE_API) {
    try {
      await apiPut(`/locations/${id}`, { name: loc.name, type: loc.type, street: loc.street, description: loc.description, rating: loc.rating, audio_cue: loc.audio_cue, status: loc.status });
    } catch {}
  }
  closeEditModal();
  showToast('Location updated successfully.');
  renderAdminLocations(); updateAdminCounts();
}

// ── Delete Location ───────────────────────────────────────
function deleteLocation(id) {
  const loc = LOCATIONS.find(l => l.id === id);
  if (!loc) return;
  if (!confirm(`Delete "${loc.name}"? This cannot be undone.`)) return;
  LOCATIONS = LOCATIONS.filter(l => l.id !== id);
  if (USE_API) apiDelete(`/locations/${id}`).catch(() => {});
  showToast('Location deleted.');
  renderAdminLocations(); updateAdminCounts();
  buildMarkers();
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
async function init() {
  await loadAuth();
  try {
    const res = await fetch(API_BASE + '/locations?limit=200');
    if (res.ok) { const data = await res.json(); LOCATIONS = data.locations || []; }
    else { LOCATIONS = FALLBACK_LOCATIONS; USE_API = false; }
  } catch { LOCATIONS = FALLBACK_LOCATIONS; USE_API = false; }
  buildHomeMiniMap();
  buildMap('map-wrap');
  setTimeout(loadStats, 300);
}

document.getElementById('li-pw').addEventListener('keydown', e => e.key === 'Enter' && doLogin());

init();