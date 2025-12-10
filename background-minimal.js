console.log('MINIMAL: Script starting');

try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('MINIMAL: Message received:', request);

    if (request.action === 'ping') {
      sendResponse({ pong: true });
    }

    return false;
  });

  console.log('MINIMAL: Listener registered');
} catch (error) {
  console.error('MINIMAL: Error:', error);
}
