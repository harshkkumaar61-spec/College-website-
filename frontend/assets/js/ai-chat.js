
// ===== AI CHAT BOT BASIC FUNCTIONALITY =====
let isAIChatOpen = false;

function toggleAIChat() {
    const aiChatContainer = document.getElementById('aiChatContainer');
    const aiChatToggle = document.getElementById('aiChatToggle');
    
    isAIChatOpen = !isAIChatOpen;
    
    if (isAIChatOpen) {
        aiChatContainer.classList.add('active');
        aiChatToggle.style.opacity = '0.7';
        // Remove notification dot when opened
        const notification = document.querySelector('.ai-notification');
        if (notification) {
            notification.style.display = 'none';
        }
    } else {
        aiChatContainer.classList.remove('active');
        aiChatToggle.style.opacity = '1';
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const messagesContainer = document.getElementById('aiChatMessages');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'ai-message';
    userMessageDiv.innerHTML = `
        <div class="message-content" style="margin-left: auto; background: linear-gradient(135deg, #0099cc, #00d4ff); border-radius: 15px; border-top-right-radius: 5px;">
            <p>${message}</p>
        </div>
        <div class="message-avatar" style="background: linear-gradient(135deg, #ff6b6b, #ee5a24);">
            <i class="fas fa-user"></i>
        </div>
    `;
    messagesContainer.appendChild(userMessageDiv);
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Show typing indicator
    showTypingIndicator();
    
    // This will be handled by Python backend later
    // For now, just show a placeholder response
    setTimeout(() => {
        removeTypingIndicator();
        showAIPlaceholderResponse();
    }, 1000);
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('aiChatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message ai-bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function showAIPlaceholderResponse() {
    const messagesContainer = document.getElementById('aiChatMessages');
    
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'ai-message ai-bot-message';
    botMessageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>AI assistant is currently being integrated. This feature will be available soon with advanced AI capabilities!</p>
        </div>
    `;
    messagesContainer.appendChild(botMessageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Enter key support for AI chat
document.getElementById('aiChatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendAIMessage();
    }
});

// Close AI chat when clicking outside
document.addEventListener('click', function(e) {
    const aiChatContainer = document.getElementById('aiChatContainer');
    const aiChatToggle = document.getElementById('aiChatToggle');
    
    if (isAIChatOpen && 
        !aiChatContainer.contains(e.target) && 
        !aiChatToggle.contains(e.target)) {
        toggleAIChat();
    }
});