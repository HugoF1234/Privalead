import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Calendar, Target, Zap, 
  MessageSquare, Hash, Clock, TrendingUp, 
  Users, BarChart, Copy, RefreshCw, Newspaper,
  Search, Filter, X
} from 'lucide-react';

const PostGenerator = ({ onPublish }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Generated, 3: Schedule
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professionnel');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [templates, setTemplates] = useState([]);
  const [publishTime, setPublishTime] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const tones = [
    { value: 'professionnel', label: 'Professionnel', icon: '💼', description: 'Ton expert et crédible' },
    { value: 'inspirant', label: 'Inspirant', icon: '✨', description: 'Motivant et positif' },
    { value: 'familier', label: 'Familier', icon: '😊', description: 'Conversationnel et accessible' },
    { value: 'expert', label: 'Expert', icon: '🎓', description: 'Technique et analytique' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖', description: 'Narratif et engageant' }
  ];

  useEffect(() => {
    loadTemplates();
    
    // Configurer la date par défaut (30 min dans le futur)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    setPublishTime(now.toISOString().slice(0, 16));
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/linkedin/templates', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const loadNews = async () => {
    try {
      setNewsLoading(true);
      const params = new URLSearchParams();
      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }
      params.append('language', 'fr');
      
      const response = await fetch(`/api/linkedin/news?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setNews(data.articles || []);
      }
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedArticle) return;
    
    setIsGenerating(true);
    
    try {
      const requestData = {
        prompt: prompt,
        tone: tone,
        selectedArticle: selectedArticle
      };
      
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedPost(data.content);
        setAnalysis(data.analysis);
        setStep(2);
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération du post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (publishNow = false) => {
    if (!generatedPost.trim()) return;
    
    setIsPublishing(true);
    
    try {
      const requestData = {
        content: generatedPost,
        publishNow: publishNow,
        scheduledTime: publishNow ? null : publishTime,
        metadata: {
          tone: tone,
          prompt: prompt,
          articleSource: selectedArticle
        }
      };
      
      const response = await fetch('/api/linkedin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        resetForm();
        if (onPublish) onPublish();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur publication:', error);
      alert('Erreur lors de la publication');
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPrompt('');
    setGeneratedPost('');
    setSelectedArticle(null);
    setAnalysis(null);
  };

  const selectArticle = (article) => {
    setSelectedArticle(article);
    setShowNewsModal(false);
    setPrompt(`Créer un post à partir de cet article: ${article.title}`);
  };

  const selectTemplate = (template) => {
    setPrompt(template.promptTemplate);
    setTone(template.tone || 'professionnel');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      alert('Post copié dans le presse-papiers !');
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  // Modal d'actualités
  const NewsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Actualités</h3>
            <button
              onClick={() => setShowNewsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des actualités..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && loadNews()}
              />
            </div>
            <button
              onClick={loadNews}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          {newsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Chargement des actualités...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((article, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => selectArticle(article)}
                >
                  {article.urlToImage && (
                    <img 
                      src={article.urlToImage} 
                      alt={article.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.source?.name}</span>
                    <span>{article.formatted_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Créer un post LinkedIn
        </h2>
        <p className="text-gray-600">
          Laissez l'IA vous aider à créer du contenu engageant
        </p>
      </div>

      {/* Article sélectionné */}
      {selectedArticle && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Article sélectionné</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{selectedArticle.title}</h4>
              <p className="text-sm text-gray-600">{selectedArticle.description?.substring(0, 100)}...</p>
            </div>
            <button
              onClick={() => setSelectedArticle(null)}
              className="p-1 hover:bg-blue-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Templates */}
      {templates.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Templates populaires</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{template.icon || '📝'}</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-700">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                </div>
                {template.tags && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input principal */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Décrivez votre idée de post
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Partagez votre expérience sur le leadership, donnez des conseils sur l'innovation..."
          className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Soyez spécifique pour un meilleur résultat</span>
          <div className="flex items-center gap-3">
            <span>{prompt.length}/500</span>
            <button
              onClick={() => {
                setShowNewsModal(true);
                loadNews();
              }}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              <Newspaper className="w-3 h-3" />
              <span>Actualités</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sélection du ton */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Ton du message</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tones.map((toneOption) => (
            <button
              key={toneOption.value}
              onClick={() => setTone(toneOption.value)}
              className={`p-3 rounded-xl border transition-all ${
                tone === toneOption.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <span className="text-lg">{toneOption.icon}</span>
                <p className="text-sm font-medium mt-1">{toneOption.label}</p>
                <p className="text-xs text-gray-500 mt-1">{toneOption.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bouton de génération */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 group"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Générer avec l'IA</span>
          </>
        )}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Post généré</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview du post */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div>
            <p className="font-semibold text-gray-900">Votre nom</p>
            <p className="text-sm text-gray-500">Votre titre • 1ère</p>
          </div>
        </div>
        
        <textarea
          value={generatedPost}
          onChange={(e) => setGeneratedPost(e.target.value)}
          className="w-full min-h-32 border-0 focus:outline-none resize-none text-gray-900 leading-relaxed"
          placeholder="Votre post généré apparaîtra ici..."
        />

        {/* Analyse de performance */}
        {analysis && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <BarChart className="w-4 h-4" />
                  <span>Score: {analysis.score}/100</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Reach estimé: {analysis.estimatedReach}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Engagement: {analysis.estimatedEngagement}</span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                analysis.level === 'High' ? 'bg-green-100 text-green-700' :
                analysis.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {analysis.level}
              </span>
            </div>
            
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Suggestions d'amélioration</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
        >
          Modifier
        </button>
        <button
          onClick={() => handlePublish(true)}
          disabled={isPublishing}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isPublishing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Publier maintenant</span>
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Programmer</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Programmer la publication</h2>
      
      {/* Options rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Dans 1h', hours: 1, icon: '⏰' },
          { label: 'Demain 9h', hours: 24, icon: '🌅' },
          { label: 'Lundi 8h', hours: 48, icon: '📅' },
          { label: 'Personnalisé', hours: 0, icon: '⚙️' }
        ].map((option) => (
          <button
            key={option.label}
            onClick={() => {
              if (option.hours > 0) {
                const time = new Date();
                time.setHours(time.getHours() + option.hours);
                setPublishTime(time.toISOString().slice(0, 16));
              }
            }}
            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <p className="font-medium text-sm">{option.label}</p>
          </button>
        ))}
      </div>

      {/* Programmation personnalisée */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Programmation personnalisée</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date et heure</label>
            <input
              type="datetime-local"
              value={publishTime}
              onChange={(e) => setPublishTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Suggestion IA */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Suggestion IA</span>
        </div>
        <p className="text-blue-800 text-sm">
          Pour votre audience, le meilleur moment pour publier est <strong>mardi à 9h</strong> 
          (engagement +34% par rapport à la moyenne)
        </p>
      </div>

      {/* Actions finales */}
      <div className="flex space-x-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
        >
          Retour
        </button>
        <button 
          onClick={() => handlePublish(false)}
          disabled={isPublishing}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isPublishing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span>Programmer</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      {/* Indicateur de progression */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step >= stepNum 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-8 h-1 rounded transition-all ${
                step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Contenu des étapes */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Modal actualités */}
      {showNewsModal && <NewsModal />}
    </div>
  );
};

export default PostGenerator;
