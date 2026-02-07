import React, { useEffect, useState } from 'react';
import { Plot, Episode } from '../types';
import { getPlot } from '../services/storageService';
import { Button, Badge } from '../components/UI';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface EpisodeReaderProps {
  plotId: string;
  episodeId: string;
  onNavigate: (route: string, params?: any) => void;
}

export default function EpisodeReader({ plotId, episodeId, onNavigate }: EpisodeReaderProps) {
  const [plot, setPlot] = useState<Plot | undefined>(undefined);
  const [episode, setEpisode] = useState<Episode | undefined>(undefined);

  useEffect(() => {
    const p = getPlot(plotId);
    setPlot(p);
    if (p) {
        setEpisode(p.episodes.find(e => e.id === episodeId));
    }
  }, [plotId, episodeId]);

  if (!plot || !episode) return <div>Loading...</div>;

  const currentIndex = plot.episodes.findIndex(e => e.id === episode.id);
  const prevEp = plot.episodes[currentIndex - 1];
  const nextEp = plot.episodes[currentIndex + 1];

  return (
    <div className="min-h-screen bg-story-900 pb-20">
      {/* Navigation Bar */}
      <div className="sticky top-0 bg-story-900/95 backdrop-blur border-b border-story-700 p-4 flex justify-between items-center z-50">
        <Button variant="ghost" onClick={() => onNavigate('detail', { id: plotId })}>
            <X size={20} /> Close
        </Button>
        <div className="text-center">
            <h2 className="text-sm text-gray-400 uppercase tracking-widest">{plot.title}</h2>
            <h1 className="font-bold">Episode {episode.episodeNumber}</h1>
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center text-story-accent">
            {episode.title}
        </h1>
        
        <div className="flex justify-center gap-2 mb-12">
            {episode.charactersUsed.map(c => (
                <Badge key={c} color="blue">{c}</Badge>
            ))}
        </div>

        <div className="prose prose-invert prose-lg max-w-none leading-relaxed font-serif text-gray-200 whitespace-pre-line">
            {episode.content}
        </div>

        <div className="mt-16 pt-8 border-t border-story-700">
            <h3 className="text-lg font-bold mb-4 text-gray-400">Episode Summary</h3>
            <ul className="list-disc list-inside text-gray-500 space-y-2">
                {episode.summary.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-story-800 border-t border-story-700 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
            {prevEp ? (
                <Button variant="secondary" onClick={() => onNavigate('reader', { plotId: plot.id, episodeId: prevEp.id })}>
                    <ArrowLeft size={16} /> Prev
                </Button>
            ) : <div />}
            
            {nextEp ? (
                <Button variant="primary" onClick={() => onNavigate('reader', { plotId: plot.id, episodeId: nextEp.id })}>
                    Next Episode <ArrowRight size={16} />
                </Button>
            ) : (
                <span className="text-gray-500 text-sm">To be continued...</span>
            )}
        </div>
      </div>
    </div>
  );
}
