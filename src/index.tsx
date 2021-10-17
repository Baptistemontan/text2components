import React, {
  cloneElement,
  ReactElement,
  ReactNode,
} from "react";

export function valueInterpolation(
  text: string,
  query: Record<string, string | number>
): string {
  if (!text || !query) return text || ''

  const escapeRegex = (str: string) =>
    str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  
  const prefix = '{{', suffix = '}}';

  const regexEnd = `\\s*${escapeRegex(suffix)}`
  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(
      `${escapeRegex(prefix)}\\s*${varKey}${regexEnd}`,
      'gm'
    )
    all = all.replace(regex, `${query[varKey]}`)
    return all
  }, text)
}

const tagRe = /<(\w+)>(.*?)<\/\1>|<(\w+)\/>/; // <tag>content</tag>
const nlRe = /(?:\r\n|\r|\n)/g;

function getElements(
  parts: Array<string | undefined>,
): Array<string | undefined>[] {
  if (!parts.length) return [];

  const [paired, children, unpaired, after] = parts.slice(0, 4);

  return [[paired || unpaired || "", children || "", after]].concat(
    getElements(parts.slice(4, parts.length)),
  );
}

function formatElements(
  value: string,
  elements: Record<string, ReactElement>
): ReactNode[] | string {
  const parts = value.replace(nlRe, "").split(tagRe);

  if (parts.length === 1) return value;

  const tree: Array<string | ReactElement> = [];

  const before = parts.shift();
  if (before) tree.push(before);

  getElements(parts).forEach(([key, children, after], realIndex: number) => {
    const element = (key && elements[key]) || <></>;

    tree.push(
      cloneElement(
        element,
        { key: realIndex },

        // format children for pair tags
        // unpaired tags might have children if it's a component passed as a variable
        children ? formatElements(children, elements) : element.props.children,
      ),
    );

    if (after) tree.push(after);
  });

  return tree;
}

export interface ComponentsInterpolationProps {
    text: string,
    components: Record<string, ReactElement>
}

export function ComponentsInterpolation({
    text,
    components,
}:ComponentsInterpolationProps){
    return <>{formatElements(text, components)}</>;
}


export interface InterpolationProps {
    text: string;
    values?: Record<string, string | number>;
    components?: Record<string, ReactElement>;
}

export function Interpolation({ text, values, components }: InterpolationProps) {

    const interpolatedValues = values ? valueInterpolation(text, values) : text;

    const result = components ? formatElements(interpolatedValues, components) : interpolatedValues;

    return <>{result}</>
}