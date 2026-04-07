import { useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { uploadImagem } from '../utils/upload';
import { X, Save, Camera, Loader2 } from 'lucide-react';

export default function AddCityModal({ isOpen, onClose, onRefresh, destinos }: any) {
  const [aba, setAba] = useState<'cidade' | 'passeio' | 'transporte'>('cidade');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados iniciais com tipos de data/hora vazios
  const estadoInicialCidade = { 
    cidade: '', 
    data_viagem: '', // será YYYY-MM-DD
    hospedagem: '', 
    foto_url: '', 
    checkin: '', // será HH:mm
    checkout: '' // será HH:mm
  };

  const [formCidade, setFormCidade] = useState(estadoInicialCidade);
  const [formPasseio, setFormPasseio] = useState({ destino_id: '', nome: '', preco: '', horario: '' });
  const [formTransporte, setFormTransporte] = useState({ tipo: '✈️ VOO', data_viagem: '', origem_destino: '', horario: '', detalhes: '' });

  if (!isOpen) return null;

  const resetarCampos = () => {
    setFormCidade(estadoInicialCidade);
    setFormPasseio({ destino_id: '', nome: '', preco: '', horario: '' });
    setFormTransporte({ tipo: '✈️ VOO', data_viagem: '', origem_destino: '', horario: '', detalhes: '' });
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
    let dados = {};

    if (aba === 'cidade') {
        // Removemos o ID para o Supabase gerar um novo obrigatoriamente
        const { ...dadosSemId } = formCidade;
        dados = dadosSemId;
    } else if (aba === 'passeio') {
        dados = { ...formPasseio, destino_id: parseInt(formPasseio.destino_id) };
    } else {
        dados = formTransporte;
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

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/90 backdrop-blur-sm">
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

        <form onSubmit={handleSalvar} className="space-y-4 pb-10">
          {aba === 'cidade' && (
            <>
              <div className="flex flex-col items-center gap-4 mb-4">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-white/10 rounded-[32px] relative overflow-hidden group">
                  {formCidade.foto_url ? (
                    <img src={formCidade.foto_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Preview" />
                  ) : null}
                  {uploading ? <Loader2 className="animate-spin text-sky-400 mx-auto" /> : <Camera className="text-slate-400 mx-auto" size={28} />}
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2">Nome da Cidade</label>
                <input type="text" value={formCidade.cidade} placeholder="Ex: Paris 🇫🇷" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500" onChange={e => setFormCidade({...formCidade, cidade: e.target.value})} required />
                
                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2">Data da Viagem</label>
                <input type="date" value={formCidade.data_viagem} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-sky-500" onChange={e => setFormCidade({...formCidade, data_viagem: e.target.value})} />

                <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2">Hospedagem</label>
                <textarea value={formCidade.hospedagem} placeholder="Endereço ou Link" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none h-24 resize-none" onChange={e => setFormCidade({...formCidade, hospedagem: e.target.value})} />
                
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Check-in</label>
                    <input type="time" value={formCidade.checkin} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormCidade({...formCidade, checkin: e.target.value})} />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Check-out</label>
                    <input type="time" value={formCidade.checkout} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormCidade({...formCidade, checkout: e.target.value})} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Os outros forms (passeio/transporte) seguem a mesma lógica de reset */}
          {aba === 'passeio' && (
             <div className="space-y-4">
                <select value={formPasseio.destino_id} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormPasseio({...formPasseio, destino_id: e.target.value})} required>
                  <option value="">Selecione a Cidade...</option>
                  {destinos.map((d: any) => <option key={d.id} value={d.id} className="text-black">{d.cidade}</option>)}
                </select>
                <input type="text" value={formPasseio.nome} placeholder="Nome do Passeio" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormPasseio({...formPasseio, nome: e.target.value})} required />
                <div className="flex gap-4">
                    <input type="text" value={formPasseio.preco} placeholder="Preço" className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormPasseio({...formPasseio, preco: e.target.value})} />
                    <input type="time" value={formPasseio.horario} className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none" onChange={e => setFormPasseio({...formPasseio, horario: e.target.value})} />
                </div>
             </div>
          )}

          {aba === 'transporte' && (
            <div className="space-y-4">
                <select value={formTransporte.tipo} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white" onChange={e => setFormTransporte({...formTransporte, tipo: e.target.value})}>
                  <option value="✈️ VOO">✈️ VOO</option>
                  <option value="🚄 TREM">🚄 TREM</option>
                  <option value="🚘 CARRO">🚘 CARRO</option>
                  <option value="🚌 ÔNIBUS">🚌 ÔNIBUS</option>
                </select>
                <input type="date" value={formTransporte.data_viagem} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white" onChange={e => setFormTransporte({...formTransporte, data_viagem: e.target.value})} required />
                <input type="text" value={formTransporte.origem_destino} placeholder="Origem ➔ Destino" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white" onChange={e => setFormTransporte({...formTransporte, origem_destino: e.target.value})} required />
                <input type="time" value={formTransporte.horario} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white" onChange={e => setFormTransporte({...formTransporte, horario: e.target.value})} />
                <textarea value={formTransporte.detalhes} placeholder="Detalhes (Nº Bilhete, etc)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white h-24 resize-none" onChange={e => setFormTransporte({...formTransporte, detalhes: e.target.value})} />
            </div>
          )}

          <button type="submit" disabled={loading || uploading} className="w-full bg-sky-500 text-black font-black py-5 rounded-[24px] mt-6 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 shadow-lg">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /><span>SALVAR NO ROTEIRO</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}