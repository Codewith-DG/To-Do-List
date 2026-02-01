 // Initialize variables
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let currentFilter = 'all';
        
        // DOM Elements
        const todoInput = document.getElementById('todo-input');
        const addBtn = document.getElementById('add-btn');
        const todoList = document.getElementById('todo-list');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clear-completed');
        
        // Event Listeners
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTodos();
            });
        });
        
        clearCompletedBtn.addEventListener('click', clearCompleted);
        
        // Functions
        function addTodo() {
            const text = todoInput.value.trim();
            
            if (text === '') {
                todoInput.focus();
                return;
            }
            
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            todos.push(todo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
            todoInput.focus();
        }
        
        function toggleTodo(id) {
            todos = todos.map(todo => 
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            );
            saveTodos();
            renderTodos();
        }
        
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }
        
        function editTodo(id) {
            const todoItem = document.querySelector(`[data-id="${id}"]`);
            const todoTextSpan = todoItem.querySelector('.todo-text');
            const currentText = todos.find(todo => todo.id === id).text;
            
            // Create edit input
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'form-control edit-input';
            editInput.value = currentText;
            
            // Add edit mode class
            todoItem.classList.add('edit-mode');
            
            // Replace text with input
            const textContainer = todoTextSpan.parentElement;
            textContainer.replaceChild(editInput, todoTextSpan);
            
            // Focus and select text
            editInput.focus();
            editInput.select();
            
            // Change buttons
            const btnContainer = todoItem.querySelector('.btn-container');
            btnContainer.innerHTML = `
                <button class="btn btn-success btn-sm me-1" onclick="saveEdit(${id})">
                    <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="cancelEdit(${id})">
                    <i class="bi bi-x-lg"></i>
                </button>
            `;
            
            // Save on Enter, cancel on Escape
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit(id);
            });
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') cancelEdit(id);
            });
        }
        
        function saveEdit(id) {
            const todoItem = document.querySelector(`[data-id="${id}"]`);
            const editInput = todoItem.querySelector('.edit-input');
            const newText = editInput.value.trim();
            
            if (newText === '') {
                alert('Task cannot be empty!');
                editInput.focus();
                return;
            }
            
            todos = todos.map(todo => 
                todo.id === id ? { ...todo, text: newText } : todo
            );
            saveTodos();
            renderTodos();
        }
        
        function cancelEdit(id) {
            renderTodos();
        }
        
        function clearCompleted() {
            todos = todos.filter(todo => !todo.completed);
            saveTodos();
            renderTodos();
        }
        
        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }
        
        function renderTodos() {
            // Filter todos
            let filteredTodos = todos;
            if (currentFilter === 'active') {
                filteredTodos = todos.filter(todo => !todo.completed);
            } else if (currentFilter === 'completed') {
                filteredTodos = todos.filter(todo => todo.completed);
            }
            
            // Render filtered todos
            todoList.innerHTML = '';
            
            if (filteredTodos.length === 0) {
                todoList.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                        <p class="mt-2">No tasks to display</p>
                    </div>
                `;
            } else {
                filteredTodos.forEach(todo => {
                    const todoItem = document.createElement('div');
                    todoItem.className = `todo-item p-3 rounded ${todo.completed ? 'completed' : ''}`;
                    todoItem.setAttribute('data-id', todo.id);
                    todoItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <input class="form-check-input me-3" type="checkbox" 
                                   ${todo.completed ? 'checked' : ''} 
                                   onchange="toggleTodo(${todo.id})"
                                   style="cursor: pointer; width: 20px; height: 20px;">
                            <span class="todo-text w-100">${escapeHtml(todo.text)}</span>
                            <div class="btn-container">
                                <button class="btn btn-warning btn-sm btn-edit me-1" onclick="editTodo(${todo.id})" title="Edit task">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-danger btn-sm btn-delete" onclick="deleteTodo(${todo.id})" title="Delete task">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    todoList.appendChild(todoItem);
                });
            }
            
            updateStats();
        }
        
        function updateStats() {
            const total = todos.length;
            const completed = todos.filter(todo => todo.completed).length;
            const pending = total - completed;
            
            document.getElementById('total-tasks').textContent = total;
            document.getElementById('completed-tasks').textContent = completed;
            document.getElementById('pending-tasks').textContent = pending;
            
            // Show/hide clear completed button
            clearCompletedBtn.style.display = completed > 0 ? 'inline-block' : 'none';
        }
        
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
        
        // Initial render
        renderTodos();