import React from 'react';
import path from 'path';
import { Request, Response } from 'express';
import { ChunkExtractor } from '@loadable/server';

const nodeStats = path.resolve(
  './build/node/loadable-stats.json',
);

const webStats = path.resolve(
  './build/web/loadable-stats.json',
);

export default async function render(req: Request, res: Response) {
  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
  const { default: App } = nodeExtractor.requireEntrypoint();
  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  // @ts-ignore
  webExtractor.collectChunks(<App url={req.url} />);

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
        <div id="root" />

        ${scriptTags}
    </body>
</html>
    `);
}
