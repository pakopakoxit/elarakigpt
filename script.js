// Elaraki GPT - Configuration Ultimate avec maximum de requêtes gratuites
class ElarakiGPT {
    constructor() {
        this.conversation = [];
        this.isLoading = false;
        
        // Éléments DOM
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.aboutBtn = document.getElementById('about-btn');
        this.contactBtn = document.getElementById('contact-btn');
        this.aboutModal = document.getElementById('about-modal');
        this.contactModal = document.getElementById('contact-modal');
        this.closeAboutModal = document.getElementById('close-about-modal');
        this.closeContactModal = document.getElementById('close-contact-modal');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.welcomeSection = document.getElementById('welcome-section');
        this.chatContainer = document.getElementById('chat-container');
        this.quickActions = document.getElementById('quick-actions');
        
        // 🎯 CONFIGURATION ULTIMATE - MAXIMUM DE REQUÊTES GRATUITES
        this.apiKey = "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";
        this.apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        
        // 📊 MODÈLES AVEC LE PLUS DE REQUÊTES GRATUITES
        this.availableModels = [
            // 🥇 TOP 1 - Le plus de requêtes
            "google/gemini-2.0-flash-exp:free",
            
            // 🥈 TOP 2 - Très généreux
            "google/gemini-2.0-flash-thinking-exp:free",
            
            // 🥉 TOP 3 - Excellent backup
            "meta-llama/llama-3.3-70b-instruct:free",
            
            // 💎 TOP 4 - Qualité premium
            "qwen/qwen-2.5-72b-instruct:free",
            
            // 🔧 TOP 5 - Très stable
            "microsoft/wizardlm-2-8x22b:free"
        ];
        
        this.currentModelIndex = 0;
        this.model = this.availableModels[this.currentModelIndex];
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 seconde entre les requêtes
        
        this.init();
    }
    
