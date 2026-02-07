import React, { useState } from 'react';
import Home from './pages/Home';
import CreatePlot from './pages/CreatePlot';
import PlotDetail from './pages/PlotDetail';
import EpisodeReader from './pages/EpisodeReader';
import { Book } from 'lucide-react';

type Route = 'home' | 'create' | 'detail' | 'reader';

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [params, setParams] = useState<any>({});

  const navigate = (newRoute: string, newParams?: any) => {
    window.scrollTo(0, 0);
    setRoute(newRoute as Route);
    if (newParams) setParams(newParams);
  };

  const renderPage = () => {
    switch (route) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'create':
        return <CreatePlot onNavigate={navigate} />;
      case 'detail':
        return <PlotDetail id={params.id} onNavigate={navigate} />;
      case 'reader':
        return <EpisodeReader plotId={params.plotId} episodeId={params.episodeId} onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-story-900 text-white font-sans selection:bg-story-accent selection:text-white">
      {route !== 'reader' && (
        <header className="border-b border-story-700 bg-story-900/80 backdrop-blur sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div 
                    className="flex items-center gap-2 font-bold text-xl cursor-pointer hover:text-story-accent transition-colors"
                    onClick={() => navigate('home')}
                >
                    <div className="w-8 h-8 bg-gradient-to-tr from-story-accent to-blue-500 rounded-lg flex items-center justify-center">
                        <Book size={18} className="text-white" />
                    </div>
                    <span>StoryVerse</span>
                </div>
                
                <div className="text-sm text-gray-500">
                    Collaborative AI Storytelling
                </div>
            </div>
        </header>
      )}

      <main>
        {renderPage()}
      </main>
      
      {route !== 'reader' && (
        <footer className="border-t border-story-700 mt-20 py-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} StoryVerse. Copyrighted by Codesapiens.</p>
        </footer>
      )}
    </div>
  );
}
