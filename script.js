// Elaraki GPT - Système Multi-Clés avec 8 API Keys
class ElarakiGPT {
    constructor() {
        this.conversation = [];
        this.isLoading = false;
        this.modelRetryCount = 0;
        this.maxModelRetries = 3;
        
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
        
        // 🗝️ 8 CLÉS API (triées par priorité)
        this.apiKeys = [
            "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", // Key 1 - Priorité MAX
            "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", // Key 2
            "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", // Key 3
            "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", // Key 4
            "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", // Key 5
            "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", // Key 6
            "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", // Key 7
            "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"  // Key 8
        ];
        
        // 🌐 APIs disponibles
        this.apiUrls = [
            "https://openrouter.ai/api/v1/chat/completions" // OpenRouter principal
        ];
        
        // 📊 MODÈLES TRIÉS PAR FIABILITÉ
        this.availableModels = [
            // 🥇 MODÈLES PREMIUM (toujours testés en premier)
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free", 
            "microsoft/wizardlm-2-8x22b:free",
            
            // 🥈 MODÈLES STABLES
            "qwen/qwen-2.5-72b-instruct:free",
            "google/gemini-2.0-flash-thinking-exp:free",
            "google/gemma-2-9b-it:free",
            
            // 🥉 MODÈLES BACKUP
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free"
        ];
        
        // Configuration initiale
        this.currentApiKeyIndex = 0;
        this.currentApiUrlIndex = 0;
        this.currentModelIndex = 0;
        
        this.apiKey = this.apiKeys[this.currentApiKeyIndex];
        this.apiUrl = this.apiUrls[this.currentApiUrlIndex];
        this.model = this.availableModels[this.currentModelIndex];
        
        this.lastRequestTime = 0;
        this.minRequestInterval = 1500;
        this.workingModels = new Set();
        this.workingApiKeys = new Set(); // Clés API qui fonctionnent
        
        // Statistiques
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            keyUsage: new Array(this.apiKeys.length).fill(0)
        };
        
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
        
