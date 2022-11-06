export const useUploadFromURL = async () => {
  let uploadAssetURL;
  try {
    uploadAssetURL = await fetch("https://livepeer.studio/api/asset/import", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LIVPEER_STUDIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "$EXTERNAL_URL",
        name: "Example name",
      }),
    });
  } catch (e) {
    console.log("error", e);
  }
  console.log(uploadAssetURL);
  return uploadAssetURL;
};

export const useUploadCreateUploadURL = async (name: string) => {
  const response = await fetch(
    "https://livepeer.studio/api/asset/request-upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LIVPEER_STUDIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    }
  );
  return await response.json();
};

export const useUploadDirectUpload = async (url: string, file: any) => {
  const upload = await fetch(url, {
    method: "PUT",
    body: file,
  });
  console.log("======================");
  console.log(upload);
};

export const useUploadGetStatus = async (id: string) => {
  const response = await fetch(`https://livepeer.studio/api/asset/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.LIVPEER_STUDIO_API_KEY}`,
    },
  });

  return await response.json();
};
