import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, Users, Building2, User, ChevronRight, CheckCircle2, Clock, Send, Search, Check, ArrowLeft, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/services/api';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import { exportSubmissionToWord } from '@/lib/export-document';
import { useToast } from '@/hooks/use-toast';

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

interface Matter {
  _id: string;
  title: string;
  clientName?: string;
  practiceArea?: string;
  status: string;
  dealValue?: { amount: number; currency: string };
  completionDate?: string;
}

interface SubmissionMatter {
  _id: string;
  title: string;
  clientName?: string;
  serviceDescription?: string;
  opposingCounsel?: Array<{
    firmName: string;
    representedParty: string;
    practiceArea?: string;
  }>;
}

interface Submission {
  _id: string;
  title: string;
  rankingType: 'firm' | 'department' | 'lawyer';
  targetDirectories: string[];
  status: string;
  year: number;
  departmentName?: string;
  matterIds: SubmissionMatter[];
  createdAt: string;
  submissionDeadline?: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  exported: 'bg-purple-100 text-purple-700',
  submitted: 'bg-emerald-100 text-emerald-700',
};

const rankingTypeIcons = {
  firm: Building2,
  department: Users,
  lawyer: User,
};

const directoryLabels: Record<string, string> = {
  chambers: 'Chambers',
  legal_500: 'Legal 500',
  duns_100: "Dun's 100",
};

