document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const emptyState = document.getElementById('emptyState');
    const clearChatBtn = document.getElementById('clearChatBtn');

    // --- SYSTEM PROMPT (per user requirement) ---
    const SYSTEM_PROMPT = `
You are EventMate, an AI assistant for TechFest 2026.
Event Context: TechFest 2026 is a premier college tech event.
Locations:
- Hall A (AI Talks)
- Hall B (Web Dev)
- Hall C (Workshops & Hackathon Briefing)
- Food Court (Ground Floor)
- Main Entrance
Schedule:
- 10:00 AM: Keynote (Hall A)
- 02:00 PM: AI Talk (Hall A)
- 03:00 PM: Web Dev (Hall B)
- 04:00 PM: Hackathon Briefing (Hall C)
- 11:59 PM: Midnight Hackathon Sprint (Hall C)
Behavior Rules:
1. Short, clear, helpful, slightly proactive responses.
2. Context awareness: Remember previous queries and user location.
3. Navigation logic: Provide step-by-step path from user location if known. Interactive from/to routes.
4. Time-based suggestions: Suggest next event based on current time.
5. Multi-step interaction: Suggest -> Confirm -> Guide.
`;

    // --- STATE MANAGEMENT ---
    let appState = {
        userLocation: null,
        conversationStep: 'idle',
        pendingBooking: null,
        pendingNavStart: null,
        isWaitingForResponse: false,
        hasInteracted: false // to hide empty state
    };

    // --- MOCK GRAPH FOR NAVIGATION ---
    const navGraph = {
        'main entrance': ['corridor', 'food court'],
        'food court': ['main entrance'],
        'corridor': ['main entrance', 'hall a', 'hall b'],
        'hall a': ['corridor', 'hall c'],
        'hall b': ['corridor'],
        'hall c': ['hall a']
    };

    const locationEntities = {
        'hall a': 'Hall A', 'ai': 'Hall A', 'hall b': 'Hall B', 'web': 'Hall B',
        'hall c': 'Hall C', 'hackathon': 'Hall C', 'workshop': 'Hall C',
        'food court': 'Food Court', 'food': 'Food Court', 'main entrance': 'Main Entrance'
    };

    function findPath(start, goal) {
        start = start.toLowerCase(); goal = goal.toLowerCase();
        let queue = [[start]];
        let visited = new Set();
        while (queue.length > 0) {
            let path = queue.shift();
            let node = path[path.length - 1];
            if (node === goal) return path;
            if (!visited.has(node)) {
                visited.add(node);
                if (navGraph[node]) {
                    for (let neighbor of navGraph[node]) {
                        queue.push([...path, neighbor]);
                    }
                }
            }
        }
        return null;
    }

    const scheduleArray = [
        { time: '10:00', title: 'Keynote', loc: 'Hall A' },
        { time: '14:00', title: 'AI Talk', loc: 'Hall A' },
        { time: '15:00', title: 'Web Dev', loc: 'Hall B' },
        { time: '16:00', title: 'Hackathon Briefing', loc: 'Hall C' },
        { time: '23:59', title: 'Midnight Hackathon Sprint', loc: 'Hall C' }
    ];

    function getNextEvent() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMins = now.getMinutes();
        const currentTimeInt = currentHours * 60 + currentMins;

        for (let evt of scheduleArray) {
            const [h, m] = evt.time.split(':').map(Number);
            if (h * 60 + m > currentTimeInt) {
                return evt;
            }
        }
        return null;
    }

    // --- UI UPDATES ---
    function hideEmptyState() {
        if (!appState.hasInteracted && emptyState) {
            emptyState.style.display = 'none';
            appState.hasInteracted = true;
        }
    }

    function addMessage(text, sender, suggestions = []) {
        hideEmptyState();

        const msgWrapper = document.createElement('div');
        msgWrapper.className = `message-group ${sender}`;

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        
        msgDiv.appendChild(bubble);

        // Timestamp Meta
        const meta = document.createElement('span');
        meta.className = 'message-meta';
        const now = new Date();
        meta.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === 'user') {
            msgWrapper.appendChild(msgDiv);
            msgWrapper.appendChild(meta);
        } else {
            msgWrapper.appendChild(msgDiv);
            msgWrapper.appendChild(meta);
        }

        if (suggestions.length > 0) {
            const chipContainer = document.createElement('div');
            chipContainer.className = `suggestion-chips ${sender}`;
            suggestions.forEach((sug, i) => {
                const btn = document.createElement('button');
                btn.className = 'chip-btn';
                btn.textContent = sug;
                btn.style.animationDelay = `${i * 0.1}s`;
                btn.onclick = () => {
                    handleUserSubmit(sug);
                    chipContainer.style.display = 'none';
                };
                chipContainer.appendChild(btn);
            });
            msgWrapper.appendChild(chipContainer);
        }

        chatMessages.appendChild(msgWrapper);
        scrollToBottom();
    }

    function addTypingIndicator() {
        hideEmptyState();

        const msgWrapper = document.createElement('div');
        msgWrapper.className = 'message-group bot';
        msgWrapper.id = 'typingIndicator';
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot typing-wrapper';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble typing-indicator';
        bubble.innerHTML = '<span></span><span></span><span></span>';
        
        const textLabel = document.createElement('span');
        textLabel.className = 'typing-text';
        textLabel.textContent = 'EventMate is thinking...';
        
        msgDiv.appendChild(bubble);
        msgDiv.appendChild(textLabel);
        msgWrapper.appendChild(msgDiv);
        chatMessages.appendChild(msgWrapper);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- CORE BOT LOGIC ---
    function processInput(input) {
        const lowerInput = input.toLowerCase();
        let response = "";
        let actions = [];

        if (lowerInput === 'cancel' || lowerInput === 'stop') {
             appState.conversationStep = 'idle';
             return sendBotResponse("Okay, cancelled! How else can I help?", ["What's next?", "Navigate", "Show Schedule"]);
        }

        const fromToMatch = lowerInput.match(/from\s+(.*?)\s+to\s+(.*)/i);
        if (fromToMatch) {
             let startRaw = fromToMatch[1];
             let targetRaw = fromToMatch[2];
             let startLoc = null, targetLoc = null;
             
             for (const [key, formalName] of Object.entries(locationEntities)) {
                 if (startRaw.includes(key) && !startLoc) startLoc = formalName;
                 if (targetRaw.includes(key) && !targetLoc) targetLoc = formalName;
             }
             
             if (startLoc && targetLoc) {
                 const path = findPath(startLoc, targetLoc);
                 if (path && path.length > 1) {
                     const capitalizedPath = path.map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                     response = `Here are your simple steps from ${startLoc} to ${targetLoc}: ${capitalizedPath.join(' → ')}. Follow the signs and have a great walk!`;
                     actions = ["Thanks!", "What's next?"];
                 } else if (path && path.length === 1) {
                     response = `You are already at ${targetLoc}!`;
                     actions = ["What's next?", "Show schedule"];
                 } else {
                     response = `I couldn't find a direct path from ${startLoc} to ${targetLoc}.`;
                     actions = ["What's next?"];
                 }
                 return sendBotResponse(response, actions);
             }
        }

        if (appState.conversationStep === 'awaiting_nav_start') {
            for (const [key, formalName] of Object.entries(locationEntities)) {
                if (lowerInput.includes(key)) {
                    appState.pendingNavStart = formalName;
                    appState.userLocation = formalName;
                    appState.conversationStep = 'awaiting_nav_target';
                    response = `Got it. We are starting from ${formalName}. Where do you want to go?`;
                    actions = Object.values(locationEntities).filter((v, i, a) => a.indexOf(v) === i && v !== formalName).slice(0, 3);
                    return sendBotResponse(response, actions);
                }
            }
            response = "I didn't recognize that starting location. Try saying 'Main Entrance', 'Hall A', or 'Food Court'.";
            actions = ["Main Entrance", "Hall A", "Cancel"];
            return sendBotResponse(response, actions);
        }

        if (appState.conversationStep === 'awaiting_nav_target') {
            for (const [key, formalName] of Object.entries(locationEntities)) {
                if (lowerInput.includes(key)) {
                    appState.conversationStep = 'idle';
                    let targetLoc = formalName;
                    const path = findPath(appState.pendingNavStart, targetLoc);
                    if (path && path.length > 1) {
                        const capitalizedPath = path.map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                        response = `Here is your route from ${appState.pendingNavStart} to ${targetLoc}: ${capitalizedPath.join(' → ')}. Simple!`;
                        actions = ["Thanks!", "What's next?"];
                    } else if (path && path.length === 1) {
                         response = `No need to walk! You are already at ${targetLoc}.`;
                         actions = ["What's next?"];
                    } else {
                         response = `Sorry, I couldn't navigate directly from ${appState.pendingNavStart} to ${targetLoc}.`;
                         actions = ["What's next?"];
                    }
                    appState.pendingNavStart = null;
                    return sendBotResponse(response, actions);
                }
            }
            response = "I couldn't recognize your destination. Where do you want to go?";
            actions = ["Food Court", "Hall C", "Cancel"];
            return sendBotResponse(response, actions);
        }

        if (lowerInput === 'navigate' || lowerInput.includes('start navigation') || lowerInput.includes('route') || lowerInput.includes('give me a path')) {
            if (appState.userLocation) {
                appState.pendingNavStart = appState.userLocation;
                appState.conversationStep = 'awaiting_nav_target';
                response = `Since you mentioned earlier that you are at ${appState.userLocation}, where do you want to go to?`;
                actions = Object.values(locationEntities).filter((v, i, a) => a.indexOf(v) === i && v !== appState.userLocation).slice(0, 3);
            } else {
                appState.conversationStep = 'awaiting_nav_start';
                response = "I can help you navigate! Where are you currently starting from?";
                actions = ["Main Entrance", "Hall A", "Food Court"];
            }
            return sendBotResponse(response, actions);
        }

        for (const [key, formalName] of Object.entries(locationEntities)) {
            if (lowerInput.includes('i am in') || lowerInput.includes("i'm in") || lowerInput.includes('i am at') || lowerInput.includes("i'm at") || lowerInput.includes('currently at')) {
                if (lowerInput.includes(key)) {
                    appState.userLocation = formalName;
                    response = `Got it! I've noted that you are currently at the ${formalName}. Where would you like to go next?`;
                    actions = ["Where is the Food Court?", "Navigate from here"];
                    return sendBotResponse(response, actions);
                }
            }
        }

        if (appState.conversationStep === 'booking_pending_confirm') {
            if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('ok') || lowerInput.includes('attend')) {
                appState.conversationStep = 'idle';
                response = `Awesome! I've confirmed you for ${appState.pendingBooking}. Can I guide you to the location?`;
                actions = ["Yes, give directions", "No, I'm good"];
                return sendBotResponse(response, actions);
            } else if (lowerInput.includes('no') || lowerInput.includes('nope')) {
                appState.conversationStep = 'idle';
                response = "No problem! Let me know if you are interested in something else.";
                actions = ["Show schedule", "Where is Food Court?"];
                return sendBotResponse(response, actions);
            }
        }

        if (lowerInput.includes('attend') || lowerInput.includes('book') || lowerInput.includes('go to a session') || lowerInput.includes('want to attend') || lowerInput.includes('what else')) {
            const nextEvt = getNextEvent();
            if (nextEvt) {
                appState.conversationStep = 'booking_pending_confirm';
                appState.pendingBooking = nextEvt.title;
                response = `The upcoming session is "${nextEvt.title}" at ${nextEvt.time} in ${nextEvt.loc}. Should I save a spot for you?`;
                actions = ["Yes, attend session", "What else is there?"];
            } else {
                response = "There are no more sessions scheduled for today! Want to grab food instead?";
                actions = ["Where is the Food Court?", "Show tomorrow's events"];
            }
            return sendBotResponse(response, actions);
        }

        if (lowerInput.includes('next') || lowerInput.includes('schedule') || lowerInput.includes('time') || lowerInput.includes('upcoming')) {
            const nextEvt = getNextEvent();
            if (nextEvt) {
                response = `Based on the time right now, up next is "${nextEvt.title}" at ${nextEvt.time} in ${nextEvt.loc}.`;
                actions = ["I want to attend", "Navigate"];
            } else {
                response = "All sessions for today have concluded. Did you want to look at tomorrow's schedule?";
                actions = ["Yes, tomorrow", "Navigate"];
            }
            return sendBotResponse(response, actions);
        }

        if (lowerInput.includes('where') || lowerInput.includes('directions') || lowerInput.includes('how to') || lowerInput.includes('guide')) {
            let target = null;
            for (const [key, formalName] of Object.entries(locationEntities)) {
                if (lowerInput.includes(key) && ((appState.userLocation || '').toLowerCase() !== formalName.toLowerCase())) {
                    target = formalName;
                    break;
                }
            }

            if (target) {
                if (appState.userLocation) {
                    const path = findPath(appState.userLocation, target);
                    if (path && path.length > 1) {
                        const capitalizedPath = path.map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                        response = `From your location at ${appState.userLocation}, here is the step-by-step path: ${capitalizedPath.join(' → ')}. Have a good walk!`;
                        actions = ["Thanks!", "What's next?"];
                    } else if (path && path.length === 1) {
                         response = `No need to walk! You are already at ${target}.`;
                         actions = ["What's next?"];
                    }
                } else {
                    response = `${target} is ready for you. To give you step-by-step directions, could you tell me where you are currently?`;
                    actions = ["I'm at the Main Entrance", "I'm in Hall A"];
                }
            } else if (lowerInput.includes('food court')) {
                 if(appState.userLocation) {
                    const path = findPath(appState.userLocation, "Food Court");
                    if (path) {
                        const capitalizedPath = path.map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                        response = `Path to Food Court: ${capitalizedPath.join(' → ')}.`;
                        actions = ["Thanks!"];
                    } else {
                         response = "The Food Court is on the Ground Floor.";
                         actions = ["What's next?"];
                    }
                 } else {
                    response = "The Food Court is on the Ground Floor. Where are you starting from?";
                    actions = ["I'm at the Main Entrance", "I'm in Hall B", "Navigate there"];
                 }
            } else {
                response = "Which specific venue are you looking to navigate to?";
                actions = ["Navigate to Hall A", "Navigate to Food Court"];
            }
            return sendBotResponse(response, actions);
        }

        // Fallback default
        response = "I'm EventMate, your TechFest 2026 Assistant! How can I help you navigate the event?";
        actions = ["Navigate to a location", "What's next?"];
        return sendBotResponse(response, actions);
    }

    function sendBotResponse(response, suggestions) {
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(response, 'bot', suggestions);
            appState.isWaitingForResponse = false;
        }, 1200 + Math.random() * 800); // slightly longer wait to show thinking UI longer
    }

    function handleUserSubmit(text) {
        if (!text || appState.isWaitingForResponse) return;
        addMessage(text, 'user');
        appState.isWaitingForResponse = true; 
        
        setTimeout(() => {
            addTypingIndicator();
            processInput(text);
        }, 400); 
    }

    // Connect forms and buttons
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        userInput.value = '';
        if(text) {
            handleUserSubmit(text);
        }
    });

    document.querySelectorAll('.empty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.getAttribute('data-action');
            if(action) handleUserSubmit(action);
        });
    });

    clearChatBtn.addEventListener('click', () => {
        // Simply hard reload to get a pure clean empty state!
        // This is standard for completely resetting state machines without weird bugs.
        window.location.href = window.location.pathname;
    });
});
