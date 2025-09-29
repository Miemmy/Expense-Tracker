document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    // If on dashboard, but no token, redirect to login
    if (window.location.pathname.includes('index.html') && !token) {
        window.location.href = 'login.html';
    }

    // Auth forms
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
                    localStorage.setItem('token', data.token);
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

    // Dashboard
    if (document.getElementById('dashboard-container')) {
        const balanceAmount = document.getElementById('balance-amount');
        const transactionsList = document.getElementById('transactions-list');
        const addTransactionForm = document.getElementById('add-transaction-form');
        const logoutButton = document.getElementById('logout-button');

        const fetchTransactions = async () => {
            try {
                const res = await fetch('/exp/v1/expense', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) { // Unauthorized
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                    return;
                }

                if (res.ok) {
                    const { expenses, total } = await res.json();
                    balanceAmount.textContent = total.toFixed(2);

                    transactionsList.innerHTML = ''; // Clear existing rows
                    expenses.forEach(expense => {
                        const row = document.createElement('tr');
                        // Note: The backend doesn't have a 'type', so we assume 'expense'
                        row.innerHTML = `
                            <td>Expense</td>
                            <td>${expense.amount.toFixed(2)}</td>
                            <td>${expense.category}</td>
                            <td>${expense.description}</td>
                            <td>${new Date(expense.date).toLocaleDateString()}</td>
                        `;
                        transactionsList.appendChild(row);
                    });
                } else {
                     const error = await res.json();
                     alert(`Failed to fetch transactions: ${error.message}`);
                }
            } catch (error) {
                console.error('Fetch transactions error:', error);
            }
        };

        addTransactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Note: 'type' (income) is a UI concept for now. API only supports creating expenses.
            const newExpense = {
                amount: parseFloat(document.getElementById('transaction-amount').value),
                category: document.getElementById('transaction-category').value,
                description: document.getElementById('transaction-description').value,
                date: document.getElementById('transaction-date').value,
            };

            try {
                 const res = await fetch('/exp/v1/expense', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newExpense),
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
            }
        });

        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });

        // Initial fetch
        fetchTransactions();
    }
});
