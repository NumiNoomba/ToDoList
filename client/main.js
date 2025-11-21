const api = {
  getTodos: (page = 1, pageSize = 10, search = '') => fetch(`/api/todos?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`).then(r => r.json()),
  createTodo: (todo) => fetch('/api/todos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(todo)}).then(r => r.json()),
  updateTodo: (id, todo) => fetch(`/api/todos/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(todo)}).then(r=>r.json()),
  deleteTodo: (id) => fetch(`/api/todos/${id}`, { method: 'DELETE'}).then(r=>r.json()),
  toggleTodo: (id) => fetch(`/api/todos/${id}/toggle`, { method: 'PATCH'}).then(r=>r.json()),
  getCategories: () => fetch('/api/categories').then(r=>r.json()),
  createCategory: (name) => fetch('/api/categories', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name})}).then(r=>r.json()),
  updateCategory: (id, name) => fetch(`/api/categories/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name})}).then(r=>r.json()),
  deleteCategory: (id) => fetch(`/api/categories/${id}`, { method: 'DELETE'}).then(r=>r.json())
};

let state = { page:1, pageSize:10, search:'', total:0 };

const els = {
  todos: document.getElementById('todos'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  categorySelect: document.getElementById('categorySelect'),
  createBtn: document.getElementById('createBtn'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
  pageInfo: document.getElementById('pageInfo'),
  search: document.getElementById('search'),
  searchBtn: document.getElementById('searchBtn'),
  openCategoryManager: document.getElementById('openCategoryManager'),
  categoryModal: document.getElementById('categoryModal'),
  newCatName: document.getElementById('newCatName'),
  addCatBtn: document.getElementById('addCatBtn'),
  categoriesList: document.getElementById('categoriesList'),
  closeCat: document.getElementById('closeCat')
};

function renderTodos(data){
  els.todos.innerHTML = '';
  data.forEach(t => {
    const div = document.createElement('div'); div.className = 'todo';
    const left = document.createElement('div'); left.className = 'left';
    const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!t.completed;
    chk.addEventListener('change', () => { api.toggleTodo(t.id).then(()=>load()); });
    const txt = document.createElement('div');
    txt.innerHTML = `<div class="title">${escapeHtml(t.title)}</div><div class="muted">${t.category_name?escapeHtml(t.category_name):''} • ${escapeHtml(t.description||'')}</div>`;
    left.appendChild(chk); left.appendChild(txt);
    const actions = document.createElement('div'); actions.className='actions';
    const edit = document.createElement('button'); edit.textContent='Edit';
    edit.addEventListener('click', ()=> openEdit(t));
    const del = document.createElement('button'); del.textContent='Delete';
    del.addEventListener('click', ()=> { if(confirm('Delete?')) api.deleteTodo(t.id).then(()=>load()); });
    actions.appendChild(edit); actions.appendChild(del);
    div.appendChild(left); div.appendChild(actions);
    els.todos.appendChild(div);
  });
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function loadCategories(){
  return api.getCategories().then(arr=>{
    els.categorySelect.innerHTML = '<option value="">(No category)</option>' + arr.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    // populate modal list
    els.categoriesList.innerHTML = '';
    arr.forEach(c => {
      const li = document.createElement('li');
      const name = document.createElement('span'); name.textContent = c.name;
      const actions = document.createElement('span');
      const ren = document.createElement('button'); ren.textContent='Rename';
      ren.addEventListener('click', ()=>{
        const nv = prompt('New name', c.name); if(nv) api.updateCategory(c.id, nv).then(()=>{ loadCategories(); });
      });
      const del = document.createElement('button'); del.textContent='Delete';
      del.addEventListener('click', ()=>{ if(confirm('Delete category?')) api.deleteCategory(c.id).then(()=>loadCategories()); });
      actions.appendChild(ren); actions.appendChild(del);
      li.appendChild(name); li.appendChild(actions);
      els.categoriesList.appendChild(li);
    });
    return arr;
  });
}

function load(){
  api.getTodos(state.page, state.pageSize, state.search).then(res=>{
    state.total = res.total;
    renderTodos(res.todos);
    els.pageInfo.textContent = `Page ${state.page} — ${res.todos.length} items (total ${res.total})`;
  });
}

els.createBtn.addEventListener('click', ()=>{
  const title = els.title.value.trim();
  if(!title) return alert('Title required');
  const description = els.description.value.trim();
  const category_id = els.categorySelect.value || null;
  api.createTodo({ title, description, category_id }).then(()=>{ els.title.value=''; els.description.value=''; load(); });
});

els.prevPage.addEventListener('click', ()=>{ if(state.page>1){ state.page--; load(); } });
els.nextPage.addEventListener('click', ()=>{ const maxPage = Math.ceil(state.total / state.pageSize) || 1; if(state.page < maxPage){ state.page++; load(); } });
els.searchBtn.addEventListener('click', ()=>{ state.search = els.search.value.trim(); state.page = 1; load(); });

els.openCategoryManager.addEventListener('click', ()=>{ els.categoryModal.classList.remove('hidden'); loadCategories(); });
els.closeCat.addEventListener('click', ()=>{ els.categoryModal.classList.add('hidden'); });
els.addCatBtn.addEventListener('click', ()=>{ const name = els.newCatName.value.trim(); if(!name) return; api.createCategory(name).then(()=>{ els.newCatName.value=''; loadCategories(); load(); }); });

function openEdit(todo){
  const newTitle = prompt('Title', todo.title); if(newTitle===null) return;
  const newDesc = prompt('Description', todo.description||'');
  loadCategories().then(()=>{
    const cat = prompt('Category id (empty for none)', todo.category_id || '');
    const category_id = cat ? Number(cat) : null;
    api.updateTodo(todo.id, { title: newTitle, description: newDesc, category_id, completed: !!todo.completed }).then(()=>load());
  });
}

// initial
loadCategories().then(()=>load());
