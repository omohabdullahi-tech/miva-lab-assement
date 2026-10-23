/* ============================================
   Student Portfolio - Vanilla JavaScript
   Handles: mobile nav, task planner, form validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPlanner();
  initContactForm();
});

/* ---------- Mobile Navigation Toggle ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Academic Planner (Task Manager) ---------- */
function initPlanner() {
  const form = document.getElementById('task-form');
  const taskListEl = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  // Only run on planner page
  if (!form || !taskListEl) return;

  // In-memory task store (array of objects)
  let tasks = [
    {
      id: Date.now() - 3000,
      title: 'Finish Web Development Assignment',
      due: '2026-10-28',
      priority: 'high',
      completed: false
    },
    {
      id: Date.now() - 2000,
      title: 'Review Database lecture notes',
      due: '2026-10-25',
      priority: 'medium',
      completed: false
    },
    {
      id: Date.now() - 1000,
      title: 'Prepare presentation slides',
      due: '2026-11-02',
      priority: 'low',
      completed: true
    }
  ];

  // Render all tasks from the array
  function renderTasks() {
    taskListEl.innerHTML = '';

    if (tasks.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    // Sort: incomplete first, then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      li.innerHTML = `
        <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} aria-label="Mark complete">
        <div class="task-info">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            Due: ${formatDate(task.due)}
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
          </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm delete-btn" aria-label="Delete task">Delete</button>
      `;

      // Toggle complete
      li.querySelector('.task-check').addEventListener('change', (e) => {
        const t = tasks.find(x => x.id === task.id);
        if (t) {
          t.completed = e.target.checked;
          renderTasks();
        }
      });

      // Delete
      li.querySelector('.delete-btn').addEventListener('click', () => {
        tasks = tasks.filter(x => x.id !== task.id);
        renderTasks();
      });

      taskListEl.appendChild(li);
    });
  }

  // Add new task
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('task-title');
    const dueInput = document.getElementById('task-due');
    const priorityInput = document.getElementById('task-priority');

    const title = titleInput.value.trim();
    const due = dueInput.value;
    const priority = priorityInput.value;

    if (!title) {
      titleInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      title,
      due: due || new Date().toISOString().slice(0, 10),
      priority,
      completed: false
    };

    tasks.push(newTask);
    form.reset();
    priorityInput.value = 'medium';
    renderTasks();
    titleInput.focus();
  });

  // Initial render
  renderTasks();
}

/* ---------- Contact Form Validation ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');
  const successMsg = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Clear previous errors
    [nameInput, emailInput, phoneInput, messageInput].forEach(clearError);

    // Name required
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Name is required.');
      isValid = false;
    }

    // Email required + format
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showError(emailInput, 'Email address is required.');
      isValid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    }

    // Phone required + digits only
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) {
      showError(phoneInput, 'Phone number is required.');
      isValid = false;
    } else if (!/^\d+$/.test(phoneVal)) {
      showError(phoneInput, 'Phone number must contain only digits.');
      isValid = false;
    }

    // Message required
    if (!messageInput.value.trim()) {
      showError(messageInput, 'Message is required.');
      isValid = false;
    }

    if (isValid) {
      // Simulate successful submission
      successMsg.style.display = 'block';
      form.reset();
      // Hide success after a few seconds
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
    }
  });

  // Live validation helpers
  function showError(input, message) {
    const group = input.closest('.form-group');
    group.classList.add('error');
    const errorEl = group.querySelector('.error-msg');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input) {
    const group = input.closest('.form-group');
    group.classList.remove('error');
  }
}

/* ---------- Helpers ---------- */
function isValidEmail(email) {
  // Simple but practical email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, options);
}
