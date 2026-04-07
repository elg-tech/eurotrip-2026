import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { X, Save } from 'lucide-react';

// Adicionamos 'destinos' nas propriedades que o modal recebe
export default function EditModal({ isOpen, onClose, onRefresh, dadosEdicao, destinos }: any) {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dadosEdicao?.item) setForm(dadosEdicao.item);
  }, [dadosEdicao]);

  if (!isOpen || !dadosEdicao) return null;

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from(dadosEdicao.tabela).update(form).eq('id', form.id);
    
    if (error) {
      alert("Erro ao editar: " + error.message);
    } else {
      onRefresh(); 
      onClose();   
    }
    setLoading(false);
  }

  // Tiramos o destino_id daqui para ele aparecer na tela
  const camposBloqueados = ['id', 'created_at'];

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] w-full max-h-[90vh] rounded-t-[40px] p-8 overflow-y-auto border-t border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase">Editar {dadosEdicao.tabela}</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(form).map(key => {
            if (camposBloqueados.includes(key)) return null;

            // MÁGICA: Se o campo for a cidade do passeio, cria um dropdown!
            if (key === 'destino_id') {
              return (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-bold text-sky-400 uppercase">Cidade / Destino</label>
                  <select 
                    value={form[key] || ''} 
                    onChange={e => setForm({...form, [key]: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-sky-500 outline-none transition"
                  >
                    <option value="">Selecione a nova cidade...</option>
                    {destinos?.map((d: any) => (
                      <option key={d.id} value={d.id} className="bg-slate-900">{d.cidade}</option>
                    ))}
                  </select>
                </div>
              )
            }

            // Para todos os outros campos normais, cria um input de texto
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-bold text-sky-400 uppercase">{key.replace('_', ' ')}</label>
                <input 
                  type="text" 
                  value={form[key] || ''} 
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-sky-500 outline-none transition"
                />
              </div>
            )
          })}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-black font-black py-4 rounded-2xl mt-6 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'SALVANDO...' : <><Save size={20} /> SALVAR ALTERAÇÕES</>}
          </button>
        </form>
      </div>
    </div>
  );
}