import React from "react";
import { cloneElement, ReactElement, ReactNode } from "react";

type RegexResult = [string, string, RegexResult[]]; // before, tag, content

const openTagRegex = /(<\s*?[^/>]+\s*?>)/g;
const closeTagRegex = (str: string) => new RegExp(`(</\\s*?${str}\\s*?>)`, "g");
const matchingOpenTagRegex = (str: string) =>
  new RegExp(`<\\s*?${str}\\s*?>`, "g");

function getPairs(str: string): RegexResult[] {
  const [beforeSplit, tagSplit, ...afterSplitArray] = str.split(openTagRegex);
  if (!tagSplit) {
    return [[str, "", []]];
  }
  let after = afterSplitArray?.join("") || "";
  let depth = 1;
  let content = "";
  const tag = tagSplit.slice(1, -1).trim();
  while (depth > 0) {
    const [before, _tag, ..._after] = after.split(closeTagRegex(tag));
    if (!_tag) {
      // error
      return [
        [beforeSplit + tagSplit, "", getPairs(afterSplitArray?.join("") || "")],
      ];
    }
    depth -= 1;
    depth += before.match(matchingOpenTagRegex(tag))?.length || 0;
    after = _after?.join("") || "";
    content += before;
    if (depth) {
      content += _tag;
    }
  }

  return [[beforeSplit, tag, getPairs(content)], ...getPairs(after)];
}

export function valueInterpolation(
  text: string,
  query: Record<string, string | number>,
): string {
  if (!text || !query) return text || "";

  const escapeRegex = (str: string) =>
    str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  const prefix = "{{";
  const suffix = "}}";

  const regexEnd = `\\s*${escapeRegex(suffix)}`;
  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(
      `${escapeRegex(prefix)}\\s*${varKey}${regexEnd}`,
      "gm",
    );
    // eslint-disable-next-line no-param-reassign
    all = all.replace(regex, `${query[varKey]}`);
    return all;
  }, text);
}

function formatElements(
  elements: Record<string, ReactElement>,
  parts: RegexResult[],
): (ReactNode | string)[] {
  return parts.flatMap(([before, key, content], realIndex) => {
    const element = (key && elements[key]) || <></>;
    return [
      before,
      cloneElement(
        element,
        { key: realIndex + before + key },
        // format children for pair tags
        // unpaired tags might have children if it's a component passed as a variable
        content ? formatElements(elements, content) : element.props.children,
      ),
    ];
  });
}

export interface ComponentsInterpolationProps {
  text: string;
  components: Record<string, ReactElement>;
}

export function ComponentsInterpolation({
  text,
  components,
}: ComponentsInterpolationProps) {
  return <>{formatElements(components, getPairs(text))}</>;
}

export interface InterpolationProps {
  text: string;
  values?: Record<string, string | number>;
  components?: Record<string, ReactElement>;
}

export function Interpolation({
  text,
  values,
  components,
}: InterpolationProps) {
  const interpolatedValues = values ? valueInterpolation(text, values) : text;

  const result = components
    ? formatElements(components, getPairs(interpolatedValues))
    : interpolatedValues;

  return <>{result}</>;
}