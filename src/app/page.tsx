"use client";
import React, { useState, useRef, useMemo, JSX } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { motion } from "framer-motion";

import { useSmoothCount } from "use-smooth-count";
import useSWR from "swr";

import { getUserCount, isUserMonitored } from "@/utils/actions";
import { isSnowflake } from "@/utils/snowflake";
import Link from "next/link";

export default function Home() {
    const [userId, setUserId] = useState<null | string>(null);
    const [userError, setUserError] = useState<string | JSX.Element>();
    const [userData, setUserData] = useState<{ userId: string } | null>(null);
    const originUrl = useMemo(() => window.location.origin, []);
    const [copyState, setCopyState] = useState("Copy");
    const [outputType, setOutputType] = useState<"markdown" | "html" | "url">(
        "markdown",
    );
    const [isLoading, setIsLoading] = useState(true);
    const [onImageLoaded, setOnImageLoaded] = useState(false);

    const userCount = useSWR("getUserCount", getUserCount);
    const countRef = useRef<HTMLDivElement | null>(null);
    useSmoothCount({
        ref: countRef,
        target: userCount.data || 0,
        duration: 3,
        curve: [0, 1, 0, 1],
    });

    const outputText = () => {
        if (outputType === "html") {
            return `<a href="https://discord.com/users/${userData?.userId}"><img src="${originUrl || "https://lanyard.cnrad.dev"}/api/${userData?.userId}" /></a>`;
        } else if (outputType === "url") {
            return `${originUrl || "https://lanyard.cnrad.dev"}/api/${userData?.userId}`;
        } else {
            return `[![Discord Presence](${originUrl || "https://lanyard.cnrad.dev"}/api/${userData?.userId})](https://discord.com/users/${userData?.userId})`;
        }
    };
    const copy = () => {
        navigator.clipboard.writeText(outputText());
        setCopyState("Copied!");

        setTimeout(() => setCopyState("Copy"), 1500);
    };

    const submitDiscordId = async () => {
        setIsLoading(true);
        setOnImageLoaded(false);
        setUserData(null);
        setUserError(undefined);

        if (!userId) return setUserError("Please enter a Discord ID");

        if (!isSnowflake(userId)) return setUserError("Invalid Discord ID");

        if ((await isUserMonitored(userId)) === false)
            return setUserError(
                <>
                    User is not being monitored by Lanyard, please join{" "}
                    <Link
                        href="https://discord.gg/lanyard"
                        target="_blank"
                        className="underline"
                    >
                        this server
                    </Link>{" "}
                    and try again.
                </>,
            );

        setUserData({ userId });
        setIsLoading(false);
    };

    return (
        <>
            <main className="flex min-h-screen max-w-[100vw] flex-col items-center">
                <div className="mt-16 w-[80%] max-w-[28rem] rounded-md">
                    <p className="my-2 text-left text-3xl font-semibold text-[#cecece]">
                        lanyard profile readme 🏷️
                    </p>
                    <p className="text-base text-[#aaabaf]">
                        Utilize Lanyard to display your Discord Presence in your
                        GitHub Profile
                    </p>
                    <br />
                    <form
                        className="flex w-full gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();

                            submitDiscordId();
                        }}
                    >
                        <input
                            className="input"
                            onChange={(e) => setUserId(e.target.value)}
                            value={userId || ""}
                            placeholder="Enter your Discord ID"
                        />
                        <button className="action" type="submit">
                            {">>"}
                        </button>
                    </form>
                    <motion.p
                        variants={{
                            open: { opacity: 1 },
                            closed: { opacity: 0 },
                        }}
                        initial="closed"
                        animate={userError ? "open" : "closed"}
                        className="mt-1 text-sm text-red-500"
                    >
                        * {userError}
                    </motion.p>
                    <motion.div
                        variants={{
                            open: {
                                opacity: 1,
                            },
                            closed: {
                                opacity: 0,
                            },
                        }}
                        initial="closed"
                        animate={!isLoading ? "open" : "closed"}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-1 mt-4 flex gap-1">
                            <button
                                className={`action ${outputType === "markdown" ? "active" : ""}`}
                                onClick={() => setOutputType("markdown")}
                            >
                                Markdown
                            </button>
                            <button
                                className={`action ${outputType === "html" ? "active" : ""}`}
                                onClick={() => setOutputType("html")}
                            >
                                HTML
                            </button>
                            <button
                                className={`action ${outputType === "url" ? "active" : ""}`}
                                onClick={() => setOutputType("url")}
                            >
                                URL
                            </button>
                        </div>
                        <div className="output bg-black">{outputText()}</div>
                        <div className="mt-4 flex gap-2">
                            <button className="action" onClick={copy}>
                                {copyState}
                            </button>
                            <Dialog>
                                <DialogTrigger className="action">
                                    Option
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Are you absolutely sure?
                                        </DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete your account
                                            and remove your data from our
                                            servers.
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="mt-2">
                            <motion.img
                                className={`${onImageLoaded ? "" : "animate-pulse rounded-md bg-[#3d3d43]"}`}
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: onImageLoaded ? 1 : 0,
                                }}
                                transition={{ duration: 0.5 }}
                                src={`/api/${userData?.userId}`}
                                height={280}
                                width={500}
                                alt="Your Lanyard Banner"
                                onLoad={() => setOnImageLoaded(true)}
                            />
                        </div>
                    </motion.div>
                </div>
            </main>
            <footer className="stat">
                Lanyard Profile Readme has{" "}
                <div
                    style={{ fontWeight: "bold", width: "3.2rem" }}
                    ref={countRef}
                />{" "}
                total users!
            </footer>
        </>
    );
}
