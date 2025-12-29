import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import MobileMenu from '@/components/MobileMenu';
import Footer from '@/components/Footer';
import AdminResumoPanel from '@/components/admin/AdminResumoPanel';
import ColaboradoresTab from '@/components/admin/ColaboradoresTab';
import MetasTab from '@/components/admin/MetasTab';
import VendasTab from '@/components/admin/VendasTab';
import AgendamentosTab from '@/components/admin/AgendamentosTab';
import { Settings, Users, Target, DollarSign, Calendar, BarChart3 } from 'lucide-react';

const MESES = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const getCurrentMonthKey = () => {
  const now = new Date();
  const mes = MESES[now.getMonth()];
  const ano = now.getFullYear();
  return `${mes}-${ano}`;
};

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = -6; i <= 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mes = MESES[date.getMonth()];
    const ano = date.getFullYear();
    options.push(`${mes}-${ano}`);
  }
  return options;
};

const Admin = () => {
  const [selectedMes, setSelectedMes] = useState(getCurrentMonthKey());

  return (
    <div className="min-h-screen bg-[#0D1321] flex flex-col">
      <Navigation />
      <MobileMenu />

      <main className="flex-1 max-w-[1920px] mx-auto w-full px-4 sm:px-6 md:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-[#0066FF]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-outfit">
                Central de Controle
              </h1>
              <p className="text-muted-foreground text-sm">
                Gerencie colaboradores, metas, vendas e agendamentos
              </p>
            </div>
          </div>
          <Select value={selectedMes} onValueChange={setSelectedMes}>
            <SelectTrigger className="w-48 bg-[#1A1F2E] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1F2E] border-white/10">
              {generateMonthOptions().map((mes) => (
                <SelectItem key={mes} value={mes}>
                  {mes.charAt(0).toUpperCase() + mes.slice(1).replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="bg-[#1A1F2E] border border-white/10 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger 
              value="resumo" 
              className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Resumo
            </TabsTrigger>
            <TabsTrigger 
              value="colaboradores" 
              className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Colaboradores
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Metas
            </TabsTrigger>
            <TabsTrigger 
              value="vendas" 
              className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="agendamentos" 
              className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Agendamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo">
            <AdminResumoPanel mesKey={selectedMes} />
          </TabsContent>

          <TabsContent value="colaboradores">
            <ColaboradoresTab />
          </TabsContent>

          <TabsContent value="metas">
            <MetasTab />
          </TabsContent>

          <TabsContent value="vendas">
            <VendasTab mesKey={selectedMes} />
          </TabsContent>

          <TabsContent value="agendamentos">
            <AgendamentosTab mesKey={selectedMes} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
