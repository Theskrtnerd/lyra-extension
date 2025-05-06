let storedUserData: any = null;

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SEND_USER_DATA") {
      storedUserData = message.payload;
      console.log("User data stored in background:", storedUserData);
      fetch('http://127.0.0.1:3000/api/trpc/linkedin.upsert', {
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
        .then(response => response.json())
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
