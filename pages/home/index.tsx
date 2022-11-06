import React, { useState } from "react";
import {
  useUploadCreateUploadURL,
  useUploadDirectUpload,
} from "../../hooks/useLivePeer";

import * as tusClient from "tus-js-client";


const Home = ({ uploadURL, asset, tus }) => {
  const [file, setFile] = useState<any>("");

  const handleSubmitUpload = async () => {
    console.log(file);
    console.log(uploadURL);
    console.log(tus);
    const upload = new tusClient.Upload(file, {
      endpoint: tus, // URL from `tusEndpoint` field in the `/request-upload` response
      metadata: {
        fileName: "Some Name",
        filetype: "video/mp4",
      },
      uploadSize: file.size,
      onError(err) {
        console.error("Error uploading file:", err);
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log("Uploaded " + percentage + "%");
      },
      onSuccess() {
        console.log("Upload finished:", upload.url);
      },
    });
    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length > 0) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
  };

  const handleInputChange = (e: any) => {
    console.log(e.target.files);
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const checkStatus = () => {
    console.log(asset);
  };

  return (
    <>
      <h1>Home</h1>
      <input
        placeholder="select a video file"
        type="file"
        accept=".mp4"
        onChange={handleInputChange}
      />
      <button onClick={handleSubmitUpload}>Submit</button>
      <button onClick={checkStatus}>Check Status</button>
    </>
  );
};

export default Home;

export async function getServerSideProps() {
  console.log(process.env.LIVPEER_STUDIO_API_KEY);
  // Create the Upload URL in server and pass it down to the browser
  const { url, asset, tusEndpoint } = await useUploadCreateUploadURL(
    "Sample Stream"
  );
  console.log(url, asset, tusEndpoint);
  return {
    props: { uploadURL: url, asset: asset, tus: tusEndpoint },
  };
}
