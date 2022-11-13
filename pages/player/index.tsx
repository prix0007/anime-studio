import { useEffect, useState } from "react";
import { Player } from "@livepeer/react";
import styles from "../../styles/VideoPlayer.module.css";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../../components/Navbar";

export default function VideoPlayer() {
  const { query } = useRouter();

  useEffect(() => {
    return setPlaybackSource(query?.videoId as string || "");
  }, [query]);

  const [playbackSource, setPlaybackSource] = useState("");

  // Quick verifiation to check if url provided is a playback url
  const playbackurl = ".m3u8";

  return (
    <div>
      <Head>
        <title>Anime Studio Saviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>
      <div className={styles.main}>
        <h1 className="text-6xl m-5">Stream Your Video</h1>
        {playbackSource && playbackSource.includes(playbackurl) ? (
          <Player src={playbackSource} autoPlay={true} aspectRatio={"16to9"} />
        ) : (
          <Player
            playbackId={playbackSource}
            autoPlay={true}
            muted
            aspectRatio={"16to9"}
          />
        )}
      </div>
    </div>
  );
}
