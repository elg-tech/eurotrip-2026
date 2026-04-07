import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export default function Checklist() {
  const [itens, setItens] = useState<any[]>([]);
  const [novoItem, setNovoItem] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchItens();
  }, []);

  async function fetchItens() {
    const { data } = await supabase.from('checklist').select('*').order('id');
    if (data) setItens(data);
    setCarregando(false);
  }

  async function adicionarItem(e: any) {
    e.preventDefault();
    if (!novoItem) return;
    
    const { data } = await supabase.from('checklist').insert([{ item: novoItem }]).select();
    if (data) setItens([...itens, data[0]]);
    setNovoItem('');
  }

  async function alternarStatus(id: number, concluido: boolean) {
    // Atualiza na tela na hora (otimista)
    setItens(itens.map(i => i.id === id ? { ...i, concluido: !concluido } : i));
    // Atualiza no banco
    await supabase.from('checklist').update({ concluido: !concluido }).eq('id', id);
  }

  async function apagarItem(id: number) {
    setItens(itens.filter(i => i.id !== id));
    await supabase.from('checklist').delete().eq('id', id);
  }

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <header className="p-8 pt-12">
        <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Organização</span>
        <h1 className="text-4xl font-black mt-1 text-white">CHECKLIST ✅</h1>
        <p className="text-slate-400 mt-2 text-sm">O que não podemos esquecer de levar.</p>
      </header>

      <main className="px-6 space-y-4">
        <form onSubmit={adicionarItem} className="flex gap-2 mb-6">
          <input 
            type="text" value={novoItem} onChange={(e) => setNovoItem(e.target.value)}
            placeholder="Ex: Passaportes, Casacos..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-sky-500 outline-none"
          />
          <button type="submit" className="bg-sky-500 text-black p-3 rounded-2xl active:scale-95 transition">
            <Plus size={24} strokeWidth={3} />
          </button>
        </form>

        {carregando ? <p className="text-sky-400 animate-pulse">Carregando lista...</p> : (
          <div className="space-y-2">
            {itens.map(item => (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.concluido ? 'bg-white/5 border-transparent opacity-50' : 'bg-slate-900 border-white/10'}`}>
                <button onClick={() => alternarStatus(item.id, item.concluido)} className="flex items-center gap-3 flex-1 text-left">
                  {item.concluido ? <CheckCircle2 className="text-sky-500" /> : <Circle className="text-slate-500" />}
                  <span className={`font-medium ${item.concluido ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.item}
                  </span>
                </button>
                <button onClick={() => apagarItem(item.id)} className="p-2 text-slate-600 hover:text-red-400 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}