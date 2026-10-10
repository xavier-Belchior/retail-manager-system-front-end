"use client";

import { useMemo, useState, useEffect, type FormEvent, useRef } from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Pencil,
  Plus,
  ScanLine,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  Users,
  WalletCards,
  X,
  Trash2,
  LogOut,
} from "lucide-react";
import {
  categoryService,
  dashboardService,
  InventoryItem,
  inventoryService,
  reportService,
  Sale,
  productService,
  SalesReport,
  customerService,
  salesService,
  supplierService,
  authService,
} from "@/lib/api-services";
import LoadingSpinner from "@/components/ui/loading-spinner";
const navGroups = [
  {
    label: "Visão geral",
    items: [{ label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operações",
    items: [
      { label: "Produtos", icon: Package },
      { label: "Estoque", icon: Boxes },
      { label: "Vendas / POS", icon: ShoppingCart },
      { label: "Scanner", icon: ScanLine },
    ],
  },
  {
    label: "Relacionamento",
    items: [
      { label: "Clientes", icon: Users },
      { label: "Fornecedores", icon: Truck },
    ],
  },
  {
    label: "Gestão",
    items: [
      { label: "Relatórios", icon: BarChart3 },
      { label: "Funcionários", icon: UserRound },
    ],
  },
];

function money(value: number) {
  return `${new Intl.NumberFormat("pt-PT").format(value)} Kz`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  tone = "green",
}: {
  icon: typeof Store;
  label: string;
  value: string;
  change: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7ebe7] bg-white p-5 shadow-[0_2px_10px_rgba(27,50,38,0.03)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          <Icon className="size-5" />
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <ArrowUpRight className="size-3.5" />
          {change}
        </span>
      </div>
      <p className="mt-5 text-sm text-[#748079]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#17251e]">
        {value}
      </p>
    </div>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${value === "Esgotado" ? "bg-red-50 text-red-700" : value === "Stock baixo" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
    >
      {value}
    </span>
  );
}
type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  category_id: number | null;
  category: string | null;
  price: string;
  stock: number;
  min_stock: number;
  min: number;
  supplier_id: number | null;
  supplier: string | null;
  status: string;
};

export default function Page() {
  const [active, setActive] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      try {
        await authService.me();
        setAuthenticated(true);
      } catch {
        localStorage.removeItem("token");
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }

    checkSession();
  }, []);
  const loadProducts = async () => {
    try {
      const data = await productService.list();

      const formattedProducts = data.map((product) => ({
        ...product,
        min: product.min_stock,
        status:
          product.stock === 0
            ? "Esgotado"
            : product.stock <= product.min_stock
              ? "Stock baixo"
              : "Em stock",
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };
  const loadInventory = async () => {
    try {
      const data = await inventoryService.list();

      setInventory(data.product);
      console.log(data.product);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  const reloadData = async () => {
    setIsLoadingData(true);

    try {
      await Promise.all([loadProducts(), loadInventory()]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    reloadData();
  }, [authenticated]);
  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const isDashboard = active === "Dashboard";

  function navigate(label: string) {
    setActive(label);
    setMobileOpen(false);
  }
  function handleLogout() {
    localStorage.removeItem("token");
    setAuthenticated(false);
  }
  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8f6]">
        {" "}
        <div
          role="status"
          aria-label="A verificar a sessão"
          className="size-12 animate-spin rounded-full border-4 border-[#dce9df] border-t-[#145a43]"
        />
        <p className="text-sm font-medium text-[#64736b]">
          A preparar o sistema...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }
  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#17251e]  ">
      {/* Sidebar main */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#e1e8e2] bg-[#fbfcfb] px-4 py-5 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 px-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl 
      bg-[#145a43] text-white"
          >
            <Store className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#173d2e]">
              Francisco Fernandes
            </p>
            <p className="text-[11px] text-[#84918b]">Gestão de comércio</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-[#829089] lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0aba4]">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.label)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${active === item.label ? "bg-[#e5f2eb] text-[#145a43]" : "text-[#64736b] hover:bg-[#f0f4f0]"}`}
                  >
                    <item.icon className="size-[18px]" />
                    {item.label}
                    {item.label === "Estoque" && (
                      <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        3
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("Configurações")}
          className="flex items-center gap-3 border-t border-[#e8ede9] px-3 pt-4 text-sm font-medium text-[#64736b]"
        >
          <Settings className="size-[18px]" />
          Configurações
        </button>
        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            className="flex w-full items-center gap-3 rounded-xl bg-[#f0f5f1] p-3 text-left transition-colors hover:bg-[#e7efe8]"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#cbe4d5] text-xs font-bold text-[#145a43]">
              MF
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">Manuel Francisco</p>
              <p className="text-[11px] text-[#829089]">Administrador</p>
            </div>

            <ChevronDown
              className={`size-4 shrink-0 text-[#829089] transition-transform duration-300 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
              profileOpen
                ? "mt-2 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar navegação"
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e7ece8] bg-[#f8faf8]/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[#66756d] lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="hidden text-xs font-medium text-[#8a968f] sm:block">
                Terça-feira, 24 de Setembro de 2024
              </p>
              <h1 className="text-lg font-bold md:text-xl">
                {isDashboard ? "Bom dia, Manuel" : active}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative rounded-xl p-2.5 text-[#6f7d75] hover:bg-white">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500" />
            </button>
            <div className="hidden h-8 w-px bg-[#e1e8e2] md:block" />
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#cbe4d5] text-xs font-bold text-[#145a43]">
                MF
              </div>
              <span className="hidden text-sm font-semibold md:block">
                Manuel Francisco
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:cursor-pointer hover:bg-red-50"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* The dashboard and  sections displays here */}
        <div className="mx-auto max-w-[1500px] p-5 md:p-8">
          {isDashboard ? (
            <Dashboard navigate={navigate} showToast={showToast} />
          ) : (
            <Section
              active={active}
              inventory={inventory}
              query={query}
              setQuery={setQuery}
              products={filteredProducts}
              setScannerOpen={setScannerOpen}
              showToast={showToast}
              navigate={navigate}
              setAddProductOpen={setAddProductOpen}
              addProductOpen={addProductOpen}
              reloadProducts={reloadData}
              isLoadingData={isLoadingData}
            />
          )}
        </div>
      </main>
      {scannerOpen && (
        <ScannerModal
          close={() => setScannerOpen(false)}
          showToast={showToast}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-[#173d2e] px-4 py-3 text-sm font-medium text-white shadow-xl">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-400 text-[#173d2e]">
            ✓
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({
  navigate,
  showToast,
}: {
  navigate: (s: string) => void;
  showToast: (s: string) => void;
}) {
  const [dashboard, setDashboard] = useState<{
    total_products: number;
    total_sales: number;
    total_revenue: number;
    sales_today: number;
    revenue_today: number;
    low_stock: number;
  } | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReport[]>([]);
  const [period, setPeriod] = useState("7d");
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const formatCurrency = (value: number) => {
    return `${Number(value).toLocaleString("pt-AO")} Kz`;
  };
  const chartData = salesReport.map((item) => ({
    date: new Date(item.date).toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "short",
    }),
    revenue: Number(item.total_revenue),
  }));
  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await dashboardService.getSummary();
        setDashboard(data);
      } catch (error) {
        console.error("Error loading dashboard", error);
      }
    }

    async function loadInventory() {
      try {
        const data = await inventoryService.list();
        setInventory(data.product);
      } catch (error) {
        console.error("Error loading inventory", error);
      }
    }

    async function loadSales() {
      try {
        const data = await salesService.list();
        setSales(data);
      } catch (error) {
        console.error("Error loading sales", error);
      }
    }
    async function loadInitialData() {
      setIsDashboardLoading(true);

      try {
        await Promise.all([loadSales(), loadInventory(), loadDashboard()]);
      } finally {
        setIsDashboardLoading(false);
      }
    }

    loadInitialData();
    // loadSales();
    // loadInventory();
    // loadDashboard();
  }, []);

  useEffect(() => {
    async function loadSalesReport() {
      setIsReportLoading(true);

      try {
        const data = await reportService.sales(`?period=${period}`);
        setSalesReport(data);
      } catch (error) {
        console.error("Error loading sales report:", error);
      } finally {
        setIsReportLoading(false);
      }
    }

    loadSalesReport();
  }, [period]);
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-[#748079]">
            Aqui está o resumo da sua operação hoje.
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Visão geral
          </h2>
        </div>
        <button
          onClick={() => navigate("Vendas / POS")}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#145a43] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0e4935]"
        >
          <Plus className="size-4" />
          Nova venda
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          label="Vendas totais"
          value={dashboard ? formatCurrency(dashboard.total_revenue) : "..."}
          change={`${dashboard?.total_sales ?? 0} vendas`}
        />

        <StatCard
          icon={WalletCards}
          label="Vendas de hoje"
          value={dashboard ? formatCurrency(dashboard.revenue_today) : "..."}
          change={`${dashboard?.sales_today ?? 0} vendas`}
        />

        <StatCard
          icon={Package}
          label="Total de produtos"
          value={dashboard?.total_products?.toString() ?? "..."}
          change="No catálogo"
        />

        <StatCard
          icon={AlertTriangle}
          label="Produtos com stock baixo"
          value={dashboard?.low_stock?.toString() ?? "..."}
          change="Atenção necessária"
          tone="amber"
        />
      </div>

      {/* Graphic of sales */}
      <div className="grid gap-5 border-2 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-[#e7ebe7] bg-white p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold">Desempenho de vendas</h3>
              <p className="mt-1 text-xs text-[#86928b]">
                Acompanhe a evolução das vendas no período selecionado
              </p>
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-[#e1e8e2] bg-white px-3 py-2 text-xs font-semibold text-[#56655d] outline-none"
            >
              <option value="today">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="year">Este ano</option>
            </select>
          </div>

          {/* Chart content */}
          <div className="mt-8 flex min-h-64 items-center justify-center border-b border-l border-[#e6ece7] px-3">
            {isReportLoading ? (
              <LoadingSpinner message="A carregar relatório..." />
            ) : chartData.length === 0 ? (
              <p className="text-center text-sm text-[#86928b]">
                Sem dados de vendas neste período.
              </p>
            ) : (
              <div className="flex h-64 w-full items-end gap-3 md:gap-4">
                {chartData.map((item) => {
                  const maxRevenue = Math.max(
                    ...chartData.map((chartItem) => chartItem.revenue),
                    1,
                  );

                  const height = (item.revenue / maxRevenue) * 100;

                  return (
                    <div
                      key={item.date}
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <div className="group relative flex min-h-0 flex-1 items-end">
                        <div
                          className="relative w-full rounded-t-lg bg-[#26372e] transition-all duration-500 hover:bg-[#536159]"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#26372e] px-2 py-1 text-xs text-white group-hover:block">
                            {item.revenue.toLocaleString("pt-AO")} Kz
                          </div>
                        </div>
                      </div>

                      <p className="mt-2 text-center text-xs text-[#89958e]">
                        {item.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isReportLoading && chartData.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-between gap-2 pl-3 text-[10px] text-[#9aa49e]">
              {chartData.map((item) => (
                <span key={item.date}>{item.date}</span>
              ))}
            </div>
          )}
        </div>

        {/* Critical stock */}
        <div className="rounded-2xl border border-[#e7ebe7] bg-white p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold">Stock crítico</h3>
              <p className="mt-1 text-xs text-[#86928b]">
                Produtos que precisam de atenção
              </p>
            </div>

            <button
              onClick={() => navigate("Estoque")}
              className="text-xs font-semibold text-[#145a43] hover:underline"
            >
              Ver estoque
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {inventory
              .filter((p) => p.stock <= p.min_stock)
              .slice(0, 3)
              .map((p) => (
                <div key={p.sku} className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#f5f7f5] text-[#839089]">
                    <Package className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-[#89958e]">
                      Mínimo: {p.min_stock} un.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-700">
                      {p.stock} un.
                    </p>
                    <p className="text-[10px] text-[#9aa49e]">em stock</p>
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={() => showToast("Lista de compras criada")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8df] py-2.5 text-xs font-semibold text-[#145a43] hover:bg-[#f3f8f4]"
          >
            <ClipboardList className="size-4" />
            Criar lista de compras
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e7ebe7] bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-[#edf1ed] p-5 md:flex-row md:items-center md:px-6">
          <div>
            <h3 className="font-bold">Vendas recentes</h3>
            <p className="mt-1 text-xs text-[#86928b]">
              As últimas transações registadas
            </p>
          </div>
          <button
            onClick={() => navigate("Vendas / POS")}
            className="text-xs font-semibold text-[#145a43] hover:underline"
          >
            Ver todas as vendas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="bg-[#fafcfa] text-[11px] uppercase tracking-wide text-[#8b9790]">
                <th className="px-6 py-3 font-semibold">Venda</th>
                <th className="px-6 py-3 font-semibold">Data</th>
                <th className="px-6 py-3 font-semibold">Cliente</th>
                <th className="px-6 py-3 font-semibold">Funcionário</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Pagamento</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 4).map((sale) => (
                <tr
                  key={sale.id}
                  className="border-t border-[#edf1ed] text-[#536159]"
                >
                  <td className="px-6 py-4 font-semibold text-[#26372e]">
                    #{sale.id}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(sale.created_at).toLocaleString("pt-AO")}
                  </td>

                  <td className="px-6 py-4">
                    {sale.customer || "Cliente balcão"}
                  </td>

                  <td className="px-6 py-4">—</td>

                  <td className="px-6 py-4 font-semibold text-[#26372e]">
                    {Number(sale.total).toLocaleString("pt-AO")} Kz
                  </td>

                  <td className="px-6 py-4">{sale.payment_method}</td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Section({
  active,
  query,
  setQuery,
  products,
  inventory,
  setScannerOpen,
  showToast,
  navigate,
  setAddProductOpen,
  addProductOpen,
  reloadProducts,
  isLoadingData,
}: {
  active: string;
  query: string;
  setQuery: (s: string) => void;
  products: products[];
  inventory: InventoryItem[];
  setScannerOpen: (b: boolean) => void;
  showToast: (s: string) => void;
  navigate: (s: string) => void;
  setAddProductOpen: (open: boolean) => void;
  addProductOpen: boolean;
  reloadProducts: () => Promise<void>;
  isLoadingData: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplier, setSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);

  const data =
    active === "Produtos" ? products : active === "Estoque" ? inventory : [];
  const title =
    active === "Produtos"
      ? "Produtos"
      : active === "Estoque"
        ? "Gestão de estoque"
        : active;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        name: String(formData.get("name")),
        sku: String(formData.get("sku")),
        barcode: String(formData.get("barcode") || "") || null,
        category_id: Number(formData.get("category")),
        supplier_id: Number(formData.get("supplier")),
        price: Number(formData.get("price")),
        stock: Number(formData.get("initialStock")),
        min_stock: Number(formData.get("minimumStock")),
      };

      await productService.create(payload);
      await reloadProducts();
      setSaved(true);
      window.setTimeout(() => {
        setAddProductOpen(false);
        setSaved(false);
      }, 900);
    } catch (error) {
      console.error("Error creating product:", error);
      showToast("Error ao criar producto");
    }
  }
  useEffect(() => {
    async function loadFormData() {
      try {
        const [categoriesData, suppliersData] = await Promise.all([
          categoryService.list(),
          supplierService.list(),
        ]);

        setCategories(categoriesData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    }

    loadFormData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-[#748079]">
            Gestão centralizada da sua operação.
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="flex gap-2">
          {active === "Scanner" && (
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#145a43] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ScanLine className="size-4" />
              Abrir câmera
            </button>
          )}
          {["Produtos", "Clientes", "Fornecedores"].includes(active) && (
            <button
              onClick={() => {
                if (active === "Produtos") {
                  setSaved(false);

                  setAddProductOpen(true);
                } else {
                  showToast(`Formulário de ${active.toLowerCase()} aberto`);
                }
              }}
              className="hover:cursor-pointer flex items-center gap-2 rounded-xl bg-[#145a43] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="size-4" />
              Adicionar
            </button>
          )}
        </div>
      </div>
      {active === "Scanner" ? (
        <ScannerIntro open={() => setScannerOpen(true)} products={products} />
      ) : active === "Vendas / POS" ? (
        <Pos showToast={showToast} />
      ) : isLoadingData && ["Produtos", "Estoque"].includes(active) ? (
        <LoadingSpinner message="A carregar dados..." />
      ) : data.length > 0 ? (
        active === "Estoque" ? (
          <InventoryTable
            data={inventory}
            query={query}
            setQuery={setQuery}
            onAdjustStock={(product) => {
              setSelectedProduct(product as unknown as Product);
              setStockAdjustmentOpen(true);
            }}
          />
        ) : (
          <ProductTable
            active={active}
            data={data}
            query={query}
            setQuery={setQuery}
            setScannerOpen={setScannerOpen}
            showToast={showToast}
            onAdJustStock={(product) => {
              setSelectedProduct(product);
              setStockAdjustmentOpen(true);
            }}
            onEditProduct={(product) => {
              setSelectedProduct(product);
              setEditProductOpen(true);
            }}
            onDeleteProduct={async (product) => {
              const confirmed = window.confirm(
                `Tem certeza que deseja eliminar ${product.name}`,
              );

              if (!confirmed) return;

              try {
                await productService.remove(String(product.id));

                await reloadProducts();

                showToast("Produto eliminado com sucesso");
              } catch (error) {
                console.error("Error deleting product:", error);
                showToast("Erro ao eliminar produto");
              }
            }}
          />
        )
      ) : (
        <GenericSection
          active={active}
          showToast={showToast}
          navigate={navigate}
        />
      )}

      {/*stockAdjustmentOpen productTable */}
      {stockAdjustmentOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#243832]/55  backdrop-blur-[5px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#26372e]">Ajustar stock</h3>

                <p className="mt-1 text-sm text-[#86928b]">
                  {selectedProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStockAdjustmentOpen(false)}
                className="rounded-lg p-2 text-[#708078] hover:bg-[#f0f5f1]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-[#f5f8f5] p-4">
              <p className="text-xs text-[#86928b]">Stock atual</p>

              <p className="mt-1 text-2xl font-bold text-[#26372e]">
                {selectedProduct.stock} un.
              </p>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (!selectedProduct) return;

                try {
                  const formData = new FormData(event.currentTarget);
                  const quantity = Number(formData.get("quantity"));

                  await inventoryService.adjust({
                    product_id: selectedProduct.id,
                    quantity,
                  });

                  await reloadProducts();
                  setStockAdjustmentOpen(false);
                  setSelectedProduct(null);

                  showToast("Stock ajustado com sucesso");
                } catch (error) {
                  console.error("Error ajusting stock:", error);
                  showToast("Error ao justar stock");
                }
              }}
            >
              <label className="mb-2 block text-sm font-semibold">
                Quantidade
              </label>

              <input
                name="quantity"
                type="number"
                min="1"
                required
                placeholder="Ex: 10"
                className="w-full rounded-xl border border-[#e1e8e2] px-4 py-3 outline-none focus:border-[#79a98b]"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStockAdjustmentOpen(false)}
                  className="rounded-xl border border-[#e1e8e2] px-4 py-2.5 text-sm font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#006b52] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Ajustar stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* editProduct on productTable */}
      {editProductOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#243832]/55  backdrop-blur-[5px] px-4 py-6">
          <div className="flex max-h-[calc(100vh-48px)] w-full max-w-[672px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#e5ebe8] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-[17px] font-bold text-[#23312d]">
                  Editar produto
                </h2>
                <p className="mt-1 text-[12px] text-[#87958f]">
                  Atualize os dados do produto.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => {
                  setEditProductOpen(false);
                  setSelectedProduct(null);
                }}
                className="rounded-md p-1 text-[#8a9993] hover:bg-[#f2f6f4]"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();

                try {
                  const formData = new FormData(event.currentTarget);

                  const payload = {
                    name: String(formData.get("name")),
                    sku: String(formData.get("sku")),
                    barcode: String(formData.get("barcode") || "") || null,
                    category_id: Number(formData.get("category")),
                    supplier_id: Number(formData.get("supplier")),
                    price: Number(formData.get("price")),
                    stock: selectedProduct.stock,
                    min_stock: Number(formData.get("minimumStock")),
                  };

                  await productService.update(
                    String(selectedProduct.id),
                    payload,
                  );

                  await reloadProducts();

                  setEditProductOpen(false);
                  setSelectedProduct(null);

                  showToast("Produto atualizado com sucesso");
                } catch (error) {
                  console.error("Error updating product:", error);
                  showToast("Erro ao atualizar produto");
                }
              }}
              className="overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <label className="col-span-full flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Nome do produto
                  <input
                    required
                    name="name"
                    defaultValue={selectedProduct.name}
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm outline-none focus:border-[#006b52]"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  SKU
                  <input
                    required
                    name="sku"
                    defaultValue={selectedProduct.sku}
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm outline-none focus:border-[#006b52]"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Código de barras
                  <input
                    name="barcode"
                    inputMode="numeric"
                    defaultValue={selectedProduct.barcode ?? ""}
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm outline-none focus:border-[#006b52]"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Categoria
                  <select
                    name="category"
                    defaultValue={selectedProduct.category_id ?? ""}
                    className="h-11 rounded-[14px] border border-[#dce5e0] bg-white px-3.5 text-sm outline-none focus:border-[#006b52]"
                  >
                    <option value="">Selecione uma categoria</option>

                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Fornecedor
                  <select
                    name="supplier"
                    defaultValue={selectedProduct.supplier_id ?? ""}
                    className="h-11 rounded-[14px] border border-[#dce5e0] bg-white px-3.5 text-sm outline-none focus:border-[#006b52]"
                  >
                    <option value="">Selecione um fornecedor</option>

                    {suppliers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Preço (Kz)
                  <input
                    required
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={selectedProduct.price}
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm outline-none focus:border-[#006b52]"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Stock atual
                  <input
                    disabled
                    value={selectedProduct.stock}
                    className="h-11 rounded-[14px] border border-[#dce5e0] bg-[#f5f8f5] px-3.5 text-sm text-[#7b8982]"
                    readOnly
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Stock mínimo
                  <input
                    required
                    name="minimumStock"
                    type="number"
                    min="0"
                    defaultValue={selectedProduct.min_stock}
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm outline-none focus:border-[#006b52]"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e5ebe8] px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditProductOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="h-11 rounded-[14px] border border-[#dce5e0] px-4 text-sm font-semibold text-[#63736d]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-[14px] bg-[#006b52] px-5 text-sm font-semibold text-white hover:bg-[#005740]"
                >
                  Guardar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#243832]/55 px-4 py-6 backdrop-blur-[5px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            className="flex max-h-[calc(100vh-48px)] w-full max-w-[672px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(29,55,46,0.22)]"
          >
            <div className="flex items-start justify-between border-b border-[#e5ebe8] px-5 py-5 sm:px-6">
              <div>
                <h2
                  id="product-dialog-title"
                  className="text-[17px] font-bold tracking-[-0.01em] text-[#23312d]"
                >
                  Adicionar produto
                </h2>
                <p className="mt-1 text-[12px] text-[#87958f]">
                  Os dados serão enviados para a API de produtos.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => setAddProductOpen(false)}
                className="rounded-md p-1 text-[#8a9993] transition-colors hover:bg-[#f2f6f4] hover:text-[#42534c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b52]"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-5">
                <label className="col-span-full flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Nome do produto
                  <input
                    required
                    name="name"
                    placeholder="Ex: Arroz Tio Lucas 5kg"
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm text-[#33443d] outline-none placeholder:text-[#a8b3ae] focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  SKU
                  <input
                    required
                    name="sku"
                    placeholder="ARZ-005"
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm text-[#33443d] outline-none placeholder:text-[#a8b3ae] focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Código de barras
                  <input
                    name="barcode"
                    inputMode="numeric"
                    placeholder="7891234567890"
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm text-[#33443d] outline-none placeholder:text-[#a8b3ae] focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  />
                </label>

                <label className="relative flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Categoria
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    name="category"
                    className="h-11 appearance-none rounded-[14px] border border-[#dce5e0] bg-white px-3.5 text-sm text-[#52635c] outline-none focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  >
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3 right-3 size-4 text-[#52635c]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Fornecedor
                  <select
                    value={supplier}
                    onChange={(event) => setSupplier(event.target.value)}
                    name="supplier"
                    className="..."
                  >
                    <option value="">Selecione um fornecedor</option>

                    {suppliers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Preço (Kz)
                  <input
                    required
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm text-[#33443d] outline-none focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Stock inicial
                  <input
                    required
                    name="initialStock"
                    type="number"
                    min="0"
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm text-[#33443d] outline-none focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#52635c]">
                  Stock mínimo
                  <input
                    required
                    name="minimumStock"
                    type="number"
                    min="0"
                    className="h-11 rounded-[14px] border border-[#dce5e0] px-3.5 text-sm text-[#33443d] outline-none focus:border-[#006b52] focus:ring-2 focus:ring-[#006b52]/10"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e5ebe8] px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setAddProductOpen(false)}
                  className="h-11 rounded-[14px] border border-[#dce5e0] px-4 text-sm font-semibold text-[#63736d] transition-colors hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b52]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saved}
                  className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#006b52] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#005740] disabled:cursor-default disabled:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b52] focus-visible:ring-offset-2"
                >
                  {saved && <Check aria-hidden="true" className="size-4" />}
                  {saved ? "Produto salvo" : "Guardar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// Products
function ProductTable({
  active,
  data,
  query,
  setQuery,
  setScannerOpen,
  showToast,
  onAdJustStock,
  onEditProduct,
  onDeleteProduct,
}: any) {
  return (
    <div className="rounded-2xl border border-[#e7ebe7] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#edf1ed] p-5 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <h3 className="font-bold">
            {active === "Estoque"
              ? "Posição atual do estoque"
              : "Catálogo de produtos"}
          </h3>
          <p className="mt-1 text-xs text-[#86928b]">
            {data.length} produtos encontrados
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa49e]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar produto ou SKU"
            className="w-full rounded-xl border border-[#e1e8e2] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#79a98b] md:w-72 "
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="bg-[#fafcfa] text-[11px] uppercase tracking-wide text-[#8b9790]">
              <th className="px-6 py-3 font-semibold">Produto</th>
              <th className="px-6 py-3 font-semibold">SKU / Código</th>
              <th className="px-6 py-3 font-semibold">Categoria</th>
              <th className="px-6 py-3 font-semibold">Preço</th>
              <th className="px-6 py-3 font-semibold">Stock</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
              <th className="px-6 py-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p: any) => (
              <tr
                key={p.sku}
                className="border-t border-[#edf1ed] text-[#536159]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#f1f5f2]">
                      <Package className="size-4 text-[#6c8174]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#26372e]">{p.name}</p>
                      <p className="text-xs text-[#95a099]">{p.supplier}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{p.sku}</p>
                  <p className="text-xs text-[#95a099]">{p.barcode}</p>
                </td>
                <td className="px-6 py-4">{p.category}</td>
                <td className="px-6 py-4 font-semibold">
                  {money(Number(p.price))}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      p.stock <= p.min_stock
                        ? "font-bold text-amber-700"
                        : "font-semibold text-[#536159]"
                    }
                  >
                    {p.stock} un.
                  </span>
                  <p className="text-[11px] text-[#9aa49e]">
                    mín. {p.min_stock}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Status value={p.status || "Error"} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setScannerOpen(true)}
                      className="rounded-lg p-2 text-[#708078] hover:bg-[#f0f5f1]"
                      aria-label="Abrir scanner"
                    >
                      <ScanLine className="size-4" />
                    </button>
                    <button
                      onClick={() => onAdJustStock(p)}
                      className="rounded-lg p-2 text-[#708078] hover:bg-[#f0f5f1]"
                      aria-label="Ajustar stock"
                    >
                      <ArrowUpRight className="size-4" />
                    </button>
                    <button
                      onClick={() => onEditProduct(p)}
                      className="rounded-lg p-2 text-[#708078] hover:bg-[#f0f5f1]"
                      aria-label="Editar produto"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p)}
                      className="rounded-lg p-2 text-[#708078] hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar produto"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// Stocks
function InventoryTable({
  data,
  query,
  setQuery,
  onAdjustStock,
}: {
  data: InventoryItem[];
  query: string;
  setQuery: (s: string) => void;
  onAdjustStock: (product: InventoryItem) => void;
}) {
  const filteredData = data.filter((product) => {
    const search = query.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      product.barcode?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="rounded-2xl border border-[#e7ebe7] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#edf1ed] p-5 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <h3 className="font-bold">Posição atual do estoque</h3>

          <p className="mt-1 text-xs text-[#86928b]">
            {filteredData.length} produtos encontrados
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa49e]" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar produto ou SKU"
            className="w-full rounded-xl border border-[#e1e8e2] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#79a98b] md:w-72"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="bg-[#fafcfa] text-[11px] uppercase tracking-wide text-[#8b9790]">
              <th className="px-6 py-3 font-semibold">Produto</th>
              <th className="px-6 py-3 font-semibold">SKU / Código</th>
              <th className="px-6 py-3 font-semibold">Categoria</th>
              <th className="px-6 py-3 font-semibold">Stock</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
              <th className="px-6 py-3 font-semibold">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((product) => {
              const status =
                product.stock === 0
                  ? "Esgotado"
                  : product.stock <= product.min_stock
                    ? "Stock baixo"
                    : "Em stock";

              return (
                <tr
                  key={product.id}
                  className="border-t border-[#edf1ed] text-[#536159]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-[#f1f5f2]">
                        <Package className="size-4 text-[#6c8174]" />
                      </div>

                      <div>
                        <p className="font-semibold text-[#26372e]">
                          {product.name}
                        </p>

                        <p className="text-xs text-[#95a099]">
                          {product.supplier || "Sem fornecedor"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium">{product.sku}</p>

                    <p className="text-xs text-[#95a099]">
                      {product.barcode || "Sem código"}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    {product.category || "Sem categoria"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        product.stock === 0
                          ? "font-bold text-red-600"
                          : product.stock <= product.min_stock
                            ? "font-bold text-amber-700"
                            : "font-semibold text-[#536159]"
                      }
                    >
                      {product.stock} un.
                    </span>

                    <p className="text-[11px] text-[#9aa49e]">
                      mín. {product.min_stock}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <Status value={status} />
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onAdjustStock(product)}
                      className="rounded-lg p-2 text-[#708078] hover:bg-[#f0f5f1]"
                      aria-label="Ajustar stock"
                      title="Ajustar stock"
                    >
                      <ArrowUpRight className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function ScannerIntro({
  open,
  products,
}: {
  open: () => void;
  products: Product[];
}) {
  const [barcode, setBarcode] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl bg-[#173d2e] p-8 text-center text-white">
        <div className="mb-6 flex size-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10">
          <ScanLine className="size-9 text-emerald-200" />
        </div>
        <h3 className="text-2xl font-bold">Scanner de código de barras</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-emerald-100/70">
          Use a câmera do seu dispositivo para consultar produtos rapidamente ou
          adicioná-los a uma venda.
        </p>
        <button
          onClick={open}
          className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#145a43] hover:bg-emerald-50"
        >
          Iniciar scanner
        </button>
        <p className="mt-5 text-xs text-emerald-100/50">
          Compatível com EAN-13, EAN-8, UPC-A e Code 128
        </p>
      </div>
      <div className="rounded-2xl border border-[#e7ebe7] bg-white p-6">
        <h3 className="font-bold">Consulta manual</h3>
        <p className="mt-1 text-sm text-[#86928b]">
          Também pode introduzir o código diretamente.
        </p>
        <div className="mt-6 flex gap-2">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const product = products.find(
                  (item) => item.barcode === barcode.trim(),
                );
                if (!product) {
                  setScannedProduct(null);
                  return;
                }
                setScannedProduct(product);
              }
            }}
            placeholder="Ex: 7891234567890"
            className="min-w-0 flex-1 rounded-xl border border-[#e1e8e2] px-3 py-3 text-sm outline-none focus:border-[#79a98b]"
          />
          <button
            onClick={() => {
              const product = products.find(
                (item) => item.barcode === barcode.trim(),
              );

              if (!product) {
                setScannedProduct(null);
                return;
              }
              setScannedProduct(product);
              console.log(product);
            }}
            className="rounded-xl bg-[#eaf3ec] px-4 text-sm font-semibold text-[#145a43]"
          >
            Consultar
          </button>
        </div>
        {scannedProduct && (
          <div className="mt-6 rounded-xl border border-[#e1e8e2] bg-[#f7faf7] p-4">
            <p className="text-xs font-bold text-[#738078]">
              Produto encontrado
            </p>

            <div className="mt-3">
              <p className="text-base font-bold text-[#173d2e]">
                {scannedProduct.name}
              </p>

              <p className="mt-1 text-sm text-[#86928b]">
                Código: {scannedProduct.barcode}
              </p>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[#86928b]">Preço</span>
                <span className="font-semibold">
                  {money(scannedProduct.price)}
                </span>
              </div>

              <div className="mt-1 flex justify-between text-sm">
                <span className="text-[#86928b]">Stock</span>
                <span className="font-semibold">{scannedProduct.stock}</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 rounded-xl bg-[#f7faf7] p-4">
          <p className="text-xs font-bold text-[#738078]">Dica rápida</p>
          <p className="mt-2 text-sm leading-6 text-[#8a968f]">
            Aponte a câmera para o código de barras e mantenha o produto estável
            dentro da área de leitura.
          </p>
        </div>
      </div>
    </div>
  );
}

function ScannerModal({
  close,
  showToast,
}: {
  close: () => void;
  showToast: (s: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102b20]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e7ebe7] px-5 py-4">
          <div>
            <h3 className="font-bold">Ler código de barras</h3>
            <p className="text-xs text-[#86928b]">
              Aproxime o código da câmera
            </p>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-2 text-[#84918b] hover:bg-[#f3f6f3]"
            aria-label="Fechar scanner"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="relative flex aspect-video items-center justify-center bg-[#102b20]">
          <div className="absolute inset-10 rounded-xl border-2 border-emerald-300/80">
            <span className="absolute -top-0.5 left-1/2 h-0.5 w-1/2 -translate-x-1/2 bg-emerald-300 shadow-[0_0_14px_#86efac]" />
          </div>
          <ScanLine className="size-12 text-emerald-200/70" />
        </div>
        <div className="p-5">
          <label className="text-xs font-semibold text-[#64736b]">
            Código manual
          </label>
          <div className="mt-2 flex gap-2">
            <input
              placeholder="Introduzir código"
              className="min-w-0 flex-1 rounded-xl border border-[#e1e8e2] px-3 py-2.5 text-sm outline-none focus:border-[#79a98b]"
            />
            <button
              onClick={() => {
                showToast("Produto encontrado");
                close();
              }}
              className="rounded-xl bg-[#145a43] px-4 text-sm font-semibold text-white"
            >
              Consultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pos({ showToast }: { showToast: (s: string) => void }) {
  const [posProducts, setPosProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<(Product & { qty: number })[]>([]);
  const [search, setSearch] = useState("");
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productService.list();

        const formattedProducts = data.map((product) => ({
          ...product,
          min: product.min_stock,
          status:
            product.stock === 0
              ? "Esgotado"
              : product.stock <= product.min_stock
                ? "Stock baixo"
                : "Em stock",
        }));

        setPosProducts(formattedProducts);
      } catch (error) {
        console.error("Error loading POS products:", error);
        showToast("Erro ao carregar produtos");
      }
    }
    async function loadCustomers() {
      try {
        const data = await customerService.list();
        setCustomers(data);
      } catch (error) {
        console.error("Error loading customers:", error);
        showToast("Erro ao carregar clientes");
      }
    }
    loadCustomers();
    loadProducts();
  }, [showToast]);

  const filteredProducts = posProducts.filter((product) => {
    const value = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(value) ||
      product.sku.toLowerCase().includes(value) ||
      product.barcode?.toLowerCase().includes(value)
    );
  });

  const total = cart.reduce(
    (sum, product) => sum + Number(product.price) * product.qty,
    0,
  );
  const paymentMethodLabels: Record<string, string> = {
    cash: "Numerário",
    tpa: "TPA / Multicaixa",
    transfer: "Transferência",
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-[#e7ebe7] bg-white p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa49e]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              const code = search.trim();

              if (!code) return;

              const product = posProducts.find((item) => item.barcode === code);

              if (!product) {
                showToast("Produto não encontrado");
                return;
              }

              if (product.stock <= 0) {
                showToast("Produto sem stock");
                return;
              }

              const existing = cart.find((item) => item.id === product.id);

              if (existing) {
                if (existing.qty >= product.stock) {
                  showToast("Quantidade superior ao stock disponível");
                  return;
                }

                setCart(
                  cart.map((item) =>
                    item.id === product.id
                      ? { ...item, qty: item.qty + 1 }
                      : item,
                  ),
                );
              } else {
                setCart([...cart, { ...product, qty: 1 }]);
              }

              setSearch("");
              searchInputRef.current?.focus();
            }}
            ref={searchInputRef}
            placeholder="Pesquisar produto por nome, SKU ou código de barras"
            className="w-full rounded-xl border border-[#e1e8e2] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#79a98b]"
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {filteredProducts.slice(0, 4).map((p) => (
            <button
              key={p.sku}
              onClick={() => {
                if (p.stock <= 0) {
                  showToast("Produto sem stock");
                  return;
                }

                const existing = cart.find((item) => item.id === p.id);

                if (existing) {
                  if (existing.qty >= p.stock) {
                    showToast("Quantidade superior ao stock disponível");
                    return;
                  }

                  setCart(
                    cart.map((item) =>
                      item.id === p.id ? { ...item, qty: item.qty + 1 } : item,
                    ),
                  );
                } else {
                  setCart([...cart, { ...p, qty: 1 }]);
                }
              }}
              className="flex items-center gap-3 rounded-xl border border-[#edf1ed] p-3 text-left hover:border-[#a8cdb4] hover:bg-[#f8fbf8]"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#f1f5f2]">
                <Package className="size-5 text-[#6c8174]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="mt-1 text-xs text-[#145a43]">{money(p.price)}</p>
                <p className="text-[11px] text-[#89958e]">Stock: {p.stock}</p>
              </div>
              <Plus className="size-4 text-[#789084]" />
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[#e7ebe7] bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Venda atual</h3>
          <span className="rounded-full bg-[#eaf3ec] px-2.5 py-1 text-xs font-bold text-[#145a43]">
            {cart.length} itens
          </span>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {cart.map((p, i) => (
            <div
              key={`${p.sku}-${i}`}
              className="flex items-center gap-3 border-b border-[#f0f3f0] pb-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-[#89958e]">{money(p.price)}</p>
                <p className="text-[11px] text-[#89958e]">
                  Stock disponível: {p.stock}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (p.qty === 1) {
                      setCart(cart.filter((item) => item.id !== p.id));
                      return;
                    }

                    setCart(
                      cart.map((item) =>
                        item.id === p.id
                          ? { ...item, qty: item.qty - 1 }
                          : item,
                      ),
                    );
                  }}
                  className="flex size-8 items-center justify-center rounded-lg border border-[#e1e8e2] text-sm hover:bg-[#f5f8f5]"
                >
                  −
                </button>

                <span className="w-6 text-center text-sm font-semibold">
                  {p.qty}
                </span>

                <button
                  onClick={() => {
                    if (p.qty >= p.stock) {
                      showToast("Quantidade superior ao stock disponível");
                      return;
                    }

                    setCart(
                      cart.map((item) =>
                        item.id === p.id
                          ? { ...item, qty: item.qty + 1 }
                          : item,
                      ),
                    );
                  }}
                  className="flex size-8 items-center justify-center rounded-lg border border-[#e1e8e2] text-sm hover:bg-[#f5f8f5]"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-[#536159]">
            Cliente
          </label>

          <select
            value={selectedCustomer}
            onChange={(e) => {
              if (e.target.value === "new") {
                // We'll handle the new customer form next
                setShowNewCustomer(true);
                return;
              }

              setSelectedCustomer(e.target.value);
            }}
            className="w-full rounded-xl border border-[#e1e8e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#79a98b]"
          >
            <option value="">Cliente não identificado</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}

            <option value="new">+ Novo cliente</option>
          </select>

          {showNewCustomer && (
            <div className="mt-3 rounded-xl border border-[#e1e8e2] bg-[#f8faf8] p-4">
              <p className="mb-3 text-sm font-semibold text-[#536159]">
                Novo cliente
              </p>

              <input
                name="name"
                placeholder="Nome *"
                className="mb-2 w-full rounded-xl border border-[#e1e8e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#79a98b]"
              />

              <input
                name="phone"
                placeholder="Telefone"
                className="mb-2 w-full rounded-xl border border-[#e1e8e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#79a98b]"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="mb-3 w-full rounded-xl border border-[#e1e8e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#79a98b]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="flex-1 rounded-xl border border-[#dfe5e0] bg-white px-3 py-2 text-sm font-semibold text-[#536159]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={async (e) => {
                    const form = e.currentTarget.closest("div")?.parentElement;

                    if (!form) return;

                    const nameInput = form.querySelector(
                      'input[name="name"]',
                    ) as HTMLInputElement;

                    const phoneInput = form.querySelector(
                      'input[name="phone"]',
                    ) as HTMLInputElement;

                    const emailInput = form.querySelector(
                      'input[name="email"]',
                    ) as HTMLInputElement;

                    if (!nameInput.value.trim()) {
                      showToast("O nome do cliente é obrigatório");
                      return;
                    }

                    try {
                      const newCustomer = await customerService.create({
                        name: nameInput.value.trim(),
                        phone: phoneInput.value.trim() || null,
                        email: emailInput.value.trim() || null,
                      });

                      setCustomers((current) => [...current, newCustomer]);

                      setSelectedCustomer(String(newCustomer.id));

                      setShowNewCustomer(false);

                      showToast("Cliente criado com sucesso");
                    } catch (error) {
                      console.error("Error creating customer:", error);
                      showToast("Erro ao criar cliente");
                    }
                  }}
                  className="flex-1 rounded-xl bg-[#79a98b] px-3 py-2 text-sm font-semibold text-white"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-[#536159]">
            Método de pagamento
          </label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-xl border border-[#e1e8e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#79a98b]"
          >
            <option value="cash">Numerário</option>
            <option value="tpa">TPA / Multicaixa</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-[#edf1ed] pt-4 text-sm">
          <div className="flex justify-between text-[#7d8982]">
            <span>Subtotal</span>
            <span>{money(total)}</span>
          </div>
          <div className="flex justify-between text-[#7d8982]">
            <span>Desconto</span>
            <span>0 Kz</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-[#145a43]">{money(total)}</span>
          </div>
        </div>
        <button
          onClick={async () => {
            if (cart.length === 0) {
              showToast("O carrinho está vazio");
              return;
            }

            try {
              const payload = {
                customer_id: selectedCustomer ? Number(selectedCustomer) : null,
                payment_method: paymentMethod,
                items: cart.map((product) => ({
                  product_id: product.id,
                  quantity: product.qty,
                })),
              };

              const result = await salesService.create(payload);

              setCompletedSale({
                ...result,
                items: cart,
                total,
                customer: customers.find(
                  (customer) => customer.id === Number(selectedCustomer),
                ),
              });

              setCart([]);
              setSelectedCustomer();
              setPaymentMethod("cash");
              showToast("Venda realizada com sucesso");
            } catch (error) {
              console.error("Error creating sale:", error);
              showToast("Erro ao realizar venda");
            }
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#145a43] py-3 text-sm font-bold text-white"
        >
          <CreditCard className="size-4" />
          Concluir venda
        </button>
      </div>

      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="receipt-print w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-center">
              <h2 className="text-lg font-bold">
                Comércio a Retalho de Francisco Fernandes, Lda.
              </h2>

              <p className="mt-1 text-xs text-[#89958e]">Recibo de Venda</p>
            </div>

            <div className="my-5 border-y border-dashed border-[#dfe5e0] py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#89958e]">Venda nº</span>
                <span className="font-semibold">#{completedSale.sale.id}</span>
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-[#89958e]">Data</span>
                <span>
                  {new Date(completedSale.sale.created_at).toLocaleString(
                    "pt-AO",
                  )}
                </span>
              </div>
            </div>

            {completedSale.customer && (
              <div className="mt-3 border-t border-dashed border-[#dfe5e0] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#89958e]">Cliente</span>
                  <span className="font-semibold">
                    {completedSale.customer.name}
                  </span>
                </div>

                {completedSale.customer.phone && (
                  <div className="mt-1 flex justify-between">
                    <span className="text-[#89958e]">Telefone</span>
                    <span>{completedSale.customer.phone}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {completedSale.items.map((item: Product & { qty: number }) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.name}</p>

                    <p className="text-xs text-[#89958e]">
                      {item.qty} × {money(item.price)}
                    </p>
                  </div>

                  <span className="font-semibold">
                    {money(Number(item.price) * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[#edf1ed] pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span className="text-[#145a43]">
                  {money(completedSale.total)}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm text-[#89958e]">
                <span>Pagamento</span>
                <span>
                  {paymentMethodLabels[completedSale.sale.payment_method] ??
                    completedSale.sale.payment_method}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 rounded-xl border border-[#dfe5e0] py-3 text-sm font-semibold"
              >
                Fechar
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl bg-[#145a43] py-3 text-sm font-bold text-white"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GenericSection({
  active,
  showToast,
  navigate,
}: {
  active: string;
  showToast: (s: string) => void;
  navigate: (s: string) => void;
}) {
  const labels: Record<string, string> = {
    Clientes: "Acompanhe clientes, compras e histórico de relacionamento.",
    Fornecedores: "Organize os parceiros e fornecedores do seu negócio.",
    Relatórios: "Consulte o desempenho comercial e operacional.",
    Funcionários: "Gira os acessos e funções da sua equipa.",
    Configurações: "Configure os dados base do seu estabelecimento.",
  };
  return (
    <div className="rounded-2xl border border-[#e7ebe7] bg-white p-8">
      <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#eaf3ec] text-[#145a43]">
          <FileText className="size-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold">{active}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#86928b]">
          {labels[active] ?? "Área de gestão da aplicação."}
        </p>
        <div className="mt-7 flex gap-2">
          <button
            onClick={() =>
              showToast("Funcionalidade pronta para ligação à API")
            }
            className="rounded-xl bg-[#145a43] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Adicionar registo
          </button>
          {active === "Relatórios" && (
            <button
              onClick={() => showToast("Relatório exportado em CSV")}
              className="rounded-xl border border-[#dce8df] px-4 py-2.5 text-sm font-semibold text-[#145a43]"
            >
              Exportar CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Login
function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const data = await authService.login({
        identifier,
        password,
      });

      console.log("Logged-in user:", data.user);

      localStorage.setItem("token", data.token);
      console.log("Logged-in user:", data.user);

      onLogin();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#edf5f1] px-5 py-10 text-[#20332d]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9rem] top-[-8rem] size-[28rem] rounded-full bg-[#d4ebe1] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-12rem] right-[-7rem] size-[30rem] rounded-full bg-[#dceee8] blur-3xl"
      />

      <section className="relative w-full max-w-[430px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[14px] bg-[#006b52] text-white shadow-[0_8px_18px_rgba(0,107,82,0.18)]">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#006b52]">
              Retail system
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#6c8178]">
              Gestão de varejo
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/80 bg-white/95 p-7 shadow-[0_24px_70px_rgba(40,80,64,0.13)] backdrop-blur sm:p-9">
          <div className="mb-7">
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#20332d]">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#71827a]">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-5"
            noValidate
          >
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#40564d]">
              Usuário ou email
              <div className="relative">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#91a39b]"
                />
                <input
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Digite seu usuário ou email"
                  className="h-12 w-full rounded-[14px] border border-[#dbe6e0] bg-white pl-11 pr-4 text-sm font-normal text-[#263b33] outline-none transition placeholder:text-[#a7b5af] focus:border-[#006b52] focus:ring-4 focus:ring-[#006b52]/10"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[#40564d]">
              Senha
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#91a39b]"
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  className="h-12 w-full rounded-[14px] border border-[#dbe6e0] bg-white pl-11 pr-12 text-sm font-normal text-[#263b33] outline-none transition placeholder:text-[#a7b5af] focus:border-[#006b52] focus:ring-4 focus:ring-[#006b52]/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#91a39b] transition hover:bg-[#f0f6f3] hover:text-[#006b52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b52]"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-[18px]" />
                  ) : (
                    <Eye aria-hidden="true" className="size-[18px]" />
                  )}
                </button>
              </div>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#f2d3d1] bg-[#fff5f4] px-3.5 py-3 text-sm font-medium text-[#a23e3a]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#006b52] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,107,82,0.18)] transition hover:bg-[#005740] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006b52]/20 disabled:cursor-wait disabled:opacity-70"
            >
              <LogIn aria-hidden="true" className="size-[18px]" />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs leading-5 text-[#91a099]">
            Acesso restrito a usuários autorizados.
            <br />
            Se você não possui acesso, contate o administrador.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#91a099]">
          © 2026 Retail management system
        </p>
      </section>
    </main>
  );
}
