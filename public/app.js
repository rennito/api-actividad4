const API_URL = '/api';

function verificarSesion() {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('crud-section').classList.remove('hidden');
    document.getElementById('welcome-user').innerText = `Bienvenido, ${localStorage.getItem('nombre') || 'Usuario'}`;
    cargarProductos();
  } else {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('crud-section').classList.add('hidden');
  }
}

async function registrarUsuario() {
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password })
  });
  const data = await res.json();
  document.getElementById('auth-msg').innerText = data.message || JSON.stringify(data.errors);
}

async function iniciarSesion() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (res.ok && data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('nombre', data.nombre);
    verificarSesion();
  } else {
    document.getElementById('auth-msg').innerText = data.message || 'Error al iniciar sesión';
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('nombre');
  verificarSesion();
}

async function cargarProductos() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/productos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.status === 401 || res.status === 403) return cerrarSesion();

  const productos = await res.json();
  const tbody = document.getElementById('tabla-productos');
  tbody.innerHTML = '';

  productos.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.descripcion || ''}</td>
        <td>$${p.precio}</td>
        <td>${p.stock}</td>
        <td>
          <button onclick='editarProducto(${JSON.stringify(p)})'>Editar</button>
          <button class="btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

async function guardarProducto() {
  const id = document.getElementById('prod-id').value;
  const payload = {
    nombre: document.getElementById('prod-nombre').value,
    descripcion: document.getElementById('prod-desc').value,
    precio: parseFloat(document.getElementById('prod-precio').value),
    stock: parseInt(document.getElementById('prod-stock').value)
  };

  const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    limpiarFormulario();
    cargarProductos();
  } else {
    alert('Error al guardar el producto. Verifica los datos.');
  }
}

function editarProducto(p) {
  document.getElementById('form-title').innerText = 'Editar Producto';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-nombre').value = p.nombre;
  document.getElementById('prod-desc').value = p.descripcion;
  document.getElementById('prod-precio').value = p.precio;
  document.getElementById('prod-stock').value = p.stock;
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  await fetch(`${API_URL}/productos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  cargarProductos();
}

function limpiarFormulario() {
  document.getElementById('form-title').innerText = 'Agregar Producto';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-nombre').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-precio').value = '';
  document.getElementById('prod-stock').value = '';
}

verificarSesion();