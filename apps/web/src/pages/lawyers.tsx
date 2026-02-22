import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, User, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Lawyer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  title: string;
  practiceAreas: string[];
  department?: string;
  previousRankings: { directory: string; year: number; ranking: string }[];
}

const levelColors: Record<string, string> = {
  partner: 'bg-lera-100 text-lera-800',
  senior_partner: 'bg-purple-100 text-purple-700',
  managing_partner: 'bg-indigo-100 text-indigo-700',
  counsel: 'bg-green-100 text-green-700',
  senior_associate: 'bg-yellow-100 text-yellow-700',
  associate: 'bg-gray-100 text-gray-700',
};

export function LawyersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const response = await api.get<Lawyer[]>('/lawyers');
      setLawyers(response.data);
    } catch {
      // Mock data for demo - realistic Israeli law firm data
      setLawyers([
        {
          _id: '1',
          firstName: 'יוסי',
          lastName: 'כהן',
          email: 'yossi.cohen@firm.co.il',
          level: 'managing_partner',
          title: 'שותף מנהל, ראש מחלקת M&A',
          practiceAreas: ['corporate', 'high_tech', 'capital_markets'],
          department: 'Corporate',
          previousRankings: [
            { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה' },
            { directory: 'Chambers', year: 2025, ranking: 'Band 1' },
            { directory: 'Legal 500', year: 2025, ranking: 'Leading Individual' },
          ],
        },
        {
          _id: '2',
          firstName: 'מיכל',
          lastName: 'לוי',
          email: 'michal.levi@firm.co.il',
          level: 'senior_partner',
          title: 'שותפה בכירה, ראש מחלקת היי-טק',
          practiceAreas: ['high_tech', 'venture_capital', 'corporate'],
          department: 'High-Tech',
          previousRankings: [
            { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה' },
            { directory: 'Chambers', year: 2025, ranking: 'Band 1' },
          ],
        },
        {
          _id: '3',
          firstName: 'דוד',
          lastName: 'שמעוני',
          email: 'david.shimoni@firm.co.il',
          level: 'senior_partner',
          title: 'שותף בכיר, ליטיגציה מסחרית',
          practiceAreas: ['litigation', 'arbitration', 'antitrust'],
          department: 'Litigation',
          previousRankings: [
            { directory: "Dun's 100", year: 2025, ranking: 'טבלה שנייה' },
            { directory: 'Chambers', year: 2025, ranking: 'Band 2' },
          ],
        },
        {
          _id: '4',
          firstName: 'רונית',
          lastName: 'אברהם',
          email: 'ronit.avraham@firm.co.il',
          level: 'partner',
          title: 'שותפה, נדל"ן ותכנון ובנייה',
          practiceAreas: ['real_estate', 'planning_construction', 'corporate'],
          department: 'Real Estate',
          previousRankings: [
            { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה' },
          ],
        },
        {
          _id: '5',
          firstName: 'עמית',
          lastName: 'גולדשטיין',
          email: 'amit.goldstein@firm.co.il',
          level: 'partner',
          title: 'שותף, בנקאות ומימון',
          practiceAreas: ['banking', 'project_finance', 'capital_markets'],
          department: 'Banking & Finance',
          previousRankings: [
            { directory: 'Legal 500', year: 2025, ranking: 'Recommended' },
          ],
        },
        {
          _id: '6',
          firstName: 'נועה',
          lastName: 'פרידמן',
          email: 'noa.friedman@firm.co.il',
          level: 'counsel',
          title: 'עורכת דין בכירה, מיסים',
          practiceAreas: ['tax', 'corporate', 'capital_markets'],
          department: 'Tax',
          previousRankings: [],
        },
        {
          _id: '7',
          firstName: 'אלון',
          lastName: 'ברקוביץ',
          email: 'alon.berkowitz@firm.co.il',
          level: 'senior_associate',
          title: 'עורך דין בכיר, היי-טק',
          practiceAreas: ['high_tech', 'venture_capital', 'intellectual_property'],
          department: 'High-Tech',
          previousRankings: [],
        },
        {
          _id: '8',
          firstName: 'שירה',
          lastName: 'מזרחי',
          email: 'shira.mizrachi@firm.co.il',
          level: 'associate',
          title: 'עורכת דין, תאגידים',
          practiceAreas: ['corporate', 'capital_markets'],
          department: 'Corporate',
          previousRankings: [],
        },
        {
          _id: '9',
          firstName: 'איתן',
          lastName: 'רוזנברג',
          email: 'eitan.rosenberg@firm.co.il',
          level: 'partner',
          title: 'שותף, דיני עבודה',
          practiceAreas: ['labor', 'litigation', 'corporate'],
          department: 'Labor',
          previousRankings: [
            { directory: "Dun's 100", year: 2025, ranking: 'טבלה שנייה' },
          ],
        },
        {
          _id: '10',
          firstName: 'תמר',
          lastName: 'הלוי',
          email: 'tamar.halevi@firm.co.il',
          level: 'senior_partner',
          title: 'שותפה בכירה, קניין רוחני',
          practiceAreas: ['intellectual_property', 'high_tech', 'litigation'],
          department: 'IP',
          previousRankings: [
            { directory: 'Chambers', year: 2025, ranking: 'Band 1' },
            { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.practiceAreas.some((area) => area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('lawyers.title')}</h1>
          <p className="text-muted-foreground">{t('lawyers.subtitle')}</p>
        </div>
        <Button onClick={() => toast({ title: t('common.comingSoon'), description: t('lawyers.addLawyerForm') })}>
          <Plus className="me-2 h-4 w-4" />
          {t('lawyers.newLawyer')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('lawyers.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('lawyers.totalLawyers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawyers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('lawyers.partners')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {lawyers.filter(l => l.level.includes('partner')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('lawyers.withRankings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lawyers.filter(l => l.previousRankings.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('lawyers.departments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(lawyers.map(l => l.department).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lawyers List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('lawyers.allLawyers')}</CardTitle>
          <CardDescription>{t('lawyers.profilesForSubmissions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLawyers.length === 0 ? (
            <div className="py-12 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t('lawyers.noLawyersFound')}</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? t('lawyers.tryDifferentSearch') : t('lawyers.addFirstLawyer')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLawyers.map((lawyer) => (
                <div
                  key={lawyer._id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {lawyer.firstName} {lawyer.lastName}
                        </h3>
                        <Badge className={levelColors[lawyer.level]}>
                          {t(`lawyers.levels.${lawyer.level}`) || lawyer.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lawyer.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {lawyer.practiceAreas.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lawyer.previousRankings.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          {lawyer.previousRankings.length} {t(lawyer.previousRankings.length === 1 ? 'common.ranking' : 'common.rankings')}
                        </span>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      {t('lawyers.viewProfile')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
