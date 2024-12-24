import {SpotifyRepository} from "@/repository/spotify-repository";

export default async function Home() {
  const spotifyRepository = new SpotifyRepository();

  // If we find a code, we're in a callback, do a token exchange
  if (spotifyRepository.code) {
    await spotifyRepository.getToken()

    // Remove code from URL so we can refresh correctly.
    const url = new URL(window.location.href);
    url.searchParams.delete("code");

    const updatedUrl = url.search ? url.href : url.href.replace('?', '');
    window.history.replaceState({}, document.title, updatedUrl);
  }

  // If we have a token, we're logged in, so fetch user data and render logged in template
  if (spotifyRepository.currentToken.access_token) {
    const userData = await spotifyRepository.getUserData();
    renderTemplate("main", "logged-in-template", userData);
    renderTemplate("oauth", "oauth-template", spotifyRepository.currentToken);
  }

  // Otherwise we're not logged in, so render the login template
  if (!spotifyRepository.currentToken.access_token) {
    renderTemplate("main", "login");
  }

  // Click handlers
  async function loginWithSpotifyClick(): Promise<void> {
    await spotifyRepository.redirectToSpotifyAuthorize();
  }

  async function logoutClick(): Promise<void> {
    localStorage.clear();
    window.location.href = spotifyRepository.redirectUrl;
  }

  async function refreshTokenClick(): Promise<void> {
    await spotifyRepository.refreshToken();
    renderTemplate("oauth", "oauth-template", spotifyRepository.currentToken);
  }

  return (

      <div>
        <div id="main"></div>
        <div id="oauth"></div>

        <template id="login">
          <h1>Welcome to the OAuth2 PKCE Example</h1>
          <button id="login-button" data-bind-onclick={await loginWithSpotifyClick()}> Log in with Spotify </button>
        </template>

        <template id="logged-in-template">
          <h1>Logged in as <span data-bind="display_name"></span></h1>
          <img width="150" data-bind-src="images[0].url" data-bind-alt="display_name" />
          <table>
            <tbody>
              <tr>
                <td>Display name</td>
                <td data-bind="display_name"></td>
              </tr>
              <tr>
                <td>Id</td>
                <td data-bind="id"></td>
              </tr>
              <tr>
                <td>Email</td>
                <td data-bind="email"></td>
              </tr>
              <tr>
                <td>Spotify URI</td>
                <td>
                  <a data-bind="external_urls.spotify" data-bind-href="external_urls.spotify"></a>
                </td>
              </tr>
              <tr>
                <td>Link </td>
                <td>
                  <a data-bind="href" data-bind-href="href"></a>
                </td>
              </tr>
              <tr>
                <td>Profile Image</td>
                <td>
                  <a data-bind-href="images[0].url" data-bind="images[0].url"></a>
                </td>
              </tr>
              <tr>
                <td>Country</td>
                <td data-bind="country"></td>
              </tr>
            </tbody>
          </table>

          <button id="refresh-token-button" data-bind-onclick={await refreshTokenClick()}>Refresh Token</button>
          <button id="logout-button" data-bind-onclick={await logoutClick()}>Log out</button>
        </template>

        <template id="oauth-template">
          <h2>oAuth info</h2>
          <table>
            <tbody>
              <tr>
                <td>Access token</td>
                <td data-bind="access_token"></td>
              </tr>
              <tr>
                <td>Refresh token</td>
                <td data-bind="refresh_token"></td>
              </tr>
              <tr>
                <td>Expiration at</td>
                <td data-bind="expires">${spotifyRepository.currentToken.expires}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
  );
}

// HTML Template Rendering with basic data binding - demoware only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function renderTemplate(targetId: string, templateId: string, data: unknown = null) {
  const template: HTMLElement | null = document.getElementById(templateId);
  if (!(template instanceof HTMLTemplateElement)) {
    return;
  }
  const clone: Node = template.content.cloneNode(true);

  if(!(clone instanceof HTMLTemplateElement)) {
    return;
  }

  const elements = clone.querySelectorAll("*");
  elements.forEach((ele: Element) => {
    const bindingAttrs = [...ele.attributes].filter(a => a.name.startsWith("data-bind"));

    bindingAttrs.forEach(attr => {
      const target = attr.name.replace(/data-bind-/, "").replace(/data-bind/, "");
      const targetType = target.startsWith("onclick") ? "HANDLER" : "PROPERTY";
      const targetProp = target === "" ? "innerHTML" : target;

      const prefix = targetType === "PROPERTY" ? "data." : "";
      const expression = prefix + attr.value.replace(/;\n\r\n/g, "");

      // Maybe use a framework with more validation here ;)
      try {
        // @ts-expect-error this assigns to readonly properties which will fail
        ele[targetProp as keyof typeof ele] = targetType === "PROPERTY" ? eval(expression) : () => { eval(expression) };
        ele.removeAttribute(attr.name);
      } catch (ex) {
        console.error(`Error binding ${expression} to ${targetProp}`, ex);
      }
    });
  });

  const target = document.getElementById(targetId);
  if(!(target instanceof HTMLElement)) {
    return;
  }
  target.innerHTML = "";
  target.appendChild(clone);
}
