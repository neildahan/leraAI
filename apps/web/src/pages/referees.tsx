import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Users, Mail, Phone, Building2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Referee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  position?: string;
  relationshipType?: string;
  relationshipYears?: number;
  matterReferences: { matterTitle: string }[];
  status: string;
}

export function RefereesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [referees, setReferees] = useState<Referee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: { color: 'bg-gray-100 text-gray-700', icon: <Clock className="h-3 w-3" /> },
    contacted: { color: 'bg-blue-100 text-blue-700', icon: <Mail className="h-3 w-3" /> },
    confirmed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    declined: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  };

  useEffect(() => {
    fetchReferees();
  }, []);

  const fetchReferees = async () => {
    try {
      const response = await api.get<Referee[]>('/referees');
      setReferees(response.data);
    } catch {
      // Mock data for demo - realistic Israeli client contacts
      setReferees([
        {
          _id: '1',
          firstName: 'אורי',
          lastName: 'לוינסון',
          email: 'ori.levinson@intel.com',
          phone: '+972-54-777-8899',
          company: 'Intel Israel',
          title: 'VP & General Counsel',
          position: 'סמנכ"ל ויועץ משפטי ראשי',
          relationshipType: 'לקוח',
          relationshipYears: 8,
          matterReferences: [
            { matterTitle: 'רכישת מודולר מערכות' },
            { matterTitle: 'רכישת Mobileye' },
            { matterTitle: 'הסכמי R&D' },
          ],
          status: 'confirmed',
        },
        {
          _id: '2',
          firstName: 'דנה',
          lastName: 'שפירא',
          email: 'dana.shapira@azurim.co.il',
          phone: '+972-3-555-1234',
          company: 'אזורים קבוצת השקעות',
          title: 'מנכ"לית',
          position: 'Chief Executive Officer',
          relationshipType: 'לקוח',
          relationshipYears: 12,
          matterReferences: [
            { matterTitle: 'פרויקט פארק הים הרצליה' },
            { matterTitle: 'מגדלי עזריאלי ת"א' },
            { matterTitle: 'התחדשות עירונית רמת גן' },
          ],
          status: 'confirmed',
        },
        {
          _id: '3',
          firstName: 'יונתן',
          lastName: 'גולדברג',
          email: 'jonathan@fintechsolutions.io',
          phone: '+972-52-888-9999',
          company: 'FinTech Solutions',
          title: 'Founder & CEO',
          position: 'מייסד ומנכ"ל',
          relationshipType: 'לקוח',
          relationshipYears: 5,
          matterReferences: [
            { matterTitle: 'סבב גיוס C' },
            { matterTitle: 'סבב גיוס B' },
            { matterTitle: 'רישיון בנק ישראל' },
          ],
          status: 'confirmed',
        },
        {
          _id: '4',
          firstName: 'רן',
          lastName: 'כרמלי',
          email: 'ran.carmeli@viola.vc',
          phone: '+972-3-684-1000',
          company: 'Viola Ventures',
          title: 'General Partner',
          position: 'שותף כללי',
          relationshipType: 'לקוח',
          relationshipYears: 10,
          matterReferences: [
            { matterTitle: 'השקעה ב-FinTech Solutions' },
            { matterTitle: 'השקעה ב-CyberStart' },
          ],
          status: 'contacted',
        },
        {
          _id: '5',
          firstName: 'מיכאל',
          lastName: 'וייס',
          email: 'michael.weiss@leumi.co.il',
          phone: '+972-3-514-8000',
          company: 'בנק לאומי',
          title: 'יועץ משפטי',
          position: 'General Counsel',
          relationshipType: 'לקוח',
          relationshipYears: 6,
          matterReferences: [
            { matterTitle: 'מימון פרויקט אנרגיה סולארית' },
            { matterTitle: 'הסדר חוב תעשיות' },
          ],
          status: 'confirmed',
        },
        {
          _id: '6',
          firstName: 'שרון',
          lastName: 'אלוני',
          email: 'sharon.aloni@cyberstart.io',
          phone: '+972-54-666-7777',
          company: 'CyberStart',
          title: 'Co-founder & CTO',
          position: 'מייסדת שותפה וסמנכ"לית טכנולוגיות',
          relationshipType: 'לקוח',
          relationshipYears: 4,
          matterReferences: [
            { matterTitle: 'Exit לפאלו אלטו' },
            { matterTitle: 'סבב גיוס B' },
          ],
          status: 'confirmed',
        },
        {
          _id: '7',
          firstName: 'עודד',
          lastName: 'רביב',
          email: 'oded.raviv@telecom-il.co.il',
          phone: '+972-3-500-1000',
          company: 'תשתיות טלקום ישראל',
          title: 'סמנכ"ל משפטי',
          position: 'VP Legal',
          relationshipType: 'לקוח',
          relationshipYears: 7,
          matterReferences: [
            { matterTitle: 'תביעה ייצוגית - הגנה' },
            { matterTitle: 'רכישת תדיראן טלקום' },
          ],
          status: 'pending',
        },
        {
          _id: '8',
          firstName: 'איילת',
          lastName: 'שניידר',
          email: 'ayelet@onedigitalbank.co.il',
          phone: '+972-52-333-4444',
          company: 'One Digital Bank',
          title: 'מנכ"לית',
          position: 'CEO',
          relationshipType: 'לקוח',
          relationshipYears: 3,
          matterReferences: [
            { matterTitle: 'מיזוג בנקים דיגיטליים' },
            { matterTitle: 'רישיון בנק ישראל' },
          ],
          status: 'contacted',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferees = referees.filter(
    (referee) =>
      referee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referee.company.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-semibold text-gray-900">{t('referees.title')}</h1>
          <p className="text-muted-foreground">{t('referees.subtitle')}</p>
        </div>
        <Button onClick={() => toast({ title: t('common.comingSoon'), description: t('referees.addRefereeForm') })}>
          <Plus className="me-2 h-4 w-4" />
          {t('referees.newReferee')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('referees.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('referees.totalReferees')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('referees.confirmed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {referees.filter(r => r.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('referees.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {referees.filter(r => r.status === 'pending' || r.status === 'contacted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('referees.companies')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(referees.map(r => r.company)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referees List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('referees.allReferees')}</CardTitle>
          <CardDescription>{t('referees.clientContacts')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReferees.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t('referees.noRefereesFound')}</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? t('referees.tryDifferentSearch') : t('referees.addFirstReferee')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferees.map((referee) => {
                const statusInfo = statusConfig[referee.status] || statusConfig.pending;
                return (
                  <div
                    key={referee._id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {referee.firstName} {referee.lastName}
                          </h3>
                          <Badge className={`gap-1 ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {t(`referees.statuses.${referee.status}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{referee.company}</span>
                          {referee.title && (
                            <>
                              <span>•</span>
                              <span>{referee.title}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {referee.email}
                          </span>
                          {referee.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {referee.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {referee.matterReferences.length} {t(referee.matterReferences.length === 1 ? 'common.matter' : 'common.matters')}
                        </p>
                        {referee.relationshipYears && (
                          <p className="text-xs text-muted-foreground">
                            {t('referees.yearsRelationship', { count: referee.relationshipYears })}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        {t('referees.viewDetails')}
                      </Button>
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
