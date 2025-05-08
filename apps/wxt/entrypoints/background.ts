let storedUserData: any = null;

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SEND_USER_DATA") {
      storedUserData = message.payload;
      console.log("User data stored in background:", storedUserData);
      fetch(`https://lyra-extension-nextjs.vercel.app/api/trpc/linkedin.upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: {
            username: storedUserData.username,
            name: storedUserData.name,
            headline: storedUserData.headline,
            location: storedUserData.location,
            profileUrl: storedUserData.profileUrl,
            experiences: storedUserData.experiences,
            education: storedUserData.education,
            lastUpdated: new Date().toISOString(),
          }
        }),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Server responded with ${response.status}: ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Successfully upserted profile:', data);
        })
        .catch(error => {
          console.error('Error upserting profile:', error);
        });
    } else if (message.type === "GET_USER_DATA") {
      console.log("Sending user data to popup");
      console.log("Stored user data:", storedUserData);

      sendResponse(storedUserData);
      return true;
    }
  });
});
