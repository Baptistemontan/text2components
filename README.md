Interpolate text with react components !

For exemple, imagine you have a text like this:
    `the sun is <b>bright</b>`
but its just a text, and you want to highlight the word "bright" with a react component.

you can use the function `Interpolation` to do that:

```ts
import { Interpolation } from 'text2components';

const text = `the sun is <b>bright</b>`;

export function MyComponent() {
    return (
        <Interpolation text={text} components={{ b : <b /> }} />
    );
}

```

Every tag in the text will be replaced by the corresponding react component, and the content beetween the tag be passed as a children to the given components. You can also give props to the components:

`<Interpolation text={text} components={{ b: <b className="highlight" style={{ fontSize: "1.5rem" }} /> }}>`

You also can interpolate values into the text:

text looking like this: `I have {{ count }} apples`

you can set the value count like this:

`<Interpolate test={text} values={{ count: 4 }} />`

it will return `I have 4 apples`

if you want to have it return as a string and not a react Component, you can use the function `valueInterpolation`