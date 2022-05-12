import React from 'react';
import path from 'path';
import { Request, Response } from 'express';
import { ChunkExtractor } from '@loadable/server';
import { renderToString } from 'react-dom/server';

const nodeStats = path.resolve(
  './build/node/loadable-stats.json',
);

const webStats = path.resolve(
  './build/web/loadable-stats.json',
);

export default async function render(req: Request, res: Response): Promise<Response> {
  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
  const { default: App } = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  // @ts-ignore
  const jsx = webExtractor.collectChunks(<App url={req.url} />);
  const html = renderToString(jsx);

  const linkTags = webExtractor.getLinkTags();
  const styleTags = webExtractor.getStyleTags();
  const scriptTags = webExtractor.getScriptTags();

  return res.send(`
<html>
    <head>
        <title>Boarder</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, maximum-scale=1, user-scalable=0">
        <meta name="theme-color" content="#ffffff">
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1">
        ${linkTags}
        ${styleTags}
    </head>

    <body>
        <div id="root">${html}</div>

        ${scriptTags}
    </body>
</html>
    `);
}
