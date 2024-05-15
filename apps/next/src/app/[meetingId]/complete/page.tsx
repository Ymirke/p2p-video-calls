import { Logo } from "@/components";
import { ActionIcon, Center, Container, Flex, Title } from "@mantine/core";
import {
  IconMoodAngry,
  IconMoodConfuzed,
  IconMoodEmpty,
  IconMoodHappy,
  IconMoodSmile,
} from "@tabler/icons-react";
import React from "react";

export default function MeetingCompletePage() {
  return (
    <>
      <Container>
        <Center mt={30}>
          <Logo />
        </Center>
        <Center mt={30}>
          <Title>How was your meeting?</Title>
        </Center>
        <Center mt={30}>
          <Flex gap={10}>
            <ActionIcon size={75} variant="default">
              <IconMoodAngry color="red" size={50} />
            </ActionIcon>
            <ActionIcon size={75} variant="default">
              <IconMoodConfuzed color="orange" size={50} />
            </ActionIcon>
            <ActionIcon size={75} variant="default">
              <IconMoodEmpty color="gray" size={50} />
            </ActionIcon>
            <ActionIcon size={75} variant="default">
              <IconMoodSmile color="lightgreen" size={50} />
            </ActionIcon>
            <ActionIcon size={75} variant="default">
              <IconMoodHappy color="green" size={50} />
            </ActionIcon>
          </Flex>
        </Center>
      </Container>
    </>
  );
}
