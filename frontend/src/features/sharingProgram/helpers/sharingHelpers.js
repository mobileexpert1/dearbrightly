const removeFbGeneratedString = a => a.substring(0, a.indexOf('?'));

export const extractedSharingCode = href => {
  const n = href.lastIndexOf('/');

  const code = href.substring(n + 1);

  return code.substring(0, code.indexOf('?')) ? removeFbGeneratedString(code) : code;
};

export const getQueryVariable = variable => {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
};

export const isSafariBrowser =
  /constructor/i.test(window.HTMLElement) ||
  (function(p) {
    return p.toString() === '[object SafariRemoteNotification]';
  })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

export const emailContent = (code, userFirstName) => {
  const mailBody = `Have you noticed my skin lately? It’s thanks to Dear Brightly. \n\n Dear Brightly is changing the way you access derm-grade skincare, and making it easier than ever. \n\n ${code}`;
  const formattedBody = encodeURIComponent(mailBody);
  const subject = `${userFirstName || 'Your friend'} wanted to share something special with you!`;

  const mail = `mailto:?subject=${subject}&body=${formattedBody}`;
  return mail;
};

export const facebookDialog = (fbLink, resetGeneratedCode) =>
  FB.ui(
    {
      display: 'popup',
      method: 'send',
      link: fbLink,
    },
    function() {
      resetGeneratedCode(communicationMethodsOptions.fbMessenger);
    },
  );
