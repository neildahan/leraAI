import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Eye, Edit, Trash2, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Opposing counsel - other law firms involved
interface OpposingCounsel {
  firmName: string;           // Law firm name
  representedParty: string;   // Party they represented
  practiceArea?: string;      // Practice area
}

interface Matter {
  _id: string;
  title: string;
  clientName?: string;
  counterparties?: string[];
  opposingCounsel?: OpposingCounsel[];  // Other law firms involved
  serviceDescription?: string;           // Detailed service description
  practiceArea?: string;
  status: 'draft' | 'review' | 'approved' | 'exported';
  dealValue?: { amount: number; currency: string; isEstimated?: boolean };
  confidenceScore?: number;
  submissionScore?: number;
  completionDate?: string;
  notes?: string;
  createdAt: string;
}

interface MatterFormData {
  title: string;
  clientName: string;
  counterparties: string;
  opposingCounsel: OpposingCounsel[];  // Other law firms involved
  serviceDescription: string;           // Detailed service description
  practiceArea: string;
  dealAmount: string;
  dealCurrency: string;
  isEstimated: boolean;
  completionDate: string;
  notes: string;
}

const PRACTICE_AREAS = [
  'Corporate/M&A',
  'Banking & Finance',
  'Capital Markets',
  'Private Equity',
  'Venture Capital',
  'Commercial Litigation',
  'Dispute Resolution',
  'Arbitration',
  'Real Estate',
  'Construction',
  'Employment',
  'Tax',
  'Intellectual Property',
  'Technology',
  'Data Privacy',
  'Restructuring & Insolvency',
  'Competition/Antitrust',
  'Regulatory',
  'Energy & Infrastructure',
  'Healthcare & Life Sciences',
  'Media & Entertainment',
  'White Collar Crime',
  'Family Law',
  'Trusts & Estates',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'ILS', 'CHF', 'JPY'];

const statusConfig = {
  draft: { labelKey: 'matters.status.draft', className: 'bg-gray-100 text-gray-700' },
  review: { labelKey: 'matters.status.review', className: 'bg-yellow-100 text-yellow-700' },
  approved: { labelKey: 'matters.status.approved', className: 'bg-green-100 text-green-700' },
  exported: { labelKey: 'matters.status.exported', className: 'bg-blue-100 text-blue-700' },
};

const emptyFormData: MatterFormData = {
  title: '',
  clientName: '',
  counterparties: '',
  opposingCounsel: [],
  serviceDescription: '',
  practiceArea: '',
  dealAmount: '',
  dealCurrency: 'USD',
  isEstimated: false,
  completionDate: '',
  notes: '',
};

