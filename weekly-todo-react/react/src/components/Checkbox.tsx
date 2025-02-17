import React, { useState } from "react";
import style from "./Checkbox.module.css";

interface Props extends React.InputHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  initialValue?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function Checkbox({
  children,
  initialValue = false,
  onCheckedChange,
  ...props
}: Props) {
  const [checked, setChecked] = useState<boolean>(initialValue);

  return (
    <label
      {...props}
      className={`${style.checkbox} ${props.className || ""}`.trim()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          onCheckedChange(e.target.checked);
        }}
        hidden
        disabled={props.disabled}
      />
      {children}
    </label>
  );
}
