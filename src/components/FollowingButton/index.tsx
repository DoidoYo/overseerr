import ButtonWithDropdown from '@app/components/Common/ButtonWithDropdown';
// import RequestModal from '@app/components/RequestModal';
// import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import { useToasts } from 'react-toast-notifications';
// import globalMessages from '@app/i18n/globalMessages';
// import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import useSWR from 'swr';
// import { MediaRequestStatus, MediaStatus, MediaFollow } from '@server/constants/media';
import type Media from '@server/entity/Media';
// import type { MediaRequest } from '@server/entity/MediaRequest';
import axios from 'axios';
// import { truncate } from 'fs';
// import { useMemo, useState } from 'react';
import ConfirmButton from '@app/components/Common/ConfirmButton';
import globalMessages from '@app/i18n/globalMessages';
import type { TvDetails } from '@server/models/Tv';
import { defineMessages, useIntl } from 'react-intl';

interface ButtonOption {
  id: string;
  text: string;
  action: () => void;
  svg?: React.ReactNode;
}

interface FollowingButtonProps {
  mediaType: 'movie' | 'tv';
  onUpdate: () => void;
  tmdbId: number;
  media?: Media;
  isShowComplete?: boolean;
  is4kShowComplete?: boolean;
}

const messages = defineMessages({
  nowfollowing: 'Now Following <strong>{title}</strong>!',
  unfollow: 'Unfollowed <strong>{title}</strong>!',
});

const FollowingButton = ({
  tmdbId,
  onUpdate,
  media,
}: // mediaType,
// isShowComplete = false,
// is4kShowComplete = false,
FollowingButtonProps) => {
  //some initialization code
  const { addToast } = useToasts();
  const intl = useIntl();
  // const { user, hasPermission } = useUser();
  const { user } = useUser();
  const userFollowing = media?.followingIds.includes(user?.id ?? -1);
  const { data } = useSWR<TvDetails>(`/api/v1/tv/${tmdbId}`);
  //find request/media. send update to api

  //onModify = async
  const buttons: ButtonOption[] = [];

  //button push logic

  //push logic
  if (media && !userFollowing) {
    buttons.push({
      id: 'follow',
      text: 'Follow',
      svg: <EyeIcon />,
      action: async () => {
        try {
          await axios.post(`/api/v1/following/${media?.tmdbId}/follow`);
          onUpdate();
          addToast(
            <span>
              {intl.formatMessage(messages.nowfollowing, {
                title: data?.name,
                strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
              })}
            </span>,
            { appearance: 'success', autoDismiss: true }
          );
        } catch (error) {
          addToast(
            <span>Failed to follow {data?.name}. Please try again.</span>,
            { appearance: 'error', autoDismiss: true }
          );
        }
      },
    });
  } else if (media && userFollowing) {
    buttons.push({
      id: 'unfollow',
      text: 'Unfollow',
      svg: <EyeSlashIcon />,
      action: async () => {
        try {
          await axios.post(`/api/v1/following/${media?.tmdbId}/unfollow`);
          onUpdate();
          addToast(
            <span>
              {intl.formatMessage(messages.unfollow, {
                title: data?.name,
                strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
              })}
            </span>,
            { appearance: 'success', autoDismiss: true }
          );
        } catch (error) {
          addToast(
            <span>Failed to follow {data?.name}. Please try again.</span>,
            { appearance: 'error', autoDismiss: true }
          );
        }
      },
    });
  }

  const [buttonOne] = buttons;

  //check if a button was added
  if (!buttonOne) {
    return null;
  }

  return (
    <>
      {buttonOne.id === 'follow' ? (
        <ButtonWithDropdown
          text={
            <>
              {buttonOne.svg}
              <span>{buttonOne.text}</span>
            </>
          }
          onClick={buttonOne.action}
          className="ml-2"
        ></ButtonWithDropdown>
      ) : (
        <ConfirmButton
          onClick={() => buttonOne.action()}
          confirmText={intl.formatMessage(globalMessages.areyousure)}
          className="ml-2"
          buttonType="danger"
        >
          <EyeSlashIcon />
          <span>{buttonOne.text}</span>
        </ConfirmButton>
      )}
    </>
  );
};

export default FollowingButton;