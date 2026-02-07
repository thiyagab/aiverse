import React, { useEffect, useState } from 'react';
import { Plot } from '../types';
import { getPlots } from '../services/storageService';
import { Card, Button, Badge } from '../components/UI';
import { BookOpen, Users, Play, Plus, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: string, params?: any) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [plots, setPlots] = useState<Plot[]>([]);

  useEffect(() => {
    setPlots(getPlots());
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Recent Stories
          </h1>
          <p className="text-gray-400 mt-1">Explore universes created by the community</p>
        </div>
        <Button onClick={() => onNavigate('create')}>
          <Plus size={18} />
          Create New Plot
        </Button>
      </div>

      {plots.length === 0 ? (
        <div className="text-center py-20 bg-story-800/30 rounded-2xl border border-story-700 border-dashed">
          <Sparkles className="mx-auto text-story-accent mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">No Stories Yet</h2>
          <p className="text-gray-400">Be the first Director to launch a universe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map(plot => (
            <Card key={plot.id} className="hover:border-story-accent transition-colors group cursor-pointer h-full flex flex-col" >
                <div onClick={() => onNavigate('detail', { id: plot.id })} className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <Badge color="purple">{plot.genre}</Badge>
                        <span className="text-xs text-gray-500">{new Date(plot.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-story-accent transition-colors">{plot.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">{plot.objective}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-story-700 mt-auto">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{plot.characters.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{plot.episodes.length} Eps</span>
                  </div>
                </div>
                <Button variant="ghost" className="!px-2 !py-1" onClick={(e: any) => {
                    e.stopPropagation();
                    onNavigate('detail', { id: plot.id });
                }}>
                    Read <Play size={14} className="ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
