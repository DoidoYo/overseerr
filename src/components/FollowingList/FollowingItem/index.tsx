import Badge from '@app/components/Common/Badge';
import Button from '@app/components/Common/Button';
import CachedImage from '@app/components/Common/CachedImage';
import ConfirmButton from '@app/components/Common/ConfirmButton';
import StatusBadge from '@app/components/StatusBadge';
import { Permission, useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
// import { refreshIntervalHelper } from '@app/utils/refreshIntervalHelper';
import {
  ArrowPathIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { MediaRequestStatus } from '@server/constants/media';
import type Media from '@server/entity/Media';
import type { MediaRequest } from '@server/entity/MediaRequest';
import type { MovieDetails } from '@server/models/Movie';
import type { TvDetails } from '@server/models/Tv';
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { defineMessages, FormattedRelativeTime, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';

const messages = defineMessages({
  unfollow: 'Unfollowed <strong>{title}</strong>!',
  unfollowError: 'Error unfollowing <strong>{title}</strong>, {error}!',
  seasons: '{seasonCount, plural, one {Season} other {Seasons}}',
  failedretry: 'Something went wrong while retrying the request.',
  requested: 'Requested',
  requesteddate: 'Requested',
  modified: 'Modified',
  modifieduserdate: '{date} by {user}',
  mediaerror: '{mediaType} Not Found',
  editrequest: 'Edit Request',
  deleterequest: 'Delete Request',
  cancelRequest: 'Cancel Request',
  tmdbid: 'TMDB ID',
  tvdbid: 'TheTVDB ID',
  unknowntitle: 'Unknown Title',
});

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
};

interface RequestItemErrorProps {
  mediaData?: MediaRequest;
  revalidateList: () => void;
}

const RequestItemError = ({
  mediaData: mediaData,
  revalidateList,
}: RequestItemErrorProps) => {
  const intl = useIntl();
  const { hasPermission } = useUser();

  const deleteRequest = async () => {
    await axios.delete(`/api/v1/media/${mediaData?.media.id}`);
    revalidateList();
  };

  return (
    <div className="flex h-64 w-full flex-col justify-center rounded-xl bg-gray-800 py-4 text-gray-400 shadow-md ring-1 ring-red-500 xl:h-28 xl:flex-row">
      <div className="flex w-full flex-col justify-between overflow-hidden sm:flex-row">
        <div className="flex w-full flex-col justify-center overflow-hidden pl-4 pr-4 sm:pr-0 xl:w-7/12 2xl:w-2/3">
          <div className="flex text-lg font-bold text-white xl:text-xl">
            {intl.formatMessage(messages.mediaerror, {
              mediaType: intl.formatMessage(
                mediaData?.type
                  ? mediaData?.type === 'movie'
                    ? globalMessages.movie
                    : globalMessages.tvshow
                  : globalMessages.request
              ),
            })}
          </div>
          {mediaData && hasPermission(Permission.MANAGE_REQUESTS) && (
            <>
              <div className="card-field">
                <span className="card-field-name">
                  {intl.formatMessage(messages.tmdbid)}
                </span>
                <span className="flex truncate text-sm text-gray-300">
                  {media.tmdbId}
                </span>
              </div>
              {media.tvdbId && (
                <div className="card-field">
                  <span className="card-field-name">
                    {intl.formatMessage(messages.tvdbid)}
                  </span>
                  <span className="flex truncate text-sm text-gray-300">
                    {mediaData?.media.tvdbId}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-4 ml-4 flex w-full flex-col justify-center overflow-hidden pr-4 text-sm sm:ml-2 sm:mt-0 xl:flex-1 xl:pr-0">
          {mediaData && (
            <>
              <div className="card-field">
                <span className="card-field-name">
                  {intl.formatMessage(globalMessages.status)}
                </span>
                {mediaData.status === MediaRequestStatus.DECLINED ||
                mediaData.status === MediaRequestStatus.FAILED ? (
                  <Badge badgeType="danger">
                    {mediaData.status === MediaRequestStatus.DECLINED
                      ? intl.formatMessage(globalMessages.declined)
                      : intl.formatMessage(globalMessages.failed)}
                  </Badge>
                ) : (
                  <StatusBadge
                    status={
                      media[
                        mediaData.is4k ? 'status4k' : 'status'
                      ]
                    }
                    downloadItem={
                      media[
                        mediaData.is4k ? 'downloadStatus4k' : 'downloadStatus'
                      ]
                    }
                    title={intl.formatMessage(messages.unknowntitle)}
                    inProgress={
                      (
                        media[
                          mediaData.is4k
                            ? 'downloadStatus4k'
                            : 'downloadStatus'
                        ] ?? []
                      ).length > 0
                    }
                    is4k={mediaData.is4k}
                    mediaType={mediaData.type}
                    plexUrl={mediaData.is4k ? plexUrl4k : plexUrl}
                    serviceUrl={
                      mediaData.is4k
                        ? media.serviceUrl4k
                        : media.serviceUrl
                    }
                  />
                )}
              </div>
              <div className="card-field">
                {hasPermission(
                  [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
                  { type: 'or' }
                ) ? (
                  <>
                    <span className="card-field-name">
                      {intl.formatMessage(messages.requested)}
                    </span>
                    <span className="flex truncate text-sm text-gray-300">
                      {intl.formatMessage(messages.modifieduserdate, {
                        date: (
                          <FormattedRelativeTime
                            value={Math.floor(
                              (new Date(mediaData.createdAt).getTime() -
                                Date.now()) /
                                1000
                            )}
                            updateIntervalInSeconds={1}
                            numeric="auto"
                          />
                        ),
                        user: (
                          <Link href={`/users/${mediaData.requestedBy.id}`}>
                            <a className="group flex items-center truncate">
                              <img
                                src={mediaData.requestedBy.avatar}
                                alt=""
                                className="avatar-sm ml-1.5"
                              />
                              <span className="truncate text-sm group-hover:underline">
                                {mediaData.requestedBy.displayName}
                              </span>
                            </a>
                          </Link>
                        ),
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="card-field-name">
                      {intl.formatMessage(messages.requesteddate)}
                    </span>
                    <span className="flex truncate text-sm text-gray-300">
                      <FormattedRelativeTime
                        value={Math.floor(
                          (new Date(mediaData.createdAt).getTime() -
                            Date.now()) /
                            1000
                        )}
                        updateIntervalInSeconds={1}
                        numeric="auto"
                      />
                    </span>
                  </>
                )}
              </div>
              {mediaData.modifiedBy && (
                <div className="card-field">
                  <span className="card-field-name">
                    {intl.formatMessage(messages.modified)}
                  </span>
                  <span className="flex truncate text-sm text-gray-300">
                    {intl.formatMessage(messages.modifieduserdate, {
                      date: (
                        <FormattedRelativeTime
                          value={Math.floor(
                            (new Date(mediaData.updatedAt).getTime() -
                              Date.now()) /
                              1000
                          )}
                          updateIntervalInSeconds={1}
                          numeric="auto"
                        />
                      ),
                      user: (
                        <Link href={`/users/${mediaData.modifiedBy.id}`}>
                          <a className="group flex items-center truncate">
                            <img
                              src={mediaData.modifiedBy.avatar}
                              alt=""
                              className="avatar-sm ml-1.5"
                            />
                            <span className="truncate text-sm group-hover:underline">
                              {mediaData.modifiedBy.displayName}
                            </span>
                          </a>
                        </Link>
                      ),
                    })}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="z-10 mt-4 flex w-full flex-col justify-center pl-4 pr-4 xl:mt-0 xl:w-96 xl:items-end xl:pl-0">
        {hasPermission(Permission.MANAGE_REQUESTS) && mediaData?.media.id && (
          <Button
            className="w-full"
            buttonType="danger"
            onClick={() => deleteRequest()}
          >
            <TrashIcon />
            <span>{intl.formatMessage(messages.deleterequest)}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

interface FollowingItemProps {
  media: Media;
  revalidateList: () => void;
}

const FollowingItem = ({ media, revalidateList }: FollowingItemProps) => {

  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { addToast } = useToasts();
  const intl = useIntl();
  const { user, hasPermission } = useUser();
  const url =
    media.type === 'movie'
      ? `/api/v1/movie/${media.tmdbId}`
      : `/api/v1/tv/${media.tmdbId}`;
  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    inView ? url : null
  );

  const unfollow = async () => {
    try {
      await axios.post(`/api/v1/media/${media.id}/unfollow`, {
        is4k: false,
        userId: user?.id
      });
      addToast(
        <span>
          {/* Unfollowed <strong>{title.name}</strong>! */}
          {intl.formatMessage(messages.unfollow, {
            title: title.name,
            strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
          })}
        </span>,
        { appearance: 'success', autoDismiss: true }
      );
      revalidateList();
    } catch(e) {
      // Show error toast
      addToast(
        <span>
          {intl.formatMessage(messages.unfollowError, {
            title: title.name,
            error: e,
            strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
          })}
        </span>,
        { appearance: 'error', autoDismiss: true }
      );
    }
  };

  if (!title && !error) {
    return (
      <div
        className="h-64 w-full animate-pulse rounded-xl bg-gray-800 xl:h-28"
        ref={ref}
      />
    );
  }

  if (!title || !media) {
    return (
      <RequestItemError
        mediaData={media}
        revalidateList={revalidateList}
      />
    );
  }

  return (
    <>
      <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-xl bg-gray-800 py-4 text-gray-400 shadow-md ring-1 ring-gray-700 xl:h-28 xl:flex-row">
        {title.backdropPath && (
          <div className="absolute inset-0 z-0 w-full bg-cover bg-center xl:w-2/3">
            <CachedImage
              src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${title.backdropPath}`}
              alt=""
              layout="fill"
              objectFit="cover"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(31, 41, 55, 0.47) 0%, rgba(31, 41, 55, 1) 100%)',
              }}
            />
          </div>
        )}
        <div className="relative z-10 flex w-full items-center overflow-hidden pl-4 pr-4 sm:pr-0">
          <Link
            href={
              media.type === 'movie'
                ? `/movie/${media.tmdbId}`
                : `/tv/${media.tmdbId}`
            }
          >
            <a className="relative h-auto w-12 flex-shrink-0 scale-100 transform-gpu overflow-hidden rounded-md transition duration-300 hover:scale-105">
              <CachedImage
                src={
                  title.posterPath
                    ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${title.posterPath}`
                    : '/images/overseerr_poster_not_found.png'
                }
                alt=""
                layout="responsive"
                width={600}
                height={900}
                objectFit="cover"
              />
            </a>
          </Link>
          <div className="flex flex-col justify-center overflow-hidden pl-2 xl:pl-4">
            <div className="pt-0.5 text-xs font-medium text-white sm:pt-1">
              {(isMovie(title)
                ? title.releaseDate
                : title.firstAirDate
              )?.slice(0, 4)}
            </div>
            <Link
              href={
                media.type === 'movie'
                  ? `/movie/${media.tmdbId}`
                  : `/tv/${media.tmdbId}`
              }
            >
              <a className="mr-2 min-w-0 truncate text-lg font-bold text-white hover:underline xl:text-xl">
                {isMovie(title) ? title.title : title.name}
              </a>
            </Link>
          </div>
        </div>
        <div className="z-10 mt-4 flex w-full flex-col justify-center space-y-2 pl-4 pr-4 xl:mt-0 xl:w-96 xl:items-end xl:pl-0">
          {hasPermission(Permission.REQUEST) && (
              <ConfirmButton
                onClick={() => unfollow()}
                confirmText={intl.formatMessage(globalMessages.areyousure)}
                className="w-full"
              >
                <TrashIcon />
                <span>{intl.formatMessage(messages.deleterequest)}</span>
              </ConfirmButton>
            )}
        </div>
      </div>
    </>
  );
};

export default FollowingItem;
