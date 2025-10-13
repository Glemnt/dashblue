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
    <div className="min-h-screen bg-navy-dark font-outfit">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-navy-dark to-blue-medium border-b-4 border-blue-ocean sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1920px] mx-auto px-12 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoWhite} alt="Blue Ocean" className="h-12 w-auto" />
          </div>
          
          <h1 className="text-white font-outfit text-5xl font-bold tracking-tight">
            Dashboard Comercial
          </h1>
          
          <div className="text-right">
            <p className="text-cyan-ocean font-outfit text-2xl font-semibold capitalize">
              {formatDate(currentTime)}
            </p>
            <p className="text-white/80 font-outfit text-xl">
              Atualizado: {formatTime(currentTime)}
            </p>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: BARRAS DE META */}
      <section className="bg-gradient-to-br from-navy-dark to-blue-medium py-16 px-12">
        <h2 className="text-white font-outfit text-6xl font-bold mb-12 text-center">
          🎯 Status das Metas
        </h2>
        
        <div className="max-w-[1800px] mx-auto space-y-8">
          {/* META MENSAL */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-cyan-ocean font-outfit text-3xl font-semibold mb-2">
                  💰 META MENSAL
                </p>
                <p className="text-white font-outfit text-7xl font-bold">
                  R$ 650.000
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-bold">
                  12%
                </p>
                <p className="text-white/60 font-outfit text-2xl">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-20 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-red-500 via-red-400 to-red-300 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: '12%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-outfit text-4xl font-bold drop-shadow-lg">
                  R$ 77.850
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-white font-outfit text-2xl">
                Faltam <span className="text-cyan-ocean font-bold">R$ 572.150</span> para a meta
              </p>
              <p className="text-white/60 font-outfit text-xl">
                ⏱️ 15 dias úteis restantes
              </p>
            </div>
          </div>

          {/* META SEMANAL */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-cyan-ocean font-outfit text-3xl font-semibold mb-2">
                  📊 META SEMANAL
                </p>
                <p className="text-white font-outfit text-7xl font-bold">
                  R$ 148.000
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-bold">
                  68%
                </p>
                <p className="text-white/60 font-outfit text-2xl">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-20 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: '68%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-outfit text-4xl font-bold drop-shadow-lg">
                  R$ 100.640
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-white font-outfit text-2xl">
                Faltam <span className="text-cyan-ocean font-bold">R$ 47.360</span> para a meta
              </p>
              <p className="text-white/60 font-outfit text-xl">
                ⚡ No caminho certo!
              </p>
            </div>
          </div>

          {/* META DIÁRIA */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-cyan-ocean font-outfit text-3xl font-semibold mb-2">
                  🎯 META DIÁRIA
                </p>
                <p className="text-white font-outfit text-7xl font-bold">
                  R$ 30.000
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-bold">
                  92%
                </p>
                <p className="text-white/60 font-outfit text-2xl">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-20 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-cyan-ocean via-cyan-ocean/90 to-cyan-ocean/70 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: '92%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-navy-dark font-outfit text-4xl font-bold drop-shadow-lg">
                  R$ 27.600
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-white font-outfit text-2xl">
                Faltam <span className="text-cyan-ocean font-bold">R$ 2.400</span> para a meta
              </p>
              <p className="text-cyan-ocean font-outfit text-xl font-bold">
                🔥 QUASE LÁ!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: KPI CARDS */}
      <section className="bg-gray-ocean py-16 px-12">
        <h2 className="text-navy-dark font-outfit text-6xl font-bold mb-12 text-center">
          📈 Indicadores Principais
        </h2>
        
        <div className="grid grid-cols-3 gap-8 max-w-[1800px] mx-auto">
          
          {/* Card 1: Receita Total */}
          <div className="bg-gradient-to-br from-blue-ocean to-blue-medium rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <p className="text-white/80 font-outfit text-2xl font-medium uppercase tracking-wide">
                Receita Total
              </p>
              <span className="text-7xl">💰</span>
            </div>
            <p className="text-white font-outfit text-8xl font-bold mb-4">
              77,8k
            </p>
            <p className="text-white/70 font-outfit text-2xl">
              11 contratos fechados
            </p>
          </div>

          {/* Card 2: Ticket Médio */}
          <div className="bg-gradient-to-br from-cyan-ocean to-teal-500 rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <p className="text-white/80 font-outfit text-2xl font-medium uppercase tracking-wide">
                Ticket Médio
              </p>
              <span className="text-7xl">📊</span>
            </div>
            <p className="text-white font-outfit text-8xl font-bold mb-4">
              7,1k
            </p>
            <p className="text-white/70 font-outfit text-2xl">
              Meta: R$ 12.000
            </p>
          </div>

          {/* Card 3: Contratos */}
          <div className="bg-gradient-to-br from-blue-medium to-navy-dark rounded-3xl p-10 shadow-2xl border-4 border-cyan-ocean transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <p className="text-white/80 font-outfit text-2xl font-medium uppercase tracking-wide">
                Contratos
              </p>
              <span className="text-7xl">📝</span>
            </div>
            <p className="text-white font-outfit text-9xl font-bold mb-4">
              11
            </p>
            <p className="text-white/70 font-outfit text-2xl">
              Meta mensal: 55 (20%)
            </p>
          </div>

          {/* Card 4: Leads Total */}
          <div className="bg-white rounded-3xl p-10 shadow-2xl border-4 border-blue-ocean transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <p className="text-navy-dark/70 font-outfit text-2xl font-medium uppercase tracking-wide">
                Leads Total
              </p>
              <span className="text-7xl">👥</span>
            </div>
            <p className="text-navy-dark font-outfit text-9xl font-bold mb-4">
              62
            </p>
            <p className="text-navy-dark/60 font-outfit text-2xl">
              13 MQLs (21%)
            </p>
          </div>

          {/* Card 5: Taxa de Show */}
          <div className="bg-gradient-to-br from-cyan-ocean to-blue-ocean rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <p className="text-white/80 font-outfit text-2xl font-medium uppercase tracking-wide">
                Taxa de Show
              </p>
              <span className="text-7xl">✅</span>
            </div>
            <p className="text-white font-outfit text-9xl font-bold mb-4">
              78%
            </p>
            <p className="text-white/70 font-outfit text-2xl">
              87 realizadas / 111 agendadas
            </p>
          </div>

          {/* Card 6: Taxa Conversão */}
          <div className="bg-gradient-to-br from-blue-ocean to-cyan-ocean rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <p className="text-white/80 font-outfit text-2xl font-medium uppercase tracking-wide">
                Taxa Conversão
              </p>
              <span className="text-7xl">🎯</span>
            </div>
            <p className="text-white font-outfit text-9xl font-bold mb-4">
              20%
            </p>
            <p className="text-white/70 font-outfit text-2xl">
              11 fechados / 55 qualificados
            </p>
          </div>

        </div>
      </section>

      {/* SEÇÃO 3: FUNIL DE CONVERSÃO */}
      <section className="bg-gradient-to-br from-navy-dark to-blue-medium py-16 px-12">
        <h2 className="text-white font-outfit text-6xl font-bold mb-12 text-center">
          🔄 Funil de Conversão
        </h2>
        
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* Leads (100%) */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-ocean to-blue-ocean/90 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 font-outfit text-2xl mb-2">Leads</p>
                  <p className="text-white font-outfit text-7xl font-bold">2.100</p>
                  <p className="text-white/60 font-outfit text-xl mt-2">100% do total</p>
                </div>
                <span className="text-8xl">👥</span>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <span className="text-cyan-ocean text-5xl">↓</span>
                <p className="text-white font-outfit text-xl mt-2">35% qualificação</p>
              </div>
            </div>
          </div>

          {/* MQLs (90%) */}
          <div className="relative mx-auto" style={{ width: '90%' }}>
            <div className="bg-gradient-to-r from-blue-ocean/95 to-blue-medium rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 font-outfit text-2xl mb-2">MQLs</p>
                  <p className="text-white font-outfit text-7xl font-bold">734</p>
                  <p className="text-white/60 font-outfit text-xl mt-2">35% do total</p>
                </div>
                <span className="text-8xl">✅</span>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <span className="text-cyan-ocean text-5xl">↓</span>
                <p className="text-white font-outfit text-xl mt-2">50% agendamento</p>
              </div>
            </div>
          </div>

          {/* Calls Agendadas (80%) */}
          <div className="relative mx-auto" style={{ width: '80%' }}>
            <div className="bg-gradient-to-r from-blue-medium to-cyan-ocean/80 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 font-outfit text-2xl mb-2">Calls Agendadas</p>
                  <p className="text-white font-outfit text-7xl font-bold">367</p>
                  <p className="text-white/60 font-outfit text-xl mt-2">17,5% do total</p>
                </div>
                <span className="text-8xl">📅</span>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <span className="text-cyan-ocean text-5xl">↓</span>
                <p className="text-white font-outfit text-xl mt-2">75% comparecimento</p>
              </div>
            </div>
          </div>

          {/* Calls Realizadas (70%) */}
          <div className="relative mx-auto" style={{ width: '70%' }}>
            <div className="bg-gradient-to-r from-cyan-ocean to-cyan-ocean/90 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-navy-dark/80 font-outfit text-2xl mb-2">Calls Realizadas</p>
                  <p className="text-navy-dark font-outfit text-7xl font-bold">275</p>
                  <p className="text-navy-dark/60 font-outfit text-xl mt-2">13,1% do total</p>
                </div>
                <span className="text-8xl">📞</span>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <span className="text-cyan-ocean text-5xl">↓</span>
                <p className="text-white font-outfit text-xl mt-2">20% conversão</p>
              </div>
            </div>
          </div>

          {/* Contratos (60%) */}
          <div className="relative mx-auto" style={{ width: '60%' }}>
            <div className="bg-gradient-to-r from-cyan-ocean/90 to-emerald-400 rounded-3xl p-8 shadow-2xl border-4 border-cyan-ocean">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-navy-dark/80 font-outfit text-2xl mb-2">Contratos Fechados</p>
                  <p className="text-navy-dark font-outfit text-7xl font-bold">55</p>
                  <p className="text-navy-dark/60 font-outfit text-xl mt-2">2,6% do total</p>
                </div>
                <span className="text-8xl">💰</span>
              </div>
              <div className="mt-6 pt-6 border-t-2 border-navy-dark/20">
                <p className="text-navy-dark font-outfit text-4xl font-bold">
                  = R$ 650.000,00
                </p>
                <p className="text-navy-dark/70 font-outfit text-xl mt-1">
                  Receita Total Esperada
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 4: GUERRA DE SQUADS */}
      <section className="bg-gray-ocean py-16 px-12">
        <h2 className="text-navy-dark font-outfit text-6xl font-bold mb-12 text-center">
          🏆 Guerra de Squads
        </h2>
        
        <div className="grid grid-cols-2 gap-8 max-w-[1600px] mx-auto mb-8">
          
          {/* Squad Hot Dogs */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-10 shadow-2xl border-4 border-red-400 relative overflow-hidden transform hover:scale-105 transition-all duration-300">
            {/* Badge Líder */}
            <div className="absolute top-6 right-6">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3">
                <span className="text-4xl">🥇</span>
                <span className="text-white font-outfit text-2xl font-bold">LÍDER</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-7xl">🔴</span>
              <h3 className="text-white font-outfit text-5xl font-bold">
                SQUAD HOT DOGS
              </h3>
            </div>
            
            <p className="text-white font-outfit text-9xl font-bold mb-4">
              44,2k
            </p>
            <p className="text-white/80 font-outfit text-3xl mb-8">
              6 contratos fechados
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-white/80 font-outfit text-xl mb-3">MEMBROS:</p>
              <ul className="space-y-2 text-white font-outfit text-2xl">
                <li>• Marcos (SDR)</li>
                <li>• Bruno (Closer)</li>
                <li>• Cauã (Closer)</li>
              </ul>
            </div>
          </div>

          {/* Squad Corvo Azul */}
          <div className="bg-gradient-to-br from-blue-ocean to-blue-medium rounded-3xl p-10 shadow-2xl border-4 border-blue-ocean relative overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-7xl">🔵</span>
              <h3 className="text-white font-outfit text-5xl font-bold">
                SQUAD CORVO AZUL
              </h3>
            </div>
            
            <p className="text-white font-outfit text-9xl font-bold mb-4">
              33,6k
            </p>
            <p className="text-white/80 font-outfit text-3xl mb-8">
              5 contratos fechados
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-white/80 font-outfit text-xl mb-3">MEMBROS:</p>
              <ul className="space-y-2 text-white font-outfit text-2xl">
                <li>• Vinícius (SDR)</li>
                <li>• Gabriel Fernandes (Closer)</li>
                <li>• Gabriel Franklin (Closer)</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Banner Dinâmico */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl p-10 text-center shadow-2xl max-w-[1600px] mx-auto animate-pulse">
          <p className="text-white font-outfit text-5xl font-bold mb-4">
            🎉 SQUAD HOT DOGS ESTÁ NA LIDERANÇA! 🎉
          </p>
          <p className="text-white font-outfit text-3xl mb-2">
            Vantagem: R$ 10.650,00 (31,7%)
          </p>
          <p className="text-white/80 font-outfit text-2xl">
            Para Corvo Azul virar: +R$ 10.651,00 em vendas
          </p>
        </div>
      </section>

    </div>
  );
};

export default Index;