export function SubmissionsPage() {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get<Submission[]>('/submissions');
      setSubmissions(response.data);
    } catch {
      // Mock data for demo
      setSubmissions([
        {
          _id: '1',
          title: 'Chambers 2024 - Corporate/M&A',
          rankingType: 'department',
          targetDirectories: ['chambers'],
          status: 'in_progress',
          year: 2024,
          departmentName: 'Corporate/M&A',
          matterIds: [
            {
              _id: 'm1',
              title: 'Acme Corp Acquisition of Beta Inc',
              clientName: 'Acme Corporation',
              serviceDescription: 'Represented Acme Corporation in its $150M acquisition of Beta Inc, a leading technology company. The transaction involved complex cross-border regulatory approvals and innovative deal structuring.',
              opposingCounsel: [
                { firmName: 'Herzog Fox & Neeman', representedParty: 'Beta Inc', practiceArea: 'Corporate/M&A' }
              ]
            },
            {
              _id: 'm2',
              title: 'Gamma Holdings Restructuring',
              clientName: 'Gamma Holdings Ltd',
              serviceDescription: 'Led the restructuring of Gamma Holdings, coordinating with multiple stakeholders including bondholders and senior lenders to achieve a successful outcome.',
            }
          ],
          createdAt: '2024-01-15T10:00:00Z',
          submissionDeadline: '2024-02-15T23:59:59Z',
        },
        {
          _id: '2',
          title: "Dun's 100 2024 - Sarah Cohen",
          rankingType: 'lawyer',
          targetDirectories: ['duns_100'],
          status: 'review',
          year: 2024,
          matterIds: [
            {
              _id: 'm3',
              title: 'Delta Industries IPO',
              clientName: 'Delta Industries',
              serviceDescription: 'Advised Delta Industries on its landmark $500M IPO on the Tel Aviv Stock Exchange, one of the largest tech IPOs of the year.',
            },
            {
              _id: 'm4',
              title: 'TechStart Series B Financing',
              clientName: 'TechStart Ltd',
              serviceDescription: 'Represented TechStart in its $30M Series B financing round led by major international venture capital firms.',
            }
          ],
          createdAt: '2024-01-10T14:30:00Z',
        },
        {
          _id: '3',
          title: 'Legal 500 2024 - Firm Submission',
          rankingType: 'firm',
          targetDirectories: ['legal_500'],
          status: 'draft',
          year: 2024,
          matterIds: [],
          createdAt: '2024-01-20T09:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'review':
        return <Users className="h-4 w-4" />;
      case 'approved':
      case 'exported':
      case 'submitted':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (showWizard) {
    return <SubmissionWizard onClose={() => { setShowWizard(false); fetchSubmissions(); }} />;
  }

  if (selectedSubmission) {
    return (
      <SubmissionDetailView
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('submissions.title')}</h1>
          <p className="text-muted-foreground">{t('submissions.subtitle')}</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t('submissions.newSubmission')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('submissions.totalSubmissions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('submissions.inProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {submissions.filter(s => s.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('submissions.pendingReview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'review').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('submissions.submitted')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('submissions.allSubmissions')}</CardTitle>
          <CardDescription>{t('submissions.clickToViewDetails')}</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t('submissions.noSubmissionsYet')}</h3>
              <p className="mt-2 text-muted-foreground">
                {t('submissions.createFirstSubmission')}
              </p>
              <Button className="mt-4" onClick={() => setShowWizard(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t('submissions.newSubmission')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const RankingIcon = rankingTypeIcons[submission.rankingType];
                return (
                  <div
                    key={submission._id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <RankingIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{submission.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{submission.matterIds.length} {t('common.matters')}</span>
                          <span>•</span>
                          <span>{formatDate(submission.createdAt)}</span>
                          {submission.submissionDeadline && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">
                                {t('submissions.due')}: {formatDate(submission.submissionDeadline)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {submission.targetDirectories.map((dir) => (
                          <Badge key={dir} variant="outline">
                            {directoryLabels[dir] || dir}
                          </Badge>
                        ))}
                      </div>
                      <Badge className={cn('gap-1', statusColors[submission.status])}>
                        {getStatusIcon(submission.status)}
                        {submission.status.replace('_', ' ')}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Submission Wizard Component
interface WizardProps {
  onClose: () => void;
}

type RankingType = 'firm' | 'department' | 'lawyer';
type Directory = 'chambers' | 'legal_500' | 'duns_100';

function SubmissionWizard({ onClose }: WizardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [rankingType, setRankingType] = useState<RankingType | null>(null);
  const [selectedDirectories, setSelectedDirectories] = useState<Directory[]>([]);
  const [selectedMatters, setSelectedMatters] = useState<string[]>([]);
  const [availableMatters, setAvailableMatters] = useState<Matter[]>([]);
  const [matterSearchQuery, setMatterSearchQuery] = useState('');
  const [isLoadingMatters, setIsLoadingMatters] = useState(false);
  const [title, setTitle] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch matters when reaching step 3
  useEffect(() => {
    if (step === 3) {
      fetchMatters();
    }
  }, [step]);

  const fetchMatters = async () => {
    setIsLoadingMatters(true);
    try {
      const response = await api.get<{ matters: Matter[] }>('/matters');
      setAvailableMatters(response.data.matters || []);
    } catch {
      // Mock data for demo
      setAvailableMatters([
        {
          _id: '1',
          title: 'Acme Corp Acquisition of Beta Inc',
          clientName: 'Acme Corporation',
          practiceArea: 'Corporate/M&A',
          status: 'approved',
          dealValue: { amount: 150000000, currency: 'USD' },
          completionDate: '2024-01-15',
        },
        {
          _id: '2',
          title: 'Gamma Holdings Restructuring',
          clientName: 'Gamma Holdings Ltd',
          practiceArea: 'Restructuring & Insolvency',
          status: 'review',
          dealValue: { amount: 75000000, currency: 'USD' },
        },
        {
          _id: '3',
          title: 'Delta Industries IPO',
          clientName: 'Delta Industries',
          practiceArea: 'Capital Markets',
          status: 'draft',
          dealValue: { amount: 500000000, currency: 'USD' },
        },
        {
          _id: '4',
          title: 'Epsilon Capital Fund Formation',
          clientName: 'Epsilon Capital',
          practiceArea: 'Private Equity',
          status: 'approved',
          dealValue: { amount: 250000000, currency: 'USD' },
          completionDate: '2023-12-20',
        },
        {
          _id: '5',
          title: 'TechStart Series B Financing',
          clientName: 'TechStart Ltd',
          practiceArea: 'Venture Capital',
          status: 'approved',
          dealValue: { amount: 30000000, currency: 'USD' },
          completionDate: '2024-02-01',
        },
      ]);
    } finally {
      setIsLoadingMatters(false);
    }
  };

  const toggleMatter = (matterId: string) => {
    setSelectedMatters(prev =>
      prev.includes(matterId)
        ? prev.filter(id => id !== matterId)
        : prev.length < 20
          ? [...prev, matterId]
          : prev
    );
  };

  const filteredMatters = availableMatters.filter(matter => {
    const matchesSearch =
      matter.title.toLowerCase().includes(matterSearchQuery.toLowerCase()) ||
      matter.clientName?.toLowerCase().includes(matterSearchQuery.toLowerCase());
    const matchesPracticeArea = rankingType !== 'department' || !departmentName || matter.practiceArea === departmentName;
    return matchesSearch && matchesPracticeArea;
  });

  const steps = [
    { number: 1, title: t('submissions.rankingType'), description: t('submissions.chooseWhatToRank') },
    { number: 2, title: t('submissions.directories'), description: t('submissions.selectTargetDirectories') },
    { number: 3, title: t('nav.matters'), description: t('submissions.selectKeyMatters') },
    { number: 4, title: t('submissions.review'), description: t('submissions.confirmAndCreate') },
  ];

  const handleNext = () => {
    if (step === 1 && !rankingType) {
      toast({ variant: 'destructive', title: t('submissions.pleaseSelectRankingType') });
      return;
    }
    if (step === 1 && rankingType === 'department' && !departmentName) {
      toast({ variant: 'destructive', title: t('submissions.pleaseSelectPracticeArea') });
      return;
    }
    if (step === 2 && selectedDirectories.length === 0) {
      toast({ variant: 'destructive', title: t('submissions.pleaseSelectAtLeastOneDirectory') });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/submissions', {
        title: title || `${selectedDirectories.map(d => directoryLabels[d]).join(', ')} ${new Date().getFullYear()} - ${rankingType === 'department' ? departmentName : rankingType}`,
        rankingType,
        targetDirectories: selectedDirectories,
        matterIds: selectedMatters,
        departmentName: rankingType === 'department' ? departmentName : undefined,
        year: new Date().getFullYear(),
      });
      toast({ title: t('submissions.submissionCreated'), description: t('submissions.submissionCreatedDescription') });
      onClose();
    } catch {
      toast({ variant: 'destructive', title: t('submissions.failedToCreateSubmission') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDirectory = (dir: Directory) => {
    setSelectedDirectories(prev =>
      prev.includes(dir) ? prev.filter(d => d !== dir) : [...prev, dir]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('submissions.newSubmission')}</h1>
          <p className="text-muted-foreground">{t('submissions.createNewSubmission')}</p>
        </div>
        <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  step >= s.number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.number ? <CheckCircle2 className="h-5 w-5" /> : s.number}
              </div>
              <div className="hidden sm:block">
                <p className={cn('text-sm font-medium', step >= s.number ? '' : 'text-muted-foreground')}>
                  {s.title}
                </p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('mx-4 h-px w-12 sm:w-24', step > s.number ? 'bg-primary' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Ranking Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('submissions.whatTypeOfRanking')}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {([
                  { type: 'firm', icon: Building2, title: t('submissions.firmRanking'), description: t('submissions.rankEntireFirm') },
                  { type: 'department', icon: Users, title: t('submissions.departmentRanking'), description: t('submissions.rankSpecificDepartment') },
                  { type: 'lawyer', icon: User, title: t('submissions.lawyerRanking'), description: t('submissions.rankIndividualLawyer') },
                ] as const).map((option) => (
                  <div
                    key={option.type}
                    onClick={() => setRankingType(option.type)}
                    className={cn(
                      'cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                      rankingType === option.type ? 'border-primary bg-primary/5' : 'border-muted'
                    )}
                  >
                    <option.icon className={cn('h-8 w-8 mb-2', rankingType === option.type ? 'text-primary' : 'text-muted-foreground')} />
                    <h3 className="font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                ))}
              </div>
              {rankingType === 'department' && (
                <div className="mt-4">
                  <label className="text-sm font-medium block mb-2">{t('submissions.departmentPracticeArea')}</label>
                  <Select value={departmentName} onValueChange={setDepartmentName}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('submissions.selectPracticeArea')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PRACTICE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Directories */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('submissions.whichDirectories')}</h2>
              <p className="text-sm text-muted-foreground">{t('submissions.selectOneOrMore')}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {([
                  { dir: 'chambers', title: t('submissions.chambersAndPartners'), description: t('submissions.chambersDescription') },
                  { dir: 'legal_500', title: t('submissions.legal500'), description: t('submissions.legal500Description') },
                  { dir: 'duns_100', title: t('submissions.duns100'), description: t('submissions.duns100Description') },
                ] as const).map((option) => (
                  <div
                    key={option.dir}
                    onClick={() => toggleDirectory(option.dir)}
                    className={cn(
                      'cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                      selectedDirectories.includes(option.dir) ? 'border-primary bg-primary/5' : 'border-muted'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className={cn('h-6 w-6', selectedDirectories.includes(option.dir) ? 'text-primary' : 'text-muted-foreground')} />
                      {selectedDirectories.includes(option.dir) && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <h3 className="font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Matters */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{t('submissions.selectKeyMattersTitle')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('submissions.selectKeyMattersDescription')}
                  </p>
                </div>
                <Badge variant="outline" className="text-sm">
                  {selectedMatters.length}/20 {t('common.selected')}
                </Badge>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('submissions.searchMattersByTitleOrClient')}
                  className="ps-10"
                  value={matterSearchQuery}
                  onChange={(e) => setMatterSearchQuery(e.target.value)}
                />
              </div>

              {/* Matter List */}
              <div className="rounded-lg border max-h-96 overflow-y-auto">
                {isLoadingMatters ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : filteredMatters.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {matterSearchQuery ? t('submissions.noMattersMatchingSearch') : t('submissions.noMattersAvailable')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMatters.map((matter) => {
                      const isSelected = selectedMatters.includes(matter._id);
                      return (
                        <div
                          key={matter._id}
                          onClick={() => toggleMatter(matter._id)}
                          className={cn(
                            'flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50',
                            isSelected && 'bg-primary/5'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded border',
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{matter.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{matter.clientName}</span>
                              {matter.practiceArea && (
                                <>
                                  <span>•</span>
                                  <span>{matter.practiceArea}</span>
                                </>
                              )}
                              {matter.dealValue && (
                                <>
                                  <span>•</span>
                                  <span>{formatCurrency(matter.dealValue.amount, matter.dealValue.currency)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              matter.status === 'approved' && 'border-green-500 text-green-600',
                              matter.status === 'review' && 'border-yellow-500 text-yellow-600',
                              matter.status === 'draft' && 'border-gray-400 text-gray-500'
                            )}
                          >
                            {matter.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: t('common.comingSoon'), description: 'iManage integration' })}
                >
                  {t('submissions.browseiManage')}
                </Button>
                {selectedMatters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMatters([])}
                  >
                    {t('common.clearSelection')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('submissions.reviewSubmission')}</h2>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('submissions.rankingType')}:</span>
                  <span className="font-medium capitalize">{rankingType}</span>
                </div>
                {rankingType === 'department' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('submissions.department')}:</span>
                    <span className="font-medium">{departmentName || t('submissions.notSpecified')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('submissions.targetDirectories')}:</span>
                  <span className="font-medium">{selectedDirectories.map(d => directoryLabels[d]).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('submissions.mattersSelected')}:</span>
                  <span className="font-medium">{selectedMatters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.year')}:</span>
                  <span className="font-medium">{new Date().getFullYear()}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t('submissions.submissionTitleOptional')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${selectedDirectories.map(d => directoryLabels[d]).join(', ')} ${new Date().getFullYear()} - ${rankingType === 'department' ? departmentName : rankingType}`}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
          {step === 1 ? t('common.cancel') : t('common.back')}
        </Button>
        {step < 4 ? (
          <Button onClick={handleNext}>
            {t('common.next')}
            <ChevronRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? t('common.creating') : t('submissions.createSubmission')}
            <Send className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Submission Detail View Component
interface DetailViewProps {
  submission: Submission;
  onBack: () => void;
}

function SubmissionDetailView({ submission, onBack }: DetailViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const RankingIcon = rankingTypeIcons[submission.rankingType];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSubmissionToWord(submission);
      toast({ title: t('submissions.exportComplete'), description: t('submissions.documentDownloadedSuccessfully') });
    } catch (error) {
      console.error('Export error:', error);
      toast({ variant: 'destructive', title: t('submissions.exportFailed'), description: t('submissions.failedToGenerateDocument') });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateContent = async () => {
    if (submission.matterIds.length === 0) {
      toast({ variant: 'destructive', title: t('submissions.noMattersSelectedForGeneration'), description: t('submissions.pleaseAddMattersBeforeGenerating') });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation (in production, this would call the API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate content based on submission type and matters
      const dirNames = submission.targetDirectories.map(d => directoryLabels[d] || d).join(' / ');
      let content = `# ${submission.title}\n\n`;
      content += `**Submission for:** ${dirNames}\n`;
      content += `**Year:** ${submission.year}\n`;
      if (submission.departmentName) {
        content += `**Practice Area:** ${submission.departmentName}\n`;
      }
      content += `\n---\n\n`;
      content += `## Key Matters\n\n`;

      submission.matterIds.forEach((matter, index) => {
        content += `### ${index + 1}. ${matter.title}\n\n`;
        if (matter.clientName) {
          content += `**Client:** ${matter.clientName}\n\n`;
        }
        if (matter.serviceDescription) {
          content += `**${t('submissions.servicesProvided')}:**\n${matter.serviceDescription}\n\n`;
        }
        if (matter.opposingCounsel && matter.opposingCounsel.length > 0) {
          content += `**${t('submissions.otherLawFirmsInvolved')}:**\n`;
          matter.opposingCounsel.forEach(counsel => {
            content += `- ${counsel.firmName} (${t('submissions.representing')} ${counsel.representedParty}${counsel.practiceArea ? `, ${counsel.practiceArea}` : ''})\n`;
          });
          content += '\n';
        }
        content += `---\n\n`;
      });

      setGeneratedContent(content);
      toast({ title: t('submissions.contentGeneratedTitle'), description: t('submissions.reviewGeneratedContent') });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ variant: 'destructive', title: t('submissions.generationFailed'), description: t('submissions.failedToGenerateContent') });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{submission.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <RankingIcon className="h-4 w-4" />
              <span className="capitalize">{submission.rankingType} {t('common.ranking')}</span>
              <span>•</span>
              <span>{submission.year}</span>
              {submission.submissionDeadline && (
                <>
                  <span>•</span>
                  <span className="text-orange-600">{t('submissions.due')}: {formatDate(submission.submissionDeadline)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="me-2 h-4 w-4" />
            {isExporting ? t('submissions.exporting') : t('common.export')}
          </Button>
          <Button variant="outline">
            <Edit className="me-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* Status and Directories */}
      <div className="flex items-center gap-3">
        <Badge className={cn('gap-1', statusColors[submission.status])}>
          {submission.status.replace('_', ' ')}
        </Badge>
        {submission.targetDirectories.map((dir) => (
          <Badge key={dir} variant="outline">
            {directoryLabels[dir] || dir}
          </Badge>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Submission Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('submissions.submissionDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('submissions.rankingType')}</p>
                  <p className="font-medium capitalize">{submission.rankingType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.year')}</p>
                  <p className="font-medium">{submission.year}</p>
                </div>
                {submission.departmentName && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('submissions.department')}</p>
                    <p className="font-medium">{submission.departmentName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">{t('submissions.created')}</p>
                  <p className="font-medium">{formatDate(submission.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matters Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('submissions.selectedMatters')} ({submission.matterIds.length})</CardTitle>
              <CardDescription>{t('submissions.keyMattersIncluded')}</CardDescription>
            </CardHeader>
            <CardContent>
              {submission.matterIds.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">{t('submissions.noMattersSelectedYet')}</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="me-2 h-4 w-4" />
                    {t('submissions.addMatters')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {submission.matterIds.map((matter, index) => (
                    <div
                      key={matter._id || index}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{matter.title}</p>
                            {matter.clientName && (
                              <p className="text-sm text-muted-foreground">{matter.clientName}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      {matter.serviceDescription && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 ml-11">
                          {matter.serviceDescription}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>{t('submissions.generatedContentPreview')}</CardTitle>
              <CardDescription>{t('submissions.aiGeneratedContent')}</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="rounded-lg border bg-white p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-sans">{generatedContent}</pre>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground italic">
                    {t('submissions.contentWillBeGenerated')}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleGenerateContent} disabled={isGenerating}>
                  {isGenerating ? t('submissions.generating') : generatedContent ? t('submissions.regenerateContent') : t('submissions.generateContent')}
                </Button>
                {generatedContent && (
                  <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                    <Download className="me-2 h-4 w-4" />
                    {isExporting ? t('submissions.exporting') : t('submissions.exportToWord')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('submissions.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="me-2 h-4 w-4" />
                {t('submissions.addMatters')}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="me-2 h-4 w-4" />
                {t('submissions.addReferees')}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="me-2 h-4 w-4" />
                {t('submissions.generateDocument')}
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleExport} disabled={isExporting}>
                <Download className="me-2 h-4 w-4" />
                {isExporting ? t('submissions.exporting') : t('submissions.exportToWord')}
              </Button>
            </CardContent>
          </Card>

          {/* Workflow Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('submissions.workflow')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: t('submissions.draft'), status: 'completed' },
                  { step: t('submissions.mattersSelectedStep'), status: submission.matterIds.length > 0 ? 'completed' : 'pending' },
                  { step: t('submissions.contentGenerated'), status: 'pending' },
                  { step: t('submissions.reviewStep'), status: 'pending' },
                  { step: t('submissions.approvedStep'), status: 'pending' },
                  { step: t('submissions.exportedStep'), status: 'pending' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        item.status === 'completed' ? 'font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {item.step}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
