/* ===== Hasan Mart : app.js (redesigned) ===== */
const $ = s => document.querySelector(s), app = $("#app"), S = STORE, EXT = ["jpg", "png", "webp"];
const money = n => S.currency + " " + n.toLocaleString("en-US");

/* ---------- icons ---------- */
const IC = {
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 13l4 4L19 7",
  x: "M18 6L6 18M6 6l12 12",
  mail: "M4 4h16v16H4zM4 6l8 7 8-7",
  phone: "M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z",
  chat: "M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.2A8 8 0 1121 12z",
  card: "M2 6h20v13H2zM2 10h20M6 15h4"
};
const ico = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n]}"/></svg>`;

/* ---------- products ---------- */
const V = [["Classic", 1], ["Premium", 1.4], ["Select", 1.15], ["Everyday", 1.25], ["Deluxe", 1.6]], P = [];
CATS.forEach(c => {
  let i = 0;
  V.forEach(([v, m]) => c.b.forEach(([n, p]) => {
    i++;
    P.push({ id: c.id + "-" + i, cat: c.id, n: i, v, name: v + " " + n, price: Math.round(p * m / 10) * 10 });
  }));
});
const cat = id => CATS.find(c => c.id == id), prod = id => P.find(p => p.id == id);

/* ---------- state ---------- */
let cart = {}, db = null, sort = "", last = null;
try { cart = JSON.parse(localStorage.getItem("hb_cart") || "{}"); } catch (e) { cart = {}; }
Object.keys(cart).forEach(id => { if (!prod(id)) delete cart[id]; });
if (window.FIREBASE_CONFIG && window.firebase) { firebase.initializeApp(FIREBASE_CONFIG); db = firebase.firestore(); }
const total = () => Object.entries(cart).reduce((a, [id, q]) => a + prod(id).price * q, 0);
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
const save = () => {
  localStorage.setItem("hb_cart", JSON.stringify(cart));
  const n = count();
  $("#cc").textContent = n;
  $("#cc").hidden = !n;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- image fallback (jpg -> png -> webp -> animated placeholder) ---------- */
const ph = c => c.id == "watches"
  ? '<div class="ph"><i class="clock"></i></div>'
  : `<div class="ph"><i class="g g${CATS.indexOf(c) % 4}"><b></b><b></b><b></b></i></div>`;
function fail(im) {
  const t = +im.dataset.t || 0;
  if (t < 2) { im.dataset.t = t + 1; im.src = im.src.replace(/\.\w+$/, "." + EXT[t + 1]); }
  else im.parentNode.innerHTML = im.dataset.k == "t" ? cat(im.dataset.c).icon : ph(cat(im.dataset.c));
}

/* ---------- pieces ---------- */
const badge = p => (p.v == "Premium" || p.v == "Deluxe") ? `<span class="bdg">${p.v}</span>` : "";
const card = p => `<article class="card">${badge(p)}<div class="media"><img src="images/${p.cat}/S${p.n}.jpg" data-c="${p.cat}" loading="lazy" alt="" onerror="fail(this)"></div><div class="cb"><small class="tag">${cat(p.cat).name}</small><h3>${p.name}</h3><div class="row"><b>${money(p.price)}</b><button class="add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">${ico("plus")}<span>Add</span></button></div></div></article>`;
const grid = l => l.length ? `<div class="grid">${l.map(card).join("")}</div>` : '<p class="note">No products match your search.</p>';
const sorter = () => `<select id="srt" aria-label="Sort products"><option value="">Featured order</option><option value="lo"${sort == "lo" ? " selected" : ""}>Price: low to high</option><option value="hi"${sort == "hi" ? " selected" : ""}>Price: high to low</option></select>`;
const sortL = l => sort == "lo" ? [...l].sort((a, b) => a.price - b.price) : sort == "hi" ? [...l].sort((a, b) => b.price - a.price) : l;
const stepper = n => `<ol class="stepper">${["Cart", "Checkout", "Done"].map((s, i) => `<li class="${i + 1 < n ? "dn" : ""}${i + 1 == n ? " on" : ""}"><span>${i + 1 < n ? ico("check") : i + 1}</span>${s}</li>`).join("")}</ol>`;

/* ---------- pages ---------- */
const views = {
  home() {
    const trust = [
      ["🚚", "Cash on delivery", "Pay when your order arrives"],
      ["📲", "Easypaisa & JazzCash", "Pay by QR code or number"],
      ["💬", "WhatsApp confirmation", "Confirm your order in one tap"],
      ["🛍️", P.length + " products", "Across " + CATS.length + " departments"]
    ];
    return `<section class="hero">
      <div class="hcopy">
        <span class="kick"><i class="dot"></i>${P.length} products · ${CATS.length} departments</span>
        <h1>Shop smarter at <span>${S.name}</span></h1>
        <p>${S.tag}. Pay by cash on delivery, Easypaisa or JazzCash.</p>
        <div class="cta"><a class="btn" href="#/c/fashion">Start shopping ${ico("arrow")}</a><a class="btn ghost" href="#/contact">Contact us</a></div>
        <ul class="facts"><li><b>${P.length}</b> products</li><li><b>${CATS.length}</b> departments</li><li><b>3</b> payment options</li></ul>
      </div>
      <div class="stage" id="stage">
        ${[[0, "s1"], [1, "s2"], [9, "s3"]].map(([i, k]) => `<div class="st ${k}"><span class="em">${CATS[i].icon}</span><span class="nm">${CATS[i].name}</span></div>`).join("")}
      </div>
    </section>
    <div class="trust">${trust.map(t => `<div class="tr"><span class="e">${t[0]}</span><div><b>${t[1]}</b><small>${t[2]}</small></div></div>`).join("")}</div>
    <div class="head"><h2>Shop by department</h2><p>Find what you need in a few taps.</p></div>
    <div class="tiles">${CATS.map(c => `<a class="tile" href="#/c/${c.id}"><span class="ti">${c.icon}</span><b>${c.name}</b><small>${P.filter(p => p.cat == c.id).length} items</small><i>${ico("arrow")}</i></a>`).join("")}</div>
    <div class="head"><h2>Featured picks</h2><p>A taste of every department.</p></div>
    ${grid(P.filter(p => p.n < 3))}
    <section class="paybn"><div><h2>Pay your way</h2><p>Three simple payment options at checkout.</p></div><div class="pills"><span>Cash on delivery · + ${money(S.codFee)}</span><span>Easypaisa</span><span>JazzCash</span></div></section>`;
  },

  c(id) {
    const c = cat(id);
    if (!c) return views.home();
    const l = P.filter(p => p.cat == id);
    return `<nav class="crumb"><a href="#/">Home</a><span>/</span><b>${c.name}</b></nav>
    <div class="chead"><span class="ti">${c.icon}</span><div><h2>${c.name}</h2><small>${l.length} items</small></div>${sorter()}</div>${grid(sortL(l))}`;
  },

  s(q = "") {
    const k = q.toLowerCase(), l = P.filter(p => (p.name + " " + cat(p.cat).name).toLowerCase().includes(k));
    return `<nav class="crumb"><a href="#/">Home</a><span>/</span><b>Search</b></nav>
    <div class="chead"><span class="ti">${ico("search")}</span><div><h2>Results for “${esc(q)}”</h2><small>${l.length} items</small></div>${sorter()}</div>${grid(sortL(l))}`;
  },

  cart() {
    const ids = Object.keys(cart);
    if (!ids.length) return `<div class="empty"><span class="ti big">🛒</span><h2>Your cart is empty</h2><p>Pick a department and add something you like.</p><a class="btn" href="#/">Continue shopping</a></div>`;
    const n = count();
    return `${stepper(1)}<h2 class="pt">Your cart <small>${n} item${n > 1 ? "s" : ""}</small></h2>
    <div class="two">
      <div class="cartl">${ids.map(id => {
        const p = prod(id);
        return `<div class="line"><div class="thumb"><img src="images/${p.cat}/S${p.n}.jpg" data-c="${p.cat}" data-k="t" alt="" onerror="fail(this)"></div><div class="ln"><b>${p.name}</b><small>${cat(p.cat).name} · ${money(p.price)} each</small></div><div class="qty"><button data-dec="${id}" aria-label="Fewer">−</button><span>${cart[id]}</span><button data-inc="${id}" aria-label="More">+</button></div><b class="lt">${money(p.price * cart[id])}</b><button class="x" data-del="${id}" aria-label="Remove item">${ico("x")}</button></div>`;
      }).join("")}</div>
      <aside class="sumc"><h3>Order summary</h3>
        <div class="sum"><div><span>Subtotal</span><b>${money(total())}</b></div></div>
        <p class="note">Delivery details and payment come next. Cash on delivery adds ${money(S.codFee)}.</p>
        <a class="btn wide" href="#/checkout">Go to checkout ${ico("arrow")}</a>
        <a class="lnk" href="#/">Continue shopping</a>
      </aside>
    </div>`;
  },

  checkout() {
    if (!Object.keys(cart).length) return views.cart();
    const pays = [["cod", "Cash on delivery", "+ " + money(S.codFee) + " handling fee"], ["easypaisa", "Easypaisa", "Pay by QR code or number"], ["jazzcash", "JazzCash", "Pay by QR code or number"]];
    return `${stepper(2)}<h2 class="pt">Checkout</h2>
    <form id="ck" class="two">
      <div class="ckl">
        <h3>Delivery details</h3>
        <div class="fields">
          <label>Full name<input name="name" required autocomplete="name"></label>
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Mobile number<input name="mobile" required pattern="0\\d{3}-?\\d{7}" placeholder="0300-1234567" autocomplete="tel"></label>
          <label>City<input name="city" required></label>
          <label class="w">Delivery address<textarea name="address" required rows="2"></textarea></label>
          <label>Postal code (optional)<input name="postal"></label>
          <label>Order notes (optional)<input name="notes"></label>
        </div>
        <h3>Payment method</h3>
        <div class="pays">${pays.map((x, i) => `<label class="pay"><input type="radio" name="pay" value="${x[0]}"${i ? "" : " checked"}><b>${x[1]}</b><small>${x[2]}</small></label>`).join("")}</div>
        <div id="wp"></div>
      </div>
      <aside class="sumc"><h3>Your order</h3>
        <ul class="mini">${Object.entries(cart).map(([id, q]) => `<li><span>${q} × ${prod(id).name}</span><b>${money(prod(id).price * q)}</b></li>`).join("")}</ul>
        <div class="sum" id="tot"></div>
        <button class="btn wide">Place order</button>
        <p id="err" class="err" role="alert"></p>
      </aside>
    </form>`;
  },

  done() {
    const o = last;
    if (!o) return views.home();
    const t = encodeURIComponent(`Hello ${S.name}, I placed order ${o.id} (${money(o.total)}).`);
    return `${stepper(4)}<div class="ok"><div class="okc">${ico("check")}</div><h2>Order ${o.id} received</h2>
      <p>Thank you, ${esc(o.customer.name)}. Your total is <b>${money(o.total)}</b>${o.payment == "cod" ? " (cash on delivery)" : ""}. We will contact you on ${esc(o.customer.mobile)} to confirm.</p>
      ${db ? "" : "<p class='err'>Demo mode: Firebase is not connected yet, so staff cannot see this order.</p>"}
      <a class="btn" href="https://wa.me/${S.wa}?text=${t}">Confirm on WhatsApp</a><a class="btn alt" href="#/">Keep shopping</a></div>`;
  },

  contact() {
    return `<div class="head first"><h2>Contact us</h2><p>Reach us any way you like.</p></div>
    <div class="tiles c2">
      <a class="tile" href="mailto:${S.email}"><span class="ti">${ico("mail")}</span><small class="lb">Email</small><b>${S.email}</b></a>
      <a class="tile" href="tel:${S.phone}"><span class="ti">${ico("phone")}</span><small class="lb">Phone</small><b>${S.phone}</b></a>
      <a class="tile" href="https://wa.me/${S.wa}"><span class="ti">${ico("chat")}</span><small class="lb">WhatsApp</small><b>${S.phone}</b></a>
      <div class="tile"><span class="ti">${ico("card")}</span><small class="lb">Payments</small><b>Easypaisa ${S.easypaisa}<br>JazzCash ${S.jazzcash}</b></div>
    </div>`;
  }
};

/* ---------- checkout logic ---------- */
function bindCk() {
  const f = $("#ck");
  if (!f) return;
  const up = () => {
    const m = f.pay.value, fee = m == "cod" ? S.codFee : 0;
    $("#tot").innerHTML = `<div><span>Subtotal</span><b>${money(total())}</b></div>${fee ? `<div><span>Cash on delivery fee</span><b>${money(fee)}</b></div>` : ""}<div class="gt"><span>Total</span><b>${money(total() + fee)}</b></div>`;
    $("#wp").innerHTML = m == "cod" ? "" : `<div class="wallet"><img src="images/payment/${m}-qr.png" alt="${m} QR code" onerror="this.remove()"><div><p>Send <b>${money(total())}</b> to <b>${S[m]}</b>, then enter the transaction ID below.</p><label>Transaction ID<input name="trx" required></label></div></div>`;
  };
  f.addEventListener("change", e => e.target.name == "pay" && up());
  up();
  f.onsubmit = place;
}
async function place(e) {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f)), fee = d.pay == "cod" ? S.codFee : 0, sub = total(), b = f.querySelector("button.btn");
  const o = {
    id: "HB" + Date.now().toString(36).toUpperCase(),
    customer: { name: d.name, email: d.email, mobile: d.mobile, city: d.city, address: d.address, postal: d.postal || "", notes: d.notes || "" },
    items: Object.entries(cart).map(([id, q]) => ({ id, name: prod(id).name, qty: q, price: prod(id).price })),
    subtotal: sub, fee, total: sub + fee, payment: d.pay, trx: d.trx || "", status: "Pending"
  };
  b.disabled = true;
  try {
    if (db) await db.collection("orders").doc(o.id).set({ ...o, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    else { const l = JSON.parse(localStorage.getItem("hb_orders") || "[]"); l.push(o); localStorage.setItem("hb_orders", JSON.stringify(l)); }
    cart = {}; save(); last = o; location.hash = "#/done";
  } catch (x) {
    b.disabled = false;
    $("#err").textContent = "We could not place your order (" + x.message + "). Try again or message us on WhatsApp.";
  }
}

/* ---------- 3D hero tilt ---------- */
function tilt() {
  const s = $("#stage");
  if (!s || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  s.onmousemove = e => {
    const r = s.getBoundingClientRect();
    s.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 18 + "deg");
    s.style.setProperty("--rx", -((e.clientY - r.top) / r.height - .5) * 14 + "deg");
  };
  s.onmouseleave = () => { s.style.setProperty("--ry", "0deg"); s.style.setProperty("--rx", "0deg"); };
}

/* ---------- router ---------- */
function route(keep) {
  const [, r = "", a = ""] = (location.hash || "#/").split("/").map(decodeURIComponent), R = r || "home";
  app.innerHTML = (views[R] || views.home)(a);
  if (!keep) scrollTo(0, 0);
  tilt(); bindCk();
  document.querySelectorAll("#cn a").forEach(x => x.classList.toggle("on", R == "c" ? x.hash == "#/c/" + a : (R == "home" && x.hash == "#/")));
  const on = document.querySelector("#cn a.on");
  if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
}

/* ---------- toast + theme ---------- */
function toast(t) {
  const e = $("#toast");
  e.innerHTML = ico("check") + "<span>" + esc(t) + "</span>";
  e.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove("on"), 1800);
}
const themeIcon = () => { $("#th").innerHTML = ico(document.documentElement.dataset.theme == "dark" ? "sun" : "moon"); };

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("button");
  if (!t) return;
  const D = t.dataset;
  if (D.add) {
    cart[D.add] = (cart[D.add] || 0) + 1; save();
    toast(prod(D.add).name + " added to cart");
    if (!t.classList.contains("ok")) {
      const h = t.innerHTML, cb = $(".cartb");
      t.classList.add("ok"); t.innerHTML = ico("check") + "<span>Added</span>"; cb.classList.add("bump");
      setTimeout(() => { t.classList.remove("ok"); t.innerHTML = h; cb.classList.remove("bump"); }, 900);
    }
  } else if (D.inc || D.dec || D.del) {
    const id = D.inc || D.dec || D.del;
    if (D.inc) cart[id]++;
    if (D.dec && --cart[id] < 1) delete cart[id];
    if (D.del) delete cart[id];
    save(); route(true);
  } else if (t.id == "th") {
    const n = document.documentElement.dataset.theme == "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = n;
    localStorage.setItem("hb_theme", n);
    themeIcon();
  }
});
document.addEventListener("change", e => { if (e.target.id == "srt") { sort = e.target.value; route(true); } });
$("#sf").onsubmit = e => { e.preventDefault(); const q = $("#q").value.trim(); if (q) location.hash = "#/s/" + encodeURIComponent(q); };
addEventListener("scroll", () => $(".top").classList.toggle("scrolled", scrollY > 8), { passive: true });
addEventListener("hashchange", () => route());

