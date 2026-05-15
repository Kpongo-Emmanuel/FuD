/* ===== CONSTANTS ===== */
const APP_NAME = 'Füd';
const PLATFORM_FEE = 25;
const POLL_INTERVAL = 30000; // 30 seconds
const PAGE_SIZE = 8;         // rows per page in admin tables

/* ===== APP STATE ===== */
const state = {
  currentUser: null,
  cart: [],
  cartRestaurantId: null,
  notifications: [],
  _pollTimer: null,
  _pollPage: null,
  _countdownTimer: null,
  _countdownVal: 30,
};

/* ===== LOCAL STORAGE HELPERS ===== */
const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('fud_' + key)) || null; } catch { return null; } },
  set: (key, val) => localStorage.setItem('fud_' + key, JSON.stringify(val)),
  del: (key) => localStorage.removeItem('fud_' + key),
  getArr: (key) => { const v = DB.get(key); return Array.isArray(v) ? v : []; },
};

/* ===== SEED DATA ===== */
function seedData() {
  if (DB.get('seeded')) return;

  const users = [
    { id:'u1', email:'admin@fud.ng', password:'admin123', role:'admin', name:'Platform Admin', verified:true, setupComplete:true, createdAt: Date.now() - 864e5*30 },
    { id:'u2', email:'adaobi@uni.ng', password:'pass123', role:'student', name:'Adaobi Okafor', verified:true, setupComplete:true, phone:'08012345678', address:'Block C, Room 12, Bello Hall', wallet:4500, createdAt: Date.now() - 864e5*20 },
    { id:'u3', email:'emeka@uni.ng', password:'pass123', role:'student', name:'Emeka Nwosu', verified:true, setupComplete:true, phone:'08023456789', address:'Off-campus, No. 5 Stadium Rd', wallet:8200, createdAt: Date.now() - 864e5*15 },
    { id:'u4', email:'info@mamatemis.ng', password:'pass123', role:'restaurant', name:'Mama Temi', verified:true, setupComplete:true, restaurantId:'r1', createdAt: Date.now() - 864e5*60 },
    { id:'u5', email:'hello@campusshawarma.ng', password:'pass123', role:'restaurant', name:'Campus Shawarma', verified:true, setupComplete:true, restaurantId:'r2', createdAt: Date.now() - 864e5*45 },
    { id:'u6', email:'fresh@healthybites.ng', password:'pass123', role:'restaurant', name:'Healthy Bites', verified:true, setupComplete:true, restaurantId:'r3', createdAt: Date.now() - 864e5*30 },
    { id:'u7', email:'ops@swiftrun.ng', password:'pass123', role:'company', name:'SwiftRun Logistics', verified:true, setupComplete:true, companyId:'c1', createdAt: Date.now() - 864e5*50 },
    { id:'u8', email:'delivery@campusexpress.ng', password:'pass123', role:'company', name:'Campus Express', verified:true, setupComplete:true, companyId:'c2', createdAt: Date.now() - 864e5*40 },
    { id:'c1a', email:'tunde@courier.ng', password:'pass123', role:'courier', name:'Tunde Adeyemi', verified:true, setupComplete:true, companyId:'c1', courierId:'cr1', phone:'08034567890', createdAt: Date.now() - 864e5*25 },
    { id:'c1b', email:'ngozi@courier.ng', password:'pass123', role:'courier', name:'Ngozi Eze', verified:true, setupComplete:true, companyId:'c1', courierId:'cr2', phone:'08045678901', createdAt: Date.now() - 864e5*20 },
    { id:'c2a', email:'seun@courier.ng', password:'pass123', role:'courier', name:'Seun Olamide', verified:true, setupComplete:true, companyId:'c2', courierId:'cr3', phone:'08056789012', createdAt: Date.now() - 864e5*15 },
  ];

  const restaurants = [
    {
      id:'r1', ownerId:'u4', name:"Mama Temi's Kitchen", description:'Authentic Nigerian home-cooked meals made fresh daily. From Jollof rice to egusi soup, we serve the taste of home.',
      emoji:'🍲', cuisine:'Nigerian', rating:4.8, reviewCount:127, deliveryFee:200, openTime:'08:00', closeTime:'21:00',
      isOpen:true, address:'Block A, NUGA Complex, Campus', phone:'08012301230', promoCodes:[{code:'MAMA10',type:'percent',value:10,min:1000}],
      items:[
        {id:'i1', name:'Jollof Rice', price:1500, category:'Rice Dishes', emoji:'🍛', desc:'Party-style jollof rice with tomato stew, served with coleslaw.'},
        {id:'i2', name:'Fried Rice + Chicken', price:2000, category:'Rice Dishes', emoji:'🍚', desc:'Nigerian-style fried rice with grilled chicken. A campus favourite.'},
        {id:'i3', name:'Egusi Soup + Eba', price:1800, category:'Swallow & Soups', emoji:'🥘', desc:'Rich egusi soup with stockfish and smoked beef, served with eba.'},
        {id:'i4', name:'Pounded Yam + Banga', price:2200, category:'Swallow & Soups', emoji:'🫕', desc:'Smooth pounded yam with Delta-style banga soup and assorted meat.'},
        {id:'i5', name:'Moi Moi (2 wraps)', price:600, category:'Small Bites', emoji:'🟫', desc:'Steamed bean pudding wrapped in banana leaf, made with blended peppers and fish.'},
        {id:'i6', name:'Fried Plantain', price:400, category:'Small Bites', emoji:'🍌', desc:'Ripe plantain slices, fried golden-brown. Perfect as a side.'},
        {id:'i7', name:'Chapman Drink', price:500, category:'Drinks', emoji:'🍹', desc:'Classic Nigerian party drink – fruity, cold and refreshing.'},
        {id:'i8', name:'Water (50cl)', price:150, category:'Drinks', emoji:'💧', desc:'Cold sachet water or bottled water, your choice.'},
      ]
    },
    {
      id:'r2', ownerId:'u5', name:'Campus Shawarma Spot', description:'Hot, fresh shawarma and fast bites made to order. Serving the campus since 2019.',
      emoji:'🌯', cuisine:'Fast Food', rating:4.5, reviewCount:243, deliveryFee:150, openTime:'11:00', closeTime:'23:00',
      isOpen:true, address:'Near SUB Building, Main Campus', phone:'08023402340', promoCodes:[{code:'CAMPUS200',type:'flat',value:200,min:800}],
      items:[
        {id:'i9',  name:'Chicken Shawarma', price:1500, category:'Shawarma', emoji:'🌯', desc:'Crispy chicken strips, lettuce, onion, ketchup & mayo in a warm tortilla wrap.'},
        {id:'i10', name:'Beef Shawarma',    price:1800, category:'Shawarma', emoji:'🌯', desc:'Spiced beef strips with tomato, lettuce and special sauce in a wrap.'},
        {id:'i11', name:'Veggie Wrap',      price:1200, category:'Shawarma', emoji:'🥙', desc:'Fresh vegetables, hummus, and cheese in a warm wrap. Great for vegetarians.'},
        {id:'i12', name:'Small Chops',      price:800,  category:'Sides', emoji:'🍢', desc:'Puff-puff, fried yam, chicken bites. Perfect for sharing (or not).'},
        {id:'i13', name:'Loaded Fries',     price:900,  category:'Sides', emoji:'🍟', desc:'Crispy fries topped with grilled chicken, cheese sauce and peppers.'},
        {id:'i14', name:'Suya (portion)',   price:1200, category:'Sides', emoji:'🍖', desc:'Spiced beef suya on a stick, served with onions and suya spice.'},
        {id:'i15', name:'Soft Drink (35cl)',price:400,  category:'Drinks', emoji:'🥤', desc:'Coke, Fanta, or Sprite – cold and ready to go.'},
        {id:'i16', name:'Zobo Drink',       price:300,  category:'Drinks', emoji:'🍷', desc:'Homemade zobo with pineapple, ginger and a hint of mint.'},
      ]
    },
    {
      id:'r3', ownerId:'u6', name:'Healthy Bites', description:'Nutritious, delicious meals for students who take their health seriously. No junk, all love.',
      emoji:'🥗', cuisine:'Healthy', rating:4.6, reviewCount:89, deliveryFee:180, openTime:'07:30', closeTime:'20:00',
      isOpen:true, address:'Faculty of Science Building, Campus', phone:'08034503450', promoCodes:[],
      items:[
        {id:'i17', name:'Grilled Chicken + Salad', price:2500, category:'Mains', emoji:'🍗', desc:'Herb-marinated grilled chicken breast with a fresh garden salad and lemon dressing.'},
        {id:'i18', name:'Veggie Power Bowl',       price:2000, category:'Mains', emoji:'🥗', desc:'Brown rice, roasted veggies, chickpeas, avocado and a tahini drizzle.'},
        {id:'i19', name:'Brown Rice + Stew',       price:1500, category:'Mains', emoji:'🍛', desc:'Nutrient-rich brown rice with low-oil tomato-based stew and grilled fish.'},
        {id:'i20', name:'Grilled Tilapia',         price:2800, category:'Mains', emoji:'🐟', desc:'Whole tilapia seasoned and grilled, served with steamed veggies and plantain.'},
        {id:'i21', name:'Oats & Honey Bowl',       price:600,  category:'Breakfast', emoji:'🥣', desc:'Warm oats with honey drizzle, banana slices and mixed nuts.'},
        {id:'i22', name:'Fruit Smoothie',          price:800,  category:'Drinks', emoji:'🥤', desc:'Blend of seasonal fruits – choose between mango-ginger or pineapple-mint.'},
      ]
    },
  ];

  const couriers = [
    { id:'cr1', companyId:'c1', userId:'c1a', name:'Tunde Adeyemi', phone:'08034567890', verified:true, status:'available', deliveriesCompleted:47, rating:4.9 },
    { id:'cr2', companyId:'c1', userId:'c1b', name:'Ngozi Eze',     phone:'08045678901', verified:true, status:'busy', deliveriesCompleted:31, rating:4.7 },
    { id:'cr3', companyId:'c2', userId:'c2a', name:'Seun Olamide',  phone:'08056789012', verified:true, status:'available', deliveriesCompleted:58, rating:4.8 },
  ];

  const companies = [
    { id:'c1', ownerId:'u7', name:'SwiftRun Logistics',  serviceCharge:300, phone:'08070010001', totalCouriers:2, activeOrders:3 },
    { id:'c2', ownerId:'u8', name:'Campus Express',      serviceCharge:250, phone:'08080010002', totalCouriers:1, activeOrders:1 },
  ];

  const now = Date.now();
  const orders = [
    { id:'ord1', studentId:'u2', restaurantId:'r1', restaurantName:"Mama Temi's Kitchen",
      items:[{id:'i1',name:'Jollof Rice',price:1500,qty:2,emoji:'🍛'},{id:'i6',name:'Fried Plantain',price:400,qty:1,emoji:'🍌'}],
      subtotal:3400, deliveryFee:200, serviceCharge:300, platformFee:25, discount:0, promoCode:null,
      total:3925, status:'delivered', courierId:'cr1', courierName:'Tunde Adeyemi', companyId:'c1',
      address:'Block C, Room 12, Bello Hall', createdAt: now - 864e5*3, deliveredAt: now - 864e5*3 + 2400000,
      rating: 5, review: 'Amazing food! Mama Temi never disappoints.', reviewed: true },
    { id:'ord2', studentId:'u3', restaurantId:'r2', restaurantName:'Campus Shawarma Spot',
      items:[{id:'i9',name:'Chicken Shawarma',price:1500,qty:2,emoji:'🌯'},{id:'i15',name:'Soft Drink',price:400,qty:2,emoji:'🥤'}],
      subtotal:3800, deliveryFee:150, serviceCharge:300, platformFee:25, discount:200, promoCode:'CAMPUS200',
      total:4075, status:'delivered', courierId:'cr1', courierName:'Tunde Adeyemi', companyId:'c1',
      address:'Off-campus, No. 5 Stadium Rd', createdAt: now - 864e5*5, deliveredAt: now - 864e5*5 + 1800000,
      rating: 4, review: null, reviewed: false },
    { id:'ord3', studentId:'u2', restaurantId:'r2', restaurantName:'Campus Shawarma Spot',
      items:[{id:'i10',name:'Beef Shawarma',price:1800,qty:1,emoji:'🌯'},{id:'i12',name:'Small Chops',price:800,qty:1,emoji:'🍢'}],
      subtotal:2600, deliveryFee:150, serviceCharge:250, platformFee:25, discount:0, promoCode:null,
      total:3025, status:'preparing', courierId:null, courierName:null, companyId:'c2',
      address:'Block C, Room 12, Bello Hall', createdAt: now - 1800000,
      rating: null, review: null, reviewed: false },
    { id:'ord4', studentId:'u3', restaurantId:'r1', restaurantName:"Mama Temi's Kitchen",
      items:[{id:'i3',name:'Egusi Soup + Eba',price:1800,qty:1,emoji:'🥘'}],
      subtotal:1800, deliveryFee:200, serviceCharge:300, platformFee:25, discount:0, promoCode:null,
      total:2325, status:'accepted', courierId:'cr2', courierName:'Ngozi Eze', companyId:'c1',
      address:'Off-campus, No. 5 Stadium Rd', createdAt: now - 3600000,
      rating: null, review: null, reviewed: false },
  ];

  const reviews = [
    { id:'rv1', orderId:'ord1', restaurantId:'r1', studentId:'u2', studentName:'Adaobi O.', rating:5, comment:'Amazing food! The jollof rice was perfect and delivery was fast. 10/10 would order again!', reported:false, response:"Thank you Adaobi! We're so happy you loved it. See you next time! 💛", createdAt: now - 864e5*2 },
    { id:'rv2', orderId:'ord2', restaurantId:'r2', studentId:'u3', studentName:'Emeka N.', rating:4, comment:'Good shawarma, could have been a little hotter. But the promo made it worth it!', reported:false, response:null, createdAt: now - 864e5*4 },
  ];

  DB.set('users', users);
  DB.set('restaurants', restaurants);
  DB.set('couriers', couriers);
  DB.set('companies', companies);
  DB.set('orders', orders);
  DB.set('reviews', reviews);
  DB.set('seeded', true);
}

/* ===== UTILITIES ===== */
const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG');
const fmtDate = (ts) => ts ? new Date(ts).toLocaleString('en-NG', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const fmtDateShort = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', {day:'numeric',month:'short',year:'numeric'}) : '—';
const uid = () => 'id_' + Math.random().toString(36).slice(2, 10);
const el = (id) => document.getElementById(id);
const escape = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const starsHTML = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5-Math.round(n));

/* ===== PAGINATION HELPER ===== */
function paginate(arr, page) {
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  return {
    items: arr.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE),
    page: p, pages, total
  };
}

