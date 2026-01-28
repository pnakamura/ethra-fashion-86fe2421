import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
        Li e aceito os{' '}
        <Link 
          to="/terms" 
          className="text-primary hover:underline"
          target="_blank"
        >
          Termos de Uso
        </Link>
        {' '}e a{' '}
        <Link 
          to="/privacy-policy" 
          className="text-primary hover:underline"
          target="_blank"
        >
          Política de Privacidade
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
        Declaro ter 18 anos ou mais.
      </label>
    </div>
  );
}