/* ---------- init ---------- */
$("#lg").textContent = S.name;
document.title = S.name + " | Online Store";
$("#strip").innerHTML = `<span>${ico("phone")}${S.phone}</span><span>Cash on delivery · Easypaisa · JazzCash</span>`;
$("#cn").innerHTML = `<a href="#/">🏠 All</a>` + CATS.map(c => `<a href="#/c/${c.id}">${c.icon} ${c.name}</a>`).join("");
$("#ft").innerHTML = `<div class="fg">
  <div><h3>${S.name}</h3><p>${S.tag}. Order online and pay by cash on delivery, Easypaisa or JazzCash.</p><div class="pp"><span>Cash on delivery</span><span>Easypaisa</span><span>JazzCash</span></div></div>
  <div><h3>Departments</h3>${CATS.slice(0, 5).map(c => `<a href="#/c/${c.id}">${c.name}</a>`).join("")}</div>
  <div><h3>More departments</h3>${CATS.slice(5).map(c => `<a href="#/c/${c.id}">${c.name}</a>`).join("")}</div>
  <div><h3>Contact</h3><a href="mailto:${S.email}">${S.email}</a><a href="tel:${S.phone}">${S.phone}</a><a href="https://wa.me/${S.wa}">WhatsApp us</a><p style="margin-top:.6rem">Easypaisa ${S.easypaisa}<br>JazzCash ${S.jazzcash}</p></div>
</div><p class="cp">© ${new Date().getFullYear()} ${S.name}. All rights reserved.</p>`;
themeIcon(); save(); route();
