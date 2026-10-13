import type { ComponentType, ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DropdownOption<T extends string = string> = {
  value: T;
  label?: ReactNode;
  /** Shown under the label in the open list only. */
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
};

type DropdownProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  /** Plain strings are used as both value and label. Values must not be empty strings. */
  options: readonly (T | DropdownOption<T>)[];
  /** Accessible name when the dropdown is not wrapped in a visible label. */
  label?: string;
  placeholder?: string;
  /** `field` matches form inputs; `pill` fits toolbars and compact rows. */
  variant?: 'field' | 'pill';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function Dropdown<T extends string>({
  value, onChange, options, label, placeholder, variant = 'field', align = 'start', disabled, className, id,
}: DropdownProps<T>) {
  const items = options.map(option => (typeof option === 'string' ? { value: option } as DropdownOption<T> : option));
  return <SelectPrimitive.Root value={value} onValueChange={next => onChange(next as T)} disabled={disabled ?? false}>
    <SelectPrimitive.Trigger id={id} aria-label={label} className={cn('ui-dropdown', `is-${variant}`, className)}>
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon asChild><ChevronDown className="ui-dropdown-chevron" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content position="popper" side="bottom" align={align} sideOffset={6} collisionPadding={12} className="ui-dropdown-menu">
        <SelectPrimitive.ScrollUpButton className="ui-dropdown-scroll"><ChevronUp /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="ui-dropdown-list">
          {items.map(item => <SelectPrimitive.Item key={item.value} value={item.value} disabled={item.disabled ?? false} className="ui-dropdown-item">
            <SelectPrimitive.ItemText>
              <span className="ui-dropdown-text">{item.icon ? <item.icon className="ui-dropdown-icon" /> : null}{item.label ?? item.value}</span>
            </SelectPrimitive.ItemText>
            {item.description ? <small>{item.description}</small> : null}
            <SelectPrimitive.ItemIndicator className="ui-dropdown-check"><Check /></SelectPrimitive.ItemIndicator>
          </SelectPrimitive.Item>)}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="ui-dropdown-scroll"><ChevronDown /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>;
}
