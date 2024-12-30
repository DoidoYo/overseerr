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
        .where("(',' || media.followIds || ',') LIKE :targetString", { targetString })
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

export default followingRoutes;
