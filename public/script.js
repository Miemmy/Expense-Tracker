document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (window.location.pathname.includes('index.html') && !token) {
        window.location.href = 'login.html';
        return; // Stop script execution if not logged in
    }

    // Auth forms (login/signup)
    handleAuthForms();

    // Dashboard logic
    if (document.getElementById('dashboard-container')) {
        setupDashboard();
    }
});

function handleAuthForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            try {
                const res = await fetch('/exp/v1/user/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                if (res.ok) {
                    alert('Signup successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    const error = await res.json();
                    alert(`Signup failed: ${error.message}`);
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('Signup failed. See console for details.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const res = await fetch('/exp/v1/user/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('token', data.access_token);
                    window.location.href = 'index.html';
                } else {
                    const error = await res.json();
                    alert(`Login failed: ${error.message}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. See console for details.');
            }
        });
    }
}

function setupDashboard() {
    const token = localStorage.getItem('token');
    const balanceAmount = document.getElementById('balance-amount');
    const recentTransactionsList = document.getElementById('recent-transactions-list');
    const allTransactionsList = document.getElementById('all-transactions-list');
    const addTransactionForm = document.getElementById('add-transaction-form');
    const logoutButton = document.getElementById('logout-button');

    const editModal = document.getElementById('edit-modal');
    const closeModalButton = document.querySelector('.close-button');
    const editTransactionForm = document.getElementById('edit-transaction-form');
    const editTransactionId = document.getElementById('edit-transaction-id');
    const dashboardContainer = document.getElementById('dashboard-container');

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/exp/v1/expense', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }

            if (res.ok) {
                const { expenses, total } = await res.json();
                balanceAmount.textContent = total.toFixed(2);

                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                const recentExpenses = [];
                const allOtherExpenses = [];

                expenses.forEach(expense => {
                    if (new Date(expense.date) >= threeDaysAgo) {
                        recentExpenses.push(expense);
                    } else {
                        allOtherExpenses.push(expense);
                    }
                });

                recentExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                allOtherExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

                renderTransactions(recentTransactionsList, recentExpenses);
                renderTransactions(allTransactionsList, allOtherExpenses);

            } else {
                const error = await res.json();
                alert(`Failed to fetch transactions: ${error.message}`);
            }
        } catch (error) {
            console.error('Fetch transactions error:', error);
        }
    };

    const renderTransactions = (tbody, transactions) => {
        tbody.innerHTML = '';
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #a0a0a0;">No expenses found.</td></tr>';
            return;
        }
        transactions.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>₦${expense.amount.toFixed(2)}</td>
                <td>${expense.description || 'N/A'}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td class="actions">
                    <button class="action-btn edit-btn" data-id="${expense._id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${expense._id}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const res = await fetch(`/exp/v1/expense/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchTransactions();
            } else {
                const error = await res.json();
                alert(`Failed to delete expense: ${error.message}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const openEditModal = (expense) => {
        editTransactionId.value = expense._id;
        document.getElementById('edit-transaction-category').value = expense.category;
        document.getElementById('edit-transaction-amount').value = expense.amount;
        document.getElementById('edit-transaction-date').value = new Date(expense.date).toISOString().split('T')[0];
        document.getElementById('edit-transaction-description').value = expense.description || '';
        editModal.style.display = 'block';
    };

    const handleEditClick = async (id) => {
        try {
            const res = await fetch(`/exp/v1/expense/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok){
                const data = await res.json();
                openEditModal(data);
            } else {
                alert('Could not fetch expense details to edit.');
            }

        } catch (error) {
            console.error('Fetch for edit error:', error);
        }
    };

    dashboardContainer.addEventListener('click', (event) => {
        if (event.target.matches('.delete-btn')) {
            handleDelete(event.target.getAttribute('data-id'));
        }
        if (event.target.matches('.edit-btn')) {
            handleEditClick(event.target.getAttribute('data-id'));
        }
    });

    addTransactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const category = document.getElementById('transaction-category').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;

        // Ensure payload matches the CreateExpenseDto
        const payload = { category, amount, date, description };

        try {
            const res = await fetch('/exp/v1/expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                addTransactionForm.reset();
                fetchTransactions(); // Refresh the list
            } else {
                const error = await res.json();
                alert(`Failed to add transaction: ${error.message}`);
            }
        } catch (error) {
            console.error('Add transaction error:', error);
            alert('Failed to add transaction. See console for details.');
        }
    });
    
    editTransactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editTransactionId.value;
        const updatedExpense = {
            category: document.getElementById('edit-transaction-category').value,
            amount: parseFloat(document.getElementById('edit-transaction-amount').value),
            date: document.getElementById('edit-transaction-date').value,
            description: document.getElementById('edit-transaction-description').value,
        };

        try {
            const res = await fetch(`/exp/v1/expense/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedExpense),
            });

            if (res.ok) {
                editModal.style.display = 'none';
                fetchTransactions();
            } else {
                const error = await res.json();
                alert(`Failed to update expense: ${error.message}`);
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    });

    closeModalButton.addEventListener('click', () => editModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Initial fetch
    fetchTransactions();
}
