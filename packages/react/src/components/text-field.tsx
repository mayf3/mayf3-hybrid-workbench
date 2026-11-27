import * as React from "react";
import {
  TextField as AriaTextField,
  FieldError,
  Input,
  Label,
  Text,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

export type FieldSize = "sm" | "md" | "lg";

export interface TextFieldProps extends Omit<AriaTextFieldProps, "className" | "children" | "style" | "size"> {
  /** Always provide a visible label; placeholder text is not a label substitute. */
  label: string;
  description?: string;
  /**
   * Marks the field invalid and renders the message. Error semantics
   * (aria-invalid + aria-describedby) are wired by React Aria automatically.
   */
  errorMessage?: string;
  placeholder?: string;
  size?: FieldSize;
  /** Ref for the underlying <input>, for form-library integrations. */
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  style?: React.CSSProperties;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  size = "md",
  inputRef,
  className,
  ...props
}: TextFieldProps) {
  const isInvalid = Boolean(errorMessage) || props.isInvalid;
  return (
    <AriaTextField
      {...props}
      isInvalid={isInvalid}
      className={["mf-field", "mf-field--text", size !== "md" && `mf-field--${size}`, className].filter(Boolean).join(" ")}
    >
      <Label className="mf-field__label">
        {label}
        {props.isRequired && (
          <span className="mf-field__required" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Input className="mf-input" placeholder={placeholder} ref={inputRef} />
      {description && (
        <Text slot="description" className="mf-field__description">
          {description}
        </Text>
      )}
      {errorMessage ? (
        <FieldError className="mf-field__error">{errorMessage}</FieldError>
      ) : null}
    </AriaTextField>
  );
}
