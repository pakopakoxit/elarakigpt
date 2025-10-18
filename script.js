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
        this.statusText = document.getElementById('status-text');
        
        // Nouveaux éléments pour la sidebar
        this.conversationsSidebar = document.getElementById('conversations-sidebar');
        this.conversationsList = document.getElementById('conversations-list');
        this.newChatBtn = document.getElementById('new-chat-btn');
        this.toggleSidebar = document.getElementById('toggle-sidebar');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        // 🗝️ 8 CLÉS API
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
        
        // 🚀 TOUS LES MODÈLES DISPONIBLES (50+ modèles)
        this.availableModels = [
            // 🥇 MODÈLES PREMIUM ULTRA RAPIDES
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "microsoft/wizardlm-2-8x22b:free",
            "anthropic/claude-3.5-sonnet:free",
            "openai/gpt-4o-mini:free",
            "google/gemini-2.0-flash-thinking-exp:free",
            
            // 🥈 MODÈLES HAUTE PERFORMANCE
            "qwen/qwen-2.5-72b-instruct:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
            "cognitivecomputations/dolphin-2.9-llama-3-70b:free",
            "sophosympatheia/midnight-rose-70b:free",
            "neversleep/llama-3-lumimaid-70b:free",
            "alpindale/goliath-2-70b:free",
            "recursal/eagle-7b:free",
            
            // 🥉 MODÈLES STABLES
            "google/gemma-2-9b-it:free",
            "undi95/toppy-m-7b:free",
            "huggingfaceh4/zephyr-orpo-141b-aaaa:free",
            "meta-llama/llama-3-8b-instruct:free",
            "mistralai/mistral-8x7b-instruct:free",
            "nousresearch/nous-hermes-2-vision:free",
            
            // 💎 MODÈLES SPÉCIALISÉS
            "cognitivecomputations/dolphin-2.9.2-llama-3-70b:free",
            "sao10k/l3.1-70b-fp8:free",
            "sophosympatheia/midnight-rose-70b:free",
            "neversleep/llama-3-70b:free",
            "neversleep/llama-3.1-70b:free",
            "microsoft/wizardlm-2-7b:free",
            
            // 🔥 NOUVEAUX MODÈLES
            "qwen/qwen-2.5-7b-instruct:free",
            "qwen/qwen-2.5-14b-instruct:free",
            "qwen/qwen-2.5-32b-instruct:free",
            "google/gemini-2.0-pro-exp:free",
            "meta-llama/llama-3.2-1b-instruct:free",
            "meta-llama/llama-3.2-3b-instruct:free",
            
            // ⚡ MODÈLES LÉGERS
            "mistralai/mistral-8x22b-instruct:free",
            "mistralai/mistral-nemo:free",
            "microsoft/phi-3-medium-4k-instruct:free",
            "microsoft/phi-3-mini-4k-instruct:free",
            "google/codegemma-7b:free",
            
            // 🎯 MODÈLES ALTERNATIFS
            "deepseek/deepseek-llm-67b-chat:free",
            "deepseek/deepseek-coder-33b-instruct:free",
            "tiiuae/falcon-180b-chat:free",
            "allenai/olmo-7b:free",
            "allenai/olmo-13b:free",
            
            // 🛡️ MODÈLES DE SECOURS
            "huggingfaceh4/zephyr-7b-beta:free",
            "huggingfaceh4/zephyr-7b-alpha:free",
            "mistralai/mistral-7b-instruct-v0.3:free",
            "mistralai/mistral-7b-instruct-v0.2:free",
            "mistralai/mistral-7b-instruct-v0.1:free",
            
            // 🌟 DERNIERS MODÈLES
            "meta-llama/llama-3-70b-instruct:free",
            "meta-llama/llama-3-8b-instruct:free",
            "google/gemini-2.0-flash:free",
            "google/gemini-2.0-pro:free",
            "anthropic/claude-3-haiku:free",
            "anthropic/claude-3-opus:free"
        ];
        
        // Configuration initiale
        this.currentApiKeyIndex = 0;
        this.currentApiUrlIndex = 0;
        this.currentModelIndex = 0;
        
        this.apiKey = this.apiKeys[this.currentApiKeyIndex].key;
        this.apiUrl = this.apiUrls[this.currentApiUrlIndex];
        this.model = this.availableModels[this.currentModelIndex];
        
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // Augmenté à 2 secondes
        
        // Système de santé
        this.workingKeys = new Set(); // Clés qui fonctionnent
        this.failedKeys = new Set();  // Clés en échec
        this.failedModels = new Set(); // Modèles en échec
        
        // Gestion des conversations
        this.currentConversationId = null;
        this.conversations = new Map();
        this.conversationTitles = new Map();
        
        // Statistiques
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            keyUsage: new Array(this.apiKeys.length).fill(0),
            modelChanges: 0
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
                if (e.target === modal) {
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
        
        // Nouveaux écouteurs pour la sidebar
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.toggleSidebar.addEventListener('click', () => this.toggleSidebarVisibility());
        this.sidebarOverlay.addEventListener('click', () => this.hideSidebarMobile());
        this.mobileMenuBtn.addEventListener('click', () => this.showSidebarMobile());
        
        // Charger les conversations sauvegardées
        this.loadSavedConversations();
        
        // Créer une nouvelle conversation au démarrage
        this.startNewChat();
        
        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
        
        setTimeout(() => {
            this.quickActions.classList.add('show');
        }, 1000);
        
        // Initialisation ULTIME
        this.initializeUltimateSystem();
    }

    // 🚀 SYSTÈME ULTIME - TOUTES LES CLÉS AVEC LE MÊME MODÈLE
    async initializeUltimateSystem() {
        console.log('🚀 INITIALISATION ULTIME - Test de toutes les clés avec le même modèle...');
        this.updateStatus("Test de toutes les clés avec le modèle actuel...");
        
        // Réinitialiser les sets
        this.workingKeys.clear();
        this.failedKeys.clear();
        
        const currentModel = this.model;
        let workingCount = 0;
        
        // Tester TOUTES les clés avec le MÊME modèle
        for (let keyIndex = 0; keyIndex < this.apiKeys.length; keyIndex++) {
            const keyData = this.apiKeys[keyIndex];
            
            try {
                // 🔄 DÉLAI PLUS LONG ENTRE LES TESTS POUR ÉVITER LE 429
                if (keyIndex > 0) {
                    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secondes entre chaque test
                }
                
                const success = await this.testKeyWithModel(keyData.key, currentModel);
                
                if (success) {
                    this.workingKeys.add(keyIndex);
                    keyData.status = 'working';
                    workingCount++;
                    console.log(`✅ Clé ${keyIndex + 1} fonctionne avec ${currentModel}`);
                } else {
                    this.failedKeys.add(keyIndex);
                    keyData.status = 'failed';
                    console.log(`❌ Clé ${keyIndex + 1} ne fonctionne pas avec ${currentModel}`);
                }
            } catch (error) {
                this.failedKeys.add(keyIndex);
                keyData.status = 'failed';
                console.log(`❌ Clé ${keyIndex + 1} erreur: ${error.message}`);
            }
        }
        
        // Si AUCUNE clé ne fonctionne avec ce modèle → CHANGER DE MODÈLE
        if (workingCount === 0) {
            console.log(`🔄 Aucune clé ne fonctionne avec ${currentModel} → Changement de modèle`);
            this.failedModels.add(currentModel);
            await this.rotateToNextModel();
            return this.initializeUltimateSystem(); // Retester avec nouveau modèle
        }
        
        this.updateUltimateStatus();
        console.log(`🎯 ${workingCount}/8 clés fonctionnent avec ${this.model}`);
    }

    // 🧪 TEST D'UNE CLÉ AVEC LE MODÈLE ACTUEL
    async testKeyWithModel(apiKey, model) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Augmenté à 10 secondes
        
        try {
            const response = await fetch(this.apiUrls[0], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://elaraki.ac.ma',
                    'X-Title': 'Elaraki GPT'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: "Test de connexion" }],
                    max_tokens: 5,
                    temperature: 0.1
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.status === 429) {
                console.log('⚠️ Rate limit détecté, attente avant prochain test...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                return false;
            }
            
            return response.ok;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.log('⏰ Timeout lors du test de clé');
            }
            
            return false;
        }
    }

    // 🔄 ROTATION VERS LE PROCHAIN MODÈLE (TOUTES LES CLÉS CHANGENT)
    async rotateToNextModel() {
        this.currentModelIndex = (this.currentModelIndex + 1) % this.availableModels.length;
        this.model = this.availableModels[this.currentModelIndex];
        this.stats.modelChanges++;
        
        // Si on a essayé tous les modèles, réinitialiser les failed models
        if (this.currentModelIndex === 0) {
            this.failedModels.clear();
            console.log('🔄 Réinitialisation de tous les modèles');
        }
        
        // Éviter les modèles qui ont échoué
        let attempts = 0;
        while (this.failedModels.has(this.model) && attempts < this.availableModels.length) {
            this.currentModelIndex = (this.currentModelIndex + 1) % this.availableModels.length;
            this.model = this.availableModels[this.currentModelIndex];
            attempts++;
        }
        
        console.log(`🔄 Changement de modèle: ${this.model}`);
        this.updateStatus(`Changement de modèle: ${this.getModelDisplayName(this.model)}`);
        
        // Attendre un peu après le changement de modèle
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 🔑 ROTATION VERS LA PROCHAINE CLÉ FONCTIONNELLE
    rotateToNextKey() {
        const workingKeysArray = Array.from(this.workingKeys);
        
        if (workingKeysArray.length === 0) {
            console.log('⚠️ Aucune clé fonctionnelle');
            return false;
        }
        
        // Trouver l'index actuel dans les clés fonctionnelles
        const currentIndexInWorking = workingKeysArray.indexOf(this.currentApiKeyIndex);
        const nextIndexInWorking = (currentIndexInWorking + 1) % workingKeysArray.length;
        
        this.currentApiKeyIndex = workingKeysArray[nextIndexInWorking];
        this.apiKey = this.apiKeys[this.currentApiKeyIndex].key;
        
        console.log(`🔄 Rotation clé: ${this.currentApiKeyIndex + 1}`);
        return true;
    }

    // 🎯 TROUVER LA MEILLEURE CLÉ (moins utilisée)
    getBestKey() {
        const workingKeysArray = Array.from(this.workingKeys);
        
        if (workingKeysArray.length === 0) {
            return 0; // Fallback à la première clé
        }
        
        // Trouver la clé la moins utilisée
        let bestKeyIndex = workingKeysArray[0];
        let minUsage = this.apiKeys[bestKeyIndex].usage;
        
        for (const keyIndex of workingKeysArray) {
            if (this.apiKeys[keyIndex].usage < minUsage) {
                minUsage = this.apiKeys[keyIndex].usage;
                bestKeyIndex = keyIndex;
            }
        }
        
        return bestKeyIndex;
    }

    // 📊 MISE À JOUR DU STATUT ULTIME
    updateUltimateStatus() {
        const workingCount = this.workingKeys.size;
        const totalModels = this.availableModels.length;
        const currentModelName = this.getModelDisplayName(this.model);
        
        this.updateStatus(`✅ ${workingCount}/8 clés actives - ${currentModelName}`);
    }

    // 🚀 ENVOYER MESSAGE AVEC SYSTÈME ULTIME
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;
        
        this.saveCurrentConversation();
        
        // Vérifier s'il reste des clés fonctionnelles
        if (this.workingKeys.size === 0) {
            this.addMessage('assistant', '🔄 Aucune clé fonctionnelle - Recherche de nouveau modèle...');
            await this.initializeUltimateSystem();
            
            if (this.workingKeys.size === 0) {
                this.addMessage('assistant', '❌ Aucune combinaison clé/modèle fonctionnelle');
                return;
            }
        }
        
        // Choisir la meilleure clé (moins utilisée)
        this.currentApiKeyIndex = this.getBestKey();
        this.apiKey = this.apiKeys[this.currentApiKeyIndex].key;
        
        // Vérifier le délai entre les requêtes
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
            const response = await this.getAIResponseWithUltimateRetry(message);
            
            this.addMessage('assistant', response);
            this.conversation.push({ role: "user", content: message });
            this.conversation.push({ role: "assistant", content: response });
            
            this.saveCurrentConversation();
            this.lastRequestTime = Date.now();
            this.stats.successfulRequests++;
            
            // Mettre à jour l'usage de la clé
            this.apiKeys[this.currentApiKeyIndex].usage++;
            this.apiKeys[this.currentApiKeyIndex].lastUsed = Date.now();
            this.stats.keyUsage[this.currentApiKeyIndex]++;
            
            this.modelRetryCount = 0;
            
        } catch (error) {
            console.error('Erreur:', error);
            this.stats.failedRequests++;
            
            // Marquer la clé comme failed
            this.workingKeys.delete(this.currentApiKeyIndex);
            this.failedKeys.add(this.currentApiKeyIndex);
            this.apiKeys[this.currentApiKeyIndex].status = 'failed';
            
            this.addMessage('assistant', this.getFriendlyErrorMessage(error));
            this.updateUltimateStatus();
            
        } finally {
            this.setLoading(false);
        }
    }

    // 🔄 RÉESSAI ULTIME
    async getAIResponseWithUltimateRetry(userMessage, retryCount = 0) {
        const maxRetries = 3; // Réduit le nombre de tentatives
        
        try {
            return await this.getAIResponse(userMessage);
        } catch (error) {
            console.log(`❌ Tentative ${retryCount + 1} échouée:`, error.message);
            
            if (retryCount < maxRetries) {
                // Attendre avant de réessayer
                const waitTime = (retryCount + 1) * 2000; // 2, 4, 6 secondes
                console.log(`⏳ Attente de ${waitTime}ms avant réessai...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                
                // Essayer une autre clé d'abord
                if (this.rotateToNextKey()) {
                    console.log(`🔄 Essai avec clé ${this.currentApiKeyIndex + 1}`);
                    return await this.getAIResponseWithUltimateRetry(userMessage, retryCount + 1);
                } else {
                    // Si plus de clés, changer de modèle
                    console.log('🔄 Plus de clés fonctionnelles - Changement de modèle');
                    this.failedModels.add(this.model);
                    await this.rotateToNextModel();
                    await this.initializeUltimateSystem();
                    
                    if (this.workingKeys.size > 0) {
                        return await this.getAIResponseWithUltimateRetry(userMessage, retryCount + 1);
                    }
                }
            }
            
            throw error;
        }
    }

    // 🤖 RÉPONSE IA
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
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.status === 429) {
                throw new Error('Rate limit - Trop de requêtes');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
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

    // 🆘 MESSAGE D'ERREUR
    getFriendlyErrorMessage(error) {
        const errorMsg = error.message.toLowerCase();
        const workingCount = this.workingKeys.size;
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
            return `📊 Limite de requêtes atteinte. ${workingCount}/8 clés actives. Attente avant nouvel essai...`;
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            return `🔄 Modèle ${this.getModelDisplayName(this.model)} indisponible. Changement de modèle...`;
        } else if (errorMsg.includes('timeout') || errorMsg.includes('abort')) {
            return `⏰ Délai de connexion dépassé. ${workingCount} clés disponibles. Nouvel essai...`;
        } else if (errorMsg.includes('quota')) {
            return `💳 Quota dépassé sur cette clé. ${workingCount} clés restantes. Rotation...`;
        } else {
            return `⚠️ Problème technique: ${error.message}. ${workingCount} clés restantes. Adaptation...`;
        }
    }

    // 🏷️ NOM AFFICHABLE DU MODÈLE
    getModelDisplayName(model) {
        const modelNames = {
            'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3 70B',
            'google/gemini-2.0-flash-exp:free': 'Gemini 2.0 Flash',
            'microsoft/wizardlm-2-8x22b:free': 'WizardLM 8x22B',
            'anthropic/claude-3.5-sonnet:free': 'Claude 3.5 Sonnet',
            'openai/gpt-4o-mini:free': 'GPT-4o Mini',
            'google/gemini-2.0-flash-thinking-exp:free': 'Gemini Thinking',
            'qwen/qwen-2.5-72b-instruct:free': 'Qwen 2.5 72B',
            'meta-llama/llama-3.1-8b-instruct:free': 'Llama 3.1 8B',
            'mistralai/mistral-7b-instruct:free': 'Mistral 7B',
            'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free': 'Nous Hermes'
        };
        
        return modelNames[model] || model.split('/')[1]?.split(':')[0] || model;
    }

    // 💾 GESTION DES CONVERSATIONS
    startNewChat() {
        this.currentConversationId = 'chat_' + Date.now();
        this.conversation = [];
        this.chatMessages.innerHTML = '';
        this.showWelcomeSection();
        this.saveCurrentConversation();
        this.updateConversationsList();
        this.hideSidebarMobile();
    }
    
    saveCurrentConversation() {
        if (this.currentConversationId && this.conversation.length > 0) {
            if (!this.conversationTitles.has(this.currentConversationId)) {
                const firstUserMessage = this.conversation.find(msg => msg.role === 'user');
                const title = firstUserMessage 
                    ? this.generateConversationTitle(firstUserMessage.content)
                    : 'Nouvelle conversation';
                this.conversationTitles.set(this.currentConversationId, title);
            }
            
            this.conversations.set(this.currentConversationId, {
                messages: [...this.conversation],
                title: this.conversationTitles.get(this.currentConversationId),
                lastUpdated: Date.now(),
                model: this.model
            });
            
            this.saveToLocalStorage();
        }
    }
    
    generateConversationTitle(firstMessage) {
        const words = firstMessage.trim().split(/\s+/);
        let title = words.slice(0, 6).join(' ');
        if (words.length > 6) title += '...';
        return title || 'Nouvelle conversation';
    }
    
    loadConversation(conversationId) {
        const conversationData = this.conversations.get(conversationId);
        if (conversationData) {
            this.currentConversationId = conversationId;
            this.conversation = [...conversationData.messages];
            this.chatMessages.innerHTML = '';
            this.conversation.forEach(message => {
                this.addMessage(message.role, message.content);
            });
            this.hideWelcomeSection();
            this.scrollToBottom();
            this.updateConversationsList();
            this.hideSidebarMobile();
        }
    }
    
    loadSavedConversations() {
        const saved = localStorage.getItem('elarakiGPTConversations');
        const savedTitles = localStorage.getItem('elarakiGPTConversationTitles');
        
        if (saved) {
            try {
                this.conversations = new Map(Object.entries(JSON.parse(saved)));
            } catch (error) {
                this.conversations = new Map();
            }
        }
        
        if (savedTitles) {
            try {
                this.conversationTitles = new Map(Object.entries(JSON.parse(savedTitles)));
            } catch (error) {
                this.conversationTitles = new Map();
            }
        }
        
        this.updateConversationsList();
    }
    
    saveToLocalStorage() {
        const conversationsObj = Object.fromEntries(this.conversations);
        localStorage.setItem('elarakiGPTConversations', JSON.stringify(conversationsObj));
        const titlesObj = Object.fromEntries(this.conversationTitles);
        localStorage.setItem('elarakiGPTConversationTitles', JSON.stringify(titlesObj));
    }
    
    updateConversationsList() {
        if (!this.conversationsList) return;
        this.conversationsList.innerHTML = '';
        
        const today = new Date().setHours(0, 0, 0, 0);
        const lastWeek = today - (7 * 24 * 60 * 60 * 1000);
        const last30Days = today - (30 * 24 * 60 * 60 * 1000);
        
        const todayConversations = [];
        const weekConversations = [];
        const monthConversations = [];
        const olderConversations = [];
        
        const sortedConversations = Array.from(this.conversations.entries())
            .sort(([,a], [,b]) => b.lastUpdated - a.lastUpdated);
        
        sortedConversations.forEach(([id, data]) => {
            const conversationDay = new Date(data.lastUpdated).setHours(0, 0, 0, 0);
            if (conversationDay === today) todayConversations.push({id, data});
            else if (conversationDay >= lastWeek) weekConversations.push({id, data});
            else if (conversationDay >= last30Days) monthConversations.push({id, data});
            else olderConversations.push({id, data});
        });
        
        if (todayConversations.length > 0) this.createConversationGroup('Aujourd\'hui', todayConversations);
        if (weekConversations.length > 0) this.createConversationGroup('7 derniers jours', weekConversations);
        if (monthConversations.length > 0) this.createConversationGroup('30 derniers jours', monthConversations);
        if (olderConversations.length > 0) this.createConversationGroup('Plus ancien', olderConversations);
        
        if (sortedConversations.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                    <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
                    <p>Aucune conversation</p>
                </div>
            `;
            this.conversationsList.appendChild(emptyState);
        }
    }
    
    createConversationGroup(title, conversations) {
        const group = document.createElement('div');
        group.className = 'conversation-group';
        const groupTitle = document.createElement('div');
        groupTitle.className = 'conversation-group-title';
        groupTitle.textContent = title;
        group.appendChild(groupTitle);
        
        conversations.forEach(({id, data}) => {
            const conversationItem = document.createElement('div');
            conversationItem.className = `conversation-item ${id === this.currentConversationId ? 'active' : ''}`;
            conversationItem.innerHTML = `
                <div class="conversation-icon">💬</div>
                <div class="conversation-text">${data.title}</div>
            `;
            conversationItem.addEventListener('click', () => this.loadConversation(id));
            group.appendChild(conversationItem);
        });
        
        this.conversationsList.appendChild(group);
    }

    // 🎨 MÉTHODES UI
    updateStatus(status) {
        if (this.statusText) {
            this.statusText.textContent = status;
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
            const workingCount = this.workingKeys.size;
            const modelName = this.getModelDisplayName(this.model);
            this.updateStatus(`Connexion... (${workingCount}/8 clés - ${modelName})`);
        } else {
            this.loadingIndicator.classList.remove('show');
            this.updateModelIndicator();
        }
    }
    
    updateModelIndicator() {
        const aiText = document.querySelector('.ai-indicator span');
        if (aiText) {
            const workingCount = this.workingKeys.size;
            const modelName = this.getModelDisplayName(this.model);
            aiText.textContent = `Elaraki GPT (${workingCount}/8 clés) - ${modelName}`;
        }
    }

    // 📱 SIDEBAR
    toggleSidebarVisibility() {
        this.conversationsSidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-open', !this.conversationsSidebar.classList.contains('collapsed'));
        const icon = this.toggleSidebar.querySelector('svg path');
        if (this.conversationsSidebar.classList.contains('collapsed')) {
            icon.setAttribute('d', 'M5 12h14M12 5l7 7-7 7');
        } else {
            icon.setAttribute('d', 'M19 12H5M12 19l-7-7 7-7');
        }
    }
    
    showSidebarMobile() {
        this.conversationsSidebar.classList.add('mobile-open');
        this.sidebarOverlay.classList.add('mobile-open');
        document.body.style.overflow = 'hidden';
    }
    
    hideSidebarMobile() {
        this.conversationsSidebar.classList.remove('mobile-open');
        this.sidebarOverlay.classList.remove('mobile-open');
        document.body.style.overflow = 'auto';
    }
    
    handleResize() {
        if (window.innerWidth > 768) {
            this.conversationsSidebar.classList.remove('collapsed', 'mobile-open');
            this.sidebarOverlay.classList.remove('mobile-open');
            document.body.classList.add('sidebar-open');
            document.body.style.overflow = 'auto';
        } else {
            this.conversationsSidebar.classList.add('collapsed');
            document.body.classList.remove('sidebar-open');
        }
    }

    // 🎯 AUTRES MÉTHODES
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
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
        if (this.currentConversationId) {
            this.conversations.delete(this.currentConversationId);
            this.conversationTitles.delete(this.currentConversationId);
            this.saveToLocalStorage();
            this.updateConversationsList();
        }
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
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.elarakiGPT = new ElarakiGPT();
});
