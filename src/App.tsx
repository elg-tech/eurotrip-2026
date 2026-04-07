import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase'; // Conexão real
import BottomNav from './components/BottomNav';
import Roteiro from './pages/Roteiro';
import Passeios from './pages/Passeios';
import Checklist from './pages/Checklist';
import Transportes from './pages/Transportes';
import AddCityModal from './components/AddCityModal';
import EditModal from './components/EditModal'; // O Editor Universal
import { Map, Navigation, Edit2, Trash2 } from 'lucide-react'; 

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'roteiro' | 'passeios' | 'checklist' | 'transportes'>('roteiro');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<any>(null);
  const [destinos, setDestinos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAddAberto, setModalAddAberto] = useState(false);
  
  // Controle de quem vai ser editado
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
    <div className="min-h-screen bg-[#020617] font-sans pb-32">
      {carregando ? (
        <div className="flex h-screen items-center justify-center text-sky-400">
          <p className="animate-pulse">Buscando seu roteiro na Europa...</p>
        </div>
      ) : (
        <>
          {abaAtiva === 'roteiro' && <Roteiro destinos={destinos} onSelectCity={setCidadeSelecionada} />}
          {/* O setDadosEdicao vai apenas para onde precisamos do Editor Universal */}
          {abaAtiva === 'passeios' && <Passeios destinos={destinos} setDadosEdicao={setDadosEdicao} />}
          {abaAtiva === 'transportes' && <Transportes setDadosEdicao={setDadosEdicao} />}
          {/* Checklist não precisa do Editor, pois ele se auto-gerencia */}
          {abaAtiva === 'checklist' && <Checklist />} 
        </>
      )}

      {/* Modal de Detalhes da Cidade */}
      {cidadeSelecionada && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/80 p-4 sm:p-6 animate-in fade-in">
          <div className="bg-[#0f172a] w-full max-h-[85vh] p-8 rounded-[40px] text-white border border-white/10 shadow-2xl overflow-y-auto relative">
            
            {/* Botões de Ação da Cidade (Editar e Apagar) */}
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => { setDadosEdicao({ item: cidadeSelecionada, tabela: 'destinos' }); setCidadeSelecionada(null); }}
                className="p-3 bg-white/10 rounded-full text-slate-300 hover:text-sky-400 transition"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => deletarCidade(cidadeSelecionada.id, cidadeSelecionada.cidade)}
                className="p-3 bg-white/10 rounded-full text-slate-300 hover:text-red-400 transition"
              >
                <Trash2 size={18} />
              </button>
              <button onClick={() => setCidadeSelecionada(null)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                ✕
              </button>
            </div>

            <p className="text-sky-400 font-bold text-sm mb-1 mt-2">{cidadeSelecionada.data_viagem}</p>
            <h2 className="text-3xl font-bold mb-6 pr-24">{cidadeSelecionada.cidade}</h2>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-6">
              <h3 className="text-sky-400 text-sm font-bold uppercase mb-2">🏠 Hospedagem</h3>
              <p className="text-sm text-slate-200 mb-4">{cidadeSelecionada.hospedagem || 'Ainda não definida'}</p>
              
              {cidadeSelecionada.hospedagem && (
                <div className="flex gap-2 mb-4">
                  <a href={`https://waze.com/ul?q=${encodeURIComponent(cidadeSelecionada.hospedagem)}`} target="_blank" rel="noreferrer" className="flex-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-black py-2.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 transition">
                    <Navigation size={14} /> WAZE
                  </a>
                  <a href={`http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(cidadeSelecionada.hospedagem)}`} target="_blank" rel="noreferrer" className="flex-1 bg-white/10 text-white hover:bg-white hover:text-black py-2.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 transition">
                    <Map size={14} /> MAPS
                  </a>
                </div>
              )}
              <div className="flex gap-4 pt-4 border-t border-white/10 text-xs font-semibold text-slate-400">
                <span>🟢 In: {cidadeSelecionada.checkin || '--:--'}</span>
                <span>🔴 Out: {cidadeSelecionada.checkout || '--:--'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Os Nossos Modais Globais */}
      <AddCityModal isOpen={modalAddAberto} onClose={() => setModalAddAberto(false)} onRefresh={() => window.location.reload()} destinos={destinos} />
      
      {/* Aqui adicionamos destinos={destinos} para o dropdown de cidades funcionar */}
      <EditModal isOpen={!!dadosEdicao} onClose={() => setDadosEdicao(null)} onRefresh={() => window.location.reload()} dadosEdicao={dadosEdicao} destinos={destinos} />

      <BottomNav abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} onAddClick={() => setModalAddAberto(true)} />
    </div>
  );
}