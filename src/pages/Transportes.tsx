import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Edit2, Trash2 } from 'lucide-react';

export default function Transportes({ setDadosEdicao }: { setDadosEdicao: any }) {
  const [transportes, setTransportes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchTransportes() {
      const { data } = await supabase.from('transportes').select('*').order('id');
      if (data) setTransportes(data);
      setCarregando(false);
    }
    fetchTransportes();
  }, []);

  async function deletar(id: number) {
    if(window.confirm("Apagar esta viagem?")) {
      setTransportes(transportes.filter(t => t.id !== id));
      await supabase.from('transportes').delete().eq('id', id);
    }
  }

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <header className="p-8 pt-12">
        <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Logística</span>
        <h1 className="text-4xl font-black mt-1 text-white">VIAGENS 🚄</h1>
      </header>

      <main className="px-6 space-y-4">
        {carregando ? <p className="text-sky-400 animate-pulse text-center">Buscando rotas...</p> : 
          transportes.map((transp) => (
            <div key={transp.id} className="bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
              
              {/* Botões de Ação Ocultos (Aparecem ao tocar/passar mouse) */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => setDadosEdicao({ item: transp, tabela: 'transportes' })} className="p-2 bg-black/40 rounded-full text-slate-300 hover:text-sky-400 backdrop-blur-md">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => deletar(transp.id)} className="p-2 bg-black/40 rounded-full text-slate-300 hover:text-red-400 backdrop-blur-md">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="inline-block bg-sky-500 text-black font-bold text-[10px] px-3 py-1 rounded-lg mb-2">
                {transp.tipo}
              </div>
              <p className="text-sky-400 font-bold text-xs mb-1">{transp.data_viagem}</p>
              <h2 className="text-lg font-black text-white mb-2 pr-16">{transp.origem_destino}</h2>
              <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5 mt-3">
                <span className="text-slate-300 text-xs font-bold uppercase">🕒 {transp.horario}</span>
                <span className="text-slate-400 text-[11px] text-right w-1/2 leading-tight">{transp.detalhes}</span>
              </div>
            </div>
          ))
        }
      </main>
    </div>
  );
}