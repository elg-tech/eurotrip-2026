import CityCard from '../components/CityCard';

export default function Roteiro({ destinos, onSelectCity }: any) {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="p-8 pt-12">
        <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Nossa Jornada</span>
        <h1 className="text-4xl font-black mt-1 text-white">EUROTRIP 2026</h1>
      </header>
      <main className="px-6 pb-6">
        {destinos.map((dest: any) => (
          <CityCard key={dest.id} dest={dest} onClick={() => onSelectCity(dest)} />
        ))}
      </main>
    </div>
  );
}