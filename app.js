document.addEventListener('DOMContentLoaded', function () {
    // Inicializa dados padrão no localStorage, se não existirem
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            { id: '1', name: 'Administrador', email: 'admin@sweetcake.com', password: 'admin123', type: 'admin' },
            { id: '2', name: 'Funcionário 1', email: 'func1@sweetcake.com', password: 'func123', type: 'employee' }
        ]));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([
            {
                id: '1', clientName: 'Maria Silva', clientPhone: '(11) 99999-8888',
                items: [{ product: 'bolo-chocolate', quantity: 1, price: 120 }],
                total: 120, deliveryDate: '2025-06-08', paymentStatus: 'pending', notes: ''
            },
            {
                id: '2', clientName: 'João Santos', clientPhone: '(11) 88888-7777',
                items: [{ product: 'torta-maca', quantity: 1, price: 80 }],
                total: 80, deliveryDate: '2025-06-09', paymentStatus: 'partial', notes: ''
            },
            {
                id: '3', clientName: 'Ana Oliveira', clientPhone: '(11) 77777-6666',
                items: [{ product: 'cupcake', quantity: 3, price: 15 }, { product: 'bolo-cenoura', quantity: 2, price: 100 }],
                total: 245, deliveryDate: '2025-06-07', paymentStatus: 'paid', notes: ''
            }
        ]));
    }

    // Determina a página atual
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === 'index.html') initializeLoginPage();
    else if (page === 'admin.html') initializeAdminDashboard();
    else if (page === 'employee.html') initializeEmployeeDashboard();
});

// Função para inicializar a página de login
function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = user.type === 'admin' ? 'admin.html' : 'employee.html';
            } else {
                alert('Credenciais inválidas. Tente novamente.');
            }
        });
        // Preenche automaticamente para demonstração
        document.getElementById('email').value = 'admin@sweetcake.com';
        document.getElementById('password').value = 'admin123';
    }
}