    init() {
        // Écouteurs d'événements
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.clearBtn.addEventListener('click', () => this.clearConversation());
        this.aboutBtn.addEventListener('click', () => this.showModal(this.aboutModal));
        this.contactBtn.addEventListener('click', () => this.showModal(this.contactModal));
        this.closeAboutModal.addEventListener('click', () => this.hideModal(this.aboutModal));
        this.closeContactModal.addEventListener('click', () => this.hideModal(this.contactModal));
        
        // Fermer les modales
        [this.aboutModal, this.contactModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Boutons d'actions rapides
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.getAttribute('data-prompt') || 
                             e.target.closest('.quick-action-btn').getAttribute('data-prompt');
                this.messageInput.value = prompt;
                this.sendMessage();
            });
        });
        
        // Redimensionnement automatique
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        this.loadConversation();
        
        setTimeout(() => {
            this.quickActions.classList.add('show');
        }, 1000);
        
        // Tester la connexion
        this.testAllModels();
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;
        
        // Respecter l'intervalle minimum entre les requêtes
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        
        if (this.conversation.length === 0) {
            this.hideWelcomeSection();
        }
        
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.autoResizeTextarea();
        
        this.setLoading(true);
        
        try {
            const response = await this.getAIResponseWithRetry(message);
            this.addMessage('assistant', response);
            this.conversation.push({ role: "user", content: message });
            this.conversation.push({ role: "assistant", content: response });
            this.saveConversation();
            this.lastRequestTime = Date.now();
        } catch (error) {
            console.error('Erreur:', error);
            this.addMessage('assistant', this.getFriendlyErrorMessage(error));
        } finally {
            this.setLoading(false);
        }
    }
    
    async getAIResponseWithRetry(userMessage, retryCount = 0) {
        const maxRetries = 3;
        
        try {
            return await this.getAIResponse(userMessage);
        } catch (error) {
            if (retryCount < maxRetries) {
                console.log(`Tentative ${retryCount + 1} échouée, changement de modèle...`);
                if (await this.tryNextModel()) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return await this.getAIResponseWithRetry(userMessage, retryCount + 1);
                }
            }
            throw error;
        }
    }
    
    async getAIResponse(userMessage) {
        this.conversation.push({ role: "user", content: userMessage });
        
        const requestBody = {
            model: this.model,
            messages: this.conversation,
            max_tokens: 1024,
            temperature: 0.7,
            stream: false
        };
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://elaraki.ac.ma',
            'X-Title': 'Elaraki GPT'
        };
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.choices?.[0]?.message) {
            throw new Error('Réponse API invalide');
        }
        
        const assistantMessage = data.choices[0].message.content;
        this.conversation.push({ role: "assistant", content: assistantMessage });
        
        return assistantMessage;
    }
    
    async tryNextModel() {
        this.currentModelIndex = (this.currentModelIndex + 1) % this.availableModels.length;
        this.model = this.availableModels[this.currentModelIndex];
        
        console.log(`Essai du modèle: ${this.model}`);
        
        try {
            await this.testCurrentModel();
            this.updateModelIndicator();
            return true;
        } catch (error) {
            console.log(`Modèle ${this.model} non disponible`);
            return false;
        }
    }
    
    async testAllModels() {
        console.log('🔍 Test des modèles disponibles...');
        
        for (let i = 0; i < this.availableModels.length; i++) {
            this.model = this.availableModels[i];
            try {
                await this.testCurrentModel();
                this.currentModelIndex = i;
                console.log(`✅ Modèle sélectionné: ${this.model}`);
                this.updateModelIndicator();
                return;
            } catch (error) {
                console.log(`❌ ${this.model} - ${error.message}`);
            }
        }
        
        // Si aucun modèle ne fonctionne
        this.updateStatus("Aucun modèle disponible - Réessayez plus tard");
    }
    
    async testCurrentModel() {
        const testResponse = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://elaraki.ac.ma',
                'X-Title': 'Elaraki GPT'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: "user", content: "Bonjour" }],
                max_tokens: 10
            })
        });
        
        if (!testResponse.ok) {
            throw new Error(`HTTP ${testResponse.status}`);
        }
        
        await testResponse.json();
        return true;
    }
    
    getFriendlyErrorMessage(error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
            return "Limite temporaire atteinte. L'application change automatiquement de modèle... Réessayez dans 2 secondes.";
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            return "Modèle temporairement indisponible. Changement automatique en cours...";
        } else {
            return "Désolé, service momentanément indisponible. Réessayez dans quelques instants.";
        }
    }
    
    updateModelIndicator() {
        const aiText = document.querySelector('.ai-indicator span');
        if (aiText) {
            const modelNames = {
                'google/gemini-2.0-flash-exp:free': 'Gemini 2 Flash',
                'google/gemini-2.0-flash-thinking-exp:free': 'Gemini 2 Thinking',
                'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3',
                'qwen/qwen-2.5-72b-instruct:free': 'Qwen 2.5',
                'microsoft/wizardlm-2-8x22b:free': 'WizardLM'
            };
            
            const modelName = modelNames[this.model] || this.model.split('/')[1]?.split(':')[0] || this.model;
            aiText.textContent = `Elaraki GPT (${modelName}) est prêt`;
        }
    }
    
    updateStatus(status) {
        const aiText = document.querySelector('.ai-indicator span');
        if (aiText) {
            aiText.textContent = status;
        }
    }
    
    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content.replace(/\n/g, '<br>');
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageContent.appendChild(timestamp);
        messageElement.appendChild(messageContent);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        
        if (loading) {
            this.loadingIndicator.classList.add('show');
            this.updateStatus("Elaraki GPT réfléchit...");
        } else {
            this.loadingIndicator.classList.remove('show');
            this.updateModelIndicator();
        }
    }
    
    hideWelcomeSection() {
        this.welcomeSection.classList.add('hidden');
        this.chatContainer.classList.remove('hidden');
    }
    
    showWelcomeSection() {
        this.welcomeSection.classList.remove('hidden');
        this.chatContainer.classList.add('hidden');
    }
    
    clearConversation() {
        this.conversation = [];
        this.chatMessages.innerHTML = '';
        this.showWelcomeSection();
        localStorage.removeItem('elarakiGPTConversation');
    }
    
    showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    saveConversation() {
        if (this.conversation.length > 0) {
            localStorage.setItem('elarakiGPTConversation', JSON.stringify(this.conversation));
        }
    }
    
    loadConversation() {
        const savedConversation = localStorage.getItem('elarakiGPTConversation');
        if (savedConversation) {
            try {
                this.conversation = JSON.parse(savedConversation);
                this.hideWelcomeSection();
                this.conversation.forEach(message => {
                    this.addMessage(message.role, message.content);
                });
            } catch (error) {
                this.clearConversation();
            }
        }
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    new ElarakiGPT();
});
