// ===== STATE =====
let currentUser = null;
let dataMahasiswa = [];
let dataMataKuliah = [];
let dataNilai = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupForms();
});

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      currentUser = await res.json();
      showMain();
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
}

// ===== AUTH =====
function showLogin() {
  document.getElementById('page-login').style.display = '';
  document.getElementById('page-main').style.display = 'none';
}

function showMain() {
  document.getElementById('page-login').style.display = 'none';
  document.getElementById('page-main').style.display = 'flex';
  document.getElementById('sidebar-nama').textContent = currentUser.nama;
  document.getElementById('sidebar-role').textContent = currentUser.role;
  setupRoleBasedAccess();
  navigateTo('dashboard');
}

function setupRoleBasedAccess() {
  const role = currentUser.role;
  
  // Sembunyikan semua menu dulu
  document.querySelectorAll('.nav-item').forEach(item => {
    item.style.display = 'none';
  });

  // Tampilkan menu berdasarkan role
  if (role === 'admin') {
    // Admin: akses penuh ke semua menu
    document.querySelector('[data-page="dashboard"]').style.display = '';
    document.querySelector('[data-page="mahasiswa"]').style.display = '';
    document.querySelector('[data-page="mata-kuliah"]').style.display = '';
    document.querySelector('[data-page="nilai"]').style.display = '';
  } else if (role === 'dosen') {
    // Dosen: Dashboard, Mata Kuliah, Nilai
    document.querySelector('[data-page="dashboard"]').style.display = '';
    document.querySelector('[data-page="mata-kuliah"]').style.display = '';
    document.querySelector('[data-page="nilai"]').style.display = '';
  } else if (role === 'mahasiswa') {
    // Mahasiswa: Dashboard, Nilai (hanya lihat)
    document.querySelector('[data-page="dashboard"]').style.display = '';
    document.querySelector('[data-page="nilai"]').style.display = '';
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  currentUser = null;
  showLogin();
}

// ===== NAVIGATION =====
function navigateTo(page) {
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById('content-' + page);
  if (section) section.style.display = 'block';

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  const titles = { dashboard: 'Dashboard', mahasiswa: 'Data Mahasiswa', 'mata-kuliah': 'Mata Kuliah', nilai: 'Manajemen Nilai' };
  document.getElementById('topbar-title').textContent = titles[page] || page;

  if (page === 'dashboard') loadDashboard();
  else if (page === 'mahasiswa') loadMahasiswa();
  else if (page === 'mata-kuliah') loadMataKuliah();
  else if (page === 'nilai') loadNilai();

  // tutup sidebar di mobile
  document.getElementById('sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const res = await fetch('/api/nilai/statistik/ringkasan', { credentials: 'include' });
    const data = await res.json();

    document.getElementById('stat-mhs').textContent = data.total_mahasiswa;
    document.getElementById('stat-mk').textContent = data.total_mata_kuliah;
    document.getElementById('stat-nilai').textContent = data.total_nilai;
    document.getElementById('stat-rata').textContent = data.rata_rata_nilai;

    renderBarChart('chart-nilai', data.distribusi_nilai, 'nilai_huruf', 'jumlah', [
      '#16A34A','#22C55E','#3B82F6','#60A5FA','#F59E0B','#EF4444','#6B7280'
    ]);
    renderBarChart('chart-jurusan', data.mahasiswa_per_jurusan, 'jurusan', 'jumlah', [
      '#2563EB','#7C3AED','#DB2777','#EA580C','#16A34A'
    ]);
  } catch (err) {
    console.error(err);
  }
}

function renderBarChart(containerId, data, labelKey, valueKey, colors) {
  const container = document.getElementById(containerId);
  if (!data || !data.length) { container.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:20px">Belum ada data</p>'; return; }
  const max = Math.max(...data.map(d => d[valueKey]));
  container.innerHTML = data.map((item, i) => `
    <div class="bar-item">
      <span class="bar-label">${item[labelKey]}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(item[valueKey]/max*100)}%;background:${colors[i % colors.length]}">
          ${item[valueKey]}
        </div>
      </div>
      <span class="bar-count">${item[valueKey]}</span>
    </div>
  `).join('');
}

// ===== MAHASISWA =====
async function loadMahasiswa() {
  const tbody = document.getElementById('tbody-mhs');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Memuat data...</td></tr>';
  
  // Sembunyikan tombol tambah jika bukan admin
  const addBtn = document.querySelector('#content-mahasiswa .btn-primary');
  if (addBtn) {
    addBtn.style.display = currentUser.role === 'admin' ? '' : 'none';
  }
  
  try {
    const res = await fetch('/api/mahasiswa', { credentials: 'include' });
    dataMahasiswa = await res.json();
    renderMahasiswa(dataMahasiswa);
  } catch {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Gagal memuat data</td></tr>';
  }
}

function renderMahasiswa(list) {
  const tbody = document.getElementById('tbody-mhs');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Tidak ada data</td></tr>'; return; }
  const canEdit = currentUser.role === 'admin';
  tbody.innerHTML = list.map(m => `
    <tr>
      <td><strong>${m.nim}</strong></td>
      <td>${m.nama}</td>
      <td>${m.jurusan || '-'}</td>
      <td>${m.angkatan || '-'}</td>
      <td><span class="badge badge-${m.status}">${m.status}</span></td>
      <td>
        ${canEdit ? `
        <div class="action-btns">
          <button class="btn btn-outline btn-icon" onclick="editMahasiswa(${m.id})">✏️</button>
          <button class="btn btn-danger btn-icon" onclick="deleteMahasiswa(${m.id}, '${m.nama}')">🗑️</button>
        </div>
        ` : '<span class="text-muted">-</span>'}
      </td>
    </tr>
  `).join('');
}

function filterMahasiswa() {
  const q = document.getElementById('search-mhs').value.toLowerCase();
  renderMahasiswa(dataMahasiswa.filter(m =>
    m.nama.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q)
  ));
}

function editMahasiswa(id) {
  const m = dataMahasiswa.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modal-mhs-title').textContent = 'Edit Mahasiswa';
  document.getElementById('mhs-id').value = m.id;
  document.getElementById('mhs-nim').value = m.nim;
  document.getElementById('mhs-nama').value = m.nama;
  document.getElementById('mhs-jurusan').value = m.jurusan || '';
  document.getElementById('mhs-angkatan').value = m.angkatan || '';
  document.getElementById('mhs-email').value = m.email || '';
  document.getElementById('mhs-hp').value = m.no_hp || '';
  document.getElementById('mhs-jk').value = m.jenis_kelamin || 'L';
  document.getElementById('mhs-status').value = m.status;
  document.getElementById('mhs-alamat').value = m.alamat || '';
  openModal('modal-tambah-mhs');
}

async function deleteMahasiswa(id, nama) {
  if (!confirm(`Hapus mahasiswa "${nama}"?`)) return;
  try {
    const res = await fetch(`/api/mahasiswa/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (res.ok) { showToast('Mahasiswa berhasil dihapus', 'success'); loadMahasiswa(); }
    else showToast(data.error, 'error');
  } catch { showToast('Gagal menghapus', 'error'); }
}

// ===== MATA KULIAH =====
async function loadMataKuliah() {
  const tbody = document.getElementById('tbody-mk');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Memuat data...</td></tr>';
  
  // Sembunyikan tombol tambah jika bukan admin atau dosen
  const addBtn = document.querySelector('#content-mata-kuliah .btn-primary');
  if (addBtn) {
    addBtn.style.display = (currentUser.role === 'admin' || currentUser.role === 'dosen') ? '' : 'none';
  }
  
  try {
    const res = await fetch('/api/mata-kuliah', { credentials: 'include' });
    dataMataKuliah = await res.json();
    renderMataKuliah(dataMataKuliah);
  } catch {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Gagal memuat data</td></tr>';
  }
}

function renderMataKuliah(list) {
  const tbody = document.getElementById('tbody-mk');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Tidak ada data</td></tr>'; return; }
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'dosen';
  tbody.innerHTML = list.map(mk => `
    <tr>
      <td><strong>${mk.kode_mk}</strong></td>
      <td>${mk.nama_mk}</td>
      <td>${mk.sks} SKS</td>
      <td>${mk.semester ? 'Semester ' + mk.semester : '-'}</td>
      <td>${mk.dosen_pengampu || '-'}</td>
      <td>
        ${canEdit ? `
        <div class="action-btns">
          <button class="btn btn-outline btn-icon" onclick="editMataKuliah(${mk.id})">✏️</button>
          <button class="btn btn-danger btn-icon" onclick="deleteMataKuliah(${mk.id}, '${mk.nama_mk}')">🗑️</button>
        </div>
        ` : '<span class="text-muted">-</span>'}
      </td>
    </tr>
  `).join('');
}

function filterMataKuliah() {
  const q = document.getElementById('search-mk').value.toLowerCase();
  renderMataKuliah(dataMataKuliah.filter(mk =>
    mk.nama_mk.toLowerCase().includes(q) || mk.kode_mk.toLowerCase().includes(q)
  ));
}

function editMataKuliah(id) {
  const mk = dataMataKuliah.find(x => x.id === id);
  if (!mk) return;
  document.getElementById('modal-mk-title').textContent = 'Edit Mata Kuliah';
  document.getElementById('mk-id').value = mk.id;
  document.getElementById('mk-kode').value = mk.kode_mk;
  document.getElementById('mk-nama').value = mk.nama_mk;
  document.getElementById('mk-sks').value = mk.sks;
  document.getElementById('mk-semester').value = mk.semester || '';
  document.getElementById('mk-jurusan').value = mk.jurusan || '';
  document.getElementById('mk-dosen').value = mk.dosen_pengampu || '';
  openModal('modal-tambah-mk');
}

async function deleteMataKuliah(id, nama) {
  if (!confirm(`Hapus mata kuliah "${nama}"?`)) return;
  try {
    const res = await fetch(`/api/mata-kuliah/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (res.ok) { showToast('Mata kuliah berhasil dihapus', 'success'); loadMataKuliah(); }
    else showToast(data.error, 'error');
  } catch { showToast('Gagal menghapus', 'error'); }
}

// ===== NILAI =====
async function loadNilai() {
  const tbody = document.getElementById('tbody-nilai');
  tbody.innerHTML = '<tr><td colspan="8" class="loading">Memuat data...</td></tr>';
  
  // Sembunyikan tombol tambah jika bukan admin atau dosen
  const addBtn = document.querySelector('#content-nilai .btn-primary');
  if (addBtn) {
    addBtn.style.display = (currentUser.role === 'admin' || currentUser.role === 'dosen') ? '' : 'none';
  }
  
  try {
    const res = await fetch('/api/nilai', { credentials: 'include' });
    dataNilai = await res.json();
    renderNilai(dataNilai);

    // Isi dropdown modal nilai
    if (!dataMahasiswa.length) { const r = await fetch('/api/mahasiswa', { credentials: 'include' }); dataMahasiswa = await r.json(); }
    if (!dataMataKuliah.length) { const r = await fetch('/api/mata-kuliah', { credentials: 'include' }); dataMataKuliah = await r.json(); }
    document.getElementById('nilai-mhs').innerHTML = '<option value="">-- Pilih Mahasiswa --</option>' +
      dataMahasiswa.map(m => `<option value="${m.id}">${m.nim} - ${m.nama}</option>`).join('');
    document.getElementById('nilai-mk').innerHTML = '<option value="">-- Pilih Mata Kuliah --</option>' +
      dataMataKuliah.map(mk => `<option value="${mk.id}">${mk.kode_mk} - ${mk.nama_mk}</option>`).join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Gagal memuat data</td></tr>';
  }
}

function gradeClass(h) {
  if (h?.startsWith('A')) return 'grade-a';
  if (h?.startsWith('B')) return 'grade-b';
  if (h?.startsWith('C')) return 'grade-c';
  if (h?.startsWith('D')) return 'grade-d';
  return 'grade-e';
}

function renderNilai(list) {
  const tbody = document.getElementById('tbody-nilai');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="8" class="loading">Tidak ada data</td></tr>'; return; }
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'dosen';
  tbody.innerHTML = list.map(n => `
    <tr>
      <td>${n.nim}</td>
      <td>${n.nama_mahasiswa}</td>
      <td>${n.nama_mk}</td>
      <td>${n.sks} SKS</td>
      <td>${n.semester || '-'} ${n.tahun_ajaran || ''}</td>
      <td>${n.nilai_angka}</td>
      <td><span class="grade ${gradeClass(n.nilai_huruf)}">${n.nilai_huruf}</span></td>
      <td>
        ${canEdit ? `
        <div class="action-btns">
          <button class="btn btn-outline btn-icon" onclick="editNilai(${n.id})">✏️</button>
          <button class="btn btn-danger btn-icon" onclick="deleteNilai(${n.id})">🗑️</button>
        </div>
        ` : '<span class="text-muted">-</span>'}
      </td>
    </tr>
  `).join('');
}

function filterNilai() {
  const q = document.getElementById('search-nilai').value.toLowerCase();
  renderNilai(dataNilai.filter(n =>
    n.nama_mahasiswa.toLowerCase().includes(q) ||
    n.nim.toLowerCase().includes(q) ||
    n.nama_mk.toLowerCase().includes(q)
  ));
}

function editNilai(id) {
  const n = dataNilai.find(x => x.id === id);
  if (!n) return;
  document.getElementById('modal-nilai-title').textContent = 'Edit Nilai';
  document.getElementById('nilai-id').value = n.id;
  document.getElementById('nilai-mhs').value = n.mahasiswa_id;
  document.getElementById('nilai-mk').value = n.mata_kuliah_id;
  document.getElementById('nilai-semester').value = n.semester || 'Ganjil';
  document.getElementById('nilai-tahun').value = n.tahun_ajaran || '';
  document.getElementById('nilai-angka').value = n.nilai_angka;
  openModal('modal-tambah-nilai');
}

async function deleteNilai(id) {
  if (!confirm('Hapus nilai ini?')) return;
  try {
    const res = await fetch(`/api/nilai/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (res.ok) { showToast('Nilai berhasil dihapus', 'success'); loadNilai(); }
    else showToast(data.error, 'error');
  } catch { showToast('Gagal menghapus', 'error'); }
}

// ===== SETUP FORMS =====
function setupForms() {
  // Login
  document.getElementById('form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const err = document.getElementById('login-error');
    err.style.display = 'none';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('login-username').value,
          password: document.getElementById('login-password').value
        })
      });
      const data = await res.json();
      if (res.ok) {
        currentUser = data;
        currentUser.nama = data.nama;
        currentUser.role = data.role;
        // Refetch full user info
        const me = await fetch('/api/auth/me', { credentials: 'include' });
        currentUser = await me.json();
        showMain();
      } else {
        err.textContent = data.error;
        err.style.display = 'block';
      }
    } catch { err.textContent = 'Gagal terhubung ke server'; err.style.display = 'block'; }
  });

  // Form Mahasiswa
  document.getElementById('form-mhs').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('mhs-id').value;
    const payload = {
      nim: document.getElementById('mhs-nim').value,
      nama: document.getElementById('mhs-nama').value,
      jurusan: document.getElementById('mhs-jurusan').value,
      angkatan: document.getElementById('mhs-angkatan').value,
      email: document.getElementById('mhs-email').value,
      no_hp: document.getElementById('mhs-hp').value,
      jenis_kelamin: document.getElementById('mhs-jk').value,
      status: document.getElementById('mhs-status').value,
      alamat: document.getElementById('mhs-alamat').value,
    };
    const url = id ? `/api/mahasiswa/${id}` : '/api/mahasiswa';
    const method = id ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const errEl = document.getElementById('mhs-error');
      if (res.ok) {
        closeModal('modal-tambah-mhs');
        showToast(id ? 'Mahasiswa diperbarui' : 'Mahasiswa ditambahkan', 'success');
        loadMahasiswa();
        resetForm('form-mhs', 'mhs-id');
      } else { errEl.textContent = data.error; errEl.style.display = 'block'; }
    } catch { showToast('Terjadi kesalahan', 'error'); }
  });

  // Form Mata Kuliah
  document.getElementById('form-mk').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('mk-id').value;
    const payload = {
      kode_mk: document.getElementById('mk-kode').value,
      nama_mk: document.getElementById('mk-nama').value,
      sks: document.getElementById('mk-sks').value,
      semester: document.getElementById('mk-semester').value,
      jurusan: document.getElementById('mk-jurusan').value,
      dosen_pengampu: document.getElementById('mk-dosen').value,
    };
    const url = id ? `/api/mata-kuliah/${id}` : '/api/mata-kuliah';
    const method = id ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const errEl = document.getElementById('mk-error');
      if (res.ok) {
        closeModal('modal-tambah-mk');
        showToast(id ? 'Mata kuliah diperbarui' : 'Mata kuliah ditambahkan', 'success');
        loadMataKuliah();
        resetForm('form-mk', 'mk-id');
      } else { errEl.textContent = data.error; errEl.style.display = 'block'; }
    } catch { showToast('Terjadi kesalahan', 'error'); }
  });

  // Form Nilai
  document.getElementById('form-nilai').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('nilai-id').value;
    const payload = {
      mahasiswa_id: document.getElementById('nilai-mhs').value,
      mata_kuliah_id: document.getElementById('nilai-mk').value,
      semester: document.getElementById('nilai-semester').value,
      tahun_ajaran: document.getElementById('nilai-tahun').value,
      nilai_angka: document.getElementById('nilai-angka').value,
    };
    const url = id ? `/api/nilai/${id}` : '/api/nilai';
    const method = id ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const errEl = document.getElementById('nilai-error');
      if (res.ok) {
        closeModal('modal-tambah-nilai');
        showToast(`Nilai disimpan (${data.nilai_huruf || ''})`, 'success');
        loadNilai();
        resetForm('form-nilai', 'nilai-id');
      } else { errEl.textContent = data.error; errEl.style.display = 'block'; }
    } catch { showToast('Terjadi kesalahan', 'error'); }
  });
}

// ===== MODAL HELPERS =====
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.getElementById('overlay').classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
}
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  document.getElementById('overlay').classList.remove('active');
}

// Reset form + clear hidden id + clear error
function resetForm(formId, hiddenId) {
  document.getElementById(formId).reset();
  document.getElementById(hiddenId).value = '';
  const errEls = document.querySelectorAll(`#${formId} .alert-error`);
  errEls.forEach(el => { el.style.display = 'none'; el.textContent = ''; });
}

// Override openModal to reset title & form
const _origOpen = openModal;
window.openModal = function(id) {
  if (id === 'modal-tambah-mhs') {
    document.getElementById('modal-mhs-title').textContent = 'Tambah Mahasiswa';
    resetForm('form-mhs', 'mhs-id');
  } else if (id === 'modal-tambah-mk') {
    document.getElementById('modal-mk-title').textContent = 'Tambah Mata Kuliah';
    resetForm('form-mk', 'mk-id');
  } else if (id === 'modal-tambah-nilai') {
    document.getElementById('modal-nilai-title').textContent = 'Tambah Nilai';
    resetForm('form-nilai', 'nilai-id');
  }
  _origOpen(id);
};

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}