// Função para inicializar o dashboard do administrador
function initializeAdminDashboard() {
    // Navegação da barra lateral
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            document.querySelectorAll('#admin-dashboard > #content > div > div').forEach(s => s.classList.add('hidden'));
            document.getElementById(section).classList.remove('hidden');
            if (section === 'reports') renderCharts();
            if (section === 'order-list') renderOrders();
            if (section === 'dashboard') renderDashboard();
        });
    });

    // Alterna a barra lateral
    document.getElementById('toggle-sidebar').addEventListener('click', function () {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        const content = document.getElementById('content');
        this.innerHTML = sidebar.classList.contains('collapsed') ?
            '<i class="fas fa-chevron-right"></i>' :
            '<i class="fas fa-chevron-left"></i>';
        content.style.marginLeft = sidebar.classList.contains('collapsed') ? '70px' : '0';
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function () {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Gerenciamento de usuários
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const userModalTitle = document.getElementById('user-modal-title');
    const newUserBtn = document.getElementById('new-user-btn');
    newUserBtn.addEventListener('click', () => {
        userModalTitle.textContent = 'Novo Usuário';
        userForm.reset();
        userForm.dataset.id = '';
        userModal.classList.remove('hidden');
    });
    document.getElementById('user-modal-cancel').addEventListener('click', () => {
        userModal.classList.add('hidden');
    });
    userForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const id = this.dataset.id || Date.now().toString();
        const user = {
            id,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value,
            type: document.getElementById('user-type').value
        };
        if (this.dataset.id) {
            const index = users.findIndex(u => u.id === this.dataset.id);
            users[index] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
        userModal.classList.add('hidden');
    });

    // Renderiza lista de usuários
    function renderUsers() {
        const tbody = document.querySelector('#user-table tbody');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.type === 'admin' ? 'Admin' : 'Funcionário'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="edit-user text-pink-600 hover:text-pink-900 mr-3" data-id="${user.id}">Editar</button>
                    <button class="delete-user text-red-600 hover:text-red-900" data-id="${user.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const user = users.find(u => u.id === id);
                userModalTitle.textContent = 'Editar Usuário';
                document.getElementById('user-name').value = user.name;
                document.getElementById('user-email').value = user.email;
                document.getElementById('user-password').value = user.password;
                document.getElementById('user-type').value = user.type;
                userForm.dataset.id = id;
                userModal.classList.remove('hidden');
            });
        });
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir este usuário?')) {
                    const id = btn.getAttribute('data-id');
                    const updatedUsers = users.filter(u => u.id !== id);
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    renderUsers();
                }
            });
        });
    }
    renderUsers();

    // Gerenciamento de pedidos
    let itemCount = 1;
    document.getElementById('add-item-btn').addEventListener('click', function () {
        itemCount++;
        const container = document.getElementById('order-items-container');
        const newItem = document.createElement('div');
        newItem.className = 'order-item grid grid-cols-1 md:grid-cols-3 gap-4 mt-4';
        newItem.innerHTML = `
            <div>
                <label for="product-${itemCount}" class="block text-sm font-medium text-gray-700">Produto</label>
                <select id="product-${itemCount}" name="product[]" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                    <option value="">Selecione um produto</option>
                    <option value="bolo-chocolate">Bolo de Chocolate</option>
                    <option value="bolo-cenoura">Bolo de Cenoura</option>
                    <option value="torta-maca">Torta de Maçã</option>
                    <option value="cupcake">Cupcake</option>
                </select>
            </div>
            <div>
                <label for="quantity-${itemCount}" class="block text-sm font-medium text-gray-700">Quantidade</label>
                <input type="number" id="quantity-${itemCount}" name="quantity[]" min="1" value="1" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
            </div>
            <div>
                <label for="price-${itemCount}" class="block text-sm font-medium text-gray-700">Valor Unitário (R$)</label>
                <input type="number" id="price-${itemCount}" name="price[]" min="0" step="0.01" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
            </div>
        `;
        container.appendChild(newItem);
    });

    document.getElementById('order-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const id = document.getElementById('order-id').value || Date.now().toString();
        const items = [];
        let total = 0;
        document.querySelectorAll('.order-item').forEach((item, index) => {
            const product = document.getElementById(`product-${index + 1}`).value;
            const quantity = parseInt(document.getElementById(`quantity-${index + 1}`).value);
            const price = parseFloat(document.getElementById(`price-${index + 1}`).value);
            items.push({ product, quantity, price });
            total += quantity * price;
        });
        const order = {
            id,
            clientName: document.getElementById('client-name').value,
            clientPhone: document.getElementById('client-phone').value,
            items,
            total,
            deliveryDate: document.getElementById('delivery-date').value,
            paymentStatus: document.getElementById('payment-status').value,
            notes: document.getElementById('notes').value
        };
        if (document.getElementById('order-id').value) {
            const index = orders.findIndex(o => o.id === id);
            orders[index] = order;
        } else {
            orders.push(order);
        }
        localStorage.setItem('orders', JSON.stringify(orders));
        alert('Pedido cadastrado com sucesso!');
        this.reset();
        document.getElementById('order-id').value = '';
        const container = document.getElementById('order-items-container');
        while (container.children.length > 1) container.removeChild(container.lastChild);
        itemCount = 1;
        renderOrders();
        document.getElementById('new-order').classList.add('hidden');
        document.getElementById('order-list').classList.remove('hidden');
    });

    document.getElementById('order-cancel-btn').addEventListener('click', function () {
        document.getElementById('order-form').reset();
        document.getElementById('order-id').value = '';
        const container = document.getElementById('order-items-container');
        while (container.children.length > 1) container.removeChild(container.lastChild);
        itemCount = 1;
        document.getElementById('new-order').classList.add('hidden');
        document.getElementById('order-list').classList.remove('hidden');
    });

    // Vendas rápidas
    document.querySelectorAll('.quick-sale').forEach(btn => {
        btn.addEventListener('click', () => {
            const product = btn.getAttribute('data-product');
            const price = btn.getAttribute('data-product');
            document.getElementById('order-form').reset();
            document.getElementById('order-id').value = '';
            document.getElementById('product-1').value = product;
            document.getElementById('price-1').value = price;
            document.getElementById('new-order').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        });
    });

    // Filtro e busca de pedidos
    document.getElementById('status-filter').addEventListener('change', renderOrders);
    document.getElementById('search-orders').addEventListener('input', renderOrders);

    // Renderiza lista de pedidos
    function renderOrders(page = 1, pageSize = 5) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const statusFilter = document.getElementById('status-filter').value;
        const searchQuery = document.getElementById('search-orders').value.toLowerCase();
        let filteredOrders = orders.filter(order =>
            (statusFilter === 'all' || order.paymentStatus === statusFilter) &&
            (order.clientName.toLowerCase().includes(searchQuery) || order.items.some(item => item.product.toLowerCase().includes(searchQuery)))
        );
        const totalOrders = filteredOrders.length;
        const totalPages = Math.ceil(totalOrders / pageSize);
        filteredOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

        const tbody = document.querySelector('#order-table tbody');
        tbody.innerHTML = '';
        filteredOrders.forEach(order => {
            const tr = document.createElement('tr');
            const products = order.items.map(item => `${item.quantity}x ${item.product.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake')}`).join(', ');
            const statusColor = {
                pending: 'bg-yellow-100 text-yellow-800',
                partial: 'bg-blue-100 text-blue-800',
                paid: 'bg-green-100 text-green-800',
                canceled: 'bg-red-100 text-red-800'
            }[order.paymentStatus];
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${order.clientName}</div>
                    <div class="text-sm text-gray-500">${order.clientPhone}</div>
                </td>
                <td class="px-6 py-4">${products}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ ${order.total.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${order.deliveryDate}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor} focus:outline-none" data-id="${order.id}">
                        <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="partial" ${order.paymentStatus === 'partial' ? 'selected' : ''}>Parcial</option>
                        <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>Pago</option>
                        <option value="canceled" ${order.paymentStatus === 'canceled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-order text-pink-600 hover:text-pink-900 mr-3" data-id="${order.id}">Editar</button>
                    <button class="delete-order text-red-600 hover:text-red-900" data-id="${order.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.edit-order').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const order = orders.find(o => o.id === id);
                document.getElementById('order-id').value = order.id;
                document.getElementById('client-name').value = order.clientName;
                document.getElementById('client-phone').value = order.clientPhone;
                document.getElementById('delivery-date').value = order.deliveryDate;
                document.getElementById('payment-status').value = order.paymentStatus;
                document.getElementById('notes').value = order.notes;
                const container = document.getElementById('order-items-container');
                container.innerHTML = '';
                itemCount = 0;
                order.items.forEach((item, index) => {
                    itemCount++;
                    const newItem = document.createElement('div');
                    newItem.className = 'order-item grid grid-cols-1 md:grid-cols-3 gap-4 mt-4';
                    newItem.innerHTML = `
                        <div>
                            <label for="product-${itemCount}" class="block text-sm font-medium text-gray-700">Produto</label>
                            <select id="product-${itemCount}" name="product[]" required
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                                <option value="">Selecione um produto</option>
                                <option value="bolo-chocolate">Bolo de Chocolate</option>
                                <option value="bolo-cenoura">Bolo de Cenoura</option>
                                <option value="torta-maca">Torta de Maçã</option>
                                <option value="cupcake">Cupcake</option>
                            </select>
                        </div>
                        <div>
                            <label for="quantity-${itemCount}" class="block text-sm font-medium text-gray-700">Quantidade</label>
                            <input type="number" id="quantity-${itemCount}" name="quantity[]" min="1" value="${item.quantity}" required
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                        </div>
                        <div>
                            <label for="price-${itemCount}" class="block text-sm font-medium text-gray-700">Valor Unitário (R$)</label>
                            <input type="number" id="price-${itemCount}" name="price[]" min="0" step="0.01" value="${item.price}" required
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                        </div>
                    `;
                    container.appendChild(newItem);
                    document.getElementById(`product-${itemCount}`).value = item.product;
                });
                document.getElementById('order-list').classList.add('hidden');
                document.getElementById('new-order').classList.remove('hidden');
            });
        });

        document.querySelectorAll('.delete-order').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir este pedido?')) {
                    const id = btn.getAttribute('data-id');
                    const updatedOrders = orders.filter(o => o.id !== id);
                    localStorage.setItem('orders', JSON.stringify(updatedOrders));
                    renderOrders();
                }
            });
        });

        document.querySelectorAll('#order-table select').forEach(select => {
            select.addEventListener('change', function () {
                const id = this.getAttribute('data-id');
                const order = orders.find(o => o.id === id);
                order.paymentStatus = this.value;
                localStorage.setItem('orders', JSON.stringify(orders));
                renderOrders();
                renderDashboard();
            });
        });

        // Paginação
        document.getElementById('pagination-info').textContent = `Mostrando ${Math.min((page - 1) * pageSize + 1, totalOrders)} a ${Math.min(page * pageSize, totalOrders)} de ${totalOrders} resultados`;
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        if (page > 1) {
            const prev = document.createElement('a');
            prev.href = '#';
            prev.className = 'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50';
            prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prev.addEventListener('click', () => renderOrders(page - 1));
            pagination.appendChild(prev);
        }
        for (let i = 1; i <= totalPages; i++) {
            const a = document.createElement('a');
            a.href = '#';
            a.className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${i === page ? 'z-10 bg-pink-600 border-pink-600 text-white' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`;
            a.textContent = i;
            a.addEventListener('click', () => renderOrders(i));
            pagination.appendChild(a);
        }
        if (page < totalPages) {
            const next = document.createElement('a');
            next.href = '#';
            next.className = 'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50';
            next.innerHTML = '<i class="fas fa-chevron-right"></i>';
            next.addEventListener('click', () => renderOrders(page + 1));
            pagination.appendChild(next);
        }
    }
    renderOrders();

    // Renderiza dashboard
    function renderDashboard() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.deliveryDate === today);
        const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
        document.getElementById('today-orders').textContent = todayOrders.length;
        document.getElementById('pending-payments').textContent = pendingPayments;
        document.getElementById('today-revenue').textContent = `R$ ${todayRevenue.toFixed(2)}`;

        const recentOrders = document.getElementById('recent-orders');
        recentOrders.innerHTML = '';
        orders.slice(0, 3).forEach(order => {
            const div = document.createElement('div');
            div.className = 'py-3 flex items-center justify-between';
            const products = order.items.map(item => `${item.quantity}x ${item.product.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake')}`).join(', ');
            const statusColor = {
                pending: 'bg-yellow-100 text-yellow-800',
                partial: 'bg-blue-100 text-blue-800',
                paid: 'bg-green-100 text-green-800',
                canceled: 'bg-red-100 text-red-800'
            }[order.paymentStatus];
            div.innerHTML = `
                <div>
                    <p class="font-medium">Pedido #${order.id}</p>
                    <p class="text-sm text-gray-500">${products} - ${order.clientName}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">${order.paymentStatus === 'pending' ? 'Pendente' : order.paymentStatus === 'partial' ? 'Parcial' : order.paymentStatus === 'paid' ? 'Pago' : 'Cancelado'}</span>
            `;
            recentOrders.appendChild(div);
        });

        const upcomingDeliveries = document.getElementById('upcoming-deliveries');
        upcomingDeliveries.innerHTML = '';
        orders.filter(o => new Date(o.deliveryDate) >= new Date()).slice(0, 2).forEach(order => {
            const div = document.createElement('div');
            div.className = 'flex items-start';
            const products = order.items.map(item => `${item.quantity}x ${item.product.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake')}`).join(', ');
            const daysUntil = Math.ceil((new Date(o.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
            div.innerHTML = `
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <i class="fas fa-birthday-cake"></i>
                </div>
                <div class="ml-4">
                    <p class="font-medium">${products}</p>
                    <p class="text-sm text-gray-500">${order.clientName} - ${order.deliveryDate}</p>
                </div>
                <div class="ml-auto">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <i class="fas fa-clock mr-1"></i> ${daysUntil} dias
                    </span>
                </div>
            `;
            upcomingDeliveries.appendChild(div);
        });

        // Atualiza cards de relatórios
        document.getElementById('total-orders').textContent = orders.length;
        const monthlyRevenue = orders.reduce((sum, o) => new Date(o.deliveryDate).getMonth() === new Date().getMonth() ? sum + o.total : sum, 0);
        document.getElementById('monthly-revenue').textContent = `R$ ${monthlyRevenue.toFixed(2)}`;
        const estimatedProfit = monthlyRevenue * 0.4; // Suposição: 40% de margem
        document.getElementById('estimated-profit').textContent = `R$ ${estimatedProfit.toFixed(2)}`;
    }
    renderDashboard();

    // Renderiza gráficos
    function renderCharts() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');

        // Gráfico de Status de Pagamentos
        const paymentCounts = { paid: 0, pending: 0, partial: 0, canceled: 0 };
        orders.forEach(o => paymentCounts[o.paymentStatus]++);
        const paymentCtx = document.getElementById('paymentChart').getContext('2d');
        new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Pago', 'Pendente', 'Parcial', 'Cancelado'],
                datasets: [{
                    data: [paymentCounts.paid, paymentCounts.pending, paymentCounts.partial, paymentCounts.canceled],
                    backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });

        // Gráfico de Receita por Mês
        const monthlyRevenue = Array(12).fill(0);
        orders.forEach(o => {
            const month = new Date(o.deliveryDate).getMonth();
            monthlyRevenue[month] += o.total;
        });
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Receita (R$)',
                    data: monthlyRevenue,
                    backgroundColor: '#EC4899'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });

        // Gráfico de Top Produtos
        const productCounts = {};
        orders.forEach(o => o.items.forEach(i => {
            productCounts[i.product] = (productCounts[i.product] || 0) + i.quantity;
        }));
        const productLabels = Object.keys(productCounts).map(p => p.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake'));
        const productData = Object.values(productCounts);
        const productsCtx = document.getElementById('productsChart').getContext('2d');
        new Chart(productsCtx, {
            type: 'bar',
            data: {
                labels: productLabels,
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: productData,
                    backgroundColor: '#8B5CF6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });

        // Gráfico de Pedidos por Dia (últimos 30 dias)
        const today = new Date();
        const last30Days = Array(30).fill(0);
        const dayLabels = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dayLabels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            orders.forEach(o => {
                if (o.deliveryDate === date.toISOString().split('T')[0]) {
                    last30Days[29 - i]++;
                }
            });
        }
        const ordersCtx = document.getElementById('ordersChart').getContext('2d');
        new Chart(ordersCtx, {
            type: 'line',
            data: {
                labels: dayLabels,
                datasets: [{
                    label: 'Pedidos',
                    data: last30Days,
                    borderColor: '#F43F5E',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

// Função para inicializar o dashboard do funcionário
function initializeEmployeeDashboard() {
    // Navegação da barra lateral
    document.querySelectorAll('.nav-link-employee').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            document.querySelectorAll('#employee-dashboard > #content > div > div').forEach(s => s.classList.add('hidden'));
            document.getElementById(section).classList.remove('hidden');
            if (section === 'employee-order-list') renderEmployeeOrders();
            if (section === 'employee-dashboard-content') renderEmployeeDashboard();
        });
    });

    // Alterna a barra lateral
    document.getElementById('toggle-sidebar').addEventListener('click', function () {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        const content = document.getElementById('content');
        this.innerHTML = sidebar.classList.contains('collapsed') ?
            '<i class="fas fa-chevron-right"></i>' :
            '<i class="fas fa-chevron-left"></i>';
        content.style.marginLeft = sidebar.classList.contains('collapsed') ? '70px' : '0';
    });

    // Logout
    document.getElementById('employee-logout-btn').addEventListener('click', function () {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Ações rápidas
    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action === 'new-order') {
                document.getElementById('employee-order-form').reset();
                document.getElementById('employee-order-id').value = '';
                const container = document.getElementById('employee-order-items-container');
                while (container.children.length > 1) container.removeChild(container.lastChild);
                document.getElementById('employee-new-order').classList.remove('hidden');
                document.getElementById('employee-dashboard-content').classList.add('hidden');
            } else if (action === 'edit-order') {
                const id = prompt('Digite o ID do pedido para editar:');
                if (id) {
                    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                    const order = orders.find(o => o.id === id);
                    if (order) {
                        document.getElementById('employee-order-id').value = order.id;
                        document.getElementById('employee-client-name').value = order.clientName;
                        document.getElementById('employee-client-phone').value = order.clientPhone;
                        document.getElementById('employee-delivery-date').value = order.deliveryDate;
                        document.getElementById('employee-payment-status').value = order.paymentStatus;
                        document.getElementById('employee-notes').value = order.notes;
                        const container = document.getElementById('employee-order-items-container');
                        container.innerHTML = '';
                        let itemCount = 0;
                        order.items.forEach((item, index) => {
                            itemCount++;
                            const newItem = document.createElement('div');
                            newItem.className = 'order-item grid grid-cols-1 md:grid-cols-3 gap-4 mt-4';
                            newItem.innerHTML = `
                                <div>
                                    <label for="employee-product-${itemCount}" class="block text-sm font-medium text-gray-700">Produto</label>
                                    <select id="employee-product-${itemCount}" name="product[]" required
                                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Selecione um produto</option>
                                        <option value="bolo-chocolate">Bolo de Chocolate</option>
                                        <option value="bolo-cenoura">Bolo de Cenoura</option>
                                        <option value="torta-maca">Torta de Maçã</option>
                                        <option value="cupcake">Cupcake</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="employee-quantity-${itemCount}" class="block text-sm font-medium text-gray-700">Quantidade</label>
                                    <input type="number" id="employee-quantity-${itemCount}" name="quantity[]" min="1" value="${item.quantity}" required
                                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div>
                                    <label for="employee-price-${itemCount}" class="block text-sm font-medium text-gray-700">Valor Unitário (R$)</label>
                                    <input type="number" id="employee-price-${itemCount}" name="price[]" min="0" step="0.01" value="${item.price}" required
                                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            `;
                            container.appendChild(newItem);
                            document.getElementById(`employee-product-${itemCount}`).value = item.product;
                        });
                        document.getElementById('employee-new-order').classList.remove('hidden');
                        document.getElementById('employee-dashboard-content').classList.add('hidden');
                    } else {
                        alert('Pedido não encontrado.');
                    }
                }
            } else if (action === 'print-order') {
                const id = prompt('Digite o ID do pedido para imprimir:');
                if (id) {
                    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                    const order = orders.find(o => o.id === id);
                    if (order) {
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(`
                            <html>
                            <head>
                                <title>Imprimir Pedido #${order.id}</title>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    h1 { text-align: center; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                    th { background-color: #f2f2f2; }
                                </style>
                            </head>
                            <body>
                                <h1>Pedido #${order.id}</h1>
                                <p><strong>Cliente:</strong> ${order.clientName}</p>
                                <p><strong>Telefone:</strong> ${order.clientPhone}</p>
                                <p><strong>Data de Entrega:</strong> ${order.deliveryDate}</p>
                                <p><strong>Status:</strong> ${order.paymentStatus}</p>
                                <p><strong>Observações:</strong> ${order.notes || 'Nenhuma'}</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                            <th>Preço Unitário</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${item.product.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake')}</td>
                                                <td>${item.quantity}</td>
                                                <td>R$ ${item.price.toFixed(2)}</td>
                                                <td>R$ ${(item.quantity * item.price).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th colspan="3">Total</th>
                                            <th>R$ ${order.total.toFixed(2)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                                <script>window.print();</script>
                            </body>
                            </html>
                        `);
                        printWindow.document.close();
                    } else {
                        alert('Pedido não encontrado.');
                    }
                }
            }
        });
    });

    // Gerenciamento de pedidos
    let employeeItemCount = 1;
    document.getElementById('employee-add-item-btn').addEventListener('click', function () {
        employeeItemCount++;
        const container = document.getElementById('employee-order-items-container');
        const newItem = document.createElement('div');
        newItem.className = 'order-item grid grid-cols-1 md:grid-cols-3 gap-4 mt-4';
        newItem.innerHTML = `
            <div>
                <label for="employee-product-${employeeItemCount}" class="block text-sm font-medium text-gray-700">Produto</label>
                <select id="employee-product-${employeeItemCount}" name="product[]" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Selecione um produto</option>
                    <option value="bolo-chocolate">Bolo de Chocolate</option>
                    <option value="bolo-cenoura">Bolo de Cenoura</option>
                    <option value="torta-maca">Torta de Maçã</option>
                    <option value="cupcake">Cupcake</option>
                </select>
            </div>
            <div>
                <label for="employee-quantity-${employeeItemCount}" class="block text-sm font-medium text-gray-700">Quantidade</label>
                <input type="number" id="employee-quantity-${employeeItemCount}" name="quantity[]" min="1" value="1" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="employee-price-${employeeItemCount}" class="block text-sm font-medium text-gray-700">Valor Unitário (R$)</label>
                <input type="number" id="employee-price-${employeeItemCount}" name="price[]" min="0" step="0.01" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        `;
        container.appendChild(newItem);
    });

    document.getElementById('employee-order-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const id = document.getElementById('employee-order-id').value || Date.now().toString();
        const items = [];
        let total = 0;
        document.querySelectorAll('#employee-order-items-container .order-item').forEach((item, index) => {
            const product = document.getElementById(`employee-product-${index + 1}`).value;
            const quantity = parseInt(document.getElementById(`employee-quantity-${index + 1}`).value);
            const price = parseFloat(document.getElementById(`employee-price-${index + 1}`).value);
            items.push({ product, quantity, price });
            total += quantity * price;
        });
        const order = {
            id,
            clientName: document.getElementById('employee-client-name').value,
            clientPhone: document.getElementById('employee-client-phone').value,
            items,
            total,
            deliveryDate: document.getElementById('employee-delivery-date').value,
            paymentStatus: document.getElementById('employee-payment-status').value,
            notes: document.getElementById('employee-notes').value
        };
        if (document.getElementById('employee-order-id').value) {
            const index = orders.findIndex(o => o.id === id);
            orders[index] = order;
        } else {
            orders.push(order);
        }
        localStorage.setItem('orders', JSON.stringify(orders));
        alert('Pedido cadastrado com sucesso!');
        this.reset();
        document.getElementById('employee-order-id').value = '';
        const container = document.getElementById('employee-order-items-container');
        while (container.children.length > 1) container.removeChild(container.lastChild);
        employeeItemCount = 1;
        renderEmployeeOrders();
        document.getElementById('employee-new-order').classList.add('hidden');
        document.getElementById('employee-order-list').classList.remove('hidden');
    });

    document.getElementById('employee-order-cancel-btn').addEventListener('click', function () {
        document.getElementById('employee-order-form').reset();
        document.getElementById('employee-order-id').value = '';
        const container = document.getElementById('employee-order-items-container');
        while (container.children.length > 1) container.removeChild(container.lastChild);
        employeeItemCount = 1;
        document.getElementById('employee-new-order').classList.add('hidden');
        document.getElementById('employee-order-list').classList.remove('hidden');
    });

    // Busca de pedidos
    document.getElementById('employee-search-orders').addEventListener('input', renderEmployeeOrders);

    // Renderiza lista de pedidos do funcionário
    function renderEmployeeOrders() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const searchQuery = document.getElementById('employee-search-orders').value.toLowerCase();
        const filteredOrders = orders.filter(order =>
            order.clientName.toLowerCase().includes(searchQuery) ||
            order.items.some(item => item.product.toLowerCase().includes(searchQuery))
        );
        const tbody = document.querySelector('#employee-order-table tbody');
        tbody.innerHTML = '';
        filteredOrders.forEach(order => {
            const tr = document.createElement('tr');
            const products = order.items.map(item => `${item.quantity}x ${item.product.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake')}`).join(', ');
            const statusColor = {
                pending: 'bg-yellow-100 text-yellow-800',
                partial: 'bg-blue-100 text-blue-800',
                paid: 'bg-green-100 text-green-800',
                canceled: 'bg-red-100 text-red-800'
            }[order.paymentStatus];
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${order.clientName}</div>
                    <div class="text-sm text-gray-500">${order.clientPhone}</div>
                </td>
                <td class="px-6 py-4">${products}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ ${order.total.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${order.deliveryDate}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                        ${order.paymentStatus === 'pending' ? 'Pendente' : order.paymentStatus === 'partial' ? 'Parcial' : order.paymentStatus === 'paid' ? 'Pago' : 'Cancelado'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    renderEmployeeOrders();

    // Renderiza dashboard do funcionário
    function renderEmployeeDashboard() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.deliveryDate === today);
        const todayDeliveries = orders.filter(o => o.deliveryDate === today).length;
        const todayPaid = orders.filter(o => o.deliveryDate === today && o.paymentStatus === 'paid').length;
        document.getElementById('employee-today-orders').textContent = todayOrders.length;
        document.getElementById('employee-today-deliveries').textContent = todayDeliveries;
        document.getElementById('employee-today-paid').textContent = todayPaid;
        document.getElementById('employee-today-deliveries-count').textContent = `${todayDeliveries} Pedidos`;

        const deliveriesList = document.getElementById('employee-today-deliveries-list');
        deliveriesList.innerHTML = '';
        todayOrders.forEach(order => {
            const div = document.createElement('div');
            div.className = 'flex items-start py-2';
            const products = order.items.map(item => `${item.quantity}x ${item.product.replace('bolo-', 'Bolo ').replace('torta-', 'Torta ').replace('cupcake', 'Cupcake')}`).join(', ');
            div.innerHTML = `
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <i class="fas fa-birthday-cake"></i>
                </div>
                <div class="ml-4">
                    <p class="font-medium">${products}</p>
                    <p class="text-sm text-gray-500">${order.clientName} - ${order.clientPhone}</p>
                </div>
            `;
            deliveriesList.appendChild(div);
        });
    }
    renderEmployeeDashboard();
}