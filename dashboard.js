const balanceEl = document.getElementById("balance");
const accountNumberEl = document.getElementById("account-number");
const welcomeNameEl = document.getElementById("welcome-name");
const transactionsList = document.getElementById("transactions-list");
const transferForm = document.getElementById("transfer-form");
const transferMessage = document.getElementById("transfer-message");
const logoutBtn = document.getElementById("logout-btn");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function requireSession() {
  const res = await fetch("/api/auth/session");
  const data = await res.json();
  if (!data.loggedIn) {
    window.location.href = "/index.html";
    return null;
  }
  return data.user;
}

async function loadSummary() {
  const res = await fetch("/api/account/summary");
  if (!res.ok) return;
  const data = await res.json();
  balanceEl.textContent = currencyFormatter.format(data.balance);
  accountNumberEl.textContent = `••••${data.accountNumber.slice(-4)}`;
}

async function loadTransactions() {
  const res = await fetch("/api/account/transactions");
  if (!res.ok) return;
  const data = await res.json();

  transactionsList.innerHTML = "";
  if (data.transactions.length === 0) {
    transactionsList.innerHTML = '<li class="loading">No transactions yet.</li>';
    return;
  }

  for (const txn of data.transactions) {
    const li = document.createElement("li");
    const sign = txn.type === "credit" ? "+" : "-";
    const dateStr = new Date(txn.date + "Z").toLocaleString();

    li.innerHTML = `
      <div class="txn-details">
        <span class="txn-counterparty">${escapeHtml(txn.counterparty)}</span>
        <span class="txn-date">${dateStr}${txn.description ? " · " + escapeHtml(txn.description) : ""}</span>
      </div>
      <span class="txn-amount ${txn.type}">${sign}${currencyFormatter.format(txn.amount)}</span>
    `;
    transactionsList.appendChild(li);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

transferForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  transferMessage.textContent = "";
  transferMessage.classList.remove("success");

  const payload = {
    recipientName: document.getElementById("recipientName").value,
    recipientAccount: document.getElementById("recipientAccount").value,
    amount: document.getElementById("amount").value,
    memo: document.getElementById("memo").value,
  };

  try {
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      transferMessage.textContent = data.error || "Transfer failed.";
      return;
    }

    transferMessage.textContent = "Transfer completed successfully.";
    transferMessage.classList.add("success");
    transferForm.reset();
    await loadSummary();
    await loadTransactions();
  } catch (err) {
    transferMessage.textContent = "Could not reach the server. Please try again.";
  }
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/index.html";
});

(async function init() {
  const user = await requireSession();
  if (!user) return;
  welcomeNameEl.textContent = `Hi, ${user.fullName}`;
  await loadSummary();
  await loadTransactions();
})();
