import { ChunkExtractor } from '@loadable/server';
import path from 'path';
import { renderToString } from 'react-dom/server';

import { Middleware } from 'server/types/koa';

import SharedStore from 'common/utilities/SharedStore';

import ServerApp from 'server/components/ServerApp';

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
        <link rel="icon" type="image/x-icon" href="/public/favicon.ico?v=1">
        ${headContent ?? ''}
    </head>

    <body>
        ${bodyContent}
    </body>
</html>
  `;
}

const render: Middleware<string> = async (ctx) => {
  let htmlString: string;
  let status = 200;

  try {
    const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
    const { default: App } = nodeExtractor.requireEntrypoint() as { default: typeof ServerApp };

    const store = new SharedStore();

    store.setValue('user', ctx.state.user);

    const webExtractor = new ChunkExtractor({ statsFile: webStats });

    const jsx = webExtractor.collectChunks(<App url={ctx.url} store={store} />);
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
        <script>window.__STORE_VALUES__=${JSON.stringify(store.toJSON()).replace(/</g, '\\u003c')};</script>
      `,
    );
  } catch (err) {
    console.log(err);

    htmlString = renderHtml(`
      ${err instanceof Error ? `<pre>${err.stack}</pre>` : String(err)}
    `);
    status = 500;
  }

  ctx.status = status;
  ctx.type = 'text/html';
  ctx.body = htmlString;
};

export default render;
