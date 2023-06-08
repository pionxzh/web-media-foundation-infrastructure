import * as React from 'react';

import { useEpisodes } from '@web-media/client-sdk';
import type { IEpisodeDetail } from '@web-media/client-sdk';

const getSafeArea = () => ({
  topSafeArea: getComputedStyle(document.documentElement).getPropertyValue("--safe-area-top"),
  rightSafeArea: getComputedStyle(document.documentElement).getPropertyValue("--safe-area-right"),
  bottomSafeArea: getComputedStyle(document.documentElement).getPropertyValue("--safe-area-bottom"),
  leftSafeArea: getComputedStyle(document.documentElement).getPropertyValue("--safe-area-left"),
});

export const useEnvVariable = (
  episodeDetail: IEpisodeDetail | null,
) => {
  const episodes = useEpisodes();

  const saves = React.useMemo(() => {
    return [...episodes.values()].map((item) => ({
      id: item.id,
      order: item.order,
      idInOrder: item.order,
      idInDatabase: item.id,
      idInActServer: item.id,
      title: item.label,
      assetStatus: [],
    }));
  }, [episodes]);

  const episode = episodeDetail?.episode;

  const result = React.useMemo(() => {
    return {
      saves,
      episode,
      episodeId: episode?.id,
      episodeOrder: episode?.order,
      /**
       * @deprecated This is key for legacy implementation, use `episodeOrder`
       *             instead.
       */
      episodeIdInOrder: episode?.order,
      /**
       * @deprecated This is key for legacy implementation, use `episodeId`
       *             instead.
       */
      episodeIdInDatabase: episode?.id,
      assets: episodeDetail?.assets,
      episodes: saves,
      ...getSafeArea(),
    };
  }, [saves, episode, episodeDetail]);

  return result;
};
