import { motion } from 'framer-motion';
import { User, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/i18n/useLocale';
import { format } from 'date-fns';

interface Props {
  profile: any;
  userEmail: string | undefined;
}

export function ProfileSection({ profile, userEmail }: Props) {
  const { t } = useTranslation('settings');
  const { dateFnsLocale, dateFormat } = useLocale();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        {t('profile.title')}
      </h2>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <span className="text-xl font-display font-semibold text-primary">
              {profile?.username ? profile.username.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground truncate">
                {profile?.username || t('profile.defaultUser', { defaultValue: 'User' })}
              </p>
              <PlanBadge planId={profile?.subscription_plan_id} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{userEmail}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('profile.currentPlan')}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.subscription_expires_at 
                ? t('profile.validUntil', { date: format(new Date(profile.subscription_expires_at), dateFormat.long, { locale: dateFnsLocale }) })
                : t('profile.freePlan')
              }
            </p>
          </div>
          <PlanBadge planId={profile?.subscription_plan_id} size="md" />
        </div>
      </div>
    </motion.section>
  );
}
