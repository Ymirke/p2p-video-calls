"use client";
import { ActionIcon, Box, Flex, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import {
  IconLink,
  IconMicrophone,
  IconScreenShare,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import { Logo } from "./Logo";

type Props = {
  onComplete: () => void | (() => Promise<void>);
};

export function MeetingNavbar({ onComplete }: Props) {
  const clipboard = useClipboard({ timeout: 600 });

  return (
    <nav
      style={{
        width: "100vw",
        backgroundColor: "#121519",
        borderTopRightRadius: "28px",
        borderTopLeftRadius: "28px",
        height: "100px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Flex style={{ width: "200px" }} justify={"center"} align="center">
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 24,
          }}
        >
          <Logo />
        </Box>
      </Flex>
      <Flex
        gap={12}
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tooltip
          withArrow
          color={clipboard.copied ? "green" : ""}
          label={`Copy meeting link: ${window.location.host}${window.location.pathname}`}
        >
          <ActionIcon
            color={clipboard.copied ? "green" : "blue"}
            onClick={() => {
              clipboard.copy(
                `${window.location.host}${window.location.pathname}`
              );
              toast.success("Link copied");
            }}
            radius="lg"
            size={64}
          >
            <IconLink size={30} />
          </ActionIcon>
        </Tooltip>
        <Tooltip withArrow label="Mute/unmute">
          <ActionIcon
            onClick={() => {
              toast.error("Not implemented!");
            }}
            radius="lg"
            size={64}
          >
            <IconMicrophone size={30} />
          </ActionIcon>
        </Tooltip>
        <Tooltip withArrow label="Camera on/off">
          <ActionIcon
            onClick={() => {
              toast.error("Not implemented!");
            }}
            radius="lg"
            size={64}
          >
            <IconVideo size={30} />
          </ActionIcon>
        </Tooltip>
        <Tooltip
          onClick={() => {
            toast.error("Not implemented!");
          }}
          withArrow
          label="Share screen"
        >
          <ActionIcon radius="lg" size={64}>
            <IconScreenShare size={30} />
          </ActionIcon>
        </Tooltip>
      </Flex>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "200px",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ paddingRight: "10px" }}>
          <Tooltip color="red" label="Leave meeting" withArrow>
            <ActionIcon
              onClick={onComplete}
              color="red"
              variant="outline"
              radius="lg"
              size={64}
            >
              <IconX size={32} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
    </nav>
  );
}
