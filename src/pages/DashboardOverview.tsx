import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { ArtikelEinstellen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatCurrency, displayLookup, lookupKey } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatCard } from '@/components/StatCard';
import { ArtikelEinstellenDialog } from '@/components/dialogs/ArtikelEinstellenDialog';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import {
  AlertCircle,
  Plus,
  Search,
  Tag,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Pencil,
  Trash2,
  Package,
  Zap,
  Sofa,
  Shirt,
  Bike,
  Home,
  Trees,
  Car,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';

const CATEGORIES: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Alle', icon: <ShoppingBag size={14} /> },
  { key: 'elektronik', label: 'Elektronik', icon: <Zap size={14} /> },
  { key: 'moebel', label: 'Möbel', icon: <Sofa size={14} /> },
  { key: 'kleidung', label: 'Kleidung', icon: <Shirt size={14} /> },
  { key: 'sport_freizeit', label: 'Sport & Freizeit', icon: <Bike size={14} /> },
  { key: 'haushalt', label: 'Haushalt', icon: <Home size={14} /> },
  { key: 'garten', label: 'Garten', icon: <Trees size={14} /> },
  { key: 'fahrzeuge', label: 'Fahrzeuge', icon: <Car size={14} /> },
  { key: 'buecher_medien', label: 'Bücher & Medien', icon: <BookOpen size={14} /> },
  { key: 'sonstiges', label: 'Sonstiges', icon: <MoreHorizontal size={14} /> },
];

const CONDITION_COLORS: Record<string, string> = {
  neu: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  wie_neu: 'bg-green-100 text-green-700 border-green-200',
  sehr_gut: 'bg-blue-100 text-blue-700 border-blue-200',
  gut: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  akzeptabel: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function DashboardOverview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ArtikelEinstellen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArtikelEinstellen | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { artikelEinstellen, loading, error, fetchAll } = useDashboardData();

  const filtered = useMemo(() => {
    return artikelEinstellen.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.fields.artikelname?.toLowerCase().includes(q) ||
        item.fields.beschreibung?.toLowerCase().includes(q) ||
        item.fields.stadt?.toLowerCase().includes(q);
      const matchCategory =
        activeCategory === 'all' || lookupKey(item.fields.kategorie) === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [artikelEinstellen, searchQuery, activeCategory]);

  const stats = useMemo(() => {
    const total = artikelEinstellen.length;
    const avgPrice =
      total > 0
        ? artikelEinstellen.reduce((sum, a) => sum + (a.fields.preis ?? 0), 0) / total
        : 0;
    const neuCount = artikelEinstellen.filter(
      (a) => lookupKey(a.fields.zustand) === 'neu'
    ).length;
    return { total, avgPrice, neuCount };
  }, [artikelEinstellen]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteArtikelEinstellenEntry(deleteTarget.record_id);
    setDeleteTarget(null);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Marktplatz</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Alle Angebote auf einen Blick</p>
        </div>
        <Button
          onClick={() => { setEditRecord(null); setDialogOpen(true); }}
          className="shrink-0 gap-2"
        >
          <Plus size={16} />
          Artikel einstellen
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Inserate"
          value={String(stats.total)}
          description="Aktive Angebote"
          icon={<ShoppingBag size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Durchschnittspreis"
          value={formatCurrency(stats.avgPrice)}
          description="Aller Artikel"
          icon={<TrendingUp size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Neu"
          value={String(stats.neuCount)}
          description="Neuwertige Artikel"
          icon={<Tag size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Artikel suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat.key
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border border-dashed border-border">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Package size={24} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Keine Artikel gefunden</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || activeCategory !== 'all'
                ? 'Versuche eine andere Suche oder Kategorie.'
                : 'Stelle deinen ersten Artikel ein!'}
            </p>
          </div>
          {!searchQuery && activeCategory === 'all' && (
            <Button variant="outline" size="sm" onClick={() => { setEditRecord(null); setDialogOpen(true); }}>
              <Plus size={14} className="mr-1.5" />
              Jetzt einstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <ArticleCard
              key={item.record_id}
              item={item}
              onEdit={() => { setEditRecord(item); setDialogOpen(true); }}
              onDelete={() => setDeleteTarget(item)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ArtikelEinstellenDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (fields) => {
          if (editRecord) {
            await LivingAppsService.updateArtikelEinstellenEntry(editRecord.record_id, fields);
          } else {
            await LivingAppsService.createArtikelEinstellenEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editRecord?.fields}
        enablePhotoScan={AI_PHOTO_SCAN['ArtikelEinstellen']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Artikel löschen"
        description={`Möchtest du "${deleteTarget?.fields.artikelname ?? 'diesen Artikel'}" wirklich löschen?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ArticleCard({
  item,
  onEdit,
  onDelete,
}: {
  item: ArtikelEinstellen;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const zustandKey = lookupKey(item.fields.zustand);
  const conditionClass = zustandKey ? (CONDITION_COLORS[zustandKey] ?? '') : '';

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image / placeholder */}
      <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
        {item.fields.fotos ? (
          <img
            src={item.fields.fotos}
            alt={item.fields.artikelname ?? 'Artikel'}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Package size={40} className="text-muted-foreground/30" />
        )}
      </div>

      {/* Action buttons (hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <Pencil size={13} className="text-foreground" />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 flex-1">
            {item.fields.artikelname ?? '(Kein Titel)'}
          </h3>
          {zustandKey && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${conditionClass}`}>
              {displayLookup(item.fields.zustand)}
            </span>
          )}
        </div>

        {item.fields.beschreibung && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.fields.beschreibung}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-base font-bold text-primary">
            {item.fields.preis != null ? formatCurrency(item.fields.preis) : '—'}
          </span>
          {(item.fields.stadt || item.fields.postleitzahl) && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={11} />
              {[item.fields.postleitzahl, item.fields.stadt].filter(Boolean).join(' ')}
            </span>
          )}
        </div>

        {item.fields.kategorie && (
          <div>
            <Badge variant="secondary" className="text-[11px] px-2 py-0">
              {displayLookup(item.fields.kategorie)}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-10 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
