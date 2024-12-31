import {
  MediaRequestStatus,
  MediaStatus,
  MediaType,
} from '@server/constants/media';
import { getRepository } from '@server/datasource';
import Media from '@server/entity/Media';
import {
  DuplicateMediaRequestError,
  MediaRequest,
  NoSeasonsAvailableError,
  QuotaRestrictedError,
  RequestPermissionError,
} from '@server/entity/MediaRequest';
import SeasonRequest from '@server/entity/SeasonRequest';
import { User } from '@server/entity/User';
import type {
  MediaRequestBody,
  RequestResultsResponse,
} from '@server/interfaces/api/requestInterfaces';
import { Permission } from '@server/lib/permissions';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';
import { ArrayContains } from 'typeorm';

const followingRoutes = Router();

followingRoutes.get<Record<string, unknown>, JSON>(
  '/',
  async (req, res, next) => {
    try {
      const pageSize = req.query.take ? Number(req.query.take) : 10;
      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const userId = Number(req.query.userId);

      const mediaRepository = getRepository(Media);

      const targetString = `%,${userId},%`;

      const [media, mediaCount] = await mediaRepository
        .createQueryBuilder("media")
        // .select(["media.id", "media.tmdbId"])
        .where("(',' || media.followingIds || ',') LIKE :targetString", { targetString })
        .take(pageSize)
        .skip(skip)
        .getManyAndCount();

        const data = {
          pageInfo: {
            pages: Math.ceil(mediaCount / pageSize),
            pageSize,
            results: mediaCount,
            page: Math.ceil(skip / pageSize) + 1,
          },
          results: media,
        };
      return res.status(200).json(JSON.parse(JSON.stringify(data)));
      // return res.status(200).json(JSON.parse(JSON.stringify(data)));
    } catch (e) {
      next({ status: 500, message: e.message });
    }
  }
);

followingRoutes.post<
  {
    tmdbId: string;
    status: 'follow' | 'unfollow';
  },
  Media
>(
  '/:tmdbId/:status',
  isAuthenticated(Permission.REQUEST),
  //authentication stuff
  async (req, res, next) => {
    //worked
    const tmdbId = req.params.tmdbId;

    if (!req.user) {
      return next({
        status: 401,
        message: 'You must be logged in to request media.',
      });
    }
    const userId = req.user.id;

    try {
      const mediaRepository = getRepository(Media);

      const media = await mediaRepository.findOne({
        where: { tmdbId: Number(tmdbId) },
      });

      if (!media) {
        return next({ status: 404, message: 'Media does not exist.' });
      }

      switch (req.params.status) {
        case 'follow':
          media.addFollower(userId);
          break;
        case 'unfollow':
          media.removeFollower(userId);
          break;
      }

      // const j = {t:tmdbId, tt:status,ttt:userId, tttt:req.user}
      await mediaRepository.save(media);

      return res.status(200).send(media);

    } catch (e) {
      logger.error('Something went wrong fetching media in post FOLLOWING request', {
        label: 'Following',
        message: e.message,
      });
      next({ status: 500, message: 'Media not found' });
    }
  }
);

export default followingRoutes;
