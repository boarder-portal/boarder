import { ChunkExtractor } from '@loadable/server';
import { Request, Response } from 'express';
import path from 'path';
import { renderToString } from 'react-dom/server';

import createStore, { Store, getInitialState } from 'client/utilities/store';

const nodeStats = path.resolve('./build/node/loadable-stats.json');

const webStats = path.resolve('./build/web/loadable-stats.json');

function renderHtml(bodyContent: string, headContent?: string): string {
  return `
<html lang="ru">
    <head>
        <title>Boarder</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, maximum-scale=1, user-scalable=0">
        <meta name="theme-color" content="#ffffff">
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1">
        ${headContent ?? ''}
    </head>

    <body>
        ${bodyContent}
    </body>
</html>
  `;
}

export default async function render(req: Request, res: Response): Promise<Response> {
  let htmlString: string;

  try {
    const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
    const { default: App } = nodeExtractor.requireEntrypoint();

    const store: Store = createStore(getInitialState());

    store.value.user = req.session.user || null;

    const webExtractor = new ChunkExtractor({ statsFile: webStats });

    // @ts-ignore
    const jsx = webExtractor.collectChunks(<App url={req.url} store={store} />);
    const html = renderToString(jsx);

    const linkTags = webExtractor.getLinkTags();
    const styleTags = webExtractor.getStyleTags();
    const scriptTags = webExtractor.getScriptTags();

    htmlString = renderHtml(
      `
        <div id="root">${html}</div>

        ${scriptTags}
      `,
      `
        ${linkTags}
        ${styleTags}
        <script>window.initialState=${JSON.stringify(store.value).replace(/</g, '\\u003c')}</script>
      `,
    );
  } catch (err) {
    console.log(err);

    htmlString = renderHtml(`
      ${err instanceof Error ? `<pre>${err.stack}</pre>` : String(err)}
    `);
  }

  return res.send(htmlString);
}
