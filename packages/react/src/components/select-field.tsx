import * as React from "react";
import {
  Select as AriaSelect,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Label,
  Button as AriaButton,
  FieldError,
  Text,
} from "react-aria-components";
import type { FieldSize } from "./text-field";

export type { FieldSize };

export interface SelectOption {
  /** Stable identity used as the selected key; also the controlled value type. */
  id: string;
  /** Visible text; used for typeahead matching. */
  label: string;
}

export interface SelectFieldProps {
  label: string;
  items: SelectOption[];
  /** Controlled selection. `null` clears the selection. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  description?: string;
  /** Marks the field invalid and renders the message. */
  errorMessage?: string;
  size?: FieldSize;
  /** Shown when `items` is empty. Keep it actionable ("没有可选项"). */
  emptyMessage?: string;
  className?: string;
}

export function SelectField({
  label,
  items,
  value,
  defaultValue,
  onChange,
  placeholder = "请选择…",
  isDisabled,
  isRequired,
  isInvalid,
  description,
  errorMessage,
  size = "md",
  emptyMessage = "暂无可选项",
  className,
}: SelectFieldProps) {
  const controlled = value !== undefined;
  const invalid = Boolean(errorMessage) || isInvalid;
  return (
    <AriaSelect
      selectedKey={controlled ? value : undefined}
      defaultSelectedKey={defaultValue}
      onSelectionChange={key => onChange?.(key === null ? null : String(key))}
      isDisabled={isDisabled}
      isRequired={isRequired}
      isInvalid={invalid}
      className={["mf-field", "mf-select", size !== "md" && `mf-field--${size}`, className].filter(Boolean).join(" ")}
    >
      <Label className="mf-field__label">
        {label}
        {isRequired && (
          <span className="mf-field__required" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <AriaButton className="mf-select__trigger">
        <SelectValue className="mf-select__value">{({ selectedText, isPlaceholder }) => (isPlaceholder ? placeholder : selectedText)}</SelectValue>
        <span className="mf-select__chevron" aria-hidden="true">▾</span>
      </AriaButton>
      {description && (
        <Text slot="description" className="mf-field__description">
          {description}
        </Text>
      )}
      {errorMessage ? (
        <FieldError className="mf-field__error">{errorMessage}</FieldError>
      ) : null}
      <Popover className="mf-select__popover">
        <ListBox className="mf-select__list" renderEmptyState={() => <div className="mf-select__empty">{emptyMessage}</div>}>
          {items.map(item => (
            <ListBoxItem key={item.id} id={item.id} textValue={item.label} className="mf-select__option">
              {item.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
