import { Plane, MapPin, Plus, ListChecks, Train } from 'lucide-react';

// Atualizamos as propriedades para aceitar 4 abas
type BottomNavProps = {
  abaAtiva: 'roteiro' | 'passeios' | 'checklist' | 'transportes';
  setAbaAtiva: (aba: 'roteiro' | 'passeios' | 'checklist' | 'transportes') => void;
  onAddClick: () => void;
};

export default function BottomNav({ abaAtiva, setAbaAtiva, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-6 left-6 right-6 h-20 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-full flex justify-between items-center px-4 shadow-2xl z-40">
      
      {/* Lado Esquerdo */}
      <div className="flex gap-4 sm:gap-6 pl-2">
        <button 
          onClick={() => setAbaAtiva('roteiro')}
          className={`flex flex-col items-center transition-colors ${abaAtiva === 'roteiro' ? 'text-sky-400' : 'text-slate-500'}`}
        >
          <Plane size={24} />
          <span className="text-[10px] font-extrabold mt-1">ROTEIRO</span>
        </button>

        <button 
          onClick={() => setAbaAtiva('transportes')}
          className={`flex flex-col items-center transition-colors ${abaAtiva === 'transportes' ? 'text-sky-400' : 'text-slate-500'}`}
        >
          <Train size={24} />
          <span className="text-[10px] font-extrabold mt-1">VIAGENS</span>
        </button>
      </div>

      {/* Botão Central (+) */}
      <button 
        onClick={onAddClick}
        className="w-16 h-16 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center -mt-10 border-[6px] border-[#020617] shadow-xl transition-transform active:scale-95 shrink-0"
      >
        <Plus size={32} color="black" strokeWidth={3} />
      </button>

      {/* Lado Direito */}
      <div className="flex gap-4 sm:gap-6 pr-2">
        <button 
          onClick={() => setAbaAtiva('passeios')}
          className={`flex flex-col items-center transition-colors ${abaAtiva === 'passeios' ? 'text-sky-400' : 'text-slate-500'}`}
        >
          <MapPin size={24} />
          <span className="text-[10px] font-extrabold mt-1">PASSEIOS</span>
        </button>

        <button 
          onClick={() => setAbaAtiva('checklist')}
          className={`flex flex-col items-center transition-colors ${abaAtiva === 'checklist' ? 'text-sky-400' : 'text-slate-500'}`}
        >
          <ListChecks size={24} />
          <span className="text-[10px] font-extrabold mt-1">CHECKLIST</span>
        </button>
      </div>

    </nav>
  );
}