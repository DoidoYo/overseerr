import ButtonWithDropdown from '@app/components/Common/ButtonWithDropdown';
// import RequestModal from '@app/components/RequestModal';
import useSettings from '@app/hooks/useSettings';
import { Permission, useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  CheckIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { MediaRequestStatus, MediaStatus, MediaFollow } from '@server/constants/media';
import type Media from '@server/entity/Media';
import type { MediaRequest } from '@server/entity/MediaRequest';
import axios from 'axios';
import { truncate } from 'fs';
import { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

interface ButtonOption {
  id: string;
  text: string;
  action: () => void;
  svg?: React.ReactNode;
}

interface FollowButtonProps {
  mediaType: 'movie' | 'tv';
  onUpdate: () => void;
  tmdbId: number;
  media?: Media;
  isShowComplete?: boolean;
  is4kShowComplete?: boolean;
}

const FollowButton = ({
  tmdbId,
  onUpdate,
  media,
  mediaType,
  isShowComplete = false,
  is4kShowComplete = false,
}: FollowButtonProps) => {

  //some initialization code
  const { user, hasPermission } = useUser();
  const userFollowing = media?.followIds.includes(user?.id ?? -1);
  //find request/media. send update to api

  //onModify = async
  const buttons: ButtonOption[] = [];

  //button push logic

  //4k push logic
  if(!media || !userFollowing) {
    buttons.push({
      id: 'Follow',
      text: 'Follow',
      action: async () => {
        try{
          await axios.post(`/api/v1/media/${media?.id}/follow`, {
            is4k: false,
            userId: user?.id
          });
          onUpdate();
        } catch (error) {
          console.error(error);
        }
      },
    });
  } else if (userFollowing) {
    buttons.push({
      id: 'Unfollow',
      text: 'Unfollow',
      action: async () => {
        try{
          await axios.post(`/api/v1/media/${media?.id}/unfollow`, {
            is4k: false,
            userId: user?.id
          });
          onUpdate();
        } catch (error) {
          console.error(error);
        }
      },
    });
  }

  const [buttonOne, ...others] = buttons;

  //check if a button was added
  if (!buttonOne) {
    return null;
  }

  return (
    <>
      <ButtonWithDropdown
        text={
          <>
            {buttonOne.svg}
            <span>{buttonOne.text}</span>
          </>
        }
        onClick={buttonOne.action}
        className="ml-2"
      >
      </ButtonWithDropdown>
    </>
  );
};

export default FollowButton;