export function MattersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [formData, setFormData] = useState<MatterFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMatters();
  }, []);

  const fetchMatters = async () => {
    try {
      const response = await api.get<{ matters: Matter[] }>('/matters');
      setMatters(response.data.matters || []);
    } catch {
      // Mock data for demo
      setMatters([
        {
          _id: '1',
          title: 'Acme Corp Acquisition of Beta Inc',
          clientName: 'Acme Corporation',
          counterparties: ['Beta Inc', 'Beta Shareholders'],
          practiceArea: 'Corporate/M&A',
          status: 'approved',
          dealValue: { amount: 150000000, currency: 'USD' },
          confidenceScore: 92,
          submissionScore: 88,
          completionDate: '2024-01-15',
          createdAt: '2024-01-10T10:00:00Z',
        },
        {
          _id: '2',
          title: 'Gamma Holdings Restructuring',
          clientName: 'Gamma Holdings Ltd',
          counterparties: ['Bondholders Committee', 'Senior Lenders'],
          practiceArea: 'Restructuring & Insolvency',
          status: 'review',
          dealValue: { amount: 75000000, currency: 'USD' },
          confidenceScore: 87,
          createdAt: '2024-01-08T14:30:00Z',
        },
        {
          _id: '3',
          title: 'Delta Industries IPO',
          clientName: 'Delta Industries',
          practiceArea: 'Capital Markets',
          status: 'draft',
          dealValue: { amount: 500000000, currency: 'USD', isEstimated: true },
          createdAt: '2024-01-05T09:00:00Z',
        },
        {
          _id: '4',
          title: 'Epsilon Capital Fund Formation',
          clientName: 'Epsilon Capital',
          practiceArea: 'Private Equity',
          status: 'exported',
          dealValue: { amount: 250000000, currency: 'USD' },
          confidenceScore: 95,
          submissionScore: 92,
          completionDate: '2023-12-20',
          createdAt: '2024-01-01T11:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMatter = async () => {
    if (!formData.title || !formData.clientName) {
      toast({ variant: 'destructive', title: t('matters.fillRequiredFields') });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        clientName: formData.clientName,
        counterparties: formData.counterparties ? formData.counterparties.split(',').map(s => s.trim()) : [],
        opposingCounsel: formData.opposingCounsel.length > 0 ? formData.opposingCounsel : undefined,
        serviceDescription: formData.serviceDescription || undefined,
        practiceArea: formData.practiceArea,
        dealValue: formData.dealAmount ? {
          amount: parseFloat(formData.dealAmount),
          currency: formData.dealCurrency,
          isEstimated: formData.isEstimated,
        } : undefined,
        completionDate: formData.completionDate || undefined,
        notes: formData.notes || undefined,
      };

      await api.post('/matters', payload);
      toast({ title: t('matters.matterCreated'), description: t('matters.matterCreatedDescription') });
      setIsCreateDialogOpen(false);
      setFormData(emptyFormData);
      fetchMatters();
    } catch {
      // For demo, add to local state
      const newMatter: Matter = {
        _id: Date.now().toString(),
        title: formData.title,
        clientName: formData.clientName,
        counterparties: formData.counterparties ? formData.counterparties.split(',').map(s => s.trim()) : [],
        opposingCounsel: formData.opposingCounsel.length > 0 ? formData.opposingCounsel : undefined,
        serviceDescription: formData.serviceDescription || undefined,
        practiceArea: formData.practiceArea,
        status: 'draft',
        dealValue: formData.dealAmount ? {
          amount: parseFloat(formData.dealAmount),
          currency: formData.dealCurrency,
          isEstimated: formData.isEstimated,
        } : undefined,
        completionDate: formData.completionDate,
        createdAt: new Date().toISOString(),
      };
      setMatters(prev => [newMatter, ...prev]);
      toast({ title: t('matters.matterCreated'), description: t('matters.matterCreatedDemo') });
      setIsCreateDialogOpen(false);
      setFormData(emptyFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatter = async () => {
    if (!selectedMatter) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/matters/${selectedMatter._id}`);
      toast({ title: t('matters.matterDeleted') });
    } catch {
      // Demo mode - remove from local state
      setMatters(prev => prev.filter(m => m._id !== selectedMatter._id));
      toast({ title: t('matters.matterDeletedDemo') });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setSelectedMatter(null);
    }
  };

  const openViewDialog = (matter: Matter) => {
    setSelectedMatter(matter);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (matter: Matter) => {
    setSelectedMatter(matter);
    setFormData({
      title: matter.title,
      clientName: matter.clientName || '',
      counterparties: matter.counterparties?.join(', ') || '',
      opposingCounsel: matter.opposingCounsel || [],
      serviceDescription: matter.serviceDescription || '',
      practiceArea: matter.practiceArea || '',
      dealAmount: matter.dealValue?.amount?.toString() || '',
      dealCurrency: matter.dealValue?.currency || 'USD',
      isEstimated: matter.dealValue?.isEstimated || false,
      completionDate: matter.completionDate || '',
      notes: matter.notes || '',
    });
    setIsCreateDialogOpen(true);
  };

  const openDeleteDialog = (matter: Matter) => {
    setSelectedMatter(matter);
    setIsDeleteDialogOpen(true);
  };

  const filteredMatters = matters.filter((matter) => {
    const matchesSearch =
      matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || matter.status === statusFilter;
    const matchesPracticeArea = practiceAreaFilter === 'all' || matter.practiceArea === practiceAreaFilter;
    return matchesSearch && matchesStatus && matchesPracticeArea;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('matters.title')}</h1>
          <p className="text-muted-foreground">{t('matters.subtitle')}</p>
        </div>
        <Button onClick={() => { setSelectedMatter(null); setFormData(emptyFormData); setIsCreateDialogOpen(true); }}>
          <Plus className="me-2 h-4 w-4" />
          {t('matters.newMatter')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{matters.length}</div>
            <p className="text-xs text-muted-foreground">{t('matters.totalMatters')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {matters.filter(m => m.status === 'draft' || m.status === 'review').length}
            </div>
            <p className="text-xs text-muted-foreground">{t('matters.inProgress')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {matters.filter(m => m.status === 'approved' || m.status === 'exported').length}
            </div>
            <p className="text-xs text-muted-foreground">{t('matters.readyForSubmission')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(
                matters.reduce((sum, m) => sum + (m.dealValue?.amount || 0), 0),
                'USD'
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('matters.totalDealValue')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('matters.searchMatters')}
                className="ps-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('matters.allStatus')}</SelectItem>
                  <SelectItem value="draft">{t('matters.status.draft')}</SelectItem>
                  <SelectItem value="review">{t('matters.status.review')}</SelectItem>
                  <SelectItem value="approved">{t('matters.status.approved')}</SelectItem>
                  <SelectItem value="exported">{t('matters.status.exported')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('matters.practiceArea')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('matters.allPracticeAreas')}</SelectItem>
                  {PRACTICE_AREAS.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredMatters.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t('matters.noMattersFound')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || practiceAreaFilter !== 'all'
                  ? t('matters.tryAdjustingFilters')
                  : t('matters.createFirstMatter')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{t('common.matter')}</th>
                    <th className="pb-3 font-medium">{t('matters.client')}</th>
                    <th className="pb-3 font-medium">{t('matters.practiceArea')}</th>
                    <th className="pb-3 font-medium">{t('common.status')}</th>
                    <th className="pb-3 font-medium">{t('matters.dealValue')}</th>
                    <th className="pb-3 font-medium">{t('matters.score')}</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatters.map((matter) => (
                    <tr key={matter._id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-4">
                        <p className="font-medium">{matter.title}</p>
                        {matter.counterparties && matter.counterparties.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            vs. {matter.counterparties.slice(0, 2).join(', ')}
                            {matter.counterparties.length > 2 && ` +${matter.counterparties.length - 2}`}
                          </p>
                        )}
                      </td>
                      <td className="py-4 text-sm">{matter.clientName || '-'}</td>
                      <td className="py-4">
                        {matter.practiceArea ? (
                          <Badge variant="outline" className="text-xs">{matter.practiceArea}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusConfig[matter.status].className
                          )}
                        >
                          {t(statusConfig[matter.status].labelKey)}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        {matter.dealValue ? (
                          <span>
                            {formatCurrency(matter.dealValue.amount, matter.dealValue.currency)}
                            {matter.dealValue.isEstimated && (
                              <span className="text-xs text-muted-foreground ml-1">(est.)</span>
                            )}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4">
                        {matter.submissionScore ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-12 rounded-full bg-gray-200">
                              <div
                                className={cn(
                                  'h-2 rounded-full',
                                  matter.submissionScore >= 85
                                    ? 'bg-green-500'
                                    : matter.submissionScore >= 70
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                )}
                                style={{ width: `${matter.submissionScore}%` }}
                              />
                            </div>
                            <span className="text-xs">{matter.submissionScore}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(matter)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(matter)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(matter)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMatter ? t('matters.editMatter') : t('matters.createNewMatter')}</DialogTitle>
            <DialogDescription>
              {selectedMatter ? t('matters.updateMatterDetails') : t('matters.enterDetailsForNewMatter')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('matters.matterTitle')} *</Label>
              <Input
                id="title"
                placeholder="e.g., Acme Corp Acquisition of Beta Inc"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName">{t('matters.clientName')} *</Label>
                <Input
                  id="clientName"
                  placeholder="e.g., Acme Corporation"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="practiceArea">{t('matters.practiceArea')}</Label>
                <Select
                  value={formData.practiceArea}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, practiceArea: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('matters.selectPracticeArea')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRACTICE_AREAS.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="counterparties">{t('matters.counterparties')}</Label>
              <Input
                id="counterparties"
                placeholder={t('matters.counterpartiesPlaceholder')}
                value={formData.counterparties}
                onChange={(e) => setFormData(prev => ({ ...prev, counterparties: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{t('matters.counterpartiesHelp')}</p>
            </div>

            {/* Service Description */}
            <div className="grid gap-2">
              <Label htmlFor="serviceDescription">{t('matters.serviceDescription')}</Label>
              <Textarea
                id="serviceDescription"
                placeholder={t('matters.serviceDescriptionPlaceholder')}
                value={formData.serviceDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {t('matters.serviceDescriptionHelp')}
              </p>
            </div>

            {/* Opposing Counsel */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{t('matters.opposingCounsel')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    opposingCounsel: [...prev.opposingCounsel, { firmName: '', representedParty: '', practiceArea: '' }]
                  }))}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t('matters.addFirm')}
                </Button>
              </div>
              {formData.opposingCounsel.length === 0 && (
                <p className="text-xs text-muted-foreground">{t('matters.noOpposingCounsel')}</p>
              )}
              {formData.opposingCounsel.map((counsel, index) => (
                <div key={index} className="grid gap-2 p-3 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">{t('matters.lawFirmNumber', { number: index + 1 })}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        opposingCounsel: prev.opposingCounsel.filter((_, i) => i !== index)
                      }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder={t('matters.firmName')}
                      value={counsel.firmName}
                      onChange={(e) => {
                        const updated = [...formData.opposingCounsel];
                        updated[index] = { ...updated[index], firmName: e.target.value };
                        setFormData(prev => ({ ...prev, opposingCounsel: updated }));
                      }}
                    />
                    <Input
                      placeholder={t('matters.representedParty')}
                      value={counsel.representedParty}
                      onChange={(e) => {
                        const updated = [...formData.opposingCounsel];
                        updated[index] = { ...updated[index], representedParty: e.target.value };
                        setFormData(prev => ({ ...prev, opposingCounsel: updated }));
                      }}
                    />
                    <Select
                      value={counsel.practiceArea || ''}
                      onValueChange={(value) => {
                        const updated = [...formData.opposingCounsel];
                        updated[index] = { ...updated[index], practiceArea: value };
                        setFormData(prev => ({ ...prev, opposingCounsel: updated }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('matters.practiceArea')} />
                      </SelectTrigger>
                      <SelectContent>
                        {PRACTICE_AREAS.map(area => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dealAmount">{t('matters.dealValue')}</Label>
                <Input
                  id="dealAmount"
                  type="number"
                  placeholder="150000000"
                  value={formData.dealAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, dealAmount: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dealCurrency">{t('matters.currency')}</Label>
                <Select
                  value={formData.dealCurrency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dealCurrency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(curr => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="completionDate">{t('matters.completionDate')}</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEstimated"
                checked={formData.isEstimated}
                onChange={(e) => setFormData(prev => ({ ...prev, isEstimated: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isEstimated" className="text-sm font-normal">{t('matters.dealValueIsEstimated')}</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t('matters.notes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('matters.notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateMatter} disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : selectedMatter ? t('matters.saveChanges') : t('matters.createMatter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMatter?.title}</DialogTitle>
            <DialogDescription>{t('matters.matterDetails')}</DialogDescription>
          </DialogHeader>

          {selectedMatter && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.client')}</p>
                  <p className="font-medium">{selectedMatter.clientName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.practiceArea')}</p>
                  <p className="font-medium">{selectedMatter.practiceArea || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.status')}</p>
                  <Badge className={cn('mt-1', statusConfig[selectedMatter.status].className)}>
                    {t(statusConfig[selectedMatter.status].labelKey)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.dealValue')}</p>
                  <p className="font-medium">
                    {selectedMatter.dealValue
                      ? `${formatCurrency(selectedMatter.dealValue.amount, selectedMatter.dealValue.currency)}${selectedMatter.dealValue.isEstimated ? ` (${t('common.est')})` : ''}`
                      : '-'}
                  </p>
                </div>
              </div>
              {selectedMatter.counterparties && selectedMatter.counterparties.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.counterparties')}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMatter.counterparties.map((cp, i) => (
                      <Badge key={i} variant="outline">{cp}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedMatter.serviceDescription && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.serviceDescription')}</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedMatter.serviceDescription}</p>
                </div>
              )}
              {selectedMatter.opposingCounsel && selectedMatter.opposingCounsel.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.opposingCounsel')}</p>
                  <div className="mt-2 space-y-2">
                    {selectedMatter.opposingCounsel.map((counsel, i) => (
                      <div key={i} className="text-sm p-2 border rounded bg-muted/30">
                        <span className="font-medium">{counsel.firmName}</span>
                        <span className="text-muted-foreground"> {t('submissions.representing')} </span>
                        <span>{counsel.representedParty}</span>
                        {counsel.practiceArea && (
                          <span className="text-muted-foreground"> ({counsel.practiceArea})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.submissionScore')}</p>
                  <p className="font-medium">{selectedMatter.submissionScore ? `${selectedMatter.submissionScore}/100` : t('matters.notScored')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.completionDate')}</p>
                  <p className="font-medium">{selectedMatter.completionDate ? formatDate(selectedMatter.completionDate) : '-'}</p>
                </div>
              </div>
              {selectedMatter.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('matters.notes')}</p>
                  <p className="text-sm mt-1">{selectedMatter.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t('common.close')}
            </Button>
            <Button onClick={() => { setIsViewDialogOpen(false); if (selectedMatter) openEditDialog(selectedMatter); }}>
              {t('matters.editMatter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('matters.deleteMatter')}</DialogTitle>
            <DialogDescription>
              {t('matters.deleteConfirmation', { title: selectedMatter?.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteMatter} disabled={isSubmitting}>
              {isSubmitting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
