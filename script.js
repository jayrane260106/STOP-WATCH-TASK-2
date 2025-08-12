document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const stopwatchContainer = document.getElementById('stopwatchContainer');
    const timerDisplay = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const lapBtn = document.getElementById('lapBtn');
    const exportBtn = document.getElementById('exportBtn');
    const lapsList = document.getElementById('lapsList');

    // State variables
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval;
    let isRunning = false;
    let lapCounter = 0;
    const originalTitle = document.title;

    // --- Core Functions ---

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 10);
        
        stopwatchContainer.classList.add('running');
        updateButtonState('running');
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);
        
        stopwatchContainer.classList.remove('running');
        document.title = "Paused | " + formatTime(elapsedTime);
        updateButtonState('paused');
    }

    function resetTimer() {
        // Clear interval and reset all state variables
        clearInterval(timerInterval);
        isRunning = false;
        elapsedTime = 0;
        lapCounter = 0;
        
        // Reset visual elements
        timerDisplay.textContent = '00:00:00.00';
        document.title = originalTitle;
        lapsList.innerHTML = '';
        
        stopwatchContainer.classList.remove('running');
        updateButtonState('reset');
    }

    function recordLap() {
        if (!isRunning) return;
        lapCounter++;
        const lapTime = formatTime(elapsedTime);
        const li = document.createElement('li');
        li.innerHTML = `<span>Lap ${lapCounter}</span><span>${lapTime}</span>`;
        lapsList.prepend(li);
    }

    // --- New Feature: Export Laps ---

    function exportLaps() {
        const lapsData = Array.from(lapsList.querySelectorAll('li'))
            .map(lap => lap.textContent.trim().replace(/\s+/g, ' - '))
            .reverse() // To export in chronological order
            .join('\n');
        
        if (!lapsData) {
            alert('No laps to export!');
            return;
        }

        const blob = new Blob([lapsData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stopwatch_laps.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- Helper Functions ---

    function updateTimer() {
        elapsedTime = Date.now() - startTime;
        const formattedTime = formatTime(elapsedTime);
        timerDisplay.textContent = formattedTime;
        document.title = formattedTime; // Dynamic Tab Title
    }

    function formatTime(ms) {
        const date = new Date(ms);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const centiseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}.${centiseconds}`;
    }

    /**
     * **[FIXED]** Manages the visibility and text of control buttons 
     * based on the stopwatch's current state.
     */
    function updateButtonState(state) {
        if (state === 'running') {
            // Timer is active
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            resetBtn.style.display = 'inline-block';
            lapBtn.style.display = 'inline-block';
        } else if (state === 'paused') {
            // Timer is paused, show "Resume"
            startBtn.style.display = 'inline-block';
            startBtn.textContent = 'Resume'; // Set text to "Resume"
            pauseBtn.style.display = 'none';
            resetBtn.style.display = 'inline-block';
            lapBtn.style.display = 'none'; // Can't record lap when paused
        } else { // 'reset' or initial state
            // Timer is stopped
            startBtn.style.display = 'inline-block';
            startBtn.textContent = 'Start'; // Set text back to "Start"
            pauseBtn.style.display = 'none';
            resetBtn.style.display = 'none';
            lapBtn.style.display = 'none';
        }
    }

    // --- New Feature: Keyboard Shortcuts ---

    function handleKeyPress(e) {
        // Prevents shortcuts from firing if user is typing in a form input (future-proofing)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = e.key.toLowerCase();
        if (key === 's') {
            isRunning ? pauseTimer() : startTimer();
        } else if (key === 'r') {
            // Only allow reset if not running
            if (!isRunning) resetTimer();
        } else if (key === 'l') {
            if (isRunning) recordLap();
        }
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    lapBtn.addEventListener('click', recordLap);
    exportBtn.addEventListener('click', exportLaps);
    document.addEventListener('keydown', handleKeyPress);

    // --- Initial State ---
    updateButtonState('reset');
});