function paginationHTML(pages, page, navFn) {
  if (pages <= 1) return '';
  let h = `<div class="pagination" style="margin-top:20px">`;
  h += `<button class="page-btn" ${page===1?'disabled':''} onclick="${navFn}(${page-1})">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      h += `<button class="page-btn ${i===page?'active':''}" onclick="${navFn}(${i})">${i}</button>`;
    } else if (i === 2 || i === pages - 1) {
      h += `<span class="page-ellipsis">...</span>`;
    }
  }
  h += `<button class="page-btn" ${page===pages?'disabled':''} onclick="${navFn}(${page+1})">›</button>`;
  return h + '</div>';
}

function statusBadge(status) {
  const map = {
    pending:   ['badge-yellow','⏳ Pending'],
    accepted:  ['badge-blue','✅ Accepted'],
    preparing: ['badge-orange','👨‍🍳 Preparing'],
    ready:     ['badge-green','📦 Ready'],
    picked_up: ['badge-blue','🚴 On the way'],
    delivered: ['badge-green','✔ Delivered'],
    cancelled: ['badge-red','✖ Cancelled'],
    available: ['badge-green','● Available'],
    busy:      ['badge-orange','● Busy'],
    offline:   ['badge-gray','● Offline'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

/* ===== TOAST ===== */
function toast(msg, type='info', dur=3500) {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type === 'info' ? '' : type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  el('toast-container').appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => t.remove(), 300); }, dur);
}

/* ===== MODAL ===== */
function openModal(html) {
  el('modal-box').innerHTML = html;
  el('overlay').classList.remove('hidden');
  el('modal').classList.remove('hidden');
}
function closeModal() {
  el('overlay').classList.add('hidden');
  el('modal').classList.add('hidden');
  el('modal-box').innerHTML = '';
}

/* ===== SIDEBAR TOGGLE — STEP 1 ===== */
function openSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = el('sidebar-overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = el('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ===== STEP 3: OPEN/CLOSED HELPER ===== */
// Checks real clock time against the restaurant's openTime/closeTime,
// AND respects the manual isOpen toggle (if false, always closed).
function isOpenNow(r) {
  if (!r.isOpen) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = r.openTime.split(':').map(Number);
  const [ch, cm] = r.closeTime.split(':').map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

/* ===== STEP 2: LIVE POLLING ===== */
const POLL_PAGES = {
  '/restaurant/dashboard': _snapshotRestaurant,
  '/restaurant/orders':    _snapshotRestaurant,
  '/student/tracking':     _snapshotTracking,
};

function _snapshotRestaurant() {
  const rest = DB.getArr('restaurants').find(r => r.id === state.currentUser?.restaurantId);
  if (!rest) return '';
  return DB.getArr('orders').filter(o => o.restaurantId === rest.id).map(o => o.id + ':' + o.status).join('|');
}

function _snapshotTracking() {
  const id = location.hash.replace('#','').split('?id=')[1];
  if (!id) return '';
  const order = DB.getArr('orders').find(o => o.id === id);
  return order ? order.status : '';
}

function startPolling(path) {
  stopPolling();
  if (!POLL_PAGES[path]) return;
  state._pollPage = path;
  state._countdownVal = POLL_INTERVAL / 1000;
  let last = POLL_PAGES[path]();

  state._pollTimer = setInterval(() => {
    const cur = location.hash.replace('#','').split('?')[0];
    if (cur !== state._pollPage) { stopPolling(); return; }
    const snap = POLL_PAGES[path]();
    if (snap !== last) {
      last = snap;
      _silentRefresh(path);
      if (path !== '/student/tracking') {
        const rest = DB.getArr('restaurants').find(r => r.id === state.currentUser?.restaurantId);
        if (rest) {
          const newPending = DB.getArr('orders').filter(o => o.restaurantId === rest.id && o.status === 'pending');
          if (newPending.length) toast(`🛎️ ${newPending.length} new order${newPending.length > 1 ? 's' : ''} waiting!`, 'info', 5000);
        }
      }
    }
    _tickCountdown();
  }, POLL_INTERVAL);

  // Countdown ticker
  if (state._countdownTimer) clearInterval(state._countdownTimer);
  state._countdownTimer = setInterval(_tickCountdown, 1000);
}

function stopPolling() {
  if (state._pollTimer)     { clearInterval(state._pollTimer);     state._pollTimer = null; }
  if (state._countdownTimer){ clearInterval(state._countdownTimer); state._countdownTimer = null; }
  state._pollPage = null;
}

function _tickCountdown() {
  state._countdownVal = Math.max(0, state._countdownVal - 1);
  if (state._countdownVal <= 0) state._countdownVal = POLL_INTERVAL / 1000;
  const el2 = el('poll-countdown');
  if (el2) el2.textContent = state._countdownVal + 's';
}

function _silentRefresh(path) {
  const renders = {
    '/restaurant/dashboard': renderRestaurantDashboard,
    '/restaurant/orders':    renderRestaurantOrders,
    '/student/tracking':     () => { const id = location.hash.replace('#','').split('?id=')[1]; return renderStudentTracking({ id }); },
  };
  const fn = renders[path];
  if (!fn) return;
  const scrollY = window.scrollY;
  el('app').innerHTML = fn() || '';
  setupPageEvents();
  window.scrollTo(0, scrollY);
  // Restart countdown display after DOM refresh
  if (state._countdownTimer) clearInterval(state._countdownTimer);
  state._countdownTimer = setInterval(_tickCountdown, 1000);
}

function liveBadgeHTML() {
  return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:0.8rem;color:var(--success);font-weight:600">
    <span class="live-dot"></span>Live · <span id="poll-countdown">${state._countdownVal}s</span>
  </span>`;
}

/* ===== ROUTER ===== */
function getRoute() {
  const h = location.hash.replace('#','') || '/';
  const [path, qs] = h.split('?');
  const params = {};
  if (qs) qs.split('&').forEach(p => { const [k,v]=p.split('='); params[k]=decodeURIComponent(v||''); });
  return { path: path || '/', params };
}

function navigate(path) {
  if (window.innerWidth <= 900) closeSidebar();
  // Stop polling when genuinely leaving a polled page
  const leaving = location.hash.replace('#','').split('?')[0];
  if (state._pollPage && state._pollPage !== path.split('?')[0]) stopPolling();
  location.hash = path;
}

function router() {
  const { path, params } = getRoute();
  const user = state.currentUser;

  const studentRoutes = ['/student/home','/student/restaurant','/student/cart','/student/checkout','/student/orders','/student/tracking','/student/profile','/student/review','/student/receipt'];
  const restaurantRoutes = ['/restaurant/dashboard','/restaurant/menu','/restaurant/orders','/restaurant/earnings','/restaurant/profile','/restaurant/reviews'];
  const companyRoutes = ['/company/dashboard','/company/couriers','/company/deliveries','/company/earnings'];
  const courierRoutes = ['/courier/deliveries','/courier/profile'];
  const adminRoutes = ['/admin/dashboard','/admin/users','/admin/reviews','/admin/orders'];

  if (studentRoutes.includes(path) && (!user || user.role !== 'student')) { navigate('/login'); return; }
  if (restaurantRoutes.includes(path) && (!user || user.role !== 'restaurant')) { navigate('/login'); return; }
  if (companyRoutes.includes(path) && (!user || user.role !== 'company')) { navigate('/login'); return; }
  if (courierRoutes.includes(path) && (!user || user.role !== 'courier')) { navigate('/login'); return; }
  if (adminRoutes.includes(path) && (!user || user.role !== 'admin')) { navigate('/login'); return; }

  const app = el('app');
  const renders = {
    '/': renderLanding,
    '/login': renderLogin,
    '/signup': renderSignup,
    '/verify': () => renderVerify(params),
    '/forgot-password': renderForgotPassword,
    '/reset-password': () => renderResetPassword(params),
    '/student/home': renderStudentHome,
    '/student/restaurant': () => renderStudentRestaurant(params),
    '/student/cart': renderStudentCart,
    '/student/checkout': renderStudentCheckout,
    '/student/orders': () => renderStudentOrders(params),
    '/student/tracking': () => renderStudentTracking(params),
    '/student/profile': renderStudentProfile,
    '/student/review': () => renderStudentReview(params),
    '/student/receipt': () => renderStudentReceipt(params),
    '/restaurant/dashboard': renderRestaurantDashboard,
    '/restaurant/menu': renderRestaurantMenu,
    '/restaurant/orders': renderRestaurantOrders,
    '/restaurant/earnings': renderRestaurantEarnings,
    '/restaurant/profile': renderRestaurantProfile,
    '/restaurant/reviews': renderRestaurantReviews,
    '/company/dashboard': renderCompanyDashboard,
    '/company/couriers': renderCompanyCouriers,
    '/company/deliveries': renderCompanyDeliveries,
    '/company/earnings': renderCompanyEarnings,
    '/courier/deliveries': renderCourierDeliveries,
    '/courier/profile': renderCourierProfile,
    '/admin/dashboard': renderAdminDashboard,
    '/admin/users': renderAdminUsers,
    '/admin/reviews': renderAdminReviews,
    '/unauthorized': renderUnauthorized,
  };

  const fn = renders[path];
  if (fn) {
    app.innerHTML = '';
    app.innerHTML = fn() || '';
    app.classList.add('fade-in');
    setupPageEvents();
    if (POLL_PAGES[path]) startPolling(path); else stopPolling();
  }
  else { app.innerHTML = renderNotFound(); stopPolling(); }
}

/* ===== AUTH ===== */
function login(email, password) {
  const users = DB.getArr('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, msg: 'Invalid email or password.' };
  if (!user.verified) return { ok: false, msg: 'Please verify your email first. Check your inbox.', needsVerify: true };
  state.currentUser = user;
  DB.set('session', user.id);
  return { ok: true, user };
}

function logout() {
  stopPolling();
  state.currentUser = null;
  state.cart = [];
  state.cartRestaurantId = null;
  DB.del('session');
  navigate('/');
}

function registerUser(data) {
  const users = DB.getArr('users');
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) return { ok:false, msg:'An account with this email already exists.' };
  const newUser = { ...data, id: uid(), verified: false, setupComplete: false, createdAt: Date.now() };
  if (data.role === 'student') { newUser.wallet = 0; }
  users.push(newUser);
  DB.set('users', users);
  return { ok: true, user: newUser };
}

function verifyUser(userId) {
  const users = DB.getArr('users');
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users[idx].verified = true;
  users[idx].setupComplete = true;
  DB.set('users', users);
  if (state.currentUser && state.currentUser.id === userId) {
    state.currentUser = users[idx];
    DB.set('session', userId);
  }
  return true;
}

function updateUser(updates) {
  const users = DB.getArr('users');
  const idx = users.findIndex(u => u.id === state.currentUser.id);
  if (idx === -1) return;
  Object.assign(users[idx], updates);
  state.currentUser = users[idx];
  DB.set('users', users);
}

function restoreSession() {
  const sid = DB.get('session');
  if (!sid) return;
  const user = DB.getArr('users').find(u => u.id === sid);
  if (user) state.currentUser = user;
}

/* ===== CART HELPERS ===== */
function cartCount() { return state.cart.reduce((s,i)=>s+i.qty,0); }
function cartTotal() { return state.cart.reduce((s,i)=>s+(i.price*i.qty),0); }

function addToCart(item, restaurantId) {
  if (state.cartRestaurantId && state.cartRestaurantId !== restaurantId) {
    openModal(`
      <h3>🛒 Start a new order?</h3>
      <p>You have items from a different restaurant in your cart. Adding this item will clear your current cart.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Keep current cart</button>
        <button class="btn btn-primary" onclick="clearCartAndAdd('${item.id}','${restaurantId}')">Start new order</button>
      </div>`);
    return;
  }
  state.cartRestaurantId = restaurantId;
  const existing = state.cart.find(c => c.id === item.id);
  if (existing) { existing.qty++; }
  else { state.cart.push({ ...item, qty: 1 }); }
  toast(`${item.name} added to cart 🛒`, 'success', 2000);
  refreshCartBadge();
}

function removeFromCart(itemId) {
  state.cart = state.cart.filter(i => i.id !== itemId);
  if (!state.cart.length) state.cartRestaurantId = null;
  refreshCartBadge();
}

function updateQty(itemId, delta) {
  const item = state.cart.find(i => i.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(itemId);
  refreshCartBadge();
}

function clearCartAndAdd(itemId, restaurantId) {
  state.cart = [];
  state.cartRestaurantId = restaurantId;
  closeModal();
  const restaurants = DB.getArr('restaurants');
  const rest = restaurants.find(r => r.id === restaurantId);
  if (rest) { const item = rest.items.find(i => i.id === itemId); if (item) addToCart(item, restaurantId); }
  navigate('/student/restaurant?id=' + restaurantId);
}

function refreshCartBadge() {
  const count = cartCount();

  // 1. Any explicit .cart-badge-count elements (cart button on restaurant page header)
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = count || '';
    el.style.display = count ? '' : 'none';
  });

  // 2. Sidebar "My Cart" nav-badge — injected/removed directly in the DOM
  const cartNavItem = document.querySelector('.nav-item[onclick*="student/cart"]');
  if (cartNavItem) {
    let badge = cartNavItem.querySelector('.nav-badge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        cartNavItem.appendChild(badge);
      }
      badge.textContent = count;
    } else {
      if (badge) badge.remove();
    }
  }

  // 3. Header cart count bubble on the browse/restaurant pages
  const headerCount = el('header-cart-count');
  if (headerCount) {
    headerCount.textContent = count || '';
    headerCount.style.display = count > 0 ? '' : 'none';
  }
}

/* ===== ORDER HELPERS ===== */
function placeOrder(orderData) {
  const orders = DB.getArr('orders');
  const newOrder = { id: 'ord_' + uid(), ...orderData, createdAt: Date.now(), status: 'pending', reviewed: false };
  orders.push(newOrder);
  DB.set('orders', orders);
  if (state.currentUser.role === 'student') {
    updateUser({ wallet: (state.currentUser.wallet || 0) - newOrder.total });
  }
  state.cart = [];
  state.cartRestaurantId = null;
  return newOrder;
}

function updateOrderStatus(orderId, newStatus) {
  const orders = DB.getArr('orders');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) { orders[idx].status = newStatus; DB.set('orders', orders); }
}

