import { useEffect, useState } from "react";
import logoWhite from "@/assets/logo-white.png";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-navy-ultra-dark font-outfit">
      {/* HEADER */}
      <header className="bg-navy-ultra-dark border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-12 py-8 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
          </div>
          
          <h1 className="text-white font-outfit text-5xl font-bold tracking-tight">
            Dashboard Comercial
          </h1>
          
          <div className="text-right">
            <p className="text-white font-outfit text-lg font-semibold capitalize">
              {formatDate(currentTime)}
            </p>
            <p className="text-gray-muted font-outfit text-sm">
              Atualizado: {formatTime(currentTime)}
            </p>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: BARRAS DE META */}
      <section className="bg-navy-ultra-dark py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Status das Metas
        </h2>
        
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* META MENSAL */}
          <div className="bg-navy-card rounded-2xl p-12 border border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-muted font-outfit text-sm font-semibold uppercase tracking-widest mb-3">
                  Meta Mensal
                </p>
                <p className="text-white font-outfit text-6xl font-black">
                  R$ 650.000
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-black">
                  12%
                </p>
                <p className="text-gray-muted font-outfit text-base">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="absolute h-full bg-red-alert rounded-full transition-all duration-1000"
                style={{ width: '12%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-outfit text-2xl font-bold">
                  R$ 77.850
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-muted font-outfit text-lg">
                Faltam <span className="text-white font-semibold">R$ 572.150</span> para a meta
              </p>
              <p className="text-gray-muted font-outfit text-sm">
                15 dias úteis restantes
              </p>
            </div>
          </div>

          {/* META SEMANAL */}
          <div className="bg-navy-card rounded-2xl p-12 border border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-muted font-outfit text-sm font-semibold uppercase tracking-widest mb-3">
                  Meta Semanal
                </p>
                <p className="text-white font-outfit text-6xl font-black">
                  R$ 148.000
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-black">
                  68%
                </p>
                <p className="text-gray-muted font-outfit text-base">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="absolute h-full bg-yellow-warning rounded-full transition-all duration-1000"
                style={{ width: '68%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-navy-ultra-dark font-outfit text-2xl font-bold">
                  R$ 100.640
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-muted font-outfit text-lg">
                Faltam <span className="text-white font-semibold">R$ 47.360</span> para a meta
              </p>
              <p className="text-cyan-modern font-outfit text-sm font-semibold">
                No caminho certo
              </p>
            </div>
          </div>

          {/* META DIÁRIA */}
          <div className="bg-navy-card rounded-2xl p-12 border border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-muted font-outfit text-sm font-semibold uppercase tracking-widest mb-3">
                  Meta Diária
                </p>
                <p className="text-white font-outfit text-6xl font-black">
                  R$ 30.000
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-black">
                  92%
                </p>
                <p className="text-gray-muted font-outfit text-base">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="absolute h-full bg-cyan-modern rounded-full transition-all duration-1000"
                style={{ width: '92%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-navy-ultra-dark font-outfit text-2xl font-bold">
                  R$ 27.600
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-muted font-outfit text-lg">
                Faltam <span className="text-white font-semibold">R$ 2.400</span> para a meta
              </p>
              <p className="text-cyan-modern font-outfit text-sm font-bold">
                QUASE LÁ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: KPI CARDS */}
      <section className="bg-gray-light py-20 px-12">
        <h2 className="text-navy-ultra-dark font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Indicadores Principais
        </h2>
        
        <div className="grid grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          
          {/* Card 1: Receita Total */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-light hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Receita Total
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              77,8k
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-blue-vibrant rounded-full" style={{ width: '12%' }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              11 contratos fechados
            </p>
          </div>

          {/* Card 2: Ticket Médio */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-light hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Ticket Médio
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              7,1k
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-cyan-modern rounded-full" style={{ width: '59%' }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              Meta: R$ 12.000
            </p>
          </div>

          {/* Card 3: Contratos */}
          <div className="bg-blue-vibrant rounded-2xl p-10 border-2 border-blue-vibrant hover:shadow-xl transition-all duration-300">
            <p className="text-white/70 font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Contratos
            </p>
            <p className="text-white font-outfit text-8xl font-black mb-4">
              11
            </p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full" style={{ width: '20%' }}></div>
            </div>
            <p className="text-white/80 font-outfit text-base">
              Meta mensal: 55 (20%)
            </p>
          </div>

          {/* Card 4: Leads Total */}
          <div className="bg-white rounded-2xl p-10 border-2 border-blue-vibrant hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Leads Total
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              62
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-blue-vibrant rounded-full" style={{ width: '21%' }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              13 MQLs (21%)
            </p>
          </div>

          {/* Card 5: Taxa de Show */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-light hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Taxa de Show
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              78%
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-cyan-modern rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              87 realizadas / 111 agendadas
            </p>
          </div>

          {/* Card 6: Taxa Conversão */}
          <div className="bg-cyan-modern rounded-2xl p-10 border-2 border-cyan-modern hover:shadow-xl transition-all duration-300">
            <p className="text-navy-ultra-dark/70 font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Taxa Conversão
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              20%
            </p>
            <div className="h-2 bg-navy-ultra-dark/10 rounded-full mb-4">
              <div className="h-full bg-navy-ultra-dark rounded-full" style={{ width: '20%' }}></div>
            </div>
            <p className="text-navy-ultra-dark/80 font-outfit text-base">
              11 fechados / 55 qualificados
            </p>
          </div>

        </div>
      </section>

      {/* SEÇÃO 3: FUNIL DE CONVERSÃO */}
      <section className="bg-navy-ultra-dark py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Funil de Conversão
        </h2>
        
        <div className="max-w-[900px] mx-auto space-y-6">
          
          {/* Leads (100%) */}
          <div className="relative">
            <div className="bg-blue-vibrant rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Leads</p>
                  <p className="text-white font-outfit text-7xl font-black">2.100</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">100% do total</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">35% qualificação ↓</p>
              </div>
            </div>
          </div>

          {/* MQLs (90%) */}
          <div className="relative mx-auto" style={{ width: '90%' }}>
            <div className="bg-blue-vibrant/90 rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">MQLs</p>
                  <p className="text-white font-outfit text-7xl font-black">734</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">35% do total</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">50% agendamento ↓</p>
              </div>
            </div>
          </div>

          {/* Calls Agendadas (80%) */}
          <div className="relative mx-auto" style={{ width: '80%' }}>
            <div className="bg-blue-vibrant/70 rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Calls Agendadas</p>
                  <p className="text-white font-outfit text-7xl font-black">367</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">17,5% do total</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">75% comparecimento ↓</p>
              </div>
            </div>
          </div>

          {/* Calls Realizadas (70%) */}
          <div className="relative mx-auto" style={{ width: '70%' }}>
            <div className="bg-cyan-modern/80 rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Calls Realizadas</p>
                  <p className="text-navy-ultra-dark font-outfit text-7xl font-black">275</p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">13,1% do total</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">20% conversão ↓</p>
              </div>
            </div>
          </div>

          {/* Contratos (60%) */}
          <div className="relative mx-auto" style={{ width: '60%' }}>
            <div className="bg-cyan-modern rounded-2xl p-8 border-2 border-cyan-modern">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Contratos Fechados</p>
                  <p className="text-navy-ultra-dark font-outfit text-7xl font-black">55</p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">2,6% do total</p>
              </div>
              <div className="pt-6 border-t-2 border-navy-ultra-dark/10">
                <p className="text-navy-ultra-dark font-outfit text-3xl font-black mb-1">
                  R$ 650.000,00
                </p>
                <p className="text-navy-ultra-dark/60 font-outfit text-sm">
                  Receita Total Esperada
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 4: GUERRA DE SQUADS */}
      <section className="bg-gray-light py-20 px-12">
        <h2 className="text-navy-ultra-dark font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Guerra de Squads
        </h2>
        
        <div className="grid grid-cols-2 gap-8 max-w-[1600px] mx-auto mb-8">
          
          {/* Squad Hot Dogs */}
          <div className="bg-white rounded-2xl p-12 border-l-8 border-red-alert relative hover:shadow-xl transition-all duration-300">
            <div className="absolute top-6 right-6">
              <div className="bg-yellow-warning px-6 py-2 rounded-lg">
                <span className="text-navy-ultra-dark font-outfit text-sm font-bold uppercase tracking-wider">LÍDER</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-red-alert rounded-lg flex items-center justify-center">
                <span className="text-white font-outfit text-2xl font-black">HD</span>
              </div>
              <h3 className="text-navy-ultra-dark font-outfit text-4xl font-bold">
                SQUAD HOT DOGS
              </h3>
            </div>
            
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-2">
              44,2k
            </p>
            <p className="text-gray-medium font-outfit text-xl mb-6">
              6 contratos fechados
            </p>
            
            <div className="h-2 bg-gray-light rounded-full mb-8">
              <div className="h-full bg-red-alert rounded-full" style={{ width: '68%' }}></div>
            </div>
            
            <div className="bg-gray-light rounded-xl p-6">
              <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-3">MEMBROS</p>
              <ul className="space-y-2 text-navy-ultra-dark font-outfit text-base">
                <li>• Marcos (SDR)</li>
                <li>• Bruno (Closer)</li>
                <li>• Cauã (Closer)</li>
              </ul>
            </div>
          </div>

          {/* Squad Corvo Azul */}
          <div className="bg-white rounded-2xl p-12 border-l-8 border-blue-vibrant hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-vibrant rounded-lg flex items-center justify-center">
                <span className="text-white font-outfit text-2xl font-black">CA</span>
              </div>
              <h3 className="text-navy-ultra-dark font-outfit text-4xl font-bold">
                SQUAD CORVO AZUL
              </h3>
            </div>
            
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-2">
              33,6k
            </p>
            <p className="text-gray-medium font-outfit text-xl mb-6">
              5 contratos fechados
            </p>
            
            <div className="h-2 bg-gray-light rounded-full mb-8">
              <div className="h-full bg-blue-vibrant rounded-full" style={{ width: '52%' }}></div>
            </div>
            
            <div className="bg-gray-light rounded-xl p-6">
              <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-3">MEMBROS</p>
              <ul className="space-y-2 text-navy-ultra-dark font-outfit text-base">
                <li>• Vinícius (SDR)</li>
                <li>• Gabriel Fernandes (Closer)</li>
                <li>• Gabriel Franklin (Closer)</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Banner Dinâmico */}
        <div className="bg-red-alert rounded-2xl p-10 text-center max-w-[1600px] mx-auto">
          <p className="text-white font-outfit text-4xl font-bold mb-3 tracking-tight">
            SQUAD HOT DOGS ESTÁ NA LIDERANÇA
          </p>
          <p className="text-white font-outfit text-2xl mb-1 font-semibold">
            Vantagem: R$ 10.650,00 (31,7%)
          </p>
          <p className="text-white/80 font-outfit text-lg">
            Para Corvo Azul virar: +R$ 10.651,00 em vendas
          </p>
        </div>
      </section>

    </div>
  );
};

export default Index;
