import React, { useEffect, useState } from 'react';
import { Plot, Character, RoleArchetype } from '../types';
import { getPlot, addCharacterToPlot, addEpisodeToPlot } from '../services/storageService';
import { generateNextEpisode } from '../services/apiService';
import { Button, Card, Badge, Input, Select, TextArea } from '../components/UI';
import { UserPlus, Play, BookOpen, Clock, Globe, ArrowLeft, Loader2, Info } from 'lucide-react';

interface PlotDetailProps {
  id: string;
  onNavigate: (route: string, params?: any) => void;
}

const ROLES: RoleArchetype[] = ['Hero', 'Villain', 'Mentor', 'Sidekick', 'Rival', 'Antihero', 'Trickster', 'Narrator'];

export default function PlotDetail({ id, onNavigate }: PlotDetailProps) {
  const [plot, setPlot] = useState<Plot | undefined>(undefined);
  const [showAddChar, setShowAddChar] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // New Character State
  const [newChar, setNewChar] = useState<Partial<Character>>({
    name: '',
    role: 'Sidekick',
    traits: [],
    motivation: '',
    characterization: '',
    submittedBy: ''
  });

  useEffect(() => {
    setPlot(getPlot(id));
  }, [id]);

  const refreshPlot = () => {
      setPlot(getPlot(id));
  }

  const handleGenerateEpisode = async () => {
    if (!plot) return;
    setGenerating(true);
    try {
        const data = await generateNextEpisode(plot);
        addEpisodeToPlot(plot.id, {
            id: Math.random().toString(36).substr(2, 9),
            plotId: plot.id,
            episodeNumber: plot.episodes.length + 1,
            title: data.title,
            content: data.text,
            summary: data.summary,
            charactersUsed: data.charactersUsed,
            createdAt: Date.now()
        }, data.memory);
        refreshPlot();
    } catch (e) {
        alert("Failed to generate episode.");
    } finally {
        setGenerating(false);
    }
  };

  const handleAddCharacter = () => {
    if (!plot || !newChar.name || !newChar.submittedBy) return;
    
    try {
        addCharacterToPlot(plot.id, newChar as Character);
        setShowAddChar(false);
        refreshPlot();
        setNewChar({ name: '', role: 'Sidekick', traits: [], motivation: '', characterization: '', submittedBy: '' });
    } catch (e: any) {
        alert(e.message);
    }
  };

  if (!plot) return <div className="p-8 text-center">Plot not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => onNavigate('home')}>
        <ArrowLeft size={16} /> Back to Home
      </Button>

      {/* Header */}
      <div className="bg-gradient-to-r from-story-800 to-story-900 rounded-2xl p-8 mb-8 border border-story-700 relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex gap-2 mb-4">
                <Badge color="purple">{plot.genre}</Badge>
                <Badge color="blue">{plot.writingStyle}</Badge>
                <Badge color="green">{plot.episodes.length} Episodes</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{plot.title}</h1>
            <p className="text-lg text-gray-300 max-w-3xl">{plot.objective}</p>
            
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2"><Globe size={16}/> {plot.setting}</div>
                <div className="flex items-center gap-2"><Clock size={16}/> {new Date(plot.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><Info size={16}/> Director ID: {plot.directorId.substr(0,4)}...</div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-story-accent/5 skew-x-12 blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Episodes */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen /> Episodes</h2>
                <Button onClick={handleGenerateEpisode} disabled={generating}>
                    {generating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                    {generating ? 'Writing...' : 'Generate Next Episode'}
                </Button>
            </div>

            <div className="space-y-4">
                {[...plot.episodes].reverse().map(ep => (
                    <Card key={ep.id} className="hover:border-story-accent transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">Ep {ep.episodeNumber}: {ep.title}</h3>
                            <span className="text-xs text-gray-500">{new Date(ep.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mb-4 text-gray-400 text-sm">
                            <ul className="list-disc list-inside">
                                {ep.summary.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                                {ep.charactersUsed.slice(0, 5).map((c, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-story-700 border border-story-800 flex items-center justify-center text-[10px] text-white" title={c}>
                                        {c[0]}
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="!py-1 !px-3 text-sm" onClick={() => onNavigate('reader', { plotId: plot.id, episodeId: ep.id })}>
                                Read Episode
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        {/* Sidebar: Characters */}
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus size={20}/> Cast ({plot.characters.length}/10)</h2>
                {plot.characters.length < 10 && (
                    <Button variant="secondary" className="!px-2 !py-1 text-sm" onClick={() => setShowAddChar(!showAddChar)}>
                        {showAddChar ? 'Cancel' : 'Add'}
                    </Button>
                )}
            </div>

            {showAddChar && (
                <Card className="animate-in slide-in-from-top-2 border-story-accent">
                    <h3 className="font-bold mb-3">Join the Story</h3>
                    <Input placeholder="Character Name" value={newChar.name} onChange={(e:any) => setNewChar({...newChar, name: e.target.value})} />
                    <Select options={ROLES} value={newChar.role} onChange={(e:any) => setNewChar({...newChar, role: e.target.value})} />
                    <TextArea placeholder="Personality & Goals" value={newChar.characterization} onChange={(e:any) => setNewChar({...newChar, characterization: e.target.value})} />
                    <Input placeholder="Your Nickname" value={newChar.submittedBy} onChange={(e:any) => setNewChar({...newChar, submittedBy: e.target.value})} />
                    <Button className="w-full" onClick={handleAddCharacter}>Submit Character</Button>
                </Card>
            )}

            <div className="space-y-3">
                {plot.characters.map(char => (
                    <div key={char.id} className="bg-story-800 p-3 rounded-lg border border-story-700 flex flex-col gap-1">
                        <div className="flex justify-between">
                            <span className="font-bold">{char.name}</span>
                            <span className="text-xs px-2 py-0.5 bg-black/20 rounded text-gray-400">{char.role}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{char.motivation}</p>
                        <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
                            By: {char.submittedBy} {char.joinedAtEpisode > 1 ? `(Ep ${char.joinedAtEpisode})` : '(Orig)'}
                        </div>
                    </div>
                ))}
            </div>
            
            <Card>
                <h3 className="font-bold mb-2 text-sm text-gray-400">World Rules</h3>
                <p className="text-sm text-gray-300 italic">{plot.rules}</p>
            </Card>
        </div>

      </div>
    </div>
  );
}
