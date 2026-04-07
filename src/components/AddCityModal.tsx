import { useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { uploadImagem } from '../utils/upload';
import { X, Save, Camera, Loader2 } from 'lucide-react';

export default function AddCityModal({ isOpen, onClose, onRefresh, destinos }: any) {
  const [aba, setAba] = useState<'cidade' | 'passeio' | 'transporte'>('cidade');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const estadoInicialCidade = { cidade: '', data_viagem: '', hospedagem: '', foto_url: '', checkin: '', checkout: '' };
  const [formCidade, setFormCidade] = useState(estadoInicialCidade);
  const [formPasseio, setFormPasseio] = useState({ destino_id: '', nome: '', preco: '', horario: '' });
  const [formTransporte, setFormTransporte] = useState({ tipo: '✈️ VOO', data_viagem: '', origem: '', destino: '', horario: '', detalhes: '' });

  if (!isOpen) return null;

  const resetarCampos = () => {
    setFormCidade(estadoInicialCidade);
    setFormPasseio({ destino_id: '', nome: '', preco: '', horario: '' });
    setFormTransporte({ tipo: '✈️ VOO', data_viagem: '', origem: '', destino: '', horario: '', detalhes: '' });
  };

  const fecharModal = () => {
    resetarCampos();
    onClose();
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImagem(file);
      setFormCidade({ ...formCidade, foto_url: url });
    } catch (err) {
      alert("Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSalvar(e: any) {
    e.preventDefault();
    setLoading(true);

    let tabela = aba === 'cidade' ? 'destinos' : aba === 'passeio' ? 'passeios' : 'transportes';
    let dados: any = {};

    if (aba === 'cidade') {
        dados = { ...formCidade };
    } else if (aba === 'passeio') {
        dados = { ...formPasseio, destino_id: parseInt(formPasseio.destino_id) };
    } else {
        const { origem, destino, ...resto } = formTransporte;
        dados = { 
          ...resto, 
          origem_destino: `${origem.toUpperCase()} ➔ ${destino.toUpperCase()}` 
        };
    }

    const { error } = await supabase.from(tabela).insert([dados]);
    
    if (!error) {
      resetarCampos();
      onRefresh();
      onClose();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
    setLoading(false);
  }

  // Estilo corrigido para iPhone: min-width e display block evitam distorção
  const inputStyle = "w-full block bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-sky-500 transition-all min-h-[60px] text-base";
  const labelStyle = "block text-[11px] font-black text-sky-400 uppercase ml-2 mb-1.5 tracking-[0.1em]";

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] w-full max-h-[92vh] rounded-t-[40px] p-6 pb-12 overflow-y-auto border-t border-white/10 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Novo Registro</h2>
          <button onClick={fecharModal} className="p-2 bg-white/10 rounded-full text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
          {(['cidade', 'passeio', 'transporte'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAba(t)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${aba === t ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-500'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSalvar} className="space-y-6">
          {aba === 'cidade' && (
            <>
              <div className="flex flex-col items-center mb-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-white/10 rounded-[32px] relative overflow-hidden group flex items-center justify-center bg-white/5">
                  {formCidade.foto_url ? (
                    <img src={formCidade.foto_url} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Camera className="text-slate-500" size={32} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Foto da Cidade</span>
                    </div>
                  )}
                  {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-sky-400" size={32} /></div>}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Cidade 🇫🇷</label>
                  <input type="text" value={formCidade.cidade} placeholder="Ex: Paris" className={inputStyle} onChange={e => setFormCidade({...formCidade, cidade: e.target.value})} required />
                </div>
                
                <div>
                  <label className={labelStyle}>Data da Estadia</label>
                  <input type="date" value={formCidade.data_viagem} className={inputStyle} onChange={e => setFormCidade({...formCidade, data_viagem: e.target.value})} required />
                </div>

                <div>
                  <label className={labelStyle}>Endereço / Airbnb</label>
                  <textarea value={formCidade.hospedagem} placeholder="Link ou nome do hotel" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none h-24 resize-none focus:border-sky-500" onChange={e => setFormCidade({...formCidade, hospedagem: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Check-in</label>
                    <input type="time" value={formCidade.checkin} className={inputStyle} onChange={e => setFormCidade({...formCidade, checkin: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>Check-out</label>
                    <input type="time" value={formCidade.checkout} className={inputStyle} onChange={e => setFormCidade({...formCidade, checkout: e.target.value})} />
                  </div>
                </div>
              </div>
            </>
          )}

          {aba === 'passeio' && (
             <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Onde?</label>
                  <select value={formPasseio.destino_id} className={inputStyle} onChange={e => setFormPasseio({...formPasseio, destino_id: e.target.value})} required>
                    <option value="" className="bg-slate-900">Selecione a Cidade...</option>
                    {destinos.map((d: any) => <option key={d.id} value={d.id} className="text-black">{d.cidade}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Passeio</label>
                  <input type="text" value={formPasseio.nome} placeholder="Ex: Torre Eiffel" className={inputStyle} onChange={e => setFormPasseio({...formPasseio, nome: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Preço (€)</label>
                      <input type="text" value={formPasseio.preco} placeholder="0,00" className={inputStyle} onChange={e => setFormPasseio({...formPasseio, preco: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelStyle}>Hora</label>
                      <input type="time" value={formPasseio.horario} className={inputStyle} onChange={e => setFormPasseio({...formPasseio, horario: e.target.value})} />
                    </div>
                </div>
             </div>
          )}

          {aba === 'transporte' && (
            <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Tipo</label>
                  <select value={formTransporte.tipo} className={inputStyle} onChange={e => setFormTransporte({...formTransporte, tipo: e.target.value})}>
                    <option value="✈️ VOO">✈️ VOO</option>
                    <option value="🚄 TREM">🚄 TREM</option>
                    <option value="🚘 CARRO">🚘 CARRO</option>
                    <option value="🚌 ÔNIBUS">🚌 ÔNIBUS</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Data</label>
                  <input type="date" value={formTransporte.data_viagem} className={inputStyle} onChange={e => setFormTransporte({...formTransporte, data_viagem: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>De:</label>
                      <input type="text" value={formTransporte.origem} placeholder="Origem" className={inputStyle} onChange={e => setFormTransporte({...formTransporte, origem: e.target.value})} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Para:</label>
                      <input type="text" value={formTransporte.destino} placeholder="Destino" className={inputStyle} onChange={e => setFormTransporte({...formTransporte, destino: e.target.value})} required />
                    </div>
                </div>
                <div>
                  <label className={labelStyle}>Horário</label>
                  <input type="time" value={formTransporte.horario} className={inputStyle} onChange={e => setFormTransporte({...formTransporte, horario: e.target.value})} />
                </div>
                <div>
                  <label className={labelStyle}>Info Extra</label>
                  <textarea value={formTransporte.detalhes} placeholder="Voo, Assento..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white h-24 resize-none" onChange={e => setFormTransporte({...formTransporte, detalhes: e.target.value})} />
                </div>
            </div>
          )}

          <button type="submit" disabled={loading || uploading} className="w-full bg-sky-500 text-black font-black py-5 rounded-[24px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 shadow-lg shadow-sky-500/20">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /><span>SALVAR</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}