/* ===== LAYOUT HELPERS ===== */
function sidebarHTML(activeItem, role) {
  const user = state.currentUser;
  const roleLabel = { student:'Student', restaurant:'Restaurant', company:'Courier Co.', courier:'Courier', admin:'Admin' }[role];

  const navs = {
    student: [
      { id:'student/home', icon:'🏠', label:'Browse Food' },
      { id:'student/cart', icon:'🛒', label:'My Cart', badge: cartCount() || null },
      { id:'student/orders', icon:'📋', label:'My Orders' },
      { id:'student/profile', icon:'👤', label:'Profile & Wallet' },
    ],
    restaurant: [
      { id:'restaurant/dashboard', icon:'📊', label:'Dashboard' },
      { id:'restaurant/menu', icon:'🍽️', label:'Manage Menu' },
      { id:'restaurant/orders', icon:'📋', label:'Orders' },
      { id:'restaurant/earnings', icon:'💰', label:'Earnings' },
      { id:'restaurant/reviews', icon:'⭐', label:'Reviews', badge: (() => { const rest = DB.getArr('restaurants').find(r=>r.id===user.restaurantId); if(!rest) return null; const unread = DB.getArr('reviews').filter(r=>r.restaurantId===rest.id&&!r.response).length; return unread||null; })() },
      { id:'restaurant/profile', icon:'⚙️', label:'Settings' },
    ],
    company: [
      { id:'company/dashboard', icon:'📊', label:'Dashboard' },
      { id:'company/couriers', icon:'🚴', label:'My Couriers' },
      { id:'company/deliveries', icon:'📦', label:'Deliveries' },
      { id:'company/earnings', icon:'💰', label:'Earnings' },
    ],
    courier: [
      { id:'courier/deliveries', icon:'📦', label:'My Deliveries' },
      { id:'courier/profile', icon:'👤', label:'Profile' },
    ],
    admin: [
      { id:'admin/dashboard', icon:'📊', label:'Overview' },
      { id:'admin/users', icon:'👥', label:'Users' },
      { id:'admin/reviews', icon:'⭐', label:'Reviews' },
    ],
  };

  const items = navs[role] || [];
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <span class="brand">${APP_NAME}</span>
        <span class="sidebar-role-badge">${roleLabel}</span>
      </div>
      <div class="sidebar-user">
        <div class="sidebar-user-name">${escape(user.name)}</div>
        <div class="sidebar-user-email">${escape(user.email)}</div>
      </div>
      <nav class="sidebar-nav">
        ${items.map(item => `
          <div class="nav-item ${activeItem === item.id ? 'active' : ''}" onclick="navigate('/${item.id}')">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </div>`).join('')}
      </nav>
      <div class="sidebar-bottom">
        <button class="btn btn-ghost btn-full" onclick="logout()">🚪 Logout</button>
      </div>
    </aside>`;
}

function dashShell(activeItem, role, title, actions='', content='') {
  return `
    <div class="dash-shell">
      ${sidebarHTML(activeItem, role)}
      <div class="dash-main">
        <header class="dash-header">
          <div class="flex items-center gap-3">
            <button class="hamburger" onclick="openSidebar()" aria-label="Open menu">
              <span></span><span></span><span></span>
            </button>
            <h1>${title}</h1>
          </div>
          <div class="dash-header-actions">${actions}</div>
        </header>
        <main class="dash-content fade-in">${content}</main>
      </div>
    </div>`;
}

/* ===== LANDING PAGE ===== */
function renderLanding() {
  const user = state.currentUser;
  const dashLink = user ? `<button class="btn btn-primary" onclick="navigate('/${user.role === 'company' ? 'company' : user.role}/dashboard')">Go to Dashboard →</button>` :
    `<button class="btn btn-primary btn-lg" onclick="navigate('/signup')">Get Started Free</button>
     <button class="btn btn-outline btn-lg" onclick="navigate('/login')">Sign In</button>`;

  return `
    <nav class="pub-nav">
      <div class="container">
        <div class="nav-inner">
          <span class="brand">${APP_NAME}</span>
          <div class="nav-links">
            ${user ? `
              <span style="font-size:0.9rem;color:var(--text-secondary)">Hi, ${user.name.split(' ')[0]} 👋</span>
              <button class="btn btn-primary btn-sm" onclick="navigate('/${user.role === 'company' ? 'company' : user.role}/dashboard')">Dashboard →</button>
            ` : `
              <button class="btn btn-ghost btn-sm" onclick="navigate('/login')">Sign In</button>
              <button class="btn btn-primary btn-sm" onclick="navigate('/signup')">Sign Up</button>
            `}
          </div>
        </div>
      </div>
    </nav>

    <section class="hero">
      <div class="container">
        <div class="hero-inner">
          <div class="hero-content">
            <div class="hero-eyebrow">🔥 Campus Food Delivery Platform</div>
            <h1 class="hero-title">
              Hot Food,<br/><span class="accent">Delivered</span><br/>to Your Door
            </h1>
            <p class="hero-subtitle">
              Order from your favourite campus restaurants in minutes. No walking, no queuing — just great food brought to you, fast.
            </p>
            <div class="hero-ctas">${dashLink}</div>
          </div>
          <div class="hero-visual">
            <div class="hero-card-float">
              <div class="hero-badge-float">5 min ⚡</div>
              <p style="font-size:0.8125rem;font-weight:600;color:var(--text-secondary);margin-bottom:12px;">POPULAR TODAY</p>
              <div class="hero-food-grid">
                <div class="hero-food-item">🍲<p>Jollof Rice</p></div>
                <div class="hero-food-item">🌯<p>Shawarma</p></div>
                <div class="hero-food-item">🥗<p>Healthy Bowl</p></div>
                <div class="hero-food-item">🍖<p>Suya</p></div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border-light)">
                <span style="font-size:0.875rem;color:var(--text-secondary)">Starting from</span>
                <span style="font-family:var(--font-display);font-weight:800;color:var(--primary);font-size:1.25rem">₦400</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Who is Füd for?</span>
          <h2 class="section-title">One Platform, Multiple Roles</h2>
          <p class="section-subtitle">Whether you're ordering, cooking or delivering — Füd has everything you need.</p>
        </div>
        <div class="role-cards">
          <div class="role-card" onclick="navigate('/signup')">
            <div class="role-icon">🎓</div>
            <h3>Students</h3>
            <p>Browse restaurant menus, order food, pay securely, and track your delivery in real time.</p>
            <div class="role-link">Order food →</div>
          </div>
          <div class="role-card" onclick="navigate('/signup')">
            <div class="role-icon">🍽️</div>
            <h3>Restaurants</h3>
            <p>Manage your menu, receive and fulfil orders from students on campus. Grow your business.</p>
            <div class="role-link">List your restaurant →</div>
          </div>
          <div class="role-card" onclick="navigate('/signup')">
            <div class="role-icon">🚴</div>
            <h3>Couriers & Companies</h3>
            <p>Courier companies manage teams of riders. Individual couriers handle pick-ups and drop-offs.</p>
            <div class="role-link">Start delivering →</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--surface-warm)">
      <div class="container">
        <div class="section-header">
          <span class="section-label">How it works</span>
          <h2 class="section-title">Order in 4 Easy Steps</h2>
        </div>
        <div class="steps-grid">
          <div class="step"><div class="step-num">1</div><h4>Browse Restaurants</h4><p>See all open restaurants on campus and explore their full menus.</p></div>
          <div class="step"><div class="step-num">2</div><h4>Add to Cart</h4><p>Pick your meals, adjust quantities and apply any promo codes.</p></div>
          <div class="step"><div class="step-num">3</div><h4>Pay Securely</h4><p>Review your full order with fees clearly shown, then confirm with your wallet.</p></div>
          <div class="step"><div class="step-num">4</div><h4>Track & Enjoy</h4><p>Watch your order status update live and receive it at your door.</p></div>
        </div>
      </div>
    </section>

    <section class="section fee-breakdown-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Transparent Pricing</span>
          <h2 class="section-title">Know What You Pay</h2>
          <p class="section-subtitle">Every charge is shown clearly at checkout. No hidden fees.</p>
        </div>
        <div class="fee-cards">
          <div class="fee-card">
            <div class="fee-card-icon">🍽️</div>
            <h4>Restaurant Delivery Fee</h4>
            <p>Set by each restaurant for handling your order.</p>
            <span class="fee-highlight">₦150 – ₦250</span>
          </div>
          <div class="fee-card">
            <div class="fee-card-icon">🚴</div>
            <h4>Courier Service Charge</h4>
            <p>Set by the courier company that picks up your order.</p>
            <span class="fee-highlight">₦250 – ₦300</span>
          </div>
          <div class="fee-card" style="border-color:var(--primary-border)">
            <div class="fee-card-icon">🟠</div>
            <h4>Füd Platform Fee</h4>
            <p>A small flat fee charged by Füd to keep the platform running.</p>
            <span class="fee-highlight" style="color:var(--primary)">₦25 flat</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container" style="text-align:center">
        <span class="section-label">Ready to order?</span>
        <h2 class="section-title">Your Next Meal is One Click Away</h2>
        <p class="section-subtitle" style="margin:0 auto 28px">Join hundreds of students already eating well on campus.</p>
        <button class="btn btn-primary btn-lg" onclick="navigate('/signup')">Create Your Free Account →</button>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="container">
        <span class="brand">${APP_NAME}</span>
        <p>© ${new Date().getFullYear()} Füd Technologies. Campus Food Delivery Platform.</p>
        <p style="margin-top:6px;font-size:0.8rem">All delivery-related disputes are subject to our Terms of Service.</p>
      </div>
    </footer>`;
}

/* ===== AUTH VIEWS ===== */
function renderLogin() {
  if (state.currentUser) { navigate('/'); return ''; }
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo"><span class="brand">${APP_NAME}</span></div>
        <h2 class="auth-title">Welcome back!</h2>
        <p class="auth-subtitle">Sign in to your Füd account.</p>
        <div id="auth-error" class="hidden" style="background:var(--error-bg);color:var(--error);padding:10px 14px;border-radius:var(--radius-sm);font-size:0.875rem;margin-bottom:16px;border:1px solid #fecaca"></div>
        <div class="form-group">
          <label>Email Address</label>
          <input class="form-control" type="email" id="login-email" placeholder="your@email.com" autocomplete="email"/>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-group">
            <input class="form-control" type="password" id="login-password" placeholder="Enter your password"/>
            <span class="input-group-icon" onclick="togglePwd('login-password')">👁</span>
          </div>
        </div>
        <div style="text-align:right;margin-bottom:16px">
          <span style="font-size:0.875rem;color:var(--primary);cursor:pointer;font-weight:600" onclick="navigate('/forgot-password')">Forgot password?</span>
        </div>
        <button class="btn btn-primary btn-full btn-lg" id="login-btn" onclick="handleLogin()">Sign In</button>
        <div class="auth-footer-link">Don't have an account? <span onclick="navigate('/signup')">Sign Up</span></div>
        <div class="auth-divider"><span>Demo Accounts</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8rem">
          ${[['Student','adaobi@uni.ng'],['Restaurant','info@mamatemis.ng'],['Courier Co.','ops@swiftrun.ng'],['Admin','admin@fud.ng']].map(([r,e])=>`
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 10px;cursor:pointer" onclick="fillDemo('${e}','pass123')">
              <strong>${r}</strong><br/><span style="color:var(--text-muted)">${e}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderSignup() {
  if (state.currentUser) { navigate('/'); return ''; }
  return `
    <div class="auth-wrap">
      <div class="auth-card" style="max-width:500px">
        <div class="auth-logo"><span class="brand">${APP_NAME}</span></div>
        <h2 class="auth-title">Create your account</h2>
        <p class="auth-subtitle">Join thousands of users on Füd.</p>
        <div id="auth-error" class="hidden" style="background:var(--error-bg);color:var(--error);padding:10px 14px;border-radius:var(--radius-sm);font-size:0.875rem;margin-bottom:16px;border:1px solid #fecaca"></div>
        <p style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:10px">I am a…</p>
        <div class="role-selector" id="role-selector">
          <div class="role-opt active" data-role="student" onclick="selectRole('student')"><div class="ri">🎓</div><span>Student</span></div>
          <div class="role-opt" data-role="restaurant" onclick="selectRole('restaurant')"><div class="ri">🍽️</div><span>Restaurant</span></div>
          <div class="role-opt" data-role="company" onclick="selectRole('company')"><div class="ri">🚴</div><span>Courier Co.</span></div>
        </div>
        <div class="form-group"><label>Full Name / Business Name</label><input class="form-control" type="text" id="signup-name" placeholder="e.g. Adaobi Okafor"/></div>
        <div class="form-group"><label>Email Address</label><input class="form-control" type="email" id="signup-email" placeholder="your@email.com"/></div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-group">
            <input class="form-control" type="password" id="signup-password" placeholder="At least 6 characters"/>
            <span class="input-group-icon" onclick="togglePwd('signup-password')">👁</span>
          </div>
        </div>
        <div class="form-group"><label>Phone Number</label><input class="form-control" type="tel" id="signup-phone" placeholder="08012345678"/></div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px">Note: Courier accounts are created by a Courier Company — sign up above as a Courier Company to manage riders.</p>
        <button class="btn btn-primary btn-full btn-lg" onclick="handleSignup()">Create Account →</button>
        <div class="auth-footer-link">Already have an account? <span onclick="navigate('/login')">Sign In</span></div>
      </div>
    </div>`;
}

function renderVerify({ uid: userId } = {}) {
  let msg = 'We\'ve sent a verification email. Please click the link to activate your account.';
  let icon = '📧';
  let success = false;
  if (userId) {
    success = verifyUser(userId);
    if (success) { icon = '✅'; msg = 'Your email has been verified! You can now sign in.'; }
    else { icon = '❌'; msg = 'Verification link is invalid or has expired.'; }
  }
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="info-screen">
          <div class="info-icon">${icon}</div>
          <h2>${success ? 'Email Verified!' : 'Check Your Email'}</h2>
          <p>${msg}</p>
          <button class="btn btn-primary btn-full" onclick="navigate('/login')">Go to Sign In</button>
          ${!userId && !success ? `<p style="margin-top:14px;font-size:0.85rem;color:var(--text-muted)">
            <strong>Demo:</strong> Click to verify instantly:
            <br/><button class="btn btn-outline btn-sm" style="margin-top:8px" onclick="demoVerify()">Verify My Account</button>
          </p>` : ''}
        </div>
      </div>
    </div>`;
}

function renderForgotPassword() {
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo"><span class="brand">${APP_NAME}</span></div>
        <h2 class="auth-title">Reset Password</h2>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>
        <div id="auth-error" class="hidden" style="background:var(--error-bg);color:var(--error);padding:10px 14px;border-radius:var(--radius-sm);font-size:0.875rem;margin-bottom:16px"></div>
        <div id="auth-success" class="hidden" style="background:var(--success-bg);color:var(--success);padding:10px 14px;border-radius:var(--radius-sm);font-size:0.875rem;margin-bottom:16px"></div>
        <div class="form-group"><label>Email Address</label><input class="form-control" type="email" id="forgot-email" placeholder="your@email.com"/></div>
        <button class="btn btn-primary btn-full" onclick="handleForgot()">Send Reset Link</button>
        <div class="auth-footer-link"><span onclick="navigate('/login')">← Back to Sign In</span></div>
      </div>
    </div>`;
}

