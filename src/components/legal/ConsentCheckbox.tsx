import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  error?: boolean;
}

export function ConsentCheckbox({ 
  id, 
  checked, 
  onCheckedChange, 
  className,
  error 
}: ConsentCheckboxProps) {
  const { t } = useTranslation('legal');

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "mt-1",
          error && "border-destructive"
        )}
      />
      <label 
        htmlFor={id} 
        className={cn(
          "text-sm text-muted-foreground leading-relaxed cursor-pointer",
          error && "text-destructive"
        )}
      >
        {t('consent.termsLabel')}{' '}
        <Link 
          to="/terms" 
          className="text-primary hover:underline"
          target="_blank"
        >
          {t('consent.termsLink')}
        </Link>
        {' '}{t('consent.and')}{' '}
        <Link 
          to="/privacy-policy" 
          className="text-primary hover:underline"
          target="_blank"
        >
          {t('consent.privacyLink')}
        </Link>
        .
      </label>
    </div>
  );
}

interface AgeConfirmationCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  error?: boolean;
}

export function AgeConfirmationCheckbox({ 
  id, 
  checked, 
  onCheckedChange, 
  className,
  error 
}: AgeConfirmationCheckboxProps) {
  const { t } = useTranslation('legal');

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "mt-1",
          error && "border-destructive"
        )}
      />
      <label 
        htmlFor={id} 
        className={cn(
          "text-sm text-muted-foreground leading-relaxed cursor-pointer",
          error && "text-destructive"
        )}
      >
        {t('consent.ageConfirmation')}
      </label>
    </div>
  );
}
