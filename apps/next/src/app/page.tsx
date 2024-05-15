"use client";
import React from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Logo } from "@/components";
import { IconArrowRight, IconBolt, IconKeyboard } from "@tabler/icons-react";
import Link from "next/link";

export default function MeetingPage() {
  const form = useForm({
    initialValues: {
      id: "",
    },
  });

  return (
    <Container size="xs">
      <Flex
        style={{ height: "70vh" }}
        py={30}
        direction="column"
        justify={"center"}
      >
        <Box>
          <Center>
            <Link href={"https://lunda.ai/"}>
              <Logo />
            </Link>
          </Center>
          <Center mt={5} mb={100}>
            <Text size="xl">Effective meetings</Text>
          </Center>

          <form
            onSubmit={form.onSubmit((values) => {
              window.location.href = window.location.href + values.id;
            })}
          >
            <Flex gap={10} justify="space-between">
              <TextInput
                size="lg"
                leftSection={<IconKeyboard />}
                placeholder="Join with meeting code"
                style={{ width: "100%" }}
                {...form.getInputProps("id")}
              />
              <Button size="lg" type="submit">
                <IconArrowRight size={32} />
              </Button>
            </Flex>
          </form>
          <Divider label={<Text c="black">or</Text>} my={30} />
          <Button
            size="lg"
            rightSection={<IconBolt size={18} />}
            mt={10}
            onClick={() => {
              window.location.href = "https://wwww.lunda.ai";
            }}
            fullWidth
          >
            Download app
          </Button>
        </Box>
      </Flex>
    </Container>
  );
}
