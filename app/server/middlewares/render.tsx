import React, { FC } from 'react';
import path from 'path';
import { Request, Response } from 'express';
import { ChunkExtractor } from '@loadable/server';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@material-ui/core/styles';

import App from 'client/components/App/App';

import theme from 'client/theme';

const statsFile = path.resolve('./build/client/loadable-stats.json');
const extractor = new ChunkExtractor({ statsFile, publicPath: '/' });

interface IServerAppProps {
  url: string;
}

const ServerApp: FC<IServerAppProps> = (props) => {
  const { url } = props;

  return (
    <StaticRouter location={url}>
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <App />
        </RecoilRoot>
      </ThemeProvider>
    </StaticRouter>
  );
};

export default async function render(req: Request, res: Response) {
  extractor.collectChunks(
    <ServerApp url={req.url} />,
  );

  const linkTags = extractor.getLinkTags();
  const styleTags = extractor.getStyleTags();
  const scriptTags = extractor.getScriptTags();

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
