// Efek BarberShop Jujun — interaksi website
// GANTI nomor di bawah dengan nomor WhatsApp bisnis yang aktif (format internasional tanpa +, spasi, atau strip).
const WHATSAPP_NUMBER = "6281234567890";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

$("#year").textContent = new Date().getFullYear();

// Navigasi mobile
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
});
$$(".nav-links a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Filter galeri gaya rambut
$$("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    $$("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
    const filter = button.dataset.filter;
    $$(".style-card").forEach(card => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

// Data harga contoh; ubah sesuai harga resmi setiap cabang.
const prices = {
  dewasa: [
    { name: "Regular Haircut", detail: "Potongan basic, rapi dan fresh", price: 35000 },
    { name: "Fade / Taper", detail: "Gradasi presisi dengan finishing detail", price: 45000 },
    { name: "Haircut + Wash", detail: "Potong rambut dan keramas", price: 50000 },
    { name: "Haircut + Styling", detail: "Potong rambut dengan styling akhir", price: 55000 },
    { name: "Haircut + Beard Trim", detail: "Potong rambut dan rapikan jenggot", price: 65000 },
    { name: "Full Grooming", detail: "Haircut, wash, styling dan beard trim", price: 80000 }
  ],
  anak: [
    { name: "Kids Haircut", detail: "Potongan nyaman untuk anak", price: 25000 },
    { name: "Kids Fade", detail: "Fade rapi dengan detail presisi", price: 35000 },
    { name: "Kids Haircut + Wash", detail: "Potong rambut dan keramas", price: 40000 },
    { name: "School Cut", detail: "Gaya rapi untuk sekolah", price: 25000 }
  ]
};
const rupiah = amount => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

function renderPrices(category) {
  const list = $("#priceList");
  list.innerHTML = "";
  prices[category].forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "price-item";
    const number = String(index + 1).padStart(2, "0");
    article.innerHTML = `<span class="price-index">${number}</span><div class="price-name"><h3></h3><p></p></div><strong class="price-amount"></strong>`;
    $(".price-name h3", article).textContent = item.name;
    $(".price-name p", article).textContent = item.detail;
    $(".price-amount", article).textContent = rupiah(item.price);
    list.appendChild(article);
  });
}
renderPrices("dewasa");
$$("[data-price]").forEach(button => button.addEventListener("click", () => {
  $$("[data-price]").forEach(item => item.classList.toggle("active", item === button));
  renderPrices(button.dataset.price);
}));

// Toast notification
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Modal booking + prefill pilihan haircut/cabang
const modal = $("#bookingModal");
const styleSelect = $("#customerStyle");
const branchSelect = $("#customerBranch");
function openBooking({ style, branch } = {}) {
  if (style) styleSelect.value = style;
  if (branch) branchSelect.value = branch;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#customerName").focus(), 100);
}
function closeBooking() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$$("[data-booking]").forEach(button => button.addEventListener("click", () => openBooking()));
$$("[data-style]").forEach(button => button.addEventListener("click", () => {
  openBooking({ style: button.dataset.style });
}));
$$("[data-branch]").forEach(button => button.addEventListener("click", () => {
  openBooking({ branch: button.dataset.branch });
}));
$("#modalClose").addEventListener("click", closeBooking);
modal.addEventListener("click", event => { if (event.target === modal) closeBooking(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && modal.classList.contains("open")) closeBooking(); });

// Tanggal booking tidak boleh di masa lalu
const dateInput = $("#bookingDate");
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

$("#bookingForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name")).trim();
  const category = form.get("category");
  const style = form.get("style");
  const branch = form.get("branch");
  const date = form.get("date");
  const time = form.get("time");
  if (name.length < 2 || !date || !time) {
    showToast("Lengkapi nama, tanggal, dan waktu booking ya.");
    return;
  }
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const message = [
    "Halo Efek BarberShop Jujun! Saya ingin booking:",
    "",
    `Nama: ${name}`,
    `Kategori: ${category}`,
    `Pilihan haircut: ${style}`,
    `Cabang: ${branch}`,
    `Tanggal: ${formattedDate}`,
    `Jam: ${time} WIB`,
    "",
    "Mohon konfirmasi ketersediaannya. Terima kasih!"
  ].join("\n");

  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER) || WHATSAPP_NUMBER === "6281234567890") {
    // Tetap bisa dicoba tanpa mengarahkan ke nomor contoh yang belum tentu benar.
    showToast("Booking siap. Atur nomor WhatsApp bisnis di file script.js terlebih dahulu.");
    const fallback = document.createElement("textarea");
    fallback.value = message;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    try { document.execCommand("copy"); } catch (_) {}
    fallback.remove();
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  closeBooking();
  showToast("Ringkasan booking dibuka di WhatsApp.");
});

// Gambar cadangan bila URL gambar gagal dimuat.
$$(".style-photo img, .hero-image-wrap img").forEach(img => {
  img.addEventListener("error", () => {
    img.style.display = "none";
    img.parentElement.style.background = "linear-gradient(135deg, #d8ff3e 0%, #c8c9bd 48%, #777a70 100%)";
    if (img.parentElement.classList.contains("style-photo")) {
      const fallback = document.createElement("span");
      fallback.textContent = "EFEK ✳";
      fallback.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;font:700 22px 'Space Grotesk',sans-serif;letter-spacing:3px";
      img.parentElement.appendChild(fallback);
    }
  });
});
