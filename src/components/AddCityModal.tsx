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
  
  // Ajuste no Transporte: Separando Origem e Destino
  const [formTransporte, setFormTransporte] = useState({ 
    tipo: '✈️ VOO', 
    data_viagem: '', 
    origem: '', 
    destino: '', 
    horario: '', 
    detalhes: '' 
  });

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
        // Aqui a mágica acontece: Juntamos Origem e Destino com a seta para o Banco
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

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-sky-500 transition-all min-h-[58px]";
  const labelStyle = "block text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 tracking-widest";

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f172a] w-full max-h-[95vh] rounded-t-[40px] p-8 overflow-y-auto border-t border-white/10 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Adicionar</h2>
          <button onClick={fecharModal} className="p-2 bg-white/5 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
          {(['cidade', 'passeio', 'transporte'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAba(t)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${aba === t ? 'bg-sky-500 text-black' : 'text-slate-500'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSalvar} className="space-y-5 pb-10">
          {aba === 'cidade' && (
            <>
              <div className="flex flex-col items-center gap-4 mb-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-white/10 rounded-[32px] relative overflow-hidden group flex items-center justify-center bg-white/5">
                  {formCidade.foto_url ? (
                    <img src={formCidade.foto_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Preview" />
                  ) : null}
                  {uploading ? <Loader2 className="animate-spin text-sky-400" size={32} /> : <Camera className="text-slate-400 z-10" size={32} />}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Nome da Cidade</label>
                  <input type="text" value={formCidade.cidade} placeholder="Ex: Paris 🇫🇷" className={inputStyle} onChange={e => setFormCidade({...formCidade, cidade: e.target.value})} required />
                </div>
                
                <div>
                  <label className={labelStyle}>Data da Viagem</label>
                  <input type="date" value={formCidade.data_viagem} className={inputStyle} onChange={e => setFormCidade({...formCidade, data_viagem: e.target.value})} required />
                </div>

                <div>
                  <label className={labelStyle}>Hospedagem</label>
                  <textarea value={formCidade.hospedagem} placeholder="Endereço ou Link" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none h-24 resize-none focus:border-sky-500" onChange={e => setFormCidade({...formCidade, hospedagem: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Check-in (Hora)</label>
                    <input type="time" value={formCidade.checkin} className={inputStyle} onChange={e => setFormCidade({...formCidade, checkin: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>Check-out (Hora)</label>
                    <input type="time" value={formCidade.checkout} className={inputStyle} onChange={e => setFormCidade({...formCidade, checkout: e.target.value})} />
                  </div>
                </div>
              </div>
            </>
          )}

          {aba === 'passeio' && (
             <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Onde será o passeio?</label>
                  <select value={formPasseio.destino_id} className={inputStyle} onChange={e => setFormPasseio({...formPasseio, destino_id: e.target.value})} required>
                    <option value="" className="bg-slate-900">Selecione a Cidade...</option>
                    {destinos.map((d: any) => <option key={d.id} value={d.id} className="text-black">{d.cidade}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Nome do Passeio</label>
                  <input type="text" value={formPasseio.nome} placeholder="Ex: Torre Eiffel" className={inputStyle} onChange={e => setFormPasseio({...formPasseio, nome: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Preço (€)</label>
                      <input type="text" value={formPasseio.preco} placeholder="Ex: 25,00" className={inputStyle} onChange={e => setFormPasseio({...formPasseio, preco: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelStyle}>Horário</label>
                      <input type="time" value={formPasseio.horario} className={inputStyle} onChange={e => setFormPasseio({...formPasseio, horario: e.target.value})} />
                    </div>
                </div>
             </div>
          )}

          {aba === 'transporte' && (
            <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Meio de Transporte</label>
                  <select value={formTransporte.tipo} className={inputStyle} onChange={e => setFormTransporte({...formTransporte, tipo: e.target.value})}>
                    <option value="✈️ VOO">✈️ VOO</option>
                    <option value="🚄 TREM">🚄 TREM</option>
                    <option value="🚘 CARRO">🚘 CARRO</option>
                    <option value="🚌 ÔNIBUS">🚌 ÔNIBUS</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Data da Partida</label>
                  <input type="date" value={formTransporte.data_viagem} className={inputStyle} onChange={e => setFormTransporte({...formTransporte, data_viagem: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Origem</label>
                      <input type="text" value={formTransporte.origem} placeholder="Ex: Paris" className={inputStyle} onChange={e => setFormTransporte({...formTransporte, origem: e.target.value})} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Destino</label>
                      <input type="text" value={formTransporte.destino} placeholder="Ex: Londres" className={inputStyle} onChange={e => setFormTransporte({...formTransporte, destino: e.target.value})} required />
                    </div>
                </div>
                <div>
                  <label className={labelStyle}>Horário de Saída</label>
                  <input type="time" value={formTransporte.horario} className={inputStyle} onChange={e => setFormTransporte({...formTransporte, horario: e.target.value})} />
                </div>
                <div>
                  <label className={labelStyle}>Informações Extras</label>
                  <textarea value={formTransporte.detalhes} placeholder="Nº do Voo, Assento, Portão..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white h-24 resize-none" onChange={e => setFormTransporte({...formTransporte, detalhes: e.target.value})} />
                </div>
            </div>
          )}

          <button type="submit" disabled={loading || uploading} className="w-full bg-sky-500 text-black font-black py-5 rounded-[24px] mt-6 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 shadow-lg shadow-sky-500/20">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /><span>SALVAR NO ROTEIRO</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}