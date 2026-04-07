import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase'; 
import BottomNav from './components/BottomNav';
import Roteiro from './pages/Roteiro';
import Passeios from './pages/Passeios';
import Checklist from './pages/Checklist';
import Transportes from './pages/Transportes';
import AddCityModal from './components/AddCityModal';
import EditModal from './components/EditModal'; 
import { Map, Navigation, Edit2, Trash2, X } from 'lucide-react'; 

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'roteiro' | 'passeios' | 'checklist' | 'transportes'>('roteiro');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<any>(null);
  const [destinos, setDestinos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAddAberto, setModalAddAberto] = useState(false);
  
  // Controle de edição universal
  const [dadosEdicao, setDadosEdicao] = useState<{item: any, tabela: string} | null>(null);

  useEffect(() => {
    async function getDestinos() {
      const { data } = await supabase.from('destinos').select('*').order('id');
      if (data) setDestinos(data);
      setCarregando(false);
    }
    getDestinos();
  }, []);

  // Apagar cidade do roteiro
  async function deletarCidade(id: number, nome: string) {
    if(window.confirm(`Tem certeza que deseja apagar a cidade ${nome}?`)) {
      await supabase.from('destinos').delete().eq('id', id);
      window.location.reload();
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] font-sans pb-32 selection:bg-sky-500/30">
      {carregando ? (
        <div className="flex flex-col h-screen items-center justify-center text-sky-400">
          <div className="animate-spin w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full mb-4"></div>
          <p className="animate-pulse font-bold tracking-widest text-xs uppercase">Buscando seu roteiro na Europa...</p>
        </div>
      ) : (
        <>
          {abaAtiva === 'roteiro' && <Roteiro destinos={destinos} onSelectCity={setCidadeSelecionada} />}
          {abaAtiva === 'passeios' && <Passeios destinos={destinos} setDadosEdicao={setDadosEdicao} />}
          {abaAtiva === 'transportes' && <Transportes setDadosEdicao={setDadosEdicao} />}
          {abaAtiva === 'checklist' && <Checklist />} 
        </>
      )}

      {/* Modal de Detalhes da Cidade (O que abre ao clicar na cidade) */}
      {cidadeSelecionada && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] w-full max-h-[90vh] p-8 rounded-[40px] text-white border border-white/10 shadow-2xl overflow-y-auto relative animate-in slide-in-from-bottom duration-500">
            
            {/* Botões de Ação Superiores */}
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => { setDadosEdicao({ item: cidadeSelecionada, tabela: 'destinos' }); setCidadeSelecionada(null); }}
                className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-sky-400 transition-all active:scale-90"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => deletarCidade(cidadeSelecionada.id, cidadeSelecionada.cidade)}
                className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-red-400 transition-all active:scale-90"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => setCidadeSelecionada(null)} 
                className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[10px] uppercase tracking-widest mb-2 mt-2">
              {cidadeSelecionada.data_viagem || 'Data a definir'}
            </span>
            <h2 className="text-4xl font-black mb-8 pr-24 leading-tight uppercase tracking-tighter">
              {cidadeSelecionada.cidade}
            </h2>

            {/* Seção de Hospedagem */}
            <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 mb-6 shadow-inner">
              <h3 className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
                Hospedagem & Localização
              </h3>
              
              <p className="text-lg font-medium text-slate-100 mb-6 leading-snug">
                {cidadeSelecionada.hospedagem || 'Endereço ainda não cadastrado'}
              </p>
              
              {cidadeSelecionada.hospedagem && (
                <div className="flex gap-3 mb-6">
                  {/* WAZE CORRIGIDO: Agora com navigate=yes */}
                  <a 
                    href={`https://waze.com/ul?q=${encodeURIComponent(cidadeSelecionada.hospedagem)}&navigate=yes`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 bg-[#33ccff]/20 text-[#33ccff] hover:bg-[#33ccff] hover:text-black py-4 rounded-2xl text-center font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Navigation size={16} fill="currentColor" /> WAZE
                  </a>

                  {/* GOOGLE MAPS CORRIGIDO: Formato oficial de busca/rota */}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cidadeSelecionada.hospedagem)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 bg-white/5 text-white hover:bg-white hover:text-black py-4 rounded-2xl text-center font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all border border-white/10 active:scale-95"
                  >
                    <Map size={16} /> GOOGLE MAPS
                  </a>
                </div>
              )}

              {/* Check-in e Check-out */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">🟢 Check-in</span>
                  <span className="text-sm font-bold text-slate-200">{cidadeSelecionada.checkin || '--:--'}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">🔴 Check-out</span>
                  <span className="text-sm font-bold text-slate-200">{cidadeSelecionada.checkout || '--:--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais Globais de Sistema */}
      <AddCityModal 
        isOpen={modalAddAberto} 
        onClose={() => setModalAddAberto(false)} 
        onRefresh={() => window.location.reload()} 
        destinos={destinos} 
      />
      
      <EditModal 
        isOpen={!!dadosEdicao} 
        onClose={() => setDadosEdicao(null)} 
        onRefresh={() => window.location.reload()} 
        dadosEdicao={dadosEdicao} 
        destinos={destinos} 
      />

      {/* Navegação Fixa Inferior */}
      <BottomNav 
        abaAtiva={abaAtiva} 
        setAbaAtiva={setAbaAtiva} 
        onAddClick={() => setModalAddAberto(true)} 
      />
    </div>
  );
}