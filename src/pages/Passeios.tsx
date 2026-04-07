import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Clock, MapPin, Tag, Trash2, Edit2, Ticket, ExternalLink } from 'lucide-react';

export default function Passeios({ destinos, setDadosEdicao }: any) {
  const [passeios, setPasseios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function getPasseios() {
      const { data } = await supabase.from('passeios').select('*').order('id');
      if (data) setPasseios(data);
      setCarregando(false);
    }
    getPasseios();
  }, []);

  async function deletarPasseio(id: number, nome: string) {
    if (window.confirm(`Apagar o passeio "${nome}"?`)) {
      setPasseios(passeios.filter(p => p.id !== id));
      await supabase.from('passeios').delete().eq('id', id);
    }
  }

  // Função para pegar o nome da cidade baseada no ID
  const getNomeCidade = (id: number) => {
    const cidade = destinos.find((d: any) => d.id === id);
    return cidade ? cidade.cidade : 'Europa 🌍';
  };

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <header className="p-8 pt-12">
        <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Meus Ingressos</span>
        <h1 className="text-4xl font-black mt-1 text-white">PASSEIOS 🎟️</h1>
        <p className="text-slate-400 text-xs mt-2 italic">*Valores reais pesquisados para economia da família.</p>
      </header>

      <main className="px-6 space-y-6">
        {carregando ? (
          <div className="text-center py-10">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-500 font-bold">CARREGANDO TICKETS...</p>
          </div>
        ) : passeios.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Ticket className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Nenhum passeio na lista.</p>
          </div>
        ) : (
          passeios.map((passeio) => (
            <div key={passeio.id} className="relative bg-[#0f172a] border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden group">
              
              {/* Efeito Decorativo de Ticket (Picote lateral) */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#020617] rounded-full border border-white/10 shadow-inner"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#020617] rounded-full border border-white/10 shadow-inner"></div>

              {/* Botões de Ação */}
              <div className="absolute top-4 right-6 flex gap-2">
                <button 
                  onClick={() => setDadosEdicao({ item: passeio, tabela: 'passeios' })} 
                  className="p-2.5 bg-white/5 rounded-full text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-all active:scale-90"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => deletarPasseio(passeio.id, passeio.nome)} 
                  className="p-2.5 bg-white/5 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="px-2">
                <h2 className="text-xl font-black text-white mb-4 pr-16 leading-tight uppercase tracking-tight">
                  {passeio.nome}
                </h2>
                
                <div className="space-y-3">
                  {/* Localização */}
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} className="text-sky-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">{getNomeCidade(passeio.destino_id)}</span>
                  </div>

                  {/* Dica de Compra (Usando o campo horario) */}
                  <div className="flex items-start gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <ExternalLink size={16} className="text-sky-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-sky-500 uppercase">Dica de Compra</span>
                      <span className="text-xs text-slate-300 leading-tight">{passeio.horario || 'Verificar no local'}</span>
                    </div>
                  </div>

                  {/* Preço Real */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-white/10">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-green-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Preço Real</span>
                    </div>
                    <span className="text-xl font-black text-green-400 leading-none">
                      {passeio.preco || 'FREE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}