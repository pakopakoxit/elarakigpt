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
        
        // 🗝️ 8 CLÉS API AVEC SYSTÈME DE CHARGE
        this.apiKeys = [
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            },
            {
                key: "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",
                usage: 0,
                lastUsed: 0,
                status: 'unknown'
            }
        ];
        
        // 🌐 APIs disponibles
        this.apiUrls = [
            "https://openrouter.ai/api/v1/chat/completions"
        ];
        
        // 📊 MODÈLES ÉTENDUS (+15 modèles)
        this.availableModels = [
            // 🥇 MODÈLES PREMIUM (Haute performance)
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free", 
            "microsoft/wizardlm-2-8x22b:free",
            "anthropic/claude-3.5-sonnet:free",
            "openai/gpt-4o-mini:free",
            
            // 🥈 MODÈLES STABLES (Performance moyenne)
            "qwen/qwen-2.5-72b-instruct:free",
            "google/gemini-2.0-flash-thinking-exp:free",
            "google/gemma-2-9b-it:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            
            // 🥉 MODÈLES BACKUP (Disponibilité élevée)
            "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
            "cognitivecomputations/dolphin-2.9-llama-3-70b:free",
            "sophosympatheia/midnight-rose-70b:free",
            "undi95/toppy-m-7b:free",
            "huggingfaceh4/zephyr-orpo-141b-aaaa:free",
            "neversleep/llama-3-lumimaid-70b:free",
            "alpindale/goliath-2-70b:free",
            "recursal/eagle-7b:free"
        ];
        
        // Configuration initiale
        this.currentApiKeyIndex = 0;
        this.currentApiUrlIndex = 0;
        this.currentModelIndex = 0;
        
        this.apiKey = this.apiKeys[this.currentApiKeyIndex].key;
        this.apiUrl = this.apiUrls[this.currentApiUrlIndex];
        this.model = this.availableModels[this.currentModelIndex];
        
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // Réduit pour meilleure réactivité
        
        // Système de santé des clés
        this.keyHealth = new Map();
        this.modelHealth = new Map();
        
        // Statistiques avancées
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            keyUsage: new Array(this.apiKeys.length).fill(0),
            modelUsage: new Map(),
            responseTimes: []
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
        console.log('🚀 Initialisation du système multi-clés avancé...');
        this.updateStatus("Test des 8 clés API et 15+ modèles...");
        
        const testPromises = [];
        
        // Tester toutes les combinaisons clé+modèle en parallèle
        for (let keyIndex = 0; keyIndex < this.apiKeys.length; keyIndex++) {
            for (let modelIndex = 0; modelIndex < Math.min(5, this.availableModels.length); modelIndex++) {
                testPromises.push(this.testKeyModelCombination(keyIndex, modelIndex));
            }
        }
        
        // Attendre que tous les tests soient terminés
        await Promise.allSettled(testPromises);
        
        // Trier les clés par charge (moins utilisées en premier)
        this.sortKeysByLoad();
        
        this.updateSystemStatus();
        console.log('✅ Système initialisé avec succès');
    }
    
    async testKeyModelCombination(keyIndex, modelIndex) {
        const keyData = this.apiKeys[keyIndex];
        const model = this.availableModels[modelIndex];
        
        try {
            const startTime = Date.now();
            await this.testCombination(keyData.key, this.apiUrls[0], model);
            const responseTime = Date.now() - startTime;
            
            // Marquer comme fonctionnel
            keyData.status = 'working';
            this.keyHealth.set(keyIndex, {
                status: 'healthy',
                lastTest: Date.now(),
                responseTime: responseTime
            });
            
            this.modelHealth.set(model, {
                status: 'healthy',
                lastTest: Date.now(),
                key: keyIndex
            });
            
            console.log(`✅ Clé ${keyIndex+1} + ${model} - ${responseTime}ms`);
            
        } catch (error) {
            console.log(`❌ Clé ${keyIndex+1} + ${model} - ${error.message}`);
            
            // Marquer comme problématique temporairement
            this.keyHealth.set(keyIndex, {
                status: 'unhealthy',
                lastTest: Date.now(),
                error: error.message
            });
        }
        
        // Petit délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    sortKeysByLoad() {
        // Trier les clés par usage (moins utilisées en premier) et par statut
        this.apiKeys.sort((a, b) => {
            // Priorité aux clés qui fonctionnent
            if (a.status === 'working' && b.status !== 'working') return -1;
            if (a.status !== 'working' && b.status === 'working') return 1;
            
            // Ensuite par usage (moins utilisées en premier)
            return a.usage - b.usage;
        });
        
        console.log('🔑 Clés triées par charge:', this.apiKeys.map((k, i) => 
            `Clé ${i+1}: usage=${k.usage}, status=${k.status}`
        ));
    }
    
    getBestAvailableKey() {
        // Retourner la première clé fonctionnelle avec le moins d'usage
        for (let i = 0; i < this.apiKeys.length; i++) {
            const keyData = this.apiKeys[i];
            const health = this.keyHealth.get(i);
            
            if (keyData.status === 'working' && health?.status === 'healthy') {
                return {
                    key: keyData.key,
                    index: i,
                    usage: keyData.usage
                };
            }
        }
        
        // Si aucune clé fonctionnelle, prendre la moins utilisée
        const leastUsed = this.apiKeys.reduce((min, key, index) => 
            key.usage < min.key.usage ? { key, index } : min, 
            { key: this.apiKeys[0], index: 0 }
        );
        
        return {
            key: leastUsed.key.key,
            index: leastUsed.index,
            usage: leastUsed.key.usage
        };
    }
    
    getBestAvailableModel(keyIndex) {
        // Trouver les modèles fonctionnels pour cette clé
        const workingModels = [];
        
        for (const [model, health] of this.modelHealth.entries()) {
            if (health.status === 'healthy' && health.key === keyIndex) {
                workingModels.push(model);
            }
        }
        
        // Retourner un modèle fonctionnel ou le premier disponible
        if (workingModels.length > 0) {
            return workingModels[0];
        }
        
        return this.availableModels[0];
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
        const bestKey = this.getBestAvailableKey();
        this.currentApiKeyIndex = bestKey.index;
        this.apiKey = bestKey.key;
        this.apiUrl = this.apiUrls[this.currentApiUrlIndex];
        this.model = this.getBestAvailableModel(this.currentApiKeyIndex);
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;
        
        // Mettre à jour la configuration avec les meilleures ressources
        this.updateCurrentConfig();
        
        // Vérifier s'il y a des clés disponibles
        const availableKeys = this.apiKeys.filter(k => k.status === 'working').length;
        if (availableKeys === 0) {
            this.addMessage('assistant', '⚠️ Réinitialisation du système...');
            await this.initializeSystem();
            this.updateCurrentConfig();
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
            const startTime = Date.now();
            const response = await this.getAIResponseWithRetry(message);
            const responseTime = Date.now() - startTime;
            
            this.addMessage('assistant', response);
            this.conversation.push({ role: "user", content: message });
            this.conversation.push({ role: "assistant", content: response });
            this.saveConversation();
            
            this.lastRequestTime = Date.now();
            this.stats.successfulRequests++;
            
            // Mettre à jour les statistiques d'usage
            this.apiKeys[this.currentApiKeyIndex].usage++;
            this.apiKeys[this.currentApiKeyIndex].lastUsed = Date.now();
            this.stats.keyUsage[this.currentApiKeyIndex]++;
            this.stats.responseTimes.push(responseTime);
            
            // Trier les clés par charge pour la prochaine requête
            this.sortKeysByLoad();
            
            this.modelRetryCount = 0;
            
        } catch (error) {
            console.error('Erreur finale:', error);
            this.stats.failedRequests++;
            this.addMessage('assistant', this.getFriendlyErrorMessage(error));
            
            // Marquer la clé comme problématique
            this.keyHealth.set(this.currentApiKeyIndex, {
                status: 'unhealthy',
                lastTest: Date.now(),
                error: error.message
            });
            
        } finally {
            this.setLoading(false);
        }
    }
    
    async getAIResponseWithRetry(userMessage, retryCount = 0) {
        const maxRetries = 8; // Une tentative par clé maximum
        
        try {
            return await this.getAIResponse(userMessage);
        } catch (error) {
            console.log(`❌ Tentative ${retryCount + 1} échouée:`, error.message);
            
            if (retryCount < maxRetries) {
                // Rotation vers la prochaine meilleure clé
                await this.rotateToNextBestKey();
                
                const waitTime = 1000 + (retryCount * 500);
                this.updateStatus(`Tentative ${retryCount + 2}/${maxRetries + 1} (Clé ${this.currentApiKeyIndex+1})`);
                
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return await this.getAIResponseWithRetry(userMessage, retryCount + 1);
            }
            
            throw error;
        }
    }
    
    async rotateToNextBestKey() {
        // Marquer la clé actuelle comme temporairement problématique
        this.keyHealth.set(this.currentApiKeyIndex, {
            status: 'unhealthy',
            lastTest: Date.now(),
            error: 'Request failed'
        });
        
        // Passer à la prochaine clé dans l'ordre de priorité
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
        this.updateCurrentConfig();
        
        console.log(`🔄 Rotation vers clé: ${this.currentApiKeyIndex + 1}`);
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
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        
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
        const workingKeys = this.apiKeys.filter(k => k.status === 'working').length;
        const totalModels = this.availableModels.length;
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
            return `📊 Limite atteinte sur cette clé. ${workingKeys}/8 clés actives. Rotation automatique...`;
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            return `🔄 Modèle temporairement indisponible. Essai avec un autre parmi ${totalModels} modèles...`;
        } else if (errorMsg.includes('timeout') || errorMsg.includes('abort')) {
            return `⏰ Délai de réponse dépassé. ${workingKeys} clés disponibles. Nouvelle tentative...`;
        } else {
            return `⚠️ Problème technique momentané. Système de secours activé (${workingKeys} clés opérationnelles)...`;
        }
    }
    
    updateSystemStatus() {
        const workingKeys = this.apiKeys.filter(k => k.status === 'working').length;
        const totalModels = this.availableModels.length;
        
        if (workingKeys > 0) {
            this.updateStatus(`✅ ${workingKeys}/8 clés actives - ${totalModels} modèles disponibles`);
        } else {
            this.updateStatus("🔄 Recherche de clés actives...");
        }
    }
    
    updateModelIndicator() {
        const aiText = document.querySelector('.ai-indicator span');
        if (aiText) {
            const modelNames = {
                'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3 70B',
                'google/gemini-2.0-flash-exp:free': 'Gemini 2.0 Flash',
                'microsoft/wizardlm-2-8x22b:free': 'WizardLM 8x22B',
                'anthropic/claude-3.5-sonnet:free': 'Claude 3.5 Sonnet',
                'openai/gpt-4o-mini:free': 'GPT-4o Mini',
                'qwen/qwen-2.5-72b-instruct:free': 'Qwen 2.5 72B',
                'google/gemini-2.0-flash-thinking-exp:free': 'Gemini Thinking',
                'google/gemma-2-9b-it:free': 'Gemma 2 9B'
            };
            
            const modelName = modelNames[this.model] || this.model.split('/')[1]?.split(':')[0] || this.model;
            const keyUsage = this.apiKeys[this.currentApiKeyIndex].usage;
            aiText.textContent = `Elaraki GPT (Clé ${this.currentApiKeyIndex+1}, usage:${keyUsage}) - ${modelName}`;
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
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
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
            this.updateStatus(`Connexion... (Clé ${this.currentApiKeyIndex+1}, ${this.model.split('/')[1]?.split(':')[0] || this.model})`);
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
    
    // Méthode pour obtenir les statistiques du système
    getSystemStats() {
        const workingKeys = this.apiKeys.filter(k => k.status === 'working').length;
        const totalRequests = this.stats.totalRequests;
        const successRate = totalRequests > 0 ? (this.stats.successfulRequests / totalRequests * 100).toFixed(1) : 0;
        const avgResponseTime = this.stats.responseTimes.length > 0 
            ? (this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length).toFixed(0)
            : 0;
        
        return {
            workingKeys,
            totalModels: this.availableModels.length,
            totalRequests,
            successRate: `${successRate}%`,
            averageResponseTime: `${avgResponseTime}ms`,
            keyUsage: this.apiKeys.map((k, i) => `Clé ${i+1}: ${k.usage} req`)
        };
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.elarakiGPT = new ElarakiGPT();
});
