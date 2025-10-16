// Elaraki GPT - Application de Chat IA avec DeepSeek
// Design Extraordinaire avec les couleurs exactes d'El Araki International School

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
        
        // Configuration DeepSeek via OpenRouter avec alternatives
        this.apiKey = "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";
        this.apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        
        // Liste des modèles à essayer (par ordre de préférence)
        this.availableModels = [
            "deepseek/deepseek-chat-v3.1:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemma-2-9b-it:free",
            "microsoft/wizardlm-2-8x22b:free",
            "qwen/qwen-2.5-72b-instruct:free"
        ];
        
        this.currentModelIndex = 0;
        this.model = this.availableModels[this.currentModelIndex];
        
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
        
        // Fermer les modales en cliquant à l'extérieur
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
        
        // Redimensionnement automatique de la zone de texte
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        // Charger la conversation depuis le localStorage
        this.loadConversation();
        
        // Afficher les actions rapides après un délai
        setTimeout(() => {
            this.quickActions.classList.add('show');
        }, 1000);
        
        // Tester la connexion au démarrage
        this.testAllModels();
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;
        
        // Cacher la section de bienvenue au premier message
        if (this.conversation.length === 0) {
            this.hideWelcomeSection();
        }
        
        // Ajouter le message utilisateur à la conversation
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.autoResizeTextarea();
        
        // Afficher l'indicateur de chargement
        this.setLoading(true);
        
        try {
            // Obtenir la réponse de l'IA
            const response = await this.getAIResponse(message);
            
            // Ajouter le message de l'assistant à la conversation
            this.addMessage('assistant', response);
            
            // Sauvegarder la conversation dans le localStorage
            this.saveConversation();
        } catch (error) {
            console.error('Erreur:', error);
            
            // Essayer avec un autre modèle en cas d'erreur
            if (await this.tryNextModel()) {
                // Réessayer avec le nouveau modèle
                try {
                    const response = await this.getAIResponse(message);
                    this.addMessage('assistant', response);
                    this.saveConversation();
                } catch (retryError) {
                    this.addMessage('assistant', 'Désolé, je rencontre des difficultés techniques. Veuillez vérifier votre connexion ou réessayer plus tard.');
                }
            } else {
                this.addMessage('assistant', 'Désolé, service temporairement indisponible. Veuillez réessayer dans quelques instants.');
            }
        } finally {
            this.setLoading(false);
        }
    }
    
    async getAIResponse(userMessage) {
        // Ajouter le message utilisateur au tableau de conversation pour l'API
        this.conversation.push({ role: "user", content: userMessage });
        
        // Préparer la requête OpenRouter API
        const requestBody = {
            model: this.model,
            messages: this.conversation,
            max_tokens: 1000,
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
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(`Erreur API ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        // Vérifier la structure de la réponse OpenRouter
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Format de réponse API invalide');
        }
        
        // Extraire la réponse de l'assistant
        const assistantMessage = data.choices[0].message.content;
        
        // Ajouter le message de l'assistant au tableau de conversation
        this.conversation.push({ role: "assistant", content: assistantMessage });
        
        return assistantMessage;
    }
    
    async tryNextModel() {
        this.currentModelIndex++;
        
        if (this.currentModelIndex < this.availableModels.length) {
            this.model = this.availableModels[this.currentModelIndex];
            console.log(`Changement de modèle pour: ${this.model}`);
            
            // Tester le nouveau modèle
            try {
                await this.testCurrentModel();
                return true;
            } catch (error) {
                return this.tryNextModel(); // Essayer le modèle suivant
            }
        }
        
        return false; // Aucun modèle disponible
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
                messages: [
                    {
                        "role": "user",
                        "content": "Test"
                    }
                ],
                max_tokens: 10
            })
        });
        
        if (!testResponse.ok) {
            throw new Error(`Modèle ${this.model} non disponible`);
        }
        
        console.log(`✅ Modèle ${this.model} fonctionne`);
        return true;
    }
    
    async testAllModels() {
        console.log('🧪 Test de tous les modèles disponibles...');
        
        for (let i = 0; i < this.availableModels.length; i++) {
            this.model = this.availableModels[i];
            try {
                await this.testCurrentModel();
                this.currentModelIndex = i;
                console.log(`🎯 Modèle sélectionné: ${this.model}`);
                this.updateModelIndicator();
                break;
            } catch (error) {
                console.log(`❌ ${this.model} - ${error.message}`);
            }
        }
    }
    
    updateModelIndicator() {
        const aiText = document.querySelector('.ai-indicator span');
        if (aiText) {
            const modelName = this.model.split('/')[1]?.split(':')[0] || this.model;
            aiText.textContent = `Elaraki GPT (${modelName}) est prêt`;
        }
    }
    
    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Formater le contenu avec des sauts de ligne
        const formattedContent = content.replace(/\n/g, '<br>');
        messageContent.innerHTML = formattedContent;
        
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
            // Mettre à jour l'indicateur AI
            const aiDot = document.querySelector('.ai-dot');
            const aiText = document.querySelector('.ai-indicator span');
            if (aiDot) aiDot.style.background = '#dc2626';
            if (aiText) {
                const modelName = this.model.split('/')[1]?.split(':')[0] || this.model;
                aiText.textContent = `Elaraki GPT (${modelName}) réfléchit...`;
            }
        } else {
            this.loadingIndicator.classList.remove('show');
            // Remettre l'indicateur AI à normal
            const aiDot = document.querySelector('.ai-dot');
            const aiText = document.querySelector('.ai-indicator span');
            if (aiDot) aiDot.style.background = '#059669';
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
        
        // Effacer le localStorage
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
                
                // Cacher la section de bienvenue
                this.hideWelcomeSection();
                
                // Afficher la conversation sauvegardée
                this.conversation.forEach(message => {
                    this.addMessage(message.role, message.content);
                });
            } catch (error) {
                console.error('Erreur lors du chargement de la conversation:', error);
                this.clearConversation();
            }
        }
    }
}

// Initialiser l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const elarakiGPT = new ElarakiGPT();
    
    // Exposer l'instance globalement pour le débogage
    window.elarakiGPT = elarakiGPT;
});

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }
});