        // Initialisation intelligente
        this.initializeSystem();
    }
    
    async initializeSystem() {
        console.log('🚀 Initialisation du système multi-clés...');
        this.updateStatus("Test des 8 clés API...");
        
        // Tester les clés par ordre de priorité
        for (let keyIndex = 0; keyIndex < this.apiKeys.length; keyIndex++) {
            const testKey = this.apiKeys[keyIndex];
            let keyWorks = false;
            
            // Tester avec les 3 meilleurs modèles pour cette clé
            for (let modelIndex = 0; modelIndex < Math.min(3, this.availableModels.length); modelIndex++) {
                const testModel = this.availableModels[modelIndex];
                
                try {
                    await this.testCombination(testKey, this.apiUrls[0], testModel);
                    this.workingApiKeys.add(keyIndex);
                    this.workingModels.add(testModel);
                    keyWorks = true;
                    
                    // Si c'est la première clé qui fonctionne, l'utiliser
                    if (this.currentApiKeyIndex === 0) {
                        this.currentApiKeyIndex = keyIndex;
                        this.currentModelIndex = modelIndex;
                        this.updateCurrentConfig();
                    }
                    
                    console.log(`✅ Clé ${keyIndex+1} fonctionne avec ${testModel}`);
                    break;
                } catch (error) {
                    console.log(`❌ Clé ${keyIndex+1} + ${testModel} - ${error.message}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            
            // Si une clé fonctionne, on peut continuer plus rapidement
            if (keyWorks && this.workingApiKeys.size >= 2) {
                break;
            }
        }
        
        this.updateSystemStatus();
    }
    
    async testCombination(apiKey, apiUrl, model) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://elaraki.ac.ma',
                    'X-Title': 'Elaraki GPT'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: "Test" }],
                    max_tokens: 5
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            await response.json();
            return true;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    updateCurrentConfig() {
        this.apiKey = this.apiKeys[this.currentApiKeyIndex];
        this.apiUrl = this.apiUrls[this.currentApiUrlIndex];
        this.model = this.availableModels[this.currentModelIndex];
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;
        
        // Vérifier s'il y a des clés disponibles
        if (this.workingApiKeys.size === 0) {
            this.addMessage('assistant', '⚠️ Aucune clé API disponible. Réinitialisation...');
            await this.initializeSystem();
            if (this.workingApiKeys.size === 0) {
                this.addMessage('assistant', '❌ Toutes les clés sont saturées. Réessayez dans 10 minutes.');
                return;
            }
        }
        
        // Respecter l'intervalle minimum
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
        this.stats.totalRequests++;
        
        try {
            const response = await this.getAIResponseWithRetry(message);
            this.addMessage('assistant', response);
            this.conversation.push({ role: "user", content: message });
            this.conversation.push({ role: "assistant", content: response });
            this.saveConversation();
            this.lastRequestTime = Date.now();
            this.stats.successfulRequests++;
            this.stats.keyUsage[this.currentApiKeyIndex]++;
            this.modelRetryCount = 0;
            
        } catch (error) {
            console.error('Erreur finale:', error);
            this.addMessage('assistant', this.getFriendlyErrorMessage(error));
        } finally {
            this.setLoading(false);
        }
    }
    
    async getAIResponseWithRetry(userMessage, retryCount = 0) {
        const maxRetries = 5; // 5 tentatives avec rotation
        
        try {
            return await this.getAIResponse(userMessage);
        } catch (error) {
            console.log(`❌ Tentative ${retryCount + 1} échouée:`, error.message);
            
            if (retryCount < maxRetries) {
                // Rotation intelligente
                await this.rotateToBetterCombination();
                
                const waitTime = 2000 + (retryCount * 1000);
                this.updateStatus(`Tentative ${retryCount + 2}/${maxRetries + 1} (Clé ${this.currentApiKeyIndex+1})`);
                
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return await this.getAIResponseWithRetry(userMessage, retryCount + 1);
            }
            
            throw error;
        }
    }
    
    async rotateToBetterCombination() {
        // Marquer la combinaison actuelle comme problématique
        this.workingModels.delete(this.model);
        
        // Essayer d'abord d'autres modèles avec la même clé
        for (let i = 1; i < this.availableModels.length; i++) {
            const newModelIndex = (this.currentModelIndex + i) % this.availableModels.length;
            const testModel = this.availableModels[newModelIndex];
            
            if (this.workingModels.has(testModel)) {
                this.currentModelIndex = newModelIndex;
                this.model = testModel;
                console.log(`🔄 Rotation modèle: ${this.model}`);
                return;
            }
        }
        
        // Si aucun autre modèle ne fonctionne, changer de clé
        this.workingApiKeys.delete(this.currentApiKeyIndex);
        
        // Trouver la prochaine clé qui fonctionne
        for (let i = 1; i < this.apiKeys.length; i++) {
            const newKeyIndex = (this.currentApiKeyIndex + i) % this.apiKeys.length;
            
            if (this.workingApiKeys.has(newKeyIndex)) {
                this.currentApiKeyIndex = newKeyIndex;
                // Réinitialiser au meilleur modèle pour cette clé
                this.currentModelIndex = 0;
                this.model = this.availableModels[0];
                this.updateCurrentConfig();
                console.log(`🔄 Rotation clé: ${this.currentApiKeyIndex + 1}`);
                return;
            }
        }
        
        // Si aucune clé ne fonctionne, réinitialiser
        console.log('🔄 Réinitialisation complète du système');
        await this.initializeSystem();
    }
    
    async getAIResponse(userMessage) {
        this.conversation.push({ role: "user", content: userMessage });
        
        const requestBody = {
            model: this.model,
            messages: this.conversation,
            max_tokens: 800,
            temperature: 0.7,
            stream: false
        };
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://elaraki.ac.ma',
            'X-Title': 'Elaraki GPT'
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
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
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    getFriendlyErrorMessage(error) {
        const errorMsg = error.message.toLowerCase();
        const activeKeys = this.workingApiKeys.size;
        const activeModels = this.workingModels.size;
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
            return `📊 Limite atteinte. ${activeKeys} clés actives. Rotation...`;
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            return `🔄 Modèle indisponible. ${activeModels} modèles restants. Recherche...`;
        } else if (errorMsg.includes('timeout') || errorMsg.includes('abort')) {
            return `⏰ Délai dépassé. ${activeKeys} clés disponibles. Réessai...`;
        } else {
            return `⚠️ Problème technique. ${activeKeys} clés testées. Continuation...`;
        }
    }
    
    updateSystemStatus() {
        const activeKeys = this.workingApiKeys.size;
        const activeModels = this.workingModels.size;
        
        if (activeKeys > 0) {
            this.updateStatus(`✅ ${activeKeys}/8 clés actives - ${activeModels} modèles`);
        } else {
            this.updateStatus("❌ Aucune clé active - Réinitialisation...");
        }
    }
    
    updateModelIndicator() {
        const aiText = document.querySelector('.ai-indicator span');
        if (aiText) {
            const modelNames = {
                'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3',
                'google/gemini-2.0-flash-exp:free': 'Gemini 2',
                'microsoft/wizardlm-2-8x22b:free': 'WizardLM',
                'qwen/qwen-2.5-72b-instruct:free': 'Qwen 2.5',
                'google/gemini-2.0-flash-thinking-exp:free': 'Gemini Thinking',
                'google/gemma-2-9b-it:free': 'Gemma 2'
            };
            
            const modelName = modelNames[this.model] || this.model.split('/')[1]?.split(':')[0] || this.model;
            aiText.textContent = `Elaraki GPT (Clé ${this.currentApiKeyIndex+1}) - ${modelName}`;
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
        messageContent.innerHTML = this.formatMarkdown(content);
        
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
    
    formatMarkdown(text) {
        if (!text) return '';
        let formatted = text.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return formatted;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        
        if (loading) {
            this.loadingIndicator.classList.add('show');
            this.updateStatus(`Connexion... (Clé ${this.currentApiKeyIndex+1})`);
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
        this.modelRetryCount = 0;
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
