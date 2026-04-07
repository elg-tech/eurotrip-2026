import { useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { uploadImagem } from '../utils/upload';
import { X, Save, Camera, Loader2, Plane, MapPin, Ticket } from 'lucide-react';

export default function AddCityModal({ isOpen, onClose, onRefresh, destinos }: any) {
  const [aba, setAba] = useState<'cidade' | 'passeio' | 'transporte'>('cidade');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados dos formulários
  const [formCidade, setFormCidade] = useState({ 
    cidade: '', 
    data_viagem: '', 
    hospedagem: '', 
    foto_url: '', 
    checkin: '', 
    checkout: '' 
  });
  
  const [formPasseio, setFormPasseio] = useState({ 
    destino_id: '', 
    nome: '', 
    preco: '', 
    horario: '' 
  });
  
  const [formTransporte, setFormTransporte] = useState({ 
    tipo: '✈️ VOO', 
    data_viagem: '', 
    origem_destino: '', 
    horario: '', 
    detalhes: '' 
  });

  if (!isOpen) return null;

  // Lógica de Upload da Galeria (Otimizada para iPhone)
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Se o arquivo for maior que 10MB, avisar o usuário
    if (file.size > 10 * 1024 * 1024) {
      alert("A imagem é muito grande. Tente uma foto menor que 10MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImagem(file);
      setFormCidade({ ...formCidade, foto_url: url });
    } catch (err) {
      console.error(err);
      alert("Erro ao subir imagem da galeria. Verifique se o seu Preset no Cloudinary é 'Unsigned'.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSalvar(e: any) {
    e.preventDefault();
    setLoading(true);

    let tabela = '';
    let dados = {};

    if (aba === 'cidade') { 
      tabela = 'destinos'; 
      dados = formCidade; 
    } else if (aba === 'passeio') { 
      tabela = 'passeios'; 
      dados = { ...formPasseio, destino_id: parseInt(formPasseio.destino_id) }; 
    } else { 
      tabela = 'transportes'; 
      dados = formTransporte; 
    }

    const { error } = await supabase.from(tabela).insert([dados]);
    
    if (!error) {
      onRefresh();
      onClose();
    } else {
      alert("Erro ao salvar no banco: " + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0f172a] w-full max-h-[95vh] rounded-t-[40px] p-8 overflow-y-auto border-t border-white/10 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Adicionar</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* SELETOR DE ABA ESTILO IOS */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
          {(['cidade', 'passeio', 'transporte'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAba(t)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${aba === t ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSalvar} className="space-y-4 pb-10">
          
          {/* FORMULÁRIO CIDADE COM UPLOAD */}
          {aba === 'cidade' && (
            <>
              <div className="flex flex-col items-center gap-4 mb-4">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-44 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all relative overflow-hidden group"
                >
                  {formCidade.foto_url ? (
                    <img src={formCidade.foto_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
                  ) : null}
                  
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-sky-400" size={32} />
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Enviando...</span>
                    </div>
                  ) : (
                    <div className="z-10 flex flex-col items-center gap-2">
                      <div className="bg-white/5 p-4 rounded-full">
                        <Camera size={28} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Abrir Galeria</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Nome da Cidade (ex: Paris 🇫🇷)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500 transition-colors" onChange={e => setFormCidade({...formCidade, cidade: e.target.value})} required />
                <input type="text" placeholder="Data (ex: 04 a 06 de Junho)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500 transition-colors" onChange={e => setFormCidade({...formCidade, data_viagem: e.target.value})} />
                <textarea placeholder="Endereço da Hospedagem / Airbnb" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500 transition-colors h-24 resize-none" onChange={e => setFormCidade({...formCidade, hospedagem: e.target.value})} />
                
                <div className="flex gap-4">
                  <input type="text" placeholder="Check-in" className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormCidade({...formCidade, checkin: e.target.value})} />
                  <input type="text" placeholder="Check-out" className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormCidade({...formCidade, checkout: e.target.value})} />
                </div>
              </div>
            </>
          )}

          {/* FORMULÁRIO PASSEIO */}
          {aba === 'passeio' && (
            <>
              <div className="space-y-4">
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500" onChange={e => setFormPasseio({...formPasseio, destino_id: e.target.value})} required>
                  <option value="" className="bg-slate-900 text-slate-400">Selecione a Cidade...</option>
                  {destinos.map((d: any) => <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.cidade}</option>)}
                </select>
                <input type="text" placeholder="Nome do Passeio (ex: Museu do Louvre)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500" onChange={e => setFormPasseio({...formPasseio, nome: e.target.value})} required />
                <div className="flex gap-4">
                  <input type="text" placeholder="Preço (ex: € 20,00)" className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormPasseio({...formPasseio, preco: e.target.value})} />
                  <input type="text" placeholder="Horário (ex: 14:00)" className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormPasseio({...formPasseio, horario: e.target.value})} />
                </div>
              </div>
            </>
          )}

          {/* FORMULÁRIO TRANSPORTE */}
          {aba === 'transporte' && (
            <>
              <div className="space-y-4">
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormTransporte({...formTransporte, tipo: e.target.value})}>
                  <option value="✈️ VOO" className="bg-slate-900">✈️ VOO</option>
                  <option value="🚄 TREM" className="bg-slate-900">🚄 TREM</option>
                  <option value="🚘 CARRO" className="bg-slate-900">🚘 CARRO</option>
                  <option value="🚌 ÔNIBUS" className="bg-slate-900">🚌 ÔNIBUS</option>
                </select>
                <input type="text" placeholder="Data da Viagem (ex: 03/06 Quarta)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormTransporte({...formTransporte, data_viagem: e.target.value})} required />
                <input type="text" placeholder="Origem ➔ Destino" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormTransporte({...formTransporte, origem_destino: e.target.value})} required />
                <input type="text" placeholder="Horário" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormTransporte({...formTransporte, horario: e.target.value})} />
                <textarea placeholder="Detalhes (Nº do bilhete, Portão, etc.)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none h-24 resize-none" onChange={e => setFormTransporte({...formTransporte, detalhes: e.target.value})} />
              </div>
            </>
          )}

          {/* BOTÃO DE SALVAR */}
          <button 
            type="submit" 
            disabled={loading || uploading} 
            className="w-full bg-sky-500 hover:bg-sky-400 text-black font-black py-5 rounded-[24px] mt-6 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:scale-100 shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={20} strokeWidth={3} />
                <span className="tracking-tighter">SALVAR NO ROTEIRO</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}