import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Clock, MapPin, Tag, Trash2, Edit2, Ticket, ExternalLink } from 'lucide-react';

export default function Passeios({ destinos, setDadosEdicao }: any) {
  const [passeios, setPasseios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Função de vibração para feedback tátil
  const vibrate = (type: 'light' | 'medium' | 'success' | 'error' = 'light') => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      switch (type) {
        case 'light': window.navigator.vibrate(10); break;
        case 'medium': window.navigator.vibrate(30); break;
        case 'success': window.navigator.vibrate([20, 50, 20]); break;
        case 'error': window.navigator.vibrate([100, 50, 100]); break;
      }
    }
  };

  useEffect(() => {
    async function getPasseios() {
      const { data } = await supabase.from('passeios').select('*').order('id');
      if (data) setPasseios(data);
      setCarregando(false);
    }
    getPasseios();
  }, []);

  async function deletarPasseio(id: number, nome: string) {
    vibrate('medium');
    if (window.confirm(`Apagar o passeio "${nome}"?`)) {
      setPasseios(passeios.filter(p => p.id !== id));
      const { error } = await supabase.from('passeios').delete().eq('id', id);
      if (!error) vibrate('success');
      else vibrate('error');
    }
  }

  const getNomeCidade = (id: number) => {
    const cidade = destinos.find((d: any) => d.id === id);
    return cidade ? cidade.cidade : 'Europa 🌍';
  };

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <header className="p-8 pt-12">
        <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Meus Ingressos</span>
        <h1 className="text-4xl font-black mt-1 text-white uppercase italic">Passeios 🎟️</h1>
        <p className="text-slate-400 text-[10px] mt-2 italic">*Valores reais pesquisados para a eurotrip.</p>
      </header>

      <main className="px-6 space-y-6">
        {carregando ? (
          <div className="text-center py-10">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-500 font-bold tracking-widest text-[10px]">CARREGANDO TICKETS...</p>
          </div>
        ) : (
          passeios.map((passeio) => (
            <div key={passeio.id} className="relative bg-[#0f172a] border border-white/10 rounded-[35px] p-6 shadow-2xl overflow-hidden group">
              
              {/* Picote de Ticket Lateral */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#020617] rounded-full border border-white/10"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#020617] rounded-full border border-white/10"></div>

              {/* Cabeçalho do Card - PR-20 evita que o título bata nos botões */}
              <div className="flex justify-between items-start mb-4 pr-20">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter">
                    {passeio.nome}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sky-400 mt-1">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{getNomeCidade(passeio.destino_id)}</span>
                  </div>
                </div>

                {/* HORÁRIO (Selo elegante) */}
                {passeio.horario && passeio.horario.includes(':') && (
                  <div className="bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20 text-sky-400 text-[10px] font-black flex items-center gap-1.5 shrink-0 z-10">
                    <Clock size={12} /> {passeio.horario}
                  </div>
                )}
              </div>

              {/* Botões de Ação reposicionados lateralmente (Vertical) para não encavalar */}
              <div className="absolute top-5 right-5 flex flex-col gap-2 z-20">
                <button 
                  onClick={() => { vibrate('light'); setDadosEdicao({ item: passeio, tabela: 'passeios' }); }} 
                  className="p-2.5 bg-white/10 rounded-full text-slate-300 backdrop-blur-md border border-white/10 hover:text-white transition-all active:scale-75 shadow-lg"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => deletarPasseio(passeio.id, passeio.nome)} 
                  className="p-2.5 bg-white/10 rounded-full text-slate-500 backdrop-blur-md border border-white/10 hover:text-red-400 transition-all active:scale-75 shadow-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {/* DICA DE COMPRA */}
                {passeio.dica_compra && (
                  <div className="bg-white/5 p-4 rounded-[24px] border border-white/5 flex items-start gap-3 animate-in zoom-in-95 duration-300">
                    <div className="bg-sky-500/20 p-2 rounded-xl text-sky-400">
                      <ExternalLink size={16} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Dica de Compra</span>
                      <span className="text-xs text-slate-200 leading-snug font-medium">
                        {passeio.dica_compra}
                      </span>
                    </div>
                  </div>
                )}

                {/* Seção de Preço Inteligente */}
                <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/10">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Tag size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Valor do Ingresso</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 tracking-tighter leading-none">
                      {passeio.preco?.includes('€') ? passeio.preco : `€ ${passeio.preco || '0,00'}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {passeios.length === 0 && !carregando && (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 mx-6">
            <Ticket className="mx-auto text-slate-800 mb-4" size={64} />
            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Nenhum ticket emitido</p>
          </div>
        )}
      </main>
    </div>
  );
}