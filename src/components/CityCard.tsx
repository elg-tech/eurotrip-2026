import { Calendar, ChevronRight } from 'lucide-react';

export default function CityCard({ dest, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="relative h-56 rounded-3xl overflow-hidden border border-white/10 active:scale-95 transition-all shadow-2xl cursor-pointer group mb-6"
    >
      <img src={dest.foto_url} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" alt={dest.cidade} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
      <div className="absolute bottom-0 p-6 w-full flex justify-between items-end">
        <div>
          <p className="text-sky-400 text-sm font-bold mb-1 shadow-black drop-shadow-md flex items-center gap-2">
            <Calendar size={16} /> {dest.data_viagem}
          </p>
          <h2 className="text-3xl font-bold drop-shadow-lg text-white">{dest.cidade}</h2>
        </div>
        <div className="bg-sky-500/80 p-2 rounded-full mb-2">
          <ChevronRight size={20} color="white" />
        </div>
      </div>
    </div>
  );
}