import React, { useState } from 'react';
import { 
  Sparkles, Send, Calendar, Target, Zap, 
  MessageSquare, Hash, ImageIcon, Clock,
  TrendingUp, Users, BarChart, Copy, RefreshCw
} from 'lucide-react';

const PostGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professionnel');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Generated, 3: Schedule

  const tones = [
    { value: 'professionnel', label: 'Professionnel', icon: '💼' },
    { value: 'inspirant', label: 'Inspirant', icon: '✨' },
    { value: 'familier', label: 'Familier', icon: '😊' },
    { value: 'humoristique', label: 'Humoristique', icon: '😄' },
    { value: 'expert', label: 'Expert', icon: '🎓' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' }
  ];

  const templates = [
    {
      id: 'leadership',
      title: 'Leadership & Management',
      prompt: 'Partagez 3 conseils de leadership que vous avez appris...',
      icon: '👑',
      category: 'Leadership'
    },
    {
      id: 'innovation',
      title: 'Innovation & Tech',
      prompt: 'Comment l\'IA transforme votre secteur d\'activité...',
      icon: '🚀',
      category: 'Innovation'
    },
    {
      id: 'career',
      title: 'Développement de carrière',
      prompt: 'Les compétences essentielles pour réussir en 2025...',
      icon: '📈',
      category: 'Carrière'
    },
    {
      id: 'networking',
      title: 'Networking & Relations',
      prompt: 'Comment construire un réseau professionnel authentique...',
      icon: '🤝',
      category: 'Réseau'
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulation de génération
    setTimeout(() => {
      const samplePost = `🚀 ${prompt}

Dans un monde en constante évolution, il est crucial de rester adaptable et d'embrasser le changement. Voici mes 3 conseils pour naviguer dans cette transformation :

1️⃣ Cultivez une mentalité de croissance
2️⃣ Investissez dans l'apprentissage continu  
3️⃣ Construisez des relations authentiques

Et vous, comment vous adaptez-vous aux changements de votre secteur ? 💭

#Leadership #Innovation #Croissance #LinkedIn`;
      
      setGeneratedPost(samplePost);
      setStep(2);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    // Toast notification would go here
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

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

      {/* Templates Quick Select */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Templates populaires</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setPrompt(template.prompt)}
              className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-700">
                    {template.title}
                  </p>
                  <p className="text-xs text-gray-500">{template.category}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Décrivez votre idée de post
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Partagez votre expérience sur le leadership, donnez des conseils sur l'innovation, racontez une success story..."
          className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Soyez spécifique pour un meilleur résultat</span>
          <span>{prompt.length}/500</span>
        </div>
      </div>

      {/* Tone Selection */}
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
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
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
            onClick={handleRegenerate}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Generated Post Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            HF
          </div>
          <div>
            <p className="font-semibold text-gray-900">Hugo Founder</p>
            <p className="text-sm text-gray-500">CEO chez LinkedBoost • 1ère</p>
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line text-gray-900 leading-relaxed">
            {generatedPost}
          </p>
        </div>

        {/* Post Metrics Preview */}
        <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-gray-600">
            <BarChart className="w-4 h-4" />
            <span className="text-sm">Reach estimé: 2.3K</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Engagement: +15%</span>
          </div>
        </div>
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
          onClick={() => setStep(3)}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Publier</span>
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
      
      {/* Quick Schedule Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Maintenant', time: 'now', icon: '⚡' },
          { label: 'Dans 1h', time: '1h', icon: '⏰' },
          { label: 'Demain 9h', time: 'tomorrow', icon: '🌅' },
          { label: 'Lundi 8h', time: 'monday', icon: '📅' }
        ].map((option) => (
          <button
            key={option.time}
            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <p className="font-medium text-sm">{option.label}</p>
          </button>
        ))}
      </div>

      {/* Custom Date/Time */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Programmation personnalisée</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Optimal Time Suggestion */}
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

      {/* Final Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
        >
          Retour
        </button>
        <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Programmer</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      {/* Progress Indicator */}
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

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default PostGenerator;