function renderResetPassword({ token } = {}) {
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo"><span class="brand">${APP_NAME}</span></div>
        <h2 class="auth-title">Set New Password</h2>
        <p class="auth-subtitle">Enter a new password for your account.</p>
        <div id="auth-error" class="hidden" style="background:var(--error-bg);color:var(--error);padding:10px 14px;border-radius:var(--radius-sm);font-size:0.875rem;margin-bottom:16px"></div>
        <div class="form-group">
          <label>New Password</label>
          <div class="input-group">
            <input class="form-control" type="password" id="reset-password" placeholder="At least 6 characters"/>
            <span class="input-group-icon" onclick="togglePwd('reset-password')">👁</span>
          </div>
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input class="form-control" type="password" id="reset-password-confirm" placeholder="Repeat your new password"/>
        </div>
        <button class="btn btn-primary btn-full" onclick="handleResetPassword()">Update Password</button>
        <div class="auth-footer-link"><span onclick="navigate('/login')">← Back to Sign In</span></div>
      </div>
    </div>`;
}

/* ===== STUDENT VIEWS ===== */
function renderStudentHome() {
  const restaurants = DB.getArr('restaurants');
  const orders = DB.getArr('orders').filter(o => o.studentId === state.currentUser.id);
  const activeOrder = orders.find(o => !['delivered','cancelled'].includes(o.status));

  return dashShell('student/home','student','Browse Food',
    `<div style="display:flex;align-items:center;gap:10px">
      <div class="search-bar" style="width:240px">
        <span class="search-icon">🔍</span>
        <input class="form-control" id="rest-search" placeholder="Search restaurants..." oninput="filterRestaurants(this.value)" style="font-size:0.875rem"/>
      </div>
      <div style="position:relative;display:inline-flex">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="navigate('/student/cart')" title="Cart">🛒</button>
        <span id="header-cart-count" class="notif-count" style="display:${cartCount() > 0 ? '' : 'none'}">${cartCount() || ''}</span>
      </div>
    </div>`,
    `
    ${activeOrder ? `
      <div style="background:var(--primary);color:#fff;border-radius:var(--radius-lg);padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <strong>Order in progress</strong> — ${activeOrder.restaurantName}
        </div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.4)" onclick="navigate('/student/tracking?id=${activeOrder.id}')">Track Order →</button>
      </div>` : ''}
    <div class="page-header">
      <h2>Restaurants Near You</h2>
      <p>Ordering to: ${escape(state.currentUser.address || 'Set your address in profile')}</p>
    </div>
    <div class="restaurant-grid" id="restaurant-grid">
      ${restaurants.map(r => restaurantCardHTML(r)).join('')}
    </div>`
  );
}

function restaurantCardHTML(r) {
  const open = isOpenNow(r);
  return `
    <div class="restaurant-card ${open ? '' : 'closed'}" onclick="navigate('/student/restaurant?id=${r.id}')">
      <div class="restaurant-thumb">
        <span style="font-size:3.5rem">${r.emoji}</span>
        ${open
          ? '<span class="badge badge-green" style="position:absolute;top:12px;right:12px">● Open</span>'
          : '<span class="badge badge-gray" style="position:absolute;top:12px;right:12px">● Closed</span>'}
      </div>
      <div class="restaurant-info">
        <h3>${escape(r.name)}</h3>
        <div class="restaurant-meta">
          <span>⭐ ${r.rating} (${r.reviewCount})</span>
          <span>🚴 ${fmt(r.deliveryFee)} delivery</span>
        </div>
        <div class="restaurant-tags">
          <span class="tag">${r.cuisine}</span>
          <span class="tag">${r.openTime}–${r.closeTime}</span>
          ${r.promoCodes.length ? '<span class="tag" style="background:var(--primary-bg);color:var(--primary)">🏷 Promo</span>' : ''}
          ${!r.isOpen ? '<span class="tag" style="background:var(--error-bg);color:var(--error)">Manually closed</span>' : ''}
        </div>
      </div>
    </div>`;
}

function renderStudentRestaurant({ id } = {}) {
  const restaurants = DB.getArr('restaurants');
  const r = restaurants.find(r => r.id === id);
  if (!r) return renderNotFound();

  const categories = [...new Set(r.items.map(i => i.category))];

  return dashShell('student/home','student', escape(r.name),
    `<div class="flex items-center gap-2">
      <button class="btn btn-ghost btn-sm" onclick="navigate('/student/home')">← Back</button>
      <button class="btn btn-primary btn-sm" onclick="navigate('/student/cart')">🛒 Cart${cartCount() > 0 ? ` (${cartCount()})` : ''}</button>
    </div>`,
    `
    ${!isOpenNow(r) ? `
      <div style="background:var(--error-bg);border:1px solid #fecaca;color:var(--error);border-radius:var(--radius-lg);padding:14px 20px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font-weight:600">
        🔴 This restaurant is currently closed and not accepting orders.
        <span style="font-weight:400;color:var(--text-secondary);margin-left:4px">Opens ${r.openTime} – closes ${r.closeTime}</span>
      </div>` : ''}
    <div style="background:var(--white);border-radius:var(--radius-xl);border:1px solid var(--border);padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-16">
        <span style="font-size:3rem">${r.emoji}</span>
        <div style="flex:1">
          <h2 style="font-size:1.375rem;margin-bottom:4px">${escape(r.name)}</h2>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:8px">${escape(r.description)}</p>
          <div class="flex items-center gap-3 flex-wrap" style="font-size:0.85rem">
            <span>⭐ <strong>${r.rating}</strong> (${r.reviewCount} reviews)</span>
            <span>🚴 Delivery: <strong>${fmt(r.deliveryFee)}</strong></span>
            <span>🕐 ${r.openTime} – ${r.closeTime}</span>
            ${isOpenNow(r) ? '<span class="badge badge-green">● Open Now</span>' : '<span class="badge badge-red">● Closed</span>'}
          </div>
          ${r.promoCodes.length ? `<div style="margin-top:8px" class="flex gap-2">${r.promoCodes.map(p=>`<span class="badge badge-orange">🏷 Use <strong>${p.code}</strong> for ${p.type==='percent'?p.value+'% off':'₦'+p.value+' off'} (min ${fmt(p.min)})</span>`).join('')}</div>` : ''}
        </div>
      </div>
    </div>
    ${categories.map(cat => {
      const items = r.items.filter(i => i.category === cat);
      return `
        <div class="menu-category">
          <h3>${cat}</h3>
          <div class="menu-grid">
            ${items.map(item => {
              const inCart = state.cart.find(c => c.id === item.id);
              const canOrder = isOpenNow(r);
              return `
                <div class="menu-item">
                  <div class="menu-item-icon">${item.emoji}</div>
                  <div class="menu-item-info">
                    <h4>${escape(item.name)}</h4>
                    <p>${escape(item.desc)}</p>
                    <div class="menu-item-bottom">
                      <span class="menu-item-price">${fmt(item.price)}</span>
                      ${!canOrder
                        ? `<span style="font-size:0.75rem;color:var(--text-muted)">Closed</span>`
                        : inCart ? `
                          <div class="qty-control">
                            <button class="qty-btn" onclick="cartQty('${item.id}','${r.id}',-1)">−</button>
                            <span class="qty-num">${inCart.qty}</span>
                            <button class="qty-btn" onclick="cartQty('${item.id}','${r.id}',1)">+</button>
                          </div>` : `
                          <button class="btn btn-primary btn-sm" onclick="addToCartFromMenu('${item.id}','${r.id}')">Add +</button>`}
                    </div>
                  </div>
                </div>`;}).join('')}
          </div>
        </div>`;}).join('')}
    ${cartCount() > 0 ? `
      <div style="position:fixed;bottom:24px;left:calc(var(--sidebar-w) + 24px);right:24px;z-index:50">
        <div style="background:var(--primary);color:#fff;border-radius:var(--radius-xl);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-lg);max-width:800px;margin:0 auto">
          <div><strong>${cartCount()} item${cartCount()>1?'s':''}</strong> in cart · <strong>${fmt(cartTotal())}</strong></div>
          <button class="btn" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.4)" onclick="navigate('/student/cart')">View Cart →</button>
        </div>
      </div>` : ''}`
  );
}

function renderStudentCart() {
  if (!state.cart.length) {
    return dashShell('student/cart','student','My Cart','',`
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some delicious food from our restaurant list to get started.</p>
        <button class="btn btn-primary" onclick="navigate('/student/home')">Browse Restaurants</button>
      </div>`);
  }

  const restaurants = DB.getArr('restaurants');
  const rest = restaurants.find(r => r.id === state.cartRestaurantId);
  const sub = cartTotal();

  return dashShell('student/cart','student','My Cart','',`
    <div class="cart-layout">
      <div class="card">
        <div class="card-header">
          <h3>Order from ${rest ? escape(rest.name) : 'Restaurant'}</h3>
          <button class="btn btn-ghost btn-sm" onclick="confirmClearCart()">🗑 Clear cart</button>
        </div>
        ${state.cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-icon">${item.emoji}</div>
            <div class="cart-item-info">
              <h4>${escape(item.name)}</h4>
              <p>${fmt(item.price)} each</p>
            </div>
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQtyAndRefresh('${item.id}',-1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="updateQtyAndRefresh('${item.id}',1)">+</button>
            </div>
            <span class="cart-item-price" style="min-width:80px;text-align:right">${fmt(item.price * item.qty)}</span>
            <span class="cart-remove" onclick="removeAndRefresh('${item.id}')">✕</span>
          </div>`).join('')}
      </div>
      <div class="order-summary-card">
        <h3>Order Summary</h3>
        <div class="summary-line"><span class="label">Subtotal (${cartCount()} items)</span><span>${fmt(sub)}</span></div>
        <div class="summary-line"><span class="label">🚴 Delivery fee</span><span>${rest ? fmt(rest.deliveryFee) : '—'}</span></div>
        <p class="platform-fee-note">+ Courier service charge &amp; ₦25 Füd fee calculated at checkout</p>
        <div class="summary-line total"><span class="label">Estimated</span><span>${rest ? fmt(sub + rest.deliveryFee) : fmt(sub)}+</span></div>
        <button class="btn btn-primary btn-full btn-lg" style="margin-top:16px" onclick="navigate('/student/checkout')">Proceed to Checkout →</button>
        <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick="navigate('/student/home')">+ Add more items</button>
      </div>
    </div>`);
}

function renderStudentCheckout() {
  if (!state.cart.length) { navigate('/student/cart'); return ''; }
  const restaurants = DB.getArr('restaurants');
  const companies = DB.getArr('companies');
  const rest = restaurants.find(r => r.id === state.cartRestaurantId);
  const sub = cartTotal();
  const user = state.currentUser;
  if (!rest) { navigate('/student/cart'); return ''; }

  return dashShell('student/checkout','student','Checkout','',`
    <div class="checkout-layout">
      <div>
        <div class="card" style="margin-bottom:20px">
          <h3 style="margin-bottom:16px">📍 Delivery Address</h3>
          <div class="form-group">
            <label>Deliver to (current location)</label>
            <input class="form-control" id="delivery-address" value="${escape(user.address || '')}" placeholder="Enter your delivery address"/>
            <p class="form-hint">This is your current location for this order only. It won't change your profile address.</p>
          </div>
        </div>
        <div class="card" style="margin-bottom:20px">
          <h3 style="margin-bottom:16px">🚴 Choose Courier Company</h3>
          ${companies.map(c => `
            <div class="delivery-card" id="company-opt-${c.id}" style="margin-bottom:10px;cursor:pointer" onclick="selectCompany('${c.id}')">
              <div class="flex items-center justify-between">
                <div><strong>${escape(c.name)}</strong><br/><span style="font-size:0.85rem;color:var(--text-secondary)">Service charge: ${fmt(c.serviceCharge)}</span></div>
                <span class="badge badge-green">Available</span>
              </div>
            </div>`).join('')}
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">🏷 Promo Code</h3>
          <div class="promo-input-row">
            <input class="form-control" id="promo-code" placeholder="Enter promo code" oninput="this.value=this.value.toUpperCase()"/>
            <button class="btn btn-outline" onclick="applyPromo('${rest.id}')">Apply</button>
          </div>
          <p id="promo-msg" class="form-hint"></p>
        </div>
      </div>
      <div>
        <div class="order-summary-card" id="checkout-summary">
          <h3>Order Summary</h3>
          ${state.cart.map(i=>`<div class="summary-line" style="font-size:0.85rem"><span class="label">${escape(i.name)} ×${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
          <div class="summary-line" style="border-top:1px solid var(--border-light);margin-top:8px;padding-top:8px"><span class="label">Subtotal</span><span>${fmt(sub)}</span></div>
          <div class="summary-line"><span class="label">🍽 Restaurant delivery fee</span><span>${fmt(rest.deliveryFee)}</span></div>
          <div class="summary-line"><span class="label" id="service-charge-lbl">🚴 Courier service charge</span><span id="service-charge-val">Select courier</span></div>
          <div class="summary-line"><span class="label">🟠 Füd platform fee</span><span>${fmt(PLATFORM_FEE)}</span></div>
          <div class="summary-line" id="discount-line" style="display:none;color:var(--success)"><span class="label">🏷 Discount</span><span id="discount-val"></span></div>
          <div class="summary-line total" style="font-size:1.125rem"><span class="label">Total Payable</span><span id="checkout-total">${fmt(sub + rest.deliveryFee + PLATFORM_FEE)}</span></div>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px">Wallet balance: <strong>${fmt(user.wallet || 0)}</strong></p>
          ${(user.wallet||0) < (sub + rest.deliveryFee + PLATFORM_FEE) ? `<div style="background:var(--error-bg);color:var(--error);padding:8px 12px;border-radius:var(--radius-sm);font-size:0.8125rem;margin-bottom:12px">⚠️ Insufficient wallet balance. Please top up in your profile.</div>` : ''}
          <button class="btn btn-primary btn-full btn-lg" id="place-order-btn" onclick="handlePlaceOrder('${rest.id}')">
            Place Order →
          </button>
          <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;margin-top:8px">Your wallet will be debited on placing the order.</p>
        </div>
      </div>
    </div>`);
}

function renderStudentOrders({ filter } = {}) {
  const allOrders = DB.getArr('orders').filter(o => o.studentId === state.currentUser.id).sort((a,b)=>b.createdAt-a.createdAt);
  const f = filter || 'all';
  const filtered = f==='all' ? allOrders : allOrders.filter(o=>o.status===f);

  return dashShell('student/orders','student','My Orders','',`
    <div class="filter-bar" style="margin-bottom:20px">
      ${['all','pending','preparing','picked_up','delivered','cancelled'].map(s=>`
        <button class="filter-chip ${f===s?'active':''}" onclick="navigate('/student/orders?filter=${s}')">${s==='all'?'All Orders':s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</button>`).join('')}
    </div>
    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No orders here</h3>
        <p>You haven't placed any orders yet.</p>
        <button class="btn btn-primary" onclick="navigate('/student/home')">Browse Restaurants</button>
      </div>` : `
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Restaurant</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${filtered.map(o=>`
            <tr>
              <td><strong>${escape(o.restaurantName)}</strong></td>
              <td style="font-size:0.85rem;color:var(--text-secondary)">${o.items.map(i=>i.name).join(', ')}</td>
              <td><strong>${fmt(o.total)}</strong></td>
              <td style="font-size:0.85rem">${fmtDateShort(o.createdAt)}</td>
              <td>${statusBadge(o.status)}</td>
              <td>
                <div class="flex gap-2">
                  ${['pending','accepted','preparing','ready','picked_up'].includes(o.status) ? `<button class="btn btn-sm btn-outline" onclick="navigate('/student/tracking?id=${o.id}')">Track</button>` : ''}
                  ${o.status==='delivered' && !o.reviewed ? `<button class="btn btn-sm btn-primary" onclick="navigate('/student/review?orderId=${o.id}')">Review</button>` : ''}
                  ${o.status==='delivered' && o.reviewed ? `<span class="badge badge-green">✓ Reviewed</span>` : ''}
                  ${o.status==='delivered' ? `<button class="btn btn-sm btn-ghost" onclick="navigate('/student/receipt?id=${o.id}')">🧾 Receipt</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`}`);
}

function renderStudentTracking({ id } = {}) {
  const orders = DB.getArr('orders');
  const order = orders.find(o => o.id === id && o.studentId === state.currentUser.id);
  if (!order) return dashShell('student/orders','student','Order Tracking','',`<div class="empty-state"><div class="empty-icon">❌</div><h3>Order not found</h3><button class="btn btn-primary" onclick="navigate('/student/orders')">My Orders</button></div>`);

  const steps = [
    { status: 'pending',   icon: '📋', label: 'Order Placed',    desc: 'Your order has been sent to the restaurant.' },
    { status: 'accepted',  icon: '✅', label: 'Order Accepted',   desc: 'The restaurant has accepted your order.' },
    { status: 'preparing', icon: '👨‍🍳', label: 'Being Prepared',  desc: 'Your food is being freshly prepared.' },
    { status: 'ready',     icon: '📦', label: 'Ready for Pickup', desc: 'Your order is packed and ready for the courier.' },
    { status: 'picked_up', icon: '🚴', label: 'Out for Delivery', desc: `${order.courierName || 'Courier'} is on the way with your order.` },
    { status: 'delivered', icon: '🏠', label: 'Delivered!',       desc: `Your order was delivered on ${fmtDateShort(order.deliveredAt||Date.now())}.` },
  ];
  const statusOrder = ['pending','accepted','preparing','ready','picked_up','delivered'];
  const curIdx = statusOrder.indexOf(order.status);

  return dashShell('student/orders','student','Track Order',
    `<div class="flex items-center gap-3">
      <button class="btn btn-ghost btn-sm" onclick="navigate('/student/orders')">← My Orders</button>
      ${!['delivered','cancelled'].includes(order.status) ? liveBadgeHTML() : ''}
    </div>`,
    `
    <div class="grid-2" style="gap:24px">
      <div>
        <div class="tracking-card">
          <div class="tracking-status-big">${steps[Math.max(0,curIdx)].icon}</div>
          <h2>${steps[Math.max(0,curIdx)].label}</h2>
          <p>${steps[Math.max(0,curIdx)].desc}</p>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">Order Progress</h3>
          <div class="tracking-steps">
            ${steps.map((step, i) => {
              const done = i < curIdx;
              const active = i === curIdx;
              const last = i === steps.length - 1;
              return `
                <div class="tracking-step ${done?'done':''} ${active?'active':''}">
                  ${!last ? `<div class="tracking-step-line ${done?'done':''}"></div>` : ''}
                  <div class="tracking-step-icon">${done ? '✓' : step.icon}</div>
                  <div class="tracking-step-info">
                    <h4>${step.label}</h4>
                    <p>${step.desc}</p>
                  </div>
                </div>`;}).join('')}
          </div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:20px">
          <h3 style="margin-bottom:14px">Order Details</h3>
          <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:12px">Order #${order.id.slice(-8).toUpperCase()}</p>
          ${order.items.map(i=>`<div class="summary-line" style="font-size:0.875rem"><span class="label">${escape(i.name)} ×${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
          <div style="border-top:1px dashed var(--border);margin-top:8px;padding-top:8px">
            <div class="summary-line"><span class="label">Subtotal</span><span>${fmt(order.subtotal)}</span></div>
            <div class="summary-line"><span class="label">Delivery fee</span><span>${fmt(order.deliveryFee)}</span></div>
            <div class="summary-line"><span class="label">Courier charge</span><span>${fmt(order.serviceCharge)}</span></div>
            <div class="summary-line"><span class="label">Platform fee</span><span>${fmt(order.platformFee)}</span></div>
            ${order.discount ? `<div class="summary-line" style="color:var(--success)"><span class="label">Discount</span><span>−${fmt(order.discount)}</span></div>` : ''}
            <div class="summary-line total"><span class="label">Total Paid</span><span>${fmt(order.total)}</span></div>
          </div>
        </div>
        ${order.courierName ? `
          <div class="card">
            <h3 style="margin-bottom:12px">Your Courier</h3>
            <div class="flex items-center gap-12">
              <div class="courier-avatar">🚴</div>
              <div><strong>${escape(order.courierName)}</strong><br/><span style="font-size:0.85rem;color:var(--text-secondary)">Delivery Rider</span></div>
            </div>
          </div>` : ''}
        ${order.status === 'delivered' && !order.reviewed ? `
          <button class="btn btn-primary btn-full" style="margin-top:16px" onclick="navigate('/student/review?orderId=${order.id}')">⭐ Leave a Review</button>` : ''}
        ${order.status === 'delivered' ? `
          <button class="btn btn-outline btn-full" style="margin-top:10px" onclick="navigate('/student/receipt?id=${order.id}')">🧾 View Receipt</button>` : ''}
      </div>
    </div>`);
}

function renderStudentReview({ orderId } = {}) {
  const order = DB.getArr('orders').find(o => o.id === orderId && o.studentId === state.currentUser.id);
  if (!order || order.status !== 'delivered') { navigate('/student/orders'); return ''; }
  const rest = DB.getArr('restaurants').find(r => r.id === order.restaurantId);

  return dashShell('student/orders','student','Leave a Review',
    `<button class="btn btn-ghost btn-sm" onclick="navigate('/student/orders')">← Back</button>`,
    `
    <div class="container-sm" style="margin:0">
      <div class="card">
        <div class="flex items-center gap-12" style="margin-bottom:20px">
          <span style="font-size:2.5rem">${rest?.emoji||'🍽️'}</span>
          <div><h3>${escape(rest?.name||'Restaurant')}</h3><p style="font-size:0.85rem;color:var(--text-secondary)">Order #${orderId.slice(-8).toUpperCase()} · ${fmtDateShort(order.createdAt)}</p></div>
        </div>
        <div class="form-group">
          <label>Your Rating</label>
          <div class="star-row" id="star-row">
            ${[1,2,3,4,5].map(n=>`<span class="star ${n<=4?'active':''}" data-val="${n}" onclick="setRating(${n})">★</span>`).join('')}
          </div>
          <input type="hidden" id="review-rating" value="4"/>
        </div>
        <div class="form-group">
          <label>Your Comment</label>
          <textarea class="form-control" id="review-comment" rows="4" placeholder="How was your food and delivery experience?"></textarea>
        </div>
        <button class="btn btn-primary btn-full" onclick="submitReview('${orderId}','${order.restaurantId}')">Submit Review</button>
      </div>
    </div>`);
}

function renderStudentReceipt({ id } = {}) {
  const order = DB.getArr('orders').find(o => o.id === id && o.studentId === state.currentUser.id);
  if (!order) { navigate('/student/orders'); return ''; }
  const rest = DB.getArr('restaurants').find(r => r.id === order.restaurantId);

  return dashShell('student/orders', 'student', 'Order Receipt',
    `<div class="flex items-center gap-2 no-print">
      <button class="btn btn-ghost btn-sm" onclick="navigate('/student/orders')">← My Orders</button>
      <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Print</button>
    </div>`,
    `<div class="receipt-wrap">
      <div class="receipt-card">

        <div class="receipt-header">
          <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--primary);margin-bottom:4px">${APP_NAME}</div>
          <div style="font-size:0.85rem;color:var(--text-muted)">Campus Food Delivery Platform</div>
          <div style="margin-top:16px;font-size:1.5rem">🧾</div>
          <h2 style="font-size:1.125rem;margin-top:6px;color:var(--text)">Order Receipt</h2>
        </div>

        <div class="receipt-row"><span class="rl">Order ID</span><strong>#${order.id.slice(-12).toUpperCase()}</strong></div>
        <div class="receipt-row"><span class="rl">Restaurant</span><strong>${escape(order.restaurantName)}</strong></div>
        <div class="receipt-row"><span class="rl">Delivery Address</span><span style="text-align:right;max-width:55%">${escape(order.address)}</span></div>
        <div class="receipt-row"><span class="rl">Order Date</span><span>${fmtDate(order.createdAt)}</span></div>
        ${order.deliveredAt ? `<div class="receipt-row"><span class="rl">Delivered At</span><span>${fmtDate(order.deliveredAt)}</span></div>` : ''}
        ${order.courierName ? `<div class="receipt-row"><span class="rl">Courier</span><span>${escape(order.courierName)}</span></div>` : ''}

        <div style="margin:16px 0 8px;font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em">Items Ordered</div>
        ${order.items.map(i => `
          <div class="receipt-row">
            <span class="rl">${i.emoji} ${escape(i.name)} <span style="color:var(--text-muted)">×${i.qty}</span></span>
            <span>${fmt(i.price * i.qty)}</span>
          </div>`).join('')}

        <div style="margin:16px 0 8px;font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em">Charges</div>
        <div class="receipt-row"><span class="rl">Subtotal</span><span>${fmt(order.subtotal)}</span></div>
        <div class="receipt-row"><span class="rl">🍽️ Restaurant delivery fee</span><span>${fmt(order.deliveryFee)}</span></div>
        <div class="receipt-row"><span class="rl">🚴 Courier service charge</span><span>${fmt(order.serviceCharge)}</span></div>
        <div class="receipt-row"><span class="rl">🟠 Füd platform fee</span><span>${fmt(order.platformFee)}</span></div>
        ${order.discount ? `<div class="receipt-row" style="color:var(--success)"><span class="rl">🏷️ Promo discount${order.promoCode ? ` (${order.promoCode})` : ''}</span><span>−${fmt(order.discount)}</span></div>` : ''}

        <div class="receipt-total">
          <span>Total Paid</span>
          <span>${fmt(order.total)}</span>
        </div>

        <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px dashed var(--border);font-size:0.8rem;color:var(--text-muted)">
          <p>Paid via Füd Wallet</p>
          <p style="margin-top:4px">Thank you for ordering with ${APP_NAME}! 🧡</p>
          <p style="margin-top:8px;font-size:0.7rem">This is your official order receipt. Keep it for your records.</p>
        </div>

      </div>
    </div>`);
}

function renderStudentProfile() {
  const user = state.currentUser;
  const orders = DB.getArr('orders').filter(o => o.studentId === user.id);
  const totalSpent = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0);

  return dashShell('student/profile','student','Profile & Wallet','',`
    <div class="grid-2" style="gap:24px;align-items:start">
      <div>
        <div class="wallet-card" style="margin-bottom:20px">
          <div class="label">WALLET BALANCE</div>
          <div class="amount">${fmt(user.wallet||0)}</div>
          <div class="sub">Available for orders</div>
          <div class="flex gap-2" style="margin-top:16px">
            <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.4)" onclick="topUpWallet()">+ Top Up</button>
          </div>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">Order Stats</h3>
          <div class="grid-2" style="gap:12px">
            <div class="stat-card orange"><div class="stat-label">Total Orders</div><div class="stat-value">${orders.length}</div></div>
            <div class="stat-card green"><div class="stat-label">Completed</div><div class="stat-value">${orders.filter(o=>o.status==='delivered').length}</div></div>
            <div class="stat-card blue" style="grid-column:span 2"><div class="stat-label">Total Spent</div><div class="stat-value" style="font-size:1.375rem">${fmt(totalSpent)}</div></div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:20px">Profile Information</h3>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
          <div class="profile-avatar-big">${user.name[0].toUpperCase()}</div>
          <div><div style="font-size:1.125rem;font-weight:700">${escape(user.name)}</div><div style="font-size:0.875rem;color:var(--text-secondary)">${escape(user.email)}</div></div>
        </div>
        <div class="form-group"><label>Full Name</label><input class="form-control" id="p-name" value="${escape(user.name)}"/></div>
        <div class="form-group"><label>Phone</label><input class="form-control" id="p-phone" value="${escape(user.phone||'')}"/></div>
        <div class="form-group"><label>Default Delivery Address</label><textarea class="form-control" id="p-address" rows="2">${escape(user.address||'')}</textarea></div>
        <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
      </div>
    </div>`);
}

/* ===== RESTAURANT VIEWS ===== */
function renderRestaurantDashboard() {
  const user = state.currentUser;
  const rest = DB.getArr('restaurants').find(r => r.id === user.restaurantId);
  if (!rest) return dashShell('restaurant/dashboard','restaurant','Dashboard','',`<div class="empty-state"><div class="empty-icon">🍽️</div><h3>Set up your restaurant</h3><p>Complete your profile to start receiving orders.</p></div>`);
  const orders = DB.getArr('orders').filter(o => o.restaurantId === rest.id);
  const today = orders.filter(o => o.createdAt > Date.now() - 86400000);
  const pending = orders.filter(o => ['pending','accepted','preparing'].includes(o.status));
  const revenue = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.subtotal,0);
  const reviews = DB.getArr('reviews').filter(r => r.restaurantId === rest.id);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return dashShell('restaurant/dashboard','restaurant', escape(rest.name),
    liveBadgeHTML(),
    `
    <div style="display:flex;align-items:center;justify-content:space-between;background:${rest.isOpen ? 'var(--success-bg)' : 'var(--error-bg)'};border:1px solid ${rest.isOpen ? 'var(--success-border)' : '#fecaca'};border-radius:var(--radius-lg);padding:14px 20px;margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.25rem">${rest.isOpen ? '🟢' : '🔴'}</span>
        <div>
          <strong style="color:${rest.isOpen ? 'var(--success)' : 'var(--error)'}">Restaurant is ${rest.isOpen ? 'Open' : 'Closed'}</strong>
          <p style="font-size:0.8rem;color:var(--text-secondary);margin:0">Hours: ${rest.openTime} – ${rest.closeTime} · ${rest.isOpen ? 'Students can place orders' : 'No new orders accepted'}</p>
        </div>
      </div>
      <button class="btn btn-sm ${rest.isOpen ? 'btn-danger' : 'btn-success'}" onclick="toggleRestaurantOpen('${rest.id}')">
        ${rest.isOpen ? '🔴 Close Restaurant' : '🟢 Open Restaurant'}
      </button>
    </div>
    <div class="grid-4" style="margin-bottom:24px">
      <div class="stat-card orange"><div class="stat-icon">📦</div><div class="stat-label">Pending Orders</div><div class="stat-value">${pending.length}</div></div>
      <div class="stat-card green"><div class="stat-icon">📋</div><div class="stat-label">Today's Orders</div><div class="stat-value">${today.length}</div></div>
      <div class="stat-card blue"><div class="stat-icon">💰</div><div class="stat-label">Total Revenue</div><div class="stat-value" style="font-size:1.25rem">${fmt(revenue)}</div></div>
      <div class="stat-card purple"><div class="stat-icon">⭐</div><div class="stat-label">Rating</div><div class="stat-value">${avgRating}★</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <h3>Recent Orders</h3>
        <button class="btn btn-outline btn-sm" onclick="navigate('/restaurant/orders')">View All</button>
      </div>
      ${pending.length === 0 ? `<div class="empty-state" style="padding:32px"><div class="empty-icon">✅</div><h3>All caught up!</h3><p>No pending orders right now.</p></div>` :
      `<div class="table-wrap"><table class="table">
        <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${pending.slice(0,5).map(o=>`
            <tr>
              <td><strong>#${o.id.slice(-8).toUpperCase()}</strong><br/><span style="font-size:0.8rem;color:var(--text-muted)">${fmtDateShort(o.createdAt)}</span></td>
              <td style="font-size:0.875rem">${o.items.map(i=>escape(i.name)).join(', ')}</td>
              <td><strong>${fmt(o.subtotal)}</strong></td>
              <td>${statusBadge(o.status)}</td>
              <td>${nextStatusBtn(o)}</td>
            </tr>`).join('')}
        </tbody>
      </table></div>`}
    </div>`);
}

function nextStatusBtn(order) {
  const next = { pending:'accepted', accepted:'preparing', preparing:'ready', ready:'picked_up' };
  const labels = { accepted:'✅ Accept', preparing:'👨‍🍳 Start Prep', ready:'📦 Mark Ready', picked_up:'🚴 Picked Up' };
  const n = next[order.status];
  if (!n) return '';
  return `<button class="btn btn-primary btn-sm" onclick="advanceOrder('${order.id}','${n}')">${labels[n]}</button>`;
}

function renderRestaurantMenu() {
  const rest = DB.getArr('restaurants').find(r => r.id === state.currentUser.restaurantId);
  if (!rest) return renderRestaurantDashboard();
  const categories = [...new Set(rest.items.map(i => i.category))];

  return dashShell('restaurant/menu','restaurant','Manage Menu',
    `<button class="btn btn-primary btn-sm" onclick="openAddItemModal('${rest.id}')">+ Add Menu Item</button>`,`
    ${categories.map(cat => {
      const items = rest.items.filter(i => i.category === cat);
      return `
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-bottom:14px">${cat} <span class="badge badge-gray" style="margin-left:6px">${items.length}</span></h3>
          ${items.map(item=>`
            <div class="menu-manage-item">
              <div class="menu-manage-item-icon">${item.emoji}</div>
              <div class="menu-manage-item-info">
                <h4>${escape(item.name)}</h4>
                <p>${escape(item.desc)}</p>
              </div>
              <span class="menu-manage-item-price">${fmt(item.price)}</span>
              <div class="menu-manage-item-actions">
                <button class="btn btn-outline btn-sm" onclick="openEditItemModal('${rest.id}','${item.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${rest.id}','${item.id}')">Remove</button>
              </div>
            </div>`).join('')}
        </div>`;}).join('')}`);
}

function renderRestaurantOrders() {
  const rest = DB.getArr('restaurants').find(r => r.id === state.currentUser.restaurantId);
  const allOrders = DB.getArr('orders').filter(o => o.restaurantId === (rest?.id)).sort((a,b)=>b.createdAt-a.createdAt);

  return dashShell('restaurant/orders','restaurant','Orders',
    liveBadgeHTML(),`
    ${allOrders.length === 0 ? `<div class="empty-state"><div class="empty-icon">📋</div><h3>No orders yet</h3><p>Orders from students will appear here.</p></div>` :
    `<div class="table-wrap"><table class="table">
      <thead><tr><th>Order #</th><th>Items</th><th>Subtotal</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${allOrders.map(o=>`
          <tr>
            <td><strong>#${o.id.slice(-8).toUpperCase()}</strong></td>
            <td style="font-size:0.8rem;color:var(--text-secondary);max-width:200px">${o.items.map(i=>`${escape(i.name)} ×${i.qty}`).join(', ')}</td>
            <td><strong>${fmt(o.subtotal)}</strong></td>
            <td style="font-size:0.85rem">${fmtDateShort(o.createdAt)}</td>
            <td>${statusBadge(o.status)}</td>
            <td>${nextStatusBtn(o)}</td>
          </tr>`).join('')}
      </tbody>
    </table></div>`}`);
}

function renderRestaurantEarnings() {
  const rest = DB.getArr('restaurants').find(r => r.id === state.currentUser.restaurantId);
  const orders = DB.getArr('orders').filter(o => o.restaurantId === rest?.id && o.status === 'delivered');
  const total = orders.reduce((s,o)=>s+o.subtotal,0);
  const thisMonth = orders.filter(o=>o.createdAt > Date.now()-30*864e5).reduce((s,o)=>s+o.subtotal,0);
  const thisWeek  = orders.filter(o=>o.createdAt > Date.now()-7*864e5).reduce((s,o)=>s+o.subtotal,0);

  return dashShell('restaurant/earnings','restaurant','Earnings','',`
    <div class="grid-3" style="margin-bottom:24px">
      <div class="stat-card orange"><div class="stat-icon">💰</div><div class="stat-label">Total Earnings</div><div class="stat-value" style="font-size:1.5rem">${fmt(total)}</div></div>
      <div class="stat-card green"><div class="stat-icon">📅</div><div class="stat-label">This Month</div><div class="stat-value" style="font-size:1.5rem">${fmt(thisMonth)}</div></div>
      <div class="stat-card blue"><div class="stat-icon">📆</div><div class="stat-label">This Week</div><div class="stat-value" style="font-size:1.5rem">${fmt(thisWeek)}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Completed Order History</h3></div>
      ${orders.length===0?`<div class="empty-state" style="padding:32px"><div class="empty-icon">💸</div><h3>No earnings yet</h3><p>Completed orders will show here.</p></div>`:
      `<div class="table-wrap"><table class="table">
        <thead><tr><th>Order #</th><th>Items</th><th>Subtotal (your earnings)</th><th>Delivery fee</th><th>Date</th></tr></thead>
        <tbody>
          ${orders.map(o=>`
            <tr>
              <td><strong>#${o.id.slice(-8).toUpperCase()}</strong></td>
              <td style="font-size:0.8rem;color:var(--text-secondary)">${o.items.map(i=>i.name).join(', ')}</td>
              <td><strong style="color:var(--success)">${fmt(o.subtotal)}</strong></td>
              <td>${fmt(o.deliveryFee)}</td>
              <td style="font-size:0.85rem">${fmtDateShort(o.createdAt)}</td>
            </tr>`).join('')}
        </tbody>
      </table></div>`}
    </div>`);
}

function renderRestaurantProfile() {
  const rest = DB.getArr('restaurants').find(r => r.id === state.currentUser.restaurantId);
  if (!rest) return dashShell('restaurant/profile','restaurant','Settings','','<div class="empty-state"><div class="empty-icon">⚙️</div><h3>No restaurant set up</h3></div>');

  return dashShell('restaurant/profile','restaurant','Restaurant Settings','',`
    <div class="grid-2" style="gap:24px;align-items:start">
      <div class="card">
        <h3 style="margin-bottom:20px">Restaurant Info</h3>
        <div class="form-group"><label>Restaurant Name</label><input class="form-control" id="r-name" value="${escape(rest.name)}"/></div>
        <div class="form-group"><label>Description</label><textarea class="form-control" id="r-desc" rows="3">${escape(rest.description)}</textarea></div>
        <div class="form-group"><label>Cuisine Type</label><input class="form-control" id="r-cuisine" value="${escape(rest.cuisine)}"/></div>
        <div class="form-group"><label>Address</label><input class="form-control" id="r-address" value="${escape(rest.address)}"/></div>
        <div class="form-group"><label>Phone</label><input class="form-control" id="r-phone" value="${escape(rest.phone)}"/></div>
        <div class="grid-2">
          <div class="form-group"><label>Open Time</label><input class="form-control" type="time" id="r-open" value="${rest.openTime}"/></div>
          <div class="form-group"><label>Close Time</label><input class="form-control" type="time" id="r-close" value="${rest.closeTime}"/></div>
        </div>
        <button class="btn btn-primary" onclick="saveRestaurantProfile('${rest.id}')">Save Changes</button>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-bottom:16px">Delivery Fee</h3>
          <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:12px">You decide what delivery fee students pay.</p>
          <div class="form-group"><label>Delivery Fee (₦)</label><input class="form-control" type="number" id="r-fee" value="${rest.deliveryFee}"/></div>
          <button class="btn btn-outline" onclick="saveDeliveryFee('${rest.id}')">Update Fee</button>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">🏷 Promo Codes</h3>
          ${rest.promoCodes.map(p=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--primary-bg);border-radius:var(--radius-sm);margin-bottom:8px">
              <div><strong>${p.code}</strong> — ${p.type==='percent'?p.value+'% off':'₦'+p.value+' off'} <span style="font-size:0.8rem;color:var(--text-secondary)">(min ${fmt(p.min)})</span></div>
              <button class="btn btn-danger btn-sm" onclick="deletePromo('${rest.id}','${p.code}')">Remove</button>
            </div>`).join('')}
          <button class="btn btn-outline btn-sm" onclick="openAddPromoModal('${rest.id}')">+ Add Promo Code</button>
        </div>
      </div>
    </div>`);
}

/* ===== COURIER COMPANY VIEWS ===== */
function renderCompanyDashboard() {
  const user = state.currentUser;
  const company = DB.getArr('companies').find(c => c.id === user.companyId);
  const couriers = DB.getArr('couriers').filter(c => c.companyId === user.companyId);
  const orders = DB.getArr('orders').filter(o => o.companyId === user.companyId);
  const active = orders.filter(o=>['accepted','preparing','ready','picked_up'].includes(o.status));
  const completed = orders.filter(o=>o.status==='delivered');
  const earnings = completed.reduce((s,o)=>s+o.serviceCharge,0);

  return dashShell('company/dashboard','company', escape(company?.name||'Courier Company'),``,`
    <div class="grid-4" style="margin-bottom:24px">
      <div class="stat-card orange"><div class="stat-icon">🚴</div><div class="stat-label">Total Couriers</div><div class="stat-value">${couriers.length}</div></div>
      <div class="stat-card green"><div class="stat-icon">📦</div><div class="stat-label">Active Deliveries</div><div class="stat-value">${active.length}</div></div>
      <div class="stat-card blue"><div class="stat-icon">✅</div><div class="stat-label">Completed</div><div class="stat-value">${completed.length}</div></div>
      <div class="stat-card purple"><div class="stat-icon">💰</div><div class="stat-label">Total Earnings</div><div class="stat-value" style="font-size:1.25rem">${fmt(earnings)}</div></div>
    </div>
    <div class="grid-2" style="gap:20px">
      <div class="card">
        <div class="card-header"><h3>My Couriers</h3><button class="btn btn-outline btn-sm" onclick="navigate('/company/couriers')">Manage</button></div>
        ${couriers.slice(0,4).map(c=>`
          <div class="courier-card" style="margin-bottom:10px">
            <div class="courier-avatar">${c.name[0]}</div>
            <div class="courier-info"><h4>${escape(c.name)}</h4><p>${c.deliveriesCompleted} deliveries · ⭐ ${c.rating}</p></div>
            ${statusBadge(c.status)}
          </div>`).join('')}
        ${couriers.length===0?`<div class="empty-state" style="padding:24px"><div class="empty-icon">🚴</div><h3>No couriers yet</h3><button class="btn btn-primary btn-sm" onclick="navigate('/company/couriers')">Add Couriers</button></div>`:''}
      </div>
      <div class="card">
        <div class="card-header"><h3>Active Deliveries</h3><button class="btn btn-outline btn-sm" onclick="navigate('/company/deliveries')">View All</button></div>
        ${active.length===0?`<div class="empty-state" style="padding:24px"><div class="empty-icon">📦</div><h3>No active deliveries</h3></div>`:`
        ${active.slice(0,4).map(o=>`
          <div style="padding:10px 0;border-bottom:1px solid var(--border-light)">
            <div class="flex justify-between items-center">
              <div><strong>#${o.id.slice(-8).toUpperCase()}</strong> — ${escape(o.restaurantName)}<br/><span style="font-size:0.8rem;color:var(--text-secondary)">${fmtDateShort(o.createdAt)}</span></div>
              ${statusBadge(o.status)}
            </div>
          </div>`).join('')}`}
      </div>
    </div>`);
}

function renderCompanyCouriers() {
  const user = state.currentUser;
  const couriers = DB.getArr('couriers').filter(c => c.companyId === user.companyId);

  return dashShell('company/couriers','company','My Couriers',
    `<button class="btn btn-primary btn-sm" onclick="openAddCourierModal('${user.companyId}')">+ Add Courier</button>`,`
    ${couriers.length===0?`<div class="empty-state"><div class="empty-icon">🚴</div><h3>No couriers yet</h3><p>Add couriers to your company to start taking deliveries.</p><button class="btn btn-primary" onclick="openAddCourierModal('${user.companyId}')">Add Your First Courier</button></div>`:`
    <div class="couriers-grid">
      ${couriers.map(c=>`
        <div class="courier-card">
          <div class="courier-avatar">${c.name[0]}</div>
          <div class="courier-info">
            <h4>${escape(c.name)}</h4>
            <p>${escape(c.phone||'—')}</p>
            <p style="margin-top:2px">✅ ${c.deliveriesCompleted} deliveries · ⭐ ${c.rating}</p>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            ${statusBadge(c.status)}
            <button class="btn btn-sm btn-outline" onclick="toggleCourierStatus('${c.id}')">Toggle Status</button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteCourier('${c.id}')">Remove</button>
          </div>
        </div>`).join('')}
    </div>`}`);
}

function renderCompanyDeliveries() {
  const user = state.currentUser;
  const orders = DB.getArr('orders').filter(o => o.companyId === user.companyId).sort((a,b)=>b.createdAt-a.createdAt);
  const couriers = DB.getArr('couriers').filter(c => c.companyId === user.companyId);

  return dashShell('company/deliveries','company','Deliveries','',`
    ${orders.length===0?`<div class="empty-state"><div class="empty-icon">📦</div><h3>No deliveries yet</h3></div>`:`
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Order #</th><th>Restaurant</th><th>Courier</th><th>Service Charge</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${orders.map(o=>`
          <tr>
            <td><strong>#${o.id.slice(-8).toUpperCase()}</strong></td>
            <td>${escape(o.restaurantName)}</td>
            <td>${o.courierName ? escape(o.courierName) : `<button class="btn btn-sm btn-outline" onclick="openAssignCourierModal('${o.id}')">Assign</button>`}</td>
            <td><strong>${fmt(o.serviceCharge)}</strong></td>
            <td style="font-size:0.85rem">${fmtDateShort(o.createdAt)}</td>
            <td>${statusBadge(o.status)}</td>
            <td>${!['delivered','cancelled'].includes(o.status) && o.courierName ? `<button class="btn btn-sm btn-outline" onclick="openAssignCourierModal('${o.id}')">Reassign</button>` : ''}</td>
          </tr>`).join('')}
      </tbody>
    </table></div>`}`);
}

function renderCompanyEarnings() {
  const user = state.currentUser;
  const company = DB.getArr('companies').find(c => c.id === user.companyId);
  const orders = DB.getArr('orders').filter(o => o.companyId === user.companyId && o.status==='delivered');
  const total = orders.reduce((s,o)=>s+o.serviceCharge,0);
  const month = orders.filter(o=>o.createdAt>Date.now()-30*864e5).reduce((s,o)=>s+o.serviceCharge,0);

  return dashShell('company/earnings','company','Earnings','',`
    <div class="grid-3" style="margin-bottom:24px">
      <div class="stat-card orange"><div class="stat-icon">💰</div><div class="stat-label">Total Earnings</div><div class="stat-value" style="font-size:1.5rem">${fmt(total)}</div><div class="stat-change">Service charge: ${fmt(company?.serviceCharge||0)} per delivery</div></div>
      <div class="stat-card green"><div class="stat-icon">📅</div><div class="stat-label">This Month</div><div class="stat-value" style="font-size:1.5rem">${fmt(month)}</div></div>
      <div class="stat-card blue"><div class="stat-icon">✅</div><div class="stat-label">Deliveries Done</div><div class="stat-value">${orders.length}</div></div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <h3 style="margin-bottom:10px">Your Service Charge</h3>
      <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:12px">This is what students pay your company per delivery.</p>
      <div class="flex gap-3 items-center">
        <input class="form-control" type="number" id="company-charge" value="${company?.serviceCharge||0}" style="max-width:180px"/>
        <button class="btn btn-primary" onclick="saveServiceCharge('${user.companyId}')">Update Charge</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Earnings History</h3></div>
      ${orders.length===0?`<div class="empty-state" style="padding:24px"><div class="empty-icon">💸</div><h3>No earnings yet</h3></div>`:
      `<div class="table-wrap"><table class="table">
        <thead><tr><th>Order #</th><th>Restaurant</th><th>Courier</th><th>Earned</th><th>Date</th></tr></thead>
        <tbody>${orders.map(o=>`<tr><td>#${o.id.slice(-8).toUpperCase()}</td><td>${escape(o.restaurantName)}</td><td>${o.courierName||'—'}</td><td><strong style="color:var(--success)">${fmt(o.serviceCharge)}</strong></td><td>${fmtDateShort(o.createdAt)}</td></tr>`).join('')}</tbody>
      </table></div>`}
    </div>`);
}

/* ===== COURIER VIEWS ===== */
function renderCourierDeliveries() {
  const user = state.currentUser;
  const orders = DB.getArr('orders').filter(o => o.courierId === user.courierId).sort((a,b)=>b.createdAt-a.createdAt);
  const active = orders.filter(o=>['ready','picked_up'].includes(o.status));
  const completed = orders.filter(o=>o.status==='delivered');

  return dashShell('courier/deliveries','courier','My Deliveries',
    `<div class="flex items-center gap-3">
      <div class="stat-card" style="padding:8px 14px;font-size:0.8rem"><strong>${fmt(completed.length * 200)}</strong><br/><span style="color:var(--text-muted)">Est. earned</span></div>
    </div>`,`
    ${active.length > 0 ? `
      <h3 style="margin-bottom:12px">🔴 Active Deliveries</h3>
      ${active.map(o=>`
        <div class="delivery-card active-delivery" style="margin-bottom:12px">
          <div class="flex justify-between items-start">
            <div><strong>Order #${o.id.slice(-8).toUpperCase()}</strong> — ${escape(o.restaurantName)}<br/><span style="font-size:0.85rem;color:var(--text-secondary)">📍 ${escape(o.address)}</span></div>
            ${statusBadge(o.status)}
          </div>
          <div class="flex gap-2" style="margin-top:12px">
            ${o.status==='ready' ? `<button class="btn btn-primary btn-sm" onclick="courierAdvance('${o.id}','picked_up')">✅ Picked Up</button>` : ''}
            ${o.status==='picked_up' ? `<button class="btn btn-success btn-sm" onclick="courierAdvance('${o.id}','delivered')">🏠 Mark Delivered</button>` : ''}
          </div>
        </div>`).join('')}` : ''}
    <h3 style="margin-bottom:12px;margin-top:${active.length>0?'24px':'0'}">Delivery History</h3>
    ${completed.length===0&&active.length===0?`<div class="empty-state"><div class="empty-icon">📦</div><h3>No deliveries assigned yet</h3><p>Your company will assign deliveries to you here.</p></div>`:''}
    ${completed.length>0?`
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Order #</th><th>Restaurant</th><th>Address</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${completed.map(o=>`
        <tr>
          <td>#${o.id.slice(-8).toUpperCase()}</td>
          <td>${escape(o.restaurantName)}</td>
          <td style="font-size:0.8rem;color:var(--text-secondary)">${escape(o.address)}</td>
          <td style="font-size:0.85rem">${fmtDateShort(o.createdAt)}</td>
          <td>${statusBadge(o.status)}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`:''}
  `);
}

function renderCourierProfile() {
  const user = state.currentUser;
  const courier = DB.getArr('couriers').find(c => c.id === user.courierId);
  return dashShell('courier/profile','courier','My Profile','',`
    <div class="container-sm" style="margin:0">
      <div class="card">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <div class="profile-avatar-big">${user.name[0].toUpperCase()}</div>
          <div>
            <h2 style="font-size:1.25rem">${escape(user.name)}</h2>
            <p style="color:var(--text-secondary);font-size:0.9rem">${escape(user.email)}</p>
            ${courier ? `<div style="margin-top:6px" class="flex gap-2">${statusBadge(courier.status)}<span class="badge badge-gray">⭐ ${courier.rating}</span></div>` : ''}
          </div>
        </div>
        <div class="form-group"><label>Full Name</label><input class="form-control" id="c-name" value="${escape(user.name)}"/></div>
        <div class="form-group"><label>Phone</label><input class="form-control" id="c-phone" value="${escape(user.phone||'')}"/></div>
        <button class="btn btn-primary" onclick="saveCourierProfile()">Save Changes</button>
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
          <p class="text-secondary text-sm">Total deliveries: <strong>${courier?.deliveriesCompleted||0}</strong></p>
          <p class="text-secondary text-sm">Rating: <strong>⭐ ${courier?.rating||'N/A'}</strong></p>
        </div>
      </div>
    </div>`);
}

/* ===== ADMIN VIEWS ===== */
function renderAdminDashboard() {
  const users = DB.getArr('users');
  const orders = DB.getArr('orders');
  const restaurants = DB.getArr('restaurants');
  const revenue = orders.filter(o=>o.status==='delivered').length * PLATFORM_FEE;

  return dashShell('admin/dashboard','admin','Platform Overview','',`
    <div class="grid-4" style="margin-bottom:24px">
      <div class="stat-card orange"><div class="stat-icon">👥</div><div class="stat-label">Total Users</div><div class="stat-value">${users.length}</div></div>
      <div class="stat-card green"><div class="stat-icon">🍽️</div><div class="stat-label">Restaurants</div><div class="stat-value">${restaurants.length}</div></div>
      <div class="stat-card blue"><div class="stat-icon">📦</div><div class="stat-label">Total Orders</div><div class="stat-value">${orders.length}</div></div>
      <div class="stat-card purple"><div class="stat-icon">💰</div><div class="stat-label">Platform Revenue</div><div class="stat-value" style="font-size:1.25rem">${fmt(revenue)}</div></div>
    </div>
    <div class="grid-2" style="gap:20px">
      <div class="card">
        <h3 style="margin-bottom:14px">User Breakdown</h3>
        ${['student','restaurant','company','courier','admin'].map(role=>{
          const count = users.filter(u=>u.role===role).length;
          const icons = {student:'🎓',restaurant:'🍽️',company:'🚚',courier:'🚴',admin:'🔧'};
          return `<div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border-light)">
            <span>${icons[role]} ${role.charAt(0).toUpperCase()+role.slice(1)}s</span>
            <strong>${count}</strong>
          </div>`;}).join('')}
      </div>
      <div class="card">
        <h3 style="margin-bottom:14px">Order Breakdown</h3>
        ${['pending','accepted','preparing','ready','picked_up','delivered','cancelled'].map(s=>{
          const count = orders.filter(o=>o.status===s).length;
          return `<div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border-light)">
            <span>${statusBadge(s)}</span><strong>${count}</strong>
          </div>`;}).join('')}
      </div>
    </div>`);
}

function renderAdminUsers() {
  const users = DB.getArr('users').filter(u=>u.role!=='admin');
  return dashShell('admin/users','admin','All Users','',`
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Joined</th><th>Actions</th></tr></thead>
      <tbody>
        ${users.map(u=>`
          <tr>
            <td><strong>${escape(u.name)}</strong></td>
            <td style="font-size:0.85rem">${escape(u.email)}</td>
            <td><span class="badge badge-orange">${u.role}</span></td>
            <td>${u.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-red">Unverified</span>'}</td>
            <td style="font-size:0.85rem">${fmtDateShort(u.createdAt)}</td>
            <td>
              ${!u.verified ? `<button class="btn btn-sm btn-primary" onclick="adminVerifyUser('${u.id}')">Verify</button>` : ''}
              <button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="adminDeleteUser('${u.id}')">Remove</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table></div>`);
}

function renderAdminReviews() {
  const reviews = DB.getArr('reviews').sort((a,b)=>b.createdAt-a.createdAt);
  return dashShell('admin/reviews','admin','Reviews & Moderation','',`
    ${reviews.length===0?`<div class="empty-state"><div class="empty-icon">⭐</div><h3>No reviews yet</h3></div>`:`
    <div style="display:grid;gap:14px">
      ${reviews.map(r=>`
        <div class="review-card">
          <div class="review-card-header">
            <div>
              <strong>${escape(r.studentName)}</strong>
              <span class="review-stars" style="margin-left:8px">${starsHTML(r.rating)}</span>
              <br/><span style="font-size:0.8rem;color:var(--text-muted)">${fmtDateShort(r.createdAt)}</span>
            </div>
            ${r.reported?`<span class="badge badge-red">⚠️ Reported</span>`:''}
          </div>
          <p style="font-size:0.9rem;color:var(--text)">${escape(r.comment)}</p>
          ${r.response?`<p style="font-size:0.85rem;color:var(--text-secondary);margin-top:8px;padding:8px;background:var(--surface);border-radius:var(--radius-sm)"><em>Restaurant replied: ${escape(r.response)}</em></p>`:''}
          <div class="flex gap-2" style="margin-top:10px">
            ${r.reported?`<button class="btn btn-sm btn-danger" onclick="removeReview('${r.id}')">Remove Review</button><button class="btn btn-sm btn-ghost" onclick="clearReport('${r.id}')">Clear Report</button>`:''}
            ${!r.reported?`<button class="btn btn-sm btn-outline" onclick="removeReview('${r.id}')">Remove</button>`:''}
          </div>
        </div>`).join('')}
    </div>`}`);
}

/* ===== MISC VIEWS ===== */
function renderUnauthorized() {
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="info-screen">
          <div class="info-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page. Please sign in with an account that has the correct role.</p>
          <button class="btn btn-primary btn-full" onclick="navigate('/login')">Sign In</button>
          <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick="navigate('/')">Go Home</button>
        </div>
      </div>
    </div>`;
}

function renderNotFound() {
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="info-screen">
          <div class="info-icon">🍽️</div>
          <h2>Page Not Found</h2>
          <p>This page doesn't exist — but great food does!</p>
          <button class="btn btn-primary btn-full" onclick="navigate('/')">Go Home</button>
        </div>
      </div>
    </div>`;
}

/* ===== PAGE EVENT SETUP ===== */
function setupPageEvents() {
  // Pre-select first company for checkout
  const companies = DB.getArr('companies');
  if (companies.length && !state.selectedCompanyId) state.selectedCompanyId = companies[0].id;
  // Update checkout totals if on checkout page
  const serviceValEl = el('service-charge-val');
  if (serviceValEl && state.selectedCompanyId) {
    const co = companies.find(c=>c.id===state.selectedCompanyId);
    if (co) { serviceValEl.textContent = fmt(co.serviceCharge); recalcCheckout(); }
    const opt = el('company-opt-' + state.selectedCompanyId);
    if (opt) opt.style.borderColor = 'var(--primary)';
  }
  refreshCartBadge();
}

/* ===== HANDLERS ===== */
function handleLogin() {
  const email = el('login-email')?.value?.trim();
  const pwd   = el('login-password')?.value;
  if (!email || !pwd) { showAuthError('Please fill in all fields.'); return; }
  const result = login(email, pwd);
  if (!result.ok) { showAuthError(result.msg); return; }
  const user = result.user;
  const dashMap = { student:'/student/home', restaurant:'/restaurant/dashboard', company:'/company/dashboard', courier:'/courier/deliveries', admin:'/admin/dashboard' };
  navigate(dashMap[user.role] || '/');
}

function handleSignup() {
  const role  = document.querySelector('.role-opt.active')?.dataset.role || 'student';
  const name  = el('signup-name')?.value?.trim();
  const email = el('signup-email')?.value?.trim();
  const pwd   = el('signup-password')?.value;
  const phone = el('signup-phone')?.value?.trim();
  if (!name || !email || !pwd || !phone) { showAuthError('Please fill in all fields.'); return; }
  if (pwd.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
  const result = registerUser({ name, email, password: pwd, role, phone });
  if (!result.ok) { showAuthError(result.msg); return; }
  navigate('/verify');
}

function handleForgot() {
  const email = el('forgot-email')?.value?.trim();
  if (!email) { showAuthError('Please enter your email.'); return; }
  const user = DB.getArr('users').find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) { showAuthError('No account found with that email.'); return; }
  const authSuccess = el('auth-success');
  if (authSuccess) { authSuccess.textContent = `Reset link sent to ${email}. (Demo: link would be emailed in production)`; authSuccess.classList.remove('hidden'); }
  const authError = el('auth-error');
  if (authError) authError.classList.add('hidden');
  toast('Reset link sent! Check your email.', 'success');
}

function handleResetPassword() {
  const pwd  = el('reset-password')?.value;
  const conf = el('reset-password-confirm')?.value;
  if (!pwd || pwd.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
  if (pwd !== conf) { showAuthError('Passwords do not match.'); return; }
  // In a real app this would use a token from the URL. Here we update the logged-in user if any.
  if (state.currentUser) {
    updateUser({ password: pwd });
    toast('Password updated successfully!', 'success');
    navigate('/login');
  } else {
    toast('Demo: no active session to update. Please sign in first.', 'warning');
    navigate('/login');
  }
}

function showAuthError(msg) {
  const e = el('auth-error');
  if (e) { e.textContent = msg; e.classList.remove('hidden'); }
}

function fillDemo(email, pwd) {
  const emailEl = el('login-email'), pwdEl = el('login-password');
  if (emailEl) emailEl.value = email;
  if (pwdEl) pwdEl.value = pwd;
}

function togglePwd(inputId) {
  const inp = el(inputId);
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

function selectRole(role) {
  document.querySelectorAll('.role-opt').forEach(el => el.classList.remove('active'));
  document.querySelector(`.role-opt[data-role="${role}"]`)?.classList.add('active');
}

function demoVerify() {
  const lastSigned = DB.get('lastSignup');
  if (lastSigned) { verifyUser(lastSigned); toast('Account verified! You can now sign in.', 'success'); navigate('/login'); }
  else { toast('No pending account to verify. Please sign up first.', 'warning'); }
}

/* ===== CART HANDLERS ===== */
function addToCartFromMenu(itemId, restaurantId) {
  const rest = DB.getArr('restaurants').find(r => r.id === restaurantId);
  if (!rest) return;
  const item = rest.items.find(i => i.id === itemId);
  if (!item) return;
  addToCart(item, restaurantId);
  navigate('/student/restaurant?id=' + restaurantId);
}

function cartQty(itemId, restaurantId, delta) {
  updateQty(itemId, delta);
  navigate('/student/restaurant?id=' + restaurantId);
}

function updateQtyAndRefresh(itemId, delta) {
  updateQty(itemId, delta);
  navigate('/student/cart');
}

function removeAndRefresh(itemId) {
  removeFromCart(itemId);
  navigate('/student/cart');
}

function confirmClearCart() {
  openModal(`<h3>Clear Cart?</h3><p>All items will be removed from your cart.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="state.cart=[];state.cartRestaurantId=null;closeModal();navigate('/student/cart')">Clear Cart</button>
    </div>`);
}

function filterRestaurants(query) {
  const grid = el('restaurant-grid');
  if (!grid) return;
  const q = query.toLowerCase();
  grid.querySelectorAll('.restaurant-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

/* ===== CHECKOUT HANDLERS ===== */
function selectCompany(companyId) {
  state.selectedCompanyId = companyId;
  document.querySelectorAll('[id^="company-opt-"]').forEach(el => el.style.borderColor = 'var(--border)');
  const opt = el('company-opt-' + companyId);
  if (opt) opt.style.borderColor = 'var(--primary)';
  const co = DB.getArr('companies').find(c => c.id === companyId);
  if (co) {
    const scVal = el('service-charge-val');
    if (scVal) scVal.textContent = fmt(co.serviceCharge);
    recalcCheckout();
  }
}

let promoDiscount = 0;
function applyPromo(restaurantId) {
  const code = el('promo-code')?.value?.trim().toUpperCase();
  if (!code) { showPromoMsg('Enter a promo code.', 'error'); return; }
  const rest = DB.getArr('restaurants').find(r => r.id === restaurantId);
  const promo = rest?.promoCodes.find(p => p.code === code);
  if (!promo) { showPromoMsg('Invalid promo code.', 'error'); promoDiscount = 0; recalcCheckout(); return; }
  const sub = cartTotal();
  if (sub < promo.min) { showPromoMsg(`Minimum order of ${fmt(promo.min)} required.`, 'error'); promoDiscount = 0; recalcCheckout(); return; }
  promoDiscount = promo.type === 'percent' ? Math.round(sub * promo.value / 100) : promo.value;
  showPromoMsg(`🎉 Promo applied! You save ${fmt(promoDiscount)}.`, 'success');
  recalcCheckout();
}

function showPromoMsg(msg, type) {
  const el2 = el('promo-msg');
  if (el2) { el2.textContent = msg; el2.style.color = type==='success' ? 'var(--success)' : 'var(--error)'; }
}

function recalcCheckout() {
  const restaurants = DB.getArr('restaurants');
  const companies = DB.getArr('companies');
  const rest = restaurants.find(r => r.id === state.cartRestaurantId);
  const co = companies.find(c => c.id === state.selectedCompanyId);
  if (!rest) return;
  const sub = cartTotal();
  const sc = co ? co.serviceCharge : 0;
  const total = sub + rest.deliveryFee + sc + PLATFORM_FEE - promoDiscount;
  const totalEl = el('checkout-total');
  if (totalEl) totalEl.textContent = fmt(Math.max(0, total));
  const discLine = el('discount-line');
  const discVal = el('discount-val');
  if (discLine && discVal) {
    discLine.style.display = promoDiscount > 0 ? '' : 'none';
    discVal.textContent = '−' + fmt(promoDiscount);
  }
}

function handlePlaceOrder(restaurantId) {
  if (!state.selectedCompanyId) { toast('Please select a courier company.', 'warning'); return; }
  const address = el('delivery-address')?.value?.trim();
  if (!address) { toast('Please enter a delivery address.', 'warning'); return; }
  const rest = DB.getArr('restaurants').find(r => r.id === restaurantId);
  const co = DB.getArr('companies').find(c => c.id === state.selectedCompanyId);
  const couriers = DB.getArr('couriers').filter(c => c.companyId === state.selectedCompanyId && c.status === 'available');
  const sub = cartTotal();
  const total = sub + rest.deliveryFee + co.serviceCharge + PLATFORM_FEE - promoDiscount;
  if ((state.currentUser.wallet||0) < total) { toast('Insufficient wallet balance. Please top up.', 'error'); return; }
  const promoCode = el('promo-code')?.value?.trim().toUpperCase() || null;
  const assignedCourier = couriers[0] || null;
  const order = placeOrder({
    studentId: state.currentUser.id,
    restaurantId, restaurantName: rest.name,
    items: state.cart.map(i => ({...i})),
    subtotal: sub, deliveryFee: rest.deliveryFee,
    serviceCharge: co.serviceCharge, platformFee: PLATFORM_FEE,
    discount: promoDiscount, promoCode,
    total, address,
    companyId: state.selectedCompanyId,
    courierId: assignedCourier?.id || null,
    courierName: assignedCourier?.name || null,
  });
  promoDiscount = 0;
  state.selectedCompanyId = null;
  toast('🎉 Order placed successfully!', 'success');
  navigate('/student/tracking?id=' + order.id);
}

/* ===== RESTAURANT HANDLERS ===== */
function advanceOrder(orderId, newStatus) {
  updateOrderStatus(orderId, newStatus);
  toast(`Order status updated to "${newStatus.replace('_',' ')}"`, 'success');
  // Silent refresh keeps polling timer alive
  const path = location.hash.replace('#','').split('?')[0];
  _silentRefresh(path);
}

function toggleRestaurantOpen(restId) {
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx === -1) return;
  restaurants[idx].isOpen = !restaurants[idx].isOpen;
  DB.set('restaurants', restaurants);
  const now = restaurants[idx].isOpen;
  toast(now ? '🟢 Restaurant is now Open' : '🔴 Restaurant is now Closed', now ? 'success' : 'warning');
  // Silent refresh so polling stays live
  _silentRefresh('/restaurant/dashboard');
}

function saveRestaurantProfile(restId) {
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx === -1) return;
  restaurants[idx].name        = el('r-name')?.value?.trim() || restaurants[idx].name;
  restaurants[idx].description = el('r-desc')?.value?.trim() || restaurants[idx].description;
  restaurants[idx].cuisine     = el('r-cuisine')?.value?.trim() || restaurants[idx].cuisine;
  restaurants[idx].address     = el('r-address')?.value?.trim() || restaurants[idx].address;
  restaurants[idx].phone       = el('r-phone')?.value?.trim() || restaurants[idx].phone;
  restaurants[idx].openTime    = el('r-open')?.value || restaurants[idx].openTime;
  restaurants[idx].closeTime   = el('r-close')?.value || restaurants[idx].closeTime;
  DB.set('restaurants', restaurants);
  toast('Restaurant profile saved!', 'success');
}

function saveDeliveryFee(restId) {
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx === -1) return;
  const fee = parseInt(el('r-fee')?.value) || 0;
  if (fee < 0) { toast('Fee cannot be negative.', 'error'); return; }
  restaurants[idx].deliveryFee = fee;
  DB.set('restaurants', restaurants);
  toast('Delivery fee updated!', 'success');
}

function openAddItemModal(restId) {
  openModal(`
    <h3>Add Menu Item</h3>
    <div class="form-group"><label>Item Name</label><input class="form-control" id="mi-name" placeholder="e.g. Jollof Rice"/></div>
    <div class="form-group"><label>Price (₦)</label><input class="form-control" type="number" id="mi-price" placeholder="1500"/></div>
    <div class="form-group"><label>Category</label><input class="form-control" id="mi-cat" placeholder="e.g. Rice Dishes"/></div>
    <div class="form-group"><label>Emoji</label><input class="form-control" id="mi-emoji" placeholder="🍛"/></div>
    <div class="form-group"><label>Description</label><textarea class="form-control" id="mi-desc" rows="2" placeholder="Short description..."></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="addMenuItem('${restId}')">Add Item</button>
    </div>`);
}

function addMenuItem(restId) {
  const name = el('mi-name')?.value?.trim();
  const price = parseInt(el('mi-price')?.value) || 0;
  const category = el('mi-cat')?.value?.trim() || 'Other';
  const emoji = el('mi-emoji')?.value?.trim() || '🍽️';
  const desc = el('mi-desc')?.value?.trim() || '';
  if (!name || !price) { toast('Name and price are required.', 'error'); return; }
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx === -1) return;
  restaurants[idx].items.push({ id: uid(), name, price, category, emoji, desc });
  DB.set('restaurants', restaurants);
  closeModal();
  toast(`${name} added to menu!`, 'success');
  navigate('/restaurant/menu');
}

function openEditItemModal(restId, itemId) {
  const rest = DB.getArr('restaurants').find(r => r.id === restId);
  const item = rest?.items.find(i => i.id === itemId);
  if (!item) return;
  openModal(`
    <h3>Edit Menu Item</h3>
    <div class="form-group"><label>Item Name</label><input class="form-control" id="ei-name" value="${escape(item.name)}"/></div>
    <div class="form-group"><label>Price (₦)</label><input class="form-control" type="number" id="ei-price" value="${item.price}"/></div>
    <div class="form-group"><label>Category</label><input class="form-control" id="ei-cat" value="${escape(item.category)}"/></div>
    <div class="form-group"><label>Emoji</label><input class="form-control" id="ei-emoji" value="${escape(item.emoji)}"/></div>
    <div class="form-group"><label>Description</label><textarea class="form-control" id="ei-desc" rows="2">${escape(item.desc)}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveMenuItem('${restId}','${itemId}')">Save Changes</button>
    </div>`);
}

function saveMenuItem(restId, itemId) {
  const restaurants = DB.getArr('restaurants');
  const rIdx = restaurants.findIndex(r => r.id === restId);
  if (rIdx === -1) return;
  const iIdx = restaurants[rIdx].items.findIndex(i => i.id === itemId);
  if (iIdx === -1) return;
  restaurants[rIdx].items[iIdx].name     = el('ei-name')?.value?.trim() || restaurants[rIdx].items[iIdx].name;
  restaurants[rIdx].items[iIdx].price    = parseInt(el('ei-price')?.value) || restaurants[rIdx].items[iIdx].price;
  restaurants[rIdx].items[iIdx].category = el('ei-cat')?.value?.trim() || restaurants[rIdx].items[iIdx].category;
  restaurants[rIdx].items[iIdx].emoji    = el('ei-emoji')?.value?.trim() || restaurants[rIdx].items[iIdx].emoji;
  restaurants[rIdx].items[iIdx].desc     = el('ei-desc')?.value?.trim() || restaurants[rIdx].items[iIdx].desc;
  DB.set('restaurants', restaurants);
  closeModal();
  toast('Menu item updated!', 'success');
  navigate('/restaurant/menu');
}

function deleteMenuItem(restId, itemId) {
  openModal(`<h3>Remove Item?</h3><p>This menu item will be permanently removed.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="confirmDeleteMenuItem('${restId}','${itemId}')">Remove</button>
    </div>`);
}

function confirmDeleteMenuItem(restId, itemId) {
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx !== -1) { restaurants[idx].items = restaurants[idx].items.filter(i => i.id !== itemId); DB.set('restaurants', restaurants); }
  closeModal(); toast('Item removed from menu.', 'success'); navigate('/restaurant/menu');
}

function openAddPromoModal(restId) {
  openModal(`<h3>Add Promo Code</h3>
    <div class="form-group"><label>Code</label><input class="form-control" id="pc-code" placeholder="e.g. SAVE20" style="text-transform:uppercase"/></div>
    <div class="form-group"><label>Type</label>
      <select class="form-control" id="pc-type">
        <option value="percent">Percentage (%)</option>
        <option value="flat">Flat Amount (₦)</option>
      </select>
    </div>
    <div class="form-group"><label>Value</label><input class="form-control" type="number" id="pc-val" placeholder="10 (for 10% or ₦10)"/></div>
    <div class="form-group"><label>Minimum Order (₦)</label><input class="form-control" type="number" id="pc-min" value="500"/></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="addPromoCode('${restId}')">Add Code</button>
    </div>`);
}

function addPromoCode(restId) {
  const code  = el('pc-code')?.value?.trim().toUpperCase();
  const type  = el('pc-type')?.value;
  const value = parseInt(el('pc-val')?.value) || 0;
  const min   = parseInt(el('pc-min')?.value) || 0;
  if (!code || !value) { toast('Fill in all fields.', 'error'); return; }
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx === -1) return;
  restaurants[idx].promoCodes.push({ code, type, value, min });
  DB.set('restaurants', restaurants);
  closeModal(); toast('Promo code added!', 'success'); navigate('/restaurant/profile');
}

function deletePromo(restId, code) {
  const restaurants = DB.getArr('restaurants');
  const idx = restaurants.findIndex(r => r.id === restId);
  if (idx !== -1) { restaurants[idx].promoCodes = restaurants[idx].promoCodes.filter(p => p.code !== code); DB.set('restaurants', restaurants); }
  toast('Promo code removed.', 'success'); navigate('/restaurant/profile');
}

/* ===== COURIER COMPANY HANDLERS ===== */
function openAddCourierModal(companyId) {
  openModal(`<h3>Add New Courier</h3>
    <p>The courier will receive their login credentials via email.</p>
    <div class="form-group"><label>Full Name</label><input class="form-control" id="nc-name" placeholder="e.g. Bello Ibrahim"/></div>
    <div class="form-group"><label>Email</label><input class="form-control" type="email" id="nc-email" placeholder="courier@email.com"/></div>
    <div class="form-group"><label>Phone</label><input class="form-control" id="nc-phone" placeholder="08012345678"/></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="addCourier('${companyId}')">Add Courier</button>
    </div>`);
}

function addCourier(companyId) {
  const name  = el('nc-name')?.value?.trim();
  const email = el('nc-email')?.value?.trim();
  const phone = el('nc-phone')?.value?.trim();
  if (!name || !email) { toast('Name and email are required.', 'error'); return; }
  const users = DB.getArr('users');
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) { toast('Email already in use.', 'error'); return; }
  const newUserId = uid(); const courierId = 'cr_' + uid();
  const user = { id: newUserId, email, password: 'pass123', role: 'courier', name, phone, verified: true, setupComplete: true, companyId, courierId, createdAt: Date.now() };
  const courier = { id: courierId, companyId, userId: newUserId, name, phone, verified: true, status: 'available', deliveriesCompleted: 0, rating: 0 };
  users.push(user);
  const couriers = DB.getArr('couriers');
  couriers.push(courier);
  DB.set('users', users); DB.set('couriers', couriers);
  closeModal(); toast(`${name} added as a courier. Password: pass123`, 'success', 5000); navigate('/company/couriers');
}

function openAssignCourierModal(orderId) {
  const user = state.currentUser;
  const couriers = DB.getArr('couriers').filter(c => c.companyId === user.companyId);
  const order = DB.getArr('orders').find(o => o.id === orderId);
  if (!order) return;

  openModal(`
    <h3>Assign Courier</h3>
    <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:16px">Order #${orderId.slice(-8).toUpperCase()} — ${escape(order.restaurantName)}</p>
    ${couriers.length === 0
      ? `<div class="empty-state" style="padding:24px"><div class="empty-icon">🚴</div><h3>No couriers available</h3><p>Add couriers to your company first.</p></div>`
      : `<div id="courier-opts" style="display:grid;gap:8px;margin-bottom:16px">
          ${couriers.map(c => `
            <div class="courier-card" style="cursor:pointer;border:2px solid ${order.courierId===c.id?'var(--primary)':'var(--border)'}" onclick="selectCourierOpt(this,'${c.id}')">
              <div class="courier-avatar">${c.name[0]}</div>
              <div style="flex:1">
                <strong>${escape(c.name)}</strong>
                <p style="font-size:0.8rem;color:var(--text-secondary)">${c.deliveriesCompleted} deliveries · ⭐ ${c.rating}</p>
              </div>
              ${statusBadge(c.status)}
            </div>`).join('')}
        </div>
        <input type="hidden" id="selected-courier-id" value="${order.courierId || couriers[0]?.id || ''}"/>`}
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      ${couriers.length > 0 ? `<button class="btn btn-primary" onclick="confirmAssignCourier('${orderId}')">Assign Courier</button>` : ''}
    </div>`);
}

function selectCourierOpt(elem, courierId) {
  document.querySelectorAll('#courier-opts .courier-card').forEach(c => c.style.borderColor = 'var(--border)');
  elem.style.borderColor = 'var(--primary)';
  const inp = el('selected-courier-id');
  if (inp) inp.value = courierId;
}

function confirmAssignCourier(orderId) {
  const courierId = el('selected-courier-id')?.value;
  if (!courierId) { toast('Please select a courier.', 'warning'); return; }
  const couriers = DB.getArr('couriers');
  const courier = couriers.find(c => c.id === courierId);
  if (!courier) return;
  const orders = DB.getArr('orders');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;
  orders[idx].courierId = courierId;
  orders[idx].courierName = courier.name;
  DB.set('orders', orders);
  closeModal();
  toast(`${courier.name} assigned to order #${orderId.slice(-8).toUpperCase()}.`, 'success');
  navigate('/company/deliveries');
}

function toggleCourierStatus(courierId) {
  const couriers = DB.getArr('couriers');
  const idx = couriers.findIndex(c => c.id === courierId);
  if (idx === -1) return;
  const statuses = ['available','busy','offline'];
  const cur = statuses.indexOf(couriers[idx].status);
  couriers[idx].status = statuses[(cur + 1) % statuses.length];
  DB.set('couriers', couriers);
  toast(`Courier status updated to ${couriers[idx].status}.`, 'success');
  navigate('/company/couriers');
}

function confirmDeleteCourier(courierId) {
  openModal(`<h3>Remove Courier?</h3><p>This courier will be removed from your company. Their account will be deactivated.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="removeCourier('${courierId}')">Remove</button>
    </div>`);
}

function removeCourier(courierId) {
  const couriers = DB.getArr('couriers');
  const courier = couriers.find(c => c.id === courierId);
  DB.set('couriers', couriers.filter(c => c.id !== courierId));
  if (courier) {
    DB.set('users', DB.getArr('users').filter(u => u.courierId !== courierId));
  }
  closeModal(); toast('Courier removed.', 'success'); navigate('/company/couriers');
}

function saveServiceCharge(companyId) {
  const charge = parseInt(el('company-charge')?.value) || 0;
  if (charge < 0) { toast('Charge cannot be negative.', 'error'); return; }
  const companies = DB.getArr('companies');
  const idx = companies.findIndex(c => c.id === companyId);
  if (idx !== -1) { companies[idx].serviceCharge = charge; DB.set('companies', companies); }
  toast('Service charge updated!', 'success');
}

/* ===== COURIER HANDLERS ===== */
function courierAdvance(orderId, newStatus) {
  const orders = DB.getArr('orders');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = newStatus;
    if (newStatus === 'delivered') { orders[idx].deliveredAt = Date.now(); }
    DB.set('orders', orders);
    if (newStatus === 'delivered') {
      const user = state.currentUser;
      const couriers = DB.getArr('couriers');
      const ci = couriers.findIndex(c => c.id === user.courierId);
      if (ci !== -1) { couriers[ci].deliveriesCompleted++; couriers[ci].status = 'available'; DB.set('couriers', couriers); }
    }
  }
  toast(`Order marked as ${newStatus.replace('_',' ')}.`, 'success');
  navigate('/courier/deliveries');
}

/* ===== PROFILE HANDLERS ===== */
function saveProfile() {
  const updates = {};
  const nameEl = el('p-name'), phoneEl = el('p-phone'), addrEl = el('p-address');
  if (nameEl?.value?.trim()) updates.name = nameEl.value.trim();
  if (phoneEl?.value?.trim()) updates.phone = phoneEl.value.trim();
  if (addrEl?.value?.trim()) updates.address = addrEl.value.trim();
  updateUser(updates);
  toast('Profile saved!', 'success');
}

function saveCourierProfile() {
  const updates = {};
  const nameEl = el('c-name'), phoneEl = el('c-phone');
  if (nameEl?.value?.trim()) updates.name = nameEl.value.trim();
  if (phoneEl?.value?.trim()) updates.phone = phoneEl.value.trim();
  updateUser(updates);
  if (updates.name) {
    const couriers = DB.getArr('couriers');
    const idx = couriers.findIndex(c => c.id === state.currentUser.courierId);
    if (idx !== -1) { couriers[idx].name = updates.name; DB.set('couriers', couriers); }
  }
  toast('Profile saved!', 'success');
}

function topUpWallet() {
  openModal(`<h3>💳 Top Up Wallet</h3>
    <p>Add funds to your Füd wallet to pay for orders.</p>
    <div class="form-group"><label>Amount (₦)</label><input class="form-control" type="number" id="topup-amount" placeholder="e.g. 5000" min="100"/></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
      ${[1000,2000,5000,10000].map(a=>`<button class="btn btn-outline btn-sm" onclick="el('topup-amount').value=${a}">${fmt(a)}</button>`).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmTopUp()">Add Funds</button>
    </div>`);
}

function confirmTopUp() {
  const amount = parseInt(el('topup-amount')?.value) || 0;
  if (amount < 100) { toast('Minimum top-up is ₦100.', 'error'); return; }
  updateUser({ wallet: (state.currentUser.wallet || 0) + amount });
  closeModal();
  toast(`₦${amount.toLocaleString()} added to your wallet!`, 'success');
  navigate('/student/profile');
}

/* ===== REVIEW HANDLERS ===== */
function setRating(val) {
  const inp = el('review-rating');
  if (inp) inp.value = val;
  el('star-row')?.querySelectorAll('.star').forEach((s,i) => s.classList.toggle('active', i < val));
}

function submitReview(orderId, restaurantId) {
  const rating = parseInt(el('review-rating')?.value) || 4;
  const comment = el('review-comment')?.value?.trim();
  if (!comment) { toast('Please write a comment.', 'warning'); return; }
  const orders = DB.getArr('orders');
  const oi = orders.findIndex(o => o.id === orderId);
  if (oi !== -1) { orders[oi].reviewed = true; orders[oi].rating = rating; orders[oi].review = comment; DB.set('orders', orders); }
  const reviews = DB.getArr('reviews');
  reviews.push({
    id: 'rv_'+uid(), orderId, restaurantId,
    studentId: state.currentUser.id,
    studentName: state.currentUser.name.split(' ')[0] + ' ' + (state.currentUser.name.split(' ')[1]?.[0]||'') + '.',
    rating, comment, reported: false, response: null, createdAt: Date.now()
  });
  DB.set('reviews', reviews);
  toast('Review submitted! Thank you 🌟', 'success');
  navigate('/student/orders');
}

/* ===== ADMIN HANDLERS ===== */
function adminVerifyUser(userId) {
  verifyUser(userId);
  toast('User verified!', 'success');
  navigate('/admin/users');
}

function adminDeleteUser(userId) {
  openModal(`<h3>Remove User?</h3><p>This will permanently remove the user account.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="confirmAdminDeleteUser('${userId}')">Remove</button>
    </div>`);
}

function confirmAdminDeleteUser(userId) {
  DB.set('users', DB.getArr('users').filter(u => u.id !== userId));
  closeModal(); toast('User removed.', 'success'); navigate('/admin/users');
}

function removeReview(reviewId) {
  DB.set('reviews', DB.getArr('reviews').filter(r => r.id !== reviewId));
  toast('Review removed.', 'success'); navigate('/admin/reviews');
}

function clearReport(reviewId) {
  const reviews = DB.getArr('reviews');
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx !== -1) { reviews[idx].reported = false; DB.set('reviews', reviews); }
  toast('Report cleared.', 'success'); navigate('/admin/reviews');
}

function removeReview(reviewId) {
  DB.set('reviews', DB.getArr('reviews').filter(r => r.id !== reviewId));
  toast('Review removed.', 'success'); navigate('/admin/reviews');
}

function clearReport(reviewId) {
  const reviews = DB.getArr('reviews');
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx !== -1) { reviews[idx].reported = false; DB.set('reviews', reviews); }
  toast('Report cleared.', 'success'); navigate('/admin/reviews');
}

/* ===== GLOBAL EVENT LISTENERS ===== */
window.addEventListener('hashchange', router);

// Close sidebar when resizing back to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeSidebar();
});

// Expose globals
window.state = state;
window.navigate = navigate;
window.closeModal = closeModal;
window.openModal = openModal;
window.toast = toast;
window.el = el;
window.logout = logout;
window.login = login;
window.DB = DB;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleRestaurantOpen = toggleRestaurantOpen;
window.isOpenNow = isOpenNow;
window.adminToggleSuspend = adminToggleSuspend;
window.adminUsersPage = adminUsersPage;
window.adminReviewsPage = adminReviewsPage;

/* ===== INIT ===== */
seedData();
restoreSession();
router();