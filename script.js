// User Management
let currentUser = null;
const users = JSON.parse(localStorage.getItem('users')) || [];

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
    document.querySelector('.auth-tab:nth-child(2)').classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.querySelector('.auth-tab:nth-child(1)').classList.remove('active');
    document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
}

function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const username = form[0].value;
    const email = form[1].value;
    const password = form[2].value;
    const confirmPassword = form[3].value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (users.some(user => user.email === email)) {
        alert('Email already registered!');
        return;
    }

    const newUser = {
        username,
        email,
        password, // In a real app, this should be hashed
        tasks: []
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    showLogin();
    form.reset();
}

function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form[0].value;
    const password = form[1].value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('userEmail').textContent = user.email;
        tasks = user.tasks;
        updateTaskList();
        updateCalendar();
        form.reset();
    } else {
        alert('Invalid email or password!');
    }
}

function handleLogout() {
    currentUser = null;
    tasks = [];
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    updateTaskList();
}

// Calendar functionality
let currentDate = new Date();
let tasks = [];

function updateCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Add day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        grid.appendChild(dayEl);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        grid.appendChild(emptyDay);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        const currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const tasksOnDay = tasks.filter(task => task.deadline.startsWith(currentDateStr));
        if (tasksOnDay.length > 0) {
            dayEl.className += ' has-task';
            const taskCount = document.createElement('div');
            taskCount.className = 'task-count';
            taskCount.textContent = tasksOnDay.length;
            dayEl.appendChild(taskCount);
            
            dayEl.addEventListener('click', () => showTasksForDay(currentDateStr, tasksOnDay));
        }
        
        dayEl.innerHTML += day;
        grid.appendChild(dayEl);
    }
}


function showTasksForDay(date, tasksOnDay) {
    const formattedDate = new Date(date).toLocaleDateString();
    let taskList = tasksOnDay.map(task => 
        `• ${task.text} ${task.completed ? '(Completed)' : ''}`
    ).join('\n');
    
    alert(`Tasks for ${formattedDate}:\n\n${taskList}`);
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

// Task management functionality
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const deadlineInputDate = document.getElementById('deadlineInputDate');
    const deadlineInputTime = document.getElementById('deadlineInputTime');
    
    if (taskInput.value.trim() === '') return;
    if (!deadlineInputDate.value) {
        alert('Please select a deadline date for the task!');
        return;
    }

    const deadlineDate = deadlineInputDate.value;
    const deadlineTime = deadlineInputTime.value || '23:59'; // Default to 11:59 PM if time not set
    
    // Combine date and time
    const deadline = `${deadlineDate}T${deadlineTime}:00`;
    
    const task = {
        id: Date.now(),
        text: taskInput.value,
        deadline: deadline,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);

    // Update user's tasks in localStorage
    if (currentUser) {
        currentUser.tasks = tasks;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }

    updateTaskList();
    updateCalendar();
    taskInput.value = '';
    deadlineInputDate.value = '';
    deadlineInputTime.value = '23:59';
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    
    // Update user's tasks in localStorage
    if (currentUser) {
        currentUser.tasks = tasks;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    updateTaskList();
    updateCalendar();
}

function completeTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        
        // Update user's tasks in localStorage
        if (currentUser) {
            currentUser.tasks = tasks;
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        updateTaskList();
        updateCalendar();
    }
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    // Sort tasks by deadline
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    sortedTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        
        const deadlineDateTime = new Date(task.deadline);
        const isOverdue = !task.completed && deadlineDateTime < new Date();
        
        taskInfo.innerHTML = `
            <span style="${task.completed ? 'text-decoration: line-through' : ''} ${isOverdue ? 'color: #ff4757;' : ''}">
                ${task.text}
            </span>
            <span class="task-deadline">Due: ${deadlineDateTime.toLocaleString()} ${isOverdue ? '(Overdue)' : ''}</span>
        `;

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        taskActions.innerHTML = `
            <button class="complete-btn" onclick="completeTask(${task.id})">
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;

        taskElement.appendChild(taskInfo);
        taskElement.appendChild(taskActions);
        taskList.appendChild(taskElement);
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (in a real app, this would use sessions/tokens)
    const loggedInUserEmail = localStorage.getItem('loggedInUser');
    if (loggedInUserEmail) {
        const user = users.find(u => u.email === loggedInUserEmail);
        if (user) {
            currentUser = user;
            tasks = user.tasks;
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            document.getElementById('userEmail').textContent = user.email;
            updateTaskList();
        }
    }
    
    updateCalendar();
});