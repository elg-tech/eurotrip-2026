import { useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { uploadImagem } from '../utils/upload';
import { X, Save, Camera, Loader2, Info, MapPin, Euro, Clock } from 'lucide-react';

export default function AddCityModal({ isOpen, onClose, onRefresh, destinos }: any) {
  const [aba, setAba] = useState<'cidade' | 'passeio' | 'transporte'>('cidade');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNÇÃO DE VIBRAÇÃO (HAPTIC FEEDBACK) ---
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

  const estadoInicialCidade = { cidade: '', data_viagem: '', hospedagem: '', foto_url: '', checkin: '', checkout: '' };
  const [formCidade, setFormCidade] = useState(estadoInicialCidade);
  const [formPasseio, setFormPasseio] = useState({ destino_id: '', nome: '', preco: '', horario: '', dica_compra: '' });
  const [formTransporte, setFormTransporte] = useState({ tipo: '✈️ VOO', data_viagem: '', origem: '', destino: '', horario: '', detalhes: '' });

  if (!isOpen) return null;

  const resetarCampos = () => {
    setFormCidade(estadoInicialCidade);
    setFormPasseio({ destino_id: '', nome: '', preco: '', horario: '', dica_compra: '' });
    setFormTransporte({ tipo: '✈️ VOO', data_viagem: '', origem: '', destino: '', horario: '', detalhes: '' });
    setMostrarDica(false);
  };

  const fecharModal = () => {
    vibrate('medium');
    resetarCampos();
    onClose();
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    vibrate('light');
    setUploading(true);
    try {
      const url = await uploadImagem(file);
      setFormCidade({ ...formCidade, foto_url: url });
      vibrate('success');
    } catch (err) {
      vibrate('error');
      alert("Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSalvar(e: any) {
    e.preventDefault();
    vibrate('medium');
    setLoading(true);

    let tabela = aba === 'cidade' ? 'destinos' : aba === 'passeio' ? 'passeios' : 'transportes';
    let dados: any = {};

    if (aba === 'cidade') {
      dados = { ...formCidade };
    } else if (aba === 'passeio') {
      dados = { ...formPasseio, destino_id: parseInt(formPasseio.destino_id) };
      if (!mostrarDica) dados.dica_compra = ''; 
    } else {
      const { origem, destino, ...resto } = formTransporte;
      dados = {
        ...resto,
        origem_destino: `${origem.toUpperCase()} ➔ ${destino.toUpperCase()}`
      };
    }

    const { error } = await supabase.from(tabela).insert([dados]);

    if (!error) {
      vibrate('success');
      resetarCampos();
      onRefresh();
      onClose();
    } else {
      vibrate('error');
      alert("Erro ao salvar: " + error.message);
    }
    setLoading(false);
  }

  const inputStyle = "w-full block appearance-none bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-sky-500 focus:bg-white/10 transition-all min-h-[58px] text-[16px] placeholder:text-slate-600";
  const labelStyle = "flex items-center gap-2 text-[10px] font-black text-sky-400 uppercase ml-2 mb-2 tracking-[0.15em]";

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0b1222] w-full max-h-[94vh] rounded-t-[45px] p-6 pb-12 overflow-y-auto border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500">

        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Novo Registro</h2>
          <button onClick={fecharModal} className="p-3 bg-white/5 rounded-full text-white active:scale-75 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Abas com Vibração */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
          {(['cidade', 'passeio', 'transporte'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { vibrate('light'); setAba(t); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${aba === t ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30 scale-100' : 'text-slate-500 scale-95'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSalvar} className="space-y-6">

          {aba === 'cidade' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button type="button" onClick={() => { vibrate('light'); fileInputRef.current?.click(); }} className="w-full h-52 border-2 border-dashed border-white/10 rounded-[35px] relative overflow-hidden flex items-center justify-center bg-white/5 group active:scale-[0.98] transition-all">
                  {formCidade.foto_url ? (
                    <img src={formCidade.foto_url} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-sky-500/10 p-4 rounded-full text-sky-400"><Camera size={32} /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto da Cidade</span>
                    </div>
                  )}
                  {uploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><Loader2 className="animate-spin text-sky-400" size={40} /></div>}
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelStyle}><MapPin size={12} /> Nome da Cidade</label>
                  <input type="text" value={formCidade.cidade} placeholder="Ex: Roma 🇮🇹" className={inputStyle} onChange={e => setFormCidade({ ...formCidade, cidade: e.target.value })} required />
                </div>
                <div>
                  <label className={labelStyle}><Info size={12} /> Data da Viagem</label>
                  <input type="date" value={formCidade.data_viagem} className={inputStyle} onChange={e => setFormCidade({ ...formCidade, data_viagem: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}><Clock size={12} /> Check-in</label>
                    <input type="time" value={formCidade.checkin} className={inputStyle} onChange={e => setFormCidade({ ...formCidade, checkin: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelStyle}><Clock size={12} /> Check-out</label>
                    <input type="time" value={formCidade.checkout} className={inputStyle} onChange={e => setFormCidade({ ...formCidade, checkout: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}><MapPin size={12} /> Hospedagem (Link GPS)</label>
                  <textarea value={formCidade.hospedagem} placeholder="Cole o link do Waze ou Google Maps aqui..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none h-24 resize-none focus:border-sky-500 text-[16px]" onChange={e => setFormCidade({ ...formCidade, hospedagem: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {aba === 'passeio' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label className={labelStyle}>Onde será o passeio?</label>
                <select value={formPasseio.destino_id} className={inputStyle} onChange={e => setFormPasseio({ ...formPasseio, destino_id: e.target.value })} required>
                  <option value="" className="bg-slate-900">Selecione uma cidade...</option>
                  {destinos.map((d: any) => <option key={d.id} value={d.id} className="text-black">{d.cidade}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Nome do Evento</label>
                <input type="text" value={formPasseio.nome} placeholder="Ex: Coliseu" className={inputStyle} onChange={e => setFormPasseio({ ...formPasseio, nome: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}><Euro size={12} /> Valor</label>
                  <input type="text" value={formPasseio.preco} placeholder="€ 0,00" className={inputStyle} onChange={e => setFormPasseio({ ...formPasseio, preco: e.target.value })} />
                </div>
                <div>
                  <label className={labelStyle}><Clock size={12} /> Horário</label>
                  <input type="time" value={formPasseio.horario} className={inputStyle} onChange={e => setFormPasseio({ ...formPasseio, horario: e.target.value })} />
                </div>
              </div>

              {/* Toggle com Vibração */}
              <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 flex items-center justify-between transition-all active:bg-white/10" 
                   onClick={() => { vibrate('light'); setMostrarDica(!mostrarDica); }}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${mostrarDica ? 'bg-sky-500 text-black' : 'bg-white/5 text-slate-500'}`}><Info size={18} /></div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">Dica de compra</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${mostrarDica ? 'bg-sky-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${mostrarDica ? 'left-7' : 'left-1'}`} />
                </div>
              </div>

              {mostrarDica && (
                <div className="animate-in zoom-in-95 duration-300">
                  <label className={labelStyle}>Link ou Instrução</label>
                  <input type="text" value={formPasseio.dica_compra} placeholder="Onde comprar?" className={inputStyle} onChange={e => setFormPasseio({ ...formPasseio, dica_compra: e.target.value })} />
                </div>
              )}
            </div>
          )}

          {aba === 'transporte' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label className={labelStyle}>Meio de Transporte</label>
                <select value={formTransporte.tipo} className={inputStyle} onChange={e => setFormTransporte({ ...formTransporte, tipo: e.target.value })}>
                  <option value="✈️ VOO">✈️ VOO</option>
                  <option value="🚄 TREM">🚄 TREM</option>
                  <option value="🚘 CARRO">🚘 CARRO</option>
                  <option value="🚌 ÔNIBUS">🚌 ÔNIBUS</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Data Partida</label>
                <input type="date" value={formTransporte.data_viagem} className={inputStyle} onChange={e => setFormTransporte({ ...formTransporte, data_viagem: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Origem</label>
                  <input type="text" value={formTransporte.origem} placeholder="De?" className={inputStyle} onChange={e => setFormTransporte({ ...formTransporte, origem: e.target.value })} required />
                </div>
                <div>
                  <label className={labelStyle}>Destino</label>
                  <input type="text" value={formTransporte.destino} placeholder="Para?" className={inputStyle} onChange={e => setFormTransporte({ ...formTransporte, destino: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Saída</label>
                <input type="time" value={formTransporte.horario} className={inputStyle} onChange={e => setFormTransporte({ ...formTransporte, horario: e.target.value })} />
              </div>
              <div>
                <label className={labelStyle}>Detalhes</label>
                <textarea value={formTransporte.detalhes} placeholder="Terminal, Assento..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white h-24 resize-none text-[16px]" onChange={e => setFormTransporte({ ...formTransporte, detalhes: e.target.value })} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-sky-400 hover:bg-sky-300 text-black font-black py-5 rounded-[28px] mt-4 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40 shadow-[0_15px_40px_rgba(14,165,233,0.3)]"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} strokeWidth={3} /><span className="tracking-tight uppercase">Salvar no Roteiro</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}