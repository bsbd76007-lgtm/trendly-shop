import { Fragment, type ReactNode } from "react";

export function RichText({ text, tokens }: { text: string; tokens: Record<string, ReactNode> }) {
  return (
    <>
      {text.split(/(\{\w+\})/).map((part, index) => {
        const key = /^\{(\w+)\}$/.exec(part)?.[1];
        return <Fragment key={index}>{key && key in tokens ? tokens[key] : part}</Fragment>;
      })}
    </>
  );